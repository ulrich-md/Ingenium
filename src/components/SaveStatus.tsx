"use client";
/** A save indicator that tells the truth: it reacts to every write (see lib/storage). */
import { useEffect, useState } from "react";
import { SAVE_EVENT, type SaveInfo } from "@/lib/storage";

export default function SaveStatus() {
  const [s, setS] = useState<SaveInfo | null>(null);
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const on = (e: Event) => {
      const d = (e as CustomEvent<SaveInfo>).detail;
      setS(d);
      setFresh(true);
      clearTimeout(t);
      t = setTimeout(() => setFresh(false), 1400);
    };
    window.addEventListener(SAVE_EVENT, on);
    return () => { window.removeEventListener(SAVE_EVENT, on); clearTimeout(t); };
  }, []);
  if (s && !s.ok) {
    return <span className="savestat bad" role="status">No se pudo guardar · descarga una copia desde Inicio</span>;
  }
  return (
    <span className={"savestat" + (fresh ? " fresh" : "")} role="status" aria-live="polite">
      {s ? "Guardado ✓" : "Se guarda solo"}
    </span>
  );
}
