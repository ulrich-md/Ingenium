/**
 * Unit E · more questions (intermedio y examen). See kit.ts. Concepts are added to the
 * subtopics of bank/E.ts by topic id (e.g. "E1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "../check.ts";
import { C_LIGHT, E_CHARGE, f2, fmt, H_PLANCK, hasAny, K_COUL, MEV, method, near, normalize, part, pick, reason, SIGMA, TOL, U_AMU, val, valAny, WIEN, type Concept, type FigItem } from "./kit.ts";

const SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹", SUBD = "₀₁₂₃₄₅₆₇₈₉";
const spn = (n: number) => Array.from(String(n), (c) => SUPD[+c]).join("");
const sbn = (n: number) => Array.from(String(n), (c) => SUBD[+c]).join("");
const nu = (A: number, Z: number, s: string) => `${spn(A)}${sbn(Z)}${s}`;
/** A mark for a value within a chosen tolerance, accepting several equivalent targets (units). */
const valT = (code: Rule["code"], text: string, targets: number[], tol: number, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => targets.some((t) => near(n, t, tol)) });
/** Same, but a minus sign does not matter (energies of bound levels). */
const absT = (code: Rule["code"], text: string, targets: number[], tol: number = TOL, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => targets.some((t) => near(n.map(Math.abs), t, tol)) });
/** A mark for a factor (a ratio): 0,25 · 1/4 · "4 veces menor". */
const fac = (code: Rule["code"], text: string, f: number, miss: string = code): Rule => ({
  code, text, miss,
  test: (l, n) =>
    near(n, f, TOL) ||
    [...normalize(l).matchAll(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)].some((m) => near([+m[1] / +m[2]], f, TOL)) ||
    (f < 1 && hasAny(l, "veces menor", "veces menos", "veces mas pequen") && near(n, 1 / f, TOL)),
});

const EV = E_CHARGE;
const LN2 = Math.LN2;
const LSUN = 3.85e26, RSUN = 6.96e8, LY = 9.46e15, PC = 3.09e16;

/** Planck-like spectrum with its peak at lm nm, scaled to 1, for the star graphs. */
function spectrum(lm: number): [number, number][] {
  const c2 = 4.965 * lm, Bf = (x: number) => Math.pow(x, -5) / (Math.exp(c2 / x) - 1), peak = Bf(lm);
  const pts: [number, number][] = [];
  for (let x = 20; x <= 1600; x += 20) pts.push([x, Number((Bf(x) / peak).toFixed(4))]);
  return pts;
}

