/**
 * Reading numbers out of a student's typed line, the way an examiner would:
 * "7,07 × 10⁶", "7.07x10^6", "7.07e6", "−1,3×10¹⁰" all become numbers.
 */

const SUP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁻": "-", "⁺": "+",
};

/** Superscripts to ^n, Unicode minus to "-", decimal comma to point. */
export function normalize(s: string): string {
  let t = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => "^" + Array.from(m, (c) => SUP[c]).join(""));
  t = t.replace(/[−–]/g, "-");
  t = t.replace(/(\d),(\d)/g, "$1.$2");
  return t;
}

const NUM = /(^|[^\d.^a-zA-Z])(-?\d+(?:\.\d+)?)(?:\s*(?:[x×*·]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?|[eE]([+-]?\d+)))?/g;

/** Every number written in the line, with scientific notation resolved. */
export function numbersIn(s: string): number[] {
  // Powers that are not of ten (m s⁻², v², r³) are unit or algebra exponents, not values.
  const t = normalize(s).replace(/(?<!10\s*)\^\(?[+-]?\d+\)?/g, " ");
  const out: number[] = [];
  for (const m of t.matchAll(NUM)) {
    const mant = parseFloat(m[2]);
    const exp = m[3] ?? m[4];
    out.push(exp !== undefined ? mant * Math.pow(10, parseInt(exp, 10)) : mant);
  }
  return out;
}

/** True when some number is within relTol (default 2%) of the target. */
export function near(nums: number[], target: number, relTol = 0.02): boolean {
  return nums.some((n) => Math.abs(n - target) <= Math.abs(target) * relTol);
}

/** Lower-case, accents removed: "Área" and "area" match. */
export function plain(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** True when the line contains any of the words (accent- and case-insensitive). */
export function hasAny(line: string, ...words: string[]): boolean {
  const p = plain(line);
  return words.some((w) => p.includes(plain(w)));
}

/** Tidy what the student typed: x10^6 → ×10⁶, sqrt( → √(. */
export function prettify(s: string): string {
  const SUPR: Record<string, string> = Object.fromEntries(Object.entries(SUP).map(([k, v]) => [v, k]));
  let t = s.replace(/sqrt\s*\(/gi, "√(");
  t = t.replace(/(\d)\s*[x*]\s*10(?=\s*\^)/g, "$1 × 10");
  t = t.replace(/\^\(?\s*([+\-−]?\d+)\s*\)?/g, (_, e: string) =>
    Array.from(e.replace("−", "-"), (c) => SUPR[c] ?? c).join(""),
  );
  return t;
}
