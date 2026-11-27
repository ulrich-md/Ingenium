import Link from "next/link";
import "./landing.css";
import { EnergyLevels } from "@/components/Brand";
import HeroSheet from "@/components/HeroSheet";
import Icon from "@/components/Icon";
import { IlloDiagnostic, IlloPlan, IlloTablet, IlloTimer, UNIT_ILLO } from "@/components/Illos";
import PsiLive from "@/components/PsiLive";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import { UNIT_NAME, UNITS } from "@/lib/scoring";
import type { Unit } from "@/lib/scoring";

/** The IB Physics syllabus (first assessment 2025), by unit. NS-only topics are marked. */
const SYLLABUS: Record<Unit, string[]> = {
  A: ["Cinemática", "Fuerzas y momento lineal", "Trabajo, energía y potencia", "Cuerpo rígido (NS)", "Relatividad (NS)"],
  B: ["Energía térmica", "Efecto invernadero", "Modelos de gases", "Termodinámica (NS)", "Circuitos"],
  C: ["Movimiento armónico simple", "Modelo de ondas", "Fenómenos ondulatorios", "Ondas estacionarias", "Efecto Doppler"],
  D: ["Gravitación", "Campos eléctricos y magnéticos", "Movimiento en campos", "Inducción (NS)"],
  E: ["Estructura del átomo", "Física cuántica (NS)", "Desintegración radiactiva", "Fisión", "Fusión y estrellas"],
};

/** Short names for the units strip under the hero. */
const SHORT: Record<Unit, string> = { A: "Espacio y movimiento", B: "Materia", C: "Ondas", D: "Campos", E: "Nuclear y cuántica" };

const STEPS = [
  { Illo: IlloDiagnostic, t: "Haz el diagnóstico", d: "10 de opción múltiple y 3 de desarrollo. En 15 minutos sabes tu nivel del 1 al 7." },
  { Illo: IlloPlan, t: "Recibe tu plan", d: "12 semanas ordenadas por lo que más te cuesta, unidad por unidad." },
  { Illo: IlloTablet, t: "Resuelve hojas de examen", d: "A mano con el Apple Pencil o tecleadas, y las comparas con el esquema de marcas paso a paso." },
  { Illo: IlloTimer, t: "Haz simulacros", d: "Prueba 1 y 2 con tiempo real y sin pistas. Al final ves tu nota estimada." },
];

const FAQ = [
  { q: "¿Kwanta es del Bachillerato Internacional?", a: "No. Las preguntas son originales, escritas con el formato y el estilo del examen. Kwanta no está afiliado con la Organización del Bachillerato Internacional." },
  { q: "¿Necesito un iPad?", a: "No. En computadora resuelves las mismas hojas tecleando un paso por renglón, con barra de símbolos. En el teléfono repasas con opción múltiple tipo Prueba 1A." },
  { q: "¿Sirve para NM y NS?", a: "Sí. El diagnóstico y los simulacros tienen versión NM y NS, y los temas solo de NS vienen marcados." },
  { q: "¿Cómo se corrigen las hojas?", a: "Con el esquema de marcas, paso a paso: ves qué marca vale cada renglón (M1 por el método, A1 por la respuesta) y en qué paso se te fue." },
  { q: "¿Dónde se guarda mi progreso?", a: "Por ahora en tu navegador, en el dispositivo donde estudias. Desde Inicio puedes guardar una copia en Archivos o iCloud." },
  { q: "¿Cuánto cuesta?", a: "El diagnóstico es gratis y no necesita cuenta. El Pase Física cuesta $89 USD hasta tu examen ($59 para fundadores) y el Sprint al 7 cuesta $349 USD por 12 semanas. Todo está en la página de precios." },
];

const SPRINT = [
  "Una clase en vivo cada semana con un coach que sacó 7",
  "4 simulacros corregidos sobre tu propia hoja",
  "Todo lo del Pase Física: teoría, banco de hojas y simulacros",
];

