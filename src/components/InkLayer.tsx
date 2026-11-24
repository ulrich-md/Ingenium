"use client";
/**
 * Apple Pencil ink over a sheet (iPad only).
 * - Pencil (and mouse/trackpad) writes; fingers scroll natively. Only Pencil touches
 *   ("stylus" in Safari's Touch.touchType) and touches during a stroke (a resting
 *   palm) are kept from scrolling. "Dedo escribe" lets the finger write.
 * - Highlighter always sits under the ink: three canvases, bottom to top:
 *   live highlighter · committed ink (highlights first, then pen) · live pen/lasso.
 * - Lasso: circle strokes to select them, then drag to move, or delete, duplicate,
 *   recolor from the toolbar.
 * - Strokes are stored in units of 1/1000 of the sheet width.
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
type Box = [number, number, number, number];

function toPath(st: InkStroke, k: number, last: boolean): Path2D {
  const pts: number[][] = [];
  for (let i = 0; i < st.p.length; i += 3) pts.push([st.p[i] * k, st.p[i + 1] * k, st.p[i + 2]]);
  const poly = getStroke(pts, {
    size: st.s * k,
    thinning: st.hl ? 0 : 0.55,
    smoothing: 0.5,
    streamline: st.hl ? 0.6 : 0.4,
    simulatePressure: false,
    last,
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

function paint(ctx: CanvasRenderingContext2D, st: InkStroke, k: number, last: boolean, dx = 0, dy = 0) {
  ctx.save();
  if (dx || dy) ctx.translate(dx * k, dy * k);
  if (st.hl) ctx.globalAlpha = 0.42;
  ctx.fillStyle = st.c;
  ctx.fill(toPath(st, k, last));
  ctx.restore();
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
  const hlC = useRef<HTMLCanvasElement>(null);
  const baseC = useRef<HTMLCanvasElement>(null);
  const liveC = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<InkStroke[]>([]);
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const erasing = useRef<{ changed: boolean } | null>(null);
  const lasso = useRef<number[] | null>(null);
  const sel = useRef<Set<number> | null>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const fingerRef = useRef(fingerDraws);
  fingerRef.current = fingerDraws;
  const scale = useRef(1);
  const dprRef = useRef(1);
  const liveBox = useRef<Box | null>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [px, setPx] = useState(1); // css px per unit, to place the selection overlay

  const ctxOf = (c: HTMLCanvasElement | null) => c?.getContext("2d") ?? null;

  const save = useCallback(() => {
    store.set(storageKey, strokes.current);
    onStrokes?.(strokes.current.length);
  }, [storageKey, onStrokes]);

  const redraw = useCallback((skip?: Set<number>) => {
    const c = baseC.current, ctx = ctxOf(c);
    if (!c || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    const all = strokes.current;
    // highlights first, so the ink always stays on top of them
    for (let i = 0; i < all.length; i++) if (all[i].hl && !skip?.has(i)) paint(ctx, all[i], scale.current, true);
    for (let i = 0; i < all.length; i++) if (!all[i].hl && !skip?.has(i)) paint(ctx, all[i], scale.current, true);
  }, []);

  const clearCanvas = (c: HTMLCanvasElement | null) => {
    const ctx = ctxOf(c);
    if (!c || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
  };

  // Live stroke: only the area it covers is cleared and repainted.
  const drawLive = useCallback((st: InkStroke | null, c: HTMLCanvasElement | null) => {
    const ctx = ctxOf(c);
    if (!c || !ctx) return;
    const k = scale.current * dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (liveBox.current) {
      const [x0, y0, x1, y1] = liveBox.current;
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
      liveBox.current = null;
    }
    if (!st) return;
    const [bx0, by0, bx1, by1] = bounds([st]);
    const pad = 4;
    liveBox.current = [
      Math.max(0, Math.floor((bx0 - pad) * k)), Math.max(0, Math.floor((by0 - pad) * k)),
      Math.min(c.width, Math.ceil((bx1 + pad) * k)), Math.min(c.height, Math.ceil((by1 + pad) * k)),
    ];
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    paint(ctx, st, scale.current, false);
  }, []);

  const drawLasso = () => {
    const c = liveC.current, ctx = ctxOf(c), pts = lasso.current;
    if (!c || !ctx) return;
    clearCanvas(c);
    if (!pts || pts.length < 4) return;
    const k = scale.current;
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    ctx.beginPath();
    ctx.moveTo(pts[0] * k, pts[1] * k);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] * k, pts[i + 1] * k);
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#2347d9";
    ctx.stroke();
    ctx.fillStyle = "rgba(35,71,217,0.06)";
    ctx.fill();
  };

  const drawDragged = () => {
    const c = liveC.current, ctx = ctxOf(c), d = drag.current, s = sel.current;
    if (!c || !ctx || !d || !s) return;
    clearCanvas(c);
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    const all = strokes.current;
    for (const i of s) if (all[i]?.hl) paint(ctx, all[i], scale.current, true, d.dx, d.dy);
    for (const i of s) if (all[i] && !all[i].hl) paint(ctx, all[i], scale.current, true, d.dx, d.dy);
  };

  const setSelection = useCallback((s: Set<number> | null) => {
    sel.current = s && s.size ? s : null;
    setSelBox(sel.current ? bounds([...sel.current].map((i) => strokes.current[i])) : null);
    onSelect?.(sel.current?.size ?? 0);
  }, [onSelect]);

  // Load saved ink; keep canvases matched to the sheet size.
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
      if (baseC.current && baseC.current.width === w && baseC.current.height === h) return;
      for (const c of [hlC.current, baseC.current, liveC.current]) {
        if (!c) continue;
        c.width = w;
        c.height = h;
      }
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [storageKey, redraw, onStrokes]);

  // Changing tool (other than to the lasso) drops the selection.
  useEffect(() => {
    if (tool !== "lasso" && sel.current) setSelection(null);
  }, [tool, setSelection]);

  // Fingers scroll natively; the Pencil and a palm during a stroke must not.
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
      const targets = [...s].filter((i) => !!strokes.current[i].hl === hl);
      if (!targets.length) return true;
      snapshot();
      strokes.current = strokes.current.map((st, i) => (targets.includes(i) ? { ...st, c } : st));
      redraw();
      save();
      return true;
    },
  }), [redraw, save, setSelection]);

  const pos = (e: { clientX: number; clientY: number }) => {
    const r = box.current!.getBoundingClientRect();
    const k = U / r.width;
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k] as const;
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
    const [x, y] = pos(e);
    // a selection can be dragged with the Pencil or a finger
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
    if (tool === "lasso") {
      lasso.current = [x, y];
      return;
    }
    if (tool === "erase") {
      snapshot();
      erasing.current = { changed: false };
      eraseAt(x, y);
      return;
    }
    const hl = tool === "hl";
    const pr = e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
    cur.current = { c: color, hl, s: size, p: [x, y, hl ? 0.5 : pr] };
    drawLive(cur.current, hl ? hlC.current : liveC.current);
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
      const pr = ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
      st.p.push(x, y, st.hl ? 0.5 : pr);
    }
    drawLive(st, st.hl ? hlC.current : liveC.current);
  };

  const onUp = () => {
    if (drag.current) {
      const { dx, dy } = drag.current;
      drag.current = null;
      clearCanvas(liveC.current);
      if (Math.abs(dx) + Math.abs(dy) > 0.5 && sel.current) {
        snapshot();
        const s = sel.current;
        strokes.current = strokes.current.map((st, i) =>
          s.has(i) ? { ...st, p: st.p.map((v, j) => (j % 3 === 0 ? v + dx : j % 3 === 1 ? v + dy : v)) } : st);
        setSelection(new Set(s));
        save();
      }
      redraw();
      return;
    }
    if (lasso.current) {
      const poly = lasso.current;
      lasso.current = null;
      clearCanvas(liveC.current);
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
    drawLive(null, st.hl ? hlC.current : liveC.current); // clears the live area
    if (st.p.length === 3) st.p.push(st.p[0] + 0.3, st.p[1] + 0.3, st.p[2]); // a tap makes a dot
    snapshot();
    strokes.current = [...strokes.current, st];
    redraw();
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
      <canvas ref={hlC} />
      <canvas ref={baseC} />
      <canvas ref={liveC} />
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
