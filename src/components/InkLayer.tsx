"use client";
/**
 * Apple Pencil ink over a sheet (iPad only), built the way notes apps do it.
 *
 * - Input: coalesced Pencil samples (240 Hz on iPadOS 18.2+), pressure shaped per pen
 *   (ink pens keep a constant width, the pencil follows pressure), see lib/inkGeom.
 * - Hold the Pencil still at the end of a roughly straight stroke and it becomes a straight
 *   line; keep moving to aim it (vectors, axes, force diagrams).
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
import { cleanPath, effectivePressure, eraseStrokes, kindOf, rawPath, type Pen } from "@/lib/inkGeom";
import { store } from "@/lib/storage";
import { Floating, INK_CANCEL } from "./Camera";

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
const HL_ALPHA = 0.42;
const PENCIL_ALPHA = 0.72; // graphite, lighter than ink
const SEAM = 0.35; // thin same-color stroke that closes anti-aliasing seams
const MAX_CANVAS_AREA = 16_000_000; // iOS Safari refuses larger canvases
type Box = [number, number, number, number];

const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const idle = (f: () => void) => {
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(f, { timeout: 400 }); else setTimeout(f, 40);
};

/* ---------- clean outlines in a Web Worker (one for the whole page) ---------- */
let worker: Worker | null | undefined;
let seq = 0;
const waiting = new Map<number, (d: string) => void>();
/** Ask the worker for a stroke's clean outline. False when workers are unavailable. */
function cleanInWorker(st: InkStroke, done: (d: string) => void): boolean {
  if (worker === undefined) {
    try {
      worker = new Worker(new URL("../lib/inkWorker.ts", import.meta.url));
      worker.onmessage = (e: MessageEvent<{ id: number; d: string }>) => {
        const f = waiting.get(e.data.id);
        waiting.delete(e.data.id);
        if (f && e.data.d) f(e.data.d);
      };
      worker.onerror = () => { worker = null; waiting.clear(); };
    } catch {
      worker = null;
    }
  }
  if (!worker) return false;
  const id = ++seq;
  waiting.set(id, done);
  worker.postMessage({ id, st: { hl: st.hl, k: st.k, s: st.s, p: st.p } });
  return true;
}

/** Live strokes: the settled part is baked once in chunks, each frame redraws only the tip. */
const CHUNK = 40, OVER = 6;

