"use client";
/**
 * Zoom window, as in GoodNotes and Notability: a strip at the bottom of the screen shows a
 * piece of the sheet magnified (the frame on the sheet marks which piece), and you write in
 * it with normal-sized handwriting; it lands small on the sheet. Good for indices, units
 * and small working.
 * - The Pencil writes in the window (InkLayer handles the stroke, see `inkLayers`).
 * - A finger drags the window's content to move the frame; the frame can also be dragged
 *   on the sheet. ← → move along the line, ↵ goes to the start of the next line.
 * - When writing reaches the right part of the window, the frame moves on by itself.
 * The window shows a copy of the sheet (its text and boxes) plus the live ink, through <use>.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inkLayers, INK_LAYERS, type InkLayerApi } from "./InkLayer";

const U = 1000;
const MIN_W = 160, MAX_W = 520;
interface Region { key: string; x: number; y: number; w: number; lineX: number }

/** The layer under the middle of the screen (or the first one), and a frame there. */
function initialRegion(w: number): Region | null {
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4;
  let best: InkLayerApi | null = null;
  for (const l of inkLayers.values()) {
    const r = l.box.getBoundingClientRect();
    if (!best) best = l;
    if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) { best = l; break; }
  }
  if (!best) return null;
  const r = best.box.getBoundingClientRect(), k = r.width / U;
  // start at the first answer box (or work space) on screen, at its first line
  const boxes = Array.from(best.box.parentElement?.querySelectorAll<HTMLElement>(".abox, .workspace, .blk") ?? []);
  const target = boxes.find((b) => b.getBoundingClientRect().top >= 0) ?? boxes[0];
  if (target) {
    const b = target.getBoundingClientRect();
    const x = (b.left - r.left) / k + 12;
    return { key: best.key, x, y: Math.max(0, (b.top - r.top) / k + 4), w, lineX: x };
  }
  const y = Math.min(best.height() - 60, Math.max(0, (cy - r.top) / k - 40));
  return { key: best.key, x: 90, y, w, lineX: 90 };
}

