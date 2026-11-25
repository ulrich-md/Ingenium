"use client";
/**
 * Class notes: a list, and the note editor built on a class template
 * (Cornell layout adapted to IB Physics). iPad writes by hand on the template,
 * the computer types into it, the phone reads. From the concepts seen in class,
 * Kwanta builds exam-style exercises.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detectConcepts, TOPICS, topicById } from "@/lib/generators";
import { deleteNote, fmtDate, getNote, listNotes, newNote, newSet, saveNote, type Note, type NoteText } from "@/lib/notes";
import { useDevice } from "./Device";
import InkLayer, { type InkHandle } from "./InkLayer";
import { InkToolbar, useInkTools } from "./InkTools";
import SaveStatus from "./SaveStatus";
import { useFocusMode } from "./Focus";
import { Floating, useCamera, ZoomBadge } from "./Camera";
import FitPage from "./FitPage";
import Icon from "./Icon";
import { IlloNotebook, UNIT_ILLO } from "./Illos";

export default function NotesPage() {
  const id = useSearchParams().get("id");
  return id ? <NoteEditor key={id} id={id} /> : <NotesList />;
}

function NotesList() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[] | null>(null);
  useEffect(() => setNotes(listNotes()), []);
  if (!notes) return null;
  const create = () => { const n = newNote(); router.push(`/app/notas?id=${n.id}`); };
  return (
    <div className="wrap diag">
      <div className="pagehead">
        <div className="pagehead-text">
          <h1>Notas de clase</h1>
          <p className="muted">Cada nota usa la plantilla de clase de Kwanta: preguntas clave, notas, un ejemplo resuelto y un resumen. Marca qué vieron en clase y Kwanta te arma ejercicios tipo examen con eso.</p>
          <button className="btn primary" type="button" onClick={create}><Icon name="plus" /> Nueva nota</button>
        </div>
        <IlloNotebook className="pagehead-art" />
      </div>
      <div className="cardgrid">
        {notes.map((n) => {
          const t = topicById(n.topic);
          const Art = t ? UNIT_ILLO[t.unit] : null;
          return (
            <Link key={n.id} href={`/app/notas?id=${n.id}`} className="card notecard unitcard" style={t ? { background: `var(--t${t.unit})`, borderColor: "transparent" } : undefined}>
              {Art && <Art className="nc-art" />}
              <span className="unitrow">{t && <span className="ubadge sm" style={{ background: `var(--u${t.unit})` }}>{t.unit}</span>}<span>{t?.name ?? n.topic}</span></span>
              <b className="nc-title">{n.title || "Sin título"}</b>
              <span className="muted">{fmtDate(n.date)} · {n.concepts.length} {n.concepts.length === 1 ? "tema marcado" : "temas marcados"}</span>
            </Link>
          );
        })}
        <button type="button" className="newtile" onClick={create}>
          <span className="newtile-ic"><Icon name="plus" size={22} /></span>
          <b>Nueva nota de clase</b>
          <span className="muted">Plantilla Cornell para Física IB</span>
        </button>
      </div>
    </div>
  );
}

const LINE = 34;

function Lined({ rows, value, onChange, typed, label, grid }: { rows: number; value: string; onChange?: (v: string) => void; typed: boolean; label: string; grid?: boolean }) {
  return (
    <div className={"lined" + (grid ? " grid" : "")} style={{ height: rows * LINE }}>
      {typed && <textarea aria-label={label} value={value} onChange={(e) => onChange?.(e.target.value)} spellCheck={false} />}
    </div>
  );
}

const NOTE_W = 900;

function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const { mode } = useDevice();
  const tools = useInkTools();
  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const inks = useRef<(InkHandle | null)[]>([]);
  const active = useRef<InkHandle | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useFocusMode();
  useCamera(mode === "ipad" && note != null);

  useEffect(() => {
    if (!drawer) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [drawer]);

  useEffect(() => setNote(getNote(id)), [id]);

  const update = useCallback((patch: Partial<Note>) => {
    setNote((n) => {
      if (!n) return n;
      const next = { ...n, ...patch };
      saveNote(next);
      return next;
    });
  }, []);
  const setText = (k: keyof NoteText, v: string) => note && update({ text: { ...note.text, [k]: v } });

  const allText = note ? Object.values(note.text).join("\n") + "\n" + note.title : "";
  const detected = useMemo(() => (note ? detectConcepts(note.topic, allText) : []), [note, allText]);

  if (note === undefined) return null;
  if (note === null) return <div className="wrap diag"><p>No encontramos esta nota.</p><Link href="/app/notas">Volver a notas</Link></div>;

  const topic = topicById(note.topic) ?? TOPICS[0];
  const typed = mode === "computadora";
  const ink = mode === "ipad";
  const toggle = (c: string) => update({ concepts: note.concepts.includes(c) ? note.concepts.filter((x) => x !== c) : [...note.concepts, c] });

  const makeExercises = () => {
    const s = newSet({ title: `Ejercicios · ${note.title || topic.name}`, topic: note.topic, concepts: note.concepts, noteId: note.id });
    router.push(`/app/practica?set=${s.id}`);
  };

  // on the iPad each page is a fixed-size sheet scaled to the screen, so ink stays aligned
  const page = (p: number) => ink ? <FitPage key={p} width={NOTE_W}>{sheetPage(p)}</FitPage> : sheetPage(p);
  const sheetPage = (p: number) => (
    <div key={p} className="paper notepage" onPointerDownCapture={() => { active.current = inks.current[p] ?? null; }}>
      {p === 0 ? (
        <>
          <div className="nh"><span>KWANTA · NOTAS DE CLASE · FÍSICA IB</span><span>{fmtDate(note.date)}</span></div>
          <div className="nh2"><span><b>Tema:</b> {topic.name}</span><span><b>Clase:</b> {note.title || "—"}</span></div>
          <div className="cornell">
            <section className="cue"><h6>Preguntas y palabras clave</h6><Lined rows={14} typed={typed} label="Preguntas y palabras clave" value={note.text.claves} onChange={(v) => setText("claves", v)} /></section>
            <section className="main"><h6>Notas de la clase</h6><Lined rows={14} typed={typed} label="Notas de la clase" value={note.text.notas} onChange={(v) => setText("notas", v)} /></section>
          </div>
          <section className="blk"><h6>Ejemplo resuelto en clase</h6><Lined rows={7} grid typed={typed} label="Ejemplo resuelto en clase" value={note.text.ejemplo} onChange={(v) => setText("ejemplo", v)} /></section>
          <section className="blk"><h6>Resumen en 3 líneas</h6><Lined rows={3} typed={typed} label="Resumen en 3 líneas" value={note.text.resumen} onChange={(v) => setText("resumen", v)} /></section>
        </>
      ) : (
        <>
          <div className="nh"><span>{note.title || topic.name}</span><span>Página {p + 1}</span></div>
          <section className="blk"><Lined rows={26} typed={false} label="" value="" /></section>
        </>
      )}
      {ink && (
        <InkLayer
          ref={(h) => { inks.current[p] = h; if (p === 0 && !active.current) active.current = h; }}
          storageKey={`kw-ink-note-${note.id}-p${p}`}
          tool={tools.tool} color={tools.color} size={tools.size} fingerDraws={tools.finger} onSelect={tools.setSelected}
        />
      )}
    </div>
  );

  return (
    <div className="wrap diag">
      <div className="step-head notehead">
        <Link href="/app/notas" className="btn ghost sm">← Notas</Link>
        <span className="nh-save"><SaveStatus /></span>
        <button className="btn sm" type="button" aria-expanded={drawer} onClick={() => setDrawer(true)}>
          {!note.title ? "Ponle título y tema" : note.concepts.length ? `Crear ejercicios (${note.concepts.length} temas)` : "Tema y ejercicios"}
        </button>
      </div>
      {ink && <InkToolbar t={tools} ink={active} />}
      <div className="focuswrap">
        <div className="desk notes">
          {mode === "telefono" ? (
            <div className="card">
              <span className="pill">{topic.name}</span>
              <h2>{note.title || "Sin título"}</h2>
              {(["claves", "notas", "ejemplo", "resumen"] as const).map((k) => note.text[k] && (
                <div key={k}><p className="eyebrow">{{ claves: "Preguntas y palabras clave", notas: "Notas", ejemplo: "Ejemplo", resumen: "Resumen" }[k]}</p><p style={{ whiteSpace: "pre-wrap" }}>{note.text[k]}</p></div>
              ))}
              <p className="muted" style={{ fontSize: ".88rem" }}>En el teléfono puedes leer tus notas. Para escribirlas usa el iPad (a mano) o la computadora (tecleando).</p>
            </div>
          ) : (
            <>
              {Array.from({ length: ink ? note.pages : 1 }, (_, p) => page(p))}
              {ink && <button className="btn" type="button" onClick={() => update({ pages: note.pages + 1 })}>+ Agregar página</button>}
            </>
          )}
        </div>

        <Floating>
        {drawer && <div className="drawer-bg" onClick={() => setDrawer(false)} aria-hidden="true" />}
        <aside className={"drawer" + (drawer ? " open" : "")} role="dialog" aria-modal="true" aria-label="Detalles de la nota" hidden={!drawer}>
          <div className="drawer-h">
            <b>Detalles de la nota</b>
            <button type="button" className="btn sm ghost" onClick={() => setDrawer(false)}>Cerrar</button>
          </div>
          <label className="fld">Título de la clase
            <input id="note-title" value={note.title} placeholder="Ej. Clase 12 · Órbitas" onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="fld">Tema
            <select id="note-topic" value={note.topic} onChange={(e) => update({ topic: e.target.value, concepts: [] })}>
              {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="h">¿Qué vieron hoy en clase?</span>
            <div className="chips">
              {topic.concepts.map((c) => (
                <button key={c.id} type="button" className={"chip" + (note.concepts.includes(c.id) ? " on" : "")} aria-pressed={note.concepts.includes(c.id)} onClick={() => toggle(c.id)}>
                  {c.label}{detected.includes(c.id) && !note.concepts.includes(c.id) && <span className="det"> · en tus notas</span>}
                </button>
              ))}
            </div>
            {typed && detected.some((c) => !note.concepts.includes(c)) && (
              <button className="btn sm" type="button" onClick={() => update({ concepts: [...new Set([...note.concepts, ...detected])] })}>Marcar lo que detecté en tus notas</button>
            )}
            {ink && <p className="muted" style={{ fontSize: ".82rem" }}>Toca los temas que vieron. Pronto la IA los leerá de tu letra.</p>}
          </div>
          <button className="btn primary" type="button" onClick={makeExercises} disabled={!note.concepts.length || mode === "telefono"}>
            Crear 4 ejercicios de estas notas
          </button>
          {!note.concepts.length && <p className="muted" style={{ fontSize: ".82rem" }}>Marca al menos un tema para crear ejercicios.</p>}
          {mode === "telefono" && <p className="muted" style={{ fontSize: ".82rem" }}>Los ejercicios se resuelven en iPad o computadora.</p>}
          {confirmDel ? (
            <div className="drawer-del" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="btn sm" type="button" style={{ borderColor: "var(--bad)", color: "var(--bad)" }} onClick={() => { deleteNote(note.id); router.push("/app/notas"); }}>Sí, borrar nota</button>
              <button className="btn sm ghost" type="button" onClick={() => setConfirmDel(false)}>Cancelar</button>
            </div>
          ) : (
            <button className="btn sm ghost drawer-del danger" type="button" onClick={() => setConfirmDel(true)}>Borrar nota</button>
          )}
        </aside>
        </Floating>
        {ink && <ZoomBadge />}
      </div>
    </div>
  );
}
