import Link from "next/link";
import Icon from "./Icon";
import { FOUNDER_UNTIL, PLAN_ROWS, PLANS, PREVENTA_URL, PRICE, type Cell } from "@/lib/plans";
import { DIFFS, LEVERS, PROBLEMS } from "@/lib/offer";

/** Pieces of the offer shared by the landing (Sprint al 7) and /precios.
 *  Styles live in src/app/landing.css (sp-*, of-*). 3D icons: public/3d (Fluent Emoji, MIT). */

export const I3d = ({ name, size, className = "" }: { name: string; size: number; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/3d/${name}.webp`} width={size} height={size} alt="" className={`i3d ${className}`} loading="lazy" decoding="async" />
);

/** "Empieza tu Sprint": Mercado Pago when the payment link is set; otherwise the free diagnostic
 *  (on the landing, the plans on /precios). */
export function SprintCta({ onPricing = false }: { onPricing?: boolean }) {
  if (PREVENTA_URL) return <a className="btn sp-btn lg" href={PREVENTA_URL} target="_blank" rel="noopener">Empieza tu Sprint</a>;
  return <Link className="btn sp-btn lg" href={onPricing ? "/diagnostico" : "/precios#sprint"}>{onPricing ? "Empieza gratis" : "Ver el Sprint al 7"}</Link>;
}

/** The founder price line: "$59 hasta tu examen" and, if set, until when. */
export const FounderNote = () => (
  <>Precio de fundador: <b>{PRICE.founder}</b> hasta tu examen{FOUNDER_UNTIL ? `, hasta el ${FOUNDER_UNTIL}` : ""}</>
);

const cell = (v: Cell, hot: boolean) =>
  typeof v === "string" ? <span className="sp-txt">{v}</span>
  : v ? <span className="sp-yes"><Icon name="check" size={16} label="Incluido" /></span>
  : <span className="sp-no" aria-label="No incluido">✕</span>;

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
          {PLAN_ROWS.map(([label, free, sprint, soon]) => (
            <tr key={label}>
              <th scope="row">{label}{soon && <span className="pr-soon">Pronto</span>}</th>
              <td>{cell(free, false)}</td>
              <td className="hot">{cell(sprint, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const WEEKS = [
  { img: "spiral-calendar", when: "Hoy", d: "Haces el diagnóstico gratis y recibes tu plan de 12 semanas." },
  { img: "books", when: "Cada semana", d: "Hojas del plan, empezando por lo que más te cuesta, con pistas y corrección automática." },
  { img: "stopwatch", when: "Cada 4 semanas", d: "Un simulacro de Prueba 2 con tiempo real para medir tu avance." },
  { img: "trophy", when: "Semana 12", d: "Tu nueva nota proyectada, unidad por unidad." },
]

/** The 12 weeks of the Sprint and the guarantee seal. */
export function SprintWeeks({ id = "sp-seal-path" }: { id?: string }) {
  return (
    <div className="wrap sp-weeks">
      <div className="sp-weeks-text">
        <h2 className="sp-h">Así son tus 12 semanas</h2>
        <p className="sp-sub">Sabes desde hoy qué toca cada semana. Y tienes 14 días para probarlo.</p>
        <div className="sp-seal" aria-label="Garantía: 14 días para probarlo o te devolvemos el dinero">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs><path id={id} d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
            <text><textPath href={`#${id}`} textLength="452" lengthAdjust="spacing">14 DÍAS PARA PROBARLO O TE DEVOLVEMOS EL DINERO ★</textPath></text>
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

/** Mentors who scored a 7: coming when we scale. The waitlist is the form after the diagnostic. */
export function MentorsSoon() {
  return (
    <div className="wrap"><div className="sp-mentors">
      <I3d name="graduation-cap" size={84} />
      <div>
        <span className="pr-soon big">Próximamente</span>
        <h3>Mentores que sacaron 7</h3>
        <p>Clases en vivo y simulacros corregidos por alguien que ya llegó. Al terminar tu diagnóstico, deja tu correo y te avisamos cuando abran.</p>
      </div>
      <Link className="btn pr-ghost lg" href="/diagnostico">Haz el diagnóstico</Link>
    </div></div>
  );
}
