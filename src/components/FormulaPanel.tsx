"use client";
/**
 * The data-booklet formulas for the sheet's topic, next to the exercise: the ones for
 * this kind of problem first. On wide screens a column beside the sheet; on narrow ones
 * (iPad in portrait) a panel that slides in from the right and can be closed.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { useEffect, useMemo, useState } from "react";
import { formulasFor } from "@/lib/formulas";
import { store } from "@/lib/storage";
import { Floating } from "./Camera";

const OPEN_KEY = "kw-formulas-open";

export function useWide(min = 1040) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = matchMedia(`(min-width: ${min}px)`);
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [min]);
  return wide;
}

/** Open/closed, remembered (open by default on wide screens, closed on narrow ones). */
export function useFormulasOpen(wide: boolean) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(store.get<boolean | null>(OPEN_KEY, null) ?? wide), [wide]);
  return [open, (v: boolean) => { setOpen(v); store.set(OPEN_KEY, v); }] as const;
}

export function hasFormulas(topic: string) {
  return !!formulasFor(topic);
}

/** A formula typeset with KaTeX (LaTeX), like in the booklet. */
function Tex({ tex }: { tex: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, output: "htmlAndMathml", strict: false }), [tex]);
  return <span className="tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

function List({ topic }: { topic: string }) {
  const g = formulasFor(topic);
  if (!g) return null;
  return (
    <>
      {g.key.length > 0 && (
        <div className="fm-group key">
          <span className="fm-h">Para este ejercicio</span>
          {g.key.map((x) => <div key={x.tex} className="fm"><span className="fm-f"><Tex tex={x.tex} /></span><span className="fm-n">{x.n}</span></div>)}
        </div>
      )}
      <div className="fm-group">
        <span className="fm-h">{g.key.length ? "Más del tema" : g.title}</span>
        {g.items.map((x) => <div key={x.tex} className="fm"><span className="fm-f"><Tex tex={x.tex} /></span><span className="fm-n">{x.n}</span></div>)}
      </div>
      {g.consts && (
        <div className="fm-group">
          <span className="fm-h">Constantes</span>
          {g.consts.map((c) => <span key={c.tex} className="fm-c"><Tex tex={c.tex} />{c.note && <span className="fm-n"> · {c.note}</span>}</span>)}
        </div>
      )}
    </>
  );
}

export function FormulaColumn({ topic, onClose }: { topic: string; onClose: () => void }) {
  return (
    <aside className="formulas col" aria-label="Fórmulas del cuadernillo de datos">
      <div className="fm-top"><b>Fórmulas</b><button type="button" className="fm-x" onClick={onClose} aria-label="Ocultar fórmulas">Ocultar</button></div>
      <List topic={topic} />
    </aside>
  );
}

export function FormulaDrawer({ topic, onClose }: { topic: string; onClose: () => void }) {
  return (
    <Floating>
      <aside className="formulas drawer-r" aria-label="Fórmulas del cuadernillo de datos">
        <div className="fm-top"><b>Fórmulas</b><button type="button" className="fm-x" onClick={onClose} aria-label="Cerrar fórmulas">Cerrar</button></div>
        <List topic={topic} />
      </aside>
    </Floating>
  );
}
