"use client";
/**
 * iPad writing palette, in the style of the notes apps students already use:
 * a floating pill (drag it by its grip anywhere on screen; near an edge it docks there)
 * with drawn pens that rise when selected, three
 * quick colors, and a panel (tap the active pen or "más") for thickness, all
 * colors, finger drawing and clearing the sheet. Each pen remembers its own
 * color and thickness.
 */
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { store } from "@/lib/storage";
import type { InkHandle, Pen, Tool } from "./InkLayer";
import { cameraCmd, Floating, useCameraZoom, INK_TAP } from "./Camera";
import { ICONS } from "./toolIcons";
import ZoomWindow from "./ZoomWindow";

export const PEN_COLORS = [
  { c: "#121417", n: "Negro" }, { c: "#e5484d", n: "Rojo" }, { c: "#2f3fd8", n: "Azul" },
  { c: "#15803d", n: "Verde" }, { c: "#7c3aed", n: "Morado" }, { c: "#ea580c", n: "Naranja" },
  { c: "#6b7280", n: "Gris" }, { c: "#8b5a2b", n: "Café" },
];
export const HL_COLORS = [
  { c: "#fde047", n: "Amarillo" }, { c: "#86efac", n: "Verde" }, { c: "#f9a8d4", n: "Rosa" }, { c: "#93c5fd", n: "Azul" }, { c: "#fdba74", n: "Naranja" },
];
const SIZES: Record<Pen | "hl", number[]> = {
  fountain: [2, 3, 4.4],
  ball: [1.1, 1.6, 2.3],
  pencil: [1.6, 2.4, 3.6],
  marker: [4.5, 6.5, 9],
  hl: [12, 18, 26],
};
type Inked = Pen | "hl";
/** thickness range of each pen for the slider (sheet units, 1/1000 of the page width) */
const RANGE: Record<Inked, [number, number]> = {
  fountain: [1, 7], ball: [0.7, 4], pencil: [1, 6], marker: [3, 14], hl: [8, 36],
};
/** eraser: whole strokes, or only the part it touches (radius in sheet units) */
export type EraseMode = "stroke" | "part";
const ERASE_RANGE: [number, number] = [3, 40];
const MAX_MINE = 8;
const NAMES: Record<Tool, string> = {
  fountain: "Pluma estilográfica", ball: "Bolígrafo", pencil: "Lápiz", marker: "Plumón", hl: "Resaltador", erase: "Borrador", lasso: "Lazo",
};

/** an edge of the screen, or "free": wherever the student left it */
export type Dock = "bottom" | "top" | "left" | "right" | "free";
/** where the bar's grip is, as fractions of the screen's width and height (the bar is
 *  placed so that the grip stays where the finger let go of it) */
export interface At { x: number; y: number }
interface Saved {
  tool: Tool; last: Inked; finger: boolean; dock: Dock; at?: At; mini: boolean;
  /** per pen: color, old size step (fino/medio/grueso) and the slider's thickness */
  set: Record<Inked, { c: string; i: number; w?: number }>;
  erase?: { mode: EraseMode; r: number };
  /** colors the student made with the picker */
  mine?: string[];
}
const DEFAULTS: Saved = {
  tool: "fountain", last: "fountain", finger: false, dock: "bottom", mini: false,
  set: {
    fountain: { c: "#2f3fd8", i: 1 }, ball: { c: "#121417", i: 1 }, pencil: { c: "#121417", i: 1 },
    marker: { c: "#e5484d", i: 1 }, hl: { c: "#fde047", i: 1 },
  },
};

