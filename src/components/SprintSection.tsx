import Link from "next/link";
import Icon from "./Icon";
import { FounderNote, I3d, MentorsSoon, PlanTable, SprintCta, SprintWeeks } from "./OfferParts";
import { PRICE } from "@/lib/plans";
import PsiLive from "./PsiLive";

/** The paid program on the landing, after Duolingo's "Súper" pages: a deep indigo world with
 *  light beams and sparkles, an iridescent sticker Psi, a comparison with the Sprint column raised,
 *  a 12-week timeline, a 14-day guarantee seal and the mentors, coming soon.
 *  MVP without coaches. 3D icons: Microsoft Fluent Emoji (MIT). */

const PERKS = [
  { img: "spiral-calendar", t: "Plan de 12 semanas", d: "Unidad por unidad, empezando por lo que más te cuesta según tu diagnóstico." },
  { img: "books", t: "Ejercicios personalizados", d: "149 tipos en 24 subtemas, con números nuevos y del nivel básico al de examen." },
  { img: "check-mark-button", t: "Corrección automática", d: "En computadora, al instante y marca por marca. En el iPad, con IA muy pronto." },
  { img: "robot", t: "Tutor de IA junto a cada ejercicio", d: "Te explica el paso en el que te atoras, sin darte la respuesta.", soon: true },
]

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
          <h2 id="sp-title">12 semanas para llegar al 7, a tu ritmo.</h2>
          <p className="sp-lede">Un plan que empieza por lo que más te cuesta, ejercicios personalizados con corrección automática y, muy pronto, un tutor de IA junto a cada ejercicio. Si en 14 días no te convence, te devolvemos el dinero.</p>
          <div className="sp-cta">
            {cta}
            <span className="sp-price"><b>{PRICE.monthly}</b> USD al mes · o {PRICE.exam} hasta tu examen</span>
          </div>
          <span className="sp-seats">{img3d("fire", 22)} <FounderNote /></span>
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
            <h3>{p.t}{"soon" in p && <span className="pr-soon">Pronto</span>}</h3>
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

      <MentorsSoon />

      <div className="wrap sp-end">
        {cta}
        <Link className="sp-link" href="/diagnostico">Primero quiero hacer el diagnóstico gratis <Icon name="arrow" size={16} /></Link>
      </div>
    </section>
  );
}
