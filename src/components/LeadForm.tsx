"use client";
/**
 * After the diagnostic: the student leaves their contact to receive the plan
 * and hear about the presale. Rows land in a Google Sheet through a Google
 * Apps Script web app (NEXT_PUBLIC_LEADS_URL). No database in the MVP.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { store } from "@/lib/storage";

const LEADS_URL = process.env.NEXT_PUBLIC_LEADS_URL;
const PAISES = ["México", "España", "Colombia", "Perú", "Chile", "Argentina", "Ecuador", "Costa Rica", "Guatemala", "Venezuela", "Otro"];

export type LeadResult = Record<string, string>;

export default function LeadForm({ result }: { result: LeadResult }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setSent(store.get("kw-lead-sent", false)); }, []);

  if (!LEADS_URL) return null;

  if (sent) {
    return (
      <div className="callout" style={{ borderLeftColor: "var(--ok)" }}>
        <b>Listo, ya tenemos tus datos.</b>
        <span>Te escribiremos con tu plan y cuando lleguen los mentores.</span>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const correo = String(f.get("correo") ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) { setErr("Revisa tu correo: parece incompleto."); return; }
    if (!f.get("acepto")) { setErr("Para enviarlo, acepta el aviso de privacidad."); return; }
    setErr("");
    setBusy(true);
    const payload = {
      ...result,
      nombre: String(f.get("nombre") ?? "").trim(),
      correo,
      whatsapp: String(f.get("whatsapp") ?? "").trim(),
      colegio: String(f.get("colegio") ?? "").trim(),
      pais: String(f.get("pais") ?? ""),
      interes: f.get("sprint") ? "Mentores" : "Plan",
      website: String(f.get("website") ?? ""),
    };
    try {
      // text/plain avoids a CORS preflight; Apps Script answers opaquely.
      await fetch(LEADS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      store.set("kw-lead-sent", true);
      setSent(true);
    } catch {
      setErr("No se pudo enviar. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card lead" onSubmit={submit} noValidate>
      <h3>Recibe tu plan por correo</h3>
      <p className="muted" style={{ fontSize: ".92rem" }}>Te mandamos tu resultado y el plan de 12 semanas, y te avisamos de novedades y cuando lleguen los mentores.</p>
      <div className="fields">
        <label>Nombre<input name="nombre" id="lead-nombre" autoComplete="given-name" required /></label>
        <label>Correo<input name="correo" id="lead-correo" type="email" autoComplete="email" inputMode="email" required /></label>
        <label>WhatsApp <span className="muted">(opcional)</span><input name="whatsapp" id="lead-whatsapp" type="tel" autoComplete="tel" inputMode="tel" /></label>
        <label>Colegio<input name="colegio" id="lead-colegio" autoComplete="organization" /></label>
        <label>País
          <select name="pais" id="lead-pais" defaultValue="México">{PAISES.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }} />
      <label className="check"><input type="checkbox" name="sprint" id="lead-sprint" defaultChecked /> Avísame cuando lleguen los mentores que sacaron 7</label>
      <label className="check"><input type="checkbox" name="acepto" id="lead-acepto" /> Acepto el <Link href="/privacidad" target="_blank">aviso de privacidad</Link>. Si soy menor de edad, tengo permiso de mi madre, padre o tutor.</label>
      {err && <p role="alert" style={{ color: "var(--bad)", fontSize: ".9rem" }}>{err}</p>}
      <button className="btn primary" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviarme mi plan"}</button>
    </form>
  );
}