export const extra: Record<string, Concept[]> = {
  /* ============================================================ E.1 */
  E1: [
    {
      id: "x_transicion", level: 2, label: "Transición en el hidrógeno: fotón y región del espectro",
      keywords: ["transicion", "niveles de energia", "hidrogeno", "region del espectro", "fotón emitido"],
      make: (r) => {
        const [ni, nf] = pick(r, [[3, 2], [4, 2], [2, 1], [3, 1], [4, 3]] as [number, number][]);
        const En = (n: number) => 13.6 / (n * n);
        const dE = En(nf) - En(ni), dEJ = dE * EV, lam = (H_PLANCK * C_LIGHT) / dEJ, lnm = lam * 1e9;
        const region = lnm < 380 ? "ultravioleta" : lnm > 750 ? "infrarroja" : "visible";
        const yy: Record<number, number> = { 1: 176, 2: 108, 3: 62, 4: 30 };
        const items: FigItem[] = [];
        for (const n of [1, 2, 3, 4]) {
          items.push({ t: "line", x1: 76, y1: yy[n], x2: 236, y2: yy[n], w: 1.6 });
          items.push({ t: "text", x: 68, y: yy[n] + 4, s: `n = ${n}`, anchor: "end" });
          items.push({ t: "text", x: 244, y: yy[n] + 4, s: `−${fmt(En(n), 3)} eV`, anchor: "start", size: 12 });
        }
        items.push({ t: "line", x1: 156, y1: yy[ni], x2: 156, y2: yy[nf], arrow: "end", w: 1.8 });
        items.push({ t: "text", x: 150, y: (yy[ni] + yy[nf]) / 2 + 4, s: "fotón", anchor: "end", size: 12 });
        items.push({ t: "text", x: 160, y: 206, s: "(esquema, no está a escala)", size: 11 });
        const lev = (n: number) => `E${sbn(n)} = −13,6 / ${n}² = −${fmt(En(n))} eV`;
        return {
          stem: `La figura muestra los cuatro niveles de energía más bajos del átomo de hidrógeno. Un electrón pasa del nivel n = ${ni} al nivel n = ${nf} y emite un fotón.`,
          data: "Eₙ = −13,6 / n² eV · h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹ · 1 eV = 1,6 × 10⁻¹⁹ J",
          fig: { w: 340, h: 218, alt: `Cuatro niveles de energía del hidrógeno, de n = 1 a n = 4, con una flecha desde n = ${ni} hasta n = ${nf}`, items },
          parts: [
            part("(a)", "Calcule la energía del fotón emitido, en eV.", [
              absT("M1", `Energías de los niveles: ${fmt(En(ni))} eV y ${fmt(En(nf))} eV`, [En(ni), En(nf)], TOL, "energía de los niveles"),
              valAny("A1", `E = ${fmt(dE)} eV`, [dE, dEJ]),
            ], [lev(ni), lev(nf), `E = ${fmt(En(nf))} − ${fmt(En(ni))} = ${fmt(dE)} eV`]),
            part("(b)", "Determine la longitud de onda del fotón, en nm.", [
              method("λ = hc / E", /h\s*c|h\s*f|c\s*\/\s*f|E\s*=\s*h/i, dEJ, "λ = hc/E"),
              valAny("A1", `λ = ${fmt(lnm)} nm`, [lnm, lam]),
            ], [`E = ${fmt(dE)} × 1,6×10⁻¹⁹ = ${fmt(dEJ)} J`, `λ = hc / E = 6,63×10⁻³⁴ × 3,00×10⁸ / ${fmt(dEJ)}`, `λ = ${fmt(lam)} m = ${fmt(lnm)} nm`]),
            part("(c)", "Indique a qué región del espectro (ultravioleta, visible o infrarroja) pertenece este fotón.", [
              reason(`Región ${region} (λ = ${fmt(lnm, 3)} nm)`, `región ${region}`,
                ...(region === "ultravioleta" ? ["ultravioleta", "ultra violeta"] : region === "visible" ? ["visible"] : ["infrarroj"])),
            ], [`La luz visible va de unos 380 nm a 750 nm; λ = ${fmt(lnm)} nm`, `El fotón es ${region}`], 2),
          ],
        };
      },
    },
    {
      id: "x_alfaoro", level: 3, label: "Máximo acercamiento de una partícula alfa a un núcleo de oro",
      keywords: ["rutherford", "maximo acercamiento", "particula alfa", "radio del nucleo", "energia potencial electrica"],
      make: (r) => {
        const E = pick(r, [5.0, 6.0, 7.0, 7.7]);
        const EJ = E * MEV, kqQ = K_COUL * 2 * 79 * EV * EV, rc = kqQ / EJ;
        const A = 197, Rn = 1.2e-15 * Math.cbrt(A), ratio = rc / Rn;
        const items: FigItem[] = [
          { t: "circle", cx: 56, cy: 80, r: 6, fill: "light" },
          { t: "text", x: 56, y: 62, s: `α, ${fmt(E, 2)} MeV` },
          { t: "line", x1: 68, y1: 80, x2: 196, y2: 80, arrow: "end", w: 1.8 },
          { t: "line", x1: 200, y1: 70, x2: 200, y2: 90, w: 1, dash: true },
          { t: "circle", cx: 300, cy: 80, r: 11, fill: "dark" },
          { t: "text", x: 300, y: 58, s: `${nu(197, 79, "Au")}` },
          { t: "line", x1: 204, y1: 118, x2: 288, y2: 118, arrow: "both", w: 1.2 },
          { t: "text", x: 246, y: 138, s: "r (máximo acercamiento)", size: 12 },
          { t: "text", x: 190, y: 164, s: "(esquema, no está a escala)", size: 11 },
        ];
        return {
          stem: `Una partícula alfa de ${fmt(E, 2)} MeV se lanza de frente contra un núcleo de oro-197 (Z = 79), que se supone en reposo. La partícula se detiene momentáneamente a una distancia r del centro del núcleo y regresa.`,
          data: "k = 8,99 × 10⁹ N m² C⁻² · e = 1,6 × 10⁻¹⁹ C · 1 MeV = 1,6 × 10⁻¹³ J · R = R₀ A^(1/3) con R₀ = 1,2 fm · 1 fm = 10⁻¹⁵ m",
          fig: { w: 380, h: 176, alt: "Una partícula alfa avanza hacia un núcleo de oro y se detiene a una distancia r del núcleo", items },
          parts: [
            part("(a)", "Exprese la energía cinética inicial de la partícula alfa en julios.", [valAny("A1", `Ek = ${fmt(EJ)} J`, [EJ])],
              [`Ek = ${fmt(E, 2)} × 1,6×10⁻¹³`, `Ek = ${fmt(EJ)} J`], 2),
            part("(b)", "Explique qué le ocurre a la energía de la partícula en el punto de máximo acercamiento.", [
              reason("Toda la energía cinética se ha convertido en energía potencial eléctrica", "Ek → Ep eléctrica", "potencial", "toda la energia", "se transforma", "se convierte", "convierte en"),
            ], ["En el punto de máximo acercamiento la partícula está momentáneamente en reposo", "Toda su energía cinética se ha convertido en energía potencial eléctrica"], 2),
            part("(c)", "Determine la distancia r de máximo acercamiento.", [
              method("Ek = k(2e)(79e) / r", /k\s*\(?\s*2\s*e|k\s*q|k\s*Q|k\s*\(?\s*Z|Ep\s*=|=\s*k/i, kqQ, "Ek = kQq/r"),
              val("A1", `r = ${fmt(rc)} m`, rc),
            ], [`Ek = k (2e)(79e) / r`, `r = ${fmt(K_COUL, 3)} × 2 × 79 × (1,6×10⁻¹⁹)² / ${fmt(EJ)}`, `r = ${fmt(rc)} m`]),
            part("(d)", "Estime el radio del núcleo de oro-197 y compárelo con r.", [
              method("R = R₀ A^(1/3)", /R\s*0\s*A|A\^?\s*\(?1\s*\/\s*3|∛|1[.,]2\s*[×x*]?\s*197|R\s*=\s*R/i, Rn, "R = R₀A^(1/3)"),
              valAny("A1", `R = ${fmt(Rn)} m`, [Rn, Rn * 1e15]),
              valT("A1", `r / R = ${fmt(ratio)}`, [ratio], 0.06),
            ], [`R = R₀ A^(1/3) = 1,2×10⁻¹⁵ × 197^(1/3)`, `R = ${fmt(Rn)} m = ${fmt(Rn * 1e15)} fm`, `r / R = ${fmt(rc)} / ${fmt(Rn)} = ${fmt(ratio)}: la partícula se queda fuera del núcleo`]),
            part("(e)", "La energía cinética de las partículas alfa se duplica. Determine por qué factor cambia r.", [
              fac("A1", "r se reduce a la mitad (factor 0,5)", 0.5),
            ], ["r ∝ 1 / Ek", "Si Ek se duplica, r pasa a ser 0,5 veces el valor anterior"], 2),
          ],
        };
      },
    },
  ],

  /* ============================================================ E.2 */
  E2: [
    {
      id: "x_fotocorriente", level: 2, label: "Fotones por segundo y corriente fotoeléctrica",
      keywords: ["fotocorriente", "fotones por segundo", "intensidad", "efecto fotoelectrico", "numero de fotones"],
      make: (r) => {
        const lam = pick(r, [250, 300, 350]), P = pick(r, [1.0, 2.0, 4.0]), N = pick(r, [50, 100, 200, 500]);
        const Eph = (H_PLANCK * C_LIGHT) / (lam * 1e-9), rate = (P * 1e-3) / Eph, el = rate / N, I = EV * el;
        return {
          stem: `Un haz de luz ultravioleta de longitud de onda ${lam} nm y potencia ${fmt(P, 2)} mW incide sobre una superficie de cesio (función de trabajo 2,1 eV). Sólo uno de cada ${N} fotones que llegan libera un electrón; el resto se absorbe sin emitir.`,
          data: "h = 6,63 × 10⁻³⁴ J s · c = 3,00 × 10⁸ m s⁻¹ · e = 1,6 × 10⁻¹⁹ C",
          parts: [
            part("(a)", "Calcule la energía de un fotón, en julios.", [valAny("A1", `E = hc / λ = ${fmt(Eph)} J`, [Eph])],
              [`E = hc / λ = 6,63×10⁻³⁴ × 3,00×10⁸ / (${lam}×10⁻⁹)`, `E = ${fmt(Eph)} J`], 2),
            part("(b)", "Determine el número de fotones que llegan a la superficie cada segundo.", [valAny("A1", `n = P / E = ${fmt(rate)} s⁻¹`, [rate])],
              [`n = P / E = ${fmt(P, 2)}×10⁻³ / ${fmt(Eph)}`, `n = ${fmt(rate)} s⁻¹`], 2),
            part("(c)", "Calcule la corriente fotoeléctrica, en μA.", [
              val("M1", `Electrones emitidos por segundo = ${fmt(el)}`, el, "electrones por segundo"),
              valAny("A1", `I = ${fmt(I * 1e6)} μA`, [I * 1e6, I]),
            ], [`Electrones por segundo = ${fmt(rate)} / ${N} = ${fmt(el)}`, `I = e × ${fmt(el)} = 1,6×10⁻¹⁹ × ${fmt(el)}`, `I = ${fmt(I)} A = ${fmt(I * 1e6)} μA`]),
            part("(d)", "La potencia del haz se triplica y la longitud de onda no cambia. Indique por qué factor se multiplica la corriente.", [
              valAny("A1", "La corriente se multiplica por 3", [3]),
            ], ["Con la misma λ, cada fotón tiene la misma energía; el número de fotones por segundo se triplica", "La corriente se multiplica por 3"], 2),
          ],
        };
      },
    },
    {
      id: "x_vsfrecuencia", level: 3, label: "Gráfica del potencial de frenado frente a la frecuencia",
      keywords: ["potencial de frenado", "constante de planck", "funcion de trabajo", "grafica", "frecuencia umbral"],
      make: (r) => {
        const f0 = pick(r, [4, 5, 6]), k = pick(r, [1.5, 2]);
        const s = (H_PLANCK / EV) * 1e14; // V per 10^14 Hz
        const V12 = s * (12 - f0);
        const phi = s * f0, phiJ = phi * EV, f0b = k * f0;
        const dots = [f0 + 2, f0 + 4, f0 + 6].map((x) => [x, s * (x - f0)] as [number, number]);
        const items: FigItem[] = [{
          t: "graph", x: 46, y: 20, w: 270, h: 170, xr: [0, 12], yr: [0, 3.5], xlabel: "f / 10¹⁴ Hz", ylabel: "Vs / V",
          xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], yticks: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], grid: true,
          series: [{ pts: [[f0, 0], [12, V12]] }, { pts: dots, dots: true }],
        }];
        const slope = H_PLANCK / EV;
        return {
          stem: "En un experimento con una fotocélula se mide el potencial de frenado Vs (la diferencia de potencial que detiene a los fotoelectrones más rápidos) para varias frecuencias f de la luz. La gráfica muestra los resultados.",
          data: "e = 1,6 × 10⁻¹⁹ C",
          fig: { w: 360, h: 236, alt: "Gráfica del potencial de frenado en volts frente a la frecuencia en 10¹⁴ Hz: una recta que corta el eje de frecuencias en la frecuencia umbral", items },
          parts: [
            part("(a)", "Determine la frecuencia umbral del metal.", [valT("A1", `f₀ = ${fmt(f0, 2)} × 10¹⁴ Hz`, [f0, f0 * 1e14], 0.06)],
              ["Vs = 0 donde la recta corta el eje horizontal", `f₀ = ${fmt(f0, 2)} × 10¹⁴ Hz`], 2),
            part("(b)", "Use la gráfica para determinar un valor de la constante de Planck.", [
              valT("M1", "pendiente = h / e", [s, slope], 0.06, "pendiente = h/e"),
              valT("A1", `h = ${fmt(H_PLANCK)} J s`, [H_PLANCK, 4.14e-15], 0.06),
            ], ["eVs = hf − Φ, así que Vs = (h/e) f − Φ/e: la pendiente es h/e", `pendiente = ΔVs / Δf = ${fmt(V12)} / ((12 − ${f0}) × 10¹⁴) = ${fmt(slope)} V s`, `h = pendiente × e = ${fmt(slope)} × 1,6×10⁻¹⁹ = ${fmt(H_PLANCK)} J s`]),
            part("(c)", "Calcule la función de trabajo del metal, en eV.", [valAny("A1", `Φ = h f₀ / e = ${fmt(phi)} eV`, [phi, phiJ])],
              [`Φ = h f₀ = ${fmt(H_PLANCK)} × ${f0}×10¹⁴ = ${fmt(phiJ)} J`, `Φ = ${fmt(phi)} eV`], 3),
            part("(d)", "La intensidad de la luz se duplica sin cambiar la frecuencia. Indique qué le ocurre a Vs y explique por qué.", [
              reason("Vs no cambia", "Vs igual", "no cambia", "igual", "misma", "constante", "sigue siendo", "no varia"),
              reason("Hay más fotones, pero cada fotón tiene la misma energía (depende sólo de f)", "energía de cada fotón, no del número", "energia de cada foton", "energia del foton", "cada foton", "mas fotones", "numero de fotones", "depende de la frecuencia"),
            ], ["Vs no cambia", "La intensidad aumenta el número de fotones por segundo, no la energía de cada fotón (hf); la Ek máxima depende sólo de f"], 3),
            part("(e)", `Un segundo metal tiene una función de trabajo ${fmt(k, 2)} veces mayor. Determine su frecuencia umbral.`, [
              valAny("A1", `f₀' = ${fmt(f0b, 2)} × 10¹⁴ Hz`, [f0b, f0b * 1e14]),
            ], ["Φ = h f₀, así que f₀ ∝ Φ", `f₀' = ${fmt(k, 2)} × ${f0} × 10¹⁴ = ${fmt(f0b, 2)} × 10¹⁴ Hz`], 2),
          ],
        };
      },
    },
  ],

  /* ============================================================ E.3 */
  E3: [
    {
      id: "x_semividagraf", level: 2, label: "Actividad frente al tiempo: semivida y número de núcleos",
      keywords: ["semivida", "actividad", "constante de desintegracion", "numero de nucleos", "grafica"],
      make: (r) => {
        const T = pick(r, [2, 4, 6, 8]), A0 = pick(r, [80, 160, 240]);
        const Ts = T * 3600, lam = LN2 / Ts, Nn = (A0 * 1e3) / lam, t2 = 2.5 * T, A2 = A0 * Math.pow(2, -2.5);
        const pts: [number, number][] = [];
        for (let i = 0; i <= 32; i++) { const x = (i * T) / 8; pts.push([x, Number((A0 * 2 ** (-x / T)).toFixed(3))]); }
        const items: FigItem[] = [{
          t: "graph", x: 52, y: 18, w: 270, h: 170, xr: [0, 4 * T], yr: [0, A0 * 1.05], xlabel: "t / h", ylabel: "A / kBq",
          xticks: Array.from({ length: 9 }, (_, i) => (i * T) / 2), yticks: [0, A0 / 8, A0 / 4, A0 / 2, A0], grid: true,
          series: [{ pts }],
        }];
        return {
          stem: "La gráfica muestra cómo disminuye con el tiempo la actividad A de una muestra de un radioisótopo usado en medicina.",
          fig: { w: 360, h: 236, alt: `Curva exponencial decreciente de la actividad, de ${A0} kBq en t = 0, frente al tiempo en horas`, items },
          parts: [
            part("(a)", "Determine la semivida del radioisótopo, en horas.", [valT("A1", `T½ = ${T} h`, [T], 0.06)],
              [`La actividad pasa de ${A0} a ${A0 / 2} kBq`, `T½ = ${T} h`], 2),
            part("(b)", "Calcule la constante de desintegración, en s⁻¹.", [
              val("M1", `T½ = ${fmt(Ts)} s`, Ts, "T½ en segundos"),
              val("A1", `λ = ln 2 / T½ = ${fmt(lam)} s⁻¹`, lam),
            ], [`T½ = ${T} × 3600 = ${fmt(Ts)} s`, `λ = ln 2 / T½ = 0,693 / ${fmt(Ts)}`, `λ = ${fmt(lam)} s⁻¹`]),
            part("(c)", "Determine el número de núcleos radiactivos presentes en t = 0.", [val("A1", `N = A / λ = ${fmt(Nn)}`, Nn)],
              [`A₀ = ${A0} kBq = ${A0}×10³ Bq`, `N = A₀ / λ = ${A0}×10³ / ${fmt(lam)}`, `N = ${fmt(Nn)}`]),
            part("(d)", `Calcule la actividad en t = ${fmt(t2, 2)} h.`, [val("A1", `A = ${fmt(A2)} kBq`, A2)],
              [`t = ${fmt(t2, 2)} h = 2,5 T½`, `A = A₀ (1/2)^2,5 = ${A0} × ${fmt(Math.pow(2, -2.5))}`, `A = ${fmt(A2)} kBq`]),
          ],
        };
      },
    },
    {
      id: "x_lnactividad", level: 3, label: "Gráfica de ln A frente a t: constante de desintegración y semivida",
      keywords: ["ln a", "grafica logaritmica", "constante de desintegracion", "semivida", "actividad"],
      make: (r) => {
        const lam = pick(r, [0.10, 0.15, 0.20, 0.25]), y0 = 7, t2 = 8;
        const T = LN2 / lam, A0 = Math.exp(y0), A2 = A0 * Math.exp(-lam * t2), y10 = y0 - 10 * lam;
        const items: FigItem[] = [{
          t: "graph", x: 52, y: 18, w: 270, h: 170, xr: [0, 12], yr: [3, 7.5], xlabel: "t / h", ylabel: "ln (A / Bq)",
          xticks: [0, 2, 4, 6, 8, 10, 12], yticks: [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5], grid: true,
          series: [{ pts: [[0, y0], [12, y0 - 12 * lam]] }, { pts: [[0, y0], [10, y10]], dots: true }],
        }];
        return {
          stem: "Se mide la actividad A de una muestra radiactiva a lo largo de varias horas. Se representa ln A (con A en Bq) frente al tiempo t y los puntos caen sobre una recta, como muestra la gráfica.",
          fig: { w: 360, h: 236, alt: `Gráfica de ln A frente al tiempo en horas: una recta decreciente que parte de ln A = ${y0} en t = 0`, items },
          parts: [
            part("(a)", "Determine la actividad inicial de la muestra.", [
              valT("M1", `ln A₀ = ${y0}`, [y0], 0.03, "ln A₀ = valor en t = 0"),
              valT("A1", `A₀ = e^${y0} = ${fmt(A0)} Bq`, [A0], 0.06),
            ], [`En t = 0, ln A₀ = ${y0}`, `A₀ = e^${y0} = ${fmt(A0)} Bq`]),
            part("(b)", "Determine la constante de desintegración, en h⁻¹.", [
              method("la pendiente de la recta es −λ", /pendiente|gradiente|Δ\s*ln|λ\s*=/i, lam, "pendiente = −λ"),
              valAny("A1", `λ = ${fmt(lam, 2)} h⁻¹`, [lam, lam / 3600]),
            ], ["ln A = ln A₀ − λt: la pendiente es −λ", `pendiente = (${y10} − ${y0}) / 10 = ${fmt(-lam, 2)} h⁻¹`, `λ = ${fmt(lam, 2)} h⁻¹`]),
            part("(c)", "Calcule la semivida, en horas.", [valAny("A1", `T½ = ln 2 / λ = ${fmt(T)} h`, [T, T * 3600])],
              [`T½ = ln 2 / λ = 0,693 / ${fmt(lam, 2)}`, `T½ = ${fmt(T)} h`], 2),
            part("(d)", "Explique por qué la representación de ln A frente a t es una recta.", [
              reason("A = A₀ e^(−λt), y al tomar logaritmos ln A = ln A₀ − λt, que es la ecuación de una recta", "ln A = ln A₀ − λt es lineal en t", "ln a0", "ln a =", "logaritmo", "ecuacion de una recta", "lineal", "e^(-"),
            ], ["La actividad decrece exponencialmente: A = A₀ e^(−λt)", "Al tomar logaritmos: ln A = ln A₀ − λt, que es de la forma y = b + mx (pendiente −λ)"], 3),
            part("(e)", `Calcule la actividad de la muestra en t = ${t2} h.`, [
              method("A = A₀ e^(−λt)", /e\^?\s*\(?\s*[−-]|exp|A\s*₀|A\s*0/i, lam * t2, "A = A₀e^(−λt)"),
              val("A1", `A = ${fmt(A2)} Bq`, A2),
            ], [`A = A₀ e^(−λt) = ${fmt(A0)} × e^(−${fmt(lam, 2)} × ${t2})`, `A = ${fmt(A2)} Bq`]),
          ],
        };
      },
    },
  ],

  /* ============================================================ E.4 */
  E4: [
    {
      id: "x_enlacenuc", level: 2, label: "Energía de enlace por nucleón a partir de la masa del núcleo",
      keywords: ["energia de enlace", "por nucleon", "defecto de masa", "masa del nucleo", "estabilidad"],
      make: (r) => {
        const M = pick(r, [{ s: "He", A: 4, Z: 2, m: 4.00151, n: "helio-4" }, { s: "C", A: 12, Z: 6, m: 11.99671, n: "carbono-12" }, { s: "O", A: 16, Z: 8, m: 15.99052, n: "oxígeno-16" }]);
        const mp = 1.00728, mn = 1.00867, N = M.A - M.Z;
        const sum = M.Z * mp + N * mn, dm = sum - M.m, Eb = dm * 931.5, perN = Eb / M.A;
        return {
          stem: `El núcleo de ${M.n} (${nu(M.A, M.Z, M.s)}) tiene una masa de ${M.m.toFixed(5)} u.`,
          data: "masa del protón = 1,00728 u · masa del neutrón = 1,00867 u · 1 u = 931,5 MeV c⁻²",
          parts: [
            part("(a)", "Calcule el defecto de masa del núcleo, en u.", [
              val("M1", `Masa de los nucleones por separado = ${fmt(sum, 5)} u`, sum, "masa de protones y neutrones"),
              val("A1", `Δm = ${fmt(dm)} u`, dm),
            ], [`${M.Z} protones y ${N} neutrones`, `Σ m = ${M.Z} × 1,00728 + ${N} × 1,00867 = ${sum.toFixed(5)} u`, `Δm = ${sum.toFixed(5)} − ${M.m.toFixed(5)} = ${fmt(dm)} u`]),
            part("(b)", "Determine la energía de enlace del núcleo, en MeV.", [val("A1", `Eb = ${fmt(Eb)} MeV`, Eb)],
              [`Eb = Δm × 931,5 = ${fmt(dm)} × 931,5`, `Eb = ${fmt(Eb)} MeV`], 2),
            part("(c)", "Calcule la energía de enlace por nucleón.", [val("A1", `Eb / A = ${fmt(perN)} MeV`, perN)],
              [`Eb / A = ${fmt(Eb)} / ${M.A}`, `Eb / A = ${fmt(perN)} MeV por nucleón`], 2),
            part("(d)", "El hierro-56 tiene una energía de enlace de 8,8 MeV por nucleón. Indique cuál de los dos núcleos es más estable y por qué.", [
              reason("El hierro-56 es más estable: tiene mayor energía de enlace por nucleón", "Fe-56, mayor Eb/A", "hierro", "fe-56", "fe 56", "mayor energia de enlace", "mayor energia por nucleon", "mas estable el"),
            ], [`${fmt(perN)} < 8,8 MeV por nucleón`, "El hierro-56 es más estable: a mayor energía de enlace por nucleón, más estable es el núcleo"], 3),
          ],
        };
      },
    },
    {
      id: "x_fisioncentral", level: 3, label: "Fisión del uranio: curva de enlace, potencia de una central y combustible",
      keywords: ["fision", "central nuclear", "curva de energia de enlace", "rendimiento", "masa de uranio", "reaccion en cadena"],
      make: (r) => {
        const Pe = pick(r, [600, 900, 1200]), eta = pick(r, [0.30, 0.33, 0.36]);
        const bU = 7.6, bBa = 8.4, bKr = 8.8;
        const Q = 144 * bBa + 89 * bKr - 235 * bU, tot = 144 * bBa + 89 * bKr;
        const Ef = 200 * MEV, Pth = Pe / eta, rate = (Pth * 1e6) / Ef, perDay = rate * 86400, mass = perDay * 235 * U_AMU;
        const px = (A: number) => 46 + (A / 250) * 270, py = (y: number) => 18 + (170 * (9 - y)) / 2;
        const key: [number, number][] = [[30, 8.4], [56, 8.8], [89, 8.8], [144, 8.4], [190, 8.0], [235, 7.6], [250, 7.5]];
        const curve: [number, number][] = [];
        for (let j = 0; j < key.length - 1; j++) {
          const P = [key[Math.max(0, j - 1)], key[j], key[j + 1], key[Math.min(key.length - 1, j + 2)]];
          for (let u = 0; u < 1; u += 0.1) {
            const c = (i: 0 | 1) => 0.5 * (2 * P[1][i] + (-P[0][i] + P[2][i]) * u + (2 * P[0][i] - 5 * P[1][i] + 4 * P[2][i] - P[3][i]) * u * u + (-P[0][i] + 3 * P[1][i] - 3 * P[2][i] + P[3][i]) * u ** 3);
            curve.push([Number(c(0).toFixed(2)), Number(c(1).toFixed(3))]);
          }
        }
        curve.push(key[key.length - 1]);
        const items: FigItem[] = [{
          t: "graph", x: 46, y: 18, w: 270, h: 170, xr: [0, 250], yr: [7, 9], xlabel: "número de nucleones A", ylabel: "Eb / A (MeV)",
          xticks: [0, 50, 100, 150, 200, 250], yticks: [7, 7.2, 7.4, 7.6, 7.8, 8, 8.2, 8.4, 8.6, 8.8, 9], grid: true,
          series: [{ pts: curve }],
        }];
        for (const [A, y, s, dx, dy] of [[235, bU, "U-235", 8, -8], [144, bBa, "Ba-144", 8, -8], [89, bKr, "Kr-89", 0, -9]] as [number, number, string, number, number][]) {
          items.push({ t: "circle", cx: px(A), cy: py(y), r: 3.5, fill: "dark" });
          items.push({ t: "text", x: px(A) + dx, y: py(y) + dy, s, size: 11, anchor: A === 89 ? "middle" : "start" });
        }
        return {
          stem: `En una central nuclear, un núcleo de uranio-235 absorbe un neutrón y se fisiona: n + ${nu(235, 92, "U")} → ${nu(144, 56, "Ba")} + ${nu(89, 36, "Kr")} + 3 n. La gráfica muestra la energía de enlace por nucleón Eb / A en función del número de nucleones.`,
          data: `1 MeV = 1,6 × 10⁻¹³ J · 1 u = 1,661 × 10⁻²⁷ kg · masa de un núcleo de U-235 = 235 u · la central tiene una potencia eléctrica de ${Pe} MW y un rendimiento del ${fmt(eta * 100, 2)} %`,
          fig: { w: 360, h: 236, alt: "Curva de energía de enlace por nucleón frente al número de nucleones, con máximo cerca de A = 60 y los puntos del uranio-235, el bario-144 y el kriptón-89", items },
          parts: [
            part("(a)", "Determine, a partir de la gráfica, la energía liberada en una fisión, en MeV.", [
              valT("M1", `Eb total de los productos = ${fmt(tot)} MeV`, [tot, tot - 235 * bU], 0.04, "Eb total de los productos"),
              valT("A1", `Q = ${fmt(Q)} MeV`, [Q], 0.12),
            ], [`Eb(U-235) = 235 × ${fmt(bU, 2)} = ${fmt(235 * bU)} MeV`, `Eb(Ba) + Eb(Kr) = 144 × ${fmt(bBa, 2)} + 89 × ${fmt(bKr, 2)} = ${fmt(tot)} MeV`, `Q = ${fmt(tot)} − ${fmt(235 * bU)} = ${fmt(Q)} MeV`]),
            part("(b)", "Explique, usando la gráfica, por qué se libera energía en esta fisión.", [
              reason("Los productos tienen mayor energía de enlace por nucleón que el uranio", "Eb/A mayor en los productos", "mayor energia de enlace", "mayor eb", "mas estables", "mas ligados", "mas fuertemente", "mayor por nucleon"),
              reason("La masa total disminuye: la diferencia de masa se libera como energía (E = Δmc²)", "defecto de masa → energía", "menos masa", "Δm", "masa de los productos", "disminuye la masa", "menor masa", "delta m", "e = mc", "mc2", "mc²", "defecto de masa"),
            ], ["Los productos están en una zona de la curva con mayor Eb / A: están más fuertemente ligados", "Los productos tienen menos masa total que el núcleo original; esa diferencia de masa se libera como energía (E = Δm c²)"], 3),
            part("(c)", "Calcule la potencia térmica del reactor, en MW.", [valAny("A1", `P térmica = ${fmt(Pth)} MW`, [Pth, Pth * 1e6])],
              ["rendimiento = P eléctrica / P térmica", `P térmica = ${Pe} / ${fmt(eta, 2)} = ${fmt(Pth)} MW`], 3),
            part("(d)", "Tome 200 MeV como la energía liberada por fisión. Determine el número de fisiones por segundo.", [
              method("N = P / E", /P\s*\/\s*E|\/\s*3[.,]2|\/\s*\(?200|energ[ií]a\s*por\s*fisi/i, Pth * 1e6, "N = P/E"),
              val("A1", `N = ${fmt(rate)} s⁻¹`, rate),
            ], [`E por fisión = 200 × 1,6×10⁻¹³ = ${fmt(Ef)} J`, `N = P / E = ${fmt(Pth * 1e6)} / ${fmt(Ef)}`, `N = ${fmt(rate)} s⁻¹`]),
            part("(e)", "Estime la masa de uranio-235 que se fisiona cada día.", [
              val("M1", `Fisiones por día = ${fmt(perDay)}`, perDay, "fisiones por día"),
              val("A1", `m = ${fmt(mass)} kg`, mass),
            ], [`Fisiones por día = ${fmt(rate)} × 86 400 = ${fmt(perDay)}`, `m = ${fmt(perDay)} × 235 × 1,661×10⁻²⁷`, `m = ${fmt(mass)} kg`]),
          ],
        };
      },
    },
  ],

  /* ============================================================ E.5 */
  E5: [
    {
      id: "x_relativo", level: 2, label: "Estrella comparada con el Sol: luminosidad, Wien y brillo",
      keywords: ["luminosidad", "stefan boltzmann", "ley de wien", "brillo aparente", "proporcion"],
      make: (r) => {
        const [Rr, Tr] = pick(r, [[3, 0.5], [2, 2], [5, 0.5], [3, 2], [10, 0.5], [4, 0.5]] as [number, number][]);
        const f = pick(r, [2, 3, 4]);
        const Lr = Rr * Rr * Tr ** 4, lr = 1 / Tr, br = 1 / (f * f);
        return {
          stem: `Una estrella tiene un radio de ${Rr} R☉ y una temperatura superficial de ${fmt(Tr * 5800, 3)} K. La temperatura superficial del Sol es 5800 K.`,
          data: "L = 4πR²σT⁴ · λ máx T = constante (ley de Wien) · b = L / 4πd²",
          parts: [
            part("(a)", "Determine la luminosidad de la estrella en unidades de la luminosidad del Sol (L☉).", [
              method("L ∝ R²T⁴", /R\^?2|R²|T\^?4|T⁴|σ|4\s*π/i, Lr, "L ∝ R²T⁴"),
              val("A1", `L / L☉ = ${fmt(Lr)}`, Lr),
            ], ["L = 4π R² σ T⁴, así que L / L☉ = (R / R☉)² (T / T☉)⁴", `L / L☉ = ${Rr}² × ${fmt(Tr, 2)}⁴ = ${fmt(Lr)}`]),
            part("(b)", "Calcule la razón entre la longitud de onda de máxima emisión de la estrella y la del Sol.", [
              val("A1", `λ máx / λ máx☉ = ${fmt(lr, 2)}`, lr),
            ], ["λ máx ∝ 1 / T", `λ máx / λ máx☉ = T☉ / T = 1 / ${fmt(Tr, 2)} = ${fmt(lr, 2)}`], 2),
            part("(c)", `Si la estrella se alejara hasta una distancia ${f} veces mayor, ¿qué fracción de su brillo aparente actual tendría?`, [
              method("b ∝ 1 / d²", /d\^?2|d²|cuadrado|1\s*\/\s*d|inverso/i, f * f, "b ∝ 1/d²"),
              fac("A1", `b' = b / ${f * f}`, br),
            ], ["b = L / 4πd²: b es proporcional a 1 / d²", `b' / b = 1 / ${f}² = ${fmt(br)}`]),
          ],
        };
      },
    },
    {
      id: "x_estrellacomp", level: 3, label: "Una estrella: paralaje, luminosidad, espectro y radio",
      keywords: ["paralaje", "luminosidad", "ley de wien", "stefan boltzmann", "radio de una estrella", "brillo y distancia"],
      make: (r) => {
        const [lm, k] = pick(r, [[400, 30], [600, 20], [800, 100], [1000, 300]] as [number, number][]);
        const p = pick(r, [0.20, 0.10, 0.050]), f = pick(r, [2, 3, 4]);
        const dpc = 1 / p, dm = dpc * PC;
        const bv = Number(((k * LSUN) / (4 * Math.PI * dm * dm)).toPrecision(2));
        const L = 4 * Math.PI * dm * dm * bv, T = WIEN / (lm * 1e-9), R = Math.sqrt(L / (4 * Math.PI * SIGMA * T ** 4)), br = 1 / (f * f);
        const items: FigItem[] = [{
          t: "graph", x: 46, y: 18, w: 280, h: 160, xr: [0, 1600], yr: [0, 1.1], xlabel: "λ / nm", ylabel: "intensidad relativa",
          xticks: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600], yticks: [], grid: true, series: [{ pts: spectrum(lm) }],
        }];
        return {
          stem: `Una estrella tiene un ángulo de paralaje de ${fmt(p, 2)} segundos de arco y un brillo aparente de ${fmt(bv, 2)} W m⁻². Su espectro, que se comporta como el de un cuerpo negro, se muestra en la gráfica.`,
          data: "1 pc = 3,09 × 10¹⁶ m · σ = 5,67 × 10⁻⁸ W m⁻² K⁻⁴ · constante de Wien = 2,90 × 10⁻³ m K",
          fig: { w: 370, h: 226, alt: `Espectro de cuerpo negro de la estrella: la intensidad relativa tiene un máximo en ${lm} nm`, items },
          parts: [
            part("(a)", "Calcule la distancia a la estrella, en metros.", [
              valAny("M1", `d = 1 / p = ${fmt(dpc, 3)} pc`, [dpc], "d = 1/p en pc"),
              valAny("A1", `d = ${fmt(dm)} m`, [dm]),
            ], [`d = 1 / p = 1 / ${fmt(p, 2)} = ${fmt(dpc, 3)} pc`, `d = ${fmt(dpc, 3)} × 3,09×10¹⁶ = ${fmt(dm)} m`]),
            part("(b)", `Muestre que la luminosidad de la estrella es aproximadamente ${f2(L)} W.`, [
              method("L = 4πd²b", /4\s*π\s*d|b\s*[×x*]\s*4|4\s*π/i, L, "L = 4πd²b"),
              val("A1", `L = ${fmt(L)} W`, L),
            ], ["b = L / 4πd²", `L = 4π d² b = 4π × (${fmt(dm)})² × ${fmt(bv, 2)}`, `L = ${fmt(L)} W`]),
            part("(c)", "Determine, a partir de la gráfica, la temperatura de la superficie de la estrella.", [
              valT("M1", `λ máx = ${lm} nm`, [lm, lm * 1e-9], 0.06, "lectura de λ máx"),
              valT("A1", `T = ${fmt(T)} K`, [T], 0.06),
            ], [`El máximo está en λ máx = ${lm} nm = ${fmt(lm * 1e-9)} m`, `T = 2,90×10⁻³ / λ máx = 2,90×10⁻³ / ${fmt(lm * 1e-9)}`, `T = ${fmt(T)} K`]),
            part("(d)", "Calcule el radio de la estrella.", [
              method("L = 4πR²σT⁴", /4\s*π\s*r|σ\s*a\s*t|r\^?2|r²|σ\s*t/i, L, "L = 4πR²σT⁴"),
              valT("A1", `R = ${fmt(R)} m`, [R], 0.12),
            ], ["L = σ A T⁴ = 4π R² σ T⁴", `R = √(L / 4πσT⁴) = √(${fmt(L)} / (4π × 5,67×10⁻⁸ × ${fmt(T)}⁴))`, `R = ${fmt(R)} m = ${fmt(R / RSUN)} R☉`]),
            part("(e)", `Un observador en otro planeta está a una distancia ${f} veces mayor que la de la Tierra. ¿Qué fracción del brillo medido en la Tierra mide?`, [
              fac("A1", `b' = b / ${f * f}`, br),
            ], ["b ∝ 1 / d²", `b' / b = 1 / ${f}² = ${fmt(br)}`], 2),
          ],
        };
      },
    },
  ],
};
