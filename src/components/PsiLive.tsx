"use client";
import { useEffect, useRef } from "react";
import Gato, { type GatoProps } from "./Gato";

/** Psi, alive: animated, the eyes follow the pointer and a tap makes it jump.
 *  The eyes move each `.g-iris` up to 3.2 viewBox units toward the pointer. */
export default function PsiLive(props: GatoProps & { jumpOnTap?: boolean }) {
  const { jumpOnTap = true, ...gato } = props;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    const svg = root?.querySelector("svg");
    if (!root || !svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const irises = [...svg.querySelectorAll<SVGGElement>(".g-iris")].map((g) => {
      // the white of the eye is the circle right before the clipped group that holds the iris
      const white = g.parentElement?.previousElementSibling as SVGCircleElement | null;
      return { g, cx: Number(white?.getAttribute("cx")), cy: Number(white?.getAttribute("cy")) };
    }).filter((e) => Number.isFinite(e.cx));

    let frame = 0;
    let px = 0, py = 0;
    const update = () => {
      frame = 0;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      for (const { g, cx, cy } of irises) {
        const sx = ctm.a * cx + ctm.c * cy + ctm.e;
        const sy = ctm.b * cx + ctm.d * cy + ctm.f;
        const dx = px - sx, dy = py - sy, d = Math.hypot(dx, dy) || 1;
        const m = Math.min(3.2, d / 40);
        g.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); };
  }, []);

  const jump = () => {
    const svg = ref.current?.querySelector("svg");
    if (!jumpOnTap || !svg) return;
    svg.classList.remove("do-jump");
    void svg.getBoundingClientRect();
    svg.classList.add("do-jump");
  };

  return (
    <span ref={ref} className="psi-live" onClick={jump} onAnimationEnd={(e) => {
      if (e.animationName === "psi-jump") ref.current?.querySelector("svg")?.classList.remove("do-jump");
    }}>
      <Gato animated {...gato} />
    </span>
  );
}
