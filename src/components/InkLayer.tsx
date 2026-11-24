"use client";
/**
 * Apple Pencil ink over a sheet (iPad only), built the way notes apps do it.
 *
 * - Input: coalesced Pencil samples (240 Hz on iPadOS 18.2+), pressure shaped per pen
 *   and mixed with speed (faster = thinner), see lib/inkGeom.
 * - While writing: the whole stroke outline (smoothed, variable width) is redrawn on a
 *   screen-sized canvas whose resolution follows pinch-zoom, plus the Pencil's predicted
 *   points so the ink stays on the tip. Only the stroke's area is cleared.
 * - On lift: the stroke becomes one vector SVG path (sharp at any zoom), first the fast
 *   outline, then, when the iPad is idle, the clean unioned outline (no pinholes).
 *
 * Layers: svgHL · svgInk in the sheet; the live canvases (liveHL · live) are fixed to the
 * screen, outside the camera's moving content. Highlights stay under the ink.
 * Fingers pan and zoom the sheet (Camera.tsx); Pencil touches and a resting palm do not.
 * Strokes are stored in units of 1/1000 of the sheet width.
 */
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { cleanPath, effectivePressure, kindOf, rawPath, type Pen } from "@/lib/inkGeom";
import { store } from "@/lib/storage";
import { Floating } from "./Camera";

export type { Pen } from "@/lib/inkGeom";
export type Tool = Pen | "hl" | "erase" | "lasso";

export interface InkStroke {
  c: string;
  hl?: boolean;
  /** pen kind; strokes saved before kinds existed are fountain */
  k?: Pen;
  s: number;
  /** flat list: x, y, pressure, ... */
  p: number[];
}

export interface InkHandle {
  undo(): void;
  redo(): void;
  clear(): void;
  /** Recolor the selected strokes; returns false when nothing is selected. */
  recolor(c: string, hl: boolean): boolean;
}

const U = 1000;
const ERASE_R = 9;
const HL_ALPHA = 0.42;
const PENCIL_ALPHA = 0.85;
const SEAM = 0.35; // thin same-color stroke that closes anti-aliasing seams
const MAX_CANVAS_AREA = 16_000_000; // iOS Safari refuses larger canvases
type Box = [number, number, number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const idle = (f: () => void) => {
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(f, { timeout: 400 }); else setTimeout(f, 40);
};

function bounds(list: InkStroke[]): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const st of list) {
    for (let i = 0; i < st.p.length; i += 3) {
      x0 = Math.min(x0, st.p[i] - st.s); x1 = Math.max(x1, st.p[i] + st.s);
      y0 = Math.min(y0, st.p[i + 1] - st.s); y1 = Math.max(y1, st.p[i + 1] + st.s);
    }
  }
  return [x0, y0, x1, y1];
}

