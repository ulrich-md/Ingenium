/**
 * Shapes from a hand-drawn stroke, as notes apps do when you hold the Pencil still at the
 * end of a stroke: a straight line, an arrow, a triangle, a rectangle, or a circle/ellipse.
 * Input and output are flat point lists (x, y, pressure, ...) in sheet units.
 * Shapes come back as one stroke of evenly spaced points (perfect-freehand needs them).
 */
export type ShapeKind = "line" | "arrow" | "triangle" | "rect" | "ellipse";
export interface Shape { kind: ShapeKind; p: number[] }

type Pt = [number, number];
const r1 = (v: number) => Math.round(v * 10) / 10;
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function pts(p: number[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < p.length; i += 3) out.push([p[i], p[i + 1]]);
  return out;
}

function segDist(q: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l)) : 0;
  return Math.hypot(a[0] + t * dx - q[0], a[1] + t * dy - q[1]);
}

/** Ramer–Douglas–Peucker: the corners of a polyline. */
function simplify(list: Pt[], eps: number): Pt[] {
  if (list.length < 3) return list.slice();
  let idx = 0, max = 0;
  for (let i = 1; i < list.length - 1; i++) {
    const d = segDist(list[i], list[0], list[list.length - 1]);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [list[0], list[list.length - 1]];
  const a = simplify(list.slice(0, idx + 1), eps), b = simplify(list.slice(idx), eps);
  return [...a.slice(0, -1), ...b];
}

const pathLen = (list: Pt[]) => list.reduce((s, q, i) => (i ? s + dist(q, list[i - 1]) : 0), 0);

/** Evenly spaced points along a polyline (step in sheet units). */
function densify(corners: Pt[], pr: number, step = 3): number[] {
  const out: number[] = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const [a, b] = [corners[i], corners[i + 1]];
    const n = Math.max(1, Math.ceil(dist(a, b) / step));
    for (let j = 0; j < n; j++) out.push(r1(a[0] + ((b[0] - a[0]) * j) / n), r1(a[1] + ((b[1] - a[1]) * j) / n), pr);
  }
  const z = corners[corners.length - 1];
  out.push(r1(z[0]), r1(z[1]), pr);
  return out;
}

export const linePoints = (x0: number, y0: number, x1: number, y1: number, pr: number) => densify([[x0, y0], [x1, y1]], pr);

/** A straight arrow from (x0, y0) to (x1, y1): the shaft, then both barbs drawn from the tip. */
export function arrowPoints(x0: number, y0: number, x1: number, y1: number, pr: number, width: number): number[] {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const head = Math.min(L * 0.3, 14 + width * 2.5);
  const ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  const barb = (sgn: number): Pt => {
    const a = Math.PI / 7 * sgn, c = Math.cos(a), s = Math.sin(a);
    return [x1 - head * (ux * c - uy * s), y1 - head * (uy * c + ux * s)];
  };
  return densify([[x0, y0], [x1, y1], barb(1), [x1, y1], barb(-1)], pr, 2);
}

/** Is this stroke meant as a line? Long enough, close to its chord, no going back and forth. */
export function looksStraight(p: number[]): boolean {
  const n = p.length / 3;
  if (n < 4) return false;
  const x0 = p[0], y0 = p[1], x1 = p[p.length - 3], y1 = p[p.length - 2];
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 30) return false;
  let dev = 0;
  for (let i = 3; i < p.length; i += 3) dev = Math.max(dev, Math.abs((x1 - x0) * (y0 - p[i + 1]) - (x0 - p[i]) * (y1 - y0)) / len);
  // length walked, without the hand's tremor
  const walked = pathLen(simplify(pts(p), 2));
  return walked <= len * 1.25 && dev <= Math.max(4, len * 0.12);
}

const avgPressure = (p: number[]) => {
  let s = 0;
  for (let i = 2; i < p.length; i += 3) s += p[i];
  return Math.round((s / (p.length / 3)) * 100) / 100;
};

/**
 * The shape a stroke was meant to be, or null (then it stays as written).
 * `width` is the pen's thickness (for the arrow head).
 */
export function recognize(p: number[], width = 2): Shape | null {
  const list = pts(p);
  if (list.length < 4) return null;
  const pr = avgPressure(p);
  const total = pathLen(simplify(list, 2));
  const xs = list.map((q) => q[0]), ys = list.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const diag = Math.hypot(x1 - x0, y1 - y0);
  if (diag < 30) return null; // too small: handwriting, not a shape

  if (looksStraight(p)) return { kind: "line", p: linePoints(list[0][0], list[0][1], list[list.length - 1][0], list[list.length - 1][1], pr) };

  const start = list[0], end = list[list.length - 1];
  const closed = dist(start, end) < Math.max(14, total * 0.14);

  if (!closed) {
    // arrow: one long shaft, then a short head drawn at its end
    const c = simplify(list, Math.max(3, diag * 0.06));
    if (c.length >= 3 && c.length <= 6) {
      const L = dist(c[0], c[1]);
      const rest = c.slice(2);
      if (L > 30 && L >= total * 0.5 && rest.every((q) => dist(q, c[1]) < L * 0.45)) {
        return { kind: "arrow", p: arrowPoints(c[0][0], c[0][1], c[1][0], c[1][1], pr, width) };
      }
    }
    return null;
  }

  // closed and round: points stay near an ellipse on the bounding box
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
  let err = 0;
  for (const q of list) err += Math.abs(Math.hypot((q[0] - cx) / (rx || 1), (q[1] - cy) / (ry || 1)) - 1);
  err /= list.length;
  if (rx > 8 && ry > 8 && err < 0.09) {
    const circle = Math.abs(rx - ry) < Math.max(rx, ry) * 0.15;
    const ex = circle ? (rx + ry) / 2 : rx, ey = circle ? (rx + ry) / 2 : ry;
    const n = Math.max(24, Math.ceil((Math.PI * (ex + ey)) / 3));
    const a0 = Math.atan2(start[1] - cy, start[0] - cx);
    const ring: Pt[] = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI * 2; ring.push([cx + ex * Math.cos(a), cy + ey * Math.sin(a)]); }
    return { kind: "ellipse", p: densify(ring, pr, 3) };
  }

  // closed with corners
  const loop = [...list, start];
  const c = simplify(loop, Math.max(3, diag * 0.09));
  let corners = c.slice(0, -1);
  // merge a corner at the start/end seam that is nearly straight
  if (corners.length > 3) {
    const a = corners[corners.length - 1], b = corners[0], d = corners[1];
    if (segDist(b, a, d) < diag * 0.08) corners = corners.slice(1);
  }
  if (corners.length === 3) return { kind: "triangle", p: densify([...corners, corners[0]], pr) };
  if (corners.length === 4) {
    // nearly axis-aligned: a clean rectangle on the bounding box; otherwise the four corners
    const tilted = corners.some((q, i) => {
      const n = corners[(i + 1) % 4];
      const ang = Math.abs(Math.atan2(n[1] - q[1], n[0] - q[0])) % (Math.PI / 2);
      return Math.min(ang, Math.PI / 2 - ang) > 0.2;
    });
    const quad: Pt[] = tilted ? corners : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    return { kind: "rect", p: densify([...quad, quad[0]], pr) };
  }
  return null;
}
