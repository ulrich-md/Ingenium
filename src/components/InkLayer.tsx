"use client";
/**
 * Apple Pencil ink over a sheet (iPad only).
 *
 * Committed ink is VECTOR (SVG paths), so it stays sharp at any zoom, like a notes app.
 * Layers, bottom to top:
 *   svgHL    committed highlights
 *   liveHL   highlight being drawn (screen-sized canvas)
 *   svgInk   committed pen strokes
 *   live     pen stroke being drawn, lasso, dragged selection (screen-sized canvas)
 *   pred     predicted tip of the stroke, replaced on every event
 * Highlights therefore always sit under the ink.
 *
 * While writing, only the newest segment is drawn on a canvas whose resolution follows
 * the pinch-zoom level. On lift the stroke becomes one SVG path; nothing else is redrawn.
 * Fingers scroll and zoom natively; only Pencil touches ("stylus") and touches during a
 * gesture (a resting palm) are kept from scrolling. Strokes are stored in units of
 * 1/1000 of the sheet width.
 */
import { getStroke } from "perfect-freehand";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { store } from "@/lib/storage";

export type Pen = "fountain" | "ball" | "pencil" | "marker";
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
const PENCIL_ALPHA = 0.82;
const MAX_CANVAS_AREA = 16_000_000; // iOS Safari refuses larger canvases
type Box = [number, number, number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const kindOf = (st: InkStroke): Pen | "hl" => (st.hl ? "hl" : st.k ?? "fountain");

/** How each pen responds to pressure: final outline options and live width. */
const PENS: Record<Pen | "hl", { thinning: number; smoothing: number; streamline: number; width: (s: number, pr: number) => number }> = {
  fountain: { thinning: 0.62, smoothing: 0.55, streamline: 0.3, width: (s, pr) => s * (0.38 + pr * 1.05) },
  ball: { thinning: 0.12, smoothing: 0.5, streamline: 0.32, width: (s, pr) => s * (0.88 + pr * 0.22) },
  pencil: { thinning: 0.35, smoothing: 0.5, streamline: 0.3, width: (s, pr) => s * (0.62 + pr * 0.62) },
  marker: { thinning: 0, smoothing: 0.55, streamline: 0.36, width: (s) => s },
  hl: { thinning: 0, smoothing: 0.5, streamline: 0.5, width: (s) => s },
};

/** Smooth SVG path through the outline (quadratic curves between midpoints). */
function svgPath(st: InkStroke): string {
  const kind = kindOf(st);
  const o = PENS[kind];
  const pts: number[][] = [];
  for (let i = 0; i < st.p.length; i += 3) pts.push([st.p[i], st.p[i + 1], st.p[i + 2]]);
  const poly = getStroke(pts, {
    size: st.s, thinning: o.thinning, smoothing: o.smoothing, streamline: o.streamline,
    simulatePressure: false, last: true,
    start: { cap: kind !== "hl" }, end: { cap: kind !== "hl" },
  });
  const n = poly.length;
  if (n < 4) {
    const [x, y] = [st.p[0], st.p[1]], r = st.s / 2;
    return `M${(x - r).toFixed(2)} ${y.toFixed(2)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  }
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(poly[0][0])} ${f(poly[0][1])}Q`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % n];
    d += `${f(x0)} ${f(y0)} ${f((x0 + x1) / 2)} ${f((y0 + y1) / 2)} `;
  }
  return d + "Z";
}

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
  const pred = useRef<HTMLCanvasElement>(null);

  const strokes = useRef<InkStroke[]>([]);
  const paths = useRef(new WeakMap<InkStroke, string>());
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const seg = useRef<{ mx: number; my: number; x: number; y: number; w: number } | null>(null);
  const erasing = useRef<{ changed: boolean } | null>(null);
  const lasso = useRef<number[] | null>(null);
  const sel = useRef<Set<number> | null>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  // sheet origin and live-canvas origin (client px), px per unit, backing px per css px
  const view = useRef({ ox: 0, oy: 0, cx: 0, cy: 0, k: 1, d: 2 });
  const predBox = useRef<Box | null>(null);
  const fingerRef = useRef(fingerDraws);
  fingerRef.current = fingerDraws;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debug = useRef<{ ev: number; samples: number; ms: number; max: number; predicted: boolean; coalesced: boolean } | null>(null);
  const debugEl = useRef<HTMLDivElement>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [px, setPx] = useState(1);
  const [vbH, setVbH] = useState(1400);
  const [dbgOn, setDbgOn] = useState(false);

  const ctxOf = (c: HTMLCanvasElement | null) => c?.getContext("2d", { desynchronized: true }) ?? null;
  const pathOf = (st: InkStroke) => {
    let d = paths.current.get(st);
    if (!d) { d = svgPath(st); paths.current.set(st, d); }
    return d;
  };

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
    const el = document.createElementNS(SVGNS, "path");
    el.setAttribute("d", pathOf(st));
    el.setAttribute("fill", st.c);
    if (kindOf(st) === "pencil") el.setAttribute("fill-opacity", String(PENCIL_ALPHA));
    return el;
  };
  const appendStroke = (st: InkStroke) => {
    const g = (st.hl ? svgHL : svgInk).current?.firstElementChild;
    g?.appendChild(pathEl(st));
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
    // css size = layout viewport; backing resolution follows the pinch-zoom level (sharp at 220%)
    const cw = document.documentElement.clientWidth, ch = document.documentElement.clientHeight;
    const zoom = Math.max(1, window.visualViewport?.scale ?? 1);
    let d = Math.min(3, (window.devicePixelRatio || 1) * zoom);
    if (cw * ch * d * d > MAX_CANVAS_AREA) d = Math.sqrt(MAX_CANVAS_AREA / (cw * ch));
    const w = Math.round(cw * d), h = Math.round(ch * d);
    for (const c of [liveHL.current, live.current, pred.current]) {
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
  const liveDot = (st: InkStroke) => {
    const c = liveCanvasFor(st), ctx = ctxOf(c);
    if (!c || !ctx) return;
    c.style.opacity = st.hl ? String(HL_ALPHA) : kindOf(st) === "pencil" ? String(PENCIL_ALPHA) : "1";
    toUnits(ctx);
    const w = PENS[kindOf(st)].width(st.s, st.p[2]);
    ctx.fillStyle = st.c;
    ctx.beginPath();
    ctx.arc(st.p[0], st.p[1], w / 2, 0, Math.PI * 2);
    ctx.fill();
    seg.current = { mx: st.p[0], my: st.p[1], x: st.p[0], y: st.p[1], w };
  };
  const liveSegment = (st: InkStroke, x: number, y: number, pr: number) => {
    const ctx = ctxOf(liveCanvasFor(st)), s = seg.current;
    if (!ctx || !s) return;
    toUnits(ctx);
    const mx = (s.x + x) / 2, my = (s.y + y) / 2;
    const w = s.w * 0.6 + PENS[kindOf(st)].width(st.s, pr) * 0.4; // pressure low-pass
    ctx.strokeStyle = st.c;
    ctx.lineCap = st.hl ? "butt" : "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(s.mx, s.my);
    ctx.quadraticCurveTo(s.x, s.y, mx, my);
    ctx.stroke();
    seg.current = { mx, my, x, y, w };
  };

  const drawPrediction = (st: InkStroke | null, evs: PointerEvent[]) => {
    const c = pred.current, ctx = ctxOf(c);
    if (!c || !ctx) return;
    if (predBox.current) {
      const [x0, y0, x1, y1] = predBox.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
      predBox.current = null;
    }
    const s = seg.current;
    if (!st || !s || !evs.length || st.hl) return;
    c.style.opacity = kindOf(st) === "pencil" ? String(PENCIL_ALPHA) : "1";
    toUnits(ctx);
    ctx.strokeStyle = st.c;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.mx, s.my);
    ctx.lineTo(s.x, s.y);
    let x0 = Math.min(s.mx, s.x), y0 = Math.min(s.my, s.y), x1 = Math.max(s.mx, s.x), y1 = Math.max(s.my, s.y);
    for (const ev of evs.slice(0, 3)) {
      const [x, y] = pos(ev);
      ctx.lineTo(x, y);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    ctx.stroke();
    const { ox, oy, cx, cy, k, d } = view.current, pad = s.w + 4;
    predBox.current = [
      Math.floor((ox - cx + (x0 - pad) * k) * d), Math.floor((oy - cy + (y0 - pad) * k) * d),
      Math.ceil((ox - cx + (x1 + pad) * k) * d), Math.ceil((oy - cy + (y1 + pad) * k) * d),
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
      ctx.fill(new Path2D(pathOf(st)));
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
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      setPx(r.width / U);
      setVbH((r.height / r.width) * U);
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
    debug.current = { ev: 0, samples: 0, ms: 0, max: 0, predicted: false, coalesced: false };
    setDbgOn(true);
    const t = setInterval(() => {
      const dg = debug.current, el = debugEl.current;
      if (!dg || !el) return;
      el.textContent = `eventos/s ${dg.ev * 2} · muestras/s ${dg.samples * 2} · dibujo ${(dg.ev ? dg.ms / dg.ev : 0).toFixed(2)} ms (máx ${dg.max.toFixed(1)}) · coalesced ${dg.coalesced ? "sí" : "no"} · predicción ${dg.predicted ? "sí" : "no"} · zoom ${(window.visualViewport?.scale ?? 1).toFixed(2)} · resolución ${view.current.d.toFixed(1)}x`;
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
    const hl = tool === "hl";
    const pr = e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
    cur.current = hl
      ? { c: color, hl: true, s: size, p: [r1(x), r1(y), 0.5] }
      : { c: color, k: tool, s: size, p: [r1(x), r1(y), r2(pr)] };
    liveDot(cur.current);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current && !lasso.current && !erasing.current && !cur.current) return;
    const evs = typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [];
    const list = evs.length ? evs : [e.nativeEvent];
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
      const pr = st.hl ? 0.5 : ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
      st.p.push(r1(x), r1(y), r2(pr));
      liveSegment(st, x, y, pr);
    }
    const ne = e.nativeEvent;
    const predicted = typeof ne.getPredictedEvents === "function" ? ne.getPredictedEvents() : [];
    drawPrediction(st, predicted);
    const dg = debug.current;
    if (dg) {
      const ms = performance.now() - t0;
      dg.ev++; dg.samples += list.length; dg.ms += ms; dg.max = Math.max(dg.max, ms);
      dg.coalesced = evs.length > 0 || dg.coalesced;
      dg.predicted = predicted.length > 0 || dg.predicted;
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
    drawPrediction(null, []);
    seg.current = null;
    if (st.p.length === 3) st.p.push(st.p[0] + 0.3, st.p[1] + 0.3, st.p[2]); // a tap makes a dot
    snapshot();
    strokes.current = [...strokes.current, st];
    appendStroke(st); // one new vector path; nothing else is redrawn
    wipe(liveCanvasFor(st));
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
      <canvas ref={liveHL} className="vp" />
      <svg ref={svgInk} className="inksvg" viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true"><g /></svg>
      <canvas ref={live} className="vp" />
      <canvas ref={pred} className="vp" />
      {dbgOn && <div ref={debugEl} className="inkdebug" />}
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
