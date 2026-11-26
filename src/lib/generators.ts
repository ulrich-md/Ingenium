/**
 * Exercise generators: original IB-style questions with new numbers every time.
 * The questions live in bank/A.ts … bank/E.ts (one file per unit, see bank/kit.ts).
 */
import type { Sheet } from "./content.ts";
import { hasAny } from "./numbers.ts";
import { rng, pick, type Concept, type Level, type Topic } from "./bank/kit.ts";
import { topics as A } from "./bank/A.ts";
import { topics as B } from "./bank/B.ts";
import { topics as C } from "./bank/C.ts";
import { topics as D } from "./bank/D.ts";
import { topics as E } from "./bank/E.ts";
import { extra as Ab } from "./bank/A_basico.ts";
import { extra as Ae } from "./bank/A_examen.ts";
import { extra as Bb } from "./bank/B_basico.ts";
import { extra as Be } from "./bank/B_examen.ts";
import { extra as Cb } from "./bank/C_basico.ts";
import { extra as Ce } from "./bank/C_examen.ts";
import { extra as Db } from "./bank/D_basico.ts";
import { extra as De } from "./bank/D_examen.ts";
import { extra as Eb } from "./bank/E_basico.ts";
import { extra as Ee } from "./bank/E_examen.ts";

export { fmt, G, rng, LEVEL_NAME, type Concept, type Level, type Topic } from "./bank/kit.ts";

/** Each subtopic with the extra questions of bank/X_basico.ts and bank/X_examen.ts. */
const EXTRAS = [Ab, Ae, Bb, Be, Cb, Ce, Db, De, Eb, Ee];
export const TOPICS: Topic[] = [...A, ...B, ...C, ...D, ...E].map((t) => ({
  ...t,
  concepts: [...t.concepts, ...EXTRAS.flatMap((x) => x[t.id] ?? [])],
}));

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

/** A concept's level: its own, or from its marks (≤3 Básico, 4 Intermedio, ≥5 Examen). */
const levels = new WeakMap<Concept, Level>();
export function levelOf(c: Concept): Level {
  if (c.level) return c.level;
  let l = levels.get(c);
  if (!l) {
    const marks = c.make(rng(1)).parts.reduce((a, p) => a + p.marks, 0);
    l = marks <= 3 ? 1 : marks <= 4 ? 2 : 3;
    levels.set(c, l);
  }
  return l;
}

/** How a practice set picks its sheets: "prog" from Básico up to Examen, or one level. */
export type LevelChoice = "prog" | Level;

/**
 * Build n exam sheets from the chosen concepts.
 * Without `level` (sets made before levels existed): cycling through the concepts in order.
 * "prog": from the easiest to the hardest, spread over the whole range.
 * 1–3: only concepts of that level (the nearest level when the topic has none).
 */
export function generateSet(topicId: string, conceptIds: string[], seed: number, n = 4, idPrefix = "x", level?: LevelChoice): Sheet[] {
  const topic = topicById(topicId);
  if (!topic) return [];
  const chosen = topic.concepts.filter((c) => conceptIds.includes(c.id));
  let list = chosen.length ? chosen : topic.concepts;
  let order: Concept[];
  if (level === "prog") {
    const sorted = [...list].sort((a, b) => levelOf(a) - levelOf(b));
    order = Array.from({ length: n }, (_, i) => sorted[n === 1 ? 0 : Math.round((i * (sorted.length - 1)) / (n - 1))]);
  } else {
    if (level) {
      for (const d of [0, 1, -1, 2, -2]) {
        const at = list.filter((c) => levelOf(c) === level + d);
        if (at.length) { list = at; break; }
      }
    }
    order = Array.from({ length: n }, (_, i) => list[i % list.length]);
  }
  const r = rng(seed);
  return order.map((c, i) => {
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
      level: levelOf(c),
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
