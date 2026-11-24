import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanPath, effectivePressure, outline, rawPath } from "./inkGeom.ts";
import polygonClipping, { type Ring } from "polygon-clipping";

const loopy = () => {
  const p: number[] = [];
  for (let i = 0; i < 300; i++) { const t = i / 20; p.push(100 + t * 30 + Math.sin(t * 3) * 25, 100 + Math.cos(t * 3) * 40, effectivePressure("fountain", 0.3 + 0.4 * Math.abs(Math.sin(t)), 0.6)); }
  return { k: "fountain" as const, s: 3, p };
};

test("fountain pen: harder is thicker, faster is thinner", () => {
  assert.ok(effectivePressure("fountain", 0.9, 0.4) > effectivePressure("fountain", 0.3, 0.4));
  assert.ok(effectivePressure("fountain", 0.5, 0.2) > effectivePressure("fountain", 0.5, 1.6));
  // a ballpoint barely changes
  assert.ok(Math.abs(effectivePressure("ball", 0.9, 0.4) - effectivePressure("ball", 0.2, 0.4)) < 0.2);
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