export default function Home() {
  return (
    <div className="ld">
      <Reveal />

      {/* hero: Psi, one sentence, two buttons */}
      <section className="wrap ld-hero">
        <div className="ld-hero-art"><PsiLive pose="hola" uid="hero" /></div>
        <div className="ld-hero-text">
          <h1>Sube hasta el 7 en Física IB, hoja por hoja.</h1>
          <div className="ld-hero-cta">
            <Link className="btn primary lg" href="/diagnostico">Haz el diagnóstico gratis</Link>
            <Link className="btn lg" href="/entrar">Ya tengo cuenta</Link>
          </div>
          <p className="ld-hero-note">En español · NM y NS · 15 minutos, sin crear cuenta</p>
        </div>
      </section>

      {/* the five units, like a course strip */}
      <nav className="ld-strip" aria-label="Unidades de Física IB">
        <div className="wrap ld-strip-in">
          {UNITS.map((u) => (
            <a key={u} href={`#unidad-${u.toLowerCase()}`} className="ld-strip-item">
              <span className="ubadge sm" style={{ background: `var(--u${u})` }}>{u}</span>
              {SHORT[u]}
            </a>
          ))}
        </div>
      </nav>

      {/* four ideas, zigzag */}
      <section className="wrap ld-zz">
        <article className="zz reveal">
          <div className="zz-text">
            <h2>Escribes como en el examen</h2>
            <p>Hojas originales con el formato de la Prueba 2: pregunta, [marcas] y recuadro. En el iPad las resuelves a mano con el Apple Pencil; en la computadora, tecleando un paso por renglón.</p>
          </div>
          <div className="zz-art"><PsiLive pose="ipad" uid="zz1" jumpOnTap={false} /></div>
        </article>

        <article className="zz flip reveal">
          <div className="zz-text">
            <h2>Cada paso, corregido con el esquema de marcas</h2>
            <p>Cada renglón se compara con el esquema: M1 por el método, A1 por la respuesta. Ves exactamente en qué paso se te fue el punto.</p>
          </div>
          <div className="zz-art zz-sheet"><HeroSheet /></div>
        </article>

        <article className="zz reveal">
          <div className="zz-text">
            <h2>Un plan que empieza por lo más débil</h2>
            <p>Al terminar el diagnóstico recibes un plan de 12 semanas, unidad por unidad, ordenado por lo que más te cuesta. Así cada hora de estudio rinde más.</p>
          </div>
          <div className="zz-art"><PsiLive pose="lee" uid="zz3" jumpOnTap={false} /></div>
        </article>

        <article className="zz flip reveal">
          <div className="zz-text">
            <h2>Tu nota, del 1 al 7</h2>
            <p>Hasta que lo mides, tu nivel está en superposición. El diagnóstico lo ubica en un nivel de energía del 1 al 7, y cada hoja que resuelves te acerca al siguiente salto.</p>
          </div>
          <div className="zz-art zz-levels">
            <PsiLive pose="superposicion" uid="zz4" jumpOnTap={false} />
            <div className="zz-levels-card"><EnergyLevels grade={4} /></div>
          </div>
        </article>
      </section>

      {/* how it works */}
      <section className="wrap ld-sec reveal" id="como-funciona">
        <div className="ld-head">
          <h2>De tu diagnóstico a tu primer simulacro</h2>
          <p>Cuatro pasos. El primero es gratis.</p>
        </div>
        <ol className="howto">
          {STEPS.map(({ Illo, t, d }, i) => (
            <li key={t} className="card howto-step">
              <Illo className="howto-art" />
              <span className="howto-n">{i + 1}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* the syllabus */}
      <section className="wrap ld-sec reveal" id="unidades">
        <div className="ld-head">
          <h2>Las 5 unidades de Física IB</h2>
          <p>Todo el programa, con los temas solo de NS marcados.</p>
        </div>
        <div className="units">
          {UNITS.map((u) => {
            const Illo = UNIT_ILLO[u];
            return (
              <article key={u} id={`unidad-${u.toLowerCase()}`} className="unit-tile" style={{ background: `var(--t${u})` }}>
                <Illo className="unit-art" />
                <span className="unitrow"><span className="ubadge sm" style={{ background: `var(--u${u})` }}>{u}</span> Unidad {u}</span>
                <h3>{UNIT_NAME[u]}</h3>
                <ul className="unit-topics">
                  {SYLLABUS[u].map((t) => <li key={t}>{t}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* devices */}
      <section className="wrap ld-sec reveal" id="dispositivos">
        <div className="ld-head">
          <h2>Cada dispositivo hace lo que mejor sabe hacer</h2>
          <p>El mismo Kwanta en el iPad, la computadora y el teléfono.</p>
        </div>
        <div className="devbento">
          <div className="card dev dev-main">
            <div className="dev-art" aria-hidden="true">
              <span>F = m a</span>
              <span>a = 12 / 3,0 = 4,0 m s⁻² <em>M1 ✓</em></span>
              <span>v = u + a t = 20 m s⁻¹ <em>A1 ✓</em></span>
              <span>s = ½ (u + v) t = 50 m <em>A1 ✓</em></span>
            </div>
            <div className="dev-body">
              <span className="dev-ic"><Icon name="tablet" size={26} /></span>
              <span className="ic">iPad + Apple Pencil</span>
              <h3>Hojas de examen a mano</h3>
              <p className="muted">Pregunta, [marcas] y recuadro punteado, como en el papel. Escribes con el Pencil y desplazas con el dedo. La corrección queda en rojo en el margen.</p>
            </div>
          </div>
          <div className="card dev">
            <span className="dev-ic"><Icon name="laptop" size={26} /></span>
            <span className="ic">Computadora</span>
            <h3>Hojas de examen tecleadas</h3>
            <p className="muted">La misma hoja, un paso por renglón, con barra de símbolos (√, ×10ⁿ, Δ, λ). Kwanta revisa cada renglón y deja las marcas M1 y A1.</p>
          </div>
          <div className="card dev">
            <span className="dev-ic"><Icon name="phone" size={26} /></span>
            <span className="ic">Teléfono</span>
            <h3>Repaso rápido</h3>
            <p className="muted">Opción múltiple tipo Prueba 1A en sesiones de 5 minutos, con tus correcciones y tu progreso.</p>
            <p className="dev-soon"><span className="pill sun">Pronto</span> La teoría y los videos de cada tema.</p>
          </div>
        </div>
      </section>

      {/* the paid plan, in its own dark band */}
      <section className="ld-sprint reveal" aria-labelledby="sprint-t">
        <div className="wrap ld-sprint-in">
          <div className="ld-sprint-art"><PsiLive pose="siete" uid="sprint" /></div>
          <div className="ld-sprint-text">
            <span className="pill sun">Cupo de 25 · empieza en febrero</span>
            <h2 id="sprint-t">Sprint al 7</h2>
            <p className="ld-sprint-lede">12 semanas para subir de nivel, con alguien que ya llegó al 7.</p>
            <ul>
              {SPRINT.map((s) => <li key={s}><Icon name="check" size={18} />{s}</li>)}
            </ul>
            <p className="ld-sprint-promise"><b>Garantía:</b> si cumples el plan y no subes un nivel, te devolvemos el dinero.</p>
            <div className="ld-sprint-cta">
              <Link className="btn onbrand lg" href="/precios#sprint">Ver el Sprint al 7</Link>
              <span className="ld-sprint-price">$349 USD · 12 semanas</span>
            </div>
          </div>
        </div>
      </section>

      {/* questions */}
      <section className="wrap ld-sec reveal" id="preguntas">
        <div className="ld-head">
          <h2>Lo que nos preguntan antes de empezar</h2>
        </div>
        <div className="ld-faq">
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}<Icon name="caret" size={18} className="faq-caret" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <div className="ld-faq-art"><PsiLive pose="cara" mood="duda" uid="faq" /></div>
        </div>
      </section>

      {/* the last call, then the footer */}
      <section className="wrap ld-final reveal">
        <h2>Empieza por saber en qué nivel estás</h2>
        <p>El diagnóstico es gratis, dura 15 minutos y te deja tu plan de 12 semanas.</p>
        <Link className="btn primary lg" href="/diagnostico">Haz el diagnóstico gratis</Link>
        <div className="ld-final-art"><PsiLive pose="sube" uid="final" /></div>
      </section>

      <SiteFooter />
    </div>
  );
}
