/**
 * Kwanta has three experiences:
 *  - ipad: exam sheets written by hand with Apple Pencil
 *  - computadora: the same exam sheets, typed line by line
 *  - telefono: quick review (multiple choice), corrections, progress
 */
export type Mode = "ipad" | "computadora" | "telefono";

export const MODE_LABEL: Record<Mode, string> = {
  ipad: "iPad",
  computadora: "Computadora",
  telefono: "Teléfono",
};

export function detectMode(): Mode {
  if (typeof navigator === "undefined") return "computadora";
  const ua = navigator.userAgent;
  const touch = (navigator.maxTouchPoints || 0) > 1;
  // iPadOS reports itself as a Mac; a Mac with a multi-touch screen is an iPad.
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch)) return "ipad";
  const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const shortSide = Math.min(screen.width, screen.height);
  if (/iPhone|Android.+Mobile/.test(ua) || (coarse && shortSide < 700)) return "telefono";
  return "computadora";
}

export function isMode(v: unknown): v is Mode {
  return v === "ipad" || v === "computadora" || v === "telefono";
}
