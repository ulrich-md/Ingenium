/**
 * Formulas for each topic, as in the IB Physics data booklet (first assessment 2025),
 * written in LaTeX (rendered with KaTeX), with a short description in Spanish.
 * Shown next to the exercises, the way students have the booklet in the exam.
 * `for`: words of the exercise's concept that make a formula the one to use first.
 */
export interface Formula {
  /** LaTeX */
  tex: string;
  /** what it is, in a few words */
  n: string;
  for?: string[];
}
export interface Constant { tex: string; note?: string }
export interface FormulaGroup { title: string; items: Formula[]; consts?: Constant[] }

export const FORMULAS: Record<string, FormulaGroup> = {
  "A.1": {
    title: "A.1 Cinemática",
    items: [
      { tex: "v = u + at", n: "rapidez final", for: ["suvat", "caída", "proyectil", "tiro"] },
      { tex: "s = ut + \\tfrac{1}{2}at^2", n: "desplazamiento", for: ["suvat", "caída", "proyectil", "tiro"] },
      { tex: "v^2 = u^2 + 2as", n: "sin el tiempo", for: ["suvat", "caída"] },
      { tex: "s = \\dfrac{(u + v)\\,t}{2}", n: "con la rapidez media", for: ["suvat"] },
      { tex: "x = u_x\\, t", n: "tiro horizontal: la componente horizontal es constante", for: ["proyectil", "tiro"] },
      { tex: "a = \\dfrac{\\Delta v}{\\Delta t}", n: "pendiente del gráfico v–t" },
      { tex: "s = \\text{área bajo } v\\text{–}t", n: "desplazamiento a partir del gráfico" },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}", note: "usa el valor del enunciado" }],
  },
  "A.2": {
    title: "A.2 Fuerzas y momento lineal",
    items: [
      { tex: "F = ma", n: "segunda ley de Newton", for: ["segunda ley", "newton"] },
      { tex: "p = mv", n: "momento lineal", for: ["momento", "impulso", "choque"] },
      { tex: "F = \\dfrac{\\Delta p}{\\Delta t}", n: "fuerza y cambio de momento", for: ["impulso"] },
      { tex: "J = F\\Delta t = \\Delta p", n: "impulso", for: ["impulso"] },
      { tex: "m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2", n: "se conserva el momento en un choque", for: ["choque", "conservación"] },
      { tex: "F_f \\le \\mu_s F_N \\qquad F_f = \\mu_d F_N", n: "rozamiento estático y dinámico", for: ["segunda ley", "rozamiento"] },
      { tex: "W = mg", n: "peso" },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}" }],
  },
  "A.3": {
    title: "A.3 Trabajo, energía y potencia",
    items: [
      { tex: "E_k = \\tfrac{1}{2}mv^2", n: "energía cinética", for: ["energía", "conservación"] },
      { tex: "E_p = mg\\Delta h", n: "energía potencial gravitatoria", for: ["energía", "conservación"] },
      { tex: "W = Fs\\cos\\theta", n: "trabajo de una fuerza", for: ["potencia"] },
      { tex: "P = \\dfrac{\\Delta W}{\\Delta t} = Fv", n: "potencia", for: ["potencia"] },
      { tex: "\\text{rendimiento} = \\dfrac{\\text{útil}}{\\text{total}}", n: "con trabajo, energía o potencia", for: ["rendimiento", "potencia"] },
      { tex: "E_H = \\tfrac{1}{2}k\\,\\Delta x^2", n: "energía elástica" },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}" }],
  },
  "B.3": {
    title: "B.3 Modelos de gases",
    items: [
      { tex: "pV = nRT", n: "gas ideal", for: ["gas ideal", "ecuación", "volumen constante", "calentar"] },
      { tex: "\\dfrac{p}{T} = \\text{constante}", n: "a volumen y cantidad constantes (de pV = nRT)", for: ["volumen constante", "calentar"] },
      { tex: "T\\,(\\text{K}) = \\theta\\,(^{\\circ}\\text{C}) + 273", n: "pasa siempre a kelvin", for: ["gas ideal", "volumen constante", "calentar", "ecuación"] },
      { tex: "n = \\dfrac{N}{N_A}", n: "moles y partículas" },
      { tex: "pV = N k_B T", n: "con número de partículas" },
      { tex: "p = \\dfrac{F}{A}", n: "presión" },
    ],
    consts: [
      { tex: "R = 8{,}31\\ \\text{J K}^{-1}\\,\\text{mol}^{-1}" },
      { tex: "N_A = 6{,}02 \\times 10^{23}\\ \\text{mol}^{-1}" },
      { tex: "k_B = 1{,}38 \\times 10^{-23}\\ \\text{J K}^{-1}" },
    ],
  },
  "D.1": {
    title: "D.1 Campos gravitatorios",
    items: [
      { tex: "F = G\\,\\dfrac{m_1 m_2}{r^2}", n: "ley de gravitación de Newton", for: ["gravitación", "ley de newton"] },
      { tex: "g = \\dfrac{GM}{r^2}", n: "intensidad del campo", for: ["gravitación", "órbita", "orbital"] },
      { tex: "v_{\\text{orb}} = \\sqrt{\\dfrac{GM}{r}}", n: "rapidez orbital (r desde el centro)", for: ["órbita", "orbital"] },
      { tex: "v_{\\text{esc}} = \\sqrt{\\dfrac{2GM}{r}}", n: "rapidez de escape", for: ["escape"] },
      { tex: "\\dfrac{T^2}{r^3} = \\dfrac{4\\pi^2}{GM}", n: "tercera ley de Kepler", for: ["kepler"] },
      { tex: "E_p = -\\dfrac{GMm}{r}", n: "energía potencial gravitatoria", for: ["escape"] },
      { tex: "V_g = -\\dfrac{GM}{r}", n: "potencial gravitatorio" },
    ],
    consts: [
      { tex: "G = 6{,}67 \\times 10^{-11}\\ \\text{N m}^2\\,\\text{kg}^{-2}" },
      { tex: "r = R + h", note: "desde el centro del planeta" },
    ],
  },
};

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
