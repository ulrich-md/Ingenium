"use client";
/**
 * Apple Pencil ink over a sheet (iPad only), tuned for low latency.
 *
 * Layers, bottom to top:
 *   baseHL   committed highlights (sheet-sized)
 *   liveHL   the highlight being drawn (viewport-sized, fixed, CSS opacity)
 *   baseInk  committed pen strokes (sheet-sized)
 *   live     the pen stroke being drawn, the lasso, a dragged selection (viewport-sized, fixed)
 * So highlights always sit under the ink, and while writing only a small,
 * screen-sized canvas changes.
 *
 * While the Pencil moves, only the newest segment is drawn (O(1) per sample, no
 * smoothing lag). When it lifts, the stroke is rendered once with perfect-freehand
 * onto its base layer; nothing else is repainted. Saving is debounced.
 *
 * Fingers scroll natively; only Pencil touches ("stylus" touchType) and touches
 * during a gesture (a resting palm) are kept from scrolling.
 * Strokes are stored in units of 1/1000 of the sheet width.
 */
import { getStroke } from "perfect-freehand";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { store } from "@/lib/storage";

export type Tool = "pen" | "hl" | "erase" | "lasso";

export interface InkStroke {
  c: string;
  hl?: boolean;
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
type Box = [number, number, number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Final outline of a stroke, in stroke units. */
function outline(st: InkStroke): Path2D {
  const pts: number[][] = [];
  for (let i = 0; i < st.p.length; i += 3) pts.push([st.p[i], st.p[i + 1], st.p[i + 2]]);
  const poly = getStroke(pts, {
    size: st.s,
    thinning: st.hl ? 0 : 0.5,
    smoothing: 0.45,
    streamline: st.hl ? 0.5 : 0.22,
    simulatePressure: false,
    last: true,
    start: { cap: !st.hl },
    end: { cap: !st.hl },
  });
  const path = new Path2D();
  if (!poly.length) return path;
  path.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) path.lineTo(poly[i][0], poly[i][1]);
  path.closePath();
  return path;
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
  const baseHL = useRef<HTMLCanvasElement>(null);
  const liveHL = useRef<HTMLCanvasElement>(null);
  const baseInk = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);

  const strokes = useRef<InkStroke[]>([]);
  const paths = useRef(new WeakMap<InkStroke, Path2D>());
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const seg = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const erasing = useRef<{ changed: boolean } | null>(null);
  const lasso = useRef<number[] | null>(null);
  const sel = useRef<Set<number> | null>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const view = useRef({ ox: 0, oy: 0, k: 1 }); // sheet origin (client px) and px per unit, fixed during a gesture
  const fingerRef = useRef(fingerDraws);
  fingerRef.current = fingerDraws;
  const scale = useRef(1);
  const dprRef = useRef(1);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [px, setPx] = useState(1);

  const ctxOf = (c: HTMLCanvasElement | null) => c?.getContext("2d") ?? null;
  const pathOf = (st: InkStroke) => {
    let p = paths.current.get(st);
    if (!p) { p = outline(st); paths.current.set(st, p); }
    return p;
  };

