import { test } from "node:test";
import assert from "node:assert/strict";
import { numbersIn, near, prettify } from "./numbers.ts";
import { markTyped } from "./check.ts";
import { SHEETS, MCQS } from "./content.ts";
import { gradeFromShare, plan, emptyTally, addTo } from "./scoring.ts";

const close = (a: number, b: number) => Math.abs(a - b) <= Math.abs(b) * 1e-9;

test("reads scientific notation in every way a student types it", () => {
  assert.ok(close(numbersIn("r = 7,07 × 10⁶ m")[0], 7.07e6));
  assert.ok(close(numbersIn("r=7.07x10^6")[0], 7.07e6));
  assert.ok(close(numbersIn("7.07e6")[0], 7.07e6));
  assert.ok(close(numbersIn("E = −1,3×10¹⁰ J")[0], -1.3e10));
  assert.ok(close(numbersIn("6,67×10⁻¹¹")[0], 6.67e-11));
  assert.deepEqual(numbersIn("a = 0,80 m s⁻²"), [0.8]);
  assert.deepEqual(numbersIn("d = 10 + 40 = 50 m"), [10, 40, 50]);
});

test("prettify turns typed shortcuts into exam notation", () => {
  assert.equal(prettify("7.07x10^6"), "7.07 × 10⁶");
  assert.equal(prettify("sqrt(GM/r)"), "√(GM/r)");
  assert.equal(prettify("6.67*10^-11"), "6.67 × 10⁻¹¹");
});

test("near uses a relative tolerance", () => {
  assert.ok(near([7505], 7.5e3));
  assert.ok(!near([2.4e4], 7.5e3));
});

const part = (s: number, p: number) => SHEETS[s].parts[p];

test("orbit (b): the classic error of using the altitude as radius gets 1/3", () => {
  const rows = ["v = √(GM / r)", "r = 700 km = 7,0 × 10⁵ m", "v = √(6,67×10⁻¹¹ × 5,97×10²⁴ / 7,0×10⁵)", "v = 2,4 × 10⁴ m s⁻¹", ""];
  const m = markTyped(rows, part(2, 1).rules);
  assert.deepEqual(m.awarded, [false, true, false]);
  assert.equal(m.score, 1);
  assert.ok(m.notes.some((n) => n.row === 0 && n.ok));
  assert.ok(m.notes.some((n) => n.row === 3 && !n.ok));
});

test("orbit (b): a full answer gets 3/3", () => {
  const rows = ["r = 6.37x10^6 + 7.0x10^5 = 7.07x10^6 m", "v = sqrt(GM/r)", "v = 7.5x10^3 m/s"];
  assert.equal(markTyped(rows, part(2, 1).rules).score, 3);
});

test("orbit (c): total energy needs the negative sign", () => {
  assert.equal(markTyped(["E = -GMm/2r", "E = -1.27e10 J"], part(2, 2).rules).score, 2);
  assert.equal(markTyped(["E = GMm/2r", "E = 1.27e10 J"], part(2, 2).rules).score, 1);
});

test("gas (a): using Celsius loses both marks, kelvin gets both", () => {
  assert.equal(markTyped(["p = 0.25*8.31*20/4.0e-3", "p = 1.0e4 Pa"], part(1, 0).rules).score, 0);
  assert.equal(markTyped(["T = 293 K", "p = nRT/V = 1.5 × 10^5 Pa"], part(1, 0).rules).score, 2);
});

test("kinematics: distance from the area", () => {
  assert.equal(markTyped(["d = area = 10 + 40", "d = 50 m"], part(0, 1).rules).score, 2);
  assert.equal(markTyped(["F = 0 N"], part(0, 2).rules).score, 1);
});

test("an empty answer scores 0 and notes go on the first row", () => {
  const m = markTyped(["", "", ""], part(2, 1).rules);
  assert.equal(m.score, 0);
  assert.ok(m.notes.every((n) => n.row === 0));
});

test("every sample answer agrees with the rules (typed marking of the demo sheet)", () => {
  // The samples are what the AI demo shows; the typed checker should give the same marks
  // except where the sample relies on ECF, which the rule checker does not apply.
  const ecf = new Set(["s2:1", "s3:2"]);
  SHEETS.forEach((s) => s.parts.forEach((p, i) => {
    if (ecf.has(`${s.id}:${i}`)) return;
    const shown = p.sample.notes.filter((x) => x.ok).flatMap((x) => x.text.replace("✓", "").trim().split(" ").filter(Boolean));
    const got = markTyped(p.sample.rows, p.rules).score;
    const expect = p.rules.length === 1 ? (p.sample.notes.some((x) => x.ok) ? 1 : 0) : shown.length;
    assert.equal(got, expect, `${s.id} ${p.label}`);
  }));
});

test("content is well formed", () => {
  assert.equal(MCQS.length, 10);
  for (const u of ["A", "B", "C", "D", "E"]) assert.equal(MCQS.filter((q) => q.unit === u).length, 2);
  SHEETS.forEach((s) => s.parts.forEach((p) => assert.equal(p.rules.length, p.marks, `${s.id} ${p.label}`)));
});

test("grades and plan", () => {
  assert.equal(gradeFromShare(0.72), 7);
  assert.equal(gradeFromShare(0.4), 4);
  assert.equal(gradeFromShare(0.05), 1);
  const t = emptyTally();
  addTo(t, "A", 6, 6); addTo(t, "B", 3, 6); addTo(t, "C", 1, 2); addTo(t, "D", 1, 8); addTo(t, "E", 0, 2);
  const p = plan(t);
  assert.equal(p.length, 5);
  assert.equal(p[0].weeks[0], 1);
  assert.equal(p[p.length - 1].weeks[1], 10);
  assert.ok(p[0].unit === "E" || p[0].unit === "D");
  const span = (b: { weeks: [number, number] }) => b.weeks[1] - b.weeks[0] + 1;
  assert.ok(span(p[0]) >= span(p[p.length - 1]));
});
