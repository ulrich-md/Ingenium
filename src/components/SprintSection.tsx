import Link from "next/link";
import Icon from "./Icon";
import { I3d, PlanTable, SprintCta, SprintWeeks } from "./OfferParts";
import PsiLive from "./PsiLive";

/** The paid plan on the landing, after Duolingo's "Súper" pages: a deep indigo world with light
 *  beams and sparkles, an iridescent sticker Psi, a comparison with the featured column raised,
 *  a 12-week timeline and a guarantee seal. 3D icons: Microsoft Fluent Emoji (MIT). */

const PERKS = [
  { img: "video-camera", t: "Clase en vivo cada semana", d: "Con un coach que sacó 7 en Física IB. Resuelves dudas y ves cómo piensa un 7." },
  { img: "memo", t: "4 simulacros corregidos sobre tu hoja", d: "Con tiempo real, como el día del examen, y marca por marca." },
  { img: "books", t: "Todo el Pase Física", d: "Banco de hojas de examen y simulacros de Prueba 2. Pronto: teoría A–E y Prueba 1." },
  { img: "shield", t: "Garantía de subir un nivel", d: "Si cumples el plan y no subes un nivel, te devolvemos el dinero." },
];

const img3d = (name: string, size: number, cls = "") => <I3d name={name} size={size} className={cls} />;

export default function SprintSection() {
  const cta = <SprintCta />;

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
        <PlanTable />
      </div>

      {/* 4 · the 12 weeks, and the guarantee seal */}
      <SprintWeeks />

      <div className="wrap sp-end">
        {cta}
        <Link className="sp-link" href="/diagnostico">Primero quiero hacer el diagnóstico gratis <Icon name="arrow" size={16} /></Link>
      </div>
    </section>
  );
}
