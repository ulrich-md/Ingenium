/**
 * "Datos e incógnita" for beginners: the quantities in a question, converted to SI units,
 * and what each part asks for, with the meaning of its IB command term.
 */
import { normalize } from "./numbers.ts";

/** Units and their factor to SI (null: already SI or not a simple factor). */
const UNITS: [string, string, number | null, string?][] = [
  // [as written, SI unit, factor, note]
  ["N m² C⁻²", "N m² C⁻²", null], ["N m² kg⁻²", "N m² kg⁻²", null], ["J K⁻¹ mol⁻¹", "J K⁻¹ mol⁻¹", null], ["W m⁻² K⁻⁴", "W m⁻² K⁻⁴", null],
  ["J K⁻¹", "J K⁻¹", null], ["J s", "J s", null], ["C kg⁻¹", "C kg⁻¹", null], ["N C⁻¹", "N C⁻¹", null], ["V m⁻¹", "V m⁻¹", null],
  ["T m A⁻¹", "T m A⁻¹", null], ["F m⁻¹", "F m⁻¹", null], ["Ω m", "Ω m", null], ["mol⁻¹", "mol⁻¹", null], ["m K", "m K", null],
  ["km h⁻¹", "m s⁻¹", 1 / 3.6], ["m s⁻²", "m s⁻²", null], ["m s⁻¹", "m s⁻¹", null],
  ["kg m⁻³", "kg m⁻³", null], ["N m⁻¹", "N m⁻¹", null], ["W m⁻²", "W m⁻²", null], ["J kg⁻¹ K⁻¹", "J kg⁻¹ K⁻¹", null], ["J kg⁻¹", "J kg⁻¹", null],
  ["kΩ", "Ω", 1e3], ["MΩ", "Ω", 1e6], ["Ω", "Ω", null],
  ["MeV", "J", 1.6e-13], ["keV", "J", 1.6e-16], ["eV", "J", 1.6e-19],
  ["kJ", "J", 1e3], ["MJ", "J", 1e6], ["J", "J", null],
  ["GW", "W", 1e9], ["MW", "W", 1e6], ["kW", "W", 1e3], ["W", "W", null],
  ["kPa", "Pa", 1e3], ["MPa", "Pa", 1e6], ["atm", "Pa", 1.01e5], ["Pa", "Pa", null],
  ["kV", "V", 1e3], ["mV", "V", 1e-3], ["V", "V", null],
  ["mA", "A", 1e-3], ["μA", "A", 1e-6], ["A", "A", null],
  ["μC", "C", 1e-6], ["nC", "C", 1e-9], ["mC", "C", 1e-3],
  ["mT", "T", 1e-3], ["μT", "T", 1e-6], ["T", "T", null],
  ["MHz", "Hz", 1e6], ["kHz", "Hz", 1e3], ["Hz", "Hz", null],
  ["km", "m", 1e3], ["cm", "m", 1e-2], ["mm", "m", 1e-3], ["μm", "m", 1e-6], ["nm", "m", 1e-9], ["fm", "m", 1e-15],
  ["cm³", "m³", 1e-6], ["dm³", "m³", 1e-3], ["m³", "m³", null], ["cm²", "m²", 1e-4], ["m²", "m²", null],
  ["kg", "kg", null], ["g", "kg", 1e-3], ["mg", "kg", 1e-6],
  ["min", "s", 60], ["ms", "s", 1e-3], ["μs", "s", 1e-6], ["ns", "s", 1e-9], ["h", "s", 3600], ["s", "s", null],
  ["°C", "K", null, "suma 273 para pasar a kelvin"], ["K", "K", null],
  ["mol", "mol", null], ["Bq", "Bq", null], ["°", "°", null, "ángulo"], ["%", "%", null],
  ["m", "m", null], ["N", "N", null], ["C", "C", null], ["u", "u", null, "1 u = 1,661 × 10⁻²⁷ kg"],
  ["minutos", "s", 60], ["segundos", "s", null], ["horas", "s", 3600],
  ["años", "s", 3.156e7, "solo si hace falta en segundos"], ["días", "s", 86400, "solo si hace falta en segundos"],
];

