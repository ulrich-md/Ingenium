/**
 * Diagnostic scoring: marks per unit, an approximate IB grade (1-7)
 * and a 12-week plan that starts with the weakest units.
 */

export type Unit = "A" | "B" | "C" | "D" | "E";
export const UNITS: Unit[] = ["A", "B", "C", "D", "E"];

export const UNIT_NAME: Record<Unit, string> = {
  A: "Espacio, tiempo y movimiento",
  B: "Naturaleza particulada de la materia",
  C: "Comportamiento ondulatorio",
  D: "Campos",
  E: "Física nuclear y cuántica",
};

/**
 * Approximate grade boundaries as a share of total marks. Real IB boundaries
 * change every session; these are a reasonable midpoint for a diagnostic.
 */
const BOUNDS: [number, number][] = [
  [0.7, 7], [0.58, 6], [0.46, 5], [0.35, 4], [0.24, 3], [0.13, 2],
];

export function gradeFromShare(share: number): number {
  for (const [min, g] of BOUNDS) if (share >= min) return g;
  return 1;
}

export interface Tally { earned: number; possible: number }

export function addTo(t: Record<Unit, Tally>, unit: Unit, earned: number, possible: number) {
  t[unit].earned += earned;
  t[unit].possible += possible;
}

export function emptyTally(): Record<Unit, Tally> {
  return { A: { earned: 0, possible: 0 }, B: { earned: 0, possible: 0 }, C: { earned: 0, possible: 0 }, D: { earned: 0, possible: 0 }, E: { earned: 0, possible: 0 } };
}

export function share(t: Tally): number {
  return t.possible ? t.earned / t.possible : 0;
}

export interface PlanBlock { unit: Unit; weeks: [number, number] }

/**
 * 12 weeks: the last 2 are always mixed mocks. The 10 study weeks go to units
 * in order of weakness, weaker units getting more weeks (at least 1 each).
 */
export function plan(t: Record<Unit, Tally>): PlanBlock[] {
  const order = [...UNITS].sort((a, b) => share(t[a]) - share(t[b]));
  const need = order.map((u) => 1.15 - share(t[u]));
  const sum = need.reduce((a, b) => a + b, 0);
  const raw = need.map((n) => (n / sum) * 10);
  const weeks = raw.map((r) => Math.max(1, Math.floor(r)));
  let left = 10 - weeks.reduce((a, b) => a + b, 0);
  const byRemainder = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k = (k + 1) % byRemainder.length, left--) weeks[byRemainder[k][1]]++;
  for (let k = 0; left < 0; k++) {
    const i = weeks.indexOf(Math.max(...weeks));
    weeks[i]--; left++;
  }
  const out: PlanBlock[] = [];
  let start = 1;
  order.forEach((u, i) => {
    out.push({ unit: u, weeks: [start, start + weeks[i] - 1] });
    start += weeks[i];
  });
  return out;
}
