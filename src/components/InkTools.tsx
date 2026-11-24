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

/* ---------- drawn pens (44 × 100; the end of the barrel is hidden by the bar) ---------- */
function Barrel({ band }: { band?: React.ReactNode }) {
  return (
    <>
      <rect x="10" y="38" width="24" height="70" rx="2.5" fill="url(#kw-barrel)" />
      <rect x="13.5" y="40" width="3" height="66" rx="1.5" fill="#fff" opacity=".85" />
      {band}
    </>
  );
}
function PenArt({ t, color }: { t: Tool; color: string }) {
  switch (t) {
    case "fountain":
      return (<>
        <Barrel band={<><rect x="10" y="46" width="24" height="5" fill={color} /><rect x="10" y="51" width="24" height="1.2" fill="#000" opacity=".12" /></>} />
        <path d="M11 39 C 12 30, 16 22, 22 4 C 28 22, 32 30, 33 39 Z" fill="url(#kw-metal)" />
        <path d="M22 4 C 26 18, 29 27, 31 38" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
        <path d="M22 9 L22 26" stroke="#2b3038" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="22" cy="27.5" r="1.9" fill="#2b3038" />
        <path d="M14 36 Q22 32 30 36" fill="none" stroke="#7d838c" strokeWidth=".8" />
      </>);
    case "ball":
      return (<>
        <Barrel band={<rect x="10" y="48" width="24" height="4" fill={color} />} />
        <path d="M11 39 L19.6 12 L24.4 12 L33 39 Z" fill="url(#kw-barrel)" stroke="#cdd1d8" strokeWidth=".6" />
        <path d="M19.6 12 L22 6.5 L24.4 12 Z" fill="url(#kw-metal)" />
        <circle cx="22" cy="6.8" r="1.4" fill={color} />
      </>);
    case "pencil":
      return (<>
        <Barrel band={<><rect x="10" y="45" width="24" height="2.4" fill={color} /><rect x="10" y="49" width="24" height="2.4" fill={color} /></>} />
        <path d="M10 39 L22 9 L34 39 Z" fill="url(#kw-wood)" />
        <path d="M10 39 L13 36.5 L16 39 L19 36.5 L22 39 L25 36.5 L28 39 L31 36.5 L34 39" fill="url(#kw-barrel)" />
        <path d="M17.6 20 L22 9 L26.4 20 Q22 21.6 17.6 20 Z" fill={color} />
      </>);
    case "marker":
      return (<>
        <Barrel band={<path d="M10 47 h4.5 M16.5 47 h4.5 M23 47 h4.5 M29.5 47 h4.5" stroke={color} strokeWidth="3.4" />} />
        <path d="M13 39 L16 24 L28 24 L31 39 Z" fill="url(#kw-barrel)" stroke="#cdd1d8" strokeWidth=".6" />
        <rect x="18.6" y="9" width="6.8" height="16" rx="3.4" fill={color} />
        <rect x="19.8" y="10.5" width="1.6" height="12" rx=".8" fill="#fff" opacity=".45" />
      </>);
    case "hl":
      return (<>
        <Barrel band={<rect x="10" y="45" width="24" height="8" fill={color} />} />
        <path d="M12 39 L12 27 L32 17 L32 39 Z" fill="url(#kw-barrel)" stroke="#cdd1d8" strokeWidth=".6" />
        <path d="M15 26 L15 19 L29 11.5 L29 19.5 Z" fill={color} />
        <path d="M15 19 L29 11.5" stroke="#fff" strokeOpacity=".6" strokeWidth=".9" />
      </>);
    case "erase":
      return (<>
        <Barrel />
        <rect x="10" y="33" width="24" height="7" fill="url(#kw-metal)" />
        <rect x="10" y="9" width="24" height="26" rx="8" fill="url(#kw-eraser)" />
        <rect x="13.5" y="12" width="3" height="18" rx="1.5" fill="#fff" opacity=".5" />
      </>);
    case "lasso":
      return (<>
        <Barrel />
        <path d="M14 39 L22 26 L30 39 Z" fill="url(#kw-barrel)" stroke="#cdd1d8" strokeWidth=".6" />
        <ellipse cx="22" cy="15" rx="11" ry="8.5" fill="none" stroke="#2347d9" strokeWidth="2.2" strokeDasharray="3.2 2.6" />
        <path d="M16.5 22 C 14 27, 17 30, 21 28" fill="none" stroke="#2347d9" strokeWidth="2.2" strokeLinecap="round" />
      </>);
  }
}

function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="kw-barrel" x1="0" x2="1">
          <stop offset="0" stopColor="#d3d7de" /><stop offset=".22" stopColor="#f7f8fa" /><stop offset=".5" stopColor="#ffffff" /><stop offset=".8" stopColor="#eceef2" /><stop offset="1" stopColor="#c9ced6" />
        </linearGradient>
        <linearGradient id="kw-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#6f757e" /><stop offset=".3" stopColor="#c9cdd3" /><stop offset=".48" stopColor="#f4f5f7" /><stop offset=".7" stopColor="#a9aeb6" /><stop offset="1" stopColor="#626872" />
        </linearGradient>
        <linearGradient id="kw-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#e2c08a" /><stop offset=".5" stopColor="#f6dfb6" /><stop offset="1" stopColor="#d9b47b" />
        </linearGradient>
        <linearGradient id="kw-eraser" x1="0" x2="1">
          <stop offset="0" stopColor="#e07f84" /><stop offset=".4" stopColor="#f6b9bb" /><stop offset="1" stopColor="#d6747a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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
      <Defs />
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
          <svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true"><g fill="#9aa1ad"><circle cx="3" cy="4" r="1.6" /><circle cx="9" cy="4" r="1.6" /><circle cx="3" cy="10" r="1.6" /><circle cx="9" cy="10" r="1.6" /><circle cx="3" cy="16" r="1.6" /><circle cx="9" cy="16" r="1.6" /></g></svg>
        </button>
        <div className="ib-undo">
          <button type="button" onClick={() => ink.current?.undo()} aria-label="Deshacer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></svg>
          </button>
          <button type="button" onClick={() => ink.current?.redo()} aria-label="Rehacer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 000 12h3" /></svg>
          </button>
        </div>
        <div className="ib-pens">
          {t.pens.map((x) => (
            <button key={x} type="button" className="ib-pen" aria-pressed={t.tool === x} aria-label={NAMES[x]} title={NAMES[x]} onClick={() => pickTool(x)}>
              <svg viewBox="0 0 44 100" width="44" height="100"><PenArt t={x} color={x === "erase" || x === "lasso" ? "#000" : t.colorOf(x as Inked)} /></svg>
            </button>
          ))}
        </div>
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
