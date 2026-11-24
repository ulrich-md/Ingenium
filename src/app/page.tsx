import Link from "next/link";
import { EnergyLevels } from "@/components/Brand";

const PREVENTA = process.env.NEXT_PUBLIC_PREVENTA_URL;

export default function Home() {
  return (
    <>
      <section className="wrap hero">
        <p className="eyebrow">Física IB · NM y NS · en español</p>
        <h1>Escribe como en el examen.<br />Sube de nivel hasta el 7.</h1>
        <p className="lede">
          Hojas de examen originales, con el formato de la Prueba 2. En iPad las escribes a mano con el Apple Pencil y en computadora las tecleas renglón por renglón.
          Cada hoja se corrige con el esquema de marcas, paso a paso.
        </p>
        <div className="cta">
          <Link className="btn primary" href="/diagnostico">Haz el diagnóstico gratis · 15 min</Link>
          <a className="btn" href="#sprint">Ver el Sprint al 7</a>
        </div>
      </section>

      <section className="wrap section">
        <div style={{ display: "grid", gap: 8, maxWidth: "70ch" }}>
          <p className="eyebrow">Tu nota es tu nivel de energía</p>
          <h2>De n = 4 a n = 7, salto a salto</h2>
          <p className="muted">El diagnóstico te ubica en un nivel del 1 al 7 y arma tu plan. Cada hoja que resuelves te acerca al siguiente salto.</p>
        </div>
        <div className="card" style={{ maxWidth: 520 }}><EnergyLevels grade={4} /></div>
      </section>

      <section className="wrap section">
        <div style={{ display: "grid", gap: 8 }}>
          <p className="eyebrow">Un Kwanta para cada pantalla</p>
          <h2>Cada dispositivo hace lo que mejor sabe hacer</h2>
        </div>
        <div className="grid3">
          <div className="card dev">
            <span className="ic">iPad + Apple Pencil</span>
            <h3>Hojas de examen a mano</h3>
            <p className="muted">Pregunta, [marcas] y recuadro punteado, como en el papel. Escribes con el Pencil y desplazas con el dedo. La corrección queda en rojo en el margen.</p>
          </div>
          <div className="card dev">
            <span className="ic">Computadora</span>
            <h3>Hojas de examen tecleadas</h3>
            <p className="muted">La misma hoja, un paso por renglón, con barra de símbolos (√, ×10ⁿ, Δ, λ). Kwanta revisa cada renglón y deja las marcas M1 y A1.</p>
          </div>
          <div className="card dev">
            <span className="ic">Teléfono</span>
            <h3>Repaso rápido</h3>
            <p className="muted">Opción múltiple tipo Prueba 1A en sesiones de 5 minutos, tus correcciones, tu progreso, la teoría y los videos de cada tema.</p>
          </div>
        </div>
      </section>

      <section className="wrap section" id="sprint">
        <div style={{ display: "grid", gap: 8 }}>
          <p className="eyebrow">Precios de fundador</p>
          <h2>Elige cómo llegar al 7</h2>
        </div>
        <div className="grid3">
          <div className="card">
            <span className="pill">Gratis</span>
            <h3>Diagnóstico</h3>
            <span className="price">$0</span>
            <p className="muted">10 de opción múltiple y 3 de desarrollo. Nota proyectada y plan de 12 semanas.</p>
            <Link className="btn" href="/diagnostico">Empezar</Link>
          </div>
          <div className="card">
            <span className="pill">Hasta tu examen</span>
            <h3>Pase Física</h3>
            <span className="price">$89 <small>USD · fundadores $59</small></span>
            <p className="muted">Teoría A–E, banco de hojas de examen, mocks de Prueba 1 y 2, videos por tema y tutor.</p>
          </div>
          <div className="card" style={{ borderColor: "var(--vec)", borderWidth: 2 }}>
            <span className="pill sig">Cupo 25 · febrero</span>
            <h3>Sprint al 7</h3>
            <span className="price">$349 <small>USD · 12 semanas</small></span>
            <p className="muted">Todo el Pase, más una clase semanal en vivo con un coach que sacó 7 y 4 mocks corregidos sobre tu hoja. Garantía: si cumples el plan y no subes un nivel, te devolvemos el dinero.</p>
            {PREVENTA ? (
              <a className="btn sig" href={PREVENTA} target="_blank" rel="noopener">Apartar lugar · Mercado Pago</a>
            ) : (
              <Link className="btn" href="/diagnostico">Primero, haz el diagnóstico</Link>
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
