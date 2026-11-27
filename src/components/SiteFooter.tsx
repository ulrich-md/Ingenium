import Link from "next/link";
import { Mark } from "./Brand";

/** The big footer of the public pages: a celeste band under a wave, with the site map. */
export default function SiteFooter() {
  return (
    <footer className="sitefoot">
      <svg className="sitefoot-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 52 C 180 10, 360 10, 540 46 S 900 92, 1080 50 S 1320 8, 1440 40 L1440 90 L0 90 Z" />
      </svg>
      <div className="sitefoot-in">
        <div className="wrap sitefoot-grid">
          <div className="sitefoot-brand">
            <Link href="/" className="logo"><Mark />kwanta</Link>
            <p>Física IB en español. Hojas de examen que escribes a mano o tecleas, corregidas con el esquema de marcas.</p>
          </div>
          <nav aria-label="Kwanta">
            <h2>Kwanta</h2>
            <Link href="/diagnostico">Diagnóstico gratis</Link>
            <Link href="/precios">Precios</Link>
            <Link href="/entrar">Entrar</Link>
          </nav>
          <nav aria-label="Física IB">
            <h2>Física IB</h2>
            <Link href="/#como-funciona">Así funciona</Link>
            <Link href="/#unidades">Unidades A–E</Link>
            <Link href="/#dispositivos">iPad, computadora y teléfono</Link>
            <Link href="/#preguntas">Preguntas frecuentes</Link>
          </nav>
          <nav aria-label="Legal">
            <h2>Legal</h2>
            <Link href="/privacidad">Aviso de privacidad</Link>
          </nav>
        </div>
        <p className="wrap sitefoot-note">
          Las preguntas son originales, escritas con el formato del examen. Kwanta no está afiliado con la Organización del Bachillerato Internacional. Precios en dólares estadounidenses.
        </p>
      </div>
    </footer>
  );
}
