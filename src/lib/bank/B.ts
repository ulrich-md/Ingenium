/**
 * Unit B · Naturaleza particulada de la materia. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type FormulaGroup, type Topic } from "./kit.ts";

export const topics: Topic[] = [
  {
    id: "B3", unit: "B", name: "B.3 Modelos de gases",
    concepts: [
      {
        id: "gasideal", label: "Ecuación del gas ideal", keywords: ["gas ideal", "pv = nrt", "pv=nrt", "moles", "kelvin"],
        make: (r) => {
          const n = pick(r, [0.10, 0.20, 0.25, 0.50, 1.2]), Tc = pick(r, [15, 20, 27, 35, 50]), V = pick(r, [2.0e-3, 4.0e-3, 5.0e-3, 1.0e-2]);
          const T = Tc + 273, p = (n * 8.31 * T) / V;
          return {
            stem: `Un recipiente rígido de ${fmt(V, 2)} m³ contiene ${f2(n)} mol de un gas ideal a ${Tc} °C.`,
            data: "R = 8,31 J K⁻¹ mol⁻¹",
            parts: [part("(a)", "Calcule la presión del gas.", [
              val("M1", `Temperatura en kelvin: T = ${T} K`, T, "T en K"),
              val("A1", `p = nRT / V = ${fmt(p)} Pa`, p),
            ], [`T = ${Tc} + 273 = ${T} K`, `p = nRT / V = ${f2(n)} × 8,31 × ${T} / ${fmt(V, 2)}`, `p = ${fmt(p)} Pa`])],
          };
        },
      },
      {
        id: "isocorico", label: "Calentar a volumen constante", keywords: ["volumen constante", "isocorico", "se calienta", "p/t"],
        make: (r) => {
          const p1 = pick(r, [1.0e5, 1.2e5, 1.5e5, 2.0e5]), T1c = pick(r, [10, 20, 27]), T2c = pick(r, [80, 100, 127, 150]);
          const T1 = T1c + 273, T2 = T2c + 273, p2 = (p1 * T2) / T1;
          return {
            stem: `Un gas ideal en un recipiente rígido está a ${fmt(p1, 2)} Pa y ${T1c} °C. Se calienta hasta ${T2c} °C.`,
            parts: [part("(a)", "Calcule la nueva presión del gas.", [
              val("M1", `p₁/T₁ = p₂/T₂ con kelvin: T₂ = ${T2} K`, T2, "T en K"),
              val("A1", `p₂ = ${fmt(p2)} Pa`, p2),
            ], [`T₁ = ${T1} K, T₂ = ${T2} K`, `p₂ = p₁ × T₂ / T₁ = ${fmt(p1, 2)} × ${T2} / ${T1}`, `p₂ = ${fmt(p2)} Pa`])],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
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
};
