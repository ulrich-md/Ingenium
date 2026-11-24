"use client";
/**
 * The sheet's own camera, the way notes apps (and tldraw/Excalidraw) do it, instead of the
 * browser's pinch-zoom:
 * - the page content (main's first child) moves with translate() scale(); the pen bar and
 *   other floating UI live outside it, so they never grow or drift;
 * - one finger pans (with inertia), two fingers pinch-zoom around their midpoint, 100–400 %;
 * - the Pencil writes; while it is down, fingers (a resting palm) are ignored;
 * - a trackpad or mouse: wheel pans, pinch (ctrl + wheel) zooms.
 * Ink coordinates need nothing special: InkLayer maps through getBoundingClientRect, which
 * already includes the transform, and its live canvases are portaled out of the content.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const CAMERA_EVENT = "kw-camera"; // detail: zoom
export const CAMERA_CMD = "kw-camera-cmd"; // detail: "in" | "out" | "reset"
export type CameraCmd = "in" | "out" | "reset";

const ZMIN = 1, ZMAX = 4;
const SLOP = 8; // px a finger may wander before it counts as a pan (taps stay taps)
const PALM_MS = 500; // touches this soon after the Pencil lifts are the resting hand
const PALM_SIZE = 44; // contact larger than this (px) is a palm, where Safari reports it

export const cameraCmd = (op: CameraCmd) => window.dispatchEvent(new CustomEvent<CameraCmd>(CAMERA_CMD, { detail: op }));

export function useCamera(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const main = document.querySelector("main");
    const content = main?.firstElementChild as HTMLElement | null;
    if (!main || !content) return;

    window.scrollTo(0, 0);
    document.body.classList.add("camera");
    content.style.transformOrigin = "0 0";

    let x = 0, y = 0, z = 1;
    let raf = 0, glide = 0;
    let penDown = false;
    let penUpAt = -1e9;
    let panOrigin: { x: number; y: number; t: number } | null = null;
    const touches = new Map<number, { x: number; y: number }>();
    let pan: { x: number; y: number; moved: boolean } | null = null;
    let pinch: { d: number; mx: number; my: number; x: number; y: number; z: number } | null = null;
    let samples: { x: number; y: number; t: number }[] = [];
    let swallowClick = 0;

    const clamp = () => {
      const vw = main.clientWidth, vh = main.clientHeight;
      const cw = content.offsetWidth * z, ch = content.offsetHeight * z;
      x = cw <= vw ? (vw - cw) / 2 : Math.min(0, Math.max(vw - cw, x));
      y = ch <= vh ? 0 : Math.min(0, Math.max(vh - ch, y));
    };
    const paint = () => {
      raf = 0;
      content.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
    };
    let lastZ = 1;
    const apply = () => {
      clamp();
      if (!raf) raf = requestAnimationFrame(paint);
      if (z !== lastZ) { lastZ = z; window.dispatchEvent(new CustomEvent<number>(CAMERA_EVENT, { detail: z })); }
    };
    /** zoom to `nz` keeping the page point under (sx, sy) on screen */
    const zoomAt = (nz: number, sx: number, sy: number) => {
      nz = Math.min(ZMAX, Math.max(ZMIN, nz));
      const px = (sx - x) / z, py = (sy - y) / z;
      z = nz;
      x = sx - px * z;
      y = sy - py * z;
      apply();
    };
    const stopGlide = () => { if (glide) cancelAnimationFrame(glide); glide = 0; };

    const startPinch = () => {
      const [a, b] = [...touches.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x, y, z };
      pan = null;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "pen") {
        penDown = true;
        // the palm often lands just before the Pencil: drop the pan it started and put the sheet back
        if (pan && panOrigin && e.timeStamp - panOrigin.t < 600) { x = panOrigin.x; y = panOrigin.y; apply(); }
        touches.clear(); pan = null; pinch = null; panOrigin = null; stopGlide();
        return;
      }
      if (e.pointerType !== "touch" || penDown) return;
      // palm: lands right after the Pencil lifts between words, or is a big contact
      if (e.timeStamp - penUpAt < PALM_MS) return;
      if (e.width > PALM_SIZE || e.height > PALM_SIZE) return;
      if (e.defaultPrevented) return; // the ink took it (finger drawing, dragging a selection)
      if (!main.contains(e.target as Node)) return; // floating UI (pen bar, panels)
      stopGlide();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 1) { panOrigin = { x, y, t: e.timeStamp }; pan = { x: e.clientX, y: e.clientY, moved: false }; samples = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }]; }
      else if (touches.size === 2) startPinch();
    };
    const onMove = (e: PointerEvent) => {
      const t = touches.get(e.pointerId);
      if (!t) return;
      t.x = e.clientX; t.y = e.clientY;
      if (pinch && touches.size >= 2) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const nz = Math.min(ZMAX, Math.max(ZMIN, pinch.z * (d / pinch.d)));
        // the page point that was under the fingers' midpoint stays under it
        const px = (pinch.mx - pinch.x) / pinch.z, py = (pinch.my - pinch.y) / pinch.z;
        z = nz; x = mx - px * z; y = my - py * z;
        apply();
        return;
      }
      if (pan) {
        const dx = e.clientX - pan.x, dy = e.clientY - pan.y;
        if (!pan.moved && Math.hypot(dx, dy) < SLOP) return;
        if (!pan.moved) { pan.moved = true; pan.x = e.clientX; pan.y = e.clientY; return; }
        x += dx; y += dy;
        pan.x = e.clientX; pan.y = e.clientY;
        samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
        if (samples.length > 6) samples.shift();
        apply();
      }
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "pen") { penDown = false; penUpAt = e.timeStamp; return; }
      if (!touches.has(e.pointerId)) return;
      touches.delete(e.pointerId);
      if (pinch && touches.size < 2) {
        pinch = null;
        // the finger left behind continues as a pan, without a jump
        const rest = [...touches.values()][0];
        pan = rest ? { x: rest.x, y: rest.y, moved: true } : null;
        samples = [];
        swallowClick = e.timeStamp;
        return;
      }
      if (pan && touches.size === 0) {
        if (pan.moved) {
          swallowClick = e.timeStamp;
          // inertia from the last ~100 ms of movement
          const s = samples.filter((p) => e.timeStamp - p.t < 100);
          if (s.length >= 2) {
            const a = s[0], b = s[s.length - 1], dt = Math.max(1, b.t - a.t);
            let vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt; // px per ms
            let prev = performance.now();
            const step = (now: number) => {
              const dt2 = Math.min(40, now - prev); prev = now;
              x += vx * dt2; y += vy * dt2;
              const k = Math.pow(0.995, dt2); vx *= k; vy *= k;
              apply();
              glide = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : 0;
            };
            if (Math.hypot(vx, vy) > 0.15) glide = requestAnimationFrame(step);
          }
        }
        pan = null;
      }
    };
    // a pan or pinch that ends on a button must not press it
    const onClick = (e: MouseEvent) => {
      // only on the sheet: a tap on the pen bar or a panel always goes through
      if (swallowClick && e.timeStamp - swallowClick < 350 && main.contains(e.target as Node)) { e.preventDefault(); e.stopPropagation(); }
      swallowClick = 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (!main.contains(e.target as Node)) return;
      e.preventDefault();
      stopGlide();
      if (e.ctrlKey) zoomAt(z * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      else { x -= e.deltaX; y -= e.deltaY; apply(); }
    };
    const noGesture = (e: Event) => e.preventDefault(); // Safari's own pinch-zoom
    const onCmd = (e: Event) => {
      const op = (e as CustomEvent<CameraCmd>).detail;
      const cx = main.clientWidth / 2, cy = main.clientHeight / 2;
      stopGlide();
      if (op === "reset") zoomAt(1, cx, cy);
      else zoomAt(op === "in" ? z * 1.25 : z / 1.25, cx, cy);
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("click", onClick, true);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("gesturestart", noGesture);
    document.addEventListener("gesturechange", noGesture);
    window.addEventListener(CAMERA_CMD, onCmd);
    const ro = new ResizeObserver(() => apply());
    ro.observe(content);
    ro.observe(main);
    apply();

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("gesturestart", noGesture);
      document.removeEventListener("gesturechange", noGesture);
      window.removeEventListener(CAMERA_CMD, onCmd);
      ro.disconnect();
      stopGlide();
      if (raf) cancelAnimationFrame(raf);
      content.style.transform = "";
      content.style.transformOrigin = "";
      document.body.classList.remove("camera");
      window.dispatchEvent(new CustomEvent<number>(CAMERA_EVENT, { detail: 1 }));
    };
  }, [active]);
}

export function useCameraZoom() {
  const [z, setZ] = useState(1);
  useEffect(() => {
    const on = (e: Event) => setZ((e as CustomEvent<number>).detail);
    window.addEventListener(CAMERA_EVENT, on);
    return () => window.removeEventListener(CAMERA_EVENT, on);
  }, []);
  return z;
}

/** While zoomed: the zoom level and a way back to 100 % (fixed, outside the camera). */
export function ZoomBadge() {
  const z = useCameraZoom();
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  if (!host || z < 1.02) return null;
  return createPortal(
    <div className="zoombadge" role="status">
      <span>{Math.round(z * 100)} %</span>
      <button type="button" onClick={() => cameraCmd("reset")}>Ver toda la hoja</button>
    </div>,
    host,
  );
}

/** Renders children into <body>, outside the camera's transformed content
 *  (position: fixed inside a transform would move and zoom with the sheet). */
export function Floating({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  return host ? createPortal(children, host) : null;
}
