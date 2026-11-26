import { test } from "node:test";
import assert from "node:assert/strict";
import { recognize } from "./shapes.ts";

// hand-drawn wobble, deterministic
const wob = (i: number) => Math.sin(i * 1.7) * 1.2;
const stroke = (f: (t: number) => [number, number], n = 120) => {
  const p: number[] = [];
  for (let i = 0; i <= n; i++) { const [x, y] = f(i / n); p.push(x + wob(i), y + wob(i + 3), 0.5); }
  return p;
};
const poly = (pts: [number, number][]) => (t: number): [number, number] => {
  const seg = pts.length - 1, u = Math.min(seg - 1e-9, t * seg), i = Math.floor(u), f = u - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
};

test("recognizes lines, arrows and closed shapes", () => {
  assert.equal(recognize(stroke(poly([[100, 100], [300, 140]])))?.kind, "line");
  assert.equal(recognize(stroke(poly([[100, 100], [300, 100], [280, 88]])))?.kind, "arrow");
  assert.equal(recognize(stroke(poly([[100, 100], [300, 100], [280, 88], [300, 100], [282, 114]])))?.kind, "arrow");
  assert.equal(recognize(stroke(poly([[100, 300], [200, 120], [300, 300], [100, 300]])))?.kind, "triangle");
  assert.equal(recognize(stroke(poly([[100, 100], [300, 100], [300, 220], [100, 220], [100, 100]])))?.kind, "rect");
  assert.equal(recognize(stroke((t) => [200 + 80 * Math.cos(t * Math.PI * 2), 200 + 80 * Math.sin(t * Math.PI * 2)]))?.kind, "ellipse");
  assert.equal(recognize(stroke((t) => [200 + 120 * Math.cos(t * Math.PI * 2), 200 + 50 * Math.sin(t * Math.PI * 2)]))?.kind, "ellipse");
});

test("handwriting is left alone", () => {
  // a wavy word, a small letter, an open curve
  assert.equal(recognize(stroke((t) => [100 + t * 200, 100 + Math.sin(t * 20) * 12])), null);
  assert.equal(recognize(stroke((t) => [100 + 8 * Math.cos(t * 6), 100 + 8 * Math.sin(t * 6)])), null);
  assert.equal(recognize(stroke((t) => [100 + 100 * Math.cos(t * Math.PI), 100 + 100 * Math.sin(t * Math.PI)])), null);
});
