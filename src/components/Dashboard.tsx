"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIAG_KEY, diagResult, type DiagState } from "@/lib/diag";
import { MODE_LABEL } from "@/lib/device";
import { topicById } from "@/lib/generators";
import { fmtDate, listNotes, listSets, newNote, newSet, type Note, type PracticeSet } from "@/lib/notes";
import { UNIT_NAME } from "@/lib/scoring";
import { getSession, seedDemo, type Session } from "@/lib/session";
import { listMocks, type Mock } from "@/lib/mocks";
import { store } from "@/lib/storage";
import { EnergyLevels } from "./Brand";
import { useDevice } from "./Device";

export function setScore(s: PracticeSet) {
  let got = 0, max = 0;
  for (const a of Object.values(s.awarded)) for (const p of a) for (const x of p) { max++; if (x === true) got++; }
  return { got, max, done: Object.keys(s.done).length };
}

export default function Dashboard() {
  const router = useRouter();
  const { mode } = useDevice();
  const [d, setD] = useState<{ s: Session | null; diag: DiagState | null; notes: Note[]; sets: PracticeSet[]; mocks: Mock[] } | null>(null);

  const load = () => setD({ s: getSession(), diag: store.get<DiagState | null>(DIAG_KEY, null), notes: listNotes(), sets: listSets(), mocks: listMocks() });
  useEffect(load, []);
  if (!d) return null;

  const res = d.diag && d.diag.stage === "results" ? diagResult(d.diag) : null;

  return (
    <div className="wrap diag">
      <div className="step-head">
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)" }}>Hola, {d.s?.name.split(" ")[0] ?? "alumno"}</h1>
        {mode && <span className="pill">{MODE_LABEL[mode]}</span>}
      </div>

      <NextStep d={d} res={!!res} onNote={() => { const n = newNote(); router.push(`/app/notas?id=${n.id}`); }}
        onPractice={() => {
          const n = d.notes.find((x) => x.concepts.length);
          if (!n) { router.push("/app/practica"); return; }
          const st = newSet({ title: `Ejercicios · ${n.title || topicById(n.topic)?.name}`, topic: n.topic, concepts: n.concepts, noteId: n.id });
          router.push(`/app/practica?set=${st.id}`);
        }} />

      <div className="dash">
        <div className="card">
          <span className="eyebrow">Nota proyectada</span>
          {res ? (
            <>
              <span className="grade" style={{ fontSize: "3.4rem" }}>{res.grade}<small> / 7</small></span>
              <EnergyLevels grade={res.grade} />
              <Link className="btn sm" href="/diagnostico">Ver diagnóstico</Link>
            </>
          ) : (
            <>
              <p className="muted">Haz el diagnóstico para saber en qué nivel estás.</p>
              <Link className="btn primary" href="/diagnostico">Hacer diagnóstico</Link>
            </>
          )}
        </div>

        <div className="card">
          <span className="eyebrow">Tu plan</span>
          {res ? (
            <ul className="plan">
              {res.weeks.slice(0, 3).map((b) => (
                <li key={b.unit}><span className="wk">Sem. {b.weeks[0]}{b.weeks[1] !== b.weeks[0] ? `–${b.weeks[1]}` : ""}</span><span><b>{b.unit}</b> · {UNIT_NAME[b.unit]}</span></li>
              ))}
            </ul>
          ) : <p className="muted">Aparece después del diagnóstico.</p>}
        </div>

        <div className="card">
          <div className="step-head"><span className="eyebrow">Notas de clase</span><Link href="/app/notas" className="muted" style={{ fontSize: ".85rem" }}>Ver todas</Link></div>
          {d.notes.slice(0, 3).map((n) => (
            <Link key={n.id} href={`/app/notas?id=${n.id}`} className="row-link">
              <b>{n.title || "Sin título"}</b>
              <span className="muted">{topicById(n.topic)?.name} · {fmtDate(n.date)}</span>
            </Link>
          ))}
          {!d.notes.length && <p className="muted">Toma notas de tu clase en la plantilla y Kwanta te arma ejercicios de lo que viste.</p>}
          <button className="btn primary" type="button" onClick={() => { const n = newNote(); router.push(`/app/notas?id=${n.id}`); }}>Nueva nota de clase</button>
        </div>

        <div className="card">
          <div className="step-head"><span className="eyebrow">Práctica</span><Link href="/app/practica" className="muted" style={{ fontSize: ".85rem" }}>Ver todo</Link></div>
          {d.sets.slice(0, 3).map((s) => {
            const sc = setScore(s);
            return (
              <Link key={s.id} href={`/app/practica?set=${s.id}`} className="row-link">
                <b>{s.title}</b>
                <span className="muted">{sc.done}/{s.n} ejercicios · {sc.got}/{sc.max || "—"} marcas</span>
              </Link>
            );
          })}
          {!d.sets.length && <p className="muted">Todavía no tienes ejercicios. Créalos desde una nota o elige un tema.</p>}
          <Link className="btn" href="/app/practica">Practicar un tema</Link>
        </div>
      </div>

      {d.s?.demo && (
        <div className="callout">
          <b>Estás en la cuenta demo</b>
          <span>Los datos se guardan solo en este navegador. Puedes volver a los datos de ejemplo cuando quieras.</span>
          <div><button className="btn sm" type="button" onClick={() => { seedDemo(true); store.del("kw-sets"); load(); }}>Restablecer datos de ejemplo</button></div>
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { k: "diag", n: "Diagnóstico", t: "Haz tu diagnóstico", d: "15 minutos. Te ubica en un nivel del 1 al 7 y arma tu plan de 12 semanas.", cta: "Empezar diagnóstico" },
  { k: "notes", n: "Notas de clase", t: "Toma notas de tu próxima clase", d: "Usa la plantilla de Kwanta en clase y marca qué vieron. Con eso te armamos ejercicios.", cta: "Nueva nota de clase" },
  { k: "practice", n: "Ejercicios", t: "Practica lo que viste en clase", d: "4 hojas de examen sobre los temas de tu nota, con números nuevos y solución paso a paso.", cta: "Crear ejercicios de mi nota" },
  { k: "mock", n: "Mock", t: "Haz un mock de Prueba 2", d: "Tiempo real, sin pistas. Al final ves tu nota estimada.", cta: "Empezar mock" },
] as const;

function NextStep({ d, res, onNote, onPractice }: { d: { notes: Note[]; sets: PracticeSet[]; mocks: Mock[] }; res: boolean; onNote: () => void; onPractice: () => void }) {
  const done = {
    diag: res,
    notes: d.notes.some((n) => n.concepts.length > 0),
    practice: d.sets.some((s) => Object.keys(s.done).length > 0),
    mock: d.mocks.some((m) => m.phase === "done"),
  };
  const i = STEPS.findIndex((s) => !done[s.k]);
  const step = i >= 0 ? STEPS[i] : null;
  const action = () => {
    if (!step) return;
    if (step.k === "notes") onNote();
    else if (step.k === "practice") onPractice();
  };
  const href = step?.k === "diag" ? "/diagnostico" : step?.k === "mock" ? "/app/mock" : null;
  return (
    <section className="nextstep" aria-label="Tu siguiente paso">
      <ol className="stepper">
        {STEPS.map((s, j) => (
          <li key={s.k} className={done[s.k] ? "ok" : j === i ? "cur" : ""}>
            <span className="dotn">{done[s.k] ? "✓" : j + 1}</span><span>{s.n}</span>
          </li>
        ))}
      </ol>
      {step ? (
        <div className="ns-body">
          <span className="eyebrow">Tu siguiente paso · {i + 1} de {STEPS.length}</span>
          <h2>{step.t}</h2>
          <p className="muted">{step.d}</p>
          {href ? <Link className="btn primary" href={href}>{step.cta} →</Link> : <button className="btn primary" type="button" onClick={action}>{step.cta} →</button>}
        </div>
      ) : (
        <div className="ns-body">
          <span className="eyebrow">Vas al día</span>
          <h2>Repite el ciclo cada semana</h2>
          <p className="muted">Notas de cada clase → ejercicios de esa clase → un mock cada dos semanas.</p>
          <button className="btn primary" type="button" onClick={onNote}>Nueva nota de clase →</button>
        </div>
      )}
    </section>
  );
}
