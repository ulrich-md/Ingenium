/**
 * Step-by-step hints for practice (never in mocks or the diagnostic). A part can bring its
 * own (`Part.hints`); otherwise they come from its markscheme and worked solution, from
 * the gentlest to the most revealing, and never include the final line (the answer):
 * 1. what to use (the method point, or the equation the solution starts from),
 * 2. how to start (the first step with the numbers in place),
 * 3. the whole way except the last step.
 */
import type { Part } from "./content.ts";
import { numbersIn } from "./numbers.ts";

const hasDigits = (s: string) => /\d/.test(s.replace(/[₀-₉⁰-⁹]/g, ""));

export function hintsFor(p: Part): string[] {
  if (p.hints?.length) return p.hints;
  const sol = p.solution ?? [];
  // without the answer: the last line, and any step that already shows the final value
  const finals = p.rules.filter((r) => r.code === "A1").slice(-1);
  const gives = (l: string) => finals.some((r) => r.test(l, numbersIn(l)));
  const steps = sol.slice(0, -1).filter((l) => !gives(l));
  const out: string[] = [];
  const m1 = p.rules.find((r) => r.code === "M1");
  const r1 = p.rules.find((r) => r.code === "R1");
  if (r1 && p.rules.length === 1) {
    // an explanation: first what it should be about, then the markscheme point
    out.push(`Tu respuesta tiene que mencionar: ${r1.miss ?? "la idea clave"}.`);
    out.push(`En el esquema de calificación: «${r1.text}».`);
    return out;
  }
  const formula = sol.find((l) => l.includes("=") && !hasDigits(l));
  // the method in words or as an equation, without numbers that give it away
  if (m1 && !hasDigits(m1.text)) out.push(`Qué usar: ${m1.text}.`);
  else if (formula) out.push(`Qué usar: ${formula}`);
  else if (m1 && !gives(m1.text)) out.push(`Qué usar: ${m1.text}.`);
  else out.push("Identifica qué te piden y qué ecuación lo relaciona con los datos (mira el botón Fórmulas).");
  const first = steps.find((l) => hasDigits(l));
  if (first) out.push(`Para empezar: ${first}`);
  if (steps.length > 1) out.push(`Casi todo el camino:\n${steps.join("\n")}`);
  return out;
}
