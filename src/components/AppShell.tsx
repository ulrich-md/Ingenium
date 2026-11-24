"use client";
/** Signed-in area: checks the (demo) session and shows the app navigation. */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSession, logout, type Session } from "@/lib/session";

const TABS = [
  { href: "/app", label: "Inicio" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/app/notas", label: "Notas" },
  { href: "/app/practica", label: "Práctica" },
  { href: "/app/mock", label: "Mocks" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [s, setS] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const ss = getSession();
    if (!ss) router.replace(`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`);
    else setS(ss);
  }, [router]);

  if (!s) return <div className="wrap diag"><p className="muted">Cargando…</p></div>;

  return (
    <div className="appshell">
      <nav className="appnav wrap" aria-label="Secciones">
        <div className="tabs">
          {TABS.map((t) => {
            const on = t.href === "/app" ? path === "/app" : path.startsWith(t.href);
            return <Link key={t.href} href={t.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{t.label}</Link>;
          })}
        </div>
        <div className="who">
          <span>{s.name}{s.demo && <span className="pill sig" style={{ marginLeft: 6 }}>demo</span>}</span>
          <button type="button" className="btn sm ghost" onClick={() => { logout(); router.push("/"); }}>Salir</button>
        </div>
      </nav>
      {children}
    </div>
  );
}