function inPoly(x: number, y: number, poly: number[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const SVGNS = "http://www.w3.org/2000/svg";

export default function InkLayer({
  storageKey, tool, color, size, fingerDraws, onStrokes, onSelect, ref,
}: {
  storageKey: string;
  tool: Tool;
  color: string;
  size: number;
  fingerDraws: boolean;
  onStrokes?: (n: number) => void;
  onSelect?: (n: number) => void;
  ref?: Ref<InkHandle>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const svgHL = useRef<SVGSVGElement>(null);
  const svgInk = useRef<SVGSVGElement>(null);
  const liveHL = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);

  const strokes = useRef<InkStroke[]>([]);
  const clean = useRef(new WeakMap<InkStroke, string>()); // unioned outline, once computed
  const els = useRef(new WeakMap<InkStroke, SVGPathElement>());
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const last = useRef<{ x: number; y: number; t: number; v: number } | null>(null);
  const liveBox = useRef<Box | null>(null);
  const erasing = useRef<{ changed: boolean } | null>(null);
  const lasso = useRef<number[] | null>(null);
  const sel = useRef<Set<number> | null>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  // sheet origin and live-canvas origin (client px), px per unit, backing px per css px
  const view = useRef({ ox: 0, oy: 0, cx: 0, cy: 0, k: 1, d: 2 });
  const fingerRef = useRef(fingerDraws);
  fingerRef.current = fingerDraws;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debug = useRef<{ ev: number; samples: number; ms: number; max: number; predicted: boolean; coalesced: boolean; pmin: number; pmax: number } | null>(null);
  const debugEl = useRef<HTMLDivElement>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [px, setPx] = useState(1);
  const [vbH, setVbH] = useState(1400);
  const [dbgOn, setDbgOn] = useState(false);

  const ctxOf = (c: HTMLCanvasElement | null) => c?.getContext("2d", { desynchronized: true }) ?? null;

  /* ---------- saving (debounced) ---------- */
  const flush = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    store.set(storageKey, strokes.current);
  }, [storageKey]);
  const save = useCallback(() => {
    onStrokes?.(strokes.current.length);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 600);
  }, [flush, onStrokes]);

  /* ---------- vector layers ---------- */
  const pathEl = (st: InkStroke) => {
    let el = els.current.get(st);
    if (el) return el;
    el = document.createElementNS(SVGNS, "path");
    const d = clean.current.get(st);
    el.setAttribute("d", d ?? rawPath(st));
    el.setAttribute("fill-rule", d ? "evenodd" : "nonzero");
    el.setAttribute("fill", st.c);
    el.setAttribute("stroke", st.c);
    el.setAttribute("stroke-width", String(SEAM));
    el.setAttribute("stroke-linejoin", "round");
    if (kindOf(st) === "pencil") el.setAttribute("opacity", String(PENCIL_ALPHA));
    els.current.set(st, el);
    if (!d) idle(() => upgrade(st));
    return el;
  };
  /** Replace the fast outline with the clean (unioned) one when the iPad is idle. */
  const upgrade = (st: InkStroke) => {
    if (clean.current.has(st)) return;
    const d = cleanPath(st);
    clean.current.set(st, d);
    const el = els.current.get(st);
    if (el) { el.setAttribute("d", d); el.setAttribute("fill-rule", "evenodd"); }
  };
  const appendStroke = (st: InkStroke) => {
    (st.hl ? svgHL : svgInk).current?.firstElementChild?.appendChild(pathEl(st));
  };
  const redraw = useCallback((skip?: Set<number>) => {
    const gh = svgHL.current?.firstElementChild, gi = svgInk.current?.firstElementChild;
    if (!gh || !gi) return;
    const fh = document.createDocumentFragment(), fi = document.createDocumentFragment();
    strokes.current.forEach((st, i) => { if (!skip?.has(i)) (st.hl ? fh : fi).appendChild(pathEl(st)); });
    gh.replaceChildren(fh);
    gi.replaceChildren(fi);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- live (screen) layers ---------- */
  const fitLive = () => {
    const cw = document.documentElement.clientWidth, ch = document.documentElement.clientHeight;
    // the sheet's own camera (Camera.tsx) and, outside it, any browser zoom
    const el = box.current;
    const cam = el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    const zoom = Math.max(1, (window.visualViewport?.scale ?? 1) * cam);
    let d = Math.min(3, (window.devicePixelRatio || 1) * zoom);
    if (cw * ch * d * d > MAX_CANVAS_AREA) d = Math.sqrt(MAX_CANVAS_AREA / (cw * ch));
    const w = Math.round(cw * d), h = Math.round(ch * d);
    for (const c of [liveHL.current, live.current]) {
      if (!c) continue;
      if (c.width !== w || c.height !== h) {
        c.width = w; c.height = h;
        c.style.width = cw + "px";
        c.style.height = ch + "px";
      }
    }
    return d;
  };
  const toUnits = (ctx: CanvasRenderingContext2D, dx = 0, dy = 0) => {
    const { ox, oy, cx, cy, k, d } = view.current;
    ctx.setTransform(k * d, 0, 0, k * d, (ox - cx + dx * k) * d, (oy - cy + dy * k) * d);
  };
  const wipe = (c: HTMLCanvasElement | null) => {
    const ctx = ctxOf(c);
    if (!c || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
  };
  const beginGesture = () => {
    const d = fitLive();
    const r = box.current!.getBoundingClientRect();
    const c = live.current?.getBoundingClientRect();
    view.current = { ox: r.left, oy: r.top, cx: c?.left ?? 0, cy: c?.top ?? 0, k: r.width / U, d };
  };

  const liveCanvasFor = (st: InkStroke) => (st.hl ? liveHL.current : live.current);

  /** Redraw the stroke being written (same outline as the final one) plus predicted points. */
  const drawLive = (st: InkStroke, predicted: number[][]) => {
    const c = liveCanvasFor(st), ctx = ctxOf(c);
    if (!c || !ctx) return;
    const { ox, oy, cx, cy, k, d } = view.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (liveBox.current) {
      const [x0, y0, x1, y1] = liveBox.current;
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
    }
    const path = new Path2D(rawPath(st, predicted, false));
    toUnits(ctx);
    ctx.fillStyle = st.c;
    ctx.strokeStyle = st.c;
    ctx.lineWidth = SEAM;
    ctx.lineJoin = "round";
    ctx.fill(path);
    ctx.stroke(path);
    const all = predicted.length ? { ...st, p: [...st.p, ...predicted.flat()] } : st;
    const [bx0, by0, bx1, by1] = bounds([all]);
    const pad = st.s * 2 + 4;
    liveBox.current = [
      Math.max(0, Math.floor((ox - cx + (bx0 - pad) * k) * d)), Math.max(0, Math.floor((oy - cy + (by0 - pad) * k) * d)),
      Math.min(c.width, Math.ceil((ox - cx + (bx1 + pad) * k) * d)), Math.min(c.height, Math.ceil((oy - cy + (by1 + pad) * k) * d)),
    ];
  };

  const drawLasso = () => {
    const c = live.current, ctx = ctxOf(c), pts = lasso.current;
    if (!c || !ctx) return;
    wipe(c);
    c.style.opacity = "1";
    if (!pts || pts.length < 4) return;
    toUnits(ctx);
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5 / view.current.k;
    ctx.strokeStyle = "#2347d9";
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(35,71,217,0.06)";
    ctx.fill();
  };

  const drawDragged = () => {
    const c = live.current, ctx = ctxOf(c), dr = drag.current, s = sel.current;
    if (!c || !ctx || !dr || !s) return;
    wipe(c);
    c.style.opacity = "1";
    toUnits(ctx, dr.dx, dr.dy);
    const all = strokes.current;
    for (const hl of [true, false]) for (const i of s) {
      const st = all[i];
      if (!st || !!st.hl !== hl) continue;
      ctx.globalAlpha = st.hl ? HL_ALPHA : kindOf(st) === "pencil" ? PENCIL_ALPHA : 1;
      ctx.fillStyle = st.c;
      ctx.fill(new Path2D(clean.current.get(st) ?? rawPath(st)), clean.current.has(st) ? "evenodd" : "nonzero");
    }
    ctx.globalAlpha = 1;
  };

  const setSelection = useCallback((s: Set<number> | null) => {
    sel.current = s && s.size ? s : null;
    setSelBox(sel.current ? bounds([...sel.current].map((i) => strokes.current[i])) : null);
    onSelect?.(sel.current?.size ?? 0);
  }, [onSelect]);

  /* ---------- load + size ---------- */
  useEffect(() => {
    strokes.current = store.get<InkStroke[]>(storageKey, []);
    undoS.current = [];
    redoS.current = [];
    sel.current = null;
    setSelBox(null);
    onStrokes?.(strokes.current.length);
    redraw();
    const el = box.current;
    if (!el) return;
    // layout size, not the on-screen one: the sheet may be scaled (FitPage) or zoomed (Camera)
    const fit = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w) return;
      setPx(w / U);
      setVbH((h / w) * U);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const onHide = () => { if (saveTimer.current) flush(); };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      ro.disconnect();
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      if (saveTimer.current) flush();
    };
  }, [storageKey, redraw, onStrokes, flush]);

  useEffect(() => {
    if (tool !== "lasso" && sel.current) setSelection(null);
  }, [tool, setSelection]);

  // ?inkdebug=1 shows input and drawing stats on screen (to diagnose on a real iPad).
  useEffect(() => {
    if (!new URLSearchParams(location.search).has("inkdebug")) return;
    debug.current = { ev: 0, samples: 0, ms: 0, max: 0, predicted: false, coalesced: false, pmin: 1, pmax: 0 };
    setDbgOn(true);
    const t = setInterval(() => {
      const dg = debug.current, el = debugEl.current;
      if (!dg || !el) return;
      el.textContent = `eventos/s ${dg.ev * 2} · muestras/s ${dg.samples * 2} · dibujo ${(dg.ev ? dg.ms / dg.ev : 0).toFixed(2)} ms (máx ${dg.max.toFixed(1)}) · coalesced ${dg.coalesced ? "sí" : "no"} · predicción ${dg.predicted ? "sí" : "no"} · presión ${dg.pmin.toFixed(2)}–${dg.pmax.toFixed(2)} · zoom ${(window.visualViewport?.scale ?? 1).toFixed(2)} · resolución ${view.current.d.toFixed(1)}x`;
      dg.ev = 0; dg.samples = 0; dg.ms = 0; dg.max = 0;
    }, 500);
    return () => clearInterval(t);
  }, []);

  // Fingers scroll and zoom natively; the Pencil and a palm during a gesture must not.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      const stylus = Array.from(e.changedTouches).some((t) => (t as Touch & { touchType?: string }).touchType === "stylus");
      if (stylus || fingerRef.current || cur.current || erasing.current || lasso.current || drag.current) e.preventDefault();
    };
    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("touchmove", block);
    };
  }, []);

  /* ---------- editing ---------- */
  const snapshot = () => {
    undoS.current.push(strokes.current.slice());
    if (undoS.current.length > 80) undoS.current.shift();
    redoS.current = [];
  };

  const deleteSel = () => {
    const s = sel.current;
    if (!s) return;
    snapshot();
    strokes.current = strokes.current.filter((_, i) => !s.has(i));
    setSelection(null);
    redraw();
    save();
  };

  const duplicateSel = () => {
    const s = sel.current;
    if (!s) return;
    snapshot();
    const start = strokes.current.length;
    const copies = [...s].map((i) => {
      const st = strokes.current[i];
      return { ...st, p: st.p.map((v, j) => (j % 3 === 2 ? v : v + 18)) };
    });
    strokes.current = [...strokes.current, ...copies];
    setSelection(new Set(copies.map((_, j) => start + j)));
    redraw();
    save();
  };

  useImperativeHandle(ref, () => ({
    undo() {
      const prev = undoS.current.pop();
      if (!prev) return;
      redoS.current.push(strokes.current);
      strokes.current = prev;
      setSelection(null);
      redraw();
      save();
    },
    redo() {
      const next = redoS.current.pop();
      if (!next) return;
      undoS.current.push(strokes.current);
      strokes.current = next;
      setSelection(null);
      redraw();
      save();
    },
    clear() {
      if (!strokes.current.length) return;
      snapshot();
      strokes.current = [];
      setSelection(null);
      redraw();
      save();
    },
    recolor(c: string, hl: boolean) {
      const s = sel.current;
      if (!s) return false;
      const targets = new Set([...s].filter((i) => !!strokes.current[i].hl === hl));
      if (!targets.size) return true;
      snapshot();
      strokes.current = strokes.current.map((st, i) => (targets.has(i) ? { ...st, c } : st));
      redraw();
      save();
      return true;
    },
  }), [redraw, save, setSelection]);

  const pos = (e: { clientX: number; clientY: number }) => {
    const { ox, oy, k } = view.current;
    return [(e.clientX - ox) / k, (e.clientY - oy) / k] as const;
  };

  const eraseAt = (x: number, y: number) => {
    const keep = strokes.current.filter((st) => {
      for (let i = 0; i < st.p.length; i += 3) {
        const dx = st.p[i] - x, dy = st.p[i + 1] - y;
        if (dx * dx + dy * dy < (ERASE_R + st.s / 2) ** 2) return false;
      }
      return true;
    });
    if (keep.length !== strokes.current.length) {
      strokes.current = keep;
      erasing.current!.changed = true;
      redraw();
    }
  };

  const canWrite = (e: React.PointerEvent) =>
    e.pointerType === "pen" || e.pointerType === "mouse" || (fingerDraws && e.pointerType === "touch");

  const insideSel = (x: number, y: number) => {
    if (!selBox) return false;
    const [x0, y0, x1, y1] = selBox;
    return x >= x0 - 6 && x <= x1 + 6 && y >= y0 - 6 && y <= y1 + 6;
  };

  /** Pressure for one sample: device pressure shaped per pen, mixed with speed. */
  const samplePressure = (st: InkStroke, ev: PointerEvent, x: number, y: number) => {
    const raw = ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
    const l = last.current;
    let v = l?.v ?? 0.5;
    if (l) {
      const dt = Math.max(1, ev.timeStamp - l.t);
      v = l.v * 0.75 + (Math.hypot(x - l.x, y - l.y) / dt) * 0.25;
    }
    last.current = { x, y, t: ev.timeStamp, v };
    const dg = debug.current;
    if (dg && ev.pointerType === "pen") { dg.pmin = Math.min(dg.pmin, raw); dg.pmax = Math.max(dg.pmax, raw); }
    return effectivePressure(st.hl ? "hl" : st.k ?? "fountain", raw, v);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    beginGesture();
    const [x, y] = pos(e);
    const grab = !!sel.current && insideSel(x, y) && (canWrite(e) || e.pointerType === "touch");
    if (!grab && !canWrite(e)) return; // a finger: the browser scrolls natively
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try { box.current!.setPointerCapture(e.pointerId); } catch { /* pointer no longer active */ }

    if (grab) {
      drag.current = { x, y, dx: 0, dy: 0 };
      redraw(sel.current!);
      drawDragged();
      return;
    }
    if (sel.current) setSelection(null);
    if (tool === "lasso") { lasso.current = [x, y]; return; }
    if (tool === "erase") {
      snapshot();
      erasing.current = { changed: false };
      eraseAt(x, y);
      return;
    }
    const st: InkStroke = tool === "hl" ? { c: color, hl: true, s: size, p: [] } : { c: color, k: tool, s: size, p: [] };
    last.current = null;
    liveBox.current = null;
    st.p.push(r1(x), r1(y), r2(samplePressure(st, e.nativeEvent, x, y)));
    cur.current = st;
    const c = liveCanvasFor(st);
    if (c) c.style.opacity = st.hl ? String(HL_ALPHA) : kindOf(st) === "pencil" ? String(PENCIL_ALPHA) : "1";
    drawLive(st, []);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current && !lasso.current && !erasing.current && !cur.current) return;
    const ne = e.nativeEvent;
    const evs = typeof ne.getCoalescedEvents === "function" ? ne.getCoalescedEvents() : [];
    const list = evs.length ? evs : [ne];
    if (drag.current) {
      const [x, y] = pos(e);
      drag.current.dx = x - drag.current.x;
      drag.current.dy = y - drag.current.y;
      drawDragged();
      return;
    }
    if (lasso.current) {
      for (const ev of list) { const [x, y] = pos(ev); lasso.current.push(x, y); }
      drawLasso();
      return;
    }
    if (erasing.current) {
      for (const ev of list) { const [x, y] = pos(ev); eraseAt(x, y); }
      return;
    }
    const t0 = performance.now();
    const st = cur.current!;
    for (const ev of list) {
      const [x, y] = pos(ev);
      const n = st.p.length;
      if (n >= 3 && Math.hypot(x - st.p[n - 3], y - st.p[n - 2]) < 0.35) continue; // drop jitter
      st.p.push(r1(x), r1(y), r2(samplePressure(st, ev, x, y)));
    }
    const pe = typeof ne.getPredictedEvents === "function" ? ne.getPredictedEvents() : [];
    const lastP = st.p[st.p.length - 1];
    const predicted = st.hl ? [] : pe.slice(0, 3).map((ev) => { const [x, y] = pos(ev); return [x, y, lastP]; });
    drawLive(st, predicted);
    const dg = debug.current;
    if (dg) {
      const ms = performance.now() - t0;
      dg.ev++; dg.samples += list.length; dg.ms += ms; dg.max = Math.max(dg.max, ms);
      dg.coalesced = evs.length > 0 || dg.coalesced;
      dg.predicted = pe.length > 0 || dg.predicted;
    }
  };

  const onUp = () => {
    if (drag.current) {
      const { dx, dy } = drag.current;
      drag.current = null;
      wipe(live.current);
      if (Math.abs(dx) + Math.abs(dy) > 0.5 && sel.current) {
        snapshot();
        const s = sel.current;
        strokes.current = strokes.current.map((st, i) =>
          s.has(i) ? { ...st, p: st.p.map((v, j) => (j % 3 === 0 ? r1(v + dx) : j % 3 === 1 ? r1(v + dy) : v)) } : st);
        setSelection(new Set(s));
        save();
      }
      redraw();
      return;
    }
    if (lasso.current) {
      const poly = lasso.current;
      lasso.current = null;
      wipe(live.current);
      if (poly.length < 8) return;
      const picked = new Set<number>();
      strokes.current.forEach((st, i) => {
        let inside = 0, n = 0;
        for (let j = 0; j < st.p.length; j += 3) { n++; if (inPoly(st.p[j], st.p[j + 1], poly)) inside++; }
        if (n && inside / n >= 0.5) picked.add(i);
      });
      setSelection(picked);
      return;
    }
    if (erasing.current) {
      if (erasing.current.changed) save(); else undoS.current.pop();
      erasing.current = null;
      return;
    }
    const st = cur.current;
    if (!st) return;
    cur.current = null;
    snapshot();
    strokes.current = [...strokes.current, st];
    appendStroke(st); // one new vector path; nothing else is redrawn
    wipe(liveCanvasFor(st));
    liveBox.current = null;
    save();
  };

  const vb = `0 0 ${U} ${vbH.toFixed(1)}`;
  return (
    <div
      ref={box}
      className={"inklayer" + (fingerDraws ? " finger" : "")}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ cursor: tool === "erase" ? "cell" : tool === "lasso" ? "default" : "crosshair" }}
      aria-label="Zona de escritura con Apple Pencil"
    >
      <svg ref={svgHL} className="inksvg" viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true"><g opacity={HL_ALPHA} /></svg>
      <svg ref={svgInk} className="inksvg" viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true"><g /></svg>
      {/* screen-sized live layers stay outside the camera's moving content */}
      <Floating>
        <canvas ref={liveHL} className="vp inklive hl" />
        <canvas ref={live} className="vp inklive" />
        {dbgOn && <div ref={debugEl} className="inkdebug" />}
      </Floating>
      {selBox && (
        <div className="selbox" style={{ left: selBox[0] * px, top: selBox[1] * px, width: (selBox[2] - selBox[0]) * px, height: (selBox[3] - selBox[1]) * px }}>
          <div className="selbar" onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={deleteSel}>Borrar</button>
            <button type="button" onClick={duplicateSel}>Duplicar</button>
            <button type="button" onClick={() => setSelection(null)}>Listo</button>
          </div>
        </div>
      )}
    </div>
  );
}
