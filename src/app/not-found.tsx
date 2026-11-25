import Link from "next/link";
import { IlloLost } from "@/components/Illos";

export default function NotFound() {
  return (
    <div className="wrap diag notfound">
      <IlloLost className="notfound-art" />
      <h1>Esta página se salió de su nivel</h1>
      <p className="muted">No encontramos lo que buscabas. Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="cta">
        <Link className="btn primary" href="/">Ir a la portada</Link>
        <Link className="btn" href="/app">Mi Kwanta</Link>
      </div>
    </div>
  );
}
