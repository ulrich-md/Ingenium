import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Precios · Kwanta" };

const PREVENTA = process.env.NEXT_PUBLIC_PREVENTA_URL;

/** What each plan includes, for the comparison under the cards. */
const ROWS: [string, boolean, boolean, boolean][] = [
  ["Diagnóstico con nota proyectada", true, true, true],
  ["Plan de 12 semanas", true, true, true],
  ["Teoría de las unidades A–E", false, true, true],
  ["Banco de hojas de examen", false, true, true],
  ["Simulacros de Prueba 1 y 2", false, true, true],
  ["Videos por tema y tutor", false, true, true],
  ["Clase semanal en vivo con un coach", false, false, true],
  ["4 simulacros corregidos sobre tu hoja", false, false, true],
  ["Garantía de subir un nivel", false, false, true],
];

const FAQ = [
  { q: "¿Puedo empezar gratis?", a: "Sí. El diagnóstico no pide tarjeta ni cuenta. Al terminar ves tu nivel y tu plan, y decides si quieres algo más." },
  { q: "¿Cómo pago?", a: "Los pagos se procesan con Mercado Pago. Kwanta no guarda datos de tu tarjeta." },
  { q: "¿Cómo funciona la garantía del Sprint?", a: "Si cumples el plan de 12 semanas y no subes un nivel, te devolvemos el dinero." },
];

export default function Precios() {
  return (
    <div className="wrap pricing">
      <header className="pricing-head">
        <p className="eyebrow">Precios de fundador</p>
        <h1>Elige cómo llegar al 7</h1>
        <p className="lede muted">Empieza gratis con el diagnóstico. Cuando sepas tu nivel, elige el plan que te lleve a la meta.</p>
      </header>

      <div className="prices">
        <div className="card price-card">
          <span className="pill">Gratis</span>
          <h3>Diagnóstico</h3>
          <span className="price">$0</span>
          <p className="muted">10 de opción múltiple y 3 de desarrollo. Nota proyectada y plan de 12 semanas.</p>
          <Link className="btn" href="/diagnostico">Empezar</Link>
        </div>
        <div className="card price-card">
          <span className="pill">Hasta tu examen</span>
          <h3>Pase Física</h3>
          <span className="price">$89 <small>USD · fundadores $59</small></span>
          <p className="muted">Teoría A–E, banco de hojas de examen, simulacros de Prueba 1 y 2, videos por tema y tutor.</p>
          <Link className="btn" href="/diagnostico">Primero, el diagnóstico</Link>
        </div>
        <div className="card price-card featured">
          <span className="pill brand">Cupo 25 · febrero</span>
          <h3>Sprint al 7</h3>
          <span className="price">$349 <small>USD · 12 semanas</small></span>
          <p>Todo el Pase, más una clase semanal en vivo con un coach que sacó 7 y 4 simulacros corregidos sobre tu hoja. Garantía: si cumples el plan y no subes un nivel, te devolvemos el dinero.</p>
          {PREVENTA ? (
            <a className="btn brand" href={PREVENTA} target="_blank" rel="noopener">Apartar lugar · Mercado Pago</a>
          ) : (
            <Link className="btn brand" href="/diagnostico">Primero, haz el diagnóstico <Icon name="arrow" /></Link>
          )}
        </div>
      </div>

      <section className="section">
        <h2>Qué incluye cada plan</h2>
        <div className="compare-wrap">
          <table className="compare">
            <thead><tr><th scope="col"><span className="sr">Incluye</span></th><th scope="col">Diagnóstico</th><th scope="col">Pase Física</th><th scope="col">Sprint al 7</th></tr></thead>
            <tbody>
              {ROWS.map(([label, ...cols]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {cols.map((v, i) => (
                    <td key={i}>{v ? <span className="yes"><Icon name="check" size={18} label="Incluido" /></span> : <span className="no" aria-label="No incluido">—</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section faq-sec">
        <h2>Preguntas sobre el pago</h2>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}<Icon name="caret" size={18} className="faq-caret" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="foot">
        <span>Precios en dólares estadounidenses. Kwanta no está afiliado con la Organización del Bachillerato Internacional.</span>
        <span><Link href="/">Inicio</Link> · <Link href="/privacidad">Aviso de privacidad</Link></span>
      </footer>
    </div>
  );
}
