/**
 * localStorage that never throws (private mode, blocked storage), plus what keeps the
 * student's work alive on an iPad: Safari deletes a site's storage after 7 days of use
 * without visiting it, unless the site is installed on the Home Screen. So:
 * - every write reports whether it was saved (SaveStatus shows it);
 * - we ask the browser to keep the data (persist);
 * - the student can download a backup and restore it.
 */
export const SAVE_EVENT = "kw-save";
export type SaveInfo = { ok: boolean; t: number };

// async: saves often happen inside React state updaters, where listeners must not set state
const emit = (ok: boolean) => {
  const t = Date.now();
  try { setTimeout(() => window.dispatchEvent(new CustomEvent<SaveInfo>(SAVE_EVENT, { detail: { ok, t } })), 0); } catch { /* SSR */ }
};

/** Preferences, not the student's work: they do not light up "Guardado". */
const quiet = (key: string) => key === "kw-mode" || key.startsWith("kw-ink-tools") || key.startsWith("kw-tip-") || key === "kw-install-hidden";

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  /** Returns false when the browser refused the write (storage full or blocked). */
  set(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (!quiet(key)) emit(true);
      return true;
    } catch {
      if (!quiet(key)) emit(false); // keep working in memory, but say so
      return false;
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/* ---------- keeping the data ---------- */

/** Installed on the Home Screen (Safari does not apply the 7-day deletion there). */
export function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

/** iPhone/iPad Safari, where "Agregar a pantalla de inicio" is the way to install. */
export function isAppleTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Ask the browser not to evict our data. Granted more often once installed. */
export async function requestPersist(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/* ---------- backup ---------- */

const BACKUP_META = "kw-backup-at";
/** Device preferences that should not travel to another device. */
const NOT_BACKED_UP = new Set(["kw-mode", "kw-session", BACKUP_META]);

export interface Backup { app: "kwanta"; v: 1; at: number; data: Record<string, unknown> }

export function makeBackup(): Backup {
  const data: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("kw-") || NOT_BACKED_UP.has(k)) continue;
      try { data[k] = JSON.parse(localStorage.getItem(k) ?? "null"); } catch { /* skip unreadable */ }
    }
  } catch { /* storage blocked */ }
  return { app: "kwanta", v: 1, at: Date.now(), data };
}

/** Saves the backup as a file the student keeps (Archivos / iCloud Drive on the iPad). */
export function downloadBackup() {
  const b = makeBackup();
  const blob = new Blob([JSON.stringify(b)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `kwanta-copia-${new Date(b.at).toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  store.set(BACKUP_META, b.at);
}

/** Restores a backup file. Returns how many items were restored, or an error message. */
export function restoreBackup(text: string): { n: number } | { error: string } {
  let b: Backup;
  try { b = JSON.parse(text); } catch { return { error: "Ese archivo no es una copia de Kwanta." }; }
  if (!b || b.app !== "kwanta" || typeof b.data !== "object") return { error: "Ese archivo no es una copia de Kwanta." };
  let n = 0;
  for (const [k, v] of Object.entries(b.data)) {
    if (!k.startsWith("kw-") || NOT_BACKED_UP.has(k)) continue;
    if (store.set(k, v)) n++;
  }
  if (!n) return { error: "No se pudo restaurar: el navegador no deja guardar." };
  return { n };
}

export const lastBackupAt = () => store.get<number | null>(BACKUP_META, null);
