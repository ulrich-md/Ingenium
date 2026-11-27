/**
 * Formulas for each topic, as in the IB Physics data booklet (first assessment 2025),
 * written in LaTeX (rendered with KaTeX), with a short description in Spanish.
 * Shown next to the exercises, the way students have the booklet in the exam.
 * `for`: words of the exercise's concept that make a formula the one to use first.
 */
import { formulas as A } from "./bank/A.ts";
import { formulas as B } from "./bank/B.ts";
import { formulas as C } from "./bank/C.ts";
import { formulas as D } from "./bank/D.ts";
import { formulas as E } from "./bank/E.ts";
import type { Formula, FormulaGroup } from "./bank/kit.ts";

export type { Constant, Formula, FormulaGroup } from "./bank/kit.ts";

/** Every subtopic's formulas (they live next to its questions, in bank/*.ts). */
export const FORMULAS: Record<string, FormulaGroup> = { ...A, ...B, ...C, ...D, ...E };

/** The booklet section for a sheet ("A.1 Cinemática · Caída libre" → A.1), relevant formulas first. */
export function formulasFor(topic: string): (FormulaGroup & { key: Formula[] }) | null {
  const code = /([A-E])\.?(\d)/.exec(topic);
  const g = code ? FORMULAS[`${code[1]}.${code[2]}`] : undefined;
  if (!g) return null;
  const t = topic.toLowerCase();
  const concept = t.includes("·") ? t.split("·").slice(1).join("·") : "";
  const key = concept ? g.items.filter((x) => x.for?.some((w) => concept.includes(w))) : [];
  return { ...g, key, items: g.items.filter((x) => !key.includes(x)) };
}
