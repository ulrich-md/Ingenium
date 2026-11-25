"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

/** Signed in: a way back to the app from the public pages. Signed out: sign in + free diagnostic. */
export default function TopbarActions() {
  const path = usePathname();
  const [signed, setSigned] = useState(false);
  useEffect(() => setSigned(!!getSession()), [path]);
  const inApp = path.startsWith("/app") || path.startsWith("/diagnostico");
  return (
    <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {signed ? (
        !inApp && <Link href="/app" className="btn primary sm">Mi Kwanta</Link>
      ) : (
        <>
          <Link href="/entrar" className="btn ghost sm">Entrar</Link>
          <Link href="/diagnostico" className="btn primary sm">Diagnóstico gratis</Link>
        </>
      )}
    </nav>
  );
}
