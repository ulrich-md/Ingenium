/**
 * Unit E · Física nuclear y cuántica. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "../check.ts";
import { C_LIGHT, E_CHARGE, f2, fmt, H_PLANCK, hasAny, K_COUL, ME, MEV, method, near, normalize, NA, part, pick, reason, SIGMA, TOL, U_AMU, val, valAny, WIEN, type FigItem, type FormulaGroup, type Topic } from "./kit.ts";

/* ---------- helpers for nuclear notation and marking ---------- */
const SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹", SUBD = "₀₁₂₃₄₅₆₇₈₉";
const spn = (n: number) => Array.from(String(n), (c) => SUPD[+c]).join("");
const sbn = (n: number) => Array.from(String(n), (c) => SUBD[+c]).join("");
/** A nuclide with Unicode: ²³⁸₉₂U */
const nu = (A: number, Z: number, s: string) => `${spn(A)}${sbn(Z)}${s}`;
/** Every whole number of a line, reading ²³⁸₉₂U (superscript and subscript digits) as 238 and 92. */
function ints(l: string): number[] {
  const t = l.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]+/g, (m) => " " + Array.from(m, (c) => (SUPD.indexOf(c) >= 0 ? SUPD.indexOf(c) : SUBD.indexOf(c))).join("") + " ");
  return (t.match(/\d+/g) ?? []).map(Number);
}
/** A mark for an exact whole number (A, Z, N, counts): the line must contain it. */
const cnt = (code: Rule["code"], text: string, target: number, miss: string = text): Rule =>
  ({ code, text, miss, test: (l) => ints(l).includes(target) });
/** A mark for a value within a chosen tolerance, accepting several equivalent targets (units). */
const valT = (code: Rule["code"], text: string, targets: number[], tol: number, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => targets.some((t) => near(n, t, tol)) });

const EV = E_CHARGE;
const LN2 = Math.LN2;
const LSUN = 3.85e26, RSUN = 6.96e8, LY = 9.46e15, PC = 3.09e16, YR = 3.16e7;