/** Hold to straighten: still for this long (moving less than HOLD_PX on screen). */
const HOLD_MS = 550, HOLD_PX = 4;
/** Is this stroke meant as a line? Long enough, close to its chord, no going back and forth. */
export function looksStraight(p: number[]): boolean {
  const n = p.length / 3;
  if (n < 4) return false;
  const x0 = p[0], y0 = p[1], x1 = p[p.length - 3], y1 = p[p.length - 2];
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 30) return false;
  let walked = 0, dev = 0;
  for (let i = 3; i < p.length; i += 3) {
    walked += Math.hypot(p[i] - p[i - 3], p[i + 1] - p[i - 2]);
    dev = Math.max(dev, Math.abs((x1 - x0) * (y0 - p[i + 1]) - (x0 - p[i]) * (y1 - y0)) / len);
  }
  return walked <= len * 1.25 && dev <= Math.max(4, len * 0.12);
}
/** Evenly spaced points of a straight line (perfect-freehand needs more than the two ends). */
function linePoints(x0: number, y0: number, x1: number, y1: number, pr: number): number[] {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(r1(x0 + ((x1 - x0) * i) / n), r1(y0 + ((y1 - y0) * i) / n), pr);
  return out;
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

/**
 * Ink layers on screen, for the zoom window (ZoomWindow.tsx): it shows a piece of a sheet
 * magnified and writes into it. `start` begins a stroke from a Pencil touch on the window,
 * with the window's own screen-to-sheet mapping; the rest of the gesture then comes to the
 * layer itself (pointer capture), so strokes, erasing and undo work as on the sheet.
 */
export interface InkLayerApi {
  key: string;
  box: HTMLDivElement;
  /** ids of the highlight and ink groups, for <use> */
  gid: string;
  /** sheet height in units */
  height: () => number;
  start: (ev: PointerEvent, view: { ox: number; oy: number; k: number }) => void;
  last: () => InkStroke | undefined;
}
export const inkLayers = new Map<string, InkLayerApi>();
export const INK_LAYERS = "kw-ink-layers";
const gidOf = (key: string) => "kwg-" + key.replace(/[^a-zA-Z0-9-]/g, "-");

export default function InkLayer({
  storageKey, tool, color, size, fingerDraws, eraseMode = "stroke", eraseR = 10, onStrokes, onSelect, ref,
}: {
  storageKey: string;
  tool: Tool;
  color: string;
  size: number;
  fingerDraws: boolean;
  /** eraser: whole strokes or only the part it touches; its radius in sheet units */
  eraseMode?: "stroke" | "part";
  eraseR?: number;
  onStrokes?: (n: number) => void;
  onSelect?: (n: number) => void;
  ref?: Ref<InkHandle>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const svgHL = useRef<SVGSVGElement>(null);
  const svgInk = useRef<SVGSVGElement>(null);
  const liveHL = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const liveHLBase = useRef<HTMLCanvasElement>(null);
  const liveBase = useRef<HTMLCanvasElement>(null);
  const hlGroup = useRef<HTMLDivElement>(null);
  const inkGroup = useRef<HTMLDivElement>(null);
  const baked = useRef(0); // points of the live stroke already baked into the base canvas
  const frame = useRef(0);
  const predictedRef = useRef<number[][]>([]);
  const upgrades = useRef<[InkStroke, string][]>([]);
  const upgradeFrame = useRef(0);

  const strokes = useRef<InkStroke[]>([]);
  const clean = useRef(new WeakMap<InkStroke, string>()); // unioned outline, once computed
  const els = useRef(new WeakMap<InkStroke, SVGPathElement>());
  const undoS = useRef<InkStroke[][]>([]);
  const redoS = useRef<InkStroke[][]>([]);
  const cur = useRef<InkStroke | null>(null);
  const last = useRef<{ x: number; y: number; t: number; v: number } | null>(null);
  // hold to straighten: where the Pencil last stopped, and the line once it snapped
  const hold = useRef<{ x: number; y: number; t: number } | null>(null);
  const line = useRef<{ x0: number; y0: number; pr: number } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveBox = useRef<Box | null>(null);
  const erasing = useRef<{ changed: boolean; x: number; y: number } | null>(null);
  const eraserEl = useRef<HTMLDivElement>(null);
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
    if (!d) upgrade(st);
    return el;
  };
  /** Replace the fast outline with the clean (unioned) one when the iPad is idle. */
  const applyUpgrades = () => {
    upgradeFrame.current = 0;
    if (cur.current) return; // never repaint the sheet while the Pencil is writing; onUp applies them
    for (const [st, d] of upgrades.current.splice(0)) {
      const el = els.current.get(st);
      if (el) { el.setAttribute("d", d); el.setAttribute("fill-rule", "evenodd"); }
    }
  };
  const upgrade = (st: InkStroke) => {
    if (clean.current.has(st)) return;
    const queued = cleanInWorker(st, (d) => {
      clean.current.set(st, d);
      upgrades.current.push([st, d]);
      if (!upgradeFrame.current) upgradeFrame.current = requestAnimationFrame(applyUpgrades);
    });
    // no workers: only short strokes are worth cleaning on the main thread
    if (!queued && st.p.length < 900) idle(() => {
      if (cur.current || clean.current.has(st)) return;
      const d = cleanPath(st);
      clean.current.set(st, d);
      upgrades.current.push([st, d]);
      applyUpgrades();
    });
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
  /** set while a stroke is started from the zoom window: its mapping instead of the sheet's */
  const viewOverride = useRef<{ ox: number; oy: number; k: number } | null>(null);
  const fitLive = (k?: number) => {
    const cw = document.documentElement.clientWidth, ch = document.documentElement.clientHeight;
    // the sheet's own camera (Camera.tsx) and, outside it, any browser zoom
    const el = box.current;
    const cam = el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    const zoom = Math.max(1, k && el?.offsetWidth ? k / (el.offsetWidth / U) : (window.visualViewport?.scale ?? 1) * cam);
    let d = Math.min(3, (window.devicePixelRatio || 1) * zoom);
    if (cw * ch * d * d > MAX_CANVAS_AREA) d = Math.sqrt(MAX_CANVAS_AREA / (cw * ch));
    const w = Math.round(cw * d), h = Math.round(ch * d);
    for (const c of [liveHL.current, live.current, liveHLBase.current, liveBase.current]) {
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
    const o = viewOverride.current;
    const d = fitLive(o?.k);
    const c = live.current?.getBoundingClientRect();
    if (o) { view.current = { ...o, cx: c?.left ?? 0, cy: c?.top ?? 0, d }; return; }
    const r = box.current!.getBoundingClientRect();
    view.current = { ox: r.left, oy: r.top, cx: c?.left ?? 0, cy: c?.top ?? 0, k: r.width / U, d };
  };

  const liveCanvasFor = (st: InkStroke) => (st.hl ? liveHL.current : live.current);
  const baseCanvasFor = (st: InkStroke) => (st.hl ? liveHLBase.current : liveBase.current);
  const fillPath = (ctx: CanvasRenderingContext2D, d: string, c: string) => {
    const path = new Path2D(d);
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.lineWidth = SEAM;
    ctx.lineJoin = "round";
    ctx.fill(path);
    ctx.stroke(path);
  };

  /**
   * Draw the stroke being written, plus the Pencil's predicted points.
   * perfect-freehand recomputes a whole stroke for every new point, so long strokes got
   * slower and slower; like Canva and tldraw we work in pieces: the settled part is baked
   * once into the base canvas, and each frame only the tip (≤ CHUNK + OVER points) is redrawn.
   */
  const drawLive = (st: InkStroke, predicted: number[][]) => {
    const c = liveCanvasFor(st), ctx = ctxOf(c);
    if (!c || !ctx) return;
    const { ox, oy, cx, cy, k, d } = view.current;
    const n = st.p.length / 3;
    if (n - baked.current > CHUNK + OVER) {
      const from = Math.max(0, baked.current - OVER), to = n - OVER;
      const bctx = ctxOf(baseCanvasFor(st));
      if (bctx) {
        toUnits(bctx);
        fillPath(bctx, rawPath({ ...st, p: st.p.slice(from * 3, to * 3) }, [], false, from === 0), st.c);
      }
      baked.current = to;
    }
    const from = Math.max(0, baked.current - OVER);
    const tip = from ? { ...st, p: st.p.slice(from * 3) } : st;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (liveBox.current) {
      const [x0, y0, x1, y1] = liveBox.current;
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
    }
    toUnits(ctx);
    fillPath(ctx, rawPath(tip, predicted, false, from === 0), st.c);
    const all = predicted.length ? { ...tip, p: [...tip.p, ...predicted.flat()] } : tip;
    const [bx0, by0, bx1, by1] = bounds([all]);
    const pad = st.s * 2 + 4;
    liveBox.current = [
      Math.max(0, Math.floor((ox - cx + (bx0 - pad) * k) * d)), Math.max(0, Math.floor((oy - cy + (by0 - pad) * k) * d)),
      Math.min(c.width, Math.ceil((ox - cx + (bx1 + pad) * k) * d)), Math.min(c.height, Math.ceil((oy - cy + (by1 + pad) * k) * d)),
    ];
  };
  /** At most one live redraw per frame, however many Pencil events arrive. */
  const scheduleLive = (predicted: number[][]) => {
    predictedRef.current = predicted;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const st = cur.current;
      if (st) drawLive(st, predictedRef.current);
    });
  };

  const drawLasso = () => {
    const c = live.current, ctx = ctxOf(c), pts = lasso.current;
    if (!c || !ctx) return;
    wipe(c);
    if (inkGroup.current) inkGroup.current.style.opacity = "1";
    if (!pts || pts.length < 4) return;
    toUnits(ctx);
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5 / view.current.k;
    ctx.strokeStyle = "#0864a8";
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(35,71,217,0.06)";
    ctx.fill();
  };

  const drawDragged = () => {
    const c = live.current, ctx = ctxOf(c), dr = drag.current, s = sel.current;
    if (!c || !ctx || !dr || !s) return;
    wipe(c);
    if (inkGroup.current) inkGroup.current.style.opacity = "1";
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

  // A second finger landed while one finger was drawing: that was a two-finger pan, not ink.
  useEffect(() => {
    const cancel = () => {
      if (frame.current) { cancelAnimationFrame(frame.current); frame.current = 0; }
      stopHold();
      if (cur.current) {
        const st = cur.current;
        cur.current = null;
        wipe(liveCanvasFor(st));
        wipe(baseCanvasFor(st));
        liveBox.current = null;
        baked.current = 0;
      }
      if (lasso.current) { lasso.current = null; wipe(live.current); }
      if (erasing.current) {
        const changed = erasing.current.changed;
        erasing.current = null;
        if (changed) { strokes.current = undoS.current.pop() ?? strokes.current; redraw(); } else undoS.current.pop();
      }
    };
    window.addEventListener(INK_CANCEL, cancel);
    return () => window.removeEventListener(INK_CANCEL, cancel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The Pencil and a palm during a gesture must not scroll (fingers move the sheet: Camera.tsx).
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

  /** Erase along the way from the last eraser point (fast moves must not skip ink). */
  const eraseAt = (x: number, y: number) => {
    const e = erasing.current!;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - e.x, y - e.y) / Math.max(1, eraseR / 2)));
    let list = strokes.current, changed = false;
    for (let i = 1; i <= steps; i++) {
      const next = eraseStrokes(list, e.x + ((x - e.x) * i) / steps, e.y + ((y - e.y) * i) / steps, eraseR, eraseMode);
      if (next) { list = next; changed = true; }
    }
    e.x = x; e.y = y;
    if (changed) {
      strokes.current = list;
      e.changed = true;
      redraw();
    }
  };
  /** The eraser's circle under the Pencil (also while hovering, on iPads that support it). */
  const showEraser = (ev: { clientX: number; clientY: number } | null) => {
    const el = eraserEl.current;
    if (!el) return;
    if (!ev) { el.style.display = "none"; return; }
    const d = 2 * eraseR * (box.current ? box.current.getBoundingClientRect().width / U : 1);
    el.style.display = "block";
    el.style.width = el.style.height = `${d}px`;
    el.style.transform = `translate(${ev.clientX - d / 2}px, ${ev.clientY - d / 2}px)`;
  };

  const canWrite = (e: React.PointerEvent) =>
    e.pointerType === "pen" || e.pointerType === "mouse" || (fingerDraws && e.pointerType === "touch");

  const insideSel = (x: number, y: number) => {
    if (!selBox) return false;
    const [x0, y0, x1, y1] = selBox;
    return x >= x0 - 6 && x <= x1 + 6 && y >= y0 - 6 && y <= y1 + 6;
  };

  /** Pressure for one sample: device pressure shaped per pen (only the pencil uses it). */
  const samplePressure = (st: InkStroke, ev: PointerEvent, x: number, y: number) => {
    const raw = ev.pointerType === "pen" && ev.pressure > 0 ? ev.pressure : 0.5;
    const l = last.current;
    let v = l?.v ?? 0.5;
    if (l) v = l.v * 0.75 + (Math.hypot(x - l.x, y - l.y) / Math.max(1, ev.timeStamp - l.t)) * 0.25;
    last.current = { x, y, t: ev.timeStamp, v };
    const dg = debug.current;
    if (dg && ev.pointerType === "pen") { dg.pmin = Math.min(dg.pmin, raw); dg.pmax = Math.max(dg.pmax, raw); }
    return effectivePressure(st.hl ? "hl" : st.k ?? "fountain", raw, v);
  };

  /* ---------- hold to straighten ---------- */
  const stopHold = () => {
    if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; }
    hold.current = null;
    line.current = null;
  };
  /** Redraw the live stroke from scratch (its points were replaced, not appended). */
  const restartLive = (st: InkStroke) => {
    wipe(baseCanvasFor(st));
    wipe(liveCanvasFor(st));
    liveBox.current = null;
    baked.current = 0;
    drawLive(st, []);
  };
  const checkHold = () => {
    const st = cur.current, h = hold.current;
    if (!st || !h || line.current || performance.now() - h.t < HOLD_MS) return;
    if (!looksStraight(st.p)) { hold.current = { ...h, t: Infinity }; return; } // not a line: stop asking until it moves
    let pr = 0;
    for (let i = 2; i < st.p.length; i += 3) pr += st.p[i];
    line.current = { x0: st.p[0], y0: st.p[1], pr: r2(pr / (st.p.length / 3)) };
    st.p = linePoints(st.p[0], st.p[1], h.x, h.y, line.current.pr);
    if (frame.current) { cancelAnimationFrame(frame.current); frame.current = 0; }
    restartLive(st);
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
      erasing.current = { changed: false, x, y };
      eraseAt(x, y);
      showEraser(e);
      return;
    }
    const st: InkStroke = tool === "hl" ? { c: color, hl: true, s: size, p: [] } : { c: color, k: tool, s: size, p: [] };
    last.current = null;
    liveBox.current = null;
    baked.current = 0;
    st.p.push(r1(x), r1(y), r2(samplePressure(st, e.nativeEvent, x, y)));
    cur.current = st;
    stopHold();
    hold.current = { x, y, t: performance.now() };
    holdTimer.current = setInterval(checkHold, 80);
    const alpha = st.hl ? String(HL_ALPHA) : kindOf(st) === "pencil" ? String(PENCIL_ALPHA) : "1";
    const g = st.hl ? hlGroup.current : inkGroup.current;
    if (g) g.style.opacity = alpha;
    drawLive(st, []);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current && !lasso.current && !erasing.current && !cur.current) {
      if (tool === "erase" && e.pointerType === "pen") showEraser(e); // hover
      return;
    }
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
      showEraser(e);
      return;
    }
    const t0 = performance.now();
    const st = cur.current!;
    const ln = line.current;
    if (ln) {
      // a snapped line: the Pencil aims its end
      const [x, y] = pos(list[list.length - 1]);
      st.p = linePoints(ln.x0, ln.y0, x, y, ln.pr);
      if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; if (cur.current) restartLive(cur.current); });
      return;
    }
    for (const ev of list) {
      const [x, y] = pos(ev);
      const n = st.p.length;
      if (n >= 3 && Math.hypot(x - st.p[n - 3], y - st.p[n - 2]) < 0.35) continue; // drop jitter
      st.p.push(r1(x), r1(y), r2(samplePressure(st, ev, x, y)));
    }
    // still moving? (on screen pixels, so it feels the same at any zoom)
    const h = hold.current, n3 = st.p.length;
    if (h && Math.hypot(st.p[n3 - 3] - h.x, st.p[n3 - 2] - h.y) * view.current.k > HOLD_PX) {
      hold.current = { x: st.p[n3 - 3], y: st.p[n3 - 2], t: performance.now() };
    }
    const pe = typeof ne.getPredictedEvents === "function" ? ne.getPredictedEvents() : [];
    const lastP = st.p[st.p.length - 1];
    const predicted = st.hl ? [] : pe.slice(0, 3).map((ev) => { const [x, y] = pos(ev); return [x, y, lastP]; });
    scheduleLive(predicted);
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
      showEraser(null);
      return;
    }
    const st = cur.current;
    stopHold();
    if (!st) return;
    cur.current = null;
    snapshot();
    strokes.current = [...strokes.current, st];
    if (frame.current) { cancelAnimationFrame(frame.current); frame.current = 0; }
    appendStroke(st); // one new vector path; nothing else is redrawn
    wipe(liveCanvasFor(st));
    wipe(baseCanvasFor(st));
    liveBox.current = null;
    baked.current = 0;
    if (upgrades.current.length) applyUpgrades(); // clean outlines that arrived while writing
    save();
  };

  // the zoom window finds this layer here (latest handlers through a ref)
  const startRef = useRef<InkLayerApi["start"]>(() => {});
  startRef.current = (ev, v) => {
    viewOverride.current = v;
    const fake = {
      nativeEvent: ev, pointerType: ev.pointerType, pointerId: ev.pointerId, button: ev.button,
      clientX: ev.clientX, clientY: ev.clientY, preventDefault: () => ev.preventDefault(),
    } as unknown as React.PointerEvent<HTMLDivElement>;
    try { onDown(fake); } finally { viewOverride.current = null; }
  };
  const heightRef = useRef(vbH);
  heightRef.current = vbH;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const api: InkLayerApi = {
      key: storageKey, box: el, gid: gidOf(storageKey), height: () => heightRef.current,
      start: (ev, v) => startRef.current(ev, v), last: () => strokes.current[strokes.current.length - 1],
    };
    inkLayers.set(storageKey, api);
    window.dispatchEvent(new Event(INK_LAYERS));
    return () => { if (inkLayers.get(storageKey) === api) inkLayers.delete(storageKey); window.dispatchEvent(new Event(INK_LAYERS)); };
  }, [storageKey]);

  const vb = `0 0 ${U} ${vbH.toFixed(1)}`;
  return (
    <div
      ref={box}
      className={"inklayer" + (fingerDraws ? " finger" : "")}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => { if (!erasing.current) showEraser(null); }}
      style={{ cursor: tool === "erase" ? "cell" : tool === "lasso" ? "default" : "crosshair" }}
      aria-label="Zona de escritura con Apple Pencil"
    >
      <svg ref={svgHL} className="inksvg" viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true"><g id={gidOf(storageKey) + "-hl"} opacity={HL_ALPHA} /></svg>
      <svg ref={svgInk} className="inksvg" viewBox={vb} preserveAspectRatio="xMinYMin meet" aria-hidden="true"><g id={gidOf(storageKey) + "-ink"} /></svg>
      {/* screen-sized live layers stay outside the camera's moving content */}
      <Floating>
        {/* each pair shares one opacity, so the baked part and the tip never double up */}
        <div ref={hlGroup} className="inklive-g hl"><canvas ref={liveHLBase} className="vp" /><canvas ref={liveHL} className="vp" /></div>
        <div ref={inkGroup} className="inklive-g ink"><canvas ref={liveBase} className="vp" /><canvas ref={live} className="vp" /></div>
        <div ref={eraserEl} className="eraser-ring" aria-hidden="true" />
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
