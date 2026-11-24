import { test } from "node:test";
import assert from "node:assert/strict";
import { markTyped } from "./check.ts";
import { TOPICS, generateSet, detectConcepts, fmt } from "./generators.ts";

test("fmt writes IB-style numbers", () => {
  assert.equal(fmt(7504.8), "7,50 × 10³");
  assert.equal(fmt(45), "45,0");
  assert.equal(fmt(1200, 2), "1,2 × 10³");
  assert.equal(fmt(7.07e6), "7,07 × 10⁶");
  assert.equal(fmt(0.8, 2), "0,80");
  assert.equal(fmt(-1.27e10, 2), "-1,3 × 10¹⁰");
});

test("every concept: the worked solution earns full marks, a blank earns none", () => {
  for (const t of TOPICS) for (const c of t.concepts) for (let seed = 1; seed <= 40; seed++) {
    const [sheet] = generateSet(t.id, [c.id], seed, 1);
    sheet.parts.forEach((p) => {
      assert.equal(p.rules.length, p.marks, `${c.id} ${p.label}`);
      assert.ok(p.solution && p.solution.length, `${c.id} ${p.label} solution`);
      const full = markTyped(p.solution!, p.rules).score;
      assert.equal(full, p.marks, `${c.id} seed ${seed} ${p.label}: ${p.solution!.join(" | ")}`);
      assert.equal(markTyped(["", ""], p.rules).score, 0, `${c.id} ${p.label} blank`);
    });
  }
});

test("classic mistakes lose the marks", () => {
  // impulse: subtracting the speeds instead of adding them
  const [imp] = generateSet("A2", ["impulso"], 7, 1);
  const m = /de ([\d,]+) kg/.exec(imp.stem)![1].replace(",", ".");
  const [u, v] = [...imp.stem.matchAll(/rapidez (\d+)/g)].map((x) => Number(x[1]));
  const wrong = (Number(m) * (u - v)).toFixed(3);
  assert.equal(markTyped([`Δp = ${wrong} N s`], imp.parts[0].rules).score, 0);
  // gas: Celsius instead of kelvin
  const [gas] = generateSet("B3", ["gasideal"], 3, 1);
  const tc = Number(/a (\d+) °C/.exec(gas.stem)![1]);
  assert.equal(markTyped([`T = ${tc}`], gas.parts[0].rules).awarded[0], false);
});

test("sets cycle through the chosen concepts and are reproducible", () => {
  const a = generateSet("D1", ["orbita", "escape"], 42, 4);
  const b = generateSet("D1", ["orbita", "escape"], 42, 4);
  assert.equal(a.length, 4);
  assert.deepEqual(a.map((s) => s.stem), b.map((s) => s.stem));
  assert.ok(a[0].topic.includes("Órbitas") && a[1].topic.includes("escape"));
  const stems = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => generateSet("D1", ["orbita"], s, 1)[0].stem));
  assert.ok(stems.size > 1, "different seeds give different numbers");
  // the M1 for the collision also accepts the (m₁ + m₂)v form without the product
  const [ch] = generateSet("A2", ["choque"], 1, 1);
  assert.equal(markTyped(["2*4 = (2 + 2)v"], ch.parts[0].rules).awarded[0], true);
});

test("concepts are detected from typed notes", () => {
  assert.deepEqual(detectConcepts("D1", "Hoy vimos la tercera ley de Kepler y la velocidad de escape").sort(), ["escape", "kepler"]);
  assert.deepEqual(detectConcepts("A1", "caída libre: se deja caer, g = 9.8"), ["caida"]);
  assert.deepEqual(detectConcepts("A1", ""), []);
});

import { generateMock, minutesFor } from "./generators.ts";
test("mocks cover every topic and time at about 1.8 min per mark", () => {
  const m = generateMock(5, 8, "mk");
  assert.equal(m.length, 8);
  assert.deepEqual(m.map((s) => s.num), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(new Set(m.map((s) => s.code.split(".")[2])).size, 5);
  const marks = m.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.marks, 0), 0);
  assert.equal(minutesFor(m), Math.round(marks * 1.8));
  assert.equal(new Set(m.map((s) => s.id)).size, 8);
});
