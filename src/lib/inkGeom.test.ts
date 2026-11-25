import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanPath, effectivePressure, outline, rawPath } from "./inkGeom.ts";
import polygonClipping, { type Ring } from "polygon-clipping";

const loopy = () => {
  const p: number[] = [];
  for (let i = 0; i < 300; i++) { const t = i / 20; p.push(100 + t * 30 + Math.sin(t * 3) * 25, 100 + Math.cos(t * 3) * 40, effectivePressure("fountain", 0.3 + 0.4 * Math.abs(Math.sin(t)), 0.6)); }
  return { k: "fountain" as const, s: 3, p };
};

test("ink pens keep a constant width; the pencil follows pressure", () => {
  for (const k of ["fountain", "ball", "marker"] as const) {
    assert.equal(effectivePressure(k, 0.9, 0.2), effectivePressure(k, 0.1, 1.6));
  }
  assert.ok(effectivePressure("pencil", 0.9, 0.4) > effectivePressure("pencil", 0.3, 0.4));
});

test("clean path has no self-crossings left (the union of the union is itself)", () => {
  const st = loopy();
  const merged = polygonClipping.union([outline(st) as Ring]);
  assert.ok(merged.length >= 1);
  const again = polygonClipping.union(merged as never);
  assert.equal(JSON.stringify(again), JSON.stringify(merged));
  const d = cleanPath(st);
  assert.ok(d.startsWith("M") && d.includes("Q") && d.endsWith("Z"));
  // loops of the handwriting become holes (several closed subpaths)
  assert.ok((d.match(/M/g) ?? []).length > 1);
});

test("a tap is a dot, and the fast path always returns something", () => {
  const dot = { s: 3, p: [10, 10, 0.5] };
  assert.ok(cleanPath(dot).includes("a"));
  assert.ok(rawPath(loopy()).length > 100);
});

test("fountain and ball outlines have the same width all along, whatever the pressure", () => {
  for (const k of ["fountain", "ball"] as const) {
    const p: number[] = [];
    // a straight horizontal stroke with pressure going from light to hard
    for (let i = 0; i < 120; i++) p.push(100 + i * 2, 100, i < 60 ? 0.1 : 0.95);
    const ring = outline({ k, s: 3, p });
    // half-width at points well inside the stroke (away from the round caps)
    const widthAt = (x: number) => {
      const ys = ring.filter(([px]) => Math.abs(px - x) < 2).map(([, y]) => y);
      return Math.max(...ys) - Math.min(...ys);
    };
    assert.ok(Math.abs(widthAt(140) - widthAt(300)) < 0.15, `${k}: ${widthAt(140)} vs ${widthAt(300)}`);
  }
});

test("a live piece from the middle of a pencil stroke has no taper at its ends", () => {
  const p: number[] = [];
  for (let i = 0; i < 60; i++) p.push(100 + i * 2, 100, 0.6);
  const width = (ring: number[][], x: number) => {
    const ys = ring.filter(([px]) => Math.abs(px - x) < 1.5).map(([, y]) => y);
    return ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
  };
  const mid = outline({ k: "pencil", s: 3, p }, [], false, false);
  const whole = outline({ k: "pencil", s: 3, p });
  assert.ok(width(mid, 101) > width(whole, 101) * 2);
});