  /* ---------- saving (debounced: stringifying every stroke on every lift is costly) ---------- */
  const flush = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    store.set(storageKey, strokes.current);
  }, [storageKey]);
  const save = useCallback(() => {
    onStrokes?.(strokes.current.length);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 600);
  }, [flush, onStrokes]);

  /* ---------- base layers ---------- */
  const paintOn = (c: HTMLCanvasElement | null, st: InkStroke, dx = 0, dy = 0) => {
    const ctx = ctxOf(c);
    if (!ctx) return;
    const k = scale.current * dprRef.current;
    ctx.setTransform(k, 0, 0, k, dx * k, dy * k);
    ctx.globalAlpha = st.hl ? HL_ALPHA : 1;
    ctx.fillStyle = st.c;
    ctx.fill(pathOf(st));
    ctx.globalAlpha = 1;
  };
  const wipe = (c: HTMLCanvasElement | null) => {
    const ctx = ctxOf(c);
    if (!c || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
  };
  const redraw = useCallback((skip?: Set<number>) => {
    wipe(baseHL.current);
    wipe(baseInk.current);
    strokes.current.forEach((st, i) => {
      if (!skip?.has(i)) paintOn(st.hl ? baseHL.current : baseInk.current, st);
    });
  }, []);

  /* ---------- live (viewport) layers ---------- */
  const fitViewport = () => {
    const dpr = dprRef.current;
    const w = Math.round(window.innerWidth * dpr), h = Math.round(window.innerHeight * dpr);
    for (const c of [liveHL.current, live.current]) {
      if (!c) continue;
      if (c.width !== w || c.height !== h) {
        c.width = w; c.height = h;
        c.style.width = window.innerWidth + "px";
        c.style.height = window.innerHeight + "px";
      }
    }
  };
  /** Transform a viewport canvas so it draws in stroke units. */
  const toUnits = (ctx: CanvasRenderingContext2D, dx = 0, dy = 0) => {
    const { ox, oy, k } = view.current, d = dprRef.current;
    ctx.setTransform(k * d, 0, 0, k * d, (ox + dx * k) * d, (oy + dy * k) * d);
  };
  const beginGesture = () => {
    const r = box.current!.getBoundingClientRect();
    view.current = { ox: r.left, oy: r.top, k: r.width / U };
    fitViewport();
  };

  // Newest segment only: quadratic curve between midpoints, width from pressure.
  const liveDot = (st: InkStroke) => {
    const ctx = ctxOf(st.hl ? liveHL.current : live.current);
    if (!ctx) return;
    toUnits(ctx);
    ctx.fillStyle = st.c;
    ctx.beginPath();
    const w = st.hl ? st.s : st.s * (0.5 + st.p[2]);
    ctx.arc(st.p[0], st.p[1], w / 2, 0, Math.PI * 2);
    ctx.fill();
    seg.current = { mx: st.p[0], my: st.p[1], x: st.p[0], y: st.p[1] };
  };
  const liveSegment = (st: InkStroke, x: number, y: number, pr: number) => {
    const ctx = ctxOf(st.hl ? liveHL.current : live.current), s = seg.current;
    if (!ctx || !s) return;
    toUnits(ctx);
    const mx = (s.x + x) / 2, my = (s.y + y) / 2;
    ctx.strokeStyle = st.c;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = st.hl ? st.s : st.s * (0.5 + pr);
    ctx.beginPath();
    ctx.moveTo(s.mx, s.my);
    ctx.quadraticCurveTo(s.x, s.y, mx, my);
    ctx.stroke();
    seg.current = { mx, my, x, y };
  };

  const drawLasso = () => {
    const c = live.current, ctx = ctxOf(c), pts = lasso.current;
    if (!c || !ctx) return;
    wipe(c);
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
    const c = live.current, ctx = ctxOf(c), d = drag.current, s = sel.current;
    if (!c || !ctx || !d || !s) return;
    wipe(c);
    toUnits(ctx, d.dx, d.dy);
    const all = strokes.current;
    for (const hl of [true, false]) for (const i of s) {
      const st = all[i];
      if (!st || !!st.hl !== hl) continue;
      ctx.globalAlpha = st.hl ? HL_ALPHA : 1;
      ctx.fillStyle = st.c;
      ctx.fill(pathOf(st));
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
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      scale.current = r.width / U;
      dprRef.current = dpr;
      setPx(r.width / U);
      if (baseInk.current && baseInk.current.width === w && baseInk.current.height === h) return;
      for (const c of [baseHL.current, baseInk.current]) {
        if (!c) continue;
        c.width = w;
        c.height = h;
      }
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // closing, reloading or leaving the app must not lose the last stroke
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

  // Fingers scroll natively; the Pencil and a palm during a gesture must not.
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
    cur.current = { c: color, hl, s: size, p: [r1(x), r1(y), hl ? 0.5 : r2(pr)] };
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
    const st = cur.current!;
    for (const ev of list) {
      const [x, y] = pos(ev);
      const pr = st.hl ? 0.5 : ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
      st.p.push(r1(x), r1(y), r2(pr));
      liveSegment(st, x, y, pr);
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
    seg.current = null;
    if (st.p.length === 3) st.p.push(st.p[0] + 0.3, st.p[1] + 0.3, st.p[2]); // a tap makes a dot
    snapshot();
    strokes.current = [...strokes.current, st];
    paintOn(st.hl ? baseHL.current : baseInk.current, st); // only the new stroke
    wipe(st.hl ? liveHL.current : live.current);
    save();
  };

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
      <canvas ref={baseHL} className="base" />
      <canvas ref={liveHL} className="vp" style={{ opacity: HL_ALPHA }} />
      <canvas ref={baseInk} className="base" />
      <canvas ref={live} className="vp" />
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
