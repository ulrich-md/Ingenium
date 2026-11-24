"use client";
/**
 * Timed Paper 2 mocks. While running: exam mode (no hints, no marking, a clock).
 * On submit (or when time runs out): the computer marks typed answers itself;
 * on the iPad the student marks each sheet with the markscheme. Then a result
 * with an approximate IB grade.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { markTyped } from "@/lib/check";
import { SHEET_MAX } from "@/lib/content";
import { getMock, listMocks, mockSheets, newMock, saveMock, MOCK_SIZE, type Mock } from "@/lib/mocks";
import { gradeFromShare } from "@/lib/scoring";
import { useDevice } from "./Device";
import SheetStep from "./SheetStep";

export default function MockPage() {
  const id = useSearchParams().get("id");
  return id ? <Runner key={id} id={id} /> : <Home />;
}

export function mockScore(m: Mock) {
  const sheets = mockSheets(m);
  const max = sheets.reduce((a, s) => a + SHEET_MAX(s), 0);
  const got = sheets.reduce((a, s) => a + (m.awarded[s.id] ?? []).flat().filter((x) => x === true).length, 0);
  return { got, max, grade: gradeFromShare(max ? got / max : 0) };
}

function Home() {
  const router = useRouter();
  const { mode } = useDevice();
  const [mocks, setMocks] = useState<Mock[] | null>(null);
  useEffect(() => setMocks(listMocks()), []);
  if (!mocks) return null;
  const start = (l: "NM" | "NS") => { const m = newMock(l); router.push(`/app/mock?id=${m.id}`); };
  return (
    <div className="wrap diag">
      <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.4rem)" }}>Mocks</h1>
      <p className="muted" style={{ maxWidth: "64ch" }}>Practica en condiciones de examen: tiempo real, sin pistas y sin ver correcciones hasta entregar. Al final ves tu nota estimada.</p>
      {mode === "telefono" ? (
        <div className="callout"><b>Los mocks se hacen en iPad o computadora</b><span>Son hojas de examen completas, como la Prueba 2.</span></div>
      ) : (
        <div className="grid3">
          {(["NM", "NS"] as const).map((l) => (
            <div key={l} className="card">
              <span className="pill">{l === "NM" ? "Nivel Medio" : "Nivel Superior"}</span>
              <h3>Mock corto de Prueba 2</h3>
              <p className="muted">{MOCK_SIZE[l]} preguntas de desarrollo de todos los temas · unos {l === "NM" ? "25–35" : "35–50"} minutos (1,8 min por marca, como la Prueba 2 real).</p>
              <button className="btn primary" type="button" onClick={() => start(l)}>Empezar mock {l}</button>
            </div>
          ))}
          <div className="card" style={{ opacity: 0.7 }}>
            <span className="pill sig">Próximamente</span>
            <h3>Prueba 1 (opción múltiple)</h3>
            <p className="muted">Prueba 1A con preguntas de opción múltiple y 1B con datos, con su tiempo real.</p>
          </div>
        </div>
      )}
      {mocks.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <h3>Tus mocks</h3>
          {mocks.map((m) => {
            const sc = mockScore(m);
            return (
              <Link key={m.id} href={`/app/mock?id=${m.id}`} className="card row-card">
                <b>Prueba 2 · {m.level} · {new Date(m.started).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</b>
                <span className="muted">{m.phase === "done" ? `${sc.got}/${sc.max} marcas · nota estimada ${sc.grade}` : m.phase === "review" ? "Falta corregir" : "En curso"}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const mmss = (ms: number) => {
  const t = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

function Runner({ id }: { id: string }) {
  const router = useRouter();
  const { mode } = useDevice();
  const [m, setM] = useState<Mock | null | undefined>(undefined);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setM(getMock(id)), [id]);
  const sheets = useMemo(() => (m ? mockSheets(m) : []), [m?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const up = (f: (x: Mock) => Mock) => setM((x) => { const n = f(x as Mock); saveMock(n); return n; });

  const submit = () => up((x) => {
    const base = { ...x, submitted: Date.now(), idx: 0 };
    if (mode === "computadora") {
      const awarded = { ...x.awarded }, marked = { ...x.marked };
      for (const s of sheets) { awarded[s.id] = s.parts.map((p, i) => markTyped(x.typed[s.id]?.[i] ?? [], p.rules).awarded); marked[s.id] = true; }
      return { ...base, awarded, marked, phase: "done" };
    }
    const marked = Object.fromEntries(sheets.map((s) => [s.id, true]));
    return { ...base, marked, phase: "review" };
  });

  // the clock
  useEffect(() => {
    if (!m || m.phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [m?.phase]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (m && m.phase === "running" && now >= m.endsAt && mode && mode !== "telefono") submit();
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  if (m === undefined || !mode) return null;
  if (m === null) return <div className="wrap diag"><p>No encontramos este mock.</p><Link href="/app/mock">Volver</Link></div>;
  if (mode === "telefono") {
    return <div className="wrap diag"><div className="callout"><b>Este mock se hace en iPad o computadora</b><span>Tu tiempo sigue corriendo: ábrelo en tu iPad o computadora.</span></div></div>;
  }

  /* ---------- result ---------- */
  if (m.phase === "done") {
    const sc = mockScore(m);
    const used = Math.min(m.minutes * 60_000, (m.submitted ?? m.endsAt) - m.started);
    const byTopic = new Map<string, { got: number; max: number }>();
    sheets.forEach((s) => {
      const k = s.topic.split(" · ")[0];
      const t = byTopic.get(k) ?? { got: 0, max: 0 };
      t.got += (m.awarded[s.id] ?? []).flat().filter((x) => x === true).length;
      t.max += SHEET_MAX(s);
      byTopic.set(k, t);
    });
    return (
      <div className="wrap diag res" style={{ maxWidth: 860 }}>
        <p className="eyebrow">Resultado del mock · Prueba 2 · {m.level}</p>
        <div className="res-top">
          <div style={{ display: "grid", gap: 8 }}>
            <span className="muted">Nota estimada</span>
            <span className="grade">{sc.grade}<small> / 7</small></span>
            <span className="muted">{sc.got} de {sc.max} marcas · {Math.round((sc.got / Math.max(1, sc.max)) * 100)}% · tiempo {mmss(used)} de {m.minutes}:00</span>
          </div>
          <div className="card bars">
            {[...byTopic.entries()].map(([k, t]) => (
              <div className="bar" key={k}>
                <div className="row"><span>{k}</span><span className="mono">{t.got}/{t.max}</span></div>
                <div className="track"><i style={{ width: `${(t.got / Math.max(1, t.max)) * 100}%`, background: "var(--vec)" }} /></div>
              </div>
            ))}
          </div>
        </div>
        <p className="muted" style={{ fontSize: ".84rem" }}>Fronteras de nota aproximadas. Para ver la solución de cada pregunta, practica el tema desde Práctica.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn primary" type="button" onClick={() => { const n = newMock(m.level); router.push(`/app/mock?id=${n.id}`); }}>Nuevo mock</button>
          <Link className="btn" href="/app">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const sh = sheets[Math.min(m.idx, sheets.length - 1)];
  const last = m.idx >= sheets.length - 1;
  const left = m.endsAt - now;

  /* ---------- review (iPad: mark with the markscheme) ---------- */
  if (m.phase === "review") {
    return (
      <div className="wrap diag">
        <div className="step-head"><span className="eyebrow">Corrige tu mock · pregunta {m.idx + 1} de {sheets.length}</span></div>
        <SheetStep
          key={sh.id + "r"}
          sheet={sh} mode={mode}
          typed={m.typed[sh.id] ?? sh.parts.map((p) => Array(p.rows).fill(""))}
          onTyped={() => {}}
          awarded={m.awarded[sh.id]}
          onAwarded={(a) => up((x) => ({ ...x, awarded: { ...x.awarded, [sh.id]: a } }))}
          marked onMarked={() => {}}
          nextLabel={last ? "Ver mi resultado" : "Siguiente pregunta"}
          onNext={() => up((x) => (last ? { ...x, phase: "done" } : { ...x, idx: x.idx + 1 }))}
        />
      </div>
    );
  }

  /* ---------- running ---------- */
  return (
    <div className="wrap diag">
      <div className="step-head">
        <span className="eyebrow">Mock Prueba 2 · {m.level} · pregunta {m.idx + 1} de {sheets.length}</span>
        <button className="btn sm" type="button" onClick={() => setConfirm(true)}>Entregar</button>
      </div>
      <div className="progress" aria-hidden="true">{sheets.map((s, i) => <i key={s.id} className={i < m.idx ? "done" : i === m.idx ? "cur" : ""} />)}</div>
      {confirm && (
        <div className="callout" role="alertdialog" aria-label="Confirmar entrega">
          <b>¿Entregar el mock ahora?</b>
          <span>Te quedan {mmss(left)}. Después ya no podrás cambiar tus respuestas.</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary sm" type="button" onClick={() => { setConfirm(false); submit(); }}>Sí, entregar</button>
            <button className="btn sm" type="button" onClick={() => setConfirm(false)}>Seguir escribiendo</button>
          </div>
        </div>
      )}
      <SheetStep
        key={sh.id + mode}
        sheet={sh} mode={mode}
        typed={m.typed[sh.id] ?? sh.parts.map((p) => Array(p.rows).fill(""))}
        onTyped={(t) => up((x) => ({ ...x, typed: { ...x.typed, [sh.id]: t } }))}
        awarded={undefined} onAwarded={() => {}}
        marked={false} onMarked={() => {}}
        exam={{ info: "Modo examen: sin pistas ni correcciones hasta entregar. Puedes ir y volver entre preguntas.", onPrev: m.idx > 0 ? () => up((x) => ({ ...x, idx: x.idx - 1 })) : undefined }}
        nextLabel={last ? "Entregar mock" : "Siguiente pregunta →"}
        onNext={() => (last ? setConfirm(true) : up((x) => ({ ...x, idx: x.idx + 1 })))}
      />
      <div className={"clock" + (left < 5 * 60_000 ? " warn" : "")} role="timer" aria-live="off">⏱ {mmss(left)}</div>
    </div>
  );
}
