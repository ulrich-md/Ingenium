"use client";
/**
 * "Inicio" on every writing screen. While a sheet or a note is open the app tabs are
 * hidden (focus mode), so each screen also needs a direct way home, not only back to its
 * own list. Everything is saved as you write, so leaving never loses work.
 * Signed in: the app's home; otherwise (the public diagnostic): the site's home.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

export default function HomeLink() {
  const [href, setHref] = useState("/app");
  useEffect(() => { if (!getSession()) setHref("/"); }, []);
  return (
    <Link href={href} className="btn ghost sm homelink" aria-label="Ir al inicio (se guarda todo)" title="Ir al inicio · se guarda todo">
      <svg viewBox="0 0 256 256" width="18" height="18" aria-hidden="true">
        <path d="M216 120v96h-56v-56h-64v56H40v-96a8 8 0 0 1 2.34-5.66l80-80a8 8 0 0 1 11.32 0l80 80A8 8 0 0 1 216 120Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinejoin="round" />
      </svg>
      Inicio
    </Link>
  );
}