const NUM = String.raw`(-?\d+(?:[.,]\d+)?(?:\s*×\s*10[⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?)`;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const UNIT_RE = UNITS.map(([u]) => u).sort((a, b) => b.length - a.length).map(esc).join("|");
const QTY = new RegExp(`${NUM}\\s?(${UNIT_RE})(?![\\p{L}\\d])`, "gu");

export interface Dato { text: string; si?: string; note?: string }

const toNumber = (s: string) => {
  const t = normalize(s).replace(/\s/g, "").replace("×10^", "e");
  return Number(t);
};
const show = (x: number) => {
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e4 || a < 1e-2)) {
    const [m, e] = x.toExponential(2).split("e");
    const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
    return `${m.replace(".", ",")} × 10${Array.from(String(Number(e)), (c) => SUP[c] ?? c).join("")}`;
  }
  return String(Number(x.toPrecision(3))).replace(".", ",");
};

/** Quantities written in the question ("40 mm", "2,0 × 10⁶ m s⁻¹"), with their SI value. */
export function datos(text: string): Dato[] {
  const out: Dato[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(QTY)) {
    const raw = `${m[1]} ${m[2]}`;
    if (seen.has(raw)) continue;
    seen.add(raw);
    const u = UNITS.find(([x]) => x === m[2])!;
    const d: Dato = { text: raw };
    const v = toNumber(m[1]);
    if (u[2] && Number.isFinite(v)) d.si = `${show(v * u[2])} ${u[1]}`;
    if (u[0] === "°C" && Number.isFinite(v)) d.si = `${show(v + 273)} K`;
    if (u[3] && u[0] !== "°C") d.note = u[3];
    out.push(d);
  }
  return out;
}

/** IB command terms (paraphrased), so the student knows what kind of answer is expected. */
export const TERMS: [string, string][] = [
  ["Muestre que", "llega al resultado que ya te dan, mostrando cada paso (el último paso no basta)"],
  ["Demuestre", "llega al resultado que ya te dan, mostrando cada paso"],
  ["Calcule", "obtén un valor numérico con unidades, mostrando los pasos"],
  ["Determine", "obtén el único resultado posible (un valor o una conclusión), mostrando cómo"],
  ["Estime", "obtén un valor aproximado razonable"],
  ["Deduzca", "llega a una conclusión a partir de la información dada"],
  ["Explique", "da razones o causas detalladas: el porqué, no solo el qué"],
  ["Describa", "cuenta con detalle cómo es o qué ocurre"],
  ["Indique", "da una respuesta breve (un nombre, un valor), sin explicación"],
  ["Identifique", "elige o nombra la respuesta correcta entre varias posibilidades"],
  ["Sugiera", "propón una respuesta razonable; puede haber varias válidas"],
  ["Compare", "di en qué se parecen y en qué se diferencian"],
  ["Resuma", "expón lo esencial en pocas líneas"],
  ["Defina", "da el significado preciso"],
];

/** "Calcule la rapidez del coche." → the command term, its meaning and what is asked. */
export function pedido(prompt: string): { term?: string; meaning?: string; what: string } {
  const p = prompt.trim();
  // the command term starts the prompt or one of its sentences ("La distancia se duplica. Determine …")
  let best: { i: number; t: [string, string] } | null = null;
  for (const t of TERMS) {
    const m = new RegExp(`(^|[.:]\\s+)${t[0]}\\b`, "i").exec(p);
    if (m && (!best || m.index < best.i)) best = { i: m.index + m[1].length, t };
  }
  if (!best) return { what: p };
  const before = p.slice(0, best.i).trim();
  const after = p.slice(best.i + best.t[0].length).replace(/^[,:\s]+/, "").replace(/\.$/, "");
  return { term: best.t[0], meaning: best.t[1], what: before ? `${before} → ${after}` : after };
}
