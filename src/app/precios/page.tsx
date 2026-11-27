import type { Metadata } from "next";
import Link from "next/link";
import "../landing.css";
import Icon from "@/components/Icon";
import { Diffs, FounderNote, I3d, Levers, PlanTable, Problems, SprintCta, SprintWeeks } from "@/components/OfferParts";
import { FREE_SHEETS_PER_WEEK, PRICE } from "@/lib/plans";
import PsiLive from "@/components/PsiLive";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Precios · Kwanta" };

/** /precios, in the Sprint al 7 world (deep indigo, iridescent accents). The offer follows
 *  Alex Hormozi: a free attraction offer, one paid program paid monthly (continuity) or once
 *  until the exam (shown as the better deal), a 14-day unconditional guarantee, and the mentors
 *  as the next step when we scale. MVP without coaches. */

const FAQ = [
  { q: "¿Puedo empezar gratis?", a: `Sí. El diagnóstico, tu nota proyectada, tu plan de 12 semanas y ${FREE_SHEETS_PER_WEEK} hojas de práctica por semana son gratis, sin tarjeta ni cuenta.` },
  { q: "¿Qué conviene más: mensual o hasta tu examen?", a: `El mensual cuesta ${PRICE.monthly} USD y lo cancelas cuando quieras. Hasta tu examen pagas una vez ${PRICE.exam} USD (${PRICE.founder} con precio de fundador) y no vuelves a pagar: con el precio de fundador, conviene si te faltan más de 3 meses para el examen.` },
  { q: "¿Cómo funciona la garantía?", a: `Si en los primeros ${PRICE.guaranteeDays} días el Sprint no te convence, te devolvemos el dinero. Sin preguntas.` },
  { q: "¿Cómo pago?", a: "Los pagos se procesan con Mercado Pago. Kwanta no guarda datos de tu tarjeta." },
  { q: "¿Hay clases con un profesor?", a: "Todavía no. Los mentores que sacaron 7 llegan cuando crezcamos. Al terminar tu diagnóstico puedes dejar tu correo y te avisamos." },
];

const CARDS = [
  {
    key: "gratis", tag: "Para empezar", name: "Gratis", img: "spiral-calendar",
    stack: ["Diagnóstico con nota proyectada", "Tu plan de 12 semanas", `${FREE_SHEETS_PER_WEEK} hojas de práctica por semana`, "Pistas por pasos y corrección automática"],
  },
  {
    key: "sprint", tag: "El programa completo", name: "Sprint al 7", img: "trophy",
    stack: ["Hojas personalizadas sin límite (149 tipos)", "Simulacros de Prueba 2 con tiempo real", "Notas de clase y ejercicios de lo que viste", "14 días para probarlo o te devolvemos el dinero", "Tutor de IA junto a cada ejercicio|pronto", "Corrección con IA de tu letra en el iPad|pronto", "Teoría A–E, Prueba 1 y videos|pronto"],
  },
  {
    key: "mentores", tag: "Cuando crezcamos", name: "Mentores", img: "graduation-cap",
    stack: ["Todo el Sprint al 7", "Clases en vivo con alguien que sacó 7", "Simulacros corregidos sobre tu hoja"],
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
            <span className="sp-seats"><I3d name="fire" size={22} /> <FounderNote /></span>
            <h1 id="pr-title">Elige cómo llegar <span className="pr-iri">al 7</span></h1>
            <p className="sp-lede">Empieza gratis con el diagnóstico. Cuando sepas tu nivel, elige el plan que te lleve a la meta.</p>
          </div>
          <div className="pr-hero-art"><PsiLive pose="senala" skin="iri" sticker uid="precios" /></div>
        </div>

        {/* 2 · the three plans, each with its stack */}
        <div className="wrap pr-cards">
          {CARDS.map((c) => (
            <article key={c.key} id={c.key === "sprint" ? "sprint" : undefined} className={`pr-card${c.key === "sprint" ? " hot" : ""}${c.key === "mentores" ? " later" : ""}`}>
              {c.key === "sprint" && <span className="pr-flag">14 días de garantía</span>}
              <div className="pr-card-head">
                <I3d name={c.img} size={52} />
                <span className="pr-tag">{c.tag}</span>
              </div>
              <h2>{c.name}</h2>
              {c.key === "gratis" && <p className="pr-price"><b>$0</b><small>sin cuenta, sin tarjeta</small></p>}
              {c.key === "sprint" && (
                <div className="pr-billing">
                  <p className="pr-price"><b>{PRICE.monthly}</b><span className="pr-per">USD / mes</span><small>Cancelas cuando quieras</small></p>
                  <p className="pr-price pr-best"><span className="pr-best-tag">Mejor precio</span><s>{PRICE.exam}</s><b>{PRICE.founder}</b><span className="pr-per">USD hasta tu examen</span><small>Precio de fundador · pagas una vez</small></p>
                </div>
              )}
              {c.key === "mentores" && <p className="pr-price"><b className="pr-soon-price">Próximamente</b><small>Te avisamos cuando abran</small></p>}
              <ul className="pr-stack">
                {c.stack.map((s) => {
                  const [text, soon] = s.split("|");
                  return <li key={s} className={soon ? "soon" : undefined}><Icon name="check" size={16} />{text}{soon && <span className="pr-soon">Pronto</span>}</li>;
                })}
              </ul>
              {c.key === "gratis" && <Link className="btn pr-ghost lg" href="/diagnostico">Empieza gratis</Link>}
              {c.key === "sprint" && <SprintCta onPricing />}
              {c.key === "mentores" && <Link className="btn pr-ghost lg" href="/diagnostico">Avísame</Link>}
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
          <p className="sp-sub">Ocho cosas que Kwanta ya hace hoy, desde el plan gratis.</p>
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
