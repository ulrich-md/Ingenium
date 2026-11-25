"use client";
/**
 * Keeps the student's notes and sheets safe on the iPad: install on the Home Screen
 * (Safari deletes data of sites not visited in 7 days, but not of installed apps),
 * and a backup file they can download and restore.
 */
import { useEffect, useRef, useState } from "react";
import { downloadBackup, isAppleTouch, isInstalled, lastBackupAt, restoreBackup, store } from "@/lib/storage";
import { useDevice } from "./Device";

const DAY = 86_400_000;
const HIDE_KEY = "kw-install-hidden";

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Compartir" role="img" style={{ verticalAlign: "-3px" }}>
      <path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1" />
    </svg>
  );
}

export function InstallCard() {
  const { mode } = useDevice();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hiddenAt = store.get<number>(HIDE_KEY, 0);
    setShow(isAppleTouch() && !isInstalled() && Date.now() - hiddenAt > 14 * DAY);
  }, []);
  if (!show) return null;
  return (
    <div className="keepcard install" role="note">
      <div>
        <b>Instala Kwanta en tu {mode === "telefono" ? "iPhone" : "iPad"}</b>
        <span className="muted">Safari borra las notas de los sitios que no abres en 7 días. Instalada, no se borran y se abre a pantalla completa.</span>
        <ol className="steps">
          <li>Toca <ShareIcon /> <b>Compartir</b> en la barra de Safari.</li>
          <li>Elige <b>Agregar a pantalla de inicio</b>.</li>
          <li>Abre Kwanta desde su ícono.</li>
        </ol>
      </div>
      <button type="button" className="btn sm ghost" onClick={() => { store.set(HIDE_KEY, Date.now()); setShow(false); }}>Ahora no</button>
    </div>
  );
}

export function BackupCard() {
  const [at, setAt] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setAt(lastBackupAt()), []);
  const old = !at || Date.now() - at > 7 * DAY;
  const when = at ? new Date(at).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : null;

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const r = restoreBackup(await f.text());
    if ("error" in r) setMsg({ ok: false, t: r.error });
    else { setMsg({ ok: true, t: "Listo: recuperaste tus notas y hojas." }); setTimeout(() => location.reload(), 900); }
    if (file.current) file.current.value = "";
  };

  return (
    <div className={"keepcard" + (old ? " warn" : "")}>
      <div>
        <b>Copia de seguridad</b>
        <span className="muted">
          {when ? `Última copia: ${when}.` : "Aún no tienes copia."} Tus notas viven solo en este dispositivo: guarda una copia en Archivos o iCloud cada semana.
        </span>
        {msg && <span className={msg.ok ? "ok" : "bad"} role="status">{msg.t}</span>}
      </div>
      <div className="kc-actions">
        <button type="button" className={"btn sm" + (old ? " primary" : "")} onClick={() => { downloadBackup(); setAt(Date.now()); setMsg(null); }}>Descargar copia</button>
        <button type="button" className="btn sm ghost" onClick={() => file.current?.click()}>Restaurar</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
