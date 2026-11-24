"use client";
/**
 * The free diagnostic: 10 multiple-choice questions (every device) and
 * 3 exam sheets (iPad by hand, computer by typing; skipped on the phone).
 * Progress lives in this browser only (no account in the MVP).
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { LETTERS, MCQS, SHEETS, SHEET_MAX } from "@/lib/content";
import { share, UNIT_NAME, UNITS, type Unit } from "@/lib/scoring";
import { DIAG_KEY, diagResult, freshDiag, type DiagState } from "@/lib/diag";
import { store } from "@/lib/storage";
import { MODE_LABEL } from "@/lib/device";
import { useDevice } from "./Device";
import { EnergyLevels } from "./Brand";
import SheetStep from "./SheetStep";
import LeadForm from "./LeadForm";

type State = DiagState;
const KEY = DIAG_KEY;
const fresh = freshDiag;

const UCOL: Record<Unit, string> = { A: "var(--uA)", B: "var(--uB)", C: "var(--uC)", D: "var(--uD)", E: "var(--uE)" };
const PREVENTA = process.env.NEXT_PUBLIC_PREVENTA_URL;

export default function Diagnostico() {
  const { mode } = useDevice();
  const [s, setS] = useState<State | null>(null);

  useEffect(() => {
    const saved = store.get<State | null>(KEY, null);
    setS(saved && saved.v === 1 ? saved : fresh());
  }, []);

  useEffect(() => {
    if (s) store.set(KEY, s);
  }, [s]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s?.stage, s?.mcq, s?.sheet]);

  if (!s || !mode) return <div className="diag wrap"><p className="muted">Cargando…</p></div>;

  const up = (patch: Partial<State>) => setS((prev) => ({ ...(prev as State), ...patch }));
  const restart = () => {
    SHEETS.forEach((sh) => store.del(`kw-ink-${sh.id}`));
    setS(fresh());
  };
  const started = Object.keys(s.answers).length > 0;

  /* ---------- intro ---------- */
  if (s.stage === "intro") {
    return (
      <div className="diag wrap" style={{ maxWidth: 820 }}>
        <p className="eyebrow">Diagnóstico gratis · Física IB</p>
        <h1 style={{ fontSize: "clamp(1.9rem,5vw,2.8rem)" }}>¿Cuánta física sabes?</h1>
        <p className="muted" style={{ fontSize: "1.08rem" }}>
          15 minutos. 10 preguntas de opción múltiple, como en la Prueba 1A, y 3 preguntas de desarrollo en hoja de examen, como en la Prueba 2.
          Al final ves tu nota proyectada, qué temas te cuestan y un plan de 12 semanas.
        </p>
        <div className="callout">
          <b>Estás en {MODE_LABEL[mode]}</b>
          {mode === "ipad" && <span>Las preguntas de desarrollo se escriben a mano con el Apple Pencil, sobre la hoja de examen.</span>}
          {mode === "computadora" && <span>Las preguntas de desarrollo se escriben renglón por renglón con el teclado, sobre la hoja de examen.</span>}
          {mode === "telefono" && <span>En el teléfono haces la parte de opción múltiple. Las preguntas de desarrollo se hacen en iPad (a mano) o en computadora (tecleando).</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="muted">Nivel:</span>
          {(["NM", "NS"] as const).map((l) => (
            <button key={l} type="button" className="btn sm" aria-pressed={s.level === l} style={s.level === l ? { borderColor: "var(--vec)", background: "var(--vec-soft)" } : undefined} onClick={() => up({ level: l })}>
              {l === "NM" ? "Nivel Medio (NM)" : "Nivel Superior (NS)"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {started ? (
            <>
              <button className="btn primary" type="button" onClick={() => up({ stage: s.mcq >= MCQS.length ? "sheets" : "mcq" })}>Continuar donde me quedé</button>
              <button className="btn" type="button" onClick={restart}>Empezar de nuevo</button>
            </>
          ) : (
            <button className="btn primary" type="button" onClick={() => up({ stage: "mcq" })}>Empezar diagnóstico</button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- multiple choice ---------- */
  if (s.stage === "mcq") {
    const q = MCQS[s.mcq];
    const chosen = s.answers[q.id];
    const checked = !!s.checked[q.id];
    const last = s.mcq === MCQS.length - 1;
    return (
      <div className="diag wrap">
        <div className="mcq">
          <div className="progress" aria-hidden="true">
            {MCQS.map((m, i) => <i key={m.id} className={i < s.mcq ? "done" : i === s.mcq ? "cur" : ""} />)}
          </div>
          <div className="step-head">
            <span className="eyebrow">Opción múltiple · {s.mcq + 1} de {MCQS.length}</span>
            <span className="muted mono" style={{ fontSize: ".8rem" }}>{q.topic}</span>
          </div>
          <p className="q">{q.q}</p>
          <div className="opts" role="radiogroup" aria-label="Opciones">
            {q.options.map((o, i) => {
              let cls = "opt";
              if (checked && i === q.answer) cls += " right";
              else if (checked && i === chosen) cls += " wrong";
              return (
                <button key={i} type="button" role="radio" aria-checked={chosen === i} aria-pressed={chosen === i} className={cls} disabled={checked}
                  onClick={() => up({ answers: { ...s.answers, [q.id]: i } })}>
                  <span className="l">{LETTERS[i]}</span><span>{o}</span>
                </button>
              );
            })}
          </div>
          {checked && (
            <div className={"why" + (chosen === q.answer ? "" : " no")}>
              <b>{chosen === q.answer ? "Correcto." : `La respuesta es ${LETTERS[q.answer]}.`}</b> {q.why}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
            <button className="btn ghost" type="button" disabled={s.mcq === 0} onClick={() => up({ mcq: s.mcq - 1 })}>Anterior</button>
            {!checked ? (
              <button className="btn primary" type="button" disabled={chosen === undefined} onClick={() => up({ checked: { ...s.checked, [q.id]: true } })}>Comprobar</button>
            ) : (
              <button className="btn primary" type="button" onClick={() => (last ? up({ stage: "sheets", mcq: MCQS.length }) : up({ mcq: s.mcq + 1 }))}>
                {last ? "Ir a las preguntas de desarrollo" : "Siguiente"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- sheets intro ---------- */
  if (s.stage === "sheets") {
    return (
      <div className="diag wrap" style={{ maxWidth: 820 }}>
        <p className="eyebrow">Parte 2 · Preguntas de desarrollo</p>
        <h2>3 preguntas en hoja de examen</h2>
        {mode === "telefono" ? (
          <>
            <div className="callout">
              <b>Esta parte se hace en iPad o computadora</b>
              <span>En el teléfono, Kwanta es para repasar rápido, ver tus correcciones y tu progreso. Las preguntas de desarrollo necesitan la hoja completa: a mano en iPad o tecleando en computadora.</span>
              <span className="muted" style={{ fontSize: ".88rem" }}>Tus respuestas de opción múltiple se guardan en este teléfono. Sin cuenta todavía, no pasan solas a otro dispositivo.</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn primary" type="button" onClick={() => up({ stage: "results" })}>Ver mi resultado con opción múltiple</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted" style={{ fontSize: "1.05rem" }}>
              {mode === "ipad"
                ? "Escribe con el Apple Pencil dentro de cada recuadro, como en el examen. Al terminar ves el esquema de marcas punto por punto."
                : "Escribe un paso por renglón dentro de cada recuadro. Al terminar, Kwanta revisa cada renglón y deja las marcas en el margen, como un examinador."}
            </p>
            <div className="grid3">
              {SHEETS.map((sh) => (
                <div key={sh.id} className="card">
                  <span className="pill">{sh.topic}</span>
                  <span className="muted">{sh.paper} · {SHEET_MAX(sh)} marcas</span>
                  {s.done[sh.id] && <span className="pill ok">Hecha</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn primary" type="button" onClick={() => up({ stage: "sheet", sheet: Math.min(s.sheet, SHEETS.length - 1) })}>
                {Object.keys(s.done).length ? "Continuar" : "Empezar hoja 1"}
              </button>
              <button className="btn ghost" type="button" onClick={() => up({ stage: "results" })}>Saltar y ver resultado</button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ---------- one sheet ---------- */
  if (s.stage === "sheet" && mode !== "telefono") {
    const sh = SHEETS[s.sheet];
    const last = s.sheet === SHEETS.length - 1;
    return (
      <div className="diag wrap">
        <div className="step-head">
          <span className="eyebrow">Hoja {s.sheet + 1} de {SHEETS.length} · {sh.topic}</span>
          <button className="btn ghost sm" type="button" onClick={() => up({ stage: "sheets" })}>Volver</button>
        </div>
        <SheetStep
          key={sh.id + mode}
          sheet={sh}
          mode={mode}
          typed={s.typed[sh.id] ?? sh.parts.map((p) => Array(p.rows).fill(""))}
          onTyped={(t) => setS((prev) => ({ ...(prev as State), typed: { ...(prev as State).typed, [sh.id]: t } }))}
          awarded={s.awarded[sh.id]}
          onAwarded={(a) => setS((prev) => ({ ...(prev as State), awarded: { ...(prev as State).awarded, [sh.id]: a } }))}
          marked={!!s.marked[sh.id]}
          onMarked={(m) => setS((prev) => ({ ...(prev as State), marked: { ...(prev as State).marked, [sh.id]: m } }))}
          nextLabel={last ? "Ver mi resultado" : "Siguiente hoja"}
          onNext={() => setS((prev) => {
            const p = prev as State;
            const done = p.marked[sh.id] ? { ...p.done, [sh.id]: true } : p.done;
            return last ? { ...p, done, stage: "results" } : { ...p, done, sheet: p.sheet + 1 };
          })}
        />
      </div>
    );
  }

  /* ---------- results ---------- */
  const wrong = MCQS.filter((q) => s.answers[q.id] !== undefined && s.answers[q.id] !== q.answer);
  const { tally, sheetsDone, earned, possible, grade, weeks } = diagResult(s);

  return (
    <div className="diag wrap res">
      <p className="eyebrow">Tu diagnóstico · Física IB {s.level}</p>
      <div className="res-top">
        <div style={{ display: "grid", gap: 10 }}>
          <span className="muted">Nota proyectada hoy</span>
          <span className="grade">{grade}<small> / 7</small></span>
          <span className="muted">{earned} de {possible} marcas · {Math.round((earned / Math.max(1, possible)) * 100)}%</span>
          {sheetsDone === 0 && <span className="pill sig">Solo opción múltiple: menos preciso</span>}
          <p style={{ maxWidth: "48ch" }}>
            {grade >= 7 ? "Ya estás en el nivel 7. El reto es mantenerlo en todas las unidades y bajo tiempo de examen." : `Tu meta es el nivel 7. Para llegar, el plan empieza por ${UNIT_NAME[weeks[0].unit].toLowerCase()}.`}
          </p>
        </div>
        <div className="card"><EnergyLevels grade={grade} /></div>
      </div>

      <div className="card">
        <h3>Por unidad</h3>
        <div className="bars">
          {UNITS.map((u) => {
            const t = tally[u];
            const pct = Math.round(share(t) * 100);
            return (
              <div className="bar" key={u}>
                <div className="row"><span><b>{u}</b> · {UNIT_NAME[u]}</span><span className="mono">{t.possible ? `${t.earned}/${t.possible} · ${pct}%` : "sin datos"}</span></div>
                <div className="track"><i style={{ width: `${t.possible ? pct : 0}%`, background: UCOL[u] }} /></div>
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ fontSize: ".84rem" }}>La nota usa fronteras aproximadas: las reales cambian en cada convocatoria. Con 24 marcas es una estimación, no una predicción.</p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <h3>Tu plan de 12 semanas</h3>
        <ul className="plan">
          {weeks.map((b) => (
            <li key={b.unit}>
              <span className="wk">Semana{b.weeks[0] === b.weeks[1] ? ` ${b.weeks[0]}` : `s ${b.weeks[0]}–${b.weeks[1]}`}</span>
              <span><b>{b.unit}</b> · {UNIT_NAME[b.unit]} <span className="muted">({Math.round(share(tally[b.unit]) * 100)}% hoy)</span></span>
            </li>
          ))}
          <li><span className="wk">Semanas 11–12</span><span><b>Mocks</b> · Prueba 1 y Prueba 2 completas con tiempo</span></li>
        </ul>
      </div>

      {wrong.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <h3>Lo que te costó</h3>
          {wrong.map((q) => (
            <div key={q.id} className="why no"><b>{q.topic}.</b> {q.why}</div>
          ))}
        </div>
      )}

      <LeadForm result={{
        nivel: s.level,
        dispositivo: MODE_LABEL[mode],
        nota: String(grade),
        marcas: `${earned}/${possible}`,
        porcentaje: `${Math.round((earned / Math.max(1, possible)) * 100)}%`,
        A: tally.A.possible ? `${Math.round(share(tally.A) * 100)}%` : "",
        B: tally.B.possible ? `${Math.round(share(tally.B) * 100)}%` : "",
        C: tally.C.possible ? `${Math.round(share(tally.C) * 100)}%` : "",
        D: tally.D.possible ? `${Math.round(share(tally.D) * 100)}%` : "",
        E: tally.E.possible ? `${Math.round(share(tally.E) * 100)}%` : "",
        hojas: `${sheetsDone}/${SHEETS.length}`,
      }} />

      <div className="callout" style={{ borderLeftColor: "var(--vec)" }}>
        <b>Sprint al 7 · cohorte de febrero</b>
        <span>12 semanas con hojas de examen corregidas, una clase semanal en vivo con un coach que sacó 7 y 4 mocks corregidos sobre tu hoja. Cupo de 25. Los primeros lugares tienen precio de fundador.</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          {PREVENTA ? (
            <a className="btn sig" href={PREVENTA} target="_blank" rel="noopener">Apartar lugar de fundador · pagar con Mercado Pago</a>
          ) : (
            <button className="btn sig" type="button" disabled>Preventa: abre pronto</button>
          )}
          <button className="btn" type="button" onClick={restart}>Repetir diagnóstico</button>
          <Link className="btn ghost" href="/">Inicio</Link>
        </div>
      </div>
    </div>
  );
}
