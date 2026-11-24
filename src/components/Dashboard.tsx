"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIAG_KEY, diagResult, type DiagState } from "@/lib/diag";
import { MODE_LABEL } from "@/lib/device";
import { topicById } from "@/lib/generators";
import { fmtDate, listNotes, listSets, newNote, type Note, type PracticeSet } from "@/lib/notes";
import { UNIT_NAME } from "@/lib/scoring";
import { getSession, seedDemo, type Session } from "@/lib/session";
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
  const [d, setD] = useState<{ s: Session | null; diag: DiagState | null; notes: Note[]; sets: PracticeSet[] } | null>(null);

  const load = () => setD({ s: getSession(), diag: store.get<DiagState | null>(DIAG_KEY, null), notes: listNotes(), sets: listSets() });
  useEffect(load, []);
  if (!d) return null;

  const res = d.diag && d.diag.stage === "results" ? diagResult(d.diag) : null;

  return (
    <div className="wrap diag">
      <div className="step-head">
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)" }}>Hola, {d.s?.name.split(" ")[0] ?? "alumno"}</h1>
        {mode && <span className="pill">{MODE_LABEL[mode]}</span>}
      </div>

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
