/**
 * Diagnostic content. Every question is original (written for Kwanta), in the
 * IB exam format and with the IB's Spanish command terms. No IB material.
 */
import type { Rule } from "./check.ts";
import type { Fig } from "./fig.ts";
import { hasAny, near, normalize } from "./numbers.ts";
import type { Unit } from "./scoring.ts";

export interface MCQ {
  id: string;
  unit: Unit;
  topic: string;
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
}

export interface SampleNote { row: number; ok: boolean; text: string }

export interface Part {
  label: string;
  prompt: string;
  marks: number;
  rows: number;
  rules: Rule[];
  /** Example of a handwritten answer and how the AI would mark it (demo). */
  sample: { rows: string[]; notes: SampleNote[] };
  /** Worked solution, one step per line (shown after marking). */
  solution?: string[];
  /** A diagram for this part, under its prompt. */
  fig?: Fig;
}

export interface Sheet {
  id: string;
  num: number;
  code: string;
  unit: Unit;
  topic: string;
  paper: string;
  stem: string;
  figure?: "vt" | "gas" | "orbit";
  /** A diagram drawn from data (generated questions). */
  fig?: Fig;
  data?: string;
  parts: Part[];
}

export const LETTERS = ["A", "B", "C", "D"] as const;

export const MCQS: MCQ[] = [
  {
    id: "m1", unit: "A", topic: "A.1 Cinemática",
    q: "Se lanza una pelota verticalmente hacia arriba. Ignorando la resistencia del aire, ¿cuál es su aceleración en el punto más alto de la trayectoria?",
    options: ["Cero", "9,8 m s⁻², hacia arriba", "9,8 m s⁻², hacia abajo", "Depende de la rapidez inicial"],
    answer: 2,
    why: "En el punto más alto la velocidad es cero, pero la gravedad sigue actuando: la aceleración es g hacia abajo en todo el vuelo.",
  },
  {
    id: "m2", unit: "A", topic: "A.2 Fuerzas y momento lineal",
    q: "Una fuerza resultante de 12 N actúa sobre un cuerpo de 3,0 kg durante 2,0 s. ¿Cuál es el cambio en su momento lineal?",
    options: ["4,0 N s", "8,0 N s", "24 N s", "72 N s"],
    answer: 2,
    why: "El impulso es F·Δt = 12 × 2,0 = 24 N s, y es igual al cambio de momento lineal. La masa no hace falta.",
  },
  {
    id: "m3", unit: "B", topic: "B.3 Modelos de gases",
    q: "Un gas ideal se mantiene a volumen constante. Su temperatura pasa de 27 °C a 327 °C. ¿Cuál es la razón presión final / presión inicial?",
    options: ["1,1", "2,0", "12", "0,50"],
    answer: 1,
    why: "A volumen constante p ∝ T en kelvin: 600 K / 300 K = 2,0. Dividir 327 entre 27 (en °C) da el distractor de 12.",
  },
  {
    id: "m4", unit: "B", topic: "B.5 Corriente y circuitos",
    q: "Una resistencia de 6,0 Ω y otra de 3,0 Ω se conectan en paralelo. ¿Cuál es la resistencia equivalente?",
    options: ["0,50 Ω", "2,0 Ω", "4,5 Ω", "9,0 Ω"],
    answer: 1,
    why: "1/R = 1/6,0 + 1/3,0 = 1/2,0, así que R = 2,0 Ω. En paralelo la resistencia total siempre es menor que la menor de las dos.",
  },
  {
    id: "m5", unit: "C", topic: "C.2 Modelo ondulatorio",
    q: "Una onda tiene una frecuencia de 50 Hz y una longitud de onda de 0,40 m. ¿Cuál es su rapidez?",
    options: ["0,0080 m s⁻¹", "20 m s⁻¹", "125 m s⁻¹", "200 m s⁻¹"],
    answer: 1,
    why: "v = f λ = 50 × 0,40 = 20 m s⁻¹.",
  },
  {
    id: "m6", unit: "C", topic: "C.1 Movimiento armónico simple",
    q: "En un movimiento armónico simple, ¿dónde es máxima la magnitud de la aceleración del oscilador?",
    options: ["En la posición de equilibrio", "En el desplazamiento máximo", "A la mitad de la amplitud", "Es igual en todos los puntos"],
    answer: 1,
    why: "En el MAS a = −ω²x: la aceleración es proporcional al desplazamiento, así que es máxima en los extremos y cero en el equilibrio.",
  },
  {
    id: "m7", unit: "D", topic: "D.1 Campos gravitatorios",
    q: "La distancia entre dos masas puntuales se triplica. ¿Qué ocurre con la fuerza gravitatoria entre ellas?",
    options: ["Se divide entre 3", "Se divide entre 9", "Se multiplica por 3", "Se divide entre 6"],
    answer: 1,
    why: "F ∝ 1/r²: si r se triplica, F se divide entre 3² = 9.",
  },
  {
    id: "m8", unit: "D", topic: "D.3 Movimiento en campos electromagnéticos",
    q: "Un electrón entra perpendicularmente en un campo magnético uniforme. ¿Qué trayectoria sigue dentro del campo?",
    options: ["Recta, sin desviarse", "Parabólica", "Circular", "Recta, aumentando su rapidez"],
    answer: 2,
    why: "La fuerza magnética es siempre perpendicular a la velocidad: no cambia la rapidez, solo la dirección, y actúa como fuerza centrípeta.",
  },
  {
    id: "m9", unit: "E", topic: "E.3 Desintegración radiactiva",
    q: "Una muestra radiactiva tiene un periodo de semidesintegración de 8 días. ¿Qué fracción de los núcleos originales queda sin desintegrar después de 24 días?",
    options: ["1/3", "1/4", "1/8", "1/16"],
    answer: 2,
    why: "24 días son 3 periodos: (1/2)³ = 1/8.",
  },
  {
    id: "m10", unit: "E", topic: "E.1 Estructura del átomo",
    q: "Un átomo emite un fotón cuando uno de sus electrones…",
    options: ["pasa a un nivel de energía mayor", "pasa a un nivel de energía menor", "abandona el átomo", "permanece en el mismo nivel"],
    answer: 1,
    why: "Al bajar de nivel, el electrón pierde energía y la emite como un fotón con E = hf igual a la diferencia entre los niveles.",
  },
];

