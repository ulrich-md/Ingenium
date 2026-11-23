/**
 * Marking typed answers line by line against a part's mark rules.
 * Each rule is one markscheme point (M1, A1...). A rule is awarded on the
 * first line that satisfies it; a missing rule is noted on the last line written.
 */
import { numbersIn } from "./numbers.ts";

export type MarkCode = "M1" | "A1" | "R1";

export interface Rule {
  code: MarkCode;
  /** The markscheme point, as the student reads it after marking. */
  text: string;
  /** Short note written in red in the margin when the point is missing. */
  miss?: string;
  test: (line: string, nums: number[]) => boolean;
}

export interface RowNote {
  row: number;
  ok: boolean;
  text: string;
}

export interface Marked {
  awarded: boolean[];
  notes: RowNote[];
  score: number;
}

export function markTyped(rows: string[], rules: Rule[]): Marked {
  const parsed = rows.map((r) => ({ line: r, nums: numbersIn(r) }));
  const written = rows.map((r, i) => (r.trim() ? i : -1)).filter((i) => i >= 0);
  const lastRow = written.length ? written[written.length - 1] : 0;
  const awarded: boolean[] = [];
  const byRow = new Map<number, { ok: string[]; bad: string[] }>();
  const at = (row: number) => {
    if (!byRow.has(row)) byRow.set(row, { ok: [], bad: [] });
    return byRow.get(row)!;
  };

  rules.forEach((rule) => {
    const hit = written.find((i) => rule.test(parsed[i].line, parsed[i].nums));
    if (hit !== undefined) {
      awarded.push(true);
      at(hit).ok.push(rule.code);
    } else {
      awarded.push(false);
      at(lastRow).bad.push(rule.miss ?? rule.code);
    }
  });

  const notes: RowNote[] = [];
  for (const [row, v] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
    if (v.ok.length) notes.push({ row, ok: true, text: "✓ " + v.ok.join(" ") });
    if (v.bad.length) notes.push({ row, ok: false, text: "✗ " + v.bad.join(" · ") });
  }
  return { awarded, notes, score: awarded.filter(Boolean).length };
}
