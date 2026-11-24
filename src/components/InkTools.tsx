"use client";
/** iPad writing toolbar shared by exam sheets and class notes. */
import { useEffect, useState, type RefObject } from "react";
import { store } from "@/lib/storage";
import type { InkHandle, Tool } from "./InkLayer";

export const PEN_COLORS = [
  { c: "#16181d", n: "Negro" }, { c: "#1d4ed8", n: "Azul" }, { c: "#c81e1e", n: "Rojo" }, { c: "#15803d", n: "Verde" },
  { c: "#7c3aed", n: "Morado" }, { c: "#ea580c", n: "Naranja" }, { c: "#6b7280", n: "Gris" }, { c: "#8b5a2b", n: "Café" },
];
export const HL_COLORS = [
  { c: "#facc15", n: "Amarillo" }, { c: "#4ade80", n: "Verde" }, { c: "#f472b6", n: "Rosa" }, { c: "#60a5fa", n: "Azul" }, { c: "#fb923c", n: "Naranja" },
];
const PEN_SIZES = [2.2, 3.4, 5.4];
const HL_SIZES = [12, 18, 26];

export interface InkTools {
  tool: Tool; setTool: (t: Tool) => void;
  pen: string; setPen: (c: string) => void;
  hl: string; setHl: (c: string) => void;
  sizeIdx: number; setSizeIdx: (i: number) => void;
  finger: boolean; setFinger: (f: boolean) => void;
  selected: number; setSelected: (n: number) => void;
  /** what to pass to InkLayer */
  color: string; size: number;
}

export function useInkTools(): InkTools {
  const [s, set] = useState({ tool: "pen" as Tool, pen: PEN_COLORS[1].c, hl: HL_COLORS[0].c, sizeIdx: 1, finger: false });
  const [selected, setSelected] = useState(0);
  useEffect(() => { set((p) => ({ ...p, ...store.get("kw-ink-tools", {}) })); }, []);
  const up = (patch: Partial<typeof s>) => set((p) => { const n = { ...p, ...patch }; store.set("kw-ink-tools", n); return n; });
  const isHl = s.tool === "hl";
  return {
    ...s, selected, setSelected,
    setTool: (tool) => up({ tool }),
    setPen: (pen) => up({ pen }),
    setHl: (hl) => up({ hl }),
    setSizeIdx: (sizeIdx) => up({ sizeIdx }),
    setFinger: (finger) => up({ finger }),
    color: isHl ? s.hl : s.pen,
    size: (isHl ? HL_SIZES : PEN_SIZES)[s.sizeIdx] ?? PEN_SIZES[1],
  };
}

const I = {
  pen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /><path d="M14 6l3 3" /></svg>,
  hl: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5l5 5-8 8H6.5v-5z" /><path d="M4 21h7" stroke="#facc15" strokeWidth="3.2" /></svg>,
  erase: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 19.5l-4-4a1.6 1.6 0 010-2.2l8.3-8.3a1.6 1.6 0 012.2 0l4.5 4.5a1.6 1.6 0 010 2.2l-7.8 7.8H8.5z" /><path d="M11 19.5h9" /></svg>,
  lasso: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2.5"><path d="M12 4c5 0 8 2.5 8 5.5S16.5 15 12 15s-8-2.5-8-5.5S7 4 12 4z" /><path d="M8 14.5c-1 2-1 4 1 5.5" strokeDasharray="0" /></svg>,
  undo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></svg>,
  redo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 000 12h3" /></svg>,
};

export function InkToolbar({ t, ink, onClear }: { t: InkTools; ink: RefObject<InkHandle | null>; onClear?: () => void }) {
  const palette = t.tool === "hl" ? HL_COLORS : PEN_COLORS;
  const current = t.tool === "hl" ? t.hl : t.pen;
  const pickColor = (c: string) => {
    const hl = t.tool === "hl";
    // with a lasso selection, the color recolors the selected strokes
    if (t.tool === "lasso" && t.selected && ink.current?.recolor(c, false)) return;
    if (hl) t.setHl(c); else { t.setPen(c); if (t.tool !== "pen") t.setTool("pen"); }
  };
  const sizes = t.tool === "hl" ? HL_SIZES : PEN_SIZES;
  return (
    <div className="toolbar ink" role="toolbar" aria-label="Herramientas de escritura">
      <div className="tgroup">
        <button className="tool" type="button" aria-pressed={t.tool === "pen"} onClick={() => t.setTool("pen")} aria-label="Pluma" title="Pluma">{I.pen}</button>
        <button className="tool" type="button" aria-pressed={t.tool === "hl"} onClick={() => t.setTool("hl")} aria-label="Resaltador" title="Resaltador (queda debajo de la tinta)">{I.hl}</button>
        <button className="tool" type="button" aria-pressed={t.tool === "erase"} onClick={() => t.setTool("erase")} aria-label="Borrador" title="Borrador">{I.erase}</button>
        <button className="tool" type="button" aria-pressed={t.tool === "lasso"} onClick={() => t.setTool("lasso")} aria-label="Lazo: seleccionar y arrastrar" title="Lazo: rodea trazos para moverlos">{I.lasso}</button>
      </div>
      <span className="sep" />
      <div className="tgroup colors">
        {palette.map((p) => (
          <button key={p.c} className="tool sw" type="button" aria-label={`Color ${p.n}`} title={p.n}
            aria-pressed={(t.tool === "pen" || t.tool === "hl") && current === p.c} onClick={() => pickColor(p.c)}>
            <span className="dot" style={{ background: p.c, opacity: t.tool === "hl" ? 0.75 : 1 }} />
          </button>
        ))}
      </div>
      <span className="sep" />
      <div className="tgroup">
        {sizes.map((s, i) => (
          <button key={i} className="tool" type="button" aria-label={["Fino", "Medio", "Grueso"][i]} title={["Fino", "Medio", "Grueso"][i]}
            aria-pressed={t.sizeIdx === i} onClick={() => t.setSizeIdx(i)} disabled={t.tool === "erase" || t.tool === "lasso"}>
            <span className="thick" style={{ width: 22, height: Math.max(2, Math.round((t.tool === "hl" ? s / 2.4 : s * 1.4))), background: t.tool === "hl" ? t.hl : t.pen }} />
          </button>
        ))}
      </div>
      <span className="sep" />
      <div className="tgroup">
        <button className="tool" type="button" onClick={() => ink.current?.undo()} aria-label="Deshacer" title="Deshacer">{I.undo}</button>
        <button className="tool" type="button" onClick={() => ink.current?.redo()} aria-label="Rehacer" title="Rehacer">{I.redo}</button>
      </div>
      <span className="grow" />
      <button className="btn sm ghost" type="button" aria-pressed={t.finger} onClick={() => t.setFinger(!t.finger)}>
        {t.finger ? "Dedo: escribe" : "Dedo: desplaza"}
      </button>
      <button className="btn sm ghost" type="button" onClick={() => (onClear ? onClear() : ink.current?.clear())}>Borrar hoja</button>
      {t.tool === "lasso" && <span className="hint">{t.selected ? `${t.selected} trazos seleccionados: arrástralos, o toca un color para cambiarlo` : "Rodea trazos con el lápiz para seleccionarlos"}</span>}
    </div>
  );
}
