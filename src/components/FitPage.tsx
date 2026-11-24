"use client";
/**
 * A sheet with a fixed design width, scaled to the space available, like a page in a notes
 * app. Ink is stored relative to the sheet, so the boxes and the writing stay aligned in
 * portrait, landscape, writing and marking alike, and in landscape the sheet (and the room
 * to write) simply gets bigger.
 */
import { useLayoutEffect, useRef, useState } from "react";

export default function FitPage({ width, max = 1.3, children }: { width: number; max?: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<{ s: number; h: number; x: number } | null>(null);

  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const avail = o.clientWidth;
      if (!avail) return;
      const s = Math.min(max, avail / width);
      const next = { s, h: i.offsetHeight * s, x: Math.max(0, (avail - width * s) / 2) };
      setF((p) => (p && Math.abs(p.s - next.s) < 1e-4 && Math.abs(p.h - next.h) < 0.5 && Math.abs(p.x - next.x) < 0.5 ? p : next));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width, max]);

  return (
    <div ref={outer} className="fitpage" style={{ height: f ? f.h : undefined }}>
      <div ref={inner} style={{ width, transformOrigin: "0 0", transform: f ? `translateX(${f.x}px) scale(${f.s})` : undefined }}>
        {children}
      </div>
    </div>
  );
}
