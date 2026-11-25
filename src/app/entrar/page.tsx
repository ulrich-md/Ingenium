"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, login } from "@/lib/session";
import { IlloLock } from "@/components/Illos";

export default function Entrar() {
  const router = useRouter();
  const [err, setErr] = useState("");

  useEffect(() => {
    if (getSession()) router.replace("/app");
  }, [router]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = login(String(f.get("correo") ?? ""), String(f.get("contrasena") ?? ""));
    if (!ok) { setErr("Correo o contraseña incorrectos."); return; }
    const next = new URLSearchParams(location.search).get("next");
    router.push(next && next.startsWith("/") ? next : "/app");
  };

  return (
    <div className="wrap diag" style={{ maxWidth: 460 }}>
      <IlloLock className="login-art" />
      <h1 style={{ fontSize: "clamp(1.9rem,6vw,2.4rem)" }}>Entrar a Kwanta</h1>
      <form className="card lead" onSubmit={submit} noValidate>
        <label>Correo<input name="correo" id="login-correo" type="email" autoComplete="username" inputMode="email" required /></label>
        <label>Contraseña<input name="contrasena" id="login-contrasena" type="password" autoComplete="current-password" required /></label>
        {err && <p role="alert" style={{ color: "var(--bad)", fontSize: ".9rem" }}>{err}</p>}
        <button className="btn primary" type="submit">Entrar</button>
      </form>
      <p className="muted" style={{ fontSize: ".86rem" }}>Por ahora solo existe la cuenta demo. Las cuentas de alumnos llegan con la versión con base de datos.</p>
    </div>
  );
}
