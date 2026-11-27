/** Kwanta's plans, shared by the landing and /precios. Prices in USD. */
export const PREVENTA_URL = process.env.NEXT_PUBLIC_PREVENTA_URL;

/** What each plan includes: [feature, Diagnóstico, Pase Física, Sprint al 7]. */
export const PLAN_ROWS: [string, boolean, boolean, boolean][] = [
  ["Diagnóstico con nota proyectada", true, true, true],
  ["Plan de 12 semanas", true, true, true],
  ["Teoría de las unidades A–E", false, true, true],
  ["Banco de hojas de examen", false, true, true],
  ["Simulacros de Prueba 1 y 2", false, true, true],
  ["Videos por tema y tutor", false, true, true],
  ["Clase semanal en vivo con un coach", false, false, true],
  ["4 simulacros corregidos sobre tu hoja", false, false, true],
  ["Garantía de subir un nivel", false, false, true],
];

export const PLANS = [
  { key: "diag", name: "Diagnóstico", price: "$0", note: "gratis, sin cuenta" },
  { key: "pase", name: "Pase Física", price: "$89", note: "hasta tu examen · fundadores $59" },
  { key: "sprint", name: "Sprint al 7", price: "$349", note: "12 semanas · cupo de 25" },
] as const;
