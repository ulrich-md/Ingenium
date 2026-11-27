import type { Metadata } from "next";
import Link from "next/link";
import "../landing.css";
import Icon from "@/components/Icon";
import { Diffs, I3d, Levers, PlanTable, Problems, SprintCta, SprintWeeks } from "@/components/OfferParts";
import PsiLive from "@/components/PsiLive";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Precios · Kwanta" };

/** /precios, in the Sprint al 7 world (deep indigo, iridescent accents). The offer follows
 *  Alex Hormozi's "$100M Offers": value equation, problems → solutions, a stack per plan,
 *  a conditional guarantee, and real scarcity (founder price, 25 seats). */

const FAQ = [
  { q: "¿Puedo empezar gratis?", a: "Sí. El diagnóstico no pide tarjeta ni cuenta. Al terminar ves tu nivel y tu plan, y decides si quieres algo más." },
  { q: "¿Cómo pago?", a: "Los pagos se procesan con Mercado Pago. Kwanta no guarda datos de tu tarjeta." },
  { q: "¿Cómo funciona la garantía del Sprint?", a: "Si cumples el plan de 12 semanas y no subes un nivel, te devolvemos el dinero." },
  { q: "¿Qué es el precio de fundador?", a: "Es el precio para quienes entran antes del lanzamiento: el Pase Física cuesta $59 USD en lugar de $89." },
];

const CARDS = [
  {
    key: "diag", tag: "Gratis", name: "Diagnóstico", price: "$0", unit: "sin cuenta", img: "spiral-calendar",
    stack: ["10 de opción múltiple y 3 de desarrollo", "Tu nota proyectada del 1 al 7", "Tu plan de 12 semanas"],
  },
  {
    key: "pase", tag: "Hasta tu examen", name: "Pase Física", price: "$59", was: "$89", unit: "USD · precio de fundador", img: "books",
    stack: ["Todo el diagnóstico", "Banco de hojas: 149 tipos de ejercicio", "Simulacros de Prueba 2", "Teoría de las unidades A–E|pronto", "Simulacros de Prueba 1|pronto", "Videos por tema y tutor|pronto"],
  },
  {
    key: "sprint", tag: "Cupo de 25 · febrero", name: "Sprint al 7", price: "$349", unit: "USD · 12 semanas", img: "trophy",
    stack: ["Todo el Pase Física", "Clase en vivo cada semana con un coach que sacó 7", "4 simulacros corregidos sobre tu hoja", "Garantía: subes un nivel o te devolvemos el dinero"],
  },
] as const;

export default function Precios() {
  return (
    <div className="pub">
      <section className="sp pr" aria-labelledby="pr-title">
        <div className="sp-beams" aria-hidden="true" />

        {/* 1 · head */}
        <div className="wrap pr-hero">
          <div className="pr-hero-text">
            <span className="sp-seats"><I3d name="fire" size={22} /> Precios de fundador</span>
            <h1 id="pr-title">Elige cómo llegar <span className="pr-iri">al 7</span></h1>
            <p className="sp-lede">Empieza gratis con el diagnóstico. Cuando sepas tu nivel, elige el plan que te lleve a la meta.</p>
          </div>
          <div className="pr-hero-art"><PsiLive pose="senala" skin="iri" sticker uid="precios" /></div>
        </div>

        {/* 2 · the three plans, each with its stack */}
        <div className="wrap pr-cards">
          {CARDS.map((c) => (
            <article key={c.key} id={c.key === "sprint" ? "sprint" : undefined} className={`pr-card${c.key === "sprint" ? " hot" : ""}`}>
              {c.key === "sprint" && <span className="pr-flag">Con garantía</span>}
              <div className="pr-card-head">
                <I3d name={c.img} size={52} />
                <span className="pr-tag">{c.tag}</span>
              </div>
              <h2>{c.name}</h2>
              <p className="pr-price">
                {"was" in c && <s>{c.was}</s>}
                <b>{c.price}</b>
                <small>{c.unit}</small>
              </p>
              <ul className="pr-stack">
                {c.stack.map((s) => {
                  const [text, soon] = s.split("|");
                  return <li key={s} className={soon ? "soon" : undefined}><Icon name="check" size={16} />{text}{soon && <span className="pr-soon">Pronto</span>}</li>;
                })}
              </ul>
              {c.key === "diag" && <Link className="btn sp-btn lg" href="/diagnostico">Empieza gratis</Link>}
              {c.key === "pase" && <Link className="btn pr-ghost lg" href="/diagnostico">Primero, el diagnóstico</Link>}
              {c.key === "sprint" && <SprintCta onPricing />}
            </article>
          ))}
        </div>

        {/* 3 · value equation */}
        <div className="wrap pr-block">
          <h2 className="sp-h">Más de lo que importa, menos de lo que cansa</h2>
          <p className="sp-sub">Así decidimos qué entra en cada plan.</p>
          <Levers />
        </div>

        {/* 4 · differentiators */}
        <div className="wrap pr-block">
          <h2 className="sp-h">Lo que no encuentras en otro lado</h2>
          <p className="sp-sub">Ocho cosas que Kwanta ya hace hoy, en los tres planes.</p>
          <Diffs dark />
        </div>

        {/* 5 · problems → solutions */}
        <div className="wrap pr-block">
          <h2 className="sp-h">Lo que nos dicen, y lo que hace Kwanta</h2>
          <Problems dark />
        </div>

        {/* 6 · the full comparison */}
        <div className="wrap pr-block">
          <h2 className="sp-h">Qué incluye cada plan</h2>
          <PlanTable />
        </div>

        {/* 7 · the Sprint's weeks and guarantee */}
        <SprintWeeks id="pr-seal-path" />

        {/* 8 · questions */}
        <div className="wrap pr-block pr-faq">
          <h2 className="sp-h">Preguntas sobre el pago</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}<Icon name="caret" size={18} className="faq-caret" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="wrap sp-end">
          <Link className="btn sp-btn lg" href="/diagnostico">Haz el diagnóstico gratis</Link>
          <span className="pr-note">Precios en dólares estadounidenses. Kwanta no está afiliado con la Organización del Bachillerato Internacional.</span>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
