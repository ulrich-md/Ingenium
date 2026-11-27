import Link from "next/link";
import Icon from "./Icon";
import { PLAN_ROWS, PLANS, PREVENTA_URL } from "@/lib/plans";
import { DIFFS, LEVERS, PROBLEMS } from "@/lib/offer";

/** Pieces of the offer shared by the landing (Sprint al 7) and /precios.
 *  Styles live in src/app/landing.css (sp-*, of-*). 3D icons: public/3d (Fluent Emoji, MIT). */

export const I3d = ({ name, size, className = "" }: { name: string; size: number; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/3d/${name}.webp`} width={size} height={size} alt="" className={`i3d ${className}`} loading="lazy" decoding="async" />
);

/** "Aparta tu lugar": Mercado Pago when the pre-sale link is set, otherwise the Sprint on /precios. */
export function SprintCta({ onPricing = false }: { onPricing?: boolean }) {
  if (PREVENTA_URL) return <a className="btn sp-btn lg" href={PREVENTA_URL} target="_blank" rel="noopener">Aparta tu lugar</a>;
  return <Link className="btn sp-btn lg" href={onPricing ? "/diagnostico" : "/precios#sprint"}>{onPricing ? "Empieza por el diagnóstico" : "Aparta tu lugar"}</Link>;
}

/** The three plans side by side, the Sprint column raised with an iridescent head. */
export function PlanTable() {
  return (
    <div className="sp-table-wrap">
      <table className="sp-table">
        <thead>
          <tr>
            <th scope="col"><span className="sr">Incluye</span></th>
            {PLANS.map((plan) => (
              <th key={plan.key} scope="col" className={plan.key === "sprint" ? "hot" : undefined}>
                {plan.key === "sprint" && <span className="sp-badge" aria-hidden="true"><Icon name="check" size={16} /></span>}
                <b>{plan.name}</b>
                <span className="sp-th-price">{plan.price}<small> USD</small></span>
                <small>{plan.note}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_ROWS.map(([label, ...v]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {v.map((yes, ci) => (
                <td key={ci} className={ci === 2 ? "hot" : undefined}>
                  {yes ? <span className="sp-yes"><Icon name="check" size={16} label="Incluido" /></span> : <span className="sp-no" aria-label="No incluido">✕</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const WEEKS = [
  { img: "spiral-calendar", when: "Hoy", d: "Haces el diagnóstico gratis y recibes tu plan de 12 semanas." },
  { img: "video-camera", when: "Cada semana", d: "Clase en vivo con tu coach y las hojas de examen del plan." },
  { img: "stopwatch", when: "Durante el Sprint", d: "4 simulacros con tiempo real, corregidos sobre tu hoja." },
  { img: "trophy", when: "Semana 12", d: "Ves tu nueva nota. Si cumpliste el plan y no subiste un nivel, te devolvemos el dinero." },
];

/** The 12 weeks of the Sprint and the guarantee seal. */
export function SprintWeeks({ id = "sp-seal-path" }: { id?: string }) {
  return (
    <div className="wrap sp-weeks">
      <div className="sp-weeks-text">
        <h2 className="sp-h">Así son tus 12 semanas</h2>
        <p className="sp-sub">Sabes desde hoy qué toca cada semana, y qué pasa si no subes.</p>
        <div className="sp-seal" aria-label="Garantía: subes un nivel o te devolvemos el dinero">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs><path id={id} d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
            <text><textPath href={`#${id}`} textLength="452" lengthAdjust="spacing">SUBES UN NIVEL O TE DEVOLVEMOS EL DINERO ★ GARANTÍA ★</textPath></text>
          </svg>
          <I3d name="shield" size={72} className="sp-seal-icon" />
        </div>
      </div>
      <ol className="sp-timeline">
        {WEEKS.map((w) => (
          <li key={w.when}>
            <span className="sp-dot"><I3d name={w.img} size={40} /></span>
            <div><b>{w.when}</b><p>{w.d}</p></div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** What only Kwanta does: eight tiles with 3D icons. `dark` for the indigo pages. */
export function Diffs({ dark = false }: { dark?: boolean }) {
  return (
    <ul className={`of-diffs${dark ? " dark" : ""}`}>
      {DIFFS.map((d) => (
        <li key={d.t} className="of-diff">
          <I3d name={d.img} size={56} />
          <h3>{d.t}</h3>
          <p>{d.d}</p>
        </li>
      ))}
    </ul>
  );
}

/** Hormozi's problems → solutions, as "lo que nos dicen" → "lo que hace Kwanta". */
export function Problems({ dark = false }: { dark?: boolean }) {
  return (
    <ul className={`of-probs${dark ? " dark" : ""}`}>
      {PROBLEMS.map((x) => (
        <li key={x.p} className="of-prob">
          <span className="of-prob-p">“{x.p}”</span>
          <Icon name="arrow" size={18} className="of-prob-arrow" />
          <span className="of-prob-s">{x.s}</span>
        </li>
      ))}
    </ul>
  );
}

/** The value equation: more of what matters, less of what wears you out. */
export function Levers() {
  return (
    <div className="of-levers">
      <div className="of-lever up">
        <span className="of-lever-tag"><Icon name="arrow" size={16} /> Más</span>
        {LEVERS.more.map((l) => <div key={l.t}><b>{l.t}</b><p>{l.d}</p></div>)}
      </div>
      <div className="of-lever down">
        <span className="of-lever-tag"><Icon name="arrow" size={16} /> Menos</span>
        {LEVERS.less.map((l) => <div key={l.t}><b>{l.t}</b><p>{l.d}</p></div>)}
      </div>
    </div>
  );
}