export const topics: Topic[] = [
  /* =================================================================== E.1 */
  {
    id: "E1", unit: "E", name: "E.1 Estructura del átomo",
    concepts: [
      {
        id: "niveles", label: "Niveles de energía del hidrógeno", keywords: ["niveles de energia", "hidrogeno", "transicion", "fotón emitido"],
        make: (r) => {
          const nf = pick(r, [1, 2]), ni = pick(r, [3, 4, 5]);
          const En = (n: number) => -13.6 / (n * n);
          const Ei = En(ni), Ef = En(nf), Eph = Ei - Ef, EJ = Eph * EV, f = EJ / H_PLANCK;
          const Y: Record<number, number> = { 1: 200, 2: 150, 3: 112, 4: 86, 5: 64 };
          const items: FigItem[] = [];
          for (const n of [1, 2, 3, 4, 5]) {
            items.push({ t: "line", x1: 70, y1: Y[n], x2: 190, y2: Y[n], w: 2 });
            items.push({ t: "text", x: 62, y: Y[n] + 4, s: `n = ${n}`, anchor: "end" });
          }
          items.push({ t: "line", x1: 70, y1: 36, x2: 190, y2: 36, dash: true });
          items.push({ t: "text", x: 62, y: 40, s: "n = ∞", anchor: "end" });
          items.push({ t: "line", x1: 130, y1: Y[ni], x2: 130, y2: Y[nf], arrow: "end", w: 1.8 });
          items.push({ t: "text", x: 200, y: (Y[ni] + Y[nf]) / 2 + 4, s: "fotón emitido", anchor: "start" });
          items.push({ t: "text", x: 200, y: 218, s: "(no está a escala)", anchor: "start", size: 11 });
          return {
            stem: `Los niveles de energía del átomo de hidrógeno vienen dados por E = −13,6 / n² eV. En la figura, un electrón realiza la transición indicada con la flecha y se emite un fotón.`,
            data: "h = 6,63 × 10⁻³⁴ J s · e = 1,6 × 10⁻¹⁹ C",
            fig: { w: 340, h: 226, alt: `Niveles de energía del hidrógeno de n = 1 a n = 5 y n = ∞; una flecha de n = ${ni} a n = ${nf}`, items },
            parts: [
              part("(a)", `Calcule la energía del electrón en el nivel n = ${ni}.`, [val("A1", `E = ${fmt(Ei)} eV`, Ei)],
                [`E = −13,6 / n² = −13,6 / ${ni}²`, `E = ${fmt(Ei)} eV`]),
              part("(b)", "Determine la energía del fotón emitido, en eV.", [
                val("M1", `Energía del nivel final: ${fmt(Ef)} eV`, Ef, "energía del nivel final"),
                valAny("A1", `E = Ei − Ef = ${fmt(Eph)} eV`, [Eph, EJ]),
              ], [`Nivel n = ${nf}: E = ${fmt(Ef)} eV`, `E(fotón) = Ei − Ef = ${fmt(Ei)} − (${fmt(Ef)})`, `E(fotón) = ${fmt(Eph)} eV`]),
              part("(c)", "Calcule la frecuencia del fotón.", [
                val("M1", `E = ${fmt(EJ)} J`, EJ, "E en julios"),
                val("A1", `f = E / h = ${fmt(f)} Hz`, f),
              ], [`E = ${fmt(Eph)} × 1,6×10⁻¹⁹ = ${fmt(EJ)} J`, `f = E / h = ${fmt(EJ)} / 6,63×10⁻³⁴`, `f = ${fmt(f)} Hz`]),
            ],
          };
        },
      },
      {
        id: "linea", label: "Longitud de onda de una línea espectral", keywords: ["linea espectral", "longitud de onda", "balmer", "lyman", "espectro"],
        make: (r) => {
          const nf = pick(r, [1, 2, 3]);
          const ni = nf === 1 ? pick(r, [2, 3, 4]) : nf === 2 ? pick(r, [3, 4, 5]) : pick(r, [4, 5]);
          const Eph = 13.6 * (1 / (nf * nf) - 1 / (ni * ni)), EJ = Eph * EV, lam = (H_PLANCK * C_LIGHT) / EJ, nm = lam * 1e9;
          const region = nm < 400 ? "ultravioleta" : nm > 700 ? "infrarroja" : "visible";
          const words = region === "ultravioleta" ? ["ultravioleta", "uv"] : region === "infrarroja" ? ["infrarroj"] : ["visible"];
          return {
            stem: `En el espectro de emisión del hidrógeno aparece la línea producida cuando el electrón pasa del nivel n = ${ni} al nivel n = ${nf}. Los niveles de energía son E = −13,6 / n² eV.`,
            data: "h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹ · e = 1,6 × 10⁻¹⁹ C",
            parts: [
              part("(a)", "Calcule la energía del fotón emitido, en julios.", [
                valAny("M1", `E = Ei − Ef = ${fmt(Eph)} eV`, [Eph], "diferencia de niveles"),
                val("A1", `E = ${fmt(EJ)} J`, EJ),
              ], [`E = Ei − Ef = −13,6/${ni}² − (−13,6/${nf}²) = ${fmt(Eph)} eV`, `E = ${fmt(Eph)} × 1,6×10⁻¹⁹ = ${fmt(EJ)} J`]),
              part("(b)", "Determine la longitud de onda de esta línea.", [
                method("λ = hc / E", /h\s*c\s*\/|hc|c\s*\/\s*f|λ\s*=\s*c/i, EJ, "λ = hc/E"),
                valAny("A1", `λ = ${fmt(lam)} m = ${fmt(nm)} nm`, [lam, nm]),
              ], ["E = hf = hc / λ  →  λ = hc / E", `λ = 6,63×10⁻³⁴ × 3,00×10⁸ / ${fmt(EJ)}`, `λ = ${fmt(lam)} m (${fmt(nm)} nm)`]),
              part("(c)", "Deduzca si la línea está en la región visible, ultravioleta o infrarroja del espectro.", [
                reason(`Está en la región ${region} (visible: 400–700 nm)`, `región ${region}`, ...words),
              ], [`λ = ${fmt(nm)} nm; el visible va de 400 nm a 700 nm`, `La línea es ${region}`], 2),
            ],
          };
        },
      },
      {
        id: "rutherford", label: "Experimento de Rutherford", keywords: ["rutherford", "dispersion", "particulas alfa", "lamina de oro", "maxima aproximacion"],
        make: (r) => {
          const M = pick(r, [{ n: "oro", Z: 79 }, { n: "plata", Z: 47 }, { n: "cobre", Z: 29 }, { n: "aluminio", Z: 13 }]);
          const Ek = pick(r, [4.0, 5.0, 6.0, 7.7]);
          const EkJ = Ek * MEV, d = (K_COUL * 2 * M.Z * EV * EV) / EkJ;
          const items: FigItem[] = [
            { t: "circle", cx: 230, cy: 100, r: 7, fill: "dark" },
            { t: "line", x1: 20, y1: 40, x2: 340, y2: 40, arrow: "end" },
            { t: "path", d: "M20 78 Q 215 74 340 24", arrow: "end" },
            { t: "path", d: "M20 124 Q 215 128 340 176", arrow: "end" },
            { t: "line", x1: 20, y1: 97, x2: 206, y2: 97, arrow: "end" },
            { t: "line", x1: 206, y1: 103, x2: 20, y2: 103, arrow: "end" },
            { t: "text", x: 252, y: 104, s: "núcleo", anchor: "start" },
            { t: "text", x: 20, y: 20, s: "partículas α", anchor: "start" },
          ];
          return {
            stem: `En un experimento como el de Rutherford, partículas α de ${f2(Ek)} MeV se dirigen hacia una lámina delgada de ${M.n} (Z = ${M.Z}). La figura muestra las trayectorias de algunas partículas cerca de un núcleo.`,
            data: "k = 8,99 × 10⁹ N m² C⁻² · e = 1,6 × 10⁻¹⁹ C · 1 MeV = 1,6 × 10⁻¹³ J",
            fig: { w: 360, h: 200, alt: "Trayectorias de partículas alfa cerca de un núcleo: unas pasan sin desviarse, otras se desvían y una rebota hacia atrás", items },
            parts: [
              part("(a)", "Explique por qué la mayoría de las partículas α atraviesan la lámina casi sin desviarse.", [
                reason("El átomo es casi todo espacio vacío; el núcleo es muy pequeño", "átomo casi vacío", "vacio", "vacia", "espacio", "pequeno", "mayor parte", "lejos del nucleo"),
              ], ["El átomo es casi todo espacio vacío y el núcleo es muy pequeño: casi todas las partículas pasan lejos de él"], 2),
              part("(b)", "Explique por qué unas pocas partículas α se dispersan con ángulos mayores de 90°.", [
                reason("Carga positiva y masa concentradas en un núcleo pequeño que repele a la partícula α", "núcleo cargado, repulsión", "nucleo", "repulsion", "repele", "repelen", "carga positiva", "concentrad", "denso"),
              ], ["Toda la carga positiva y casi toda la masa están concentradas en un núcleo muy pequeño", "Una partícula α que pasa muy cerca es repelida con fuerza y rebota"], 2),
              part("(c)", "Estime la distancia de máxima aproximación de una partícula α que incide de frente sobre un núcleo.", [
                method("Toda la Ek pasa a energía potencial eléctrica: Ek = k(2e)(Ze)/d", /k\s*[(·×*]?\s*2\s*e|k\s*q|q\s*[₁1]\s*q\s*[₂2]|e_?k\s*=|e_?p\s*=|energ/i, EkJ, "Ek = kq₁q₂/d"),
                valAny("A1", `d = ${fmt(d)} m`, [d, d * 1e15]),
              ], ["En el punto de máxima aproximación toda la Ek es energía potencial: Ek = k (2e)(Ze) / d", `Ek = ${f2(Ek)} MeV = ${fmt(EkJ)} J`, `d = k × 2 × ${M.Z} × (1,6×10⁻¹⁹)² / ${fmt(EkJ)}`, `d = ${fmt(d)} m`]),
            ],
          };
        },
      },
      {
        id: "radio_nuclear", label: "Radio y densidad nuclear", keywords: ["radio nuclear", "densidad nuclear", "r0", "a^(1/3)"],
        make: (r) => {
          const N = pick(r, [{ s: "Al", A: 27, Z: 13 }, { s: "Fe", A: 56, Z: 26 }, { s: "Kr", A: 84, Z: 36 }, { s: "Ag", A: 108, Z: 47 }, { s: "Au", A: 197, Z: 79 }, { s: "U", A: 238, Z: 92 }]);
          const R = 1.2e-15 * Math.cbrt(N.A), V = (4 / 3) * Math.PI * R ** 3, m = N.A * U_AMU, rho = m / V;
          return {
            stem: `Considere el núcleo ${nu(N.A, N.Z, N.s)}. El radio de un núcleo está dado por R = R₀ A¹ᐟ³.`,
            data: "R₀ = 1,20 × 10⁻¹⁵ m · 1 u = 1,661 × 10⁻²⁷ kg",
            parts: [
              part("(a)", "Calcule el radio del núcleo.", [
                method("R = R₀ A¹ᐟ³", /A\^?\(?1\/3|1\/3|∛|ra[ií]z\s*c[uú]bica/i, R, "R = R₀A¹ᐟ³"),
                valAny("A1", `R = ${fmt(R)} m`, [R, R * 1e15]),
              ], [`R = R₀ A¹ᐟ³ = 1,20×10⁻¹⁵ × ${N.A}^(1/3)`, `R = ${fmt(R)} m`]),
              part("(b)", "Determine la densidad del núcleo.", [
                val("M1", `m = A u = ${fmt(m)} kg`, m, "masa = A u"),
                val("A1", `ρ = m / V = ${fmt(rho)} kg m⁻³`, rho),
              ], [`m = ${N.A} × 1,661×10⁻²⁷ = ${fmt(m)} kg`, `V = (4/3) π R³ = ${fmt(V)} m³`, `ρ = m / V = ${fmt(rho)} kg m⁻³`]),
              part("(c)", "Explique por qué la densidad es casi la misma para todos los núcleos.", [
                reason("V ∝ R³ ∝ A y la masa ∝ A, así que m/V no depende de A", "m/V no depende de A", "independiente", "no depende", "misma", "igual", "constante", "similar", "proporcional"),
              ], ["R³ ∝ A, así que el volumen es proporcional a A; la masa también es proporcional a A", "ρ = m / V es independiente de A"], 2),
            ],
          };
        },
      },
      {
        id: "grafradio", label: "Gráfica del radio nuclear", keywords: ["grafica del radio", "pendiente", "radio frente a a", "r0"],
        make: (r) => {
          const R0 = pick(r, [1.1, 1.2, 1.3]), k = pick(r, [3, 4, 5]);
          const X = R0 * k, A = k ** 3;
          const items: FigItem[] = [{
            t: "graph", x: 46, y: 20, w: 270, h: 170, xr: [0, 6.5], yr: [0, 9], xlabel: "A¹ᐟ³", ylabel: "R / fm",
            xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], grid: true,
            series: [{ pts: [[0, 0], [6.5, 6.5 * R0]] }, { pts: [1, 2, 3, 4, 5, 6].map((x) => [x, x * R0] as [number, number]), dots: true }],
          }];
          return {
            stem: "Se mide el radio R de varios núcleos. La gráfica muestra R, en femtómetros (1 fm = 10⁻¹⁵ m), frente a A¹ᐟ³, donde A es el número de nucleones.",
            fig: { w: 360, h: 236, alt: "Gráfica de R en fm frente a A elevado a 1/3: puntos alineados en una recta que pasa por el origen", items },
            parts: [
              part("(a)", "Determine, a partir de la gráfica, el valor de R₀ en la relación R = R₀ A¹ᐟ³.", [
                method("Calcula la pendiente de la recta", /pendiente|gradiente|Δ\s*R|R\s*\/\s*A/i, R0 * 5, "gradiente = ΔR/ΔA¹ᐟ³"),
                valT("A1", `R₀ = ${fmt(R0)} fm`, [R0, R0 * 1e-15], 0.06),
              ], [`Dos puntos de la recta: (0; 0) y (5; ${fmt(R0 * 5)})`, `pendiente = ΔR / ΔA¹ᐟ³ = ${fmt(R0 * 5)} / 5`, `R₀ = ${fmt(R0)} fm`]),
              part("(b)", `Un núcleo tiene un radio de ${fmt(X)} fm. Determine su número de nucleones.`, [
                valT("M1", `A¹ᐟ³ = R / R₀ = ${k}`, [k], 0.04, "A¹ᐟ³ = R/R₀"),
                valT("A1", `A = ${A}`, [A], 0.06),
              ], [`A¹ᐟ³ = R / R₀ = ${fmt(X)} / ${fmt(R0)} = ${k}`, `A = ${k}³ = ${A}`]),
            ],
          };
        },
      },
      {
        id: "composicion", label: "Composición del núcleo e isótopos", keywords: ["protones", "neutrones", "isotopos", "numero atomico", "numero masico"],
        make: (r) => {
          const N = pick(r, [{ s: "Co", A: 60, Z: 27 }, { s: "Sr", A: 90, Z: 38 }, { s: "I", A: 131, Z: 53 }, { s: "Cs", A: 137, Z: 55 }, { s: "Ra", A: 226, Z: 88 }, { s: "U", A: 235, Z: 92 }, { s: "Pu", A: 239, Z: 94 }]);
          const n = N.A - N.Z, d = pick(r, [1, 2, 3, 4]), A2 = N.A + d;
          return {
            stem: `Un núclido se representa como ${nu(N.A, N.Z, N.s)}.`,
            parts: [
              part("(a)", "Indique el número de protones y el número de neutrones del núcleo.", [
                cnt("A1", `${N.Z} protones`, N.Z),
                cnt("A1", `${n} neutrones`, n),
              ], [`Protones: ${N.Z} (el número atómico)`, `Neutrones: N = A − Z = ${N.A} − ${N.Z} = ${n}`]),
              part("(b)", `Otro isótopo del mismo elemento tiene ${d} ${d === 1 ? "neutrón más" : "neutrones más"}. Determine su número de nucleones.`, [
                cnt("A1", `A = ${A2}`, A2),
              ], ["Un isótopo tiene el mismo Z y distinto N", `A = ${N.A} + ${d} = ${A2}`]),
              part("(c)", "Explique por qué los isótopos de un elemento tienen las mismas propiedades químicas.", [
                reason("Mismo número de protones y de electrones", "mismos electrones", "electrones", "mismo numero de protones", "misma carga", "mismo z", "protones"),
              ], ["Tienen el mismo número de protones y por tanto de electrones; la química depende de los electrones"], 2),
            ],
          };
        },
      },
    ],
  },
  /* =================================================================== E.2 */
  {
    id: "E2", unit: "E", name: "E.2 Física cuántica", hl: true,
    concepts: [
      {
        id: "fotoelectrico", label: "Efecto fotoeléctrico", keywords: ["fotoelectrico", "funcion de trabajo", "fotoelectrones", "frecuencia umbral"],
        make: (r) => {
          const M = pick(r, [{ n: "sodio", P: 2.3 }, { n: "cesio", P: 2.1 }, { n: "cinc", P: 4.3 }, { n: "cobre", P: 4.7 }, { n: "aluminio", P: 4.1 }]);
          const Eof = (l: number) => (H_PLANCK * C_LIGHT) / (l * 1e-9) / EV;
          const lam = pick(r, [150, 180, 200, 220, 250, 300, 350, 400].filter((l) => Eof(l) - M.P >= 0.6));
          const Eph = Eof(lam), EJ = Eph * EV, Ek = Eph - M.P, PJ = M.P * EV, f0 = PJ / H_PLANCK;
          return {
            stem: `Luz de longitud de onda ${lam} nm incide sobre una superficie de ${M.n}, cuya función de trabajo es ${fmt(M.P, 2)} eV.`,
            data: "h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹ · e = 1,6 × 10⁻¹⁹ C",
            parts: [
              part("(a)", "Calcule la energía de un fotón de esta luz, en eV.", [
                method("E = hc / λ", /h\s*c|h\s*f|E\s*=\s*h/i, EJ, "E = hc/λ"),
                valAny("A1", `E = ${fmt(Eph)} eV`, [Eph, EJ]),
              ], [`E = hc / λ = 6,63×10⁻³⁴ × 3,00×10⁸ / (${lam}×10⁻⁹)`, `E = ${fmt(EJ)} J = ${fmt(Eph)} eV`]),
              part("(b)", "Determine la energía cinética máxima de los fotoelectrones, en eV.", [
                valAny("A1", `Ek máx = hf − Φ = ${fmt(Ek)} eV`, [Ek, Ek * EV]),
              ], [`Ek máx = hf − Φ = ${fmt(Eph)} − ${fmt(M.P, 2)}`, `Ek máx = ${fmt(Ek)} eV`]),
              part("(c)", "Calcule la frecuencia umbral del metal.", [
                val("M1", `Φ = ${fmt(PJ)} J`, PJ, "Φ en julios"),
                val("A1", `f₀ = Φ / h = ${fmt(f0)} Hz`, f0),
              ], [`Φ = ${fmt(M.P, 2)} × 1,6×10⁻¹⁹ = ${fmt(PJ)} J`, `f₀ = Φ / h = ${fmt(PJ)} / 6,63×10⁻³⁴`, `f₀ = ${fmt(f0)} Hz`]),
            ],
          };
        },
      },
      {
        id: "ekf", label: "Gráfica de energía cinética frente a frecuencia", keywords: ["grafica ek f", "constante de planck", "umbral", "pendiente"],
        make: (r) => {
          const f0 = pick(r, [5, 6, 7, 8]);
          const s = (H_PLANCK / EV) * 1e14; // eV per 10^14 Hz
          const Ek12 = s * (12 - f0);
          const dots = [f0 + 2, f0 + 4, f0 + 6].filter((x) => x <= 12);
          const items: FigItem[] = [{
            t: "graph", x: 46, y: 20, w: 270, h: 170, xr: [0, 12], yr: [0, 3], xlabel: "f / 10¹⁴ Hz", ylabel: "Ek máx / eV",
            xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], yticks: [0, 0.5, 1, 1.5, 2, 2.5, 3], grid: true,
            series: [{ pts: [[f0, 0], [12, Ek12]] }, { pts: dots.map((x) => [x, s * (x - f0)] as [number, number]), dots: true }],
          }];
          return {
            stem: "Se ilumina una superficie metálica con luz de distintas frecuencias y se mide la energía cinética máxima de los fotoelectrones. La gráfica muestra los resultados.",
            fig: { w: 360, h: 236, alt: "Gráfica de la energía cinética máxima en eV frente a la frecuencia en 10¹⁴ Hz: una recta que corta el eje de frecuencias en la frecuencia umbral", items },
            parts: [
              part("(a)", "Determine la frecuencia umbral del metal.", [valT("A1", `f₀ = ${fmt(f0, 2)} × 10¹⁴ Hz`, [f0, f0 * 1e14], 0.06)],
                [`Ek = 0 donde la recta corta el eje horizontal`, `f₀ = ${fmt(f0, 2)} × 10¹⁴ Hz`]),
              part("(b)", "Determine la constante de Planck a partir de la gráfica.", [
                valT("M1", "La pendiente de la recta es h", [s, 4.14e-15, 6.63e-34], 0.06, "pendiente = h"),
                valT("A1", `h = ${fmt(H_PLANCK)} J s`, [6.63e-34, 4.14e-15], 0.06),
              ], ["Ek máx = hf − Φ: la pendiente es h", `pendiente = ΔEk / Δf = ${fmt(Ek12)} / ((12 − ${f0}) × 10¹⁴)`, `pendiente = ${fmt(s)} eV por 10¹⁴ Hz = 4,14 × 10⁻¹⁵ eV s`, `h = ${fmt(H_PLANCK)} J s`]),
              part("(c)", "Otro metal tiene una función de trabajo mayor. Indique cómo cambia la gráfica.", [
                reason("La recta es paralela (misma pendiente) y la frecuencia umbral es mayor", "paralela, umbral mayor", "paralela", "misma pendiente", "misma gradiente", "igual pendiente", "desplaza", "derecha", "umbral mayor", "mayor frecuencia umbral"),
              ], ["La pendiente sigue siendo h: la recta es paralela", "Φ = hf₀ es mayor, así que la recta se desplaza a la derecha (f₀ mayor)"], 2),
            ],
          };
        },
      },
      {
        id: "frenado", label: "Potencial de frenado", keywords: ["potencial de frenado", "fotocelula", "tension de frenado", "fotocorriente"],
        make: (r) => {
          const f = pick(r, [7.5, 8.0, 9.0, 10.0, 12.0]), Vs = pick(r, [0.8, 1.2, 1.5, 1.8, 2.1]);
          const EkJ = Vs * EV, hf = H_PLANCK * f * 1e14, PJ = hf - EkJ, Peff = PJ / EV;
          const items: FigItem[] = [
            { t: "circle", cx: 190, cy: 70, r: 50 },
            { t: "line", x1: 165, y1: 40, x2: 165, y2: 100, w: 3 },
            { t: "line", x1: 215, y1: 40, x2: 215, y2: 100, w: 3 },
            { t: "line", x1: 24, y1: 36, x2: 162, y2: 56, arrow: "end" },
            { t: "line", x1: 24, y1: 76, x2: 162, y2: 76, arrow: "end" },
            { t: "text", x: 20, y: 22, s: "luz de frecuencia f", anchor: "start" },
            { t: "line", x1: 165, y1: 100, x2: 165, y2: 165 },
            { t: "line", x1: 215, y1: 100, x2: 215, y2: 125 },
            { t: "comp", kind: "ammeter", x1: 215, y1: 120, x2: 215, y2: 160 },
            { t: "line", x1: 215, y1: 160, x2: 215, y2: 165 },
            { t: "comp", kind: "battery", x1: 165, y1: 165, x2: 215, y2: 165 },
            { t: "text", x: 190, y: 186, s: "tensión variable", size: 11 },
          ];
          return {
            stem: `Se ilumina el cátodo (a la izquierda) de una fotocélula, como indica la figura, con luz de frecuencia ${fmt(f, 2)} × 10¹⁴ Hz. Se aumenta la tensión de frenado entre el cátodo y el ánodo y la corriente se anula cuando alcanza ${fmt(Vs, 2)} V.`,
            data: "h = 6,63 × 10⁻³⁴ J s · e = 1,6 × 10⁻¹⁹ C",
            fig: { w: 340, h: 196, alt: "Fotocélula: luz incide sobre el cátodo, un amperímetro y una fuente de tensión variable cierran el circuito", items },
            parts: [
              part("(a)", "Calcule la energía cinética máxima de los fotoelectrones, en julios.", [val("A1", `Ek máx = eVs = ${fmt(EkJ)} J`, EkJ)],
                [`Ek máx = e Vs = 1,6×10⁻¹⁹ × ${fmt(Vs, 2)}`, `Ek máx = ${fmt(EkJ)} J`]),
              part("(b)", "Determine la función de trabajo del cátodo.", [
                valAny("M1", `hf = ${fmt(hf)} J`, [hf, hf / EV], "energía del fotón hf"),
                valAny("A1", `Φ = hf − Ek máx = ${fmt(Peff)} eV`, [Peff, PJ]),
              ], [`hf = 6,63×10⁻³⁴ × ${fmt(f, 2)}×10¹⁴ = ${fmt(hf)} J`, `Φ = hf − Ek máx = ${fmt(hf)} − ${fmt(EkJ)} = ${fmt(PJ)} J`, `Φ = ${fmt(Peff)} eV`]),
              part("(c)", "Explique por qué la corriente se anula cuando la tensión alcanza este valor.", [
                reason("Ningún fotoelectrón alcanza el ánodo: la energía eV es igual a la Ek máxima", "ningún electrón llega al ánodo", "ningun", "detiene", "frena", "no llega", "no alcanza", "no pueden", "repele", "no logran"),
              ], ["Con eV = Ek máx, ni los fotoelectrones más rápidos logran llegar al ánodo: ningún fotoelectrón alcanza el ánodo y la corriente es cero"], 2),
            ],
          };
        },
      },
      {
        id: "debroglie", label: "Longitud de onda de de Broglie", keywords: ["de broglie", "dualidad onda particula", "electron acelerado", "difraccion de electrones"],
        make: (r) => {
          const V = pick(r, [50, 100, 150, 200, 400, 800, 1000]);
          const Ek = V * EV, p = Math.sqrt(2 * ME * Ek), lam = H_PLANCK / p;
          return {
            stem: `Un electrón, inicialmente en reposo, se acelera mediante una diferencia de potencial de ${V} V. Se ignoran los efectos relativistas.`,
            data: "m_e = 9,11 × 10⁻³¹ kg · e = 1,6 × 10⁻¹⁹ C · h = 6,63 × 10⁻³⁴ J s",
            parts: [
              part("(a)", "Calcule el momento lineal del electrón.", [
                val("M1", `Ek = eV = ${fmt(Ek)} J`, Ek, "Ek = eV"),
                val("A1", `p = √(2mEk) = ${fmt(p)} kg m s⁻¹`, p),
              ], [`Ek = eV = 1,6×10⁻¹⁹ × ${V} = ${fmt(Ek)} J`, `Ek = p² / 2m  →  p = √(2 m Ek)`, `p = √(2 × 9,11×10⁻³¹ × ${fmt(Ek)}) = ${fmt(p)} kg m s⁻¹`]),
              part("(b)", "Determine la longitud de onda de de Broglie del electrón.", [
                valAny("A1", `λ = h / p = ${fmt(lam)} m`, [lam, lam * 1e9, lam * 1e10]),
              ], [`λ = h / p = 6,63×10⁻³⁴ / ${fmt(p)}`, `λ = ${fmt(lam)} m`]),
              part("(c)", "Sugiera por qué un haz de estos electrones puede mostrar difracción al atravesar un cristal.", [
                reason("λ comparable al espaciado entre átomos (~10⁻¹⁰ m)", "λ ≈ espaciado atómico", "similar", "comparable", "espaciado", "separacion", "distancia entre atomos", "tamano", "orden de magnitud"),
              ], ["La difracción es apreciable cuando λ es comparable al espaciado entre los átomos del cristal (~10⁻¹⁰ m)"], 2),
            ],
          };
        },
      },
      {
        id: "compton", label: "Dispersión Compton", keywords: ["compton", "rayos x", "fotón dispersado", "desplazamiento de longitud de onda"],
        make: (r) => {
          const th = pick(r, [45, 60, 90, 120, 135]), lam = pick(r, [2.0e-11, 3.0e-11, 5.0e-11, 7.0e-11]);
          const c = H_PLANCK / (ME * C_LIGHT), dl = c * (1 - Math.cos((th * Math.PI) / 180)), lam2 = lam + dl;
          const a = (th * Math.PI) / 180, ox = 180, oy = 130, L = 100;
          const ex = ox + L * Math.cos(a), ey = oy - L * Math.sin(a);
          const items: FigItem[] = [
            { t: "line", x1: 30, y1: oy, x2: ox, y2: oy, arrow: "end", w: 2 },
            { t: "text", x: 100, y: oy + 20, s: "fotón incidente" },
            { t: "line", x1: ox, y1: oy, x2: ex, y2: ey, arrow: "end", w: 2 },
            { t: "text", x: ex + (th > 90 ? 4 : 6), y: ey - 6, s: "fotón dispersado", anchor: "start" },
            { t: "angle", x: ox, y: oy, r: 30, a1: 0, a2: th, label: "θ" },
            { t: "line", x1: ox, y1: oy, x2: ox + 60, y2: oy + 52, arrow: "end", w: 2 },
            { t: "text", x: ox + 66, y: oy + 62, s: "electrón", anchor: "start" },
            { t: "dot", x: ox, y: oy, r: 4 },
          ];
          return {
            stem: `Un fotón de rayos X de longitud de onda ${fmt(lam, 2)} m choca con un electrón libre en reposo y se dispersa un ángulo θ = ${th}° respecto a su dirección original (figura).`,
            data: "h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹ · m_e = 9,11 × 10⁻³¹ kg",
            fig: { w: 380, h: 200, alt: `Un fotón incidente choca con un electrón; el fotón dispersado sale con un ángulo θ = ${th}° y el electrón retrocede`, items },
            parts: [
              part("(a)", "Calcule el desplazamiento Δλ de la longitud de onda del fotón.", [
                method("Δλ = (h / mc)(1 − cos θ)", /1\s*[−-]\s*cos|cos\s*θ|h\s*\/\s*\(?\s*m\s*c|h\s*\/\s*mc/i, dl, "Δλ = (h/mc)(1 − cosθ)"),
                val("A1", `Δλ = ${fmt(dl)} m`, dl),
              ], ["Δλ = (h / mc)(1 − cos θ)", `Δλ = 6,63×10⁻³⁴ / (9,11×10⁻³¹ × 3,00×10⁸) × (1 − cos ${th}°)`, `Δλ = ${fmt(dl)} m`]),
              part("(b)", "Determine la longitud de onda del fotón dispersado.", [valT("A1", `λ' = λ + Δλ = ${fmt(lam2)} m`, [lam2], 0.006)],
                [`λ' = λ + Δλ = ${fmt(lam, 3)} + ${fmt(dl)}`, `λ' = ${fmt(lam2)} m`]),
              part("(c)", "Explique por qué el fotón dispersado tiene una longitud de onda mayor.", [
                reason("El fotón transfiere energía al electrón, así que su energía disminuye y λ aumenta", "pierde energía", "energia", "pierde", "cede", "transfiere", "electron", "retroceso"),
              ], ["El fotón transfiere parte de su energía al electrón (que retrocede)", "E = hc / λ: menos energía implica mayor λ"], 2),
            ],
          };
        },
      },
      {
        id: "intensidad", label: "Intensidad de la luz y fotoelectrones", keywords: ["intensidad", "fotones por segundo", "teoria ondulatoria", "ek maxima"],
        make: (r) => {
          const lam = pick(r, [250, 300, 350, 400]), P = pick(r, [1.0, 2.0, 5.0]);
          const EJ = (H_PLANCK * C_LIGHT) / (lam * 1e-9), N = (P * 1e-3) / EJ;
          return {
            stem: `Un haz de luz de longitud de onda ${lam} nm y potencia ${f2(P)} mW incide sobre una superficie metálica y libera fotoelectrones (la longitud de onda es menor que la umbral).`,
            data: "h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹",
            parts: [
              part("(a)", "Calcule el número de fotones que llegan a la superficie cada segundo.", [
                method("N = P / E con E = hc / λ", /h\s*c|P\s*\/\s*E|E\s*=\s*h/i, EJ, "E = hc/λ"),
                val("A1", `N = ${fmt(N)} s⁻¹`, N),
              ], [`E = hc / λ = ${fmt(EJ)} J`, `N = P / E = ${fmt(P * 1e-3)} / ${fmt(EJ)}`, `N = ${fmt(N)} s⁻¹`]),
              part("(b)", "Se duplica la potencia del haz, sin cambiar λ. Indique cómo cambia el número de fotoelectrones emitidos por segundo.", [
                reason("Se duplica (es proporcional a la intensidad)", "se duplica", "duplica", "doble", "aumenta", "proporcional", "dos veces", "x2"),
              ], ["Llega el doble de fotones por segundo: el número de fotoelectrones por segundo se duplica"], 2),
              part("(c)", "Explique por qué duplicar la intensidad no cambia la energía cinética máxima de los fotoelectrones.", [
                reason("Cada electrón absorbe un solo fotón; su energía hf depende de la frecuencia, no de la intensidad", "un fotón, energía hf", "un foton", "cada foton", "un solo foton", "depende de la frecuencia", "depende solo de la frecuencia", "hf", "energia del foton", "frecuencia"),
              ], ["Cada fotoelectrón absorbe un solo fotón, de energía hf", "Ek máx = hf − Φ depende de la frecuencia, no del número de fotones"], 2),
            ],
          };
        },
      },
    ],
  },
  /* =================================================================== E.3 */
  {
    id: "E3", unit: "E", name: "E.3 Desintegración radiactiva",
    concepts: [
      {
        id: "ecuaciones", label: "Ecuaciones de desintegración α, β⁻ y β⁺", keywords: ["ecuacion nuclear", "desintegracion alfa", "desintegracion beta", "nucleo hijo"],
        make: (r) => {
          type D = { A: number; Z: number; s: string; s2: string };
          const al: D[] = [{ A: 238, Z: 92, s: "U", s2: "Th" }, { A: 226, Z: 88, s: "Ra", s2: "Rn" }, { A: 210, Z: 84, s: "Po", s2: "Pb" }, { A: 241, Z: 95, s: "Am", s2: "Np" }, { A: 222, Z: 86, s: "Rn", s2: "Po" }, { A: 230, Z: 90, s: "Th", s2: "Ra" }];
          const bm: D[] = [{ A: 14, Z: 6, s: "C", s2: "N" }, { A: 90, Z: 38, s: "Sr", s2: "Y" }, { A: 60, Z: 27, s: "Co", s2: "Ni" }, { A: 131, Z: 53, s: "I", s2: "Xe" }, { A: 137, Z: 55, s: "Cs", s2: "Ba" }, { A: 234, Z: 90, s: "Th", s2: "Pa" }];
          const bp: D[] = [{ A: 18, Z: 9, s: "F", s2: "O" }, { A: 22, Z: 11, s: "Na", s2: "Ne" }, { A: 26, Z: 13, s: "Al", s2: "Mg" }, { A: 30, Z: 15, s: "P", s2: "Si" }];
          const kind = pick(r, ["a", "bm", "bp"] as const);
          const p = kind === "a" ? pick(r, al) : kind === "bm" ? pick(r, bm) : pick(r, bp);
          const A2 = kind === "a" ? p.A - 4 : p.A, Z2 = kind === "a" ? p.Z - 2 : kind === "bm" ? p.Z + 1 : p.Z - 1, N2 = A2 - Z2;
          const what = kind === "a" ? "una partícula α" : kind === "bm" ? "un electrón (desintegración β⁻)" : "un positrón (desintegración β⁺)";
          const eq = kind === "a" ? `${nu(p.A, p.Z, p.s)} → ${nu(A2, Z2, p.s2)} + ${nu(4, 2, "He")}`
            : kind === "bm" ? `${nu(p.A, p.Z, p.s)} → ${nu(A2, Z2, p.s2)} + ${nu(0, -1, "e")}`.replace("₋", "₋") + " + ν̄"
              : `${nu(p.A, p.Z, p.s)} → ${nu(A2, Z2, p.s2)} + e⁺ + ν`;
          const third = kind === "a"
            ? part("(c)", "Indique de qué está formada una partícula α.", [reason("Es un núcleo de helio-4 (2 protones y 2 neutrones)", "núcleo de helio", "helio", "2 protones", "dos protones", "4 nucleones", "2 neutrones")],
              ["Una partícula α es un núcleo de helio-4: 2 protones y 2 neutrones"], 2)
            : part("(c)", `En esta desintegración se emite, junto con ${kind === "bm" ? "el electrón" : "el positrón"}, otra partícula sin carga. Identifíquela.`,
              [reason(kind === "bm" ? "Un antineutrino electrónico" : "Un neutrino electrónico", kind === "bm" ? "antineutrino" : "neutrino", kind === "bm" ? "antineutrino" : "neutrino")],
              [kind === "bm" ? "Se emite un antineutrino electrónico (ν̄)" : "Se emite un neutrino electrónico (ν)"], 2);
          return {
            stem: `El núclido ${nu(p.A, p.Z, p.s)} se desintegra y emite ${what}. El núcleo hijo es un isótopo de ${p.s2}.`,
            parts: [
              part("(a)", "Determine el número másico y el número atómico del núcleo hijo.", [
                cnt("A1", `A = ${A2}`, A2, "número másico del hijo"),
                cnt("A1", `Z = ${Z2}`, Z2, "número atómico del hijo"),
              ], [`Ecuación: ${eq}`, `A y Z se conservan: A = ${A2}, Z = ${Z2}`]),
              part("(b)", "Indique el número de neutrones del núcleo hijo.", [cnt("A1", `N = ${N2}`, N2)],
                [`N = A − Z = ${A2} − ${Z2} = ${N2}`], 2),
              third,
            ],
          };
        },
      },
      {
        id: "semivida", label: "Semivida y fracción que queda", keywords: ["semivida", "vida media", "actividad restante", "aleatorio"],
        make: (r) => {
          const M = pick(r, [{ n: "yodo-131", T: 8, u: "días" }, { n: "fósforo-32", T: 14, u: "días" }, { n: "tecnecio-99m", T: 6, u: "horas" }, { n: "sodio-24", T: 15, u: "horas" }, { n: "cobalto-60", T: 5, u: "años" }]);
          const n = pick(r, [2, 3, 4, 5]), t = n * M.T, A0 = pick(r, [160, 400]), A = A0 / 2 ** n;
          return {
            stem: `Una muestra de ${M.n} tiene una actividad inicial de ${A0} MBq. La semivida de este radioisótopo es ${M.T} ${M.u}.`,
            parts: [
              part("(a)", `Calcule cuántas semividas transcurren en ${t} ${M.u}.`, [cnt("A1", `n = ${n}`, n)],
                [`n = t / T½ = ${t} / ${M.T}`, `n = ${n}`], 2),
              part("(b)", `Determine la actividad de la muestra tras ${t} ${M.u}.`, [
                method("A = A₀ (½)ⁿ", /1\s*\/\s*2|0[.,]5|½|2\^|e\^?\s*\(?\s*[−-]|\bλ/i, 1 / 2 ** n, "A = A₀(½)ⁿ"),
                val("A1", `A = ${fmt(A)} MBq`, A),
              ], [`A = A₀ (½)ⁿ = ${A0} × (1/2)^${n}`, `A = ${fmt(A)} MBq`]),
              part("(c)", "Explique por qué es imposible predecir cuándo se desintegrará un núcleo concreto.", [
                reason("La desintegración es aleatoria: solo se conoce la probabilidad", "aleatoria, probabilidad", "aleator", "azar", "probabilidad", "probabilist", "impredecible", "espontane"),
              ], ["La desintegración es un proceso aleatorio y espontáneo: sólo se puede dar la probabilidad de desintegración de cada núcleo"], 2),
            ],
          };
        },
      },
      {
        id: "curva", label: "Curva de decaimiento y constante de desintegración", keywords: ["curva de decaimiento", "constante de desintegracion", "lambda", "actividad frente al tiempo"],
        make: (r) => {
          const T = pick(r, [2, 4, 6, 8]), A0 = pick(r, [80, 160, 240]);
          const lam = LN2 / T, t = 2.5 * T, A = A0 * Math.exp(-lam * t);
          const pts: [number, number][] = [];
          for (let i = 0; i <= 32; i++) { const x = (i * T) / 8; pts.push([x, Number((A0 * 2 ** (-x / T)).toFixed(3))]); }
          const items: FigItem[] = [{
            t: "graph", x: 52, y: 18, w: 270, h: 170, xr: [0, 4 * T], yr: [0, A0 * 1.05], xlabel: "t / días", ylabel: "A / kBq",
            xticks: Array.from({ length: 9 }, (_, i) => (i * T) / 2), yticks: [0, A0 / 8, A0 / 4, A0 / 2, A0], grid: true,
            series: [{ pts }],
          }];
          return {
            stem: "La gráfica muestra cómo disminuye con el tiempo la actividad A de una muestra de un radioisótopo.",
            fig: { w: 360, h: 236, alt: `Curva exponencial decreciente de la actividad, de ${A0} kBq en t = 0, frente al tiempo en días`, items },
            parts: [
              part("(a)", "Determine la semivida del radioisótopo.", [valT("A1", `T½ = ${T} días`, [T], 0.06)],
                [`La actividad pasa de ${A0} a ${A0 / 2} kBq`, `T½ = ${T} días`]),
              part("(b)", "Calcule la constante de desintegración.", [
                method("λ = ln 2 / T½", /ln\s*\(?\s*2|0[.,]69|λ\s*=|ln2/i, LN2, "λ = ln2/T½"),
                valT("A1", `λ = ${fmt(lam)} días⁻¹`, [lam, lam / 24, lam / 86400], TOL),
              ], ["λ = ln 2 / T½", `λ = 0,693 / ${T}`, `λ = ${fmt(lam)} días⁻¹`]),
              part("(c)", `Calcule la actividad en t = ${t} días.`, [
                method("A = A₀ e^(−λt)", /e\^?\s*\(?\s*[−-]|exp|2\^|1\/2/i, lam * t, "A = A₀e^(−λt)"),
                val("A1", `A = ${fmt(A)} kBq`, A),
              ], [`A = A₀ e^(−λt) = ${A0} × e^(−${fmt(lam)} × ${t})`, `A = ${fmt(A)} kBq`]),
            ],
          };
        },
      },
      {
        id: "actividad", label: "Actividad y número de núcleos", keywords: ["actividad", "becquerel", "numero de nucleos", "a = λn"],
        make: (r) => {
          const M = pick(r, [{ s: "Co", A: 60, Z: 27, T: "5,3 años", Ts: 5.3 * YR }, { s: "Sr", A: 90, Z: 38, T: "29 años", Ts: 29 * YR }, { s: "Cs", A: 137, Z: 55, T: "30 años", Ts: 30 * YR }, { s: "Ra", A: 226, Z: 88, T: "1600 años", Ts: 1600 * YR }, { s: "I", A: 131, Z: 53, T: "8,0 días", Ts: 8 * 86400 }]);
          const m = pick(r, [1.0, 5.0, 20]), mol = (m * 1e-6) / M.A, Nn = mol * NA, lam = LN2 / M.Ts, Act = lam * Nn;
          return {
            stem: `Una muestra contiene ${f2(m)} μg de ${nu(M.A, M.Z, M.s)}, cuya semivida es ${M.T}.`,
            data: "N_A = 6,02 × 10²³ mol⁻¹ · 1 año = 3,16 × 10⁷ s · masa molar = A g mol⁻¹",
            parts: [
              part("(a)", "Calcule la constante de desintegración, en s⁻¹.", [
                val("M1", `T½ = ${fmt(M.Ts)} s`, M.Ts, "T½ en segundos"),
                val("A1", `λ = ln 2 / T½ = ${fmt(lam)} s⁻¹`, lam),
              ], [`T½ = ${M.T} = ${fmt(M.Ts)} s`, `λ = ln 2 / T½ = 0,693 / ${fmt(M.Ts)}`, `λ = ${fmt(lam)} s⁻¹`]),
              part("(b)", "Determine el número de núcleos radiactivos de la muestra.", [
                val("M1", `n = m / M = ${fmt(mol)} mol`, mol, "n = m/M"),
                val("A1", `N = n N_A = ${fmt(Nn)}`, Nn),
              ], [`n = m / M = ${f2(m)}×10⁻⁶ / ${M.A} = ${fmt(mol)} mol`, `N = n N_A = ${fmt(mol)} × 6,02×10²³`, `N = ${fmt(Nn)}`]),
              part("(c)", "Calcule la actividad de la muestra.", [val("A1", `A = λN = ${fmt(Act)} Bq`, Act)],
                [`A = λ N = ${fmt(lam)} × ${fmt(Nn)}`, `A = ${fmt(Act)} Bq`]),
            ],
          };
        },
      },
      {
        id: "datacion", label: "Datación con carbono-14", keywords: ["carbono 14", "datacion", "edad de una muestra", "arqueologia"],
        make: (r) => {
          const Anow = pick(r, [0.180, 0.150, 0.120, 0.090, 0.060, 0.040]), A0 = 0.230, T = 5730;
          const f = Anow / A0, t = (T * Math.log(1 / f)) / LN2, lam = LN2 / T;
          const pts: [number, number][] = [];
          for (let k = 0; k <= 16; k += 0.5) pts.push([k, Number((2 ** (-(k * 1000) / T)).toFixed(4))]);
          const items: FigItem[] = [{
            t: "graph", x: 46, y: 18, w: 270, h: 170, xr: [0, 16], yr: [0, 1], xlabel: "t / 10³ años", ylabel: "A / A₀",
            xticks: Array.from({ length: 17 }, (_, i) => i), yticks: [0, 0.2, 0.4, 0.6, 0.8, 1], grid: true,
            series: [{ pts }, { pts: [[0, f], [16, f]], dash: true }],
          }];
          return {
            stem: `Un organismo vivo tiene una actividad de carbono-14 de 0,230 Bq por gramo de carbono. En un trozo de madera antigua se mide ${fmt(Anow, 3)} Bq por gramo. La semivida del carbono-14 es 5730 años. La gráfica muestra A/A₀ en función del tiempo; la línea discontinua marca la actividad relativa de la muestra.`,
            fig: { w: 360, h: 236, alt: "Curva de A/A₀ del carbono-14 frente al tiempo en miles de años, con una línea horizontal discontinua a la actividad relativa de la muestra", items },
            parts: [
              part("(a)", "Estime, a partir de la gráfica, la edad de la madera, en años.", [valT("A1", `t ≈ ${fmt(t, 2)} años`, [t], 0.08)],
                [`La línea discontinua corta la curva en t ≈ ${fmt(t / 1000, 2)} × 10³ años`, `t ≈ ${fmt(t)} años`]),
              part("(b)", "Calcule la edad de la madera con la ley de desintegración.", [
                method("A = A₀ e^(−λt)", /ln|log|e\^?\s*\(?\s*[−-]|2\^|λ\s*=/i, f, "A = A₀e^(−λt)"),
                val("A1", `t = ${fmt(t)} años`, t),
              ], [`A / A₀ = ${fmt(Anow, 3)} / 0,230 = ${fmt(f)}`, `λ = ln 2 / 5730 = ${fmt(lam)} años⁻¹`, `t = −ln(A/A₀) / λ = ${fmt(t)} años`]),
              part("(c)", "Explique por qué este método no sirve para fechar un objeto de un millón de años.", [
                reason("Casi no queda carbono-14: la actividad sería indetectable frente al fondo", "queda muy poco C-14", "no queda", "muy poca", "insuficiente", "indetectable", "ruido", "fondo", "decaido", "desintegrado", "demasiado pequena"),
              ], ["Tras tantas semividas no queda casi carbono-14: la actividad es demasiado pequeña para medirla frente a la radiación de fondo"], 2),
            ],
          };
        },
      },
      {
        id: "penetracion", label: "Penetración e ionización de α, β y γ", keywords: ["penetracion", "ionizacion", "alfa beta gamma", "blindaje"],
        make: (r) => {
          const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
          const pm = pick(r, perms), lab = pm.map((i) => "PQR"[i]);
          const ask = pick(r, [0, 1, 2]);
          const names = [["alfa", "α"], ["beta", "β"], ["gamma", "γ"]];
          const stops = ["se detiene en una hoja de papel", "atraviesa el papel pero se detiene en la lámina de aluminio", "atraviesa el papel y el aluminio y sólo se atenúa en el plomo"];
          const expl = [
            ["ioniza", "ionizacion", "pierde su energia", "pierde energia", "carga", "masa", "colision"],
            ["ioniza", "ionizacion", "menos ionizante", "carga", "pierde energia", "masa", "menos"],
            ["sin carga", "no tiene carga", "neutro", "ioniza poco", "poca ionizacion", "interacciona poco", "interactua poco", "no ioniza", "menos ionizante", "debilmente"],
          ];
          const exSol = [
            "La partícula α tiene carga +2e y mucha masa: ioniza intensamente, pierde su energía en pocas colisiones y se detiene enseguida",
            "La partícula β tiene carga −e y poca masa: ioniza menos que la α, así que pierde energía más despacio y llega más lejos",
            "El fotón γ no tiene carga: ioniza muy poco e interacciona poco con la materia, por lo que es muy penetrante",
          ];
          const ys = [60, 95, 130];
          const items: FigItem[] = [
            { t: "rect", x: 20, y: 82, w: 26, h: 28, fill: "light" },
            { t: "text", x: 33, y: 128, s: "fuente", size: 11 },
            { t: "rect", x: 118, y: 30, w: 4, h: 150, fill: "dark" },
            { t: "text", x: 120, y: 22, s: "papel", size: 11 },
            { t: "rect", x: 200, y: 30, w: 12, h: 150, fill: "dark" },
            { t: "text", x: 206, y: 22, s: "aluminio", size: 11 },
            { t: "rect", x: 280, y: 30, w: 28, h: 150, fill: "dark" },
            { t: "text", x: 294, y: 22, s: "plomo", size: 11 },
            { t: "line", x1: 47, y1: ys[0], x2: 117, y2: ys[0], arrow: "end" },
            { t: "text", x: 82, y: ys[0] - 8, s: lab[0] },
            { t: "line", x1: 47, y1: ys[1], x2: 199, y2: ys[1], arrow: "end" },
            { t: "text", x: 122 + 40, y: ys[1] - 8, s: lab[1] },
            { t: "line", x1: 47, y1: ys[2], x2: 360, y2: ys[2], arrow: "end" },
            { t: "text", x: 82, y: ys[2] - 8, s: lab[2] },
          ];
          return {
            stem: "Una fuente radiactiva emite partículas α, partículas β y rayos γ. La figura muestra hasta dónde llega cada tipo de radiación (trazos P, Q y R) cuando encuentra láminas de papel, aluminio y plomo.",
            fig: { w: 380, h: 190, alt: "Tres trazos desde una fuente: uno se detiene en el papel, otro en el aluminio y el tercero atraviesa ambos y llega al plomo", items },
            parts: [
              part("(a)", `Identifique el tipo de radiación (α, β o γ) del trazo ${lab[ask]}.`, [
                { code: "A1", text: `Trazo ${lab[ask]}: ${names[ask][0]} (${names[ask][1]})`, miss: "tipo de radiación", test: (l) => hasAny(l, ...names[ask]) && !names.some((n, i) => i !== ask && hasAny(l, ...n)) },
              ], [`El trazo ${lab[ask]} ${stops[ask]}: es radiación ${names[ask][0]} (${names[ask][1]})`], 2),
              part("(b)", `Explique por qué la radiación del trazo ${lab[ask]} ${stops[ask]}.`, [
                reason("Relaciona la penetración con la carga, la masa y la ionización", "carga/ionización", ...expl[ask]),
              ], [exSol[ask]], 3),
              part("(c)", "Sugiera por qué una fuente de partículas α es más peligrosa si se ingiere o se inhala que si está fuera del cuerpo.", [
                reason("Dentro del cuerpo ioniza intensamente las células cercanas: toda su energía se absorbe en los tejidos", "ionización de tejidos", "ionizacion", "dentro", "interior", "tejido", "celulas", "absorbe", "no atraviesa la piel", "muy ionizante"),
              ], ["Fuera del cuerpo la piel detiene las partículas α", "Dentro, ionizan intensamente las células vecinas y depositan en los tejidos toda su energía"], 3),
            ],
          };
        },
      },
      {
        id: "fondo", label: "Radiación de fondo y tasa de recuento", keywords: ["radiacion de fondo", "tasa de recuento", "contador geiger", "cuentas por minuto"],
        make: (r) => {
          const B = pick(r, [10, 20, 30]), S0 = pick(r, [80, 120, 160]), T = pick(r, [2, 4, 6, 8]);
          const top = Math.ceil((B + S0) / 20) * 20;
          const pts: [number, number][] = [];
          for (let i = 0; i <= 32; i++) { const x = (i * T) / 8; pts.push([x, Number((B + S0 * 2 ** (-x / T)).toFixed(2))]); }
          const items: FigItem[] = [{
            t: "graph", x: 52, y: 18, w: 270, h: 170, xr: [0, 4 * T], yr: [0, top], xlabel: "t / min", ylabel: "C / cuentas por min",
            xticks: Array.from({ length: 9 }, (_, i) => (i * T) / 2), yticks: Array.from({ length: top / 20 + 1 }, (_, i) => i * 20), grid: true,
            series: [{ pts }],
          }];
          const hlv = B + S0 / 2;
          return {
            stem: `Un contador Geiger mide una tasa de recuento de ${B} cuentas por minuto cuando no hay ninguna fuente cerca. Se coloca una muestra radiactiva delante del contador y la gráfica muestra la tasa de recuento medida C en función del tiempo.`,
            fig: { w: 360, h: 236, alt: `Tasa de recuento medida frente al tiempo: decrece exponencialmente desde ${B + S0} cuentas por minuto hacia un valor constante`, items },
            parts: [
              part("(a)", "Indique una fuente de la radiación de fondo.", [
                reason("Rayos cósmicos, radón, rocas y suelo, alimentos, materiales de construcción, etc.", "una fuente de fondo", "cosmic", "radon", "roca", "suelo", "granito", "edificio", "alimento", "atmosfera", "rayos", "medic", "natural", "potasio"),
              ], ["Radiación de fondo: rayos cósmicos, radón del suelo y de las rocas, alimentos, etc."], 2),
              part("(b)", "Determine la tasa de recuento inicial debida sólo a la muestra.", [
                valT("M1", `C(0) = ${B + S0} cuentas por min`, [B + S0], 0.06, "lectura de C(0)"),
                valT("A1", `Tasa de la muestra = ${S0} cuentas por min`, [S0], 0.06),
              ], [`En t = 0, C = ${B + S0} cuentas por minuto`, `Tasa de la muestra = C − fondo = ${B + S0} − ${B} = ${S0} cuentas por minuto`]),
              part("(c)", "Determine la semivida de la muestra.", [
                valT("M1", `La tasa de la muestra baja a ${S0 / 2}: C = ${fmt(hlv)}`, [hlv], 0.06, "C = fondo + mitad"),
                valT("A1", `T½ = ${T} min`, [T], 0.06),
              ], [`La tasa de la muestra se reduce a la mitad: ${S0 / 2} cuentas por minuto`, `Eso ocurre cuando C = ${B} + ${S0 / 2} = ${fmt(hlv)}`, `Se lee t = ${T} min: T½ = ${T} min`]),
            ],
          };
        },
      },
    ],
  },
  /* =================================================================== E.4 */
  {
    id: "E4", unit: "E", name: "E.4 Fisión",
    concepts: [
      {
        id: "defecto", label: "Energía liberada en una fisión", keywords: ["defecto de masa", "energia de fision", "uranio 235", "e = mc2"],
        make: (r) => {
          const nU = 235.0439, mn = 1.0087;
          const Rx = pick(r, [
            { a: nu(141, 56, "Ba"), ma: 140.9144, b: nu(92, 36, "Kr"), mb: 91.9262, k: 3, na: "bario-141", nb: "criptón-92" },
            { a: nu(140, 54, "Xe"), ma: 139.9216, b: nu(94, 38, "Sr"), mb: 93.9154, k: 2, na: "xenón-140", nb: "estroncio-94" },
            { a: nu(144, 55, "Cs"), ma: 143.9321, b: nu(90, 37, "Rb"), mb: 89.9148, k: 2, na: "cesio-144", nb: "rubidio-90" },
          ]);
          const mR = nU + mn, mP = Rx.ma + Rx.mb + Rx.k * mn, dm = mR - mP, E = dm * 931.5, EJ = E * MEV, mU = nU * U_AMU, perKg = EJ / mU;
          return {
            stem: `Un neutrón lento es absorbido por un núcleo de uranio-235 y se produce la fisión: ${nu(1, 0, "n")} + ${nu(235, 92, "U")} → ${Rx.a} + ${Rx.b} + ${Rx.k} ${nu(1, 0, "n")}.`,
            data: `Masas: ${nu(235, 92, "U")} = 235,0439 u · ${nu(1, 0, "n")} = 1,0087 u · ${Rx.na} = ${fmt(Rx.ma, 7)} u · ${Rx.nb} = ${fmt(Rx.mb, 6)} u · 1 u = 931,5 MeV c⁻² = 1,661 × 10⁻²⁷ kg · 1 MeV = 1,6 × 10⁻¹³ J`,
            parts: [
              part("(a)", "Calcule la diferencia de masa entre los reactivos y los productos, en u.", [
                valT("M1", `Σ m(productos) = ${fmt(mP, 7)} u`, [mR, mP], 0.0003, "suma de masas"),
                val("A1", `Δm = ${fmt(dm)} u`, dm),
              ], [`m(reactivos) = 235,0439 + 1,0087 = ${mR.toFixed(4)} u`, `m(productos) = ${Rx.ma} + ${Rx.mb} + ${Rx.k} × 1,0087 = ${mP.toFixed(4)} u`, `Δm = ${mR.toFixed(4)} − ${mP.toFixed(4)} = ${fmt(dm)} u`]),
              part("(b)", "Determine la energía liberada en una fisión, en MeV.", [valAny("A1", `E = Δm c² = ${fmt(E)} MeV`, [E, EJ])],
                [`E = Δm × 931,5 = ${fmt(dm)} × 931,5`, `E = ${fmt(E)} MeV`], 2),
              part("(c)", "Estime la energía liberada por kilogramo de uranio-235 si todos sus núcleos sufren esta fisión, en J kg⁻¹.", [
                val("M1", `m(núcleo) = ${fmt(mU)} kg`, mU, "masa de un núcleo en kg"),
                val("A1", `E/m = ${fmt(perKg)} J kg⁻¹`, perKg),
              ], [`E = ${fmt(E)} MeV = ${fmt(E)} × 1,6×10⁻¹³ = ${fmt(EJ)} J`, `m(núcleo) = 235,0439 × 1,661×10⁻²⁷ = ${fmt(mU)} kg`, `E por kg = ${fmt(EJ)} / ${fmt(mU)} = ${fmt(perKg)} J kg⁻¹`]),
            ],
          };
        },
      },
      {
        id: "enlace", label: "Defecto de masa y energía de enlace", keywords: ["energia de enlace", "defecto de masa", "por nucleon", "masa del nucleo"],
        make: (r) => {
          const mp = 1.0073, mn = 1.0087;
          const N = pick(r, [{ s: "He", A: 4, Z: 2, M: 4.0015 }, { s: "C", A: 12, Z: 6, M: 11.9967 }, { s: "O", A: 16, Z: 8, M: 15.9905 }, { s: "Fe", A: 56, Z: 26, M: 55.9206 }, { s: "Ni", A: 62, Z: 28, M: 61.9129 }, { s: "U", A: 235, Z: 92, M: 234.9934 }]);
          const n = N.A - N.Z, sum = N.Z * mp + n * mn, dm = sum - N.M, BE = dm * 931.5, per = BE / N.A;
          return {
            stem: `La masa del núcleo ${nu(N.A, N.Z, N.s)} es ${fmt(N.M, 7)} u.`,
            data: "Masa del protón = 1,0073 u · masa del neutrón = 1,0087 u · 1 u = 931,5 MeV c⁻²",
            parts: [
              part("(a)", "Calcule el defecto de masa del núcleo, en u.", [
                valT("M1", `Σ m(nucleones) = ${fmt(sum, 6)} u`, [sum], 0.0004, "suma de masas de los nucleones"),
                val("A1", `Δm = ${fmt(dm)} u`, dm),
              ], [`N = ${N.A} − ${N.Z} = ${n}`, `m(nucleones) = ${N.Z} × 1,0073 + ${n} × 1,0087 = ${sum.toFixed(4)} u`, `Δm = ${sum.toFixed(4)} − ${N.M} = ${fmt(dm)} u`]),
              part("(b)", "Determine la energía de enlace del núcleo, en MeV.", [valT("A1", `E = ${fmt(BE)} MeV`, [BE], TOL)],
                [`E = Δm × 931,5 = ${fmt(dm)} × 931,5`, `E = ${fmt(BE)} MeV`], 2),
              part("(c)", "Calcule la energía de enlace por nucleón.", [val("A1", `E/A = ${fmt(per)} MeV`, per)],
                [`E/A = ${fmt(BE)} / ${N.A}`, `E/A = ${fmt(per)} MeV por nucleón`], 2),
            ],
          };
        },
      },
      {
        id: "curva_enlace", label: "Curva de energía de enlace por nucleón", keywords: ["curva de energia de enlace", "hierro", "fision y fusion", "estabilidad nuclear"],
        make: (r) => {
          const curve: [number, number][] = [[2, 1.1], [4, 7.07], [8, 7.06], [12, 7.68], [16, 7.98], [20, 8.03], [30, 8.52], [40, 8.55], [56, 8.79], [90, 8.71], [120, 8.51], [140, 8.38], [160, 8.2], [208, 7.87], [235, 7.6]];
          const Ax = pick(r, [16, 30, 120, 140, 208]);
          const BAx = curve.find((p) => p[0] === Ax)![1];
          const F = pick(r, [8.4, 8.5, 8.7]), dE = F - 7.6, E = 235 * dE;
          const items: FigItem[] = [{
            t: "graph", x: 46, y: 18, w: 280, h: 170, xr: [0, 240], yr: [0, 10], xlabel: "A", ylabel: "energía de enlace por nucleón / MeV",
            xticks: [0, 40, 80, 120, 160, 200, 240], yticks: [0, 2, 4, 6, 8, 10], grid: true, series: [{ pts: curve }],
          }];
          return {
            stem: "La gráfica muestra cómo varía la energía de enlace por nucleón con el número de nucleones A.",
            fig: { w: 370, h: 236, alt: "Curva de la energía de enlace por nucleón frente al número de nucleones: sube rápido, tiene un máximo cerca de A = 56 y baja suavemente", items },
            parts: [
              part("(a)", `Determine, a partir de la gráfica, la energía de enlace por nucleón de un núcleo con A = ${Ax}.`, [valT("A1", `E/A ≈ ${fmt(BAx)} MeV`, [BAx], 0.06)],
                [`Se lee en la curva para A = ${Ax}`, `E/A ≈ ${fmt(BAx)} MeV por nucleón`], 2),
              part("(b)", `Un núcleo de uranio-235, con 7,6 MeV por nucleón, se divide en dos fragmentos con ${fmt(F, 2)} MeV por nucleón cada uno. Estime la energía liberada.`, [
                valT("M1", `Aumento por nucleón = ${fmt(dE)} MeV`, [dE], 0.05, "aumento por nucleón"),
                val("A1", `E = 235 × ${fmt(dE)} = ${fmt(E)} MeV`, E),
              ], [`Aumento de E/A = ${fmt(F, 2)} − 7,6 = ${fmt(dE)} MeV`, `E = 235 × ${fmt(dE)} = ${fmt(E)} MeV`]),
              part("(c)", "Explique, con ayuda de la curva, por qué la fisión del uranio libera energía.", [
                reason("Los fragmentos tienen mayor energía de enlace por nucleón: están más ligados y estables", "mayor E/A en los fragmentos", "mayor energia de enlace", "mas estable", "mas ligad", "aumenta la energia de enlace", "mas fuertemente", "mayor e/a", "mas enlazad"),
              ], ["Los fragmentos están más a la izquierda del uranio, cerca del máximo de la curva: tienen mayor energía de enlace por nucleón", "Al aumentar la energía de enlace, la diferencia se libera como energía cinética y radiación"], 2),
            ],
          };
        },
      },
      {
        id: "cadena", label: "Reacción en cadena y masa crítica", keywords: ["reaccion en cadena", "masa critica", "neutrones", "generaciones"],
        make: (r) => {
          const n = pick(r, [10, 12, 15]), Nn = 2 ** n;
          const gen = [[190], [130, 250], [100, 160, 220, 280]];
          const ys = [24, 86, 148];
          const items: FigItem[] = [];
          gen.forEach((xs, gi) => xs.forEach((x) => {
            items.push({ t: "circle", cx: x, cy: ys[gi], r: 9, fill: gi === 0 ? "dark" : "light" });
          }));
          const link = (x1: number, y1: number, x2: number, y2: number) => {
            const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
            items.push({ t: "line", x1: x1 + ux * 10, y1: y1 + uy * 10, x2: x2 - ux * 11, y2: y2 - uy * 11, arrow: "end" });
          };
          gen[0].forEach((x) => gen[1].forEach((x2) => link(x, ys[0], x2, ys[1])));
          gen[1].forEach((x, i) => [gen[2][2 * i], gen[2][2 * i + 1]].forEach((x2) => link(x, ys[1], x2, ys[2])));
          [0, 1, 2].forEach((gi) => items.push({ t: "text", x: 12, y: ys[gi] + 4, s: `n = ${gi}`, anchor: "start" }));
          return {
            stem: "En un reactor, cada fisión de uranio-235 libera varios neutrones y, en promedio, 2 de ellos provocan otra fisión, como muestra la figura. La fisión inicial es la generación n = 0.",
            fig: { w: 340, h: 176, alt: "Árbol de fisiones: una fisión inicial provoca 2, que provocan 4 en la generación siguiente", items },
            parts: [
              part("(a)", "Resuma cómo se produce una reacción en cadena.", [
                reason("Los neutrones liberados en cada fisión provocan nuevas fisiones", "neutrones provocan nuevas fisiones", "neutron", "provocan", "nuevas fisiones", "otras fisiones", "cada fision libera"),
              ], ["Cada fisión libera neutrones que producen nuevas fisiones, y éstas liberan más neutrones: el proceso se mantiene solo"], 2),
              part("(b)", "Explique por qué debe haber una masa crítica de uranio para mantener la reacción.", [
                reason("Si la masa es pequeña, muchos neutrones escapan por la superficie sin provocar fisiones", "escapan neutrones", "escapan", "superficie", "fuga", "perdidos", "volumen"),
              ], ["Si la muestra es pequeña, su superficie es grande respecto al volumen y muchos neutrones escapan sin chocar con núcleos de uranio"], 2),
              part("(c)", `Calcule el número de fisiones en la generación n = ${n}.`, [
                { code: "M1", text: "N = 2ⁿ", miss: "N = 2ⁿ", test: (l) => /2\s*\^|2ⁿ|2\s*\*\*|duplic|dobla/.test(normalize(l).toLowerCase()) },
                val("A1", `N = 2^${n} = ${Nn}`, Nn),
              ], [`Cada generación duplica el número de fisiones: N = 2ⁿ`, `N = 2^${n} = ${Nn}`]),
            ],
          };
        },
      },
      {
        id: "central", label: "Potencia de una central nuclear", keywords: ["central nuclear", "potencia termica", "rendimiento", "fisiones por segundo"],
        make: (r) => {
          const Pe = pick(r, [600, 900, 1000, 1200]), eta = pick(r, [0.30, 0.33, 0.35, 0.40]);
          const Pth = Pe / eta, Ef = 200 * MEV, rate = (Pth * 1e6) / Ef, perDay = rate * 86400, mass = perDay * 235 * U_AMU;
          const items: FigItem[] = [
            { t: "rect", x: 20, y: 52, w: 90, h: 60 },
            { t: "text", x: 65, y: 86, s: "Reactor" },
            { t: "line", x1: 110, y1: 82, x2: 170, y2: 82, arrow: "end", w: 1.8 },
            { t: "text", x: 140, y: 42, s: "P térmica = ?", size: 12 },
            { t: "rect", x: 170, y: 52, w: 130, h: 60 },
            { t: "text", x: 235, y: 78, s: "Turbina y" },
            { t: "text", x: 235, y: 94, s: "generador" },
            { t: "line", x1: 300, y1: 82, x2: 392, y2: 82, arrow: "end", w: 1.8 },
            { t: "text", x: 345, y: 70, s: `${Pe} MW`, size: 12 },
            { t: "line", x1: 235, y1: 112, x2: 235, y2: 158, arrow: "end", w: 1.8 },
            { t: "text", x: 245, y: 142, s: "calor residual", anchor: "start", size: 12 },
          ];
          return {
            stem: `Una central nuclear tiene una potencia eléctrica de salida de ${Pe} MW y un rendimiento global del ${fmt(eta * 100, 2)} %. En cada fisión de uranio-235 se liberan en promedio 200 MeV.`,
            data: "1 MeV = 1,6 × 10⁻¹³ J · masa de un núcleo de U-235 = 235 u · 1 u = 1,661 × 10⁻²⁷ kg",
            fig: { w: 400, h: 170, alt: "Diagrama de bloques: reactor, turbina y generador; entra potencia térmica, sale potencia eléctrica y calor residual", items },
            parts: [
              part("(a)", "Calcule la potencia térmica que produce el reactor, en MW.", [valAny("A1", `P térmica = ${fmt(Pth)} MW`, [Pth, Pth * 1e6])],
                [`rendimiento = P salida / P entrada`, `P térmica = ${Pe} / ${fmt(eta, 2)} = ${fmt(Pth)} MW`], 3),
              part("(b)", "Determine el número de fisiones por segundo.", [
                method("N = P / E", /P\s*\/\s*E|\/\s*3[.,]2|\/\s*\(?200|energ[ií]a\s*por\s*fisi/i, Pth * 1e6, "N = P/E"),
                val("A1", `N = ${fmt(rate)} s⁻¹`, rate),
              ], [`E por fisión = 200 × 1,6×10⁻¹³ = ${fmt(Ef)} J`, `N = P / E = ${fmt(Pth * 1e6)} / ${fmt(Ef)}`, `N = ${fmt(rate)} s⁻¹`]),
              part("(c)", "Estime la masa de uranio-235 que se consume cada día.", [
                val("M1", `Fisiones por día = ${fmt(perDay)}`, perDay, "fisiones por día"),
                val("A1", `m = ${fmt(mass)} kg`, mass),
              ], [`Fisiones por día = ${fmt(rate)} × 86 400 = ${fmt(perDay)}`, `m = ${fmt(perDay)} × 235 × 1,661×10⁻²⁷`, `m = ${fmt(mass)} kg`]),
            ],
          };
        },
      },
      {
        id: "moderador", label: "Moderador y barras de control", keywords: ["moderador", "barras de control", "reactor nuclear", "neutrones termicos"],
        make: (r) => {
          const nf = pick(r, [2.0, 2.5, 3.0, 4.0]), a = 1 - 1 / nf;
          const items: FigItem[] = [
            { t: "rect", x: 40, y: 40, w: 260, h: 140, fill: "light" },
            ...[80, 140, 200, 260].map((x): FigItem => ({ t: "rect", x, y: 60, w: 10, h: 110, fill: "none", sw: 2 })),
            ...[110, 170, 230].map((x): FigItem => ({ t: "rect", x, y: 10, w: 8, h: 100, fill: "dark" })),
            { t: "text", x: 312, y: 28, s: "barras de control", anchor: "start" },
            { t: "line", x1: 310, y1: 24, x2: 240, y2: 24 },
            { t: "text", x: 312, y: 134, s: "combustible", anchor: "start" },
            { t: "line", x1: 310, y1: 130, x2: 272, y2: 130 },
            { t: "text", x: 312, y: 174, s: "moderador", anchor: "start" },
            { t: "line", x1: 310, y1: 170, x2: 292, y2: 170 },
          ];
          return {
            stem: `En un reactor de fisión, en cada fisión de uranio-235 se liberan en promedio ${fmt(nf, 2)} neutrones. La figura muestra el núcleo del reactor.`,
            fig: { w: 440, h: 196, alt: "Corte del núcleo de un reactor con barras de combustible, barras de control insertadas y moderador alrededor", items },
            parts: [
              part("(a)", "Para que la reacción sea estacionaria, un solo neutrón de cada fisión debe provocar otra fisión. Calcule la fracción de los neutrones liberados que debe ser absorbida o perderse.", [
                method("n(1 − a) = 1", /\(\s*1\s*[−-]\s*[a-zA-Z]\s*\)|1\s*\/\s*n|k\s*=\s*1|=\s*1\b/i, 1 / nf, "n(1 − a) = 1"),
                valAny("A1", `a = 1 − 1/n = ${fmt(a)}`, [a, a * 100]),
              ], [`Debe quedar 1 neutrón de cada ${fmt(nf, 2)}: ${fmt(nf, 2)} (1 − a) = 1`, `a = 1 − 1 / ${fmt(nf, 2)} = ${fmt(a)} (${fmt(a * 100)} %)`]),
              part("(b)", "Explique la función del moderador.", [
                reason("Frena los neutrones rápidos hasta velocidades térmicas, con las que es más probable provocar fisión", "frena los neutrones", "frena", "ralentiza", "reduce la energia", "reduce la velocidad", "lentos", "termicos", "disminuye la velocidad"),
              ], ["El moderador frena (ralentiza) los neutrones mediante choques; los neutrones lentos tienen mayor probabilidad de causar fisión del U-235"], 2),
              part("(c)", "Explique cómo las barras de control regulan la potencia del reactor.", [
                reason("Absorben neutrones: al insertarlas más, hay menos fisiones", "absorben neutrones", "absorben", "absorber", "captura", "capturan"),
              ], ["Las barras de control absorben neutrones: al introducirlas se reduce el número de fisiones y baja la potencia"], 2),
            ],
          };
        },
      },
    ],
  },
  /* =================================================================== E.5 */
  {
    id: "E5", unit: "E", name: "E.5 Fusión y estrellas",
    concepts: [
      {
        id: "fusion_energia", label: "Energía de una reacción de fusión", keywords: ["fusion", "deuterio", "tritio", "energia de fusion"],
        make: (r) => {
          const Rx = pick(r, [
            { eq: `${nu(2, 1, "H")} + ${nu(3, 1, "H")} → ${nu(4, 2, "He")} + ${nu(1, 0, "n")}`, m: [2.01410, 3.01605], p: [4.00260, 1.00867], d: "deuterio-2 = 2,01410 u · tritio-3 = 3,01605 u · helio-4 = 4,00260 u · neutrón = 1,00867 u" },
            { eq: `${nu(2, 1, "H")} + ${nu(2, 1, "H")} → ${nu(3, 2, "He")} + ${nu(1, 0, "n")}`, m: [2.01410, 2.01410], p: [3.01603, 1.00867], d: "deuterio-2 = 2,01410 u · helio-3 = 3,01603 u · neutrón = 1,00867 u" },
            { eq: `${nu(2, 1, "H")} + ${nu(3, 2, "He")} → ${nu(4, 2, "He")} + ${nu(1, 1, "H")}`, m: [2.01410, 3.01603], p: [4.00260, 1.00783], d: "deuterio-2 = 2,01410 u · helio-3 = 3,01603 u · helio-4 = 4,00260 u · hidrógeno-1 = 1,00783 u" },
            { eq: `${nu(2, 1, "H")} + ${nu(2, 1, "H")} → ${nu(3, 1, "H")} + ${nu(1, 1, "H")}`, m: [2.01410, 2.01410], p: [3.01605, 1.00783], d: "deuterio-2 = 2,01410 u · tritio-3 = 3,01605 u · hidrógeno-1 = 1,00783 u" },
          ]);
          const mR = Rx.m[0] + Rx.m[1], mP = Rx.p[0] + Rx.p[1], dm = mR - mP, E = dm * 931.5;
          return {
            stem: `En el interior de una estrella (o en un reactor de fusión) ocurre la reacción ${Rx.eq}.`,
            data: `Masas atómicas: ${Rx.d} · 1 u = 931,5 MeV c⁻²`,
            parts: [
              part("(a)", "Calcule la diferencia de masa entre reactivos y productos, en u.", [
                valT("M1", `Σ m(reactivos) = ${fmt(mR, 6)} u`, [mR, mP], 0.0003, "suma de masas"),
                val("A1", `Δm = ${fmt(dm)} u`, dm),
              ], [`m(reactivos) = ${Rx.m[0]} + ${Rx.m[1]} = ${mR.toFixed(5)} u`, `m(productos) = ${Rx.p[0]} + ${Rx.p[1]} = ${mP.toFixed(5)} u`, `Δm = ${mR.toFixed(5)} − ${mP.toFixed(5)} = ${fmt(dm)} u`]),
              part("(b)", "Determine la energía liberada en la reacción, en MeV.", [val("A1", `E = Δm c² = ${fmt(E)} MeV`, E)],
                [`E = Δm × 931,5 = ${fmt(dm)} × 931,5`, `E = ${fmt(E)} MeV`], 2),
              part("(c)", "Explique por qué la fusión sólo ocurre a temperaturas muy altas.", [
                reason("Los núcleos tienen carga positiva y se repelen; necesitan mucha energía cinética para acercarse", "repulsión eléctrica entre núcleos", "repulsion", "repelen", "coulomb", "electrostatica", "cargas positivas", "carga positiva", "barrera"),
              ], ["Los núcleos tienen carga positiva y se repelen electrostáticamente", "Deben acercarse mucho: necesitan gran energía cinética, es decir, temperaturas muy altas"], 2),
            ],
          };
        },
      },
      {
        id: "luminosidad", label: "Luminosidad y brillo aparente", keywords: ["luminosidad", "brillo aparente", "ley del inverso del cuadrado", "años luz"],
        make: (r) => {
          const k = pick(r, [5, 20, 25, 100]), dly = pick(r, [10, 20, 40, 100]), fct = pick(r, [4, 9, 16, 25]);
          const L = k * LSUN, d = dly * LY, b = L / (4 * Math.PI * d * d), d2 = Math.sqrt(fct) * dly;
          return {
            stem: `Una estrella tiene una luminosidad de ${k} veces la del Sol y se encuentra a ${dly} años luz de la Tierra.`,
            data: "L☉ = 3,85 × 10²⁶ W · 1 año luz = 9,46 × 10¹⁵ m",
            parts: [
              part("(a)", "Calcule el brillo aparente de la estrella.", [
                val("M1", `d = ${fmt(d)} m`, d, "distancia en metros"),
                val("A1", `b = L / 4πd² = ${fmt(b)} W m⁻²`, b),
              ], [`L = ${k} × 3,85×10²⁶ = ${fmt(L)} W`, `d = ${dly} × 9,46×10¹⁵ = ${fmt(d)} m`, `b = L / (4π d²) = ${fmt(L)} / (4π × (${fmt(d)})²)`, `b = ${fmt(b)} W m⁻²`]),
              part("(b)", `Otra estrella con la misma luminosidad tiene un brillo aparente ${fct} veces menor. Determine su distancia, en años luz.`, [valAny("A1", `d' = ${fmt(d2)} años luz`, [d2, d2 * LY])],
                [`b ∝ 1 / d²: si b es ${fct} veces menor, d es √${fct} = ${fmt(Math.sqrt(fct))} veces mayor`, `d' = ${fmt(Math.sqrt(fct))} × ${dly} = ${fmt(d2)} años luz`]),
              part("(c)", "Distinga entre luminosidad y brillo aparente.", [
                reason("La luminosidad es la potencia total emitida; el brillo es la intensidad recibida a cierta distancia", "L total, b recibido", "potencia total", "energia emitida", "emitida", "recibida", "en la tierra", "observador", "distancia"),
              ], ["Luminosidad: potencia total que emite la estrella", "Brillo aparente: potencia recibida por unidad de área en la Tierra; depende de la distancia"], 2),
            ],
          };
        },
      },
      {
        id: "radio_estrella", label: "Radio de una estrella: Wien y Stefan-Boltzmann", keywords: ["stefan boltzmann", "ley de wien", "radio de una estrella", "temperatura superficial"],
        make: (r) => {
          const lm = pick(r, [500, 600, 700, 800, 1000]), k = pick(r, [10, 50, 100, 1000, 5000]);
          const T = WIEN / (lm * 1e-9), L = k * LSUN, R = Math.sqrt(L / (4 * Math.PI * SIGMA * T ** 4)), ratio = R / RSUN;
          const c2 = 4.965 * lm, Bf = (x: number) => Math.pow(x, -5) / (Math.exp(c2 / x) - 1), peak = Bf(lm);
          const pts: [number, number][] = [];
          for (let x = 20; x <= 1600; x += 20) pts.push([x, Number((Bf(x) / peak).toFixed(4))]);
          const items: FigItem[] = [{
            t: "graph", x: 46, y: 18, w: 280, h: 160, xr: [0, 1600], yr: [0, 1.1], xlabel: "λ / nm", ylabel: "intensidad relativa",
            xticks: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600], yticks: [], grid: true, series: [{ pts }],
          }];
          return {
            stem: `La gráfica muestra el espectro de la luz que emite una estrella, que se comporta como un cuerpo negro. La luminosidad de la estrella es ${fmt(L, 3)} W.`,
            data: "σ = 5,67 × 10⁻⁸ W m⁻² K⁻⁴ · constante de Wien = 2,90 × 10⁻³ m K · R☉ = 6,96 × 10⁸ m",
            fig: { w: 370, h: 226, alt: `Espectro de cuerpo negro: la intensidad relativa tiene un máximo en ${lm} nm`, items },
            parts: [
              part("(a)", "Determine, a partir de la gráfica, la temperatura de la superficie de la estrella.", [
                valT("M1", `λ máx = ${lm} nm`, [lm, lm * 1e-9], 0.06, "lectura de λ máx"),
                valT("A1", `T = ${fmt(T)} K`, [T], 0.06),
              ], [`El máximo está en λ máx = ${lm} nm = ${fmt(lm * 1e-9)} m`, `T = (2,90×10⁻³) / λ máx = 2,90×10⁻³ / ${fmt(lm * 1e-9)}`, `T = ${fmt(T)} K`]),
              part("(b)", "Calcule el radio de la estrella.", [
                method("L = 4πR²σT⁴", /4\s*π\s*r|σ\s*a\s*t|r\^?2|r²|σ\s*t/i, L, "L = 4πR²σT⁴"),
                valT("A1", `R = ${fmt(R)} m`, [R], 0.12),
              ], ["L = σ A T⁴ = 4π R² σ T⁴", `R = √(L / 4πσT⁴) = √(${fmt(L)} / (4π × 5,67×10⁻⁸ × ${fmt(T)}⁴))`, `R = ${fmt(R)} m`]),
              part("(c)", "Exprese el radio de la estrella en radios solares.", [valT("A1", `R / R☉ = ${fmt(ratio)}`, [ratio], 0.12)],
                [`R / R☉ = ${fmt(R)} / 6,96×10⁸`, `R = ${fmt(ratio)} R☉`], 2),
            ],
          };
        },
      },
      {
        id: "hr", label: "Diagrama de Hertzsprung–Russell", keywords: ["hertzsprung russell", "diagrama hr", "gigante roja", "enana blanca", "secuencia principal"],
        make: (r) => {
          const TB = pick(r, [3500, 4000, 4500]), LB = pick(r, [500, 1000, 2000, 5000]);
          const TA = 5800, LA = 1;
          const px = (T: number) => 50 + (Math.log10(40000 / T) / Math.log10(40000 / 2500)) * 280;
          const py = (L: number) => 190 - ((Math.log10(L) + 4) / 10) * 170;
          const pts = [{ k: "A", T: TA, L: LA }, { k: "B", T: TB, L: LB }, { k: "C", T: 12000, L: 0.01 }, { k: "D", T: 25000, L: 1e4 }];
          const items: FigItem[] = [
            { t: "line", x1: 50, y1: 190, x2: 340, y2: 190, arrow: "end" },
            { t: "line", x1: 50, y1: 190, x2: 50, y2: 8, arrow: "end" },
          ];
          for (const T of [30000, 10000, 5000, 3000]) {
            items.push({ t: "line", x1: px(T), y1: 190, x2: px(T), y2: 195 });
            items.push({ t: "text", x: px(T), y: 208, s: String(T), size: 11 });
          }
          for (const [e, s] of [[-2, "10⁻²"], [0, "1"], [2, "10²"], [4, "10⁴"], [6, "10⁶"]] as [number, string][]) {
            items.push({ t: "line", x1: 45, y1: py(10 ** e), x2: 50, y2: py(10 ** e) });
            items.push({ t: "text", x: 42, y: py(10 ** e) + 4, s, anchor: "end", size: 11 });
          }
          items.push({ t: "text", x: 195, y: 230, s: "temperatura superficial / K (decrece hacia la derecha)", size: 11 });
          items.push({ t: "text", x: 56, y: 12, s: "L / L☉", anchor: "start", size: 12 });
          for (const p of pts) {
            items.push({ t: "circle", cx: px(p.T), cy: py(p.L), r: 4, fill: "dark" });
            items.push({ t: "text", x: px(p.T) + 10, y: py(p.L) + 4, s: p.k, anchor: "start", bold: true });
          }
          const ratio = Math.sqrt(LB / LA) * (TA / TB) ** 2;
          return {
            stem: "El diagrama de Hertzsprung–Russell muestra la luminosidad L (en unidades de la luminosidad del Sol) y la temperatura superficial de cuatro estrellas, A, B, C y D. La estrella A es como el Sol.",
            data: `A: T = 5800 K, L = 1,0 L☉ · B: T = ${TB} K, L = ${LB} L☉`,
            fig: { w: 380, h: 240, alt: "Diagrama HR con ejes logarítmicos; la temperatura decrece hacia la derecha. Cuatro estrellas: A como el Sol, B arriba a la derecha, C abajo a la izquierda y D arriba a la izquierda", items },
            parts: [
              part("(a)", "Identifique el tipo de estrella de B.", [
                reason("Gigante roja (supergigante): alta luminosidad y baja temperatura", "gigante roja", "gigante"),
              ], ["B tiene mucha luminosidad y baja temperatura: es una gigante roja"], 2),
              part("(b)", "Determine la razón entre el radio de B y el radio de A.", [
                method("L = 4πR²σT⁴, así que R ∝ √L / T²", /R\^?2|R²|T\^?4|T⁴|σ|4\s*π|√/i, Math.sqrt(LB / LA), "L ∝ R²T⁴"),
                val("A1", `R_B / R_A = ${fmt(ratio)}`, ratio),
              ], ["L = 4π R² σ T⁴  →  R = √(L / 4πσ) / T²", `R_B / R_A = √(L_B / L_A) × (T_A / T_B)² = √${LB} × (5800 / ${TB})²`, `R_B / R_A = ${fmt(ratio)}`]),
              part("(c)", "Explique por qué la estrella C, aunque es más caliente que A, es mucho menos luminosa.", [
                reason("Tiene un radio (superficie emisora) mucho menor: es una enana blanca", "radio pequeño, área menor", "radio", "pequen", "area", "tamano", "superficie"),
              ], ["L = 4π R² σ T⁴: C tiene temperatura mayor pero un radio mucho menor, y por tanto una superficie emisora muy pequeña (enana blanca)"], 3),
            ],
          };
        },
      },
      {
        id: "paralaje", label: "Paralaje estelar y distancia", keywords: ["paralaje", "parsec", "distancia a una estrella", "segundos de arco"],
        make: (r) => {
          const p = pick(r, [0.50, 0.25, 0.20, 0.10, 0.050]), b = pick(r, [1.5e-9, 3.0e-9, 6.0e-9, 1.2e-8]);
          const dpc = 1 / p, dm = dpc * PC, L = b * 4 * Math.PI * dm * dm;
          const items: FigItem[] = [
            { t: "line", x1: 190, y1: 36, x2: 190, y2: 190, w: 1.2 },
            { t: "line", x1: 190, y1: 36, x2: 300, y2: 190, w: 1.2 },
            { t: "line", x1: 190, y1: 36, x2: 80, y2: 190, w: 1.2, dash: true },
            { t: "line", x1: 80, y1: 190, x2: 300, y2: 190, w: 1.2, dash: true },
            { t: "circle", cx: 190, cy: 36, r: 6, fill: "dark" },
            { t: "text", x: 190, y: 22, s: "estrella" },
            { t: "circle", cx: 190, cy: 190, r: 8, fill: "dark" },
            { t: "text", x: 190, y: 214, s: "Sol" },
            { t: "circle", cx: 300, cy: 190, r: 5, fill: "light" },
            { t: "circle", cx: 80, cy: 190, r: 5, fill: "light" },
            { t: "text", x: 300, y: 214, s: "Tierra (hoy)" },
            { t: "text", x: 80, y: 214, s: "Tierra (6 meses)" },
            { t: "text", x: 245, y: 182, s: "1 UA", size: 11 },
            { t: "text", x: 180, y: 118, s: "d", anchor: "end", italic: true },
            { t: "angle", x: 190, y: 36, r: 50, a1: 270, a2: 304.5, label: "p" },
          ];
          return {
            stem: `La figura (no está a escala) muestra cómo se mide el paralaje de una estrella cercana. El ángulo de paralaje p es ${fmt(p, 2)}″ (segundos de arco) y su brillo aparente es ${fmt(b, 2)} W m⁻².`,
            data: "1 pc = 3,09 × 10¹⁶ m",
            fig: { w: 390, h: 232, alt: "Geometría del paralaje: una estrella, el Sol y la Tierra en dos posiciones separadas seis meses, con el ángulo p en la estrella", items },
            parts: [
              part("(a)", "Calcule la distancia a la estrella, en parsec.", [val("A1", `d = 1 / p = ${fmt(dpc)} pc`, dpc)],
                [`d (pc) = 1 / p (″) = 1 / ${fmt(p, 2)}`, `d = ${fmt(dpc)} pc`], 2),
              part("(b)", "Determine la luminosidad de la estrella.", [
                val("M1", `d = ${fmt(dm)} m`, dm, "distancia en metros"),
                val("A1", `L = 4πd²b = ${fmt(L)} W`, L),
              ], [`d = ${fmt(dpc)} × 3,09×10¹⁶ = ${fmt(dm)} m`, `L = 4π d² b = 4π × (${fmt(dm)})² × ${fmt(b, 2)}`, `L = ${fmt(L)} W`]),
              part("(c)", "Explique por qué el método del paralaje sólo se puede usar con estrellas relativamente cercanas.", [
                reason("Para estrellas lejanas el ángulo de paralaje es demasiado pequeño para medirse", "ángulo demasiado pequeño", "angulo muy pequeno", "demasiado pequeno", "muy pequeno", "no se puede medir", "dificil de medir", "no medible", "imperceptible"),
              ], ["Cuanto más lejos está la estrella, menor es p", "Si el ángulo es demasiado pequeño no se puede medir con precisión"], 2),
            ],
          };
        },
      },
      {
        id: "equilibrio", label: "Equilibrio hidrostático y vida de una estrella", keywords: ["equilibrio hidrostatico", "presion de radiacion", "vida de una estrella", "secuencia principal"],
        make: (r) => {
          const S = pick(r, [{ M: 1.5, L: 4.1 }, { M: 2.0, L: 11 }, { M: 3.0, L: 47 }, { M: 5.0, L: 280 }]);
          const t = (1e10 * S.M) / S.L;
          const items: FigItem[] = [
            { t: "circle", cx: 120, cy: 100, r: 60, fill: "light" },
            { t: "line", x1: 14, y1: 100, x2: 58, y2: 100, arrow: "end", w: 1.8 },
            { t: "text", x: 36, y: 90, s: "X" },
            { t: "line", x1: 226, y1: 100, x2: 182, y2: 100, arrow: "end", w: 1.8 },
            { t: "text", x: 204, y: 90, s: "X" },
            { t: "line", x1: 120, y1: 100, x2: 120, y2: 52, arrow: "end", w: 1.8 },
            { t: "text", x: 134, y: 74, s: "Y" },
            { t: "line", x1: 120, y1: 100, x2: 120, y2: 148, arrow: "end", w: 1.8 },
            { t: "text", x: 134, y: 136, s: "Y" },
          ];
          return {
            stem: `Una estrella de la secuencia principal se mantiene estable porque dos efectos opuestos, X e Y, se equilibran en cada punto de su interior (figura). Una estrella tiene masa de ${fmt(S.M, 2)} M☉ y luminosidad de ${fmt(S.L, 2)} L☉. El Sol permanece en la secuencia principal unos 1,0 × 10¹⁰ años.`,
            fig: { w: 250, h: 180, alt: "Una estrella con dos flechas X hacia el centro y dos flechas Y hacia el exterior", items },
            parts: [
              part("(a)", "Identifique la causa de X y la de Y.", [
                reason("X: atracción gravitatoria hacia el centro", "X es la gravedad", "gravedad", "gravitat", "hacia el centro", "peso"),
                reason("Y: presión del gas y de la radiación (calor de la fusión)", "Y es la presión", "presion", "gas", "radiacion", "fusion", "termica", "calor"),
              ], ["X: la fuerza gravitatoria, que comprime la estrella hacia su centro", "Y: la presión del gas caliente y de la radiación producidas por la fusión, que empujan hacia fuera"], 3),
              part("(b)", "Estime el tiempo que esta estrella permanecerá en la secuencia principal.", [
                method("t ∝ M / L", /m\s*\/\s*l|t\s*∝|proporcional|combustible/i, S.M / S.L, "t ∝ M/L"),
                valAny("A1", `t = ${fmt(t)} años`, [t, t / 1e9]),
              ], ["El combustible disponible es proporcional a M y se consume con ritmo proporcional a L: t ∝ M / L", `t = 1,0×10¹⁰ × (${fmt(S.M, 2)} / ${fmt(S.L, 2)})`, `t = ${fmt(t)} años`]),
              part("(c)", "Cuando se agota el hidrógeno del núcleo, cesa la fusión allí. Describa qué le ocurre al núcleo.", [
                reason("El núcleo se contrae (la gravedad vence a la presión) y se calienta", "se contrae", "contrae", "contraiga", "contraer", "contraccion", "colapsa", "comprime", "encoge"),
              ], ["Sin fusión baja la presión; la gravedad hace que el núcleo se contraiga y se caliente"], 2),
            ],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
  "E.1": {
    title: "E.1 Estructura del átomo",
    items: [
      { tex: "E_n = -\\dfrac{13{,}6}{n^2}\\ \\text{eV}", n: "niveles de energía del hidrógeno", for: ["niveles", "línea", "espectral"] },
      { tex: "hf = E_i - E_f", n: "energía del fotón emitido en una transición", for: ["niveles", "línea", "espectral"] },
      { tex: "\\lambda = \\dfrac{hc}{E}", n: "longitud de onda del fotón", for: ["línea", "espectral"] },
      { tex: "E_k = \\dfrac{k\\,(2e)(Ze)}{d}", n: "distancia de máxima aproximación (partícula α)", for: ["rutherford"] },
      { tex: "R = R_0\\, A^{1/3}", n: "radio nuclear", for: ["radio", "nuclear", "gráfica"] },
      { tex: "A = Z + N", n: "nucleones = protones + neutrones", for: ["composición", "isótopos"] },
    ],
    consts: [
      { tex: "h = 6{,}63\\times10^{-34}\\ \\text{J s}" },
      { tex: "c = 3{,}00\\times10^{8}\\ \\text{m s}^{-1}" },
      { tex: "e = 1{,}60\\times10^{-19}\\ \\text{C}", note: "1 eV = 1,60 × 10⁻¹⁹ J" },
      { tex: "R_0 = 1{,}20\\times10^{-15}\\ \\text{m}" },
      { tex: "k = 8{,}99\\times10^{9}\\ \\text{N m}^2\\,\\text{C}^{-2}" },
      { tex: "1\\ \\text{u} = 1{,}661\\times10^{-27}\\ \\text{kg} = 931{,}5\\ \\text{MeV c}^{-2}" },
    ],
  },
  "E.2": {
    title: "E.2 Física cuántica",
    items: [
      { tex: "E = hf = \\dfrac{hc}{\\lambda}", n: "energía de un fotón", for: ["fotoeléctrico", "intensidad"] },
      { tex: "hf = \\Phi + E_{k,\\max}", n: "ecuación fotoeléctrica de Einstein", for: ["fotoeléctrico", "gráfica", "potencial"] },
      { tex: "hf_0 = \\Phi", n: "frecuencia umbral", for: ["fotoeléctrico", "gráfica"] },
      { tex: "E_{k,\\max} = eV_s", n: "potencial de frenado", for: ["potencial"] },
      { tex: "\\lambda = \\dfrac{h}{p}", n: "longitud de onda de de Broglie", for: ["broglie"] },
      { tex: "E_k = eV = \\dfrac{p^2}{2m}", n: "electrón acelerado desde el reposo", for: ["broglie"] },
      { tex: "\\Delta\\lambda = \\dfrac{h}{m_e c}\\,(1-\\cos\\theta)", n: "dispersión Compton", for: ["compton"] },
      { tex: "N = \\dfrac{P}{hf}", n: "fotones por segundo", for: ["intensidad"] },
    ],
    consts: [
      { tex: "h = 6{,}63\\times10^{-34}\\ \\text{J s}", note: "4,14 × 10⁻¹⁵ eV s" },
      { tex: "c = 3{,}00\\times10^{8}\\ \\text{m s}^{-1}" },
      { tex: "e = 1{,}60\\times10^{-19}\\ \\text{C}" },
      { tex: "m_e = 9{,}11\\times10^{-31}\\ \\text{kg}" },
    ],
  },
  "E.3": {
    title: "E.3 Desintegración radiactiva",
    items: [
      { tex: "{}^{A}_{Z}X \\to {}^{A-4}_{Z-2}Y + {}^{4}_{2}\\alpha", n: "desintegración α", for: ["ecuaciones"] },
      { tex: "{}^{A}_{Z}X \\to {}^{A}_{Z+1}Y + \\beta^- + \\bar{\\nu}_e", n: "desintegración β⁻", for: ["ecuaciones"] },
      { tex: "{}^{A}_{Z}X \\to {}^{A}_{Z-1}Y + \\beta^+ + \\nu_e", n: "desintegración β⁺", for: ["ecuaciones"] },
      { tex: "N = N_0\\, e^{-\\lambda t}", n: "núcleos que quedan", for: ["semivida", "curva", "datación"] },
      { tex: "A = \\lambda N = A_0\\, e^{-\\lambda t}", n: "actividad", for: ["semivida", "curva", "actividad", "datación", "fondo"] },
      { tex: "\\lambda\\, T_{1/2} = \\ln 2", n: "constante de desintegración y semivida", for: ["curva", "actividad", "datación"] },
      { tex: "N = \\dfrac{m}{M}\\,N_A", n: "número de núcleos de una muestra", for: ["actividad"] },
    ],
    consts: [
      { tex: "N_A = 6{,}02\\times10^{23}\\ \\text{mol}^{-1}" },
      { tex: "1\\ \\text{año} = 3{,}16\\times10^{7}\\ \\text{s}" },
    ],
  },
  "E.4": {
    title: "E.4 Fisión",
    items: [
      { tex: "\\Delta E = \\Delta m\\, c^2", n: "energía liberada a partir del defecto de masa", for: ["energía", "defecto"] },
      { tex: "\\Delta m = Z m_p + N m_n - M", n: "defecto de masa de un núcleo", for: ["defecto", "enlace"] },
      { tex: "E_B = \\Delta m \\times 931{,}5\\ \\text{MeV}", n: "energía de enlace (Δm en u)", for: ["defecto", "enlace"] },
      { tex: "\\dfrac{E_B}{A}", n: "energía de enlace por nucleón", for: ["enlace", "curva"] },
      { tex: "\\text{rendimiento} = \\dfrac{P_{\\text{útil}}}{P_{\\text{entrada}}}", n: "rendimiento de la central", for: ["central"] },
      { tex: "N_{\\text{fisiones}}/t = \\dfrac{P}{E_{\\text{fisión}}}", n: "fisiones por segundo", for: ["central"] },
    ],
    consts: [
      { tex: "1\\ \\text{u} = 931{,}5\\ \\text{MeV c}^{-2} = 1{,}661\\times10^{-27}\\ \\text{kg}" },
      { tex: "m_p = 1{,}0073\\ \\text{u}\\qquad m_n = 1{,}0087\\ \\text{u}" },
      { tex: "1\\ \\text{MeV} = 1{,}60\\times10^{-13}\\ \\text{J}" },
    ],
  },
  "E.5": {
    title: "E.5 Fusión y estrellas",
    items: [
      { tex: "\\Delta E = \\Delta m\\, c^2", n: "energía de una reacción de fusión", for: ["fusión", "energía"] },
      { tex: "L = 4\\pi R^2 \\sigma T^4", n: "ley de Stefan–Boltzmann", for: ["radio", "hertzsprung", "diagrama"] },
      { tex: "b = \\dfrac{L}{4\\pi d^2}", n: "brillo aparente", for: ["luminosidad", "paralaje"] },
      { tex: "\\lambda_{\\max} T = 2{,}90\\times10^{-3}\\ \\text{m K}", n: "ley de desplazamiento de Wien", for: ["radio", "wien"] },
      { tex: "d\\ (\\text{pc}) = \\dfrac{1}{p\\ (\\text{segundos de arco})}", n: "distancia por paralaje", for: ["paralaje"] },
      { tex: "t \\propto \\dfrac{M}{L}", n: "vida en la secuencia principal", for: ["equilibrio"] },
    ],
    consts: [
      { tex: "\\sigma = 5{,}67\\times10^{-8}\\ \\text{W m}^{-2}\\,\\text{K}^{-4}" },
      { tex: "L_\\odot = 3{,}85\\times10^{26}\\ \\text{W}\\qquad R_\\odot = 6{,}96\\times10^{8}\\ \\text{m}" },
      { tex: "1\\ \\text{pc} = 3{,}09\\times10^{16}\\ \\text{m} = 3{,}26\\ \\text{años luz}" },
      { tex: "1\\ \\text{año luz} = 9{,}46\\times10^{15}\\ \\text{m}" },
      { tex: "1\\ \\text{u} = 931{,}5\\ \\text{MeV c}^{-2}" },
    ],
  },
};
