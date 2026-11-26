/**
 * Exercise generators: original IB-style questions with new numbers every time.
 * The questions live in bank/A.ts … bank/E.ts (one file per unit, see bank/kit.ts).
 */
import type { Sheet } from "./content.ts";
import { hasAny } from "./numbers.ts";
import { rng, pick, type Topic } from "./bank/kit.ts";
import { topics as A } from "./bank/A.ts";
import { topics as B } from "./bank/B.ts";
import { topics as C } from "./bank/C.ts";
import { topics as D } from "./bank/D.ts";
import { topics as E } from "./bank/E.ts";

export { fmt, G, rng, type Concept, type Topic } from "./bank/kit.ts";

export const TOPICS: Topic[] = [...A, ...B, ...C, ...D, ...E];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

/** Build n exam sheets from the chosen concepts (cycling through them). */
export function generateSet(topicId: string, conceptIds: string[], seed: number, n = 4, idPrefix = "x"): Sheet[] {
  const topic = topicById(topicId);
  if (!topic) return [];
  const chosen = topic.concepts.filter((c) => conceptIds.includes(c.id));
  const list = chosen.length ? chosen : topic.concepts;
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const c = list[i % list.length];
    const q = c.make(r);
    return {
      id: `${idPrefix}-${i}`,
      num: i + 1,
      code: `KW.F.${topic.id}.${c.id.toUpperCase()}.${(seed % 9000) + 1000}`,
      unit: topic.unit,
      topic: `${topic.name} · ${c.label}`,
      paper: "Práctica",
      stem: q.stem,
      data: q.data,
      fig: q.fig,
      parts: q.parts,
    };
  });
}

/** Concepts whose keywords appear in typed notes. */
export function detectConcepts(topicId: string, text: string): string[] {
  const topic = topicById(topicId);
  if (!topic || !text.trim()) return [];
  return topic.concepts.filter((c) => c.keywords.some((k) => hasAny(text, k))).map((c) => c.id);
}

/**
 * A short Paper 2 mock: n sheets from different topics (spread over the units, Higher
 * Level topics only at NS), a random concept each, renumbered 1..n.
 * `level` undefined: the first version (mocks started before the bank grew), kept so their
 * questions and ink do not change.
 */
export function generateMock(seed: number, n: number, idPrefix: string, level?: "NM" | "NS"): Sheet[] {
  const r = rng(seed);
  if (!level) {
    return Array.from({ length: n }, (_, i) => {
      const [tid, cids] = LEGACY_MOCK[i % LEGACY_MOCK.length];
      const cid = pick(r, cids);
      const [sh] = generateSet(tid, [cid], seed + i * 7919, 1, `${idPrefix}-${i}`);
      return { ...sh, num: i + 1, paper: "Prueba 2" };
    });
  }
  const pool = TOPICS.filter((t) => t.concepts.length && (level === "NS" || !t.hl));
  // shuffle, then take topics unit by unit so every unit appears before any repeats
  const shuffled = pool.map((t) => [r(), t] as const).sort((a, b) => a[0] - b[0]).map(([, t]) => t);
  const byUnit = new Map<string, Topic[]>();
  for (const t of shuffled) byUnit.set(t.unit, [...(byUnit.get(t.unit) ?? []), t]);
  const units = [...byUnit.keys()];
  const order: Topic[] = [];
  for (let k = 0; order.length < n && k < 50; k++) for (const u of units) { const l = byUnit.get(u)!; if (l.length) order.push(l[k % l.length]); }
  return order.slice(0, n).map((topic, i) => {
    const concept = pick(r, topic.concepts);
    const [sh] = generateSet(topic.id, [concept.id], seed + i * 7919, 1, `${idPrefix}-${i}`);
    return { ...sh, num: i + 1, paper: "Prueba 2" };
  });
}
/** Topics and concepts of the first mocks, in their order. */
const LEGACY_MOCK: [string, string[]][] = [
  ["A1", ["suvat", "caida", "proyectil"]], ["A2", ["newton2", "impulso", "choque"]], ["A3", ["energia", "potencia"]],
  ["B3", ["gasideal", "isocorico"]], ["D1", ["gravitacion", "orbita", "escape", "kepler"]],
];

/** IB Paper 2 runs at roughly 1.8 minutes per mark (90 min for 50 marks at SL). */
export const minutesFor = (sheets: Sheet[]) => Math.round(sheets.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.marks, 0), 0) * 1.8);
