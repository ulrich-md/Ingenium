"use client";
/**
 * Development preview of the question bank: one sheet per concept (?u=A for one unit,
 * ?seed=3 for other numbers). Not linked from the app.
 */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ExamSheet from "@/components/ExamSheet";
import FigView from "@/components/FigView";
import { generateSet, TOPICS } from "@/lib/generators";

function Bank() {
  const q = useSearchParams();
  const u = q.get("u"), seed = Number(q.get("seed") ?? 1), only = q.get("c");
  const list = TOPICS.filter((t) => !u || t.unit === u);
  if (q.get("figs")) {
    // only the diagrams, in a grid (to review them all at a glance)
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 12, background: "#fff" }}>
        {list.flatMap((t) => t.concepts.map((c) => {
          const [sh] = generateSet(t.id, [c.id], seed, 1, `dev-${t.id}-${c.id}`);
          const figs = [sh.fig, ...sh.parts.map((p) => p.fig)].filter(Boolean);
          return figs.map((f, i) => (
            <div key={t.id + c.id + i} style={{ border: "1px solid #ddd", padding: 6 }}>
              <div style={{ font: "600 11px sans-serif" }}>{t.id}.{c.id}</div>
              <FigView fig={f!} />
            </div>
          ));
        }))}
      </div>
    );
  }
  return (
    <div className="wrap diag" style={{ display: "grid", gap: 28, maxWidth: 900 }}>
      <h1>Banco de preguntas · {list.reduce((a, t) => a + t.concepts.length, 0)} conceptos en {list.length} subtemas</h1>
      {list.map((t) => t.concepts.filter((c) => !only || c.id === only).map((c) => {
        const [sh] = generateSet(t.id, [c.id], seed, 1, `dev-${t.id}-${c.id}`);
        return (
          <section key={t.id + c.id} data-concept={`${t.id}.${c.id}`} style={{ display: "grid", gap: 8 }}>
            <p className="eyebrow">{sh.topic}{t.hl ? " · NS" : ""}</p>
            <ExamSheet sheet={sh} variant="typed" readOnly />
            <details><summary>Solución y esquema</summary>{sh.parts.map((p) => <div key={p.label}><b>{p.label}</b> {p.rules.map((r) => `${r.code} ${r.text}`).join(" · ")}<br />{p.solution?.join(" → ")}</div>)}</details>
          </section>
        );
      }))}
    </div>
  );
}

export default function Page() {
  return <Suspense><Bank /></Suspense>;
}
