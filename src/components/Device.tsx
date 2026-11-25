"use client";
/**
 * Which experience to show: iPad (handwriting), computer (typing) or phone (review).
 * Detected automatically; the "Vista" switcher overrides it for demos and testing
 * (also ?modo=ipad|computadora|telefono in the URL).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { detectMode, isMode, MODE_LABEL, type Mode } from "@/lib/device";
import { store } from "@/lib/storage";

const Ctx = createContext<{ mode: Mode | null; setMode: (m: Mode | null) => void; auto: Mode | null }>({
  mode: null,
  setMode: () => {},
  auto: null,
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [auto, setAuto] = useState<Mode | null>(null);
  const [override, setOverride] = useState<Mode | null>(null);

  useEffect(() => {
    setAuto(detectMode());
    const q = new URLSearchParams(location.search).get("modo");
    if (isMode(q)) {
      setOverride(q);
      store.set("kw-mode", q);
    } else {
      const saved = store.get<string | null>("kw-mode", null);
      if (isMode(saved)) setOverride(saved);
    }
  }, []);

  const setMode = (m: Mode | null) => {
    setOverride(m);
    if (m) store.set("kw-mode", m);
    else store.del("kw-mode");
  };

  const mode = override ?? auto;
  // lets CSS adapt to the experience, not only to the width (e.g. the phone's bottom tab bar)
  useEffect(() => {
    if (mode) document.documentElement.dataset.mode = mode;
  }, [mode]);

  return <Ctx.Provider value={{ mode, setMode, auto }}>{children}</Ctx.Provider>;
}

export const useDevice = () => useContext(Ctx);

/** Folded to a small chip so it never covers the page; opens to pick another view. */
export function VistaSwitcher() {
  const { mode, setMode, auto } = useDevice();
  const [open, setOpen] = useState(false);
  if (!mode) return null;
  if (!open) {
    return (
      <button type="button" className="vista folded" onClick={() => setOpen(true)} aria-label={`Vista: ${MODE_LABEL[mode]}. Cambiar vista`}>
        {MODE_LABEL[mode]}
      </button>
    );
  }
  return (
    <div className="vista" role="group" aria-label="Vista de dispositivo">
      <span>Vista</span>
      {(["ipad", "computadora", "telefono"] as Mode[]).map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => { setMode(m === auto ? null : m); setOpen(false); }}>
          {MODE_LABEL[m]}
        </button>
      ))}
      <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
    </div>
  );
}
