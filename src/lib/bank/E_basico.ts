/**
 * Unit E · more questions (basico). See kit.ts. Concepts are added to the subtopics of
 * bank/E.ts by topic id (e.g. "E1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "../check.ts";
import { C_LIGHT, E_CHARGE, fmt, H_PLANCK, normalize, part, pick, reason, val, valAny, type Concept } from "./kit.ts";

/** A1 for a whole number (nucleons, protons, electrons): the line must contain it. */
const whole = (code: Rule["code"], text: string, target: number): Rule =>
  ({ code, text, miss: text, test: (l) => (l.match(/\d+/g) ?? []).map(Number).includes(target) });
/** A mark when the line matches a pattern, raw or normalized (an equation, a method). */
const rx = (code: Rule["code"], text: string, re: RegExp, miss: string): Rule =>
  ({ code, text, miss, test: (l) => re.test(l) || re.test(normalize(l)) });
/** A mass in u with three decimals and a decimal comma. */
const d3 = (x: number) => x.toFixed(3).replace(".", ",");

export const extra: Record<string, Concept[]> = {
  /* =================================================================== E.1 */
  E1: [
    {
      id: "b_nucleo", label: "Protones y neutrones de un núcleo (A y Z)", level: 1,
      keywords: ["numero masico", "numero atomico", "neutrones"],
      make: (r) => {
        const el = pick(r, [{ n: "carbono", Z: 6 }, { n: "oxígeno", Z: 8 }, { n: "sodio", Z: 11 }, { n: "aluminio", Z: 13 }, { n: "cloro", Z: 17 }, { n: "calcio", Z: 20 }]);
        const N = pick(r, [6, 7, 8, 10, 12]), A = el.Z + N;
        const pa = part("(a)", "Indique el número de protones del núcleo.", [whole("A1", `Z = ${el.Z}`, el.Z)],
          [`Z = número atómico de ${el.n} = ${el.Z}`, `Z = ${el.Z} protones`], 2);
        pa.hints = ["Qué usar: el número atómico Z es el número de protones del núcleo.", "Para empezar: busque el elemento en la tabla periódica."];
        const pb = part("(b)", "Calcule el número de neutrones del núcleo.", [
          rx("M1", "N = A − Z", /A\s*[−\-]\s*Z/i, "N = A − Z"),
          whole("A1", `N = ${N}`, N),
        ], [`N = A − Z = ${A} − ${el.Z}`, `N = ${N} neutrones`], 3);
        pb.hints = ["Qué usar: N = A − Z, con el número másico y el número atómico.", "Para empezar: reste de A el número de protones que ya ha hallado."];
        return { stem: `Un núcleo de ${el.n} tiene número másico A = ${A}.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_ion", label: "Electrones y carga de un ion", level: 1,
      keywords: ["ion", "electrones perdidos", "carga del ion"],
      make: (r) => {
        const el = pick(r, [{ n: "sodio", Z: 11, q: 1 }, { n: "magnesio", Z: 12, q: 2 }, { n: "aluminio", Z: 13, q: 3 }, { n: "calcio", Z: 20, q: 2 }]);
        const e = el.Z - el.q;
        const pa = part("(a)", "Calcule el número de electrones del ion.", [
          rx("M1", "Z − electrones perdidos", /\d+\s*[−\-]\s*\d+/, "Z − electrones perdidos"),
          whole("A1", `${e} electrones`, e),
        ], [`Electrones = Z − electrones perdidos = ${el.Z} − ${el.q}`, `Electrones = ${e}`], 3);
        pa.hints = ["Qué usar: un átomo neutro tiene tantos electrones como protones (Z).", "Para empezar: reste de Z el número de electrones que pierde."];
        const pb = part("(b)", "Indique el signo de la carga del ion.", [
          reason("El ion es positivo porque ha perdido electrones", "positivo: ha perdido electrones", "positiv", "pierde electrones", "perdido electrones", "mas protones"),
        ], ["El ion es positivo: tiene más protones que electrones"], 2);
        pb.hints = ["Qué usar: compare el número de protones con el de electrones del ion.", "Para empezar: piense en si el ion tiene más protones o más electrones."];
        return {
          stem: `Un átomo de ${el.n} (Z = ${el.Z}) pierde ${el.q} ${el.q > 1 ? "electrones" : "electrón"} y forma un ion.`,
          parts: [pa, pb],
        };
      },
    },
  ],

  /* =================================================================== E.2 */
  E2: [
    {
      id: "b_foton", label: "Energía de un fotón: E = hf", level: 1,
      keywords: ["foton", "constante de planck", "energia del foton"],
      make: (r) => {
        const f = pick(r, [4.0e14, 5.0e14, 6.0e14, 7.5e14, 1.0e15]);
        const E = H_PLANCK * f;
        const pa = part("(a)", "Indique la ecuación que relaciona la energía E de un fotón con su frecuencia f.", [
          rx("A1", "E = hf", /E\s*=\s*h\s*f/i, "E = hf"),
        ], ["E = hf"], 2);
        pa.hints = ["Qué usar: la ecuación de Planck, que aparece en la hoja de datos.", "Para empezar: la energía es proporcional a la frecuencia."];
        const pb = part("(b)", "Calcule la energía de este fotón, en joules.", [
          rx("M1", "sustituye h", /6[.,]63/, "sustituye h = 6,63 × 10⁻³⁴"),
          val("A1", `E = ${fmt(E)} J`, E),
        ], [`E = h f = 6,63 × 10⁻³⁴ × ${fmt(f)}`, `E = ${fmt(E)} J`], 3);
        pb.hints = ["Qué usar: E = hf, con h = 6,63 × 10⁻³⁴ J s (hoja de datos).", "Para empezar: escriba la ecuación y sustituya h y f."];
        return {
          stem: `Un fotón tiene una frecuencia de ${fmt(f)} Hz.`,
          data: "h = 6,63 × 10⁻³⁴ J s",
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_ev", label: "Electronvoltio: de eV a joules", level: 1,
      keywords: ["electronvoltio", "conversion de unidades", "ev a j"],
      make: (r) => {
        const Ev = pick(r, [2.0, 3.5, 4.5, 6.0]);
        const J = Ev * E_CHARGE;
        const pa = part("(a)", "Convierta esta energía a joules.", [
          rx("M1", "factor 1,6 × 10⁻¹⁹", /1[.,]6/, "factor 1,6 × 10⁻¹⁹"),
          val("A1", `E = ${fmt(J)} J`, J),
        ], [`E = ${fmt(Ev)} eV × 1,6 × 10⁻¹⁹ J eV⁻¹`, `E = ${fmt(J)} J`], 3);
        pa.hints = ["Qué usar: multiplique la energía en eV por el factor de conversión de la hoja de datos.", "Para empezar: 1 eV = 1,6 × 10⁻¹⁹ J."];
        const pb = part("(b)", "Explique por qué en física atómica se usa el electronvoltio en lugar del joule.", [
          reason("El joule es una unidad muy grande para energías atómicas", "joule demasiado grande", "grande", "pequen", "atomic"),
        ], ["El joule es una unidad muy grande: el electronvoltio es más práctico para energías atómicas"], 2);
        pb.hints = ["Qué usar: compare el tamaño del joule con la energía de un electrón en un átomo."];
        return {
          stem: `La energía de un fotón es de ${fmt(Ev)} eV.`,
          data: "1 eV = 1,6 × 10⁻¹⁹ J",
          parts: [pa, pb],
        };
      },
    },
  ],

  /* =================================================================== E.3 */
  E3: [
    {
      id: "b_semivida", label: "Fracción que queda tras n semividas", level: 1,
      keywords: ["semivida", "fraccion que queda", "vida media"],
      make: (r) => {
        const M = pick(r, [{ n: "yodo-131", T: 8, u: "días" }, { n: "fósforo-32", T: 14, u: "días" }, { n: "tecnecio-99m", T: 6, u: "horas" }, { n: "sodio-24", T: 15, u: "horas" }]);
        const n = pick(r, [2, 3, 4]), f = 1 / 2 ** n, t = n * M.T;
        const pa = part("(a)", `Indique la fracción de núcleos que queda sin desintegrar tras ${n} semividas.`, [
          rx("M1", "(1/2)ⁿ", /1\s*\/\s*2|½/, "(1/2) elevado a n"),
          valAny("A1", `fracción = ${fmt(f)}`, [f, f * 100]),
        ], [`N / N₀ = (1/2)ⁿ = (1/2)^${n}`, `fracción = ${fmt(f)}`], 3);
        pa.hints = ["Qué usar: cada semivida divide el número de núcleos entre 2.", "Para empezar: escriba (1/2) elevado al número de semividas."];
        const pb = part("(b)", `Calcule el tiempo transcurrido, en ${M.u}, para llegar a esa fracción.`, [
          val("A1", `t = ${t} ${M.u}`, t),
        ], [`t = n × T½ = ${n} × ${M.T}`, `t = ${t} ${M.u}`], 3);
        pb.hints = ["Qué usar: el tiempo es el número de semividas por la duración de una semivida.", "Para empezar: multiplique n por la semivida dada."];
        return {
          stem: `Una muestra contiene ${M.n}, con una semivida de ${M.T} ${M.u}.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_alfa", label: "Desintegración alfa: núcleo hijo", level: 1,
      keywords: ["alfa", "nucleo hijo", "desintegracion alfa"],
      make: (r) => {
        const el = pick(r, [{ n: "radio", A: 226, Z: 88 }, { n: "polonio", A: 210, Z: 84 }, { n: "uranio", A: 238, Z: 92 }, { n: "torio", A: 230, Z: 90 }]);
        const pa = part("(a)", "Indique el número másico y el número atómico del núcleo hijo.", [
          whole("A1", `A = ${el.A - 4}`, el.A - 4),
          whole("A1", `Z = ${el.Z - 2}`, el.Z - 2),
        ], [`A = ${el.A} − 4 = ${el.A - 4}`, `Z = ${el.Z} − 2 = ${el.Z - 2}`], 3);
        pa.hints = ["Qué usar: en una emisión alfa el núcleo pierde 4 nucleones: 2 protones y 2 neutrones.", "Para empezar: reste 4 al número másico y 2 al número atómico."];
        const pb = part("(b)", "Explique por qué el número atómico del núcleo hijo baja en 2.", [
          reason("La alfa lleva dos protones: Z baja en 2", "dos protones", "dos protones", "2 protones", "protones"),
        ], ["La partícula alfa tiene 2 protones y 2 neutrones, así que Z baja en 2"], 2);
        pb.hints = ["Qué usar: piense en lo que lleva consigo la partícula alfa."];
        return {
          stem: `Un núcleo de ${el.n}-${el.A} se desintegra emitiendo una partícula alfa (⁴₂He).`,
          parts: [pa, pb],
        };
      },
    },
  ],

  /* =================================================================== E.4 */
  E4: [
    {
      id: "b_einstein", label: "Energía liberada por una masa: E = mc²", level: 1,
      keywords: ["e = mc2", "masa convertida en energia", "einstein"],
      make: (r) => {
        const m = pick(r, [2.0e-29, 3.0e-29, 5.0e-29]);
        const E = m * C_LIGHT ** 2;
        const pa = part("(a)", "Indique la ecuación de Einstein que relaciona la energía E con la masa m.", [
          rx("A1", "E = mc²", /E\s*=\s*m\s*c\s*(\^?\s*2|²)/i, "E = mc²"),
        ], ["E = mc²"], 2);
        pa.hints = ["Qué usar: la ecuación de Einstein, que aparece en la hoja de datos.", "Para empezar: la energía es la masa multiplicada por c al cuadrado."];
        const pb = part("(b)", "Calcule la energía liberada.", [
          val("M1", `c² = ${fmt(C_LIGHT ** 2)} m² s⁻²`, C_LIGHT ** 2, "c²"),
          val("A1", `E = ${fmt(E)} J`, E),
        ], [`c² = (3,0 × 10⁸)² = ${fmt(C_LIGHT ** 2)} m² s⁻²`, `E = mc² = ${fmt(m)} × ${fmt(C_LIGHT ** 2)}`, `E = ${fmt(E)} J`], 3);
        pb.hints = ["Qué usar: E = mc², con c = 3,0 × 10⁸ m s⁻¹ (hoja de datos).", "Para empezar: calcule primero c² y después multiplique por la masa."];
        return {
          stem: `En una fisión, una masa de ${fmt(m)} kg se convierte en energía.`,
          data: "c = 3,0 × 10⁸ m s⁻¹",
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_cadena", label: "Fisión y reacción en cadena", level: 1,
      keywords: ["reaccion en cadena", "neutrones liberados", "fision"],
      make: (r) => {
        const g = pick(r, [10, 20, 50]), k = pick(r, [2, 3]), total = g * k;
        const pa = part("(a)", `Calcule el número de neutrones liberados en ${g} fisiones.`, [
          rx("M1", "fisiones × neutrones", /\d+\s*[×x*·]\s*\d+/, "fisiones × neutrones por fisión"),
          whole("A1", `${total} neutrones`, total),
        ], [`N = ${g} × ${k} = ${total}`, `N = ${total} neutrones`], 3);
        pa.hints = ["Qué usar: multiplique el número de fisiones por los neutrones que libera cada una.", "Para empezar: escriba N = fisiones × neutrones por fisión."];
        const pb = part("(b)", "Explique por qué los neutrones liberados pueden producir una reacción en cadena.", [
          reason("Cada neutrón puede provocar nuevas fisiones", "nuevas fisiones", "nuevas fisiones", "mas fisiones", "otro nucleo"),
        ], ["Cada neutrón liberado puede provocar la fisión de otro núcleo, y el proceso se repite"], 2);
        pb.hints = ["Qué usar: piense en qué ocurre con los neutrones que se liberan en una fisión."];
        return {
          stem: `En cada fisión de un núcleo de uranio-235 se liberan ${k} neutrones.`,
          parts: [pa, pb],
        };
      },
    },
  ],

  /* =================================================================== E.5 */
  E5: [
    {
      id: "b_fusion", label: "Fusión de hidrógeno en helio: masa perdida", level: 1,
      keywords: ["fusion", "masa perdida", "u a mev"],
      make: (r) => {
        const M = pick(r, [{ mH: 1.008, mHe: 4.003 }, { mH: 1.007, mHe: 4.001 }]);
        const dm = Math.round((4 * M.mH - M.mHe) * 1000) / 1000, E = dm * 931.5;
        const pa = part("(a)", "Calcule la masa perdida en la reacción, en u.", [
          val("M1", `masa inicial = 4 × ${d3(M.mH)} = ${d3(4 * M.mH)} u`, 4 * M.mH, "masa inicial"),
          val("A1", `Δm = ${d3(dm)} u`, dm),
        ], [`masa inicial = 4 × ${d3(M.mH)} = ${d3(4 * M.mH)} u`, `Δm = ${d3(4 * M.mH)} − ${d3(M.mHe)} = ${d3(dm)} u`], 3);
        pa.hints = ["Qué usar: sume la masa inicial de los cuatro núcleos y reste la masa final del helio.", "Para empezar: multiplique la masa de un núcleo de hidrógeno por cuatro."];
        const pb = part("(b)", "Calcule la energía liberada, en MeV.", [
          val("A1", `E = ${fmt(E)} MeV`, E),
        ], [`E = Δm × 931,5 = ${d3(dm)} × 931,5`, `E = ${fmt(E)} MeV`], 3);
        pb.hints = ["Qué usar: 1 u equivale a 931,5 MeV; multiplique la masa perdida por ese factor."];
        return {
          stem: `Cuatro núcleos de hidrógeno (de masa ${d3(M.mH)} u cada uno) se fusionan para formar un núcleo de helio de masa ${d3(M.mHe)} u.`,
          data: "1 u = 931,5 MeV c⁻²",
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_brillo", label: "Brillo aparente de una estrella: b = L / 4πd²", level: 1,
      keywords: ["brillo aparente", "inverso del cuadrado", "4 pi d"],
      make: (r) => {
        const L = pick(r, [4.0e26, 8.0e26, 1.2e27]), d = pick(r, [2.0e16, 4.0e16, 1.0e17]);
        const d2 = 4 * Math.PI * d * d, b = L / d2;
        const pa = part("(a)", "Indique la ecuación del brillo aparente b en función de L y de la distancia d.", [
          rx("A1", "b = L / 4πd²", /L\s*\/\s*\(?\s*4\s*(π|pi)?\s*d/i, "b = L / (4πd²)"),
        ], ["b = L / (4πd²)"], 2);
        pa.hints = ["Qué usar: el brillo es la potencia que llega por unidad de área, y la superficie de una esfera de radio d es 4πd²."];
        const pb = part("(b)", "Calcule el brillo aparente de la estrella.", [
          val("M1", `4πd² = ${fmt(d2)} m²`, d2, "4πd²"),
          val("A1", `b = ${fmt(b)} W m⁻²`, b),
        ], [`4πd² = 4π × (${fmt(d)})² = ${fmt(d2)} m²`, `b = L / 4πd² = ${fmt(L)} / ${fmt(d2)}`, `b = ${fmt(b)} W m⁻²`], 3);
        pb.hints = ["Qué usar: b = L / 4πd², con la distancia ya en metros.", "Para empezar: calcule primero 4πd² y después divida L entre ese valor."];
        return {
          stem: `Una estrella tiene una luminosidad de ${fmt(L)} W y se encuentra a ${fmt(d)} m de la Tierra.`,
          data: "π = 3,14",
          parts: [pa, pb],
        };
      },
    },
  ],
};
