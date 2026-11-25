"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIAG_KEY, diagResult, type DiagState } from "@/lib/diag";
import { topicById } from "@/lib/generators";
import { fmtDate, listNotes, listSets, newNote, newSet, type Note, type PracticeSet } from "@/lib/notes";
import { UNIT_NAME } from "@/lib/scoring";
import { getSession, seedDemo, type Session } from "@/lib/session";
import { listMocks, type Mock } from "@/lib/mocks";
import { store } from "@/lib/storage";
import { EnergyLevels } from "./Brand";
import { BackupCard, InstallCard } from "./KeepData";
import Icon from "./Icon";
import type { UiIconName } from "./uiIcons";

export function setScore(s: PracticeSet) {
  let got = 0, max = 0;
  for (const a of Object.values(s.awarded)) for (const p of a) for (const x of p) { max++; if (x === true) got++; }
  return { got, max, done: Object.keys(s.done).length };
}

type Data = { s: Session | null; diag: DiagState | null; notes: Note[]; sets: PracticeSet[]; mocks: Mock[] };

/** Home: one big next step, the grade, progress at a glance, then the plan and the work.
 *  Housekeeping (install, backup, demo) goes last and quieter. */
export default function Dashboard() {
  const router = useRouter();
  const [d, setD] = useState<Data | null>(null);

  const load = () => setD({ s: getSession(), diag: store.get<DiagState | null>(DIAG_KEY, null), notes: listNotes(), sets: listSets(), mocks: listMocks() });
  useEffect(load, []);
  if (!d) return null;

  const res = d.diag && d.diag.stage === "results" ? diagResult(d.diag) : null;
  const totals = d.sets.map(setScore).reduce((a, x) => ({ got: a.got + x.got, max: a.max + x.max, done: a.done + x.done }), { got: 0, max: 0, done: 0 });
  const day = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const today = day.charAt(0).toUpperCase() + day.slice(1);
  const newNoteGo = () => { const n = newNote(); router.push(`/app/notas?id=${n.id}`); };

  return (
    <div className="wrap home">
      <header className="home-head">
        <p className="eyebrow">{today}</p>
        <h1>Hola, {d.s?.name.split(" ")[0] ?? "alumno"}</h1>
      </header>

      <div className="bento">
        <NextStep d={d} res={!!res} onNote={newNoteGo}
          onPractice={() => {
            const n = d.notes.find((x) => x.concepts.length);
            if (!n) { router.push("/app/practica"); return; }
            const st = newSet({ title: `Ejercicios · ${n.title || topicById(n.topic)?.name}`, topic: n.topic, concepts: n.concepts, noteId: n.id });
            router.push(`/app/practica?set=${st.id}`);
          }} />

        <section className="tile span-4 grade-tile" aria-label="Nota proyectada">
          <span className="eyebrow">Nota proyectada</span>
          {res ? (
            <>
              <span className="grade"><span className="limehl">{res.grade}</span><small> / 7</small></span>
              <EnergyLevels grade={res.grade} />
              <Link className="tile-link" href="/diagnostico">Ver diagnóstico <Icon name="caret" size={14} /></Link>
            </>
          ) : (
            <>
              <p className="muted">Haz el diagnóstico para saber en qué nivel estás.</p>
              <Link className="btn" href="/diagnostico">Hacer diagnóstico</Link>
            </>
          )}
        </section>

        <Kpi icon="practice" value={totals.done} label={totals.done === 1 ? "hoja resuelta" : "hojas resueltas"} />
        <Kpi icon="check" value={totals.max ? `${totals.got}/${totals.max}` : "—"} label="marcas ganadas" />
        <Kpi icon="notebook" value={d.notes.length} label={d.notes.length === 1 ? "nota de clase" : "notas de clase"} />
        <Kpi icon="timer" value={d.mocks.filter((m) => m.phase === "done").length} label="simulacros hechos" />

        <section className="tile span-6" aria-label="Tu plan">
          <div className="tile-head"><span className="eyebrow">Tu plan de 12 semanas</span>{res && <Link href="/diagnostico" className="tile-link">Completo <Icon name="caret" size={14} /></Link>}</div>
          {res ? (
            <ul className="uplan">
              {res.weeks.slice(0, 3).map((b) => (
                <li key={b.unit} style={{ background: `var(--t${b.unit})` }}>
                  <span className="ubadge" style={{ background: `var(--u${b.unit})` }}>{b.unit}</span>
                  <span><b>{UNIT_NAME[b.unit]}</b></span>
                  <span className="wk">Sem. {b.weeks[0]}{b.weeks[1] !== b.weeks[0] ? `–${b.weeks[1]}` : ""}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Aparece después del diagnóstico: empieza por lo que más te cuesta.</p>}
        </section>

        <section className="tile span-3" aria-label="Notas de clase">
          <div className="tile-head"><span className="eyebrow">Notas de clase</span><Link href="/app/notas" className="tile-link">Todas <Icon name="caret" size={14} /></Link></div>
          {d.notes.slice(0, 2).map((n) => {
            const u = topicById(n.topic)?.unit;
            return (
              <Link key={n.id} href={`/app/notas?id=${n.id}`} className="row-link" style={u ? { background: `var(--t${u})`, borderColor: "transparent" } : undefined}>
                <b>{n.title || "Sin título"}</b>
                <span className="muted">{topicById(n.topic)?.name} · {fmtDate(n.date)}</span>
              </Link>
            );
          })}
          {!d.notes.length && <p className="muted">Toma notas en la plantilla y Kwanta te arma ejercicios de lo que viste.</p>}
          <button className="btn" type="button" onClick={newNoteGo}><Icon name="plus" /> Nueva nota</button>
        </section>

        <section className="tile span-3" aria-label="Práctica">
          <div className="tile-head"><span className="eyebrow">Práctica</span><Link href="/app/practica" className="tile-link">Todo <Icon name="caret" size={14} /></Link></div>
          {d.sets.slice(0, 2).map((s) => {
            const sc = setScore(s);
            return (
              <Link key={s.id} href={`/app/practica?set=${s.id}`} className="row-link">
                <b>{s.title}</b>
                <span className="muted">{sc.done}/{s.n} hojas · {sc.got}/{sc.max || "—"} marcas</span>
              </Link>
            );
          })}
          {!d.sets.length && <p className="muted">Todavía no tienes ejercicios. Créalos desde una nota o elige un tema.</p>}
          <Link className="btn" href="/app/practica">Practicar un tema</Link>
        </section>
      </div>

      <section className="home-data" aria-label="Tus datos">
        <span className="eyebrow">Tus datos</span>
        <InstallCard />
        <BackupCard />
        {d.s?.demo && (
          <div className="keepcard">
            <div>
              <b>Estás en la cuenta demo</b>
              <span className="muted">Los datos se guardan solo en este navegador. Puedes volver a los datos de ejemplo cuando quieras.</span>
            </div>
            <div className="kc-actions"><button className="btn sm ghost" type="button" onClick={() => { seedDemo(true); store.del("kw-sets"); load(); }}>Restablecer datos de ejemplo</button></div>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ icon, value, label }: { icon: UiIconName; value: number | string; label: string }) {
  return (
    <div className="tile span-3 kpi">
      <span className="kpi-ic"><Icon name={icon} size={20} /></span>
      <b className="kpi-n">{value}</b>
      <span className="kpi-l">{label}</span>
    </div>
  );
}

const STEPS = [
  { k: "diag", n: "Diagnóstico", t: "Haz tu diagnóstico", d: "15 minutos. Te ubica en un nivel del 1 al 7 y arma tu plan de 12 semanas.", cta: "Empezar diagnóstico" },
  { k: "notes", n: "Notas de clase", t: "Toma notas de tu próxima clase", d: "Usa la plantilla de Kwanta en clase y marca qué vieron. Con eso te armamos ejercicios.", cta: "Nueva nota de clase" },
  { k: "practice", n: "Ejercicios", t: "Practica lo que viste en clase", d: "4 hojas de examen sobre los temas de tu nota, con números nuevos y solución paso a paso.", cta: "Crear ejercicios de mi nota" },
  { k: "mock", n: "Simulacro", t: "Haz un simulacro de Prueba 2", d: "Tiempo real, sin pistas. Al final ves tu nota estimada.", cta: "Empezar simulacro" },
] as const;

/** Decorative energy levels on the hero card (the brand's motif, not a blob). */
function LevelsArt() {
  return (
    <svg className="hs-art" viewBox="0 0 220 160" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={20 + i * 6} x2={210} y1={150 - i * 22} y2={150 - i * 22} stroke="#fff" strokeOpacity={0.1 + i * 0.03} strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M70 128 Q 120 70 176 20" fill="none" stroke="#c6f432" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="182" cy="18" r="8" fill="#c6f432" />
    </svg>
  );
}

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
    <section className="tile span-8 hero-step" aria-label="Tu siguiente paso">
      <LevelsArt />
      <ol className="stepper">
        {STEPS.map((s, j) => (
          <li key={s.k} className={done[s.k] ? "ok" : j === i ? "cur" : ""}>
            <span className="dotn">{done[s.k] ? <Icon name="check" size={14} /> : j + 1}</span><span>{s.n}</span>
          </li>
        ))}
      </ol>
      {step ? (
        <div className="ns-body">
          <span className="hs-eyebrow">Tu siguiente paso · {i + 1} de {STEPS.length}</span>
          <h2>{step.t}</h2>
          <p>{step.d}</p>
          {href ? <Link className="btn lime" href={href}>{step.cta} <Icon name="arrow" /></Link> : <button className="btn lime" type="button" onClick={action}>{step.cta} <Icon name="arrow" /></button>}
        </div>
      ) : (
        <div className="ns-body">
          <span className="hs-eyebrow">Vas al día</span>
          <h2>Repite el ciclo cada semana</h2>
          <p>Notas de cada clase → ejercicios de esa clase → un simulacro cada dos semanas.</p>
          <button className="btn lime" type="button" onClick={onNote}>Nueva nota de clase <Icon name="arrow" /></button>
        </div>
      )}
    </section>
  );
}