/** Helpers for rules. */
const n = (target: number, tol = 0.02) => (_: string, nums: number[]) => near(nums, target, tol);

export const SHEETS: Sheet[] = [
  {
    id: "s1", num: 1, code: "KW.F.NM.A1.01", unit: "A", topic: "A.1 Cinemática", paper: "Prueba 2",
    stem: "El gráfico muestra cómo varía la velocidad v de un carrito con el tiempo t.",
    figure: "vt",
    parts: [
      {
        label: "(a)", prompt: "Calcule la aceleración del carrito durante los primeros 5,0 s.", marks: 1, rows: 3,
        rules: [{ code: "A1", text: "a = Δv / Δt = 4,0 / 5,0 = 0,80 m s⁻²", miss: "a = Δv/Δt", test: n(0.8) }],
        sample: { rows: ["a = Δv / Δt = 4,0 / 5,0", "a = 0,80 m s⁻²"], notes: [{ row: 1, ok: true, text: "✓ A1" }] },
      },
      {
        label: "(b)", prompt: "Determine la distancia total recorrida por el carrito en los 15 s.", marks: 2, rows: 4,
        rules: [
          {
            code: "M1", text: "Usa el área bajo el gráfico v–t (triángulo + rectángulo)", miss: "área bajo v–t",
            test: (l, nums) => hasAny(l, "area") || near(nums, 10) || near(nums, 40) || /½|1\/2|0\.5/.test(normalize(l)),
          },
          { code: "A1", text: "distancia = 10 + 40 = 50 m", miss: "A1", test: n(50) },
        ],
        sample: {
          rows: ["d = área bajo el gráfico", "d = ½ (5,0)(4,0) + (10)(4,0)", "d = 10 + 40 = 50 m"],
          notes: [{ row: 0, ok: true, text: "✓ M1" }, { row: 2, ok: true, text: "✓ A1" }],
        },
      },
      {
        label: "(c)", prompt: "Indique la fuerza resultante sobre el carrito entre t = 5,0 s y t = 15 s.", marks: 1, rows: 2,
        rules: [{
          code: "A1", text: "Cero: la velocidad es constante, así que la aceleración es nula", miss: "F = 0",
          test: (l, nums) => hasAny(l, "cero", "nula", "nulo") || nums.some((x) => x === 0),
        }],
        sample: { rows: ["F = 0 (v constante → a = 0)"], notes: [{ row: 0, ok: true, text: "✓" }] },
      },
    ],
  },
  {
    id: "s2", num: 2, code: "KW.F.NM.B3.02", unit: "B", topic: "B.3 Modelos de gases", paper: "Prueba 2",
    stem: "Un recipiente rígido contiene 0,25 mol de un gas ideal a 20 °C. El volumen del recipiente es 4,0 × 10⁻³ m³.",
    figure: "gas",
    data: "R = 8,31 J K⁻¹ mol⁻¹",
    parts: [
      {
        label: "(a)", prompt: "Calcule la presión del gas.", marks: 2, rows: 4,
        rules: [
          { code: "M1", text: "Temperatura en kelvin: T = 20 + 273 = 293 K", miss: "T en K", test: n(293, 0.003) },
          { code: "A1", text: "p = nRT / V = 1,5 × 10⁵ Pa", miss: "A1", test: n(1.52e5, 0.03) },
        ],
        sample: {
          rows: ["pV = nRT", "p = 0,25 × 8,31 × 20 / 4,0×10⁻³", "p = 1,0 × 10⁴ Pa"],
          notes: [{ row: 1, ok: false, text: "✗ T en kelvin: 293 K" }, { row: 2, ok: false, text: "✗" }],
        },
      },
      {
        label: "(b)", prompt: "El gas se calienta hasta 80 °C. Calcule la nueva presión del gas.", marks: 2, rows: 4,
        rules: [
          { code: "M1", text: "p₂ = p₁ · T₂ / T₁ con T₂ = 353 K", miss: "T₂ = 353 K", test: n(353, 0.003) },
          { code: "A1", text: "p₂ = 1,8 × 10⁵ Pa", miss: "A1", test: n(1.83e5, 0.03) },
        ],
        sample: {
          rows: ["p₂ = p₁ × 353 / 293", "p₂ = 1,0×10⁴ × 353 / 293 = 1,2 × 10⁴ Pa"],
          notes: [{ row: 0, ok: true, text: "✓ M1" }, { row: 1, ok: true, text: "✓ A1 ECF" }],
        },
      },
    ],
  },
  {
    id: "s3", num: 3, code: "KW.F.NM.D1.03", unit: "D", topic: "D.1 Campos gravitatorios", paper: "Prueba 2",
    stem: "Un satélite de masa 450 kg describe una órbita circular a una altura de 700 km sobre la superficie de la Tierra.",
    figure: "orbit",
    data: "Masa de la Tierra = 5,97 × 10²⁴ kg · Radio de la Tierra = 6,37 × 10⁶ m · G = 6,67 × 10⁻¹¹ N m² kg⁻²",
    parts: [
      {
        label: "(a)", prompt: "Indique qué se entiende por intensidad de campo gravitatorio.", marks: 1, rows: 2,
        rules: [{
          code: "A1", text: "Fuerza por unidad de masa (sobre una masa de prueba puntual)", miss: "fuerza por unidad de masa",
          test: (l) => (hasAny(l, "fuerza") && hasAny(l, "masa")) || /F\s*\/\s*m\b/.test(l),
        }],
        sample: { rows: ["fuerza por unidad de masa", "sobre una masa de prueba puntual"], notes: [{ row: 0, ok: true, text: "✓" }] },
      },
      {
        label: "(b)", prompt: "Calcule la rapidez orbital del satélite.", marks: 3, rows: 5,
        rules: [
          { code: "M1", text: "r = R + h = 6,37 × 10⁶ + 7,0 × 10⁵ = 7,07 × 10⁶ m", miss: "r = R + h", test: n(7.07e6, 0.01) },
          {
            code: "M1", text: "v = √(GM / r), o GMm / r² = mv² / r", miss: "v = √(GM/r)",
            test: (l) => /GM|√|sqrt|mv\^?2|v\^2|v²/i.test(l),
          },
          { code: "A1", text: "v = 7,5 × 10³ m s⁻¹", miss: "A1", test: n(7.5e3, 0.02) },
        ],
        sample: {
          rows: ["v = √(GM / r)", "r = 700 km = 7,0 × 10⁵ m", "v = √(6,67×10⁻¹¹ × 5,97×10²⁴ / 7,0×10⁵)", "v = 2,4 × 10⁴ m s⁻¹"],
          notes: [{ row: 0, ok: true, text: "✓ M1" }, { row: 1, ok: false, text: "✗ r = R + h" }, { row: 3, ok: false, text: "✗ A1" }],
        },
      },
      {
        label: "(c)", prompt: "Determine la energía total del satélite en su órbita.", marks: 2, rows: 4,
        rules: [
          {
            code: "M1", text: "E = −GMm / 2r, o E = Ek + Ep", miss: "E = −GMm/2r",
            test: (l) => /2\s*r|E_?k|E_?p|cin[eé]tica|potencial/i.test(l),
          },
          {
            code: "A1", text: "E = −1,3 × 10¹⁰ J (el signo negativo es necesario)", miss: "A1 (signo −)",
            test: (_, nums) => nums.some((x) => x < 0 && near([x], -1.27e10, 0.05)),
          },
        ],
        sample: {
          rows: ["E = −GMm / 2r", "E = −6,67×10⁻¹¹ × 5,97×10²⁴ × 450 / (2 × 7,0×10⁵)", "E = −1,3 × 10¹¹ J"],
          notes: [{ row: 0, ok: true, text: "✓ M1" }, { row: 2, ok: true, text: "✓ A1 ECF" }],
        },
      },
    ],
  },
];

export const SHEET_MAX = (s: Sheet) => s.parts.reduce((a, p) => a + p.marks, 0);