export interface InkTools {
  tool: Tool; setTool: (t: Tool) => void;
  /** pen whose settings the color dots edit (the active pen, or the last one before eraser/lasso) */
  inked: Inked;
  colorOf: (t: Inked) => string; setColor: (c: string) => void;
  /** the pen's thickness and its slider range */
  setSize: (w: number) => void; range: [number, number];
  eraseMode: EraseMode; eraseR: number; setErase: (mode: EraseMode, r: number) => void; eraseRange: [number, number];
  /** own colors (not in exam mode) */
  mine: string[]; addMine: (c: string) => void; removeMine: (c: string) => void; exam: boolean;
  finger: boolean; setFinger: (f: boolean) => void;
  dock: Dock; at?: At; setPlace: (d: Dock, at: At) => void;
  /** collapsed bar: only undo, the pen in use and its color */
  mini: boolean; setMini: (m: boolean) => void;
  selected: number; setSelected: (n: number) => void;
  /** what to pass to InkLayer */
  color: string; size: number;
  /** pens on the bar and the colors offered (fewer in exam mode) */
  pens: Tool[]; palette: { c: string; n: string }[];
}

const PEN_TOOLS: Tool[] = ["fountain", "ball", "pencil", "marker", "hl", "erase", "lasso"];

/* In an IB exam you write in black or blue ink and draw with pencil: nothing else to choose. */
const EXAM_PENS: Tool[] = ["ball", "pencil", "erase"];
const EXAM_COLORS = [{ c: "#121417", n: "Negro" }, { c: "#2f3fd8", n: "Azul" }];

export function useInkTools({ exam = false }: { exam?: boolean } = {}): InkTools {
  const [s, set] = useState<Saved>(DEFAULTS);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const saved = store.get<Partial<Saved>>("kw-ink-tools-v2", {});
    set((p) => ({ ...p, ...saved, set: { ...p.set, ...(saved.set ?? {}) } }));
  }, []);
  const up = (f: (p: Saved) => Saved) => set((p) => { const n = f(p); store.set("kw-ink-tools-v2", n); return n; });
  // exam mode only narrows what is shown and used; the saved choices stay for the notes
  const tool: Tool = !exam || EXAM_PENS.includes(s.tool) ? s.tool : "ball";
  const last: Inked = !exam || s.last === "ball" || s.last === "pencil" ? s.last : "ball";
  const inked: Inked = tool === "erase" || tool === "lasso" ? last : (tool as Inked);
  const conf = s.set[inked];
  const isHl = inked === "hl";
  const palette = exam ? EXAM_COLORS : isHl ? HL_COLORS : PEN_COLORS;
  const color = exam && !EXAM_COLORS.some((x) => x.c === conf.c) ? EXAM_COLORS[0].c : conf.c;
  const [lo, hi] = RANGE[inked];
  const size = Math.min(hi, Math.max(lo, conf.w ?? SIZES[inked][conf.i] ?? SIZES[inked][1]));
  const er = s.erase ?? { mode: "stroke" as EraseMode, r: 10 };
  const mine = s.mine ?? [];
  return {
    tool, inked, selected, setSelected, pens: exam ? EXAM_PENS : PEN_TOOLS, palette,
    setTool: (tool) => up((p) => ({ ...p, tool, last: tool === "erase" || tool === "lasso" ? p.last : tool })),
    colorOf: (t) => (exam && !EXAM_COLORS.some((x) => x.c === s.set[t].c) ? EXAM_COLORS[0].c : s.set[t].c),
    setColor: (c) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], c } } })),
    range: RANGE[inked],
    setSize: (w) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], w: Math.round(w * 10) / 10 } } })),
    eraseMode: er.mode, eraseR: er.r, eraseRange: ERASE_RANGE,
    setErase: (mode, r) => up((p) => ({ ...p, erase: { mode, r } })),
    mine, exam,
    addMine: (c) => up((p) => ({ ...p, mine: [c, ...(p.mine ?? []).filter((x) => x !== c)].slice(0, MAX_MINE) })),
    removeMine: (c) => up((p) => ({ ...p, mine: (p.mine ?? []).filter((x) => x !== c) })),
    finger: s.finger, setFinger: (finger) => up((p) => ({ ...p, finger })),
    dock: s.dock, at: s.at, setPlace: (dock, at) => up((p) => ({ ...p, dock, at })),
    mini: s.mini, setMini: (mini) => up((p) => ({ ...p, mini })),
    color,
    size,
  };
}

