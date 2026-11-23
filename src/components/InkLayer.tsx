"use client";
/**
 * Apple Pencil ink over an exam sheet (iPad only).
 * - The Pencil (and a mouse/trackpad) writes; the finger scrolls the page,
 *   so a resting palm never leaves marks. "Dedo escribe" lets the finger write.
 * - Strokes are stored in units of 1/1000 of the sheet width, so they stay in
 *   place when the sheet is resized or the iPad is rotated.
 */
import { getStroke } from "perfect-freehand";
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { store } from "@/lib/storage";

export type Tool = "pen" | "hl" | "erase";

export interface InkStroke {
  c: string;
  hl?: boolean;
  s: number;
  /** flat list: x, y, pressure, x, y, pressure, ... */
  p: number[];
}

export interface InkHandle {
  undo(): void;
  redo(): void;
  clear(): void;
}

const U = 1000;
const HL_COLOR = "#facc15";
const ERASE_R = 9;

function toPath(st: InkStroke, k: number, last: boolean): Path2D {
  const pts: number[][] = [];
  for (let i = 0; i < st.p.length; i += 3) pts.push([st.p[i] * k, st.p[i + 1] * k, st.p[i + 2]]);
  const poly = getStroke(pts, {
    size: st.s * k,
    thinning: st.hl ? 0 : 0.55,
    smoothing: 0.5,
    streamline: 0.4,
    simulatePressure: false,
    last,
  });
  const path = new Path2D();
  if (!poly.length) return path;
  path.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) path.lineTo(poly[i][0], poly[i][1]);
  path.closePath();
  return path;
}

function paint(ctx: CanvasRenderingContext2D, st: InkStroke, k: number, last: boolean) {
  ctx.save();
  if (st.hl) {
    ctx.globalAlpha = 0.38;
    ctx.globalCompositeOperation = "multiply";
  }
  ctx.fillStyle = st.c;
  ctx.fill(toPath(st, k, last));
  ctx.restore();
}

export default function InkLayer({
  storageKey,
  tool,
  color,
  fingerDraws,
  onStrokes,
  ref,
}: {
  storageKey: string;
  tool: Tool;
  color: string;
  fingerDraws: boolean;
  onStrokes?: (n: number) => void;
  ref?: Ref<InkHandle>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const baseC = useRef<HTMLCanvasElement>(null);
  const liveC = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<InkStroke[]>([]);
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const erasing = useRef<{ changed: boolean } | null>(null);
  const pan = useRef<{ id: number; y: number } | null>(null);
  const scale = useRef(1);

  const save = useCallback(() => {
    store.set(storageKey, strokes.current);
    onStrokes?.(strokes.current.length);
  }, [storageKey, onStrokes]);

  const redraw = useCallback(() => {
    const c = baseC.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const st of strokes.current) paint(ctx, st, scale.current, true);
  }, []);

  const drawLive = useCallback(() => {
    const c = liveC.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    if (!cur.current) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, cur.current, scale.current, false);
  }, []);

  // Load saved ink and keep the canvases matched to the sheet size.
  useEffect(() => {
    strokes.current = store.get<InkStroke[]>(storageKey, []);
    undoS.current = [];
    redoS.current = [];
    onStrokes?.(strokes.current.length);
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      for (const c of [baseC.current, liveC.current]) {
        if (!c) continue;
        c.width = Math.max(1, Math.round(r.width * dpr));
        c.height = Math.max(1, Math.round(r.height * dpr));
      }
      scale.current = r.width / U;
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [storageKey, redraw, onStrokes]);

  const snapshot = () => {
    undoS.current.push(strokes.current.slice());
    if (undoS.current.length > 80) undoS.current.shift();
    redoS.current = [];
  };

  useImperativeHandle(ref, () => ({
    undo() {
      const prev = undoS.current.pop();
      if (!prev) return;
      redoS.current.push(strokes.current);
      strokes.current = prev;
      redraw();
      save();
    },
    redo() {
      const next = redoS.current.pop();
      if (!next) return;
      undoS.current.push(strokes.current);
      strokes.current = next;
      redraw();
      save();
    },
    clear() {
      if (!strokes.current.length) return;
      snapshot();
      strokes.current = [];
      redraw();
      save();
    },
  }), [redraw, save]);

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

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canWrite(e)) {
      if (e.pointerType === "touch" && !pan.current) pan.current = { id: e.pointerId, y: e.clientY };
      return;
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try {
      box.current!.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer is no longer active; keep drawing without capture */
    }
    const [x, y] = pos(e);
    if (tool === "erase") {
      snapshot();
      erasing.current = { changed: false };
      eraseAt(x, y);
      return;
    }
    const pr = e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
    cur.current = tool === "hl" ? { c: HL_COLOR, hl: true, s: 20, p: [x, y, 0.5] } : { c: color, s: 3.4, p: [x, y, pr] };
    drawLive();
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pan.current && pan.current.id === e.pointerId) {
      window.scrollBy(0, pan.current.y - e.clientY);
      pan.current.y = e.clientY;
      return;
    }
    const evs = typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [];
    const list = evs.length ? evs : [e.nativeEvent];
    if (erasing.current) {
      for (const ev of list) { const [x, y] = pos(ev); eraseAt(x, y); }
      return;
    }
    const st = cur.current;
    if (!st) return;
    for (const ev of list) {
      const [x, y] = pos(ev);
      const pr = ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
      st.p.push(x, y, st.hl ? 0.5 : pr);
    }
    drawLive();
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pan.current && pan.current.id === e.pointerId) { pan.current = null; return; }
    if (erasing.current) {
      if (erasing.current.changed) save(); else undoS.current.pop();
      erasing.current = null;
      return;
    }
    const st = cur.current;
    if (!st) return;
    cur.current = null;
    if (st.p.length === 3) st.p.push(st.p[0] + 0.3, st.p[1] + 0.3, st.p[2]); // a tap makes a dot
    snapshot();
    strokes.current = [...strokes.current, st];
    drawLive();
    redraw();
    save();
  };

  return (
    <div
      ref={box}
      className="inklayer"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ cursor: tool === "erase" ? "cell" : "crosshair" }}
      aria-label="Zona de escritura con Apple Pencil"
    >
      <canvas ref={baseC} />
      <canvas ref={liveC} />
    </div>
  );
}
