/**
 * Unit D · Campos. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type FormulaGroup, type Topic } from "./kit.ts";

export const topics: Topic[] = [
  {
    id: "D1", unit: "D", name: "D.1 Campos gravitatorios",
    concepts: [
      {
        id: "gravitacion", label: "Ley de gravitación de Newton", keywords: ["gravitacion", "ley de newton", "gm1m2", "fuerza gravitatoria", "atraccion"],
        make: (r) => {
          const m1 = pick(r, [2.0e12, 4.5e12, 6.0e12]), m2 = pick(r, [1.5e11, 3.0e11, 8.0e11]), d = pick(r, [2.0e3, 5.0e3, 8.0e3]);
          const F = (G * m1 * m2) / (d * d);
          return {
            stem: `Dos asteroides de masas ${fmt(m1, 2)} kg y ${fmt(m2, 2)} kg están separados ${fmt(d, 2)} m entre sus centros.`,
            data: "G = 6,67 × 10⁻¹¹ N m² kg⁻²",
            parts: [
              part("(a)", "Calcule la fuerza gravitatoria entre los asteroides.", [
                method("Usa F = G m₁ m₂ / r²", /G\s*[·×*]?\s*m|r\^?2|r²/i, F, "F = Gm₁m₂/r²"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["F = G m₁ m₂ / r²", `F = 6,67×10⁻¹¹ × ${fmt(m1, 2)} × ${fmt(m2, 2)} / (${fmt(d, 2)})²`, `F = ${fmt(F)} N`]),
              part("(b)", "La distancia entre los centros se reduce a la mitad. Indique el nuevo valor de la fuerza.", [val("A1", `F' = 4F = ${fmt(4 * F)} N`, 4 * F)],
                ["F ∝ 1/r²: si r se divide entre 2, F se multiplica por 4", `F' = ${fmt(4 * F)} N`]),
            ],
          };
        },
      },
      {
        id: "orbita", label: "Órbitas y rapidez orbital", keywords: ["orbita", "satelite", "rapidez orbital", "centripeta"],
        make: (r) => {
          const P = pick(r, PLANETS), hk = pick(r, [300, 500, 800, 1200]);
          const rad = P.R + hk * 1e3, v = Math.sqrt((G * P.M) / rad);
          return {
            stem: `Un satélite describe una órbita circular a ${hk} km sobre la superficie de ${P.n}.`,
            data: `Masa de ${P.n} = ${fmt(P.M)} kg · Radio de ${P.n} = ${fmt(P.R)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", "Calcule el radio de la órbita.", [{ code: "A1", text: `r = R + h = ${fmt(rad)} m`, miss: "r = R + h", test: (_, n) => near(n, rad, 0.01) }],
                [`r = R + h = ${fmt(P.R)} + ${fmt(hk * 1e3, 2)}`, `r = ${fmt(rad)} m`]),
              part("(b)", "Calcule la rapidez orbital del satélite.", [
                method("v = √(GM / r), o GMm/r² = mv²/r", /GM|√|sqrt|mv\^?2|v\^2|v²/i, v, "v = √(GM/r)"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["GMm / r² = m v² / r  →  v = √(GM / r)", `v = √(6,67×10⁻¹¹ × ${fmt(P.M)} / ${fmt(rad)})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "escape", label: "Rapidez de escape", keywords: ["escape", "velocidad de escape", "rapidez de escape"],
        make: (r) => {
          const P = pick(r, PLANETS);
          const v = Math.sqrt((2 * G * P.M) / P.R);
          return {
            stem: `Se quiere lanzar una sonda desde la superficie de ${P.n} para que escape de su campo gravitatorio.`,
            data: `Masa de ${P.n} = ${fmt(P.M)} kg · Radio de ${P.n} = ${fmt(P.R)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", `Calcule la rapidez de escape desde la superficie de ${P.n}.`, [
                method("v = √(2GM / R)", /2\s*G\s*M|2GM/i, v, "v = √(2GM/R)"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["½ m v² − GMm / R = 0  →  v = √(2GM / R)", `v = √(2 × 6,67×10⁻¹¹ × ${fmt(P.M)} / ${fmt(P.R)})`, `v = ${fmt(v)} m s⁻¹`]),
              part("(b)", "Explique por qué la rapidez de escape no depende de la masa de la sonda.", [{
                code: "R1", text: "La masa de la sonda aparece en la energía cinética y en la potencial, y se cancela", miss: "la masa se cancela",
                test: (l) => hasAny(l, "cancela", "simplifica", "ambos lados", "ambas energias"),
              }], ["m aparece en ½mv² y en GMm/R: se cancela al igualar"], 2),
            ],
          };
        },
      },
      {
        id: "kepler", label: "Tercera ley de Kepler", keywords: ["kepler", "periodo", "t^2", "t²"],
        make: (r) => {
          const rad = pick(r, [7.0e6, 1.2e7, 2.66e7, 4.22e7]);
          const T = 2 * Math.PI * Math.sqrt(rad ** 3 / (G * 5.97e24));
          return {
            stem: `Un satélite describe una órbita circular de radio ${fmt(rad)} m alrededor de la Tierra.`,
            data: "Masa de la Tierra = 5,97 × 10²⁴ kg · G = 6,67 × 10⁻¹¹ N m² kg⁻²",
            parts: [part("(a)", "Calcule el periodo de la órbita.", [
              method("T² = 4π² r³ / GM", /T\^?2|T²|r\^?3|r³|2\s*π|4\s*π|2\s*pi/i, T, "T² = 4π²r³/GM"),
              { code: "A1", text: `T = ${fmt(T)} s (${fmt(T / 3600)} h)`, miss: "A1", test: (_, n) => near(n, T, TOL) || near(n, T / 3600, TOL) || near(n, T / 60, TOL) },
            ], ["T² = 4π² r³ / (GM)", `T = 2π √((${fmt(rad)})³ / (6,67×10⁻¹¹ × 5,97×10²⁴))`, `T = ${fmt(T)} s = ${fmt(T / 3600)} h`])],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
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
