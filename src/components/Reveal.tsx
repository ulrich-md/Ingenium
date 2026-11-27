"use client";
import { useEffect } from "react";

/** Blocks marked `.reveal` slide in the first time they scroll into view.
 *  They are hidden only after this script runs, so without JS (or with reduced motion) all is visible. */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const items = [...document.querySelectorAll<HTMLElement>(".reveal")];
    // anything already on screen stays as it is; only what is below the fold waits for its turn
    const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    below.forEach((el) => el.classList.add("reveal-wait"));
    root.classList.add("reveal-on");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.remove("reveal-wait"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    below.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