export default function ZoomWindow({ onClose }: { onClose: () => void }) {
  // opened by a tap, so the sheets' layers are already registered
  const [reg, setReg] = useState<Region | null>(() => initialRegion(300));
  const [, setLayersTick] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const clone = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const writing = useRef(false);
  const pan = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);

  useEffect(() => {
    const on = () => setLayersTick((n) => n + 1);
    window.addEventListener(INK_LAYERS, on);
    setReg((r) => r ?? initialRegion(300));
    return () => window.removeEventListener(INK_LAYERS, on);
  }, []);

  const layer = reg ? inkLayers.get(reg.key) : undefined;
  const hUnits = reg && size.w ? (reg.w * size.h) / size.w : 0;

  // keep the frame on the sheet
  const fit = useCallback((r: Region, l = layer): Region => {
    if (!l) return r;
    const w = Math.min(MAX_W, Math.max(MIN_W, r.w));
    const h = size.w ? (w * size.h) / size.w : 0;
    return { ...r, w, x: Math.min(U - w, Math.max(0, r.x)), y: Math.min(Math.max(0, l.height() - h), Math.max(0, r.y)) };
  }, [layer, size]);

  useLayoutEffect(() => {
    const a = area.current;
    if (!a) return;
    const measure = () => setSize({ w: a.clientWidth, h: a.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(a);
    return () => ro.disconnect();
  }, [!!reg]); // eslint-disable-line react-hooks/exhaustive-deps

  // a copy of the sheet (text, boxes, lines) behind the ink, without the ink layer itself
  useEffect(() => {
    const host = clone.current, l = layer;
    if (!host || !l) return;
    const paper = l.box.parentElement;
    if (!paper) return;
    const copy = paper.cloneNode(true) as HTMLElement;
    copy.querySelectorAll(".inklayer, .ws-more, button").forEach((n) => n.remove());
    copy.style.width = `${paper.offsetWidth}px`;
    copy.style.margin = "0";
    copy.removeAttribute("id");
    host.replaceChildren(copy);
  }, [layer]);

  // the stroke ends on the sheet's layer (it captured the pointer): move on when the
  // writing gets near the right side of the window
  useEffect(() => {
    const up = (e: PointerEvent) => {
      if (!writing.current || e.pointerType === "touch") return;
      writing.current = false;
      requestAnimationFrame(() => {
        const st = layer?.last();
        if (!st) return;
        let mx = -Infinity;
        for (let i = 0; i < st.p.length; i += 3) mx = Math.max(mx, st.p[i]);
        setReg((r) => (r && mx > r.x + r.w * 0.72 && mx < r.x + r.w + 5 ? fit({ ...r, x: r.x + r.w * 0.45 }) : r));
      });
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  });

  const frameDrag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);

  if (!reg || !layer) {
    return createPortal(
      <div className="zoomwin empty"><span>Abre una hoja para usar la ventana de zoom.</span><button type="button" className="btn sm" onClick={onClose}>Cerrar</button></div>,
      document.body,
    );
  }

  const bw = layer.box.offsetWidth || 1; // layout px of the sheet
  const s = size.w / reg.w; // window px per sheet unit
  const pxPerUnit = bw / U;

  const move = (dx: number, dy: number) => setReg((r) => (r ? fit({ ...r, x: r.x + dx, y: r.y + dy }) : r));
  const newline = () => setReg((r) => (r ? fit({ ...r, x: r.lineX, y: r.y + hUnits * 0.6 }) : r));
  const zoom = (f: number) => setReg((r) => (r ? fit({ ...r, w: r.w * f }) : r));

  /* writing: the Pencil (or a mouse, or a finger in finger-drawing mode) */
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = area.current;
    if (!a) return;
    if (e.pointerType === "touch" && !document.querySelector(".inklayer.finger")) {
      // a finger moves the frame (dragging the paper under the window)
      e.preventDefault();
      try { a.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      pan.current = { x: e.clientX, y: e.clientY, rx: reg.x, ry: reg.y };
      return;
    }
    const r = a.getBoundingClientRect();
    writing.current = true;
    layer.start(e.nativeEvent, { ox: r.left - reg.x * s, oy: r.top - reg.y * s, k: s });
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p) return;
    setReg((r) => (r ? fit({ ...r, x: p.rx - (e.clientX - p.x) / s, y: p.ry - (e.clientY - p.y) / s, lineX: p.rx - (e.clientX - p.x) / s }) : r));
  };
  const onUp = () => { pan.current = null; };

  // the frame on the sheet, draggable
  const frame = createPortal(
    <div className="zoomframe" style={{ left: reg.x * pxPerUnit, top: reg.y * pxPerUnit, width: reg.w * pxPerUnit, height: hUnits * pxPerUnit }}>
      <span
        className="zf-handle"
        onPointerDown={(e) => {
          e.stopPropagation(); e.preventDefault();
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
          frameDrag.current = { x: e.clientX, y: e.clientY, rx: reg.x, ry: reg.y };
        }}
        onPointerMove={(e) => {
          const d = frameDrag.current;
          if (!d) return;
          const k = layer.box.getBoundingClientRect().width / U;
          const nx = d.rx + (e.clientX - d.x) / k;
          setReg((r) => (r ? fit({ ...r, x: nx, y: d.ry + (e.clientY - d.y) / k, lineX: nx }) : r));
        }}
        onPointerUp={() => { frameDrag.current = null; }}
        aria-label="Mover la zona de la ventana de zoom"
        role="button"
      >⤧</span>
    </div>,
    layer.box,
  );

  return (
    <>
      {frame}
      {createPortal(
        <div className="zoomwin" role="region" aria-label="Ventana de zoom">
          <div className="zw-bar">
            <button type="button" aria-label="Mover a la izquierda" onClick={() => move(-reg.w * 0.45, 0)}>←</button>
            <button type="button" aria-label="Mover a la derecha" onClick={() => move(reg.w * 0.45, 0)}>→</button>
            <button type="button" aria-label="Siguiente renglón" onClick={newline}>↵</button>
            <span className="zw-grow" />
            <button type="button" aria-label="Menos aumento" onClick={() => zoom(1.2)}>−</button>
            <span className="zw-z">{(s / (layer.box.getBoundingClientRect().width / U)).toFixed(1)}×</span>
            <button type="button" aria-label="Más aumento" onClick={() => zoom(1 / 1.2)}>+</button>
            <button type="button" className="zw-close" aria-label="Cerrar la ventana de zoom" onClick={onClose}>Cerrar</button>
          </div>
          <div ref={area} className="zw-area" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <div className="zw-paper" style={{ transform: `translate(${-reg.x * s}px, ${-reg.y * s}px) scale(${s / pxPerUnit})` }}>
              <div ref={clone} />
            </div>
            <svg className="zw-ink" viewBox={`${reg.x} ${reg.y} ${reg.w} ${hUnits || 1}`} preserveAspectRatio="xMinYMin meet" aria-hidden="true">
              <use href={`#${layer.gid}-hl`} />
              <use href={`#${layer.gid}-ink`} />
            </svg>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
