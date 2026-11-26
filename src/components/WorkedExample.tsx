"use client";
/**
 * "Ejemplo resuelto": the first time a type of exercise comes up in practice, the student
 * first sees one solved step by step (other numbers), with what earns each mark, and then
 * does one alone. Worked examples first, then practice, is how beginners learn fastest.
 */
import ExamSheet from "./ExamSheet";
import FitPage from "./FitPage";
import type { Sheet } from "@/lib/content";
import { store } from "@/lib/storage";

const SEEN = "kw-seen-concepts";
const SKIP = "kw-skip-examples";

/** "A1.suvat" from a sheet code "KW.F.A1.SUVAT.1234". */
export const conceptKey = (sh: Sheet) => { const p = sh.code.split("."); return `${p[2]}.${(p[3] ?? "").toLowerCase()}`; };
export const needsExample = (sh: Sheet) => !store.get<boolean>(SKIP, false) && !store.get<string[]>(SEEN, []).includes(conceptKey(sh));
export const markSeen = (sh: Sheet) => store.set(SEEN, [...new Set([...store.get<string[]>(SEEN, []), conceptKey(sh)])]);

export default function WorkedExample({ example, onDone }: { example: Sheet; onDone: () => void }) {
  return (
    <div className="worked" style={{ display: "grid", gap: 14 }}>
      <div className="callout">
        <b>Primera vez con este tipo de ejercicio: así se resuelve</b>
        <span>Lee el ejemplo (con otros números) y fíjate qué gana cada marca. Después te toca a ti.</span>
      </div>
      <FitPage width={860}>
        <ExamSheet sheet={{ ...example, paper: "Ejemplo" }} variant="sample" />
      </FitPage>
      <div className="card worked-marks">
        <h3>Qué gana cada marca</h3>
        <p className="muted" style={{ margin: 0, fontSize: ".9rem" }}>M1 = método (la ecuación o el paso correcto) · A1 = respuesta (el valor con unidades) · R1 = razonamiento (la idea explicada).</p>
        {example.parts.map((p) => (
          <div key={p.label} className="wm-part">
            <b>Parte {p.label}</b>
            <ul className="wm-rules">{p.rules.map((r, i) => <li key={i}><span className={`wm-code c-${r.code}`}>{r.code}</span>{r.text}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button className="btn ghost" type="button" onClick={() => { store.set(SKIP, true); onDone(); }}>No mostrar más ejemplos</button>
        <button className="btn primary" type="button" onClick={onDone}>Ahora tú →</button>
      </div>
    </div>
  );
}
