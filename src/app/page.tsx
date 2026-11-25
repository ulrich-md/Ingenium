import Link from "next/link";
import { EnergyLevels } from "@/components/Brand";
import HeroSheet from "@/components/HeroSheet";
import Icon from "@/components/Icon";

const PREVENTA = process.env.NEXT_PUBLIC_PREVENTA_URL;

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
            <a className="btn lg" href="#precios">Ver precios</a>
          </div>
          <ul className="facts">
            <li><Icon name="check" size={16} /> 15 minutos, sin crear cuenta</li>
            <li><Icon name="check" size={16} /> Preguntas originales con formato IB</li>
            <li><Icon name="check" size={16} /> Plan de 12 semanas al terminar</li>
          </ul>
        </div>
        <HeroSheet />
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
        <div style={{ display: "grid", gap: 8 }}>
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

      <section className="wrap section" id="precios">
        <div style={{ display: "grid", gap: 8 }}>
          <p className="eyebrow">Precios de fundador</p>
          <h2>Elige cómo llegar al 7</h2>
        </div>
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
          </div>
          <div className="card price-card featured">
            <span className="pill lime">Cupo 25 · febrero</span>
            <h3>Sprint al 7</h3>
            <span className="price">$349 <small>USD · 12 semanas</small></span>
            <p>Todo el Pase, más una clase semanal en vivo con un coach que sacó 7 y 4 simulacros corregidos sobre tu hoja. Garantía: si cumples el plan y no subes un nivel, te devolvemos el dinero.</p>
            {PREVENTA ? (
              <a className="btn lime" href={PREVENTA} target="_blank" rel="noopener">Apartar lugar · Mercado Pago</a>
            ) : (
              <Link className="btn lime" href="/diagnostico">Primero, haz el diagnóstico <Icon name="arrow" /></Link>
            )}
          </div>
        </div>
      </section>

      <footer className="wrap foot">
        <span>Kwanta · Física IB en español. Las preguntas son originales: Kwanta no está afiliado con la Organización del Bachillerato Internacional.</span>
        <span>MVP: tu progreso se guarda solo en este navegador. <Link href="/privacidad">Aviso de privacidad</Link>.</span>
      </footer>
    </>
  );
}
