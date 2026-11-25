/**
 * Ink geometry, the way notes apps do it:
 * 1. pressure is shaped per pen (only the pencil varies: harder is darker and thicker),
 * 2. perfect-freehand smooths the points and builds a variable-width outline,
 * 3. the outline is UNIONED (polygon-clipping) so self-crossings do not leave white
 *    pinholes, then written as a smooth SVG path (quadratic curves through midpoints).
 */
import { getStroke } from "perfect-freehand";
import polygonClipping, { type Ring } from "polygon-clipping";

export type Pen = "fountain" | "ball" | "pencil" | "marker";
export type Kind = Pen | "hl";

export interface StrokeLike {
  hl?: boolean;
  k?: Pen;
  s: number;
  /** flat list: x, y, pressure, ... (pressure already shaped by `effectivePressure`) */
  p: number[];
}

export const kindOf = (st: StrokeLike): Kind => (st.hl ? "hl" : st.k ?? "fountain");

/**
 * Each pen should feel different in the hand:
 * - fountain: a smooth, rounder ink line of constant width (students asked for an even line);
 * - ball: a thin line of constant width;
 * - pencil: graphite: pressure-sensitive, lighter, slightly rough edges;
 * - marker: broad and even.
 * `thinning` 0 = the width never changes while writing.
 * `streamline` is low so the ink stays on the Pencil's tip (high values make the line lag
 * behind and cut corners); `smoothing` rounds the outline without moving it.
 */
export const PENS: Record<Kind, { thinning: number; smoothing: number; streamline: number }> = {
  fountain: { thinning: 0, smoothing: 0.62, streamline: 0.22 },
  ball: { thinning: 0, smoothing: 0.5, streamline: 0.2 },
  pencil: { thinning: 0.6, smoothing: 0.45, streamline: 0.2 },
  marker: { thinning: 0, smoothing: 0.62, streamline: 0.28 },
  hl: { thinning: 0, smoothing: 0.55, streamline: 0.35 },
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pressure stored with each point. `speed` is in sheet units per millisecond
 * (normal handwriting is about 0.2–1.5).
 */
export function effectivePressure(kind: Kind, pressure: number, speed: number): number {
  const s = clamp(speed / 1.8, 0, 1);
  // only the pencil responds to pressure; ink pens, marker and highlighter are constant
  return kind === "pencil" ? clamp(0.03 + Math.pow(pressure, 1.15) * 1.05 - s * 0.1, 0.04, 1) : 0.5;
}

/** Deterministic noise in [-1, 1] from a position (the same stroke always looks the same). */
const noise = (x: number, y: number) => {
  const h = Math.sin(Math.round(x * 3) * 12.9898 + Math.round(y * 3) * 78.233) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
};

/**
 * Raw (possibly self-crossing) outline of a stroke, in stroke units.
 * `last`: the stroke is finished. `first`: these points start the stroke (a live piece
 * from the middle of a stroke must not get the pencil's start taper).
 */
export function outline(st: StrokeLike, extra: number[][] = [], last = true, first = true): number[][] {
  const o = PENS[kindOf(st)];
  const pts: number[][] = [];
  for (let i = 0; i < st.p.length; i += 3) pts.push([st.p[i], st.p[i + 1], st.p[i + 2]]);
  for (const e of extra) pts.push(e);
  const kind = kindOf(st);
  const hl = kind === "hl";
  const ring = getStroke(pts, {
    size: st.s, thinning: o.thinning, smoothing: o.smoothing, streamline: o.streamline,
    simulatePressure: false, last,
    start: { cap: !hl, taper: kind === "pencil" && first ? st.s * 2 : 0 },
    end: { cap: !hl, taper: kind === "pencil" && last ? st.s * 2 : 0 },
  });
  if (kind !== "pencil") return ring;
  // graphite: slightly rough edges
  const a = st.s * 0.14;
  return ring.map(([x, y]) => [x + noise(x, y) * a, y + noise(y, x) * a]);
}

const f = (v: number) => (Math.round(v * 100) / 100).toString();

/** Smooth closed path through a ring: quadratic curves between midpoints. */
function ringPath(ring: number[][]): string {
  const n = ring.length;
  if (n < 3) return "";
  let d = `M${f((ring[0][0] + ring[1][0]) / 2)} ${f((ring[0][1] + ring[1][1]) / 2)}Q`;
  for (let i = 1; i <= n; i++) {
    const [x0, y0] = ring[i % n], [x1, y1] = ring[(i + 1) % n];
    d += `${f(x0)} ${f(y0)} ${f((x0 + x1) / 2)} ${f((y0 + y1) / 2)} `;
  }
  return d + "Z";
}

function dotPath(st: StrokeLike): string {
  const [x, y] = [st.p[0], st.p[1]], r = Math.max(0.6, st.s * (0.35 + 0.5 * (st.p[2] ?? 0.5)));
  return `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

/** Fast path (no union): used while writing and right after lifting the pencil. */
export function rawPath(st: StrokeLike, extra: number[][] = [], last = true, first = true): string {
  if (st.p.length <= 6 && !extra.length) return dotPath(st);
  const poly = outline(st, extra, last, first);
  return poly.length < 4 ? dotPath(st) : ringPath(poly);
}

/** Clean path: the outline unioned with itself, no pinholes. Fill with evenodd. */
export function cleanPath(st: StrokeLike): string {
  if (st.p.length <= 6) return dotPath(st);
  const poly = outline(st);
  if (poly.length < 4) return dotPath(st);
  try {
    const merged = polygonClipping.union([poly as Ring]);
    let d = "";
    for (const polygon of merged) for (const ring of polygon) d += ringPath(ring as number[][]);
    return d || ringPath(poly);
  } catch {
    return ringPath(poly);
  }
}
