/** Diagnostic state (stored in the browser) and its result. */
import { MCQS, SHEETS, SHEET_MAX } from "./content.ts";
import { addTo, emptyTally, gradeFromShare, plan, UNITS } from "./scoring.ts";

export type Stage = "intro" | "mcq" | "sheets" | "sheet" | "results";

export interface DiagState {
  v: 1;
  stage: Stage;
  level: "NM" | "NS";
  mcq: number;
  answers: Record<string, number>;
  checked: Record<string, boolean>;
  sheet: number;
  typed: Record<string, string[][]>;
  awarded: Record<string, (boolean | null)[][]>;
  marked: Record<string, boolean>;
  done: Record<string, boolean>;
}

export const DIAG_KEY = "kw-diag-v1";

export const freshDiag = (): DiagState => ({ v: 1, stage: "intro", level: "NS", mcq: 0, answers: {}, checked: {}, sheet: 0, typed: {}, awarded: {}, marked: {}, done: {} });

export function diagResult(s: DiagState) {
  const tally = emptyTally();
  MCQS.forEach((q) => { if (s.answers[q.id] !== undefined) addTo(tally, q.unit, s.answers[q.id] === q.answer ? 1 : 0, 1); });
  let sheetsDone = 0;
  SHEETS.forEach((sh) => {
    if (!s.done[sh.id]) return;
    sheetsDone++;
    const got = (s.awarded[sh.id] ?? []).flat().filter((x) => x === true).length;
    addTo(tally, sh.unit, got, SHEET_MAX(sh));
  });
  const earned = UNITS.reduce((a, u) => a + tally[u].earned, 0);
  const possible = UNITS.reduce((a, u) => a + tally[u].possible, 0);
  return { tally, sheetsDone, earned, possible, grade: gradeFromShare(possible ? earned / possible : 0), weeks: plan(tally) };
}
