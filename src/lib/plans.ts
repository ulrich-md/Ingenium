/** Kwanta's plans, shared by the landing and /precios. Prices in USD.
 *  MVP without coaches: one free tier (the attraction offer) and one paid program, the
 *  Sprint al 7, paid monthly or once until the exam. Mentors come later (waitlist). */

/** Mercado Pago link to buy the Sprint. Without it, the buttons lead to the free diagnostic. */
export const PREVENTA_URL = process.env.NEXT_PUBLIC_PREVENTA_URL;
/** Optional last day of the founder price, as text ("31 de enero"). Without it, no date is shown. */
export const FOUNDER_UNTIL = process.env.NEXT_PUBLIC_FUNDADOR_HASTA;

export const PRICE = { monthly: "$19", exam: "$89", founder: "$59", guaranteeDays: 14 } as const;

/** The free weekly allowance of practice sheets. */
export const FREE_SHEETS_PER_WEEK = 3;

/** A cell is included (true), not included (false) or a short text ("3 por semana"). */
export type Cell = boolean | string;

/** What each plan includes: [feature, Gratis, Sprint al 7, coming soon?]. */
export const PLAN_ROWS: [string, Cell, Cell, boolean?][] = [
  ["Diagnóstico con nota proyectada del 1 al 7", true, true],
  ["Plan de 12 semanas que empieza por lo más débil", true, true],
  ["Hojas de práctica personalizadas (149 tipos)", `${FREE_SHEETS_PER_WEEK} por semana`, "Sin límite"],
  ["Pistas por pasos y ejemplo resuelto", true, true],
  ["Corrección automática en computadora", true, true],
  ["Simulacros de Prueba 2 con tiempo real", false, true],
  ["Notas de clase y ejercicios de lo que viste", false, true],
  ["Garantía de 14 días", false, true],
  ["Tutor de IA junto a cada ejercicio", false, true, true],
  ["Corrección con IA de tu letra en el iPad", false, true, true],
  ["Teoría A–E, Prueba 1 y videos por tema", false, true, true],
];

export const PLANS = [
  { key: "gratis", name: "Gratis", price: "$0", note: "sin cuenta, sin tarjeta" },
  { key: "sprint", name: "Sprint al 7", price: PRICE.monthly, note: `al mes · o ${PRICE.exam} hasta tu examen` },
] as const;
