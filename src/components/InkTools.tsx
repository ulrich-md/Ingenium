"use client";
/**
 * iPad writing palette, in the style of the notes apps students already use:
 * a floating pill at the bottom with drawn pens that rise when selected, three
 * quick colors, and a panel (tap the active pen or "más") for thickness, all
 * colors, finger drawing and clearing the sheet. Each pen remembers its own
 * color and thickness.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import { store } from "@/lib/storage";
import type { InkHandle, Pen, Tool } from "./InkLayer";
import { cameraCmd, Floating, useCameraZoom } from "./Camera";
import { ICONS } from "./toolIcons";

export const PEN_COLORS = [
  { c: "#121417", n: "Negro" }, { c: "#e5484d", n: "Rojo" }, { c: "#2f3fd8", n: "Azul" },
  { c: "#15803d", n: "Verde" }, { c: "#7c3aed", n: "Morado" }, { c: "#ea580c", n: "Naranja" },
  { c: "#6b7280", n: "Gris" }, { c: "#8b5a2b", n: "Café" },
];
export const HL_COLORS = [
  { c: "#fde047", n: "Amarillo" }, { c: "#86efac", n: "Verde" }, { c: "#f9a8d4", n: "Rosa" }, { c: "#93c5fd", n: "Azul" }, { c: "#fdba74", n: "Naranja" },
];
const SIZES: Record<Pen | "hl", number[]> = {
  fountain: [1.8, 2.8, 4.2],
  ball: [1.5, 2.2, 3.2],
  pencil: [1.7, 2.5, 3.8],
  marker: [2.6, 3.8, 5.6],
  hl: [12, 18, 26],
};
type Inked = Pen | "hl";
const NAMES: Record<Tool, string> = {
  fountain: "Pluma estilográfica", ball: "Bolígrafo", pencil: "Lápiz", marker: "Plumón", hl: "Resaltador", erase: "Borrador", lasso: "Lazo",
};

export type Dock = "bottom" | "top" | "left" | "right";
interface Saved { tool: Tool; last: Inked; finger: boolean; dock: Dock; set: Record<Inked, { c: string; i: number }> }
const DEFAULTS: Saved = {
  tool: "fountain", last: "fountain", finger: false, dock: "bottom",
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
  sizeIdx: number; setSizeIdx: (i: number) => void;
  finger: boolean; setFinger: (f: boolean) => void;
  dock: Dock; setDock: (d: Dock) => void;
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
  return {
    tool, inked, selected, setSelected, pens: exam ? EXAM_PENS : PEN_TOOLS, palette,
    setTool: (tool) => up((p) => ({ ...p, tool, last: tool === "erase" || tool === "lasso" ? p.last : tool })),
    colorOf: (t) => (exam && !EXAM_COLORS.some((x) => x.c === s.set[t].c) ? EXAM_COLORS[0].c : s.set[t].c),
    setColor: (c) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], c } } })),
    sizeIdx: conf.i,
    setSizeIdx: (i) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], i } } })),
    finger: s.finger, setFinger: (finger) => up((p) => ({ ...p, finger })),
    dock: s.dock, setDock: (dock) => up((p) => ({ ...p, dock })),
    color,
    size: SIZES[inked][conf.i] ?? SIZES[inked][1],
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
const TOOL_COLOR: Partial<Record<Tool, string>> = { erase: "#7b8494", lasso: "#2347d9" };

export function InkToolbar({ t, ink, onClear }: { t: InkTools; ink: RefObject<InkHandle | null>; onClear?: () => void }) {
  const [panel, setPanel] = useState(false);
  const [drag, setDrag] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const isHl = t.inked === "hl";
  const palette = t.palette;
  const quick = palette.slice(0, 3);
  const vertical = t.dock === "left" || t.dock === "right";
  const camZoom = useCameraZoom();
  const fix = useRef<HTMLDivElement>(null);
  const zoom = useRef(1);

  /* Pinch-zoom (the sheet uses the browser's native zoom) magnifies everything that is
     position: fixed. Like the notes apps, the bar must keep its size and stay on screen,
     so this layer follows the visual viewport and undoes its scale. */
  useEffect(() => {
    const vv = window.visualViewport;
    const el = fix.current;
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
  }, []);

  useEffect(() => {
    const b = document.body;
    b.classList.add("has-inkbar");
    b.dataset.inkdock = t.dock;
    return () => { b.classList.remove("has-inkbar"); delete b.dataset.inkdock; };
  }, [t.dock]);

  const pickTool = (x: Tool) => {
    if (x === t.tool && x !== "erase" && x !== "lasso") { setPanel((p) => !p); return; }
    t.setTool(x);
    setPanel(false);
  };
  const pickColor = (c: string) => {
    // with a lasso selection, a color recolors the selected strokes
    if (t.tool === "lasso" && t.selected && ink.current?.recolor(c, isHl)) return;
    t.setColor(c);
    if (t.tool === "erase" || t.tool === "lasso") t.setTool(t.inked);
  };

  /* drag the bar by its grip; on release it sticks to the nearest edge */
  const grip = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      setPanel(false);
      dragRef.current = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
      setDrag(dragRef.current);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current;
      if (!d) return;
      // the bar lives in the un-zoomed layer, so page pixels count `zoom` times more
      dragRef.current = { ...d, dx: (e.clientX - d.x) * zoom.current, dy: (e.clientY - d.y) * zoom.current };
      setDrag(dragRef.current);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      const moved = Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6;
      setDrag(null);
      if (!moved) return;
      // nearest edge of what is on screen (the visual viewport), also while zoomed in
      const vv = window.visualViewport;
      const W = vv ? vv.width : window.innerWidth, H = vv ? vv.height : window.innerHeight;
      const x = e.clientX - (vv?.offsetLeft ?? 0), y = e.clientY - (vv?.offsetTop ?? 0);
      const dist: [Dock, number][] = [["left", x], ["right", W - x], ["top", y], ["bottom", H - y]];
      dist.sort((a, b) => a[1] - b[1]);
      t.setDock(dist[0][0]);
    },
  };

  const style = drag ? { translate: `${drag.dx}px ${drag.dy}px`, transition: "none" } : undefined;

  return (
    <Floating>
    <div className="inkfix" ref={fix}>
      {panel && (
        <div className={`inkpanel dock-${t.dock}`} role="dialog" aria-label={`Opciones de ${NAMES[t.inked]}`}>
          <div className="ip-row">
            <span className="ip-lab">{NAMES[t.inked]} · grosor</span>
            <div className="ip-sizes">
              {SIZES[t.inked].map((s, i) => (
                <button key={i} type="button" aria-pressed={t.sizeIdx === i} aria-label={["Fino", "Medio", "Grueso"][i]} onClick={() => t.setSizeIdx(i)}>
                  <svg viewBox="0 0 80 20" width="80" height="20" aria-hidden="true">
                    <path d={`M6 13 C 22 ${13 - s * 1.2}, 40 ${7 + s}, 74 8`} fill="none" stroke={t.color} strokeOpacity={isHl ? 0.6 : 1} strokeWidth={isHl ? s / 2.4 : s * 1.5} strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="ip-row">
            <span className="ip-lab">Colores</span>
            <div className="ip-colors">
              {palette.map((p) => (
                <button key={p.c} type="button" aria-label={`Color ${p.n}`} aria-pressed={t.color === p.c} onClick={() => pickColor(p.c)}>
                  <span style={{ background: p.c }} />
                </button>
              ))}
            </div>
          </div>
          <div className="ip-row">
            <span className="ip-lab">Zoom de la hoja · también con dos dedos</span>
            <div className="ip-zoom">
              <button type="button" className="btn sm ghost" aria-label="Alejar" onClick={() => cameraCmd("out")} disabled={camZoom <= 1.01}>−</button>
              <button type="button" className="btn sm ghost" onClick={() => cameraCmd("reset")}>{Math.round(camZoom * 100)} %</button>
              <button type="button" className="btn sm ghost" aria-label="Acercar" onClick={() => cameraCmd("in")} disabled={camZoom >= 3.99}>+</button>
            </div>
          </div>
          <div className="ip-row ip-actions">
            <button type="button" className="btn sm ghost" aria-pressed={t.finger} onClick={() => t.setFinger(!t.finger)}>{t.finger ? "Dedo: escribe" : "Dedo: desplaza"}</button>
            <button type="button" className="btn sm ghost" onClick={() => { (onClear ? onClear() : ink.current?.clear()); setPanel(false); }}>Borrar hoja</button>
            <button type="button" className="btn sm" onClick={() => setPanel(false)}>Listo</button>
          </div>
        </div>
      )}
      {t.tool === "lasso" && (
        <div className={`inkhint dock-${t.dock}`}>{t.selected ? `${t.selected} trazos seleccionados: arrástralos o toca un color` : "Rodea trazos con el lápiz para seleccionarlos"}</div>
      )}
      <div className={`inkbar dock-${t.dock}${vertical ? " vertical" : ""}${drag ? " dragging" : ""}`} style={style} role="toolbar" aria-label="Herramientas de escritura">
        <button type="button" className="ib-grip" aria-label="Mover la barra (arrástrala a cualquier borde)" title="Arrastra para mover" {...grip}>
          <Icon name="grip" size={18} />
        </button>
        <div className="ib-undo">
          <button type="button" onClick={() => ink.current?.undo()} aria-label="Deshacer" title="Deshacer"><Icon name="undo" size={24} /></button>
          <button type="button" onClick={() => ink.current?.redo()} aria-label="Rehacer" title="Rehacer"><Icon name="redo" size={24} /></button>
        </div>
        <i className="ib-sep" aria-hidden="true" />
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
      </div>
    </div>
    </Floating>
  );
}