/* ---------- tool icons (Phosphor, duotone, drawn in each tool's ink color) ---------- */
function Icon({ name, color, size = 28 }: { name: keyof typeof ICONS; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" style={color ? { color } : undefined} aria-hidden="true">
      {ICONS[name].map((p, i) => <path key={i} d={p.d} opacity={p.o} />)}
    </svg>
  );
}

/** Light inks (yellow highlighter) need a deeper shade to read as an icon on white. */
function iconInk(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.62) return hex;
  const k = 0.62 / lum; // darken until it has enough contrast
  const h = (v: number) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
const TOOL_COLOR: Partial<Record<Tool, string>> = { erase: "#7b8494", lasso: "#0864a8" };

export function InkToolbar({ t, ink, onClear }: { t: InkTools; ink: RefObject<InkHandle | null>; onClear?: () => void }) {
  const [panel, setPanel] = useState(false);
  const [picker, setPicker] = useState(false);
  const [zw, setZw] = useState(false);
  useEffect(() => { if (!panel) setPicker(false); }, [panel]);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const panelEl = useRef<HTMLDivElement>(null);
  const hintEl = useRef<HTMLDivElement>(null);
  /** where the bar was let go (layer px), to glide from there to its new place */
  const flip = useRef<{ x: number; y: number } | null>(null);
  const [, setTick] = useState(0);
  const isHl = t.inked === "hl";
  const palette = t.palette;
  const quick = palette.slice(0, 3);
  const vertical = t.dock === "left" || t.dock === "right";
  const layout = useRef<() => void>(() => {});
  const camZoom = useCameraZoom();
  // a state ref: the layer mounts a render later, inside a portal (Floating)
  const [fix, setFix] = useState<HTMLDivElement | null>(null);
  const zoom = useRef(1);

  // two-finger tap undoes, three-finger tap redoes (Camera.tsx tells taps from pinches)
  useEffect(() => {
    const on = (e: Event) => ((e as CustomEvent<number>).detail === 3 ? ink.current?.redo() : ink.current?.undo());
    window.addEventListener(INK_TAP, on);
    return () => window.removeEventListener(INK_TAP, on);
  }, [ink]);

  /* Pinch-zoom (the sheet uses the browser's native zoom) magnifies everything that is
     position: fixed. Like the notes apps, the bar must keep its size and stay on screen,
     so this layer follows the visual viewport and undoes its scale. */
  useEffect(() => {
    const vv = window.visualViewport;
    const el = fix;
    if (!vv || !el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const s = vv.scale || 1;
      zoom.current = s;
      if (Math.abs(s - 1) < 0.01 && Math.abs(vv.offsetLeft) < 1 && Math.abs(vv.offsetTop) < 1) {
        el.style.transform = ""; el.style.width = ""; el.style.height = "";
        return;
      }
      el.style.width = `${vv.width * s}px`;
      el.style.height = `${vv.height * s}px`;
      el.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px) scale(${1 / s})`;
    };
    const sched = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    vv.addEventListener("resize", sched);
    vv.addEventListener("scroll", sched);
    return () => { vv.removeEventListener("resize", sched); vv.removeEventListener("scroll", sched); if (raf) cancelAnimationFrame(raf); };
  }, [fix]);

  useEffect(() => {
    const b = document.body;
    b.classList.add("has-inkbar");
    b.dataset.inkdock = t.dock;
    return () => { b.classList.remove("has-inkbar"); delete b.dataset.inkdock; };
  }, [t.dock]);

  const pickTool = (x: Tool) => {
    if (x === t.tool && x !== "lasso") { setPanel((p) => !p); return; }
    t.setTool(x);
    setPanel(false);
  };
  const pickColor = (c: string) => {
    // with a lasso selection, a color recolors the selected strokes
    if (t.tool === "lasso" && t.selected && ink.current?.recolor(c, isHl)) return;
    t.setColor(c);
    if (t.tool === "erase" || t.tool === "lasso") t.setTool(t.inked);
  };

  /* ---------- placing the bar, its panel and hint ---------- */
  /** a screen rect in the bar's layer (which undoes any browser zoom, see above) */
  const toLayer = (r: DOMRect) => {
    const vv = window.visualViewport, z = zoom.current;
    const ox = vv && z !== 1 ? vv.offsetLeft : 0, oy = vv && z !== 1 ? vv.offsetTop : 0;
    return { l: (r.left - ox) * z, t: (r.top - oy) * z, w: r.width * z, h: r.height * z };
  };
  const M = 12; // margin from the screen edges
  const clampC = (c: number, size: number, total: number) =>
    size + 2 * M >= total ? total / 2 : Math.min(total - M - size / 2, Math.max(M + size / 2, c));
  /** start of a bar of `size` whose grip (at `g` from its start) should be at `at`; centered without `at` */
  const clampS = (at: number | undefined, g: number, size: number, total: number) =>
    at === undefined || size + 2 * M >= total ? (total - size) / 2 : Math.min(total - M - size, Math.max(M, at * total - g));
  layout.current = () => {
    const el = bar.current, layer = fix;
    if (!el || !layer) return;
    const W = layer.clientWidth, H = layer.clientHeight;
    const bw = el.offsetWidth, bh = el.offsetHeight;
    const st = el.style;
    const g = el.querySelector<HTMLElement>(".ib-grip");
    const gx = g ? g.offsetLeft + g.offsetWidth / 2 : 0, gy = g ? g.offsetTop + g.offsetHeight / 2 : 0;
    // the CSS of each dock keeps the distance to its edge; here only the position along it
    st.left = st.top = st.right = st.bottom = "";
    st.transform = "none";
    if (t.dock === "bottom" || t.dock === "top") st.left = `${clampS(t.at?.x, gx, bw, W)}px`;
    else if (t.dock === "left" || t.dock === "right") st.top = `${clampS(t.at?.y, gy, bh, H)}px`;
    else {
      st.left = `${clampS(t.at?.x ?? 0.5, gx, bw, W)}px`;
      st.top = `${clampS(t.at?.y ?? 0.5, gy, bh, H)}px`;
      st.right = st.bottom = "auto";
    }
    // glide from where the finger let go
    const f = flip.current;
    if (f) {
      flip.current = null;
      const r = toLayer(el.getBoundingClientRect());
      const dx = f.x - (r.l + r.w / 2), dy = f.y - (r.t + r.h / 2);
      st.transition = "none";
      st.translate = `${dx}px ${dy}px`;
      void el.offsetWidth;
      st.transition = "translate .28s cubic-bezier(.2,.9,.25,1)";
      st.translate = "0px 0px";
      const done = () => { st.transition = ""; st.translate = ""; el.removeEventListener("transitionend", done); };
      el.addEventListener("transitionend", done);
    }
    // the panel and the hint open next to the bar, on the side with room
    const b = toLayer(el.getBoundingClientRect());
    const bx = b.l + b.w / 2, by = b.t + b.h / 2;
    for (const p of [panelEl.current, hintEl.current]) {
      if (!p) continue;
      const pw = p.offsetWidth, ph = p.offsetHeight, G = 12;
      let left: number, top: number;
      if (vertical) {
        top = clampC(by, ph, H) - ph / 2;
        left = bx < W / 2 ? b.l + b.w + G : b.l - G - pw;
      } else {
        left = clampC(bx, pw, W) - pw / 2;
        top = by > H / 2 ? b.t - G - ph : b.t + b.h + G;
      }
      Object.assign(p.style, { left: `${left}px`, top: `${Math.max(M, Math.min(H - ph - M, top))}px`, right: "auto", bottom: "auto", transform: "none" });
    }
  };
  useLayoutEffect(() => layout.current());
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const again = () => setTick((n) => n + 1);
    const ro = new ResizeObserver(() => layout.current());
    ro.observe(el);
    window.addEventListener("resize", again);
    return () => { ro.disconnect(); window.removeEventListener("resize", again); };
  }, [fix]);

  /* drag the bar by its grip, anywhere; let go near an edge and it docks there */
  const SNAP = 56;
  const grip = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      setPanel(false);
      dragRef.current = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
      const el = bar.current;
      if (el) { el.style.transition = "none"; el.style.translate = "0px 0px"; }
      setDragging(true);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current, el = bar.current;
      if (!d || !el) return;
      // the bar lives in the un-zoomed layer, so page pixels count `zoom` times more;
      // moved directly (no re-render), so it stays under the finger
      d.dx = (e.clientX - d.x) * zoom.current;
      d.dy = (e.clientY - d.y) * zoom.current;
      el.style.translate = `${d.dx}px ${d.dy}px`;
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current, el = bar.current, layer = fix;
      if (!d) return;
      dragRef.current = null;
      setDragging(false);
      const moved = Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6;
      if (!moved || !el || !layer) { if (el) { el.style.translate = ""; el.style.transition = ""; } return; }
      const W = layer.clientWidth, H = layer.clientHeight;
      const r = toLayer(el.getBoundingClientRect());
      const cx = r.l + r.w / 2, cy = r.t + r.h / 2;
      flip.current = { x: cx, y: cy };
      el.style.translate = "";
      // the finger near an edge: the bar docks there (vertical on the sides); anywhere else it stays put
      const vv = window.visualViewport, z = zoom.current;
      const px = (e.clientX - (vv && z !== 1 ? vv.offsetLeft : 0)) * z, py = (e.clientY - (vv && z !== 1 ? vv.offsetTop : 0)) * z;
      const edges: [Dock, number][] = [["left", px], ["right", W - px], ["top", py], ["bottom", H - py]];
      edges.sort((a, b) => a[1] - b[1]);
      const at = { x: Math.min(1, Math.max(0, px / W)), y: Math.min(1, Math.max(0, py / H)) };
      const dock: Dock = edges[0][1] < SNAP ? edges[0][0] : "free";
      t.setPlace(dock, at);
      if (dock === t.dock && at.x === t.at?.x && at.y === t.at?.y) layout.current();
    },
  };

  return (
    <Floating>
    <div className="inkfix" ref={setFix}>
      {panel && (
        <div ref={panelEl} className={`inkpanel dock-${t.dock}`} role="dialog" aria-label={`Opciones de ${NAMES[t.inked]}`}>
          {t.tool === "erase" ? (
            <>
              <div className="ip-row">
                <span className="ip-lab">Borrador</span>
                <div className="ip-seg" role="radiogroup" aria-label="Qué borra">
                  <button type="button" role="radio" aria-checked={t.eraseMode === "stroke"} onClick={() => t.setErase("stroke", t.eraseR)}>Trazo entero</button>
                  <button type="button" role="radio" aria-checked={t.eraseMode === "part"} onClick={() => t.setErase("part", t.eraseR)}>Solo lo que toca</button>
                </div>
              </div>
              <div className="ip-row">
                <span className="ip-lab">Tamaño</span>
                <div className="ip-slider">
                  <input type="range" min={t.eraseRange[0]} max={t.eraseRange[1]} step={1} value={t.eraseR} aria-label="Tamaño del borrador"
                    onChange={(e) => t.setErase(t.eraseMode, Number(e.target.value))} />
                  <span className="ip-eprev" aria-hidden="true"><i style={{ width: t.eraseR * 1.6, height: t.eraseR * 1.6 }} /></span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="ip-row">
                <span className="ip-lab">{NAMES[t.inked]} · grosor {t.size.toFixed(1)}</span>
                <div className="ip-slider">
                  <input type="range" min={t.range[0]} max={t.range[1]} step={0.1} value={t.size} aria-label="Grosor"
                    style={{ accentColor: isHl ? "#b59a00" : t.color }} onChange={(e) => t.setSize(Number(e.target.value))} />
                </div>
                <svg className="ip-prev" viewBox="0 0 300 44" aria-hidden="true">
                  <path d="M14 30 C 70 6, 110 40, 160 22 S 250 10, 286 20" fill="none" stroke={t.color} strokeOpacity={isHl ? 0.45 : t.inked === "pencil" ? 0.75 : 1}
                    strokeWidth={Math.min(40, t.size * 1.6)} strokeLinecap={isHl ? "butt" : "round"} strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ip-row">
                <span className="ip-lab">Colores</span>
                <div className="ip-colors">
                  {palette.map((p) => (
                    <button key={p.c} type="button" aria-label={`Color ${p.n}`} aria-pressed={t.color === p.c} onClick={() => pickColor(p.c)}>
                      <span style={{ background: p.c }} />
                    </button>
                  ))}
                  {!t.exam && t.mine.map((c) => (
                    <button key={"m" + c} type="button" className="mine" aria-label={`Mi color ${c}`} aria-pressed={t.color === c} onClick={() => pickColor(c)}>
                      <span style={{ background: c }} />
                    </button>
                  ))}
                  {!t.exam && (
                    <button type="button" className="ip-add" aria-label="Crear un color" aria-expanded={picker} onClick={() => setPicker((v) => !v)}>
                      <span>+</span>
                    </button>
                  )}
                </div>
                {!t.exam && t.mine.includes(t.color) && !picker && (
                  <button type="button" className="ip-link" onClick={() => t.removeMine(t.color)}>Quitar este color de mis colores</button>
                )}
                {picker && <ColorPicker start={t.color} onPick={(c) => { t.addMine(c); pickColor(c); setPicker(false); }} onCancel={() => setPicker(false)} />}
              </div>
            </>
          )}
          <div className="ip-row">
            <span className="ip-lab">Zoom de la hoja · también con dos dedos</span>
            <div className="ip-zoom">
              <button type="button" className="btn sm ghost" aria-label="Alejar" onClick={() => cameraCmd("out")} disabled={camZoom <= 1.01}>−</button>
              <button type="button" className="btn sm ghost" onClick={() => cameraCmd("reset")}>{Math.round(camZoom * 100)} %</button>
              <button type="button" className="btn sm ghost" aria-label="Acercar" onClick={() => cameraCmd("in")} disabled={camZoom >= 3.99}>+</button>
              <button type="button" className="btn sm" aria-pressed={zw} onClick={() => { setZw((v) => !v); setPanel(false); }}>{zw ? "Cerrar ventana de zoom" : "Ventana de zoom"}</button>
            </div>
          </div>
          <p className="ip-tips">Toca con dos dedos para deshacer y con tres para rehacer. Para una línea recta, deja el lápiz quieto al final del trazo.</p>
          <div className="ip-row ip-actions">
            <button type="button" className="btn sm ghost" aria-pressed={t.finger} onClick={() => t.setFinger(!t.finger)}>{t.finger ? "Dedo: escribe" : "Dedo: desplaza"}</button>
            <button type="button" className="btn sm ghost" onClick={() => { (onClear ? onClear() : ink.current?.clear()); setPanel(false); }}>Borrar hoja</button>
            <button type="button" className="btn sm" onClick={() => setPanel(false)}>Listo</button>
          </div>
        </div>
      )}
      {t.tool === "lasso" && (
        <div ref={hintEl} className={`inkhint dock-${t.dock}`}>{t.selected ? `${t.selected} trazos seleccionados: arrástralos o toca un color` : "Rodea trazos con el lápiz para seleccionarlos"}</div>
      )}
      <div ref={bar} className={`inkbar dock-${t.dock}${vertical ? " vertical" : ""}${dragging ? " dragging" : ""}${t.mini ? " mini" : ""}`} role="toolbar" aria-label="Herramientas de escritura">
        <button type="button" className="ib-grip" aria-label="Mover la barra (arrástrala a donde quieras)" title="Arrastra para mover" {...grip}>
          <Icon name="grip" size={18} />
        </button>
        <div className="ib-undo">
          <button type="button" onClick={() => ink.current?.undo()} aria-label="Deshacer" title="Deshacer (o toca con dos dedos)"><Icon name="undo" size={24} /></button>
          <button type="button" onClick={() => ink.current?.redo()} aria-label="Rehacer" title="Rehacer (o toca con tres dedos)"><Icon name="redo" size={24} /></button>
        </div>
        <i className="ib-sep" aria-hidden="true" />
        {t.mini ? (
          <>
            {/* collapsed: the pen in use (tap to open the bar again) and its color */}
            <button type="button" className="ib-pen" aria-pressed="true" aria-label={`${NAMES[t.tool]}: abrir la barra`} title="Abrir la barra" onClick={() => t.setMini(false)}>
              <Icon name={t.tool} color={iconInk(TOOL_COLOR[t.tool] ?? t.color)} />
            </button>
            {t.tool !== "erase" && t.tool !== "lasso" && (
              <button type="button" className="ib-dot" aria-label="Más colores y grosor" aria-expanded={panel} onClick={() => setPanel((v) => !v)}>
                <span style={{ background: t.color }} />
              </button>
            )}
            <button type="button" className="ib-fold" aria-label="Abrir la barra" title="Abrir la barra" onClick={() => t.setMini(false)}><Icon name="expand" size={18} /></button>
          </>
        ) : (
          <>
        <div className="ib-pens">
          {t.pens.map((x) => (
            <button key={x} type="button" className="ib-pen" aria-pressed={t.tool === x} aria-label={NAMES[x]} title={NAMES[x]} onClick={() => pickTool(x)}>
              <Icon name={x} color={iconInk(TOOL_COLOR[x] ?? t.colorOf(x as Inked))} />
            </button>
          ))}
        </div>
        <i className="ib-sep" aria-hidden="true" />
        <div className="ib-colors">
          {quick.map((p) => (
            <button key={p.c} type="button" className="ib-dot" aria-label={`Color ${p.n}`} aria-pressed={t.color === p.c && t.tool !== "erase" && t.tool !== "lasso"} onClick={() => pickColor(p.c)}>
              <span style={{ background: p.c }} />
            </button>
          ))}
          <button type="button" className="ib-dot more" aria-label="Más colores y grosor" aria-expanded={panel} onClick={() => setPanel((v) => !v)}>
            <span />
          </button>
        </div>
        <button type="button" className="ib-fold" aria-label="Hacer la barra más pequeña" title="Hacer la barra más pequeña" onClick={() => { setPanel(false); t.setMini(true); }}><Icon name="collapse" size={18} /></button>
          </>
        )}
      </div>
    </div>
    {zw && <ZoomWindow onClose={() => setZw(false)} />}
    </Floating>
  );
}

/* ---------- own colors: a saturation/brightness square and a hue strip ---------- */
const hsv2hex = (h: number, s: number, v: number) => {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return "#" + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
};
const hex2hsv = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx];
};

function ColorPicker({ start, onPick, onCancel }: { start: string; onPick: (c: string) => void; onCancel: () => void }) {
  const [[h, sat, val], setHsv] = useState<[number, number, number]>(() => hex2hsv(start));
  const sq = useRef<HTMLDivElement>(null);
  const c = hsv2hex(h, sat, val);
  const fromSquare = (e: React.PointerEvent) => {
    const r = sq.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setHsv([h, x, 1 - y]);
  };
  return (
    <div className="cpick">
      <div ref={sq} className="cp-sq" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))` }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromSquare(e); }}
        onPointerMove={(e) => { if (e.buttons || e.pressure > 0) fromSquare(e); }}
        role="slider" aria-label="Claridad y saturación" aria-valuenow={Math.round(val * 100)}>
        <i style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%`, background: c }} />
      </div>
      <input className="cp-hue" type="range" min={0} max={359} value={Math.round(h)} aria-label="Tono" onChange={(e) => setHsv([Number(e.target.value), sat, val])} />
      <div className="cp-foot">
        <span className="cp-prev" style={{ background: c }} aria-hidden="true" />
        <span className="mono cp-hex">{c.toUpperCase()}</span>
        <span className="grow" />
        <button type="button" className="btn sm ghost" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn sm primary" onClick={() => onPick(c)}>Usar este color</button>
      </div>
    </div>
  );
}
