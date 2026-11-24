"use client";
/**
 * iPad writing palette, in the style of the notes apps students already use:
 * a floating pill at the bottom with drawn pens that rise when selected, three
 * quick colors, and a panel (tap the active pen or "más") for thickness, all
 * colors, finger drawing and clearing the sheet. Each pen remembers its own
 * color and thickness.
 */
import { useEffect, useState, type RefObject } from "react";
import { store } from "@/lib/storage";
import type { InkHandle, Pen, Tool } from "./InkLayer";

export const PEN_COLORS = [
  { c: "#121417", n: "Negro" }, { c: "#e5484d", n: "Rojo" }, { c: "#2f3fd8", n: "Azul" },
  { c: "#15803d", n: "Verde" }, { c: "#7c3aed", n: "Morado" }, { c: "#ea580c", n: "Naranja" },
  { c: "#6b7280", n: "Gris" }, { c: "#8b5a2b", n: "Café" },
];
export const HL_COLORS = [
  { c: "#fde047", n: "Amarillo" }, { c: "#86efac", n: "Verde" }, { c: "#f9a8d4", n: "Rosa" }, { c: "#93c5fd", n: "Azul" }, { c: "#fdba74", n: "Naranja" },
];
const SIZES: Record<Pen | "hl", number[]> = {
  fountain: [2.4, 3.6, 5.4],
  ball: [2.0, 3.0, 4.4],
  pencil: [2.2, 3.2, 4.8],
  marker: [3.2, 4.8, 7.2],
  hl: [14, 20, 28],
};
type Inked = Pen | "hl";
const NAMES: Record<Tool, string> = {
  fountain: "Pluma estilográfica", ball: "Bolígrafo", pencil: "Lápiz", marker: "Plumón", hl: "Resaltador", erase: "Borrador", lasso: "Lazo",
};

interface Saved { tool: Tool; last: Inked; finger: boolean; set: Record<Inked, { c: string; i: number }> }
const DEFAULTS: Saved = {
  tool: "fountain", last: "fountain", finger: false,
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
  selected: number; setSelected: (n: number) => void;
  /** what to pass to InkLayer */
  color: string; size: number;
}

export function useInkTools(): InkTools {
  const [s, set] = useState<Saved>(DEFAULTS);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const saved = store.get<Partial<Saved>>("kw-ink-tools-v2", {});
    set((p) => ({ ...p, ...saved, set: { ...p.set, ...(saved.set ?? {}) } }));
  }, []);
  const up = (f: (p: Saved) => Saved) => set((p) => { const n = f(p); store.set("kw-ink-tools-v2", n); return n; });
  const inked: Inked = s.tool === "erase" || s.tool === "lasso" ? s.last : s.tool;
  const conf = s.set[inked];
  return {
    tool: s.tool, inked, selected, setSelected,
    setTool: (tool) => up((p) => ({ ...p, tool, last: tool === "erase" || tool === "lasso" ? p.last : tool })),
    colorOf: (t) => s.set[t].c,
    setColor: (c) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], c } } })),
    sizeIdx: conf.i,
    setSizeIdx: (i) => up((p) => ({ ...p, set: { ...p.set, [inked]: { ...p.set[inked], i } } })),
    finger: s.finger, setFinger: (finger) => up((p) => ({ ...p, finger })),
    color: conf.c,
    size: SIZES[inked][conf.i] ?? SIZES[inked][1],
  };
}

