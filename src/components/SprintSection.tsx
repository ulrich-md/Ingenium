import Link from "next/link";
import Icon from "./Icon";
import PsiLive from "./PsiLive";
import { PLAN_ROWS, PLANS, PREVENTA_URL } from "@/lib/plans";

/** The paid plan on the landing, after Duolingo's "Súper" pages: a deep indigo world with light
 *  beams and sparkles, an iridescent sticker Psi, a comparison with the featured column raised,
 *  a 12-week timeline and a guarantee seal. 3D icons: Microsoft Fluent Emoji (MIT). */

const PERKS = [
  { img: "video-camera", t: "Clase en vivo cada semana", d: "Con un coach que sacó 7 en Física IB. Resuelves dudas y ves cómo piensa un 7." },
  { img: "memo", t: "4 simulacros corregidos sobre tu hoja", d: "Con tiempo real, como el día del examen, y marca por marca." },
  { img: "books", t: "Todo el Pase Física", d: "Teoría A–E, banco de hojas de examen y simulacros de Prueba 1 y 2." },
  { img: "shield", t: "Garantía de subir un nivel", d: "Si cumples el plan y no subes un nivel, te devolvemos el dinero." },
];

const WEEKS = [
  { img: "spiral-calendar", when: "Hoy", d: "Haces el diagnóstico gratis y recibes tu plan de 12 semanas." },
  { img: "video-camera", when: "Cada semana", d: "Clase en vivo con tu coach y las hojas de examen del plan." },
  { img: "stopwatch", when: "Durante el Sprint", d: "4 simulacros con tiempo real, corregidos sobre tu hoja." },
  { img: "trophy", when: "Semana 12", d: "Ves tu nueva nota. Si cumpliste el plan y no subiste un nivel, te devolvemos el dinero." },
];

const img3d = (name: string, size: number, cls = "") => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/3d/${name}.webp`} width={size} height={size} alt="" className={`i3d ${cls}`} loading="lazy" decoding="async" />
);

export default function SprintSection() {
  const cta = PREVENTA_URL
    ? <a className="btn sp-btn lg" href={PREVENTA_URL} target="_blank" rel="noopener">Aparta tu lugar</a>
    : <Link className="btn sp-btn lg" href="/precios#sprint">Aparta tu lugar</Link>;

  return (
    <section className="sp" id="sprint" aria-labelledby="sp-title">
      <div className="sp-beams" aria-hidden="true" />

      {/* 1 · the promise */}
      <div className="wrap sp-hero">
        <div className="sp-hero-text">
          <p className="sp-mark" aria-hidden="true"><span>Sprint</span> al 7</p>
          <h2 id="sp-title">Llega al 7 en 12 semanas, con alguien que ya llegó.</h2>
          <p className="sp-lede">Clases en vivo, simulacros corregidos sobre tu hoja y una garantía: si cumples el plan y no subes un nivel, te devolvemos el dinero.</p>
          <div className="sp-cta">
            {cta}
            <span className="sp-price"><b>$349</b> USD · 12 semanas</span>
          </div>
          <span className="sp-seats">{img3d("fire", 22)} Cupo de 25 · empieza en febrero</span>
        </div>
        <div className="sp-hero-art">
          <span className="sp-comet" aria-hidden="true" />
          <div className="sp-psi"><PsiLive pose="siete" skin="iri" sticker uid="sprint" /></div>
          {img3d("trophy", 84, "sp-f sp-f1")}
          {img3d("glowing-star", 58, "sp-f sp-f2")}
          {img3d("rocket", 70, "sp-f sp-f3")}
          <svg className="sp-spark s1" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0Q13.6 10.4 24 12Q13.6 13.6 12 24Q10.4 13.6 0 12Q10.4 10.4 12 0Z" /></svg>
          <svg className="sp-spark s2" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0Q13.6 10.4 24 12Q13.6 13.6 12 24Q10.4 13.6 0 12Q10.4 10.4 12 0Z" /></svg>
          <svg className="sp-spark s3" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0Q13.6 10.4 24 12Q13.6 13.6 12 24Q10.4 13.6 0 12Q10.4 10.4 12 0Z" /></svg>
        </div>
      </div>

      {/* 2 · what you get */}
      <div className="wrap sp-perks">
        {PERKS.map((p) => (
          <article key={p.t} className="sp-perk">
            {img3d(p.img, 64)}
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </article>
        ))}
      </div>

      {/* 3 · the comparison, featured column raised */}
      <div className="wrap sp-compare">
        <h2 className="sp-h">Elige cómo llegar al 7</h2>
        <p className="sp-sub">Empieza gratis. Cuando sepas tu nivel, sube de plan.</p>
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
      </div>

      {/* 4 · the 12 weeks, and the guarantee seal */}
      <div className="wrap sp-weeks">
        <div className="sp-weeks-text">
          <h2 className="sp-h">Así son tus 12 semanas</h2>
          <p className="sp-sub">Sabes desde hoy qué toca cada semana, y qué pasa si no subes.</p>
          <div className="sp-seal" aria-label="Garantía: subes un nivel o te devolvemos el dinero">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <defs><path id="sp-seal-path" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
              <text><textPath href="#sp-seal-path" textLength="452" lengthAdjust="spacing">SUBES UN NIVEL O TE DEVOLVEMOS EL DINERO ★ GARANTÍA ★</textPath></text>
            </svg>
            {img3d("shield", 72, "sp-seal-icon")}
          </div>
        </div>
        <ol className="sp-timeline">
          {WEEKS.map((w) => (
            <li key={w.when}>
              <span className="sp-dot">{img3d(w.img, 40)}</span>
              <div><b>{w.when}</b><p>{w.d}</p></div>
            </li>
          ))}
        </ol>
      </div>

      <div className="wrap sp-end">
        {cta}
        <Link className="sp-link" href="/diagnostico">Primero quiero hacer el diagnóstico gratis <Icon name="arrow" size={16} /></Link>
      </div>
    </section>
  );
}
