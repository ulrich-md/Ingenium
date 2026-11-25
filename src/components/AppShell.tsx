"use client";
/** Signed-in area: checks the (demo) session and shows the app navigation. */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSession, logout, type Session } from "@/lib/session";
import { requestPersist } from "@/lib/storage";
import Icon from "./Icon";
import type { UiIconName } from "./uiIcons";

const TABS: { href: string; label: string; icon: UiIconName }[] = [
  { href: "/app", label: "Inicio", icon: "home" },
  { href: "/diagnostico", label: "Diagnóstico", icon: "target" },
  { href: "/app/notas", label: "Notas", icon: "notebook" },
  { href: "/app/practica", label: "Práctica", icon: "practice" },
  { href: "/app/mock", label: "Simulacros", icon: "timer" },
];

/** Tabs: pills at the top on iPad and computer, a bar at the bottom on the phone (CSS). */
export function AppNav({ s }: { s: Session }) {
  const router = useRouter();
  const path = usePathname();
  return (
    <nav className="appnav wrap" aria-label="Secciones">
      <div className="tabs">
        {TABS.map((t) => {
          const on = t.href === "/app" ? path === "/app" : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
              <Icon name={t.icon} size={20} /><span>{t.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="who">
        <span className="who-name">{s.name}{s.demo && <span className="pill sig" style={{ marginLeft: 6 }}>demo</span>}</span>
        <button type="button" className="btn sm ghost" onClick={() => { logout(); router.push("/"); }}>
          <Icon name="signout" /> Salir
        </button>
      </div>
    </nav>
  );
}

/** The free diagnostic is public; a signed-in student still sees the app tabs there. */
export function OptionalAppNav() {
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => setS(getSession()), []);
  return s ? <div className="appshell"><AppNav s={s} /></div> : null;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [s, setS] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const ss = getSession();
    if (!ss) router.replace(`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`);
    else setS(ss);
  }, [router]);
  // ask Safari to keep the student's work (granted more easily once installed)
  useEffect(() => { requestPersist(); }, []);

  if (!s) return <div className="wrap diag"><p className="muted">Cargando…</p></div>;

  return (
    <div className="appshell">
      <AppNav s={s} />
      {children}
    </div>
  );
}