/* ---------- drawn pens (44 × 100, the bottom is hidden by the pill) ---------- */
function PenArt({ t, color }: { t: Tool; color: string }) {
  const barrel = (
    <>
      <rect x="11" y="36" width="22" height="70" rx="3" fill="url(#kw-barrel)" />
    </>
  );
  switch (t) {
    case "fountain":
      return (<>{barrel}
        <path d="M13 37 L22 6 L31 37 Z" fill="url(#kw-metal)" />
        <path d="M22 11 L22 27" stroke="#3a3f47" strokeWidth="1.1" />
        <circle cx="22" cy="27" r="1.6" fill="#3a3f47" />
        <rect x="11" y="44" width="22" height="4" fill={color} />
      </>);
    case "ball":
      return (<>{barrel}
        <path d="M13 37 L22 12 L31 37 Z" fill="url(#kw-barrel)" stroke="#d5d8de" strokeWidth=".6" />
        <path d="M19.5 18 L22 9 L24.5 18 Z" fill={color} />
        <rect x="11" y="46" width="22" height="4" fill={color} />
      </>);
    case "pencil":
      return (<>{barrel}
        <path d="M11 37 L22 10 L33 37 Z" fill="#f3dcb2" />
        <path d="M18.3 19 L22 10 L25.7 19 Z" fill={color} />
        <path d="M11 37 L14.5 35.5 L18 37 L21.5 35.5 L25 37 L28.5 35.5 L33 37" fill="none" stroke="#e2c48f" strokeWidth=".8" />
        <rect x="11" y="44" width="22" height="2.5" fill={color} /><rect x="11" y="48" width="22" height="2.5" fill={color} />
      </>);
    case "marker":
      return (<>{barrel}
        <rect x="17" y="18" width="10" height="20" rx="2" fill="url(#kw-barrel)" stroke="#d5d8de" strokeWidth=".6" />
        <rect x="19.5" y="9" width="5" height="11" rx="2.4" fill={color} />
        <path d="M11 45 h4 M17 45 h4 M23 45 h4 M29 45 h4" stroke={color} strokeWidth="3" />
      </>);
    case "hl":
      return (<>{barrel}
        <path d="M13 37 L13 24 L31 15 L31 37 Z" fill="url(#kw-barrel)" stroke="#d5d8de" strokeWidth=".6" />
        <path d="M16 24 L16 18 L28 12 L28 19 Z" fill={color} />
        <rect x="11" y="44" width="22" height="7" fill={color} />
      </>);
    case "erase":
      return (<>{barrel}
        <rect x="11" y="10" width="22" height="30" rx="7" fill="url(#kw-eraser)" />
      </>);
    case "lasso":
      return (<>{barrel}
        <ellipse cx="22" cy="19" rx="10" ry="8" fill="none" stroke="#2347d9" strokeWidth="2" strokeDasharray="3 2.5" />
        <path d="M17 26 C 14 32, 18 34, 22 37" fill="none" stroke="#2347d9" strokeWidth="2" />
      </>);
  }
}

function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="kw-barrel" x1="0" x2="1">
          <stop offset="0" stopColor="#dfe2e7" /><stop offset=".35" stopColor="#ffffff" /><stop offset=".7" stopColor="#f4f5f7" /><stop offset="1" stopColor="#d6d9df" />
        </linearGradient>
        <linearGradient id="kw-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#8d939c" /><stop offset=".45" stopColor="#e6e8eb" /><stop offset="1" stopColor="#7d838c" />
        </linearGradient>
        <linearGradient id="kw-eraser" x1="0" x2="1">
          <stop offset="0" stopColor="#e88e8e" /><stop offset=".45" stopColor="#f7c1c1" /><stop offset="1" stopColor="#de7f7f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const PEN_TOOLS: Tool[] = ["fountain", "ball", "pencil", "marker", "hl", "erase", "lasso"];

export function InkToolbar({ t, ink, onClear }: { t: InkTools; ink: RefObject<InkHandle | null>; onClear?: () => void }) {
  const [panel, setPanel] = useState(false);
  const isHl = t.inked === "hl";
  const palette = isHl ? HL_COLORS : PEN_COLORS;
  const quick = palette.slice(0, 3);

  useEffect(() => {
    document.body.classList.add("has-inkbar");
    return () => document.body.classList.remove("has-inkbar");
  }, []);

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

  return (
    <>
      <Defs />
      {panel && (
        <div className="inkpanel" role="dialog" aria-label={`Opciones de ${NAMES[t.inked]}`}>
          <div className="ip-row">
            <span className="ip-lab">{NAMES[t.inked]} · grosor</span>
            <div className="ip-sizes">
              {SIZES[t.inked].map((s, i) => (
                <button key={i} type="button" aria-pressed={t.sizeIdx === i} aria-label={["Fino", "Medio", "Grueso"][i]} onClick={() => t.setSizeIdx(i)}>
                  <span style={{ height: Math.max(2, isHl ? s / 2.2 : s * 1.5), background: t.color, opacity: isHl ? 0.6 : 1 }} />
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
          <div className="ip-row ip-actions">
            <button type="button" className="btn sm ghost" aria-pressed={t.finger} onClick={() => t.setFinger(!t.finger)}>{t.finger ? "Dedo: escribe" : "Dedo: desplaza"}</button>
            <button type="button" className="btn sm ghost" onClick={() => { (onClear ? onClear() : ink.current?.clear()); setPanel(false); }}>Borrar hoja</button>
            <button type="button" className="btn sm" onClick={() => setPanel(false)}>Listo</button>
          </div>
        </div>
      )}
      {t.tool === "lasso" && (
        <div className="inkhint">{t.selected ? `${t.selected} trazos seleccionados: arrástralos o toca un color` : "Rodea trazos con el lápiz para seleccionarlos"}</div>
      )}
      <div className="inkbar" role="toolbar" aria-label="Herramientas de escritura">
        <div className="ib-undo">
          <button type="button" onClick={() => ink.current?.undo()} aria-label="Deshacer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></svg>
          </button>
          <button type="button" onClick={() => ink.current?.redo()} aria-label="Rehacer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 000 12h3" /></svg>
          </button>
        </div>
        <div className="ib-pens">
          {PEN_TOOLS.map((x) => (
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
    </>
  );
}
