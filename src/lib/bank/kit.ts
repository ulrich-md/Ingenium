/**
 * Toolkit for the question bank (bank/*.ts): every exercise is an ORIGINAL IB-style
 * question written for Kwanta, with new numbers on every run (deterministic per seed),
 * markscheme rules computed from the same numbers, a worked solution, and optionally a
 * diagram described as data (see Fig).
 *
 * How marking works: the student's answer is read line by line; each Rule is one
 * markscheme point (M1 method, A1 answer, R1 reasoning). A rule passes on the first line
 * where `test(line, numbers)` is true. The worked solution must earn every mark
 * (checked by bank.test.ts for many seeds).
 */
import type { Rule } from "../check.ts";
import type { Part } from "../content.ts";
import type { Fig } from "../fig.ts";
import { hasAny, near, normalize } from "../numbers.ts";
import type { Unit } from "../scoring.ts";

export type { Fig, FigItem } from "../fig.ts";
export { hasAny, near, normalize };

/* ---------- constants (IB data booklet values) ---------- */
export const g = 9.8;
export const G = 6.67e-11;
export const R_GAS = 8.31;
export const NA = 6.02e23;
export const KB = 1.38e-23;
export const C_LIGHT = 3.0e8;
export const E_CHARGE = 1.6e-19;
export const ME = 9.11e-31;
export const K_COUL = 8.99e9;
export const EPS0 = 8.85e-12;
export const MU0 = 4 * Math.PI * 1e-7;
export const H_PLANCK = 6.63e-34;
export const SIGMA = 5.67e-8;
export const WIEN = 2.9e-3;
export const U_AMU = 1.661e-27; // kg; 1 u = 931,5 MeV c⁻²
export const MEV = 1.6e-13; // J
export const PLANETS = [
  { n: "la Tierra", M: 5.97e24, R: 6.37e6 },
  { n: "Marte", M: 6.42e23, R: 3.39e6 },
  { n: "la Luna", M: 7.35e22, R: 1.74e6 },
] as const;

/* ---------- deterministic randomness ---------- */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export type R = () => number;
/** One value from a list of nice values (prefer lists to random reals: numbers stay exam-like). */
export const pick = <T,>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];

/* ---------- IB-style number formatting (decimal comma, ×10ⁿ) ---------- */
const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const sup = (n: number) => Array.from(String(n), (c) => SUP[c] ?? c).join("");
function sci(x: number, sig: number): string {
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(sig - 1))) >= 10) { e += 1; m = x / Math.pow(10, e); }
  return `${m.toFixed(sig - 1).replace(".", ",")} × 10${sup(e)}`;
}
/** A number as in an IB paper: 3 significant figures, decimal comma, ×10ⁿ when large or small. */
export function fmt(x: number, sig = 3): string {
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 1e4 || ax < 1e-2) return sci(x, sig);
  const p = x.toPrecision(sig);
  return p.includes("e") ? sci(x, sig) : p.replace(".", ",");
}
export const f2 = (x: number) => fmt(x, 2);

/* ---------- markscheme rules ---------- */
export const TOL = 0.035;
/** A1 (or M1) for a value: passes when the line contains a number within 3.5 % of target. */
export const val = (code: Rule["code"], text: string, target: number, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => near(n, target, TOL) });
/** A1 accepting any of several values (e.g. the same answer in s or in h). */
export const valAny = (code: Rule["code"], text: string, targets: number[], miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => targets.some((t) => near(n, t, TOL)) });
/** M1 for a method: the line shows the equation (regex, tested on the raw and normalized line)
 *  or an intermediate value. */
export const method = (text: string, re: RegExp, target: number, miss: string): Rule =>
  ({ code: "M1", text, miss, test: (l, n) => re.test(l) || re.test(normalize(l)) || near(n, target, TOL) });
/** R1 for a reason in words: passes when the line contains any of the key words
 *  (accent- and case-insensitive; give several ways to say it). */
export const reason = (text: string, miss: string, ...words: string[]): Rule =>
  ({ code: "R1", text, miss, test: (l) => hasAny(l, ...words) });

/** One part of a question: marks = number of rules. `fig`: a diagram under the prompt. */
export function part(label: string, prompt: string, rules: Rule[], solution: string[], rows = Math.max(3, rules.length * 2), fig?: Fig): Part {
  return {
    label, prompt, marks: rules.length, rows, rules, solution, fig,
    sample: { rows: solution, notes: [{ row: solution.length - 1, ok: true, text: "✓ " + rules.map((r) => r.code).join(" ") }] },
  };
}

/* ---------- topics and concepts ---------- */
/** 1 Básico (one idea, one or two steps, numbers given in SI), 2 Intermedio, 3 Examen. */
export type Level = 1 | 2 | 3;
export const LEVEL_NAME: Record<Level, string> = { 1: "Básico", 2: "Intermedio", 3: "Examen" };

export interface Concept {
  id: string;
  label: string;
  /** difficulty; without it, it is worked out from the marks (≤3 Básico, 4 Intermedio, ≥5 Examen) */
  level?: Level;
  /** words that, if typed in class notes, suggest this concept */
  keywords: string[];
  make: (r: R) => { stem: string; data?: string; fig?: Fig; parts: Part[] };
}
/** A syllabus subtopic (IB Physics, first assessment 2025). `hl`: Higher Level only. */
export interface Topic { id: string; unit: Unit; name: string; hl?: boolean; concepts: Concept[] }

/* ---------- formulas shown next to the exercises (data booklet, in LaTeX for KaTeX) ---------- */
export interface Formula {
  /** LaTeX */
  tex: string;
  /** what it is, in a few words */
  n: string;
  /** words of a concept's label that make this formula the one to use first */
  for?: string[];
}
export interface Constant { tex: string; note?: string }
export interface FormulaGroup { title: string; items: Formula[]; consts?: Constant[] }
