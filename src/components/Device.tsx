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

  return <Ctx.Provider value={{ mode: override ?? auto, setMode, auto }}>{children}</Ctx.Provider>;
}

export const useDevice = () => useContext(Ctx);

export function VistaSwitcher() {
  const { mode, setMode, auto } = useDevice();
  if (!mode) return null;
  return (
    <div className="vista" role="group" aria-label="Vista de dispositivo">
      <span>Vista</span>
      {(["ipad", "computadora", "telefono"] as Mode[]).map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m === auto ? null : m)}>
          {MODE_LABEL[m]}
        </button>
      ))}
    </div>
  );
}
