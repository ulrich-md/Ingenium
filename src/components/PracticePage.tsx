"use client";
/** Practice: exercise sets built from class notes or from a chosen topic. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateSet, TOPICS, topicById } from "@/lib/generators";
import { getSet, listSets, newSet, saveSet, type PracticeSet } from "@/lib/notes";
import { SHEET_MAX } from "@/lib/content";
import { UNIT_NAME, type Unit } from "@/lib/scoring";
import { setScore } from "./Dashboard";
import { useDevice } from "./Device";
import SheetStep from "./SheetStep";
import Icon from "./Icon";

const UNITS = [...new Set(TOPICS.map((x) => x.unit))];

export default function PracticePage() {
  const id = useSearchParams().get("set");
  return id ? <Runner key={id} id={id} /> : <Home />;
}

function Home() {
  const router = useRouter();
  const [sets, setSets] = useState<PracticeSet[] | null>(null);
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [chosen, setChosen] = useState<string[]>([]);
  const [openU, setOpenU] = useState<Unit | null>(TOPICS[0].unit);
  useEffect(() => setSets(listSets()), []);
  const t = topicById(topic)!;
  if (!sets) return null;
  return (
    <div className="wrap diag">
      <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.4rem)" }}>Práctica</h1>
      <div className="practice-grid">
        <div className="card">
          <h3>Practicar un tema</h3>
          <div className="acc">
            {UNITS.map((u) => {
              const list = TOPICS.filter((x) => x.unit === u);
              const open = openU === u;
              const sel = list.find((x) => x.id === topic);
              return (
                <div key={u} className={"acc-item" + (open ? " open" : "")}>
                  <button type="button" className="acc-head" aria-expanded={open} aria-controls={`acc-${u}`} onClick={() => setOpenU(open ? null : u)}>
                    <span className="ubadge sm" style={{ background: `var(--u${u})` }}>{u}</span>
                    <span className="acc-t"><b>{UNIT_NAME[u]}</b><small>{sel ? `Elegido: ${sel.name}` : `${list.length} ${list.length === 1 ? "tema" : "temas"}`}</small></span>
                    <Icon name="caret" size={18} className="acc-caret" />
                  </button>
                  {open && (
                    <div id={`acc-${u}`} className="topics" role="radiogroup" aria-label={`Temas de la unidad ${u}`}>
                      {list.map((x) => (
                        <button key={x.id} type="button" role="radio" aria-checked={topic === x.id} className={"topic" + (topic === x.id ? " on" : "")}
                          style={{ background: topic === x.id ? `var(--t${x.unit})` : undefined }}
                          onClick={() => { setTopic(x.id); setChosen([]); }}>
                          <span>{x.name}</span>
                          {topic === x.id && <Icon name="check" size={18} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="eyebrow">Subtemas de {t.name}</span>
          <div className="chips">
            {t.concepts.map((c) => (
              <button key={c.id} type="button" className={"chip" + (chosen.includes(c.id) ? " on" : "")} aria-pressed={chosen.includes(c.id)}
                onClick={() => setChosen((x) => (x.includes(c.id) ? x.filter((y) => y !== c.id) : [...x, c.id]))}>{c.label}</button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: ".86rem" }}>Sin elegir nada, entran todos los subtemas. Cada vez salen números nuevos.</p>
          <button className="btn primary" type="button" onClick={() => {
            const s = newSet({ title: `Práctica · ${t.name}`, topic, concepts: chosen });
            router.push(`/app/practica?set=${s.id}`);
          }}>Crear 4 ejercicios <Icon name="arrow" /></button>
        </div>
        <div className="card">
          <h3>Tus ejercicios</h3>
          {sets.map((s) => {
            const sc = setScore(s);
            const u = topicById(s.topic)?.unit;
            return (
              <Link key={s.id} href={`/app/practica?set=${s.id}`} className="row-link" style={u ? { background: `var(--t${u})`, borderColor: "transparent" } : undefined}>
                <b>{s.title}</b>
                <span className="muted">{sc.done}/{s.n} hojas · {sc.got}/{sc.max || "—"} marcas</span>
              </Link>
            );
          })}
          {!sets.length && (
            <div className="empty">
              <span className="newtile-ic"><Icon name="practice" size={22} /></span>
              <p className="muted">Aquí aparecen tus hojas de práctica con sus marcas. Elige un tema y crea las primeras 4, o créalas desde una nota de clase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Runner({ id }: { id: string }) {
  const router = useRouter();
  const { mode } = useDevice();
  const [set, setSet] = useState<PracticeSet | null | undefined>(undefined);
  useEffect(() => setSet(getSet(id)), [id]);
  const sheets = useMemo(() => (set ? generateSet(set.topic, set.concepts, set.seed, set.n, set.id) : []), [set?.id, set?.seed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (set === undefined || !mode) return null;
  if (set === null) return <div className="wrap diag"><p>No encontramos estos ejercicios.</p><Link href="/app/practica">Volver</Link></div>;

  const up = (patch: Partial<PracticeSet>) => setSet((s) => { const n = { ...(s as PracticeSet), ...patch }; saveSet(n); return n; });
  const finished = set.idx >= sheets.length;

  if (mode === "telefono") {
    return (
      <div className="wrap diag" style={{ maxWidth: 720 }}>
        <h2>{set.title}</h2>
        <div className="callout"><b>Estos ejercicios se hacen en iPad o computadora</b><span>Son hojas de examen completas: a mano con el Apple Pencil en iPad, o tecleando en computadora.</span></div>
        <Link className="btn" href="/app">Volver al inicio</Link>
      </div>
    );
  }

  if (finished) {
    const sc = setScore(set);
    return (
      <div className="wrap diag res" style={{ maxWidth: 820 }}>
        <p className="eyebrow">Terminaste</p>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)" }}>{set.title}</h1>
        <span className="grade" style={{ fontSize: "3.6rem" }}>{sc.got}<small> / {sheets.reduce((a, s) => a + SHEET_MAX(s), 0)} marcas</small></span>
        <ul className="plan">
          {sheets.map((s) => {
            const got = (set.awarded[s.id] ?? []).flat().filter((x) => x === true).length;
            return <li key={s.id}><span className="wk">Ejercicio {s.num}</span><span>{s.topic.split(" · ")[1]} · <b>{set.done[s.id] ? `${got}/${SHEET_MAX(s)}` : "saltado"}</b></span></li>;
          })}
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn primary" type="button" onClick={() => {
            const s = newSet({ title: set.title, topic: set.topic, concepts: set.concepts, noteId: set.noteId, n: set.n });
            router.push(`/app/practica?set=${s.id}`);
          }}>Otra ronda con números nuevos</button>
          {set.noteId && <Link className="btn" href={`/app/notas?id=${set.noteId}`}>Volver a la nota</Link>}
          <Link className="btn ghost" href="/app/practica">Práctica</Link>
        </div>
      </div>
    );
  }

  const sh = sheets[set.idx];
  const last = set.idx === sheets.length - 1;
  return (
    <div className="wrap diag">
      <div className="step-head">
        <span className="eyebrow">{set.title} · ejercicio {set.idx + 1} de {sheets.length}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {set.idx > 0 && <button className="btn ghost sm" type="button" onClick={() => up({ idx: set.idx - 1 })}>Anterior</button>}
          {set.noteId && <Link className="btn ghost sm" href={`/app/notas?id=${set.noteId}`}>Ver mi nota</Link>}
          <Link className="btn ghost sm" href="/app/practica">Salir</Link>
        </div>
      </div>
      <div className="progress" aria-hidden="true">
        {sheets.map((s, i) => <i key={s.id} className={set.done[s.id] ? "done" : i === set.idx ? "cur" : ""} />)}
      </div>
      <SheetStep
        key={sh.id + mode}
        sheet={sh}
        mode={mode}
        typed={set.typed[sh.id] ?? sh.parts.map((p) => Array(p.rows).fill(""))}
        onTyped={(t) => up({ typed: { ...set.typed, [sh.id]: t } })}
        awarded={set.awarded[sh.id]}
        onAwarded={(a) => up({ awarded: { ...set.awarded, [sh.id]: a } })}
        marked={!!set.marked[sh.id]}
        onMarked={(m) => up({ marked: { ...set.marked, [sh.id]: m } })}
        nextLabel={last ? "Terminar" : "Siguiente ejercicio"}
        onNext={() => setSet((s) => {
          const p = s as PracticeSet;
          const n = { ...p, done: p.marked[sh.id] ? { ...p.done, [sh.id]: true } : p.done, idx: p.idx + 1 };
          saveSet(n);
          return n;
        })}
      />
    </div>
  );
}
