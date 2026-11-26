/**
 * Checks every question of the bank (bank/*.ts) for many seeds:
 * - the worked solution earns every mark, a blank earns none;
 * - the answer is not already written in the question;
 * - texts have no NaN / undefined / Infinity, numbers are finite, figures are well formed;
 * - each subtopic has its formulas.
 * BANK=C npm run test:bank  checks only unit C.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { markTyped } from "./check.ts";
import { generateSet, TOPICS } from "./generators.ts";
import { FORMULAS } from "./formulas.ts";
import type { Fig } from "./fig.ts";

const only = process.env.BANK;
const topics = TOPICS.filter((t) => !only || t.unit === only);
const SEEDS = Number(process.env.SEEDS ?? 60);
const BAD = /NaN|undefined|Infinity|\[object|null/;

function checkFig(f: Fig, where: string) {
  assert.ok(f.w > 0 && f.h > 0 && f.alt.trim().length > 5, `${where}: figure size and alt`);
  const nums = JSON.stringify(f.items).match(/-?\d+(\.\d+)?(e[-+]?\d+)?/g) ?? [];
  assert.ok(!/null|NaN/.test(JSON.stringify(f.items)), `${where}: figure has NaN`);
  for (const n of nums) assert.ok(Number.isFinite(Number(n)), `${where}: figure number ${n}`);
  for (const it of f.items) {
    if (it.t === "text") assert.ok(!BAD.test(it.s), `${where}: figure text "${it.s}"`);
    if (it.t === "graph") for (const s of it.series) for (const [x, y] of s.pts) assert.ok(Number.isFinite(x) && Number.isFinite(y), `${where}: graph point`);
  }
}

for (const t of topics) {
  test(`${t.name}: ${t.concepts.length} conceptos`, () => {
    assert.ok(t.concepts.length > 0, `${t.id} has no concepts`);
    assert.ok(/^[A-E]\.\d /.test(t.name), `${t.id}: name starts with the syllabus code`);
    const code = t.name.slice(0, 3);
    assert.ok(FORMULAS[code]?.items.length, `${t.id}: formulas for ${code}`);
    const ids = new Set<string>();
    for (const c of t.concepts) {
      assert.ok(!ids.has(c.id), `${t.id}: duplicate concept id ${c.id}`);
      ids.add(c.id);
      assert.ok(c.keywords.length >= 2, `${c.id}: keywords`);
      const stems = new Set<string>();
      const leaks = new Map<string, string[]>();
      for (let seed = 1; seed <= SEEDS; seed++) {
        const [sh] = generateSet(t.id, [c.id], seed, 1);
        const where = `${t.id}.${c.id} seed ${seed}`;
        stems.add(sh.stem + sh.parts.map((p) => p.prompt).join());
        const all = [sh.stem, sh.data ?? "", ...sh.parts.flatMap((p) => [p.prompt, ...(p.solution ?? []), ...p.rules.map((r) => r.text)])].join(" ");
        assert.ok(!BAD.test(all), `${where}: text has NaN/undefined: ${all.match(BAD)?.[0]} in ${all.slice(0, 300)}`);
        assert.ok(sh.parts.length >= 1 && sh.parts.length <= 5, `${where}: parts`);
        if (sh.fig) checkFig(sh.fig, where);
        sh.parts.forEach((p) => {
          const w = `${where} ${p.label}`;
          if (p.fig) checkFig(p.fig, w);
          assert.equal(p.rules.length, p.marks, `${w}: marks = rules`);
          assert.ok(p.marks >= 1 && p.marks <= 6, `${w}: 1–6 marks`);
          assert.ok(p.solution && p.solution.length, `${w}: solution`);
          const full = markTyped(p.solution!, p.rules);
          assert.equal(full.score, p.marks, `${w}: the solution must earn every mark. Missing: ${p.rules.filter((_, i) => !full.awarded[i]).map((r) => r.code + " " + r.text).join(" / ")}. Solution: ${p.solution!.join(" | ")}`);
          assert.equal(markTyped(["", ""], p.rules).score, 0, `${w}: a blank earns nothing`);
          // the final answer must not be given away by the question itself (except "show that");
          // a number of the question can match the answer by chance now and then
          if (!/muestre|demuestre/i.test(p.prompt)) {
            const leak = markTyped([sh.stem, sh.data ?? "", p.prompt], p.rules);
            const lastA = p.rules.map((r, i) => (r.code === "A1" ? i : -1)).filter((i) => i >= 0).pop();
            if (lastA !== undefined && leak.awarded[lastA]) leaks.set(p.label, [...(leaks.get(p.label) ?? []), `seed ${seed}: ${p.rules[lastA].text}`]);
          }
        });
      }
      assert.ok(stems.size > 1 || SEEDS < 5, `${t.id}.${c.id}: numbers never change`);
      for (const [label, l] of leaks) assert.ok(l.length <= SEEDS * 0.25, `${t.id}.${c.id} ${label}: the question already contains the answer in ${l.length}/${SEEDS} seeds (${l[0]})`);
    }
  });
}
