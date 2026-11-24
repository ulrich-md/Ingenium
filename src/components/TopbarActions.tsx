"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

/** Signed in: a way back to the app from anywhere. Signed out: sign in + free diagnostic. */
export default function TopbarActions() {
  const path = usePathname();
  const [signed, setSigned] = useState(false);
  useEffect(() => setSigned(!!getSession()), [path]);
  return (
    <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {signed ? (
        !path.startsWith("/app") && <Link href="/app" className="btn primary sm">Mi Kwanta</Link>
      ) : (
        <>
          <Link href="/entrar" className="btn ghost sm">Entrar</Link>
          <Link href="/diagnostico" className="btn primary sm">Diagnóstico gratis</Link>
        </>
      )}
    </nav>
  );
}
