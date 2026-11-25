import Link from "next/link";
import { EnergyLevels } from "@/components/Brand";
import HeroSheet from "@/components/HeroSheet";
import Icon from "@/components/Icon";
import { IlloDiagnostic, IlloJump, IlloPlan, IlloTablet, IlloTimer, UNIT_ILLO } from "@/components/Illos";
import { UNIT_NAME, type Unit } from "@/lib/scoring";

/** The IB Physics syllabus (first assessment 2025), by unit. NS-only topics are marked. */
const SYLLABUS: Record<Unit, string[]> = {
  A: ["Cinemática", "Fuerzas y momento lineal", "Trabajo, energía y potencia", "Cuerpo rígido (NS)", "Relatividad (NS)"],
  B: ["Energía térmica", "Efecto invernadero", "Modelos de gases", "Termodinámica (NS)", "Circuitos"],
  C: ["Movimiento armónico simple", "Modelo de ondas", "Fenómenos ondulatorios", "Ondas estacionarias", "Efecto Doppler"],
  D: ["Gravitación", "Campos eléctricos y magnéticos", "Movimiento en campos", "Inducción (NS)"],
  E: ["Estructura del átomo", "Física cuántica (NS)", "Desintegración radiactiva", "Fisión", "Fusión y estrellas"],
};

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
  { q: "¿Cuánto cuesta?", a: "El diagnóstico es gratis y no necesita cuenta. Los planes con todo el contenido están en la página de precios." },
];

export default function Home() {
  return (
    <>
      <section className="wrap lhero">
        <div className="lhero-text">
          <p className="eyebrow">Física IB · NM y NS · en español</p>
          <h1>Escribe como en el examen.<br />Sube de nivel hasta el 7.</h1>
          <p className="lede">
            Hojas de examen originales, con el formato de la Prueba 2. En iPad las escribes a mano con el Apple Pencil y en computadora las tecleas renglón por renglón.
            Cada hoja se corrige con el esquema de marcas, paso a paso.
          </p>
          <div className="cta">
            <Link className="btn primary lg" href="/diagnostico">Haz el diagnóstico gratis <Icon name="arrow" /></Link>
            <Link className="btn lg" href="/precios">Ver precios</Link>
          </div>
          <ul className="facts">
            <li><Icon name="check" size={16} /> 15 minutos, sin crear cuenta</li>
            <li><Icon name="check" size={16} /> Preguntas originales con formato IB</li>
            <li><Icon name="check" size={16} /> Plan de 12 semanas al terminar</li>
          </ul>
        </div>
        <HeroSheet />
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <p className="eyebrow">Así funciona</p>
          <h2>Cuatro pasos, cada semana</h2>
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

      <section className="wrap section split">
        <div className="split-text">
          <p className="eyebrow">Tu nota es tu nivel de energía</p>
          <h2>De n&nbsp;=&nbsp;4 a n&nbsp;=&nbsp;7, salto a salto</h2>
          <p className="muted">El diagnóstico te ubica en un nivel del 1 al 7 y arma tu plan. Cada hoja que resuelves te acerca al siguiente salto.</p>
        </div>
        <div className="card split-art"><EnergyLevels grade={4} /></div>
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <p className="eyebrow">Todo el programa</p>
          <h2>Las 5 unidades de Física IB</h2>
        </div>
        <div className="units">
          {(Object.keys(SYLLABUS) as Unit[]).map((u) => {
            const Illo = UNIT_ILLO[u];
            return (
              <article key={u} className="unit-tile" style={{ background: `var(--t${u})` }}>
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

      <section className="wrap section">
        <div className="sec-head">
          <p className="eyebrow">Un Kwanta para cada pantalla</p>
          <h2>Cada dispositivo hace lo que mejor sabe hacer</h2>
        </div>
        <div className="devbento">
          <div className="card dev dev-main">
            <div className="dev-art" aria-hidden="true">
              <span>F = m a</span>
              <span>a = 12 / 3,0 = 4,0 m s⁻² <em>M1 ✓</em></span>
              <span>v = u + a t = 20 m s⁻¹ <em>A1 ✓</em></span>
            </div>
            <span className="dev-ic"><Icon name="tablet" size={26} /></span>
            <span className="ic">iPad + Apple Pencil</span>
            <h3>Hojas de examen a mano</h3>
            <p className="muted">Pregunta, [marcas] y recuadro punteado, como en el papel. Escribes con el Pencil y desplazas con el dedo. La corrección queda en rojo en el margen.</p>
            <div className="dev-pens" aria-hidden="true"><i style={{ background: "#16181d" }} /><i style={{ background: "#1d3fbf" }} /><i className="on" /></div>
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
            <p className="muted">Opción múltiple tipo Prueba 1A en sesiones de 5 minutos, tus correcciones, tu progreso, la teoría y los videos de cada tema.</p>
          </div>
        </div>
      </section>

      <section className="wrap section faq-sec">
        <div className="sec-head">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Lo que nos preguntan antes de empezar</h2>
        </div>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}<Icon name="caret" size={18} className="faq-caret" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="endband">
          <div className="endband-text">
            <h2>Empieza por saber en qué nivel estás</h2>
            <p>El diagnóstico es gratis, dura 15 minutos y te deja tu plan de 12 semanas.</p>
            <div className="cta">
              <Link className="btn onbrand lg" href="/diagnostico">Haz el diagnóstico gratis <Icon name="arrow" /></Link>
              <Link className="btn ink lg" href="/precios">Ver precios</Link>
            </div>
          </div>
          <IlloJump className="endband-art" />
        </div>
      </section>

      <footer className="wrap foot">
        <span>Kwanta · Física IB en español. Las preguntas son originales: Kwanta no está afiliado con la Organización del Bachillerato Internacional.</span>
        <span>MVP: tu progreso se guarda solo en este navegador. <Link href="/precios">Precios</Link> · <Link href="/privacidad">Aviso de privacidad</Link>.</span>
      </footer>
    </>
  );
}
