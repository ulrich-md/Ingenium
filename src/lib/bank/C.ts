/**
 * Unit C · Comportamiento ondulatorio. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { C_LIGHT, f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Fig, type FigItem, type FormulaGroup, type Topic } from "./kit.ts";

const PI = Math.PI;
const rad = (d: number) => (d * PI) / 180;
const deg = (r: number) => (r * 180) / PI;
const q4 = (x: number) => Math.round(x * 1e4) / 1e4;
const q2 = (x: number) => Math.round(x * 100) / 100;
/** n + 1 points of y = f(x) between a and b (for graphs). */
const curve = (f: (x: number) => number, a: number, b: number, n = 120): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const x = a + ((b - a) * i) / n; return [q4(x), q4(f(x))] as [number, number]; });
/** Flat x,y list of a curve drawn in figure units: x from x0 to x0 + len, y = y0 − amp·f(u), u from 0 to 1. */
const shape = (x0: number, y0: number, len: number, amp: number, f: (u: number) => number, n = 100): number[] =>
  Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [q2(x0 + len * u), q2(y0 - amp * f(u))]; }).flat();
const tk = (x: number) => Math.round(x * 1000) / 1000;
const dim = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "both", w: 1.1 });

/** Wavefronts of a source that moves to the right (compressed ahead, spread behind), observers A (ahead) and B (behind). */
function dopplerFig(): Fig {
  const items: FigItem[] = [];
  for (let j = 1; j <= 4; j++) items.push({ t: "circle", cx: 190 - 7 * j, cy: 100, r: 22 * j, sw: 1.1 });
  items.push(
    { t: "circle", cx: 190, cy: 100, r: 4, fill: "dark" },
    { t: "line", x1: 198, y1: 100, x2: 232, y2: 100, arrow: "end", w: 2 },
    { t: "text", x: 214, y: 92, s: "v" },
    { t: "dot", x: 338, y: 100, r: 4 }, { t: "text", x: 338, y: 86, s: "A" },
    { t: "dot", x: 42, y: 100, r: 4 }, { t: "text", x: 42, y: 86, s: "B" },
  );
  return { w: 380, h: 200, alt: "Frentes de onda de una fuente que se mueve hacia la derecha: muy juntos delante (observador A) y más separados detrás (observador B)", items };
}

export const topics: Topic[] = [
  {
    id: "C1", unit: "C", name: "C.1 Movimiento armónico simple",
    concepts: [
      {
        id: "masa_resorte", label: "Sistema masa–resorte", keywords: ["masa resorte", "resorte", "hooke", "periodo"],
        make: (r) => {
          const m = pick(r, [0.20, 0.40, 0.50, 0.80]), k = pick(r, [20, 32, 50, 80]), A = pick(r, [3, 4, 5, 6]);
          const T = 2 * PI * Math.sqrt(m / k), f = 1 / T, T2 = 2 * T;
          const eq = 170, cx = eq + 7 * A;
          return {
            fig: {
              w: 360, h: 160, alt: `Bloque unido a un resorte horizontal, desplazado ${A} cm de la posición de equilibrio`,
              items: [
                { t: "ground", x1: 40, y1: 35, x2: 40, y2: 120, side: -1 },
                { t: "ground", x1: 40, y1: 120, x2: 340, y2: 120, side: -1 },
                { t: "spring", x1: 40, y1: 100, x2: cx - 23, y2: 100, coils: 9 },
                { t: "rect", x: cx - 23, y: 80, w: 46, h: 40, fill: "light" },
                { t: "text", x: cx, y: 105, s: "m" },
                { t: "text", x: 100, y: 80, s: "k" },
                { t: "line", x1: eq, y1: 52, x2: eq, y2: 135, dash: true, w: 1 },
                { t: "line", x1: cx, y1: 52, x2: cx, y2: 80, dash: true, w: 1 },
                dim(eq, 60, cx, 60),
                { t: "text", x: (eq + cx) / 2 + 22, y: 46, s: `A = ${A} cm` },
                { t: "text", x: eq, y: 150, s: "equilibrio" },
              ],
            },
            stem: `Un bloque de ${f2(m)} kg unido a un resorte horizontal de constante elástica k = ${k} N m⁻¹ oscila sobre una mesa sin rozamiento. Se suelta desde el reposo a ${A} cm de la posición de equilibrio, como muestra la figura.`,
            parts: [
              part("(a)", "Calcule el periodo de oscilación del bloque.", [
                method("Usa T = 2π√(m / k)", /2\s*π|2π|2\s*pi|√|sqrt|m\s*\/\s*k/i, 2 * PI, "T = 2π√(m/k)"),
                val("A1", `T = ${fmt(T)} s`, T),
              ], ["T = 2π √(m / k)", `T = 2π √(${f2(m)} / ${k})`, `T = ${fmt(T)} s`]),
              part("(b)", "Determine la frecuencia de oscilación.", [val("A1", `f = 1 / T = ${fmt(f)} Hz`, f)],
                [`f = 1 / T = 1 / ${fmt(T)}`, `f = ${fmt(f)} Hz`]),
              part("(c)", "Se sustituye el bloque por otro de masa cuatro veces mayor. Determine el nuevo periodo.", [val("A1", `T' = 2T = ${fmt(T2)} s`, T2)],
                ["T ∝ √m: si m se multiplica por 4, T se multiplica por 2", `T' = 2 × ${fmt(T)} = ${fmt(T2)} s`]),
            ],
          };
        },
      },
      {
        id: "pendulo", label: "Péndulo simple", keywords: ["pendulo", "pendulo simple", "longitud del hilo", "oscilacion"],
        make: (r) => {
          const L = pick(r, [0.50, 0.80, 1.0, 1.5, 2.0]);
          const T = 2 * PI * Math.sqrt(L / g), Tm = 2 * PI * Math.sqrt(L / 1.62);
          const th = 20, Lp = 130, px = 150, py = 26;
          const bx = px + Lp * Math.sin(rad(th)), by = py + Lp * Math.cos(rad(th));
          return {
            fig: {
              w: 300, h: 190, alt: `Péndulo simple de longitud ${f2(L)} m separado un pequeño ángulo de la vertical`,
              items: [
                { t: "ground", x1: 100, y1: py, x2: 200, y2: py, side: -1 },
                { t: "line", x1: px, y1: py, x2: px, y2: 178, dash: true, w: 1 },
                { t: "line", x1: px, y1: py, x2: bx, y2: by },
                { t: "circle", cx: q2(bx + 8 * Math.sin(rad(th))), cy: q2(by + 8 * Math.cos(rad(th))), r: 9, fill: "dark" },
                { t: "angle", x: px, y: py, r: 46, a1: 270, a2: 270 + th, label: "θ" },
                { t: "text", x: 191, y: 84, s: `L = ${f2(L)} m`, anchor: "start" },
              ],
            },
            stem: `Un péndulo simple de longitud ${f2(L)} m oscila con pequeña amplitud angular θ.`,
            data: "g = 9,8 m s⁻² en la Tierra · g = 1,62 m s⁻² en la Luna",
            parts: [
              part("(a)", "Calcule el periodo del péndulo en la Tierra.", [
                method("Usa T = 2π√(L / g)", /2\s*π|2π|2\s*pi|√|sqrt|L\s*\/\s*g/i, 2 * PI, "T = 2π√(L/g)"),
                val("A1", `T = ${fmt(T)} s`, T),
              ], ["T = 2π √(L / g)", `T = 2π √(${f2(L)} / 9,8)`, `T = ${fmt(T)} s`]),
              part("(b)", "Calcule el periodo del mismo péndulo en la Luna.", [val("A1", `T = ${fmt(Tm)} s`, Tm)],
                [`T = 2π √(${f2(L)} / 1,62)`, `T = ${fmt(Tm)} s`]),
              part("(c)", "Indique, justificando, si el periodo cambiaría al sustituir la lenteja por otra de mayor masa.", [
                reason("El periodo no depende de la masa (en T = 2π√(L/g) no aparece m)", "no depende de la masa", "no cambia", "no depende", "independiente", "igual", "mismo periodo", "no aparece"),
              ], ["No cambia: T = 2π√(L / g) no depende de la masa, es independiente de m."]),
            ],
          };
        },
      },
      {
        id: "grafica_xt", label: "Gráfica desplazamiento–tiempo del MAS", keywords: ["grafica", "desplazamiento tiempo", "amplitud", "fase"],
        make: (r) => {
          const A = pick(r, [2, 3, 4, 5]), T = pick(r, [0.4, 0.8, 1.2, 1.6, 2.0]), kind = pick(r, ["sin", "cos"] as const), m = pick(r, [0.10, 0.20, 0.50]);
          const fn = kind === "sin" ? (t: number) => A * Math.sin((2 * PI * t) / T) : (t: number) => A * Math.cos((2 * PI * t) / T);
          const w = (2 * PI) / T, vmax = w * A, Et = 0.5 * m * (vmax / 100) ** 2;
          const yt: number[] = [];
          for (let y = -A; y <= A; y++) if (y !== 0) yt.push(y);
          return {
            fig: {
              w: 370, h: 200, alt: `Gráfica del desplazamiento de un oscilador en función del tiempo, ${kind === "sin" ? "con x = 0 en t = 0" : "con desplazamiento máximo en t = 0"}`,
              items: [{
                t: "graph", x: 55, y: 28, w: 290, h: 150, xr: [0, 2 * T], yr: [-A * 1.2, A * 1.2],
                xlabel: "t / s", ylabel: "x / cm", xticks: [T / 2, T, 1.5 * T, 2 * T].map(tk), yticks: yt, grid: true,
                series: [{ pts: curve(fn, 0, 2 * T, 160) }],
              }],
            },
            stem: `La gráfica muestra cómo varía con el tiempo el desplazamiento x de un cuerpo de ${f2(m)} kg que describe un movimiento armónico simple.`,
            parts: [
              part("(a)", "Determine la amplitud del movimiento.", [valAny("A1", `A = ${A} cm`, [A, A / 100])], [`Se lee el desplazamiento máximo: A = ${A} cm`]),
              part("(b)", "Determine el periodo del movimiento.", [val("A1", `T = ${fmt(T)} s`, T)],
                [`Una oscilación completa dura T = ${fmt(T)} s`]),
              part("(c)", "Calcule la rapidez máxima del cuerpo.", [
                method("v máx = ωA, con ω = 2π / T", /ω|omega|2\s*π|2π|A\s*[·×*]\s*ω/i, w, "v máx = ωA"),
                valAny("A1", `v máx = ${fmt(vmax)} cm s⁻¹ = ${fmt(vmax / 100)} m s⁻¹`, [vmax, vmax / 100]),
              ], ["ω = 2π / T", `ω = 2π / ${fmt(T)} = ${fmt(w)} rad s⁻¹`, `v máx = ω A = ${fmt(w)} × ${A}`, `v máx = ${fmt(vmax)} cm s⁻¹ = ${fmt(vmax / 100)} m s⁻¹`]),
              part("(d)", "Calcule la energía total del oscilador.", [
                method("E = ½mv²máx (toda la energía es cinética en el equilibrio)", /½|1\/2|0\.5|m\s*v|k\s*A/i, vmax / 100, "E = ½mv²"),
                val("A1", `E = ${fmt(Et)} J`, Et),
              ], ["En el equilibrio toda la energía es cinética: E = ½ m v²máx", `E = 0,5 × ${f2(m)} × (${fmt(vmax / 100)})²`, `E = ${fmt(Et)} J`]),
            ],
          };
        },
      },
      {
        id: "omega_a_vmax", label: "Aceleración y velocidad máxima en el MAS", keywords: ["omega", "a = -w2x", "velocidad maxima", "aceleracion", "mas"],
        make: (r) => {
          const f = pick(r, [1.5, 2.0, 2.5, 4.0]), A = pick(r, [4, 5, 6, 8]), x = pick(r, [2, 3]);
          const w = 2 * PI * f, a = w * w * (x / 100), vmax = w * (A / 100);
          return {
            stem: `Una partícula describe un movimiento armónico simple de frecuencia ${f2(f)} Hz y amplitud ${A} cm.`,
            parts: [
              part("(a)", "Calcule la frecuencia angular ω de la oscilación.", [
                method("ω = 2πf", /2\s*π|2π|2\s*pi|ω\s*=/i, 2 * PI, "ω = 2πf"),
                val("A1", `ω = ${fmt(w)} rad s⁻¹`, w),
              ], ["ω = 2π f", `ω = 2π × ${f2(f)}`, `ω = ${fmt(w)} rad s⁻¹`]),
              part("(b)", `Determine la magnitud de la aceleración de la partícula cuando su desplazamiento es de ${x} cm.`, [
                method("a = −ω²x", /ω\s*\^?\s*2|ω²|omega|a\s*=/i, w * w, "a = −ω²x"),
                valAny("A1", `a = ${fmt(a)} m s⁻²`, [a, a * 100]),
              ], ["a = −ω² x", `|a| = ${fmt(w)}² × ${fmt(x / 100)}`, `|a| = ${fmt(a)} m s⁻²`]),
              part("(c)", "Calcule la rapidez máxima de la partícula.", [valAny("A1", `v máx = ωA = ${fmt(vmax)} m s⁻¹`, [vmax, vmax * 100])],
                ["v máx = ω A", `v máx = ${fmt(w)} × ${fmt(A / 100)} = ${fmt(vmax)} m s⁻¹`]),
              part("(d)", "Indique la dirección de la aceleración en el instante en que el desplazamiento es máximo.", [
                reason("La aceleración apunta hacia la posición de equilibrio (opuesta al desplazamiento)", "hacia el equilibrio", "equilibrio", "centro", "opuesta", "sentido contrario", "origen"),
              ], ["a = −ω² x: es opuesta al desplazamiento, dirigida hacia la posición de equilibrio."]),
            ],
          };
        },
      },
      {
        id: "energia_mas", label: "Energía en el movimiento armónico simple", keywords: ["energia", "energia potencial elastica", "energia cinetica", "mas"],
        make: (r) => {
          const [k, A] = pick(r, [[100, 0.10], [200, 0.10], [50, 0.20], [40, 0.20], [250, 0.08], [80, 0.05]] as const);
          const m = pick(r, [0.20, 0.50, 1.0, 2.0]);
          const E = 0.5 * k * A * A, vmax = Math.sqrt((2 * E) / m);
          return {
            fig: {
              w: 360, h: 210, alt: "Gráfica de la energía potencial elástica de un oscilador en función del desplazamiento: una parábola",
              items: [{
                t: "graph", x: 60, y: 30, w: 270, h: 150, xr: [-A * 1.2, A * 1.2], yr: [0, E * 1.25],
                xlabel: "x / m", ylabel: "Ep / J", xticks: [-A, A], yticks: [E / 2, E].map(tk), grid: true,
                series: [{ pts: curve((x) => 0.5 * k * x * x, -A, A, 80) }],
              }],
            },
            stem: `Un bloque de ${f2(m)} kg unido a un resorte oscila sin rozamiento con amplitud ${f2(A)} m. La gráfica muestra la energía potencial elástica Ep del sistema en función del desplazamiento x.`,
            parts: [
              part("(a)", "Determine, a partir de la gráfica, la energía total del oscilador.", [val("A1", `E = ${fmt(E)} J (Ep máxima en x = ±A)`, E)],
                [`En x = ±A toda la energía es potencial: E = ${fmt(E)} J`]),
              part("(b)", "Calcule la constante elástica del resorte.", [
                method("E = ½kA²", /½|1\/2|0\.5|k\s*A|2\s*E/i, A * A, "E = ½kA²"),
                val("A1", `k = ${fmt(k)} N m⁻¹`, k),
              ], ["E = ½ k A²  →  k = 2E / A²", `k = 2 × ${fmt(E)} / ${f2(A)}²`, `k = ${fmt(k)} N m⁻¹`]),
              part("(c)", "Calcule la rapidez máxima del bloque.", [
                method("Toda la energía es cinética: E = ½mv²", /½|1\/2|0\.5|m\s*v|2\s*E/i, 2 * E / m, "E = ½mv²"),
                val("A1", `v máx = ${fmt(vmax)} m s⁻¹`, vmax),
              ], ["En x = 0 toda la energía es cinética: ½ m v² = E", `v = √(2E / m) = √(2 × ${fmt(E)} / ${f2(m)})`, `v máx = ${fmt(vmax)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "pendulo_g", label: "Medir g con un péndulo (gráfica T²–L)", keywords: ["medir g", "t2", "gradiente", "pendiente", "experimento"],
        make: (r) => {
          const gv = pick(r, [9.6, 9.7, 9.8, 9.9]), Lq = pick(r, [0.30, 0.50, 0.70, 0.90]);
          const slope = (4 * PI * PI) / gv, Tq = Math.sqrt(slope * Lq);
          const Ls = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2];
          const dots = Ls.map((L, i) => [L, q4(slope * L * (1 + (i % 2 ? 0.012 : -0.012)))] as [number, number]);
          return {
            fig: {
              w: 370, h: 210, alt: "Gráfica del cuadrado del periodo en función de la longitud de un péndulo: una recta que pasa por el origen",
              items: [{
                t: "graph", x: 55, y: 30, w: 280, h: 150, xr: [0, 1.25], yr: [0, 5.2],
                xlabel: "L / m", ylabel: "T² / s²", xticks: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], yticks: [1, 2, 3, 4, 5], grid: true,
                series: [{ pts: [[0, 0], [1.25, q4(slope * 1.25)]] }, { pts: dots, dots: true }],
              }],
            },
            stem: "Un grupo de estudiantes mide el periodo T de un péndulo simple para distintas longitudes L. Representan T² frente a L y trazan la recta de mejor ajuste, que pasa por el origen.",
            parts: [
              part("(a)", "Determine el gradiente de la recta.", [val("A1", `gradiente ≈ ${fmt(slope)} s² m⁻¹`, slope)],
                [`Con la recta: gradiente = ΔT² / ΔL ≈ ${fmt(slope * 1.0)} / 1,0`, `gradiente = ${fmt(slope)} s² m⁻¹`]),
              part("(b)", "Use el gradiente para determinar el valor de g.", [
                method("T² = (4π² / g) L, así que gradiente = 4π² / g", /4\s*π|4π|π\s*\^?\s*2|π²|gradiente|pendiente/i, 4 * PI * PI, "gradiente = 4π²/g"),
                val("A1", `g = ${fmt(gv)} m s⁻²`, gv),
              ], ["T² = (4π² / g) L, el gradiente es 4π² / g", `g = 4π² / gradiente = 39,5 / ${fmt(slope)}`, `g = ${fmt(gv)} m s⁻²`]),
              part("(c)", "Explique por qué la representación de T² frente a L es una recta que pasa por el origen.", [
                reason("T² es directamente proporcional a L (T² = 4π²L / g)", "T² proporcional a L", "proporcional", "lineal", "recta", "pasa por el origen", "relacion directa"),
              ], ["T² = (4π² / g) L: T² es directamente proporcional a L, por eso la gráfica es una recta que pasa por el origen."]),
              part("(d)", `Use la gráfica para predecir el periodo de un péndulo de longitud ${f2(Lq)} m.`, [
                method("T² = gradiente × L", /T\s*\^?\s*2|T²|gradiente|pendiente|√|sqrt/i, slope * Lq, "T² = gradiente × L"),
                val("A1", `T = ${fmt(Tq)} s`, Tq),
              ], [`T² = gradiente × L = ${fmt(slope)} × ${f2(Lq)} = ${fmt(slope * Lq)} s²`, `T = ${fmt(Tq)} s`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "C2", unit: "C", name: "C.2 Modelo de onda",
    concepts: [
      {
        id: "v_flambda", label: "Rapidez, frecuencia y longitud de onda", keywords: ["v = f lambda", "longitud de onda", "frecuencia", "rapidez de la onda"],
        make: (r) => {
          const f = pick(r, [5, 8, 10, 20, 25]), lam = pick(r, [0.20, 0.40, 0.50, 0.60, 1.2]);
          const v = f * lam, lam2 = lam / 2;
          const lp = 140, x0 = 40, c1 = x0 + lp / 4, c2 = c1 + lp;
          return {
            fig: {
              w: 360, h: 170, alt: `Onda en una cuerda en un instante, con la distancia entre dos crestas consecutivas indicada: ${f2(lam)} m`,
              items: [
                { t: "poly", pts: shape(x0, 70, 2 * lp, 30, (u) => Math.sin(2 * PI * u * 2)) },
                { t: "line", x1: x0, y1: 70, x2: x0 + 2 * lp, y2: 70, gray: true, w: 0.8 },
                { t: "line", x1: c1, y1: 38, x2: c1, y2: 124, dash: true, w: 1 },
                { t: "line", x1: c2, y1: 38, x2: c2, y2: 124, dash: true, w: 1 },
                dim(c1, 118, c2, 118),
                { t: "text", x: (c1 + c2) / 2, y: 142, s: `${f2(lam)} m` },
              ],
            },
            stem: `En la figura se representa, en un instante dado, una onda que se propaga por una cuerda. El vibrador que la produce oscila con una frecuencia de ${f} Hz.`,
            parts: [
              part("(a)", "Calcule la rapidez de propagación de la onda.", [
                method("v = fλ", /f\s*[·×*]?\s*λ|v\s*=|λ\s*[·×*]\s*f/i, v, "v = fλ"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["v = f λ", `v = ${f} × ${f2(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(b)", "La frecuencia del vibrador se duplica. Determine la nueva longitud de onda.", [val("A1", `λ' = ${fmt(lam2)} m`, lam2)],
                ["v no cambia: λ' = v / (2f) = λ / 2", `λ' = ${f2(lam)} / 2 = ${fmt(lam2)} m`]),
              part("(c)", "Explique por qué la rapidez de la onda no cambia al duplicar la frecuencia.", [
                reason("La rapidez depende del medio (tensión y masa de la cuerda), no de la frecuencia de la fuente", "depende del medio", "medio", "tension", "propiedades de la cuerda", "no depende de la frecuencia", "misma cuerda"),
              ], ["La rapidez la fija el medio (la tensión y la masa por unidad de longitud de la cuerda), no la frecuencia de la fuente."]),
            ],
          };
        },
      },
      {
        id: "transversal_long", label: "Ondas transversales y longitudinales", keywords: ["transversal", "longitudinal", "compresiones", "rarefacciones", "muelle"],
        make: (r) => {
          const d = pick(r, [6, 8, 10, 12]), f = pick(r, [20, 25, 40, 50]);
          const lam = d / 100, v = f * lam;
          const lp = 120, x0 = 20, k = (2 * PI) / lp;
          const items: FigItem[] = [];
          for (let i = 0; i <= 62; i++) {
            const s = i * 5, x = x0 + s + 12 * Math.sin(k * s);
            items.push({ t: "line", x1: q2(x), y1: 56, x2: q2(x), y2: 96, w: 1.4 });
          }
          items.push(
            { t: "text", x: x0 + 60, y: 48, s: "C" }, { t: "text", x: x0 + 180, y: 48, s: "C" },
            { t: "text", x: x0 + 120, y: 48, s: "R" }, { t: "text", x: x0 + 240, y: 48, s: "R" }, { t: "text", x: x0, y: 48, s: "R" },
            { t: "line", x1: x0 + 60, y1: 100, x2: x0 + 60, y2: 126, dash: true, w: 1 },
            { t: "line", x1: x0 + 180, y1: 100, x2: x0 + 180, y2: 126, dash: true, w: 1 },
            dim(x0 + 60, 120, x0 + 180, 120),
            { t: "text", x: x0 + 120, y: 142, s: `${d} cm` },
            { t: "line", x1: 30, y1: 20, x2: 90, y2: 20, arrow: "end", w: 1.6 },
            { t: "text", x: 98, y: 24, s: "propagación", anchor: "start" },
          );
          return {
            fig: { w: 380, h: 156, alt: "Onda longitudinal en un muelle: líneas verticales que representan las partículas, con compresiones (C) y rarefacciones (R)", items },
            stem: `La figura representa, en un instante, las posiciones de las partículas de un muelle por el que viaja una onda longitudinal. La fuente vibra con una frecuencia de ${f} Hz. C indica el centro de una compresión y R el de una rarefacción; la distancia entre dos compresiones consecutivas se indica en la figura.`,
            parts: [
              part("(a)", "Indique la dirección en que oscilan las partículas del muelle respecto a la dirección de propagación de la onda.", [
                reason("En una onda longitudinal las partículas oscilan paralelas a la dirección de propagación", "paralela a la propagación", "paralela", "misma direccion", "en la direccion de propagacion", "a lo largo"),
              ], ["Las partículas oscilan en la misma dirección en que se propaga la onda (paralela a la propagación), a diferencia de una onda transversal."]),
              part("(b)", "Determine la longitud de onda.", [valAny("A1", `λ = ${d} cm`, [d, lam])], [`λ = distancia entre dos compresiones consecutivas = ${d} cm`]),
              part("(c)", "Calcule la rapidez de la onda en el muelle.", [
                method("v = fλ", /f\s*[·×*]?\s*λ|v\s*=|λ\s*[·×*]\s*f/i, lam, "v = fλ"),
                valAny("A1", `v = ${fmt(v)} m s⁻¹`, [v, v * 100]),
              ], ["v = f λ", `v = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "graficas_yx_yt", label: "Gráficas de onda: desplazamiento–distancia y desplazamiento–tiempo", keywords: ["grafica de onda", "lambda", "periodo", "desplazamiento distancia"],
        make: (r) => {
          const lam = pick(r, [0.20, 0.40, 0.60, 0.80]), T = pick(r, [0.10, 0.20, 0.40, 0.50]), A = pick(r, [2, 3, 4]), dd = pick(r, [1.5, 2.5, 3.5, 6.0]);
          const v = lam / T, f = 1 / T, tt = dd / v;
          const yt = [-A, A];
          return {
            fig: {
              w: 430, h: 190, alt: `Dos gráficas de una onda: desplazamiento en función de la distancia (λ = ${f2(lam)} m) y en función del tiempo (T = ${f2(T)} s)`,
              items: [
                { t: "text", x: 115, y: 12, s: "Gráfica A: en un instante" },
                { t: "text", x: 320, y: 12, s: "Gráfica B: en un punto" },
                { t: "graph", x: 40, y: 40, w: 150, h: 120, xr: [0, 1.5 * lam], yr: [-A * 1.25, A * 1.25], xlabel: "x / m", ylabel: "y / mm", xticks: [lam / 2, lam, 1.5 * lam].map(tk), yticks: yt, grid: true, series: [{ pts: curve((x) => A * Math.sin((2 * PI * x) / lam), 0, 1.5 * lam, 90) }] },
                { t: "graph", x: 250, y: 40, w: 150, h: 120, xr: [0, 1.5 * T], yr: [-A * 1.25, A * 1.25], xlabel: "t / s", ylabel: "y / mm", xticks: [T / 2, T, 1.5 * T].map(tk), yticks: yt, grid: true, series: [{ pts: curve((t) => A * Math.sin((2 * PI * t) / T), 0, 1.5 * T, 90) }] },
              ],
            },
            stem: "Una onda se propaga por una cuerda. La gráfica A muestra el desplazamiento y de los puntos de la cuerda en función de la distancia x en un instante dado. La gráfica B muestra el desplazamiento y de un punto de la cuerda en función del tiempo t.",
            parts: [
              part("(a)", "Determine la longitud de onda.", [valAny("A1", `λ = ${f2(lam)} m`, [lam, lam * 100])], [`Se lee en la gráfica A (distancia entre dos puntos en fase): λ = ${f2(lam)} m`]),
              part("(b)", "Determine el periodo de la onda.", [valAny("A1", `T = ${f2(T)} s`, [T, T * 1000])], [`Se lee en la gráfica B (tiempo de una oscilación completa): T = ${f2(T)} s`]),
              part("(c)", "Calcule la rapidez de la onda.", [
                method("v = λ / T o v = fλ", /λ\s*\/\s*T|f\s*[·×*]?\s*λ|v\s*=/i, f, "v = λ/T"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["v = λ / T", `v = ${f2(lam)} / ${f2(T)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(d)", `Determine el tiempo que tarda un pulso en recorrer ${f2(dd)} m de cuerda.`, [val("A1", `t = d / v = ${fmt(tt)} s`, tt)],
                [`t = d / v = ${f2(dd)} / ${fmt(v)}`, `t = ${fmt(tt)} s`]),
            ],
          };
        },
      },
      {
        id: "sonido_medios", label: "Sonido en distintos medios", keywords: ["sonido", "aire", "agua", "rapidez del sonido", "medio"],
        make: (r) => {
          const f = pick(r, [425, 680, 850, 1700]), vw = pick(r, [1400, 1500]);
          const la = 340 / f, lw = vw / f, ratio = vw / 340;
          const sp = 14 * ratio, items: FigItem[] = [{ t: "rect", x: 190, y: 40, w: 190, h: 90, fill: "light", sw: 1 }];
          for (let i = 0; 30 + 14 * i < 190; i++) items.push({ t: "line", x1: 30 + 14 * i, y1: 46, x2: 30 + 14 * i, y2: 124, w: 1.2 });
          for (let x = 190 + sp; x < 378; x += sp) items.push({ t: "line", x1: q2(x), y1: 46, x2: q2(x), y2: 124, w: 1.2 });
          items.push(
            { t: "line", x1: 190, y1: 34, x2: 190, y2: 136, w: 1.8 },
            { t: "text", x: 110, y: 28, s: "aire" }, { t: "text", x: 285, y: 28, s: "agua" },
            { t: "line", x1: 40, y1: 152, x2: 150, y2: 152, arrow: "end", w: 1.6 }, { t: "text", x: 200, y: 156, s: "onda sonora" },
          );
          return {
            fig: { w: 400, h: 170, alt: "Frentes de onda de un sonido que pasa del aire al agua: en el agua están mucho más separados", items },
            stem: `Una onda sonora de frecuencia ${f} Hz viaja por el aire y pasa al agua, como indica la figura (los frentes de onda se dibujan separados una longitud de onda).`,
            data: `Rapidez del sonido: en el aire = 340 m s⁻¹ · en el agua = ${vw} m s⁻¹`,
            parts: [
              part("(a)", "Calcule la longitud de onda del sonido en el aire.", [
                method("λ = v / f", /v\s*\/\s*f|λ\s*=/i, la, "λ = v/f"),
                val("A1", `λ = ${fmt(la)} m`, la),
              ], ["λ = v / f", `λ = 340 / ${f}`, `λ = ${fmt(la)} m`]),
              part("(b)", "Calcule la longitud de onda del sonido en el agua.", [val("A1", `λ = ${fmt(lw)} m`, lw)],
                [`λ = v / f = ${vw} / ${f}`, `λ = ${fmt(lw)} m`]),
              part("(c)", "Explique por qué la frecuencia del sonido es la misma en los dos medios.", [
                reason("La frecuencia la fija la fuente: llegan a la frontera tantas ondas por segundo como salen de ella", "la fuente fija la frecuencia", "fuente", "misma frecuencia", "no cambia", "mismo numero", "ondas por segundo"),
              ], ["La frecuencia la determina la fuente: por la frontera pasan tantas ondas por segundo como llegan, así que no cambia; cambian v y λ."]),
            ],
          };
        },
      },
      {
        id: "espectro_em", label: "Espectro electromagnético", keywords: ["espectro", "electromagnetica", "radio", "luz visible", "c = f lambda"],
        make: (r) => {
          const lr = pick(r, [2.0, 3.0, 4.0]), ll = pick(r, [450, 500, 600, 650]);
          const fr = C_LIGHT / lr, fl = C_LIGHT / (ll * 1e-9), ratio = fl / fr;
          const names = ["Radio", "Microond.", "IR", "Visible", "UV", "Rayos X", "Rayos γ"];
          const items: FigItem[] = names.map((s, i) => ({ t: "text" as const, x: 41 + 58 * i, y: 85, s, size: 10 }));
          names.forEach((_, i) => items.unshift({ t: "rect", x: 12 + 58 * i, y: 62, w: 58, h: 36, fill: i === 3 ? "light" : "none", sw: 1.2 }));
          items.push({ t: "line", x1: 14, y1: 124, x2: 414, y2: 124, arrow: "end", w: 1.6 }, { t: "text", x: 214, y: 146, s: "frecuencia creciente" });
          return {
            fig: { w: 430, h: 160, alt: "Regiones del espectro electromagnético ordenadas de menor a mayor frecuencia: radio, microondas, infrarrojo, visible, ultravioleta, rayos X y rayos gamma", items },
            stem: `La figura muestra las regiones del espectro electromagnético. Una emisora emite ondas de radio de longitud de onda ${f2(lr)} m. Un láser emite luz visible de longitud de onda ${ll} nm.`,
            data: "c = 3,0 × 10⁸ m s⁻¹",
            parts: [
              part("(a)", "Calcule la frecuencia de las ondas de radio.", [
                method("c = fλ", /c\s*=|f\s*=\s*c|c\s*\/\s*λ|f\s*[·×*]?\s*λ/i, C_LIGHT, "c = fλ"),
                val("A1", `f = ${fmt(fr)} Hz`, fr),
              ], ["c = f λ  →  f = c / λ", `f = 3,0×10⁸ / ${f2(lr)}`, `f = ${fmt(fr)} Hz`]),
              part("(b)", "Calcule la frecuencia de la luz del láser.", [val("A1", `f = ${fmt(fl)} Hz`, fl)],
                [`f = c / λ = 3,0×10⁸ / (${ll}×10⁻⁹)`, `f = ${fmt(fl)} Hz`]),
              part("(c)", "Determine cuántas veces mayor es la frecuencia de la luz que la de las ondas de radio.", [val("A1", `razón = ${fmt(ratio)}`, ratio)],
                [`razón = ${fmt(fl)} / ${fmt(fr)}`, `razón = ${fmt(ratio)}`]),
            ],
          };
        },
      },
      {
        id: "eco_sonar", label: "Eco y sónar", keywords: ["sonar", "eco", "profundidad", "pulso", "ultrasonido"],
        make: (r) => {
          const t = pick(r, [0.040, 0.060, 0.080, 0.10, 0.12]), f = pick(r, [38, 52, 64]);
          const d = (1500 * t) / 2, lam = 1500 / (f * 1e3);
          return {
            fig: {
              w: 360, h: 200, alt: "Un barco emite un pulso de sónar hacia el fondo marino y recibe el eco; la profundidad se indica con d",
              items: [
                { t: "poly", pts: [120, 38, 200, 38, 190, 54, 130, 54], close: true, fill: "light" },
                { t: "line", x1: 20, y1: 54, x2: 340, y2: 54, w: 1 },
                { t: "ground", x1: 20, y1: 168, x2: 340, y2: 168, side: -1 },
                { t: "line", x1: 150, y1: 58, x2: 150, y2: 164, arrow: "end", w: 1.6 },
                { t: "line", x1: 175, y1: 164, x2: 175, y2: 58, arrow: "end", w: 1.6, dash: true },
                dim(270, 56, 270, 166),
                { t: "text", x: 282, y: 116, s: "d", anchor: "start", italic: true },
                { t: "text", x: 160, y: 28, s: "sónar" },
                { t: "text", x: 90, y: 118, s: "pulso", size: 11 }, { t: "text", x: 207, y: 100, s: "eco", size: 11 },
              ],
            },
            stem: `Un barco emite un pulso de ultrasonido de frecuencia ${f} kHz hacia el fondo del mar. El eco se recibe ${f2(t)} s después de la emisión.`,
            data: "Rapidez del sonido en el agua de mar = 1500 m s⁻¹",
            parts: [
              part("(a)", "Calcule la profundidad d del fondo.", [
                method("El pulso recorre 2d en el tiempo t: 2d = vt", /2\s*d|2d|v\s*[·×*]?\s*t|d\s*=/i, 1500 * t, "2d = vt"),
                val("A1", `d = ${fmt(d)} m`, d),
              ], ["El pulso recorre ida y vuelta: 2d = v t", `d = 1500 × ${f2(t)} / 2`, `d = ${fmt(d)} m`]),
              part("(b)", "Calcule la longitud de onda del pulso en el agua.", [val("A1", `λ = v / f = ${fmt(lam)} m`, lam)],
                [`λ = v / f = 1500 / (${f}×10³)`, `λ = ${fmt(lam)} m`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "C3", unit: "C", name: "C.3 Fenómenos ondulatorios",
    concepts: [
      {
        id: "snell", label: "Refracción y ley de Snell", keywords: ["refraccion", "snell", "indice de refraccion", "rayo"],
        make: (r) => {
          const n = pick(r, [1.33, 1.50, 1.52, 1.60]), t1 = pick(r, [30, 40, 50, 60]);
          const t2 = deg(Math.asin(Math.sin(rad(t1)) / n)), v = C_LIGHT / n;
          const P = [180, 112], Lr = 95;
          return {
            fig: {
              w: 360, h: 225, alt: `Rayo de luz que pasa del aire a otro medio: incide con ${t1}° respecto a la normal y se refracta acercándose a ella`,
              items: [
                { t: "rect", x: 20, y: 112, w: 320, h: 100, fill: "light", sw: 1 },
                { t: "line", x1: 20, y1: 112, x2: 340, y2: 112, w: 1.8 },
                { t: "line", x1: 180, y1: 15, x2: 180, y2: 210, dash: true, w: 1 },
                { t: "line", x1: q2(P[0] - Lr * Math.sin(rad(t1))), y1: q2(P[1] - Lr * Math.cos(rad(t1))), x2: P[0], y2: P[1], arrow: "end", w: 1.8 },
                { t: "line", x1: P[0], y1: P[1], x2: q2(P[0] + Lr * Math.sin(rad(t2))), y2: q2(P[1] + Lr * Math.cos(rad(t2))), arrow: "end", w: 1.8 },
                { t: "angle", x: 180, y: 112, r: 42, a1: 90, a2: 90 + t1, label: `${t1}°` },
                { t: "angle", x: 180, y: 112, r: 42, a1: 270, a2: 270 + t2, label: "θ₂" },
                { t: "text", x: 40, y: 30, s: "aire" }, { t: "text", x: 40, y: 205, s: "medio", anchor: "start" },
                { t: "text", x: 192, y: 26, s: "normal", anchor: "start", size: 11 },
              ],
            },
            stem: `Un rayo de luz pasa del aire a un medio transparente de índice de refracción ${f2(n)}. El ángulo de incidencia es de ${t1}°, como muestra la figura.`,
            data: "c = 3,0 × 10⁸ m s⁻¹ · n del aire = 1,00",
            parts: [
              part("(a)", "Calcule el ángulo de refracción θ₂.", [
                method("Ley de Snell: n₁ sen θ₁ = n₂ sen θ₂", /sin|sen/i, Math.sin(rad(t1)) / n, "n₁ sen θ₁ = n₂ sen θ₂"),
                val("A1", `θ₂ = ${fmt(t2)}°`, t2),
              ], ["n₁ sen θ₁ = n₂ sen θ₂", `sen θ₂ = 1,00 × sen ${t1}° / ${f2(n)} = ${fmt(Math.sin(rad(t1)) / n)}`, `θ₂ = ${fmt(t2)}°`]),
              part("(b)", "Calcule la rapidez de la luz en el medio.", [val("A1", `v = c / n = ${fmt(v)} m s⁻¹`, v)],
                ["v = c / n", `v = 3,0×10⁸ / ${f2(n)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Explique por qué el rayo se acerca a la normal al entrar en el medio.", [
                reason("La luz va más lenta en el medio (mayor índice de refracción), así que el rayo se desvía hacia la normal", "menor rapidez / más lenta en el medio", "mas lent", "menor rapidez", "menor velocidad", "disminuye la", "se reduce", "mayor indice", "se frena"),
              ], ["La luz viaja más lenta en el medio de mayor índice (menor rapidez), y por eso el rayo se desvía hacia la normal."]),
            ],
          };
        },
      },
      {
        id: "angulo_critico", label: "Ángulo crítico y reflexión total interna", keywords: ["angulo critico", "reflexion total", "fibra optica", "reflexion interna"],
        make: (r) => {
          const n = pick(r, [1.33, 1.45, 1.50, 1.60]), ti = pick(r, [30, 35, 55, 60]);
          const tc = deg(Math.asin(1 / n)), tir = ti > tc, v = C_LIGHT / n;
          const med = n === 1.33 ? "agua" : "vidrio";
          const P = [180, 90], Lr = 85;
          return {
            fig: {
              w: 360, h: 215, alt: `Rayo de luz dentro de ${med} que llega a la frontera con el aire con un ángulo de incidencia de ${ti}°`,
              items: [
                { t: "rect", x: 20, y: 90, w: 320, h: 115, fill: "light", sw: 1 },
                { t: "line", x1: 20, y1: 90, x2: 340, y2: 90, w: 1.8 },
                { t: "line", x1: 180, y1: 15, x2: 180, y2: 200, dash: true, w: 1 },
                { t: "line", x1: q2(P[0] - Lr * Math.sin(rad(ti))), y1: q2(P[1] + Lr * Math.cos(rad(ti))), x2: P[0], y2: P[1], arrow: "end", w: 1.8 },
                { t: "angle", x: 180, y: 90, r: 40, a1: 270 - ti, a2: 270, label: `${ti}°` },
                { t: "text", x: 40, y: 30, s: "aire" }, { t: "text", x: 40, y: 195, s: med, anchor: "start" },
              ],
            },
            stem: `Un rayo de luz viaja dentro de ${med} (índice de refracción ${f2(n)}) y llega a la frontera con el aire con un ángulo de incidencia de ${ti}°, como muestra la figura.`,
            data: "c = 3,0 × 10⁸ m s⁻¹ · n del aire = 1,00",
            parts: [
              part("(a)", `Calcule el ángulo crítico entre ${med} y aire.`, [
                method("sen θc = n₂ / n₁", /sin|sen|1\s*\/\s*n|n\s*₂\s*\/\s*n\s*₁/i, 1 / n, "sen θc = n₂/n₁"),
                val("A1", `θc = ${fmt(tc)}°`, tc),
              ], ["sen θc = n₂ / n₁ = 1,00 / " + f2(n), `θc = ${fmt(tc)}°`]),
              part("(b)", "Indique si en este caso se produce reflexión total interna y justifique su respuesta.", [
                tir
                  ? reason(`Sí: ${ti}° es mayor que el ángulo crítico, hay reflexión total`, "mayor que el ángulo crítico", "mayor que", "supera", "excede", "reflexion total", "se refleja", "si hay", "total")
                  : reason(`No: ${ti}° es menor que el ángulo crítico, el rayo se refracta y sale`, "menor que el ángulo crítico", "menor que", "no hay", "no se produce", "se refracta", "sale", "refracci"),
              ], [tir ? `Sí: ${ti}° > ${fmt(tc)}° (mayor que el ángulo crítico), por lo que hay reflexión total interna.` : `No: ${ti}° < ${fmt(tc)}° (menor que el ángulo crítico), no hay reflexión total: el rayo se refracta y sale al aire.`]),
              part("(c)", `Calcule la rapidez de la luz en ${med}.`, [val("A1", `v = c / n = ${fmt(v)} m s⁻¹`, v)],
                ["v = c / n", `v = 3,0×10⁸ / ${f2(n)}`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "doble_rendija", label: "Doble rendija de Young", keywords: ["doble rendija", "young", "interferencia", "franjas"],
        make: (r) => {
          const lam = pick(r, [450, 500, 550, 600, 650]), d = pick(r, [0.20, 0.25, 0.30, 0.40, 0.50]), D = pick(r, [1.0, 1.5, 2.0, 2.5]);
          const s = (lam * 1e-9 * D) / (d * 1e-3), s3 = 3 * s;
          const sp = 18, sx = 340, items: FigItem[] = [];
          items.push(
            { t: "rect", x: 150, y: 15, w: 6, h: 71, fill: "dark", sw: 1 }, { t: "rect", x: 150, y: 90, w: 6, h: 20, fill: "dark", sw: 1 }, { t: "rect", x: 150, y: 114, w: 6, h: 71, fill: "dark", sw: 1 },
            { t: "line", x1: 20, y1: 100, x2: 145, y2: 100, arrow: "end", w: 1.6 }, { t: "text", x: 80, y: 90, s: "luz monocromática", size: 11 },
            { t: "line", x1: 156, y1: 100, x2: sx, y2: 100, dash: true, w: 0.9, gray: true },
            { t: "line", x1: 156, y1: 88, x2: sx, y2: 100, w: 0.9, gray: true }, { t: "line", x1: 156, y1: 112, x2: sx, y2: 100, w: 0.9, gray: true },
            { t: "line", x1: sx, y1: 15, x2: sx, y2: 185, w: 3 },
          );
          for (let j = -4; j <= 4; j++) items.push({ t: "rect", x: sx + 3, y: 100 + j * sp - 3, w: 10, h: 6, fill: "dark", sw: 1 });
          items.push(
            dim(170, 88, 170, 112), { t: "text", x: 177, y: 104, s: "d", anchor: "start", italic: true },
            dim(sx + 26, 100, sx + 26, 100 + sp), { t: "text", x: sx + 32, y: 114, s: "s", anchor: "start", italic: true },
            dim(156, 196, sx, 196), { t: "text", x: 248, y: 212, s: "D", italic: true },
          );
          return {
            fig: { w: 400, h: 220, alt: "Montaje de doble rendija: luz monocromática, dos rendijas separadas d y una pantalla a distancia D con franjas brillantes separadas s", items },
            stem: `Luz monocromática de longitud de onda ${lam} nm incide sobre dos rendijas separadas ${f2(d)} mm. Las franjas de interferencia se observan en una pantalla situada a ${f2(D)} m de las rendijas.`,
            parts: [
              part("(a)", "Calcule la separación s entre franjas brillantes consecutivas.", [
                method("s = λD / d", /λ\s*[·×*]?\s*D|s\s*=|D\s*\/\s*d/i, s, "s = λD/d"),
                valAny("A1", `s = ${fmt(s * 1e3)} mm`, [s * 1e3, s]),
              ], ["s = λ D / d", `s = ${lam}×10⁻⁹ × ${f2(D)} / (${f2(d)}×10⁻³)`, `s = ${fmt(s)} m = ${fmt(s * 1e3)} mm`]),
              part("(b)", "Determine la distancia entre la franja brillante central y la tercera franja brillante.", [valAny("A1", `3s = ${fmt(s3 * 1e3)} mm`, [s3 * 1e3, s3])],
                [`distancia = 3 s = 3 × ${fmt(s * 1e3)}`, `distancia = ${fmt(s3 * 1e3)} mm`]),
              part("(c)", "Explique por qué aparece una franja brillante en la pantalla.", [
                reason("Las ondas de las dos rendijas llegan en fase (diferencia de camino = nλ): interferencia constructiva", "interferencia constructiva", "constructiva", "en fase", "diferencia de camino", "refuerzan", "se suman", "superposicion"),
              ], ["Las ondas de las dos rendijas llegan en fase (la diferencia de camino es un número entero de λ): hay interferencia constructiva."]),
            ],
          };
        },
      },
      {
        id: "red_difraccion", label: "Red de difracción", keywords: ["red de difraccion", "difraccion", "orden", "lineas por mm"],
        make: (r) => {
          const N = pick(r, [300, 400, 500, 600]), lam = pick(r, [500, 550, 600, 650, 700]);
          const d = 1e-3 / N, t1 = deg(Math.asin((lam * 1e-9) / d)), t2 = deg(Math.asin((2 * lam * 1e-9) / d));
          const Lr = 190, gx = 130;
          const dx = Lr * Math.cos(rad(t1)), dy = Lr * Math.sin(rad(t1));
          const items: FigItem[] = [{ t: "rect", x: gx - 3, y: 40, w: 6, h: 120, fill: "light", sw: 1 }];
          for (let y = 46; y < 160; y += 8) items.push({ t: "line", x1: gx - 3, y1: y, x2: gx + 3, y2: y, w: 0.8 });
          items.push(
            { t: "line", x1: 20, y1: 100, x2: gx - 4, y2: 100, arrow: "end", w: 1.6 }, { t: "text", x: 70, y: 90, s: "luz", size: 12 },
            { t: "line", x1: gx + 3, y1: 100, x2: gx + Lr + 20, y2: 100, dash: true, w: 1.2 },
            { t: "line", x1: gx + 3, y1: 100, x2: q2(gx + dx), y2: q2(100 - dy), w: 1.4 },
            { t: "line", x1: gx + 3, y1: 100, x2: q2(gx + dx), y2: q2(100 + dy), w: 1.4 },
            { t: "angle", x: gx + 3, y: 100, r: 60, a1: 0, a2: t1, label: "θ₁" },
            { t: "text", x: gx + Lr + 26, y: 104, s: "n = 0", anchor: "start" },
            { t: "text", x: q2(gx + dx + 6), y: q2(100 - dy + 4), s: "n = 1", anchor: "start" },
            { t: "text", x: q2(gx + dx + 6), y: q2(100 + dy + 4), s: "n = −1", anchor: "start" },
          );
          return {
            fig: { w: 390, h: 210, alt: "Luz que atraviesa una red de difracción y forma un máximo central y dos máximos de primer orden a ángulo θ₁ de la dirección incidente", items },
            stem: `Luz monocromática de longitud de onda ${lam} nm incide perpendicularmente sobre una red de difracción de ${N} líneas por milímetro.`,
            parts: [
              part("(a)", "Calcule la separación d entre rendijas contiguas de la red.", [valAny("A1", `d = ${fmt(d)} m`, [d, d * 1e6, d * 1e3])],
                [`d = 1 mm / ${N} = 1×10⁻³ / ${N}`, `d = ${fmt(d)} m`]),
              part("(b)", "Determine el ángulo del máximo de primer orden.", [
                method("nλ = d sen θ", /sin|sen|n\s*λ/i, (lam * 1e-9) / d, "nλ = d sen θ"),
                val("A1", `θ₁ = ${fmt(t1)}°`, t1),
              ], ["n λ = d sen θ, con n = 1", `sen θ₁ = ${lam}×10⁻⁹ / ${fmt(d)} = ${fmt((lam * 1e-9) / d)}`, `θ₁ = ${fmt(t1)}°`]),
              part("(c)", "Determine el ángulo del máximo de segundo orden.", [val("A1", `θ₂ = ${fmt(t2)}°`, t2)],
                [`sen θ₂ = 2 λ / d = 2 × ${lam}×10⁻⁹ / ${fmt(d)} = ${fmt((2 * lam * 1e-9) / d)}`, `θ₂ = ${fmt(t2)}°`]),
            ],
          };
        },
      },
      {
        id: "inverso_cuadrado", label: "Intensidad y ley del inverso del cuadrado", keywords: ["intensidad", "inverso del cuadrado", "fuente puntual", "potencia"],
        make: (r) => {
          const P = pick(r, [40, 60, 100, 150, 200]), d = pick(r, [1.0, 2.0, 3.0, 4.0]);
          const I = P / (4 * PI * d * d), d2 = 2 * d;
          return {
            fig: {
              w: 300, h: 180, alt: "Fuente puntual rodeada de dos esferas concéntricas de radios r y 2r",
              items: [
                { t: "circle", cx: 110, cy: 95, r: 30, sw: 1.2 }, { t: "circle", cx: 110, cy: 95, r: 60, sw: 1.2 },
                { t: "dot", x: 110, y: 95, r: 3.5 },
                { t: "line", x1: 110, y1: 95, x2: 140, y2: 95, w: 1 }, { t: "text", x: 127, y: 90, s: "r", italic: true },
                { t: "line", x1: 110, y1: 95, x2: 152, y2: 53, w: 1 }, { t: "text", x: 150, y: 44, s: "2r", italic: true },
                { t: "text", x: 195, y: 100, s: "fuente puntual", anchor: "start" },
              ],
            },
            stem: `Una fuente luminosa puntual emite uniformemente en todas direcciones una potencia de ${P} W. Se mide la intensidad de la luz a una distancia r = ${f2(d)} m de la fuente (la figura muestra dos superficies esféricas concéntricas).`,
            parts: [
              part("(a)", "Calcule la intensidad de la luz a esa distancia.", [
                method("I = P / (4πr²)", /4\s*π|4π|4\s*pi|P\s*\/|r\s*\^?\s*2|r²/i, P / (4 * PI), "I = P/4πr²"),
                val("A1", `I = ${fmt(I)} W m⁻²`, I),
              ], ["I = P / (4π r²)", `I = ${P} / (4π × ${f2(d)}²)`, `I = ${fmt(I)} W m⁻²`]),
              part("(b)", "Determine a qué distancia de la fuente la intensidad es la cuarta parte.", [val("A1", `r' = 2r = ${fmt(d2)} m`, d2)],
                ["I ∝ 1 / r²: la intensidad es 1/4 cuando r se duplica", `r' = 2 × ${f2(d)} = ${fmt(d2)} m`]),
              part("(c)", "Explique por qué la intensidad disminuye al alejarse de la fuente.", [
                reason("La misma potencia se reparte sobre una superficie esférica de área cada vez mayor (4πr²)", "se reparte sobre un área mayor", "area", "superficie", "se reparte", "se distribuye", "se extiende"),
              ], ["La misma potencia se reparte sobre una superficie esférica de área 4πr², cada vez mayor, por lo que la intensidad (potencia por unidad de área) disminuye."]),
            ],
          };
        },
      },
      {
        id: "malus", label: "Polarización y ley de Malus", keywords: ["polarizacion", "malus", "polarizador", "analizador"],
        make: (r) => {
          const I0 = pick(r, [20, 40, 60, 80]), th = pick(r, [30, 40, 50, 60]);
          const I1 = I0 / 2, I2 = I1 * Math.cos(rad(th)) ** 2;
          const ex = 40 * Math.sin(rad(th)), ey = 40 * Math.cos(rad(th));
          return {
            fig: {
              w: 360, h: 175, alt: `Dos polarizadores vistos de frente: el eje del segundo forma un ángulo de ${th}° con el del primero`,
              items: [
                { t: "circle", cx: 100, cy: 80, r: 50, fill: "light" }, { t: "circle", cx: 260, cy: 80, r: 50, fill: "light" },
                { t: "line", x1: 100, y1: 38, x2: 100, y2: 122, arrow: "both", w: 1.6 },
                { t: "line", x1: q2(260 + ex), y1: q2(80 + ey), x2: q2(260 - ex), y2: q2(80 - ey), arrow: "both", w: 1.6 },
                { t: "line", x1: 260, y1: 36, x2: 260, y2: 80, dash: true, w: 1 },
                { t: "angle", x: 260, y: 80, r: 32, a1: 90, a2: 90 + th, label: `${th}°` },
                { t: "text", x: 100, y: 152, s: "polarizador" }, { t: "text", x: 260, y: 152, s: "analizador" },
              ],
            },
            stem: `Luz natural (no polarizada) de intensidad ${I0} W m⁻² incide sobre un polarizador. La luz que sale atraviesa después un analizador, cuyo eje de transmisión forma un ángulo de ${th}° con el del polarizador (figura).`,
            parts: [
              part("(a)", "Determine la intensidad de la luz que sale del polarizador.", [val("A1", `I₁ = I₀ / 2 = ${fmt(I1)} W m⁻²`, I1)],
                ["La luz natural pierde la mitad de su intensidad en el polarizador", `I₁ = ${I0} / 2 = ${fmt(I1)} W m⁻²`]),
              part("(b)", "Calcule la intensidad de la luz que sale del analizador.", [
                method("Ley de Malus: I = I₁ cos²θ", /cos/i, I1, "I = I₀ cos²θ"),
                val("A1", `I₂ = ${fmt(I2)} W m⁻²`, I2),
              ], ["I₂ = I₁ cos²θ", `I₂ = ${fmt(I1)} × cos²(${th}°)`, `I₂ = ${fmt(I2)} W m⁻²`]),
              part("(c)", "Explique por qué la luz que sale del polarizador está polarizada plana.", [
                reason("Solo pasa la componente del campo eléctrico paralela al eje: la luz oscila en un único plano", "oscila en un solo plano", "un solo plano", "un unico plano", "un plano", "una sola direccion", "una direccion", "paralela al eje", "componente"),
              ], ["Solo se transmite la componente del campo eléctrico paralela al eje de transmisión, así que la luz oscila en un único plano."]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "C4", unit: "C", name: "C.4 Ondas estacionarias y resonancia",
    concepts: [
      {
        id: "cuerda_fija", label: "Cuerda fija en ambos extremos", keywords: ["cuerda", "onda estacionaria", "armonico", "nodos", "antinodos"],
        make: (r) => {
          const n = pick(r, [3, 4, 5]), L = pick(r, [0.60, 0.80, 1.0, 1.2]), f1 = pick(r, [40, 50, 60, 100]);
          const f = n * f1, lam = (2 * L) / n, v = f * lam;
          const x0 = 40, len = 300, cy = 85;
          return {
            fig: {
              w: 380, h: 175, alt: "Onda estacionaria en una cuerda fija en ambos extremos, con varios vientres (antinodos) entre los nodos",
              items: [
                { t: "poly", pts: shape(x0, cy, len, 38, (u) => Math.sin(n * PI * u), 160) },
                { t: "poly", pts: shape(x0, cy, len, -38, (u) => Math.sin(n * PI * u), 160) },
                { t: "line", x1: x0, y1: 40, x2: x0, y2: 130, w: 3 }, { t: "line", x1: x0 + len, y1: 40, x2: x0 + len, y2: 130, w: 3 },
                dim(x0, 148, x0 + len, 148), { t: "text", x: x0 + len / 2, y: 168, s: `L = ${f2(L)} m` },
              ],
            },
            stem: `En la figura se ve una onda estacionaria en una cuerda de longitud ${f2(L)} m, sujeta por los dos extremos. La cuerda vibra con una frecuencia de ${f} Hz.`,
            parts: [
              part("(a)", "Determine la longitud de onda de la onda estacionaria.", [
                method("Cada vientre ocupa λ/2: L = nλ / 2", /λ\s*\/\s*2|nλ|n\s*λ|2\s*L|L\s*=/i, L, "L = nλ/2"),
                val("A1", `λ = ${fmt(lam)} m`, lam),
              ], [`Se cuentan ${n} vientres: L = ${n} λ / 2`, `λ = 2L / ${n} = 2 × ${f2(L)} / ${n}`, `λ = ${fmt(lam)} m`]),
              part("(b)", "Calcule la rapidez de las ondas en la cuerda.", [val("A1", `v = fλ = ${fmt(v)} m s⁻¹`, v)],
                [`v = f λ = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Calcule la frecuencia fundamental de esta cuerda.", [
                method("La frecuencia fundamental es f₁ = v / 2L, o f₁ = f / n", /v\s*\/\s*2\s*L|f\s*\/\s*n|2\s*L/i, v / (2 * L), "f₁ = v/2L"),
                val("A1", `f₁ = ${fmt(f1)} Hz`, f1),
              ], ["f₁ = v / 2L  (o f₁ = f / n)", `f₁ = ${fmt(v)} / (2 × ${f2(L)})`, `f₁ = ${fmt(f1)} Hz`]),
            ],
          };
        },
      },
      {
        id: "tubo_abierto", label: "Tubo abierto en ambos extremos", keywords: ["tubo abierto", "armonicos", "columna de aire", "frecuencia fundamental"],
        make: (r) => {
          const L = pick(r, [0.50, 0.60, 0.80, 1.0, 1.5]);
          const lam1 = 2 * L, f1 = 340 / lam1, f3 = 3 * f1;
          const x0 = 50, len = 280;
          return {
            fig: {
              w: 380, h: 175, alt: "Tubo abierto en ambos extremos con el patrón de desplazamiento del armónico fundamental: antinodos en los extremos y un nodo en el centro",
              items: [
                { t: "line", x1: x0, y1: 60, x2: x0 + len, y2: 60, w: 2 }, { t: "line", x1: x0, y1: 120, x2: x0 + len, y2: 120, w: 2 },
                { t: "poly", pts: shape(x0, 90, len, 24, (u) => Math.cos(PI * u)), w: 1.4 },
                { t: "poly", pts: shape(x0, 90, len, -24, (u) => Math.cos(PI * u)), w: 1.4 },
                dim(x0, 142, x0 + len, 142), { t: "text", x: x0 + len / 2, y: 163, s: `L = ${f2(L)} m` },
              ],
            },
            stem: `Un tubo de ${f2(L)} m de longitud, abierto en ambos extremos, contiene aire. La figura muestra el patrón de la onda estacionaria del modo de vibración de menor frecuencia.`,
            data: "Rapidez del sonido en el aire = 340 m s⁻¹",
            parts: [
              part("(a)", "Deduzca la longitud de onda del modo de vibración de la figura.", [
                method("Hay un antinodo en cada extremo y un nodo en medio: L = λ / 2", /λ\s*\/\s*2|2\s*L|L\s*=/i, L, "L = λ/2"),
                val("A1", `λ = 2L = ${fmt(lam1)} m`, lam1),
              ], ["Antinodo en cada extremo y un nodo en medio: L = λ / 2", `λ = 2L = 2 × ${f2(L)} = ${fmt(lam1)} m`]),
              part("(b)", "Calcule la frecuencia fundamental del tubo.", [val("A1", `f₁ = v / λ = ${fmt(f1)} Hz`, f1)],
                [`f₁ = v / λ = 340 / ${fmt(lam1)}`, `f₁ = ${fmt(f1)} Hz`]),
              part("(c)", "Determine la frecuencia del tercer armónico.", [val("A1", `f₃ = 3f₁ = ${fmt(f3)} Hz`, f3)],
                [`En un tubo abierto f₃ = 3 f₁ = 3 × ${fmt(f1)}`, `f₃ = ${fmt(f3)} Hz`]),
            ],
          };
        },
      },
      {
        id: "tubo_cerrado", label: "Tubo cerrado por un extremo", keywords: ["tubo cerrado", "armonicos impares", "resonancia en tubo", "nodo"],
        make: (r) => {
          const L = pick(r, [0.30, 0.40, 0.50, 0.60]);
          const lam1 = 4 * L, f1 = 340 / lam1, f3 = 3 * f1;
          const x0 = 50, len = 280;
          return {
            fig: {
              w: 380, h: 175, alt: "Tubo cerrado en el extremo izquierdo con el patrón de desplazamiento del modo fundamental: un nodo en el extremo cerrado y un antinodo en el abierto",
              items: [
                { t: "line", x1: x0, y1: 60, x2: x0 + len, y2: 60, w: 2 }, { t: "line", x1: x0, y1: 120, x2: x0 + len, y2: 120, w: 2 },
                { t: "line", x1: x0, y1: 60, x2: x0, y2: 120, w: 4 },
                { t: "poly", pts: shape(x0, 90, len, 24, (u) => Math.sin((PI * u) / 2)), w: 1.4 },
                { t: "poly", pts: shape(x0, 90, len, -24, (u) => Math.sin((PI * u) / 2)), w: 1.4 },
                dim(x0, 142, x0 + len, 142), { t: "text", x: x0 + len / 2, y: 163, s: `L = ${f2(L)} m` },
              ],
            },
            stem: `Un tubo de ${f2(L)} m de longitud, cerrado en un extremo y abierto en el otro, contiene aire. La figura muestra el patrón de la onda estacionaria del modo de menor frecuencia.`,
            data: "Rapidez del sonido en el aire = 340 m s⁻¹",
            parts: [
              part("(a)", "Deduzca la longitud de onda del modo fundamental.", [
                method("Nodo en el extremo cerrado y antinodo en el abierto: L = λ / 4", /λ\s*\/\s*4|4\s*L|L\s*=/i, L, "L = λ/4"),
                val("A1", `λ = 4L = ${fmt(lam1)} m`, lam1),
              ], ["Nodo en el extremo cerrado y antinodo en el abierto: L = λ / 4", `λ = 4L = 4 × ${f2(L)} = ${fmt(lam1)} m`]),
              part("(b)", "Calcule la frecuencia fundamental del tubo.", [val("A1", `f₁ = ${fmt(f1)} Hz`, f1)],
                [`f₁ = v / λ = 340 / ${fmt(lam1)}`, `f₁ = ${fmt(f1)} Hz`]),
              part("(c)", "Determine la frecuencia del siguiente armónico que puede resonar en el tubo.", [val("A1", `f = 3f₁ = ${fmt(f3)} Hz`, f3)],
                ["Solo son posibles los armónicos impares: el siguiente es 3f₁", `f = 3 × ${fmt(f1)} = ${fmt(f3)} Hz`]),
              part("(d)", "Explique por qué el tubo no resuena con una frecuencia 2f₁.", [
                reason("Debe haber un nodo en el extremo cerrado y un antinodo en el abierto: solo caben armónicos impares", "solo armónicos impares", "impares", "nodo", "antinodo", "extremo cerrado", "no cabe", "no se forma"),
              ], ["Con un nodo en el extremo cerrado y un antinodo en el abierto solo caben un número impar de cuartos de onda: el tubo solo tiene armónicos impares."]),
            ],
          };
        },
      },
      {
        id: "resonancia_amort", label: "Resonancia y amortiguamiento", keywords: ["resonancia", "amortiguamiento", "frecuencia natural", "oscilacion forzada"],
        make: (r) => {
          const f0 = pick(r, [4, 5, 8, 10, 12]), m = pick(r, [0.20, 0.50, 1.0, 2.0]);
          const A = (Q: number) => (f: number) => { const u = f / f0; return 1 / Math.sqrt((1 - u * u) ** 2 + (u / Q) ** 2); };
          const T0 = 1 / f0, k = m * (2 * PI * f0) ** 2;
          return {
            fig: {
              w: 370, h: 205, alt: "Curvas de resonancia: amplitud de un sistema en función de la frecuencia de la fuerza impulsora, con amortiguamiento ligero (continua) y fuerte (discontinua)",
              items: [{
                t: "graph", x: 55, y: 28, w: 290, h: 145, xr: [0, 2 * f0], yr: [0, 5.5],
                xlabel: "f / Hz", ylabel: "amplitud / cm", xticks: [f0 / 2, f0, 1.5 * f0, 2 * f0].map(tk), yticks: [1, 2, 3, 4, 5], grid: true,
                series: [{ pts: curve(A(5), 0, 2 * f0, 240) }, { pts: curve(A(2), 0, 2 * f0, 160), dash: true }],
              }],
            },
            stem: `Una plataforma elástica con un objeto de ${f2(m)} kg encima se hace vibrar con una fuerza periódica de frecuencia variable. La gráfica muestra la amplitud de la vibración del objeto en función de la frecuencia de la fuerza, con un amortiguamiento ligero (línea continua) y con un amortiguamiento mayor (línea discontinua).`,
            parts: [
              part("(a)", "Determine la frecuencia natural del sistema.", [val("A1", `f₀ = ${f0} Hz`, f0)], [`La amplitud es máxima en la resonancia: f₀ = ${f0} Hz`]),
              part("(b)", "Calcule el periodo natural de oscilación del sistema.", [val("A1", `T = 1 / f = ${fmt(T0)} s`, T0)],
                [`T = 1 / f₀ = 1 / ${f0}`, `T = ${fmt(T0)} s`]),
              part("(c)", "Explique por qué la amplitud es máxima cuando la frecuencia de la fuerza es de esa frecuencia.", [
                reason("Hay resonancia: la frecuencia de la fuerza coincide con la frecuencia natural y el sistema recibe energía de forma eficaz", "resonancia: la frecuencia coincide con la natural", "resonancia", "coincide", "frecuencia natural", "igual a la frecuencia natural", "transfer", "absorbe energia"),
              ], ["Hay resonancia: la frecuencia de la fuerza coincide con la frecuencia natural y el sistema recibe la máxima energía por ciclo."]),
              part("(d)", "Describa el efecto de un mayor amortiguamiento sobre la curva de resonancia.", [
                reason("Con más amortiguamiento el pico es de menor amplitud (y más ancho)", "menor amplitud en el pico", "menor amplitud", "disminuye la amplitud", "mas bajo", "mas ancho", "mas plano", "se reduce"),
              ], ["Con mayor amortiguamiento el pico de resonancia es de menor amplitud y más ancho."]),
              part("(e)", "Estime la constante elástica de la plataforma.", [
                method("k = mω², con ω = 2πf₀ (resonancia: la frecuencia coincide con la natural)", /ω|2\s*π|2π|m\s*[·×*]/i, 2 * PI * f0, "k = mω²"),
                val("A1", `k = ${fmt(k)} N m⁻¹`, k),
              ], ["ω₀ = 2π f₀ y k = m ω₀²", `k = ${f2(m)} × (2π × ${f0})²`, `k = ${fmt(k)} N m⁻¹`]),
            ],
          };
        },
      },
      {
        id: "v_cuerda", label: "Rapidez de la onda en una cuerda (sonómetro)", keywords: ["sonometro", "velocidad de la onda en una cuerda", "cuerda vibrante", "longitud de la cuerda"],
        make: (r) => {
          const L = pick(r, [0.60, 0.65, 0.80]), L2 = pick(r, [0.30, 0.40, 0.45]), f = pick(r, [110, 165, 220, 330]);
          const lam = 2 * L, v = f * lam, f2n = v / (2 * L2);
          const x0 = 60, len = 220;
          return {
            fig: {
              w: 390, h: 170, alt: "Sonómetro: una cuerda tensada por una pesa sobre una polea, sujeta entre dos puentes separados una distancia L, vibrando en su modo fundamental",
              items: [
                { t: "poly", pts: [x0, 80, x0 - 9, 100, x0 + 9, 100], close: true, fill: "dark" }, { t: "poly", pts: [x0 + len, 80, x0 + len - 9, 100, x0 + len + 9, 100], close: true, fill: "dark" },
                { t: "ground", x1: 30, y1: 100, x2: 330, y2: 100, side: -1 },
                { t: "poly", pts: shape(x0, 80, len, 22, (u) => Math.sin(PI * u)) }, { t: "poly", pts: shape(x0, 80, len, -22, (u) => Math.sin(PI * u)) },
                { t: "line", x1: x0 + len, y1: 80, x2: 330, y2: 80, w: 1.2 },
                { t: "circle", cx: 338, cy: 88, r: 8, fill: "light", sw: 1.2 },
                { t: "line", x1: 346, y1: 88, x2: 346, y2: 128, w: 1.2 },
                { t: "rect", x: 334, y: 128, w: 24, h: 20, fill: "dark", sw: 1.2 },
                dim(x0, 128, x0 + len, 128), { t: "text", x: x0 + len / 2, y: 148, s: `L = ${f2(L)} m` },
              ],
            },
            stem: `Una cuerda de un sonómetro está sujeta entre dos puentes separados ${f2(L)} m y se mantiene tensa con una pesa. Al pulsarla vibra en su modo fundamental, como en la figura, y emite un sonido de frecuencia ${f} Hz.`,
            parts: [
              part("(a)", "Deduzca la longitud de onda de la onda estacionaria en la cuerda.", [val("A1", `λ = 2L = ${fmt(lam)} m`, lam)],
                ["En el modo fundamental cabe medio λ entre los puentes: L = λ / 2", `λ = 2 × ${f2(L)} = ${fmt(lam)} m`]),
              part("(b)", "Calcule la rapidez de las ondas en la cuerda.", [
                method("v = fλ", /f\s*[·×*]?\s*λ|v\s*=/i, lam, "v = fλ"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["v = f λ", `v = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", `Se acortan los puentes hasta ${f2(L2)} m sin cambiar la tensión. Calcule la nueva frecuencia fundamental.`, [
                method("La rapidez no cambia: f = v / 2L", /v\s*\/\s*2\s*L|2\s*L|v\s*\/\s*λ/i, v, "f = v/2L"),
                val("A1", `f = ${fmt(f2n)} Hz`, f2n),
              ], ["La tensión es la misma, así que v no cambia: f = v / 2L", `f = ${fmt(v)} / (2 × ${f2(L2)})`, `f = ${fmt(f2n)} Hz`]),
            ],
          };
        },
      },
      {
        id: "tubo_resonancia", label: "Tubo de resonancia con diapasón", keywords: ["tubo de resonancia", "diapason", "columna de aire", "nivel del agua"],
        make: (r) => {
          const f = pick(r, [400, 500, 680]), vt = pick(r, [330, 340, 350]), e = pick(r, [0.01, 0.015, 0.02]);
          const lamT = vt / f, L1 = Math.round((lamT / 4 - e) * 1000) / 1000, L2 = Math.round((3 * lamT / 4 - e) * 1000) / 1000;
          const lam = 2 * (L2 - L1), v = f * lam;
          const sc = 190, ya = 32, y1 = ya + L1 * sc, y2 = ya + L2 * sc;
          return {
            fig: {
              w: 300, h: 205, alt: "Tubo vertical con agua sobre el que suena un diapasón: dos niveles de agua (L₁ y L₂) en los que se oye un máximo de sonido",
              items: [
                { t: "rect", x: 150, y: q2(y1), w: 40, h: q2(180 - y1), fill: "light", sw: 0.5 },
                { t: "line", x1: 150, y1: ya, x2: 150, y2: 180, w: 2 }, { t: "line", x1: 190, y1: ya, x2: 190, y2: 180, w: 2 }, { t: "line", x1: 150, y1: 180, x2: 190, y2: 180, w: 2 },
                { t: "line", x1: 150, y1: q2(y2), x2: 190, y2: q2(y2), dash: true, w: 1.2 },
                { t: "text", x: 170, y: 18, s: "diapasón" },
                dim(215, ya, 215, q2(y1)), { t: "text", x: 223, y: q2((ya + y1) / 2 + 4), s: "L₁", anchor: "start" },
                dim(250, ya, 250, q2(y2)), { t: "text", x: 258, y: q2((ya + y2) / 2 + 4), s: "L₂", anchor: "start" },
              ],
            },
            stem: `Un diapasón de frecuencia ${f} Hz suena sobre un tubo vertical que contiene agua. Al bajar poco a poco el nivel del agua, se oye un máximo de sonido cuando la columna de aire mide L₁ = ${f2(L1 * 100)} cm y de nuevo cuando mide L₂ = ${f2(L2 * 100)} cm.`,
            parts: [
              part("(a)", "Determine la longitud de onda del sonido en el aire.", [
                method("Entre dos resonancias consecutivas la columna cambia en λ / 2", /λ\s*\/\s*2|L\s*₂\s*[−-]\s*L\s*₁|2\s*\(|\(\s*L/i, L2 - L1, "L₂ − L₁ = λ/2"),
                valAny("A1", `λ = ${fmt(lam)} m`, [lam, lam * 100]),
              ], ["L₂ − L₁ = λ / 2", `λ = 2 × (${f2(L2 * 100)} − ${f2(L1 * 100)}) cm = ${fmt(lam * 100)} cm`, `λ = ${fmt(lam)} m`]),
              part("(b)", "Calcule la rapidez del sonido en el aire.", [val("A1", `v = ${fmt(v)} m s⁻¹`, v)],
                ["v = f λ", `v = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Explique por qué se oye un máximo de sonido solo para ciertas longitudes de la columna de aire.", [
                reason("Hay resonancia: se forma una onda estacionaria con un nodo en el agua y un antinodo cerca del extremo abierto", "resonancia / onda estacionaria", "resonancia", "onda estacionaria", "estacionaria", "nodo", "antinodo", "frecuencia natural"),
              ], ["Solo para esas longitudes se forma una onda estacionaria (nodo en la superficie del agua y antinodo en el extremo abierto): la columna resuena con la frecuencia del diapasón."]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "C5", unit: "C", name: "C.5 Efecto Doppler",
    concepts: [
      {
        id: "doppler_fuente", label: "Fuente sonora que se acerca o se aleja", keywords: ["doppler", "sirena", "ambulancia", "fuente en movimiento"],
        make: (r) => {
          const f = pick(r, [400, 500, 600, 800]), kmh = pick(r, [72, 90, 108, 126]);
          const vs = kmh / 3.6, fa = (f * 340) / (340 - vs), fb = (f * 340) / (340 + vs);
          return {
            fig: dopplerFig(),
            stem: `Una ambulancia que se mueve a ${kmh} km h⁻¹ emite con su sirena un sonido de frecuencia ${f} Hz. La figura muestra los frentes de onda; el observador A está delante de la ambulancia y el B detrás, ambos en reposo.`,
            data: "Rapidez del sonido en el aire = 340 m s⁻¹",
            parts: [
              part("(a)", "Calcule la rapidez de la ambulancia en m s⁻¹.", [val("A1", `${kmh} / 3,6 = ${fmt(vs)} m s⁻¹`, vs)], [`v = ${kmh} / 3,6 = ${fmt(vs)} m s⁻¹`]),
              part("(b)", "Calcule la frecuencia que percibe el observador A.", [
                method("f′ = f v / (v − vₛ)", /v\s*\/\s*\(\s*v|\(\s*v\s*[−-]\s*v|[−-]\s*v\s*ₛ|f\s*′|f\s*'/i, 340 - vs, "f' = f v/(v − vs)"),
                val("A1", `f′ = ${fmt(fa)} Hz`, fa),
              ], ["La fuente se acerca: f′ = f v / (v − vₛ)", `f′ = ${f} × 340 / (340 − ${fmt(vs)})`, `f′ = ${fmt(fa)} Hz`]),
              part("(c)", "Calcule la frecuencia que percibe el observador B.", [val("A1", `f′ = ${fmt(fb)} Hz`, fb)],
                ["La fuente se aleja: f′ = f v / (v + vₛ)", `f′ = ${f} × 340 / (340 + ${fmt(vs)})`, `f′ = ${fmt(fb)} Hz`]),
            ],
          };
        },
      },
      {
        id: "observador_mov", label: "Observador en movimiento", keywords: ["observador", "doppler", "observador en movimiento", "se acerca a la fuente"],
        make: (r) => {
          const f = pick(r, [500, 600, 800, 1000]), vo = pick(r, [25, 30, 35, 40]);
          const fa = (f * (340 + vo)) / 340, fb = (f * (340 - vo)) / 340;
          const items: FigItem[] = [];
          for (let j = 1; j <= 4; j++) items.push({ t: "circle", cx: 60, cy: 95, r: 20 * j, sw: 1.1 });
          items.push(
            { t: "rect", x: 52, y: 87, w: 16, h: 16, fill: "dark", sw: 1 },
            { t: "text", x: 60, y: 130, s: "altavoz", size: 11 },
            { t: "circle", cx: 300, cy: 95, r: 7, fill: "light" },
            { t: "line", x1: 300, y1: 72, x2: 250, y2: 72, arrow: "end", w: 1.8 }, { t: "text", x: 275, y: 62, s: "vₒ" },
            { t: "text", x: 300, y: 125, s: "observador", size: 11 },
          );
          return {
            fig: { w: 360, h: 190, alt: "Un altavoz fijo emite ondas circulares y un observador se acerca a él con velocidad vₒ", items },
            stem: `Un altavoz fijo emite un sonido de frecuencia ${f} Hz. Un tren de alta velocidad pasa por la vía junto al altavoz; un pasajero con un receptor se mueve en línea recta hacia el altavoz con una rapidez de ${vo} m s⁻¹ (figura) y después se aleja de él con la misma rapidez.`,
            data: "Rapidez del sonido en el aire = 340 m s⁻¹",
            parts: [
              part("(a)", "Calcule la frecuencia que registra el receptor mientras el tren se acerca al altavoz.", [
                method("f′ = f (v + vₒ) / v", /\(\s*v\s*\+\s*v|v\s*\+\s*v\s*ₒ|\+\s*v\s*o|f\s*′|f\s*'/i, 340 + vo, "f' = f (v + vo)/v"),
                val("A1", `f′ = ${fmt(fa)} Hz`, fa),
              ], ["El observador se acerca: f′ = f (v + vₒ) / v", `f′ = ${f} × (340 + ${vo}) / 340`, `f′ = ${fmt(fa)} Hz`]),
              part("(b)", "Calcule la frecuencia que registra cuando el tren se aleja del altavoz.", [val("A1", `f′ = ${fmt(fb)} Hz`, fb)],
                ["El observador se aleja: f′ = f (v − vₒ) / v", `f′ = ${f} × (340 − ${vo}) / 340`, `f′ = ${fmt(fb)} Hz`]),
              part("(c)", "Explique por qué el pasajero mide una frecuencia mayor al acercarse, aunque el altavoz emite siempre la misma frecuencia.", [
                reason("Al ir hacia la fuente encuentra más frentes de onda por segundo (la rapidez relativa de las ondas respecto a él es mayor)", "más frentes de onda por segundo", "mas frentes", "mas ondas", "ondas por segundo", "rapidez relativa", "velocidad relativa", "mas crestas", "se encuentra con"),
              ], ["Al moverse hacia la fuente encuentra más frentes de onda cada segundo (la rapidez relativa entre él y las ondas aumenta), así que registra una frecuencia mayor."]),
            ],
          };
        },
      },
      {
        id: "doppler_luz", label: "Doppler para la luz y corrimiento al rojo", keywords: ["corrimiento al rojo", "galaxia", "doppler luz", "lineas espectrales"],
        make: (r) => {
          const obs = pick(r, [660, 662, 665, 670, 675]), lab = 656;
          const dl = obs - lab, v = (C_LIGHT * dl) / lab;
          const px = (l: number) => 30 + ((l - 640) / 40) * 340;
          const items: FigItem[] = [{ t: "line", x1: 20, y1: 100, x2: 390, y2: 100, arrow: "end", w: 1.4 }];
          for (const t of [640, 650, 660, 670, 680]) items.push({ t: "line", x1: px(t), y1: 100, x2: px(t), y2: 106, w: 1 }, { t: "text", x: px(t), y: 120, s: String(t), size: 11 });
          items.push(
            { t: "text", x: 380, y: 140, s: "λ / nm", anchor: "end" },
            { t: "line", x1: px(lab), y1: 62, x2: px(lab), y2: 100, w: 2.4 }, { t: "text", x: px(lab) - 4, y: 56, s: "laboratorio", anchor: "end", size: 11 },
            { t: "line", x1: px(obs), y1: 40, x2: px(obs), y2: 100, w: 2.4 }, { t: "text", x: px(obs) + 4, y: 34, s: "galaxia", anchor: "start", size: 11 },
          );
          return {
            fig: { w: 400, h: 150, alt: `Posición de una línea espectral del hidrógeno medida en el laboratorio (${lab} nm) y en la luz de una galaxia (${obs} nm), desplazada hacia el rojo`, items },
            stem: `Una línea espectral del hidrógeno tiene una longitud de onda de ${lab} nm cuando se mide en el laboratorio. En la luz de una galaxia lejana la misma línea se observa a ${obs} nm (figura).`,
            data: "c = 3,0 × 10⁸ m s⁻¹ · Para v ≪ c: Δλ / λ ≈ v / c",
            parts: [
              part("(a)", "Determine el cambio de longitud de onda Δλ.", [val("A1", `Δλ = ${dl} nm`, dl)], [`Δλ = ${obs} − ${lab} = ${dl} nm`]),
              part("(b)", "Calcule la rapidez radial de la galaxia.", [
                method("v = c Δλ / λ", /Δλ\s*\/\s*λ|c\s*[·×*]?\s*Δ|v\s*\/\s*c|Δλ|dl/i, dl / lab, "Δλ/λ ≈ v/c"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["Δλ / λ ≈ v / c", `v = 3,0×10⁸ × ${dl} / ${lab}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Indique, justificando, si la galaxia se acerca o se aleja de la Tierra.", [
                reason("La longitud de onda observada es mayor (corrimiento al rojo): la galaxia se aleja", "se aleja (corrimiento al rojo)", "se aleja", "alejando", "alejan", "corrimiento al rojo", "hacia el rojo", "mayor longitud"),
              ], ["Se observa una longitud de onda mayor (corrimiento hacia el rojo): la galaxia se aleja de la Tierra."]),
            ],
          };
        },
      },
      {
        id: "radar_velocidad", label: "Radar de velocidad", keywords: ["radar", "microondas", "reflexion", "multa", "velocidad de un coche"],
        make: (r) => {
          const f0 = pick(r, [10.5, 24.0]), v1 = pick(r, [20, 25, 30, 35]);
          const v2 = pick(r, [20, 25, 30, 35, 40].filter((x) => x !== v1));
          const df = (2 * v1 * f0 * 1e9) / C_LIGHT, df2 = (2 * v2 * f0 * 1e9) / C_LIGHT;
          return {
            fig: {
              w: 410, h: 160, alt: "Un radar emite microondas hacia un coche que se acerca; el coche refleja las ondas con frecuencia distinta",
              items: [
                { t: "rect", x: 20, y: 52, w: 50, h: 40, fill: "light", r: 3 }, { t: "text", x: 45, y: 77, s: "radar", size: 12 },
                { t: "line", x1: 76, y1: 62, x2: 292, y2: 62, arrow: "end", w: 1.6 }, { t: "text", x: 180, y: 52, s: "f₀" },
                { t: "line", x1: 292, y1: 84, x2: 76, y2: 84, arrow: "end", w: 1.6, dash: true }, { t: "text", x: 180, y: 104, s: "f" },
                { t: "poly", pts: [300, 120, 300, 98, 322, 98, 336, 80, 360, 80, 378, 98, 392, 98, 392, 120], close: true, fill: "light" },
                { t: "circle", cx: 322, cy: 122, r: 8, fill: "dark" }, { t: "circle", cx: 372, cy: 122, r: 8, fill: "dark" },
                { t: "line", x1: 370, y1: 146, x2: 322, y2: 146, arrow: "end", w: 1.6 }, { t: "text", x: 346, y: 140, s: "v", size: 12 },
              ],
            },
            stem: `Un radar de tráfico emite microondas de frecuencia ${fmt(f0, 3)} GHz hacia un coche que se acerca a él con una rapidez de ${v1} m s⁻¹. El coche refleja las ondas, y el radar mide la diferencia Δf entre la frecuencia reflejada y la emitida.`,
            data: "c = 3,0 × 10⁸ m s⁻¹ · Para v ≪ c, el cambio de frecuencia del eco es Δf ≈ 2 v f₀ / c",
            parts: [
              part("(a)", "Calcule el cambio de frecuencia Δf de las ondas reflejadas.", [
                method("Δf = 2 v f₀ / c", /2\s*v|2v|v\s*[·×*]\s*f|f\s*₀\s*\/\s*c/i, v1, "Δf = 2vf₀/c"),
                valAny("A1", `Δf = ${fmt(df)} Hz = ${fmt(df / 1e3)} kHz`, [df, df / 1e3]),
              ], ["Δf ≈ 2 v f₀ / c", `Δf = 2 × ${v1} × ${fmt(f0, 3)}×10⁹ / 3,0×10⁸`, `Δf = ${fmt(df)} Hz = ${fmt(df / 1e3)} kHz`]),
              part("(b)", "Explique por qué aparece un factor 2 en la fórmula del cambio de frecuencia.", [
                reason("Hay dos desplazamientos Doppler: el coche como observador en movimiento y luego como fuente en movimiento", "dos cambios Doppler", "doble", "dos veces", "dos efectos", "fuente y observador", "observador y fuente", "ida y vuelta", "dos desplazamientos"),
              ], ["Hay dos efectos Doppler: el coche, como observador en movimiento, recibe una frecuencia mayor y, al reflejarla como fuente en movimiento, la emite aún mayor; por eso el cambio es el doble."]),
              part("(c)", `Para otro coche que también se acerca, el radar mide Δf = ${fmt(df2 / 1e3)} kHz. Determine su rapidez.`, [
                method("v = c Δf / (2 f₀)", /c\s*[·×*]?\s*Δ|Δf\s*\/\s*\(?\s*2|2\s*f/i, df2, "v = cΔf/2f₀"),
                valAny("A1", `v = ${fmt(v2)} m s⁻¹ (${fmt(v2 * 3.6)} km h⁻¹)`, [v2, v2 * 3.6]),
              ], ["Δf = 2 v f₀ / c  →  v = c Δf / (2 f₀)", `v = 3,0×10⁸ × ${fmt(df2)} / (2 × ${fmt(f0, 3)}×10⁹)`, `v = ${fmt(v2)} m s⁻¹ = ${fmt(v2 * 3.6)} km h⁻¹`]),
            ],
          };
        },
      },
      {
        id: "doppler_razon", label: "Por qué cambia la frecuencia (Doppler)", keywords: ["efecto doppler", "frentes de onda", "longitud de onda observada", "sirena"],
        make: (r) => {
          const f = pick(r, [500, 600, 800]), vs = pick(r, [20, 30, 40]);
          const lam0 = 340 / f, lam1 = (340 - vs) / f, f1 = 340 / lam1;
          return {
            fig: dopplerFig(),
            stem: `Una ambulancia que viaja a ${vs} m s⁻¹ emite un sonido de frecuencia ${f} Hz. La figura muestra los frentes de onda; A es un observador en reposo delante de la ambulancia.`,
            data: "Rapidez del sonido en el aire = 340 m s⁻¹",
            parts: [
              part("(a)", "Indique si la frecuencia que percibe el observador A es mayor, menor o igual que la emitida.", [
                reason("Es mayor que la frecuencia emitida", "mayor", "mayor", "aumenta", "mas alta", "mas aguda"),
              ], ["La frecuencia percibida es mayor que la emitida."]),
              part("(b)", "Calcule la longitud de onda del sonido entre la ambulancia y el observador A.", [
                method("λ′ = (v − vₛ) / f", /\(\s*v\s*[−-]\s*v|v\s*[−-]\s*v\s*ₛ|[−-]\s*vs|[−-]\s*v\s*s/i, 340 - vs, "λ' = (v − vs)/f"),
                val("A1", `λ′ = ${fmt(lam1)} m`, lam1),
              ], ["En un periodo la fuente avanza vₛ T: λ′ = (v − vₛ) / f", `λ′ = (340 − ${vs}) / ${f}`, `λ′ = ${fmt(lam1)} m`]),
              part("(c)", "Determine la frecuencia que percibe el observador A.", [val("A1", `f′ = v / λ′ = ${fmt(f1)} Hz`, f1)],
                [`f′ = v / λ′ = 340 / ${fmt(lam1)}`, `f′ = ${fmt(f1)} Hz`]),
              part("(d)", "Explique por qué cambia la frecuencia percibida por A.", [
                reason("Los frentes de onda delante de la fuente se comprimen: llegan más frentes por segundo a A", "frentes de onda comprimidos / menor longitud de onda", "comprim", "mas juntos", "mas cerca", "menor longitud de onda", "mas frentes", "se acumulan", "se acercan"),
              ], ["La fuente avanza entre una emisión y la siguiente, así que los frentes de onda delante de ella están más juntos (menor longitud de onda) y llegan más frentes por segundo a A."]),
            ],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
  "C.1": {
    title: "C.1 Movimiento armónico simple",
    items: [
      { tex: "T = \\dfrac{1}{f} = \\dfrac{2\\pi}{\\omega}", n: "periodo, frecuencia y frecuencia angular", for: ["gráfica", "aceleración", "frecuencia"] },
      { tex: "T = 2\\pi\\sqrt{\\dfrac{m}{k}}", n: "periodo de un sistema masa–resorte", for: ["masa–resorte"] },
      { tex: "T = 2\\pi\\sqrt{\\dfrac{l}{g}}", n: "periodo de un péndulo simple (ángulos pequeños)", for: ["péndulo"] },
      { tex: "a = -\\omega^2 x", n: "aceleración en el MAS", for: ["aceleración", "velocidad máxima"] },
      { tex: "x = x_0\\cos(\\omega t) \\quad\\text{o}\\quad x = x_0\\sin(\\omega t)", n: "desplazamiento", for: ["gráfica"] },
      { tex: "v_{\\text{máx}} = \\omega x_0", n: "rapidez máxima", for: ["gráfica", "velocidad máxima", "energía"] },
      { tex: "E_T = \\tfrac{1}{2}k x_0^2 = \\tfrac{1}{2}m\\omega^2 x_0^2", n: "energía total del oscilador", for: ["energía"] },
      { tex: "E_k = \\tfrac{1}{2}m\\omega^2\\left(x_0^2 - x^2\\right)", n: "energía cinética en la posición x", for: ["energía"] },
      { tex: "E_p = \\tfrac{1}{2}m\\omega^2 x^2", n: "energía potencial en la posición x", for: ["energía"] },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}", note: "usa el valor del enunciado" }],
  },
  "C.2": {
    title: "C.2 Modelo de onda",
    items: [
      { tex: "v = f\\lambda", n: "rapidez de una onda", for: ["rapidez", "gráficas", "transversales", "sonido", "espectro", "eco"] },
      { tex: "T = \\dfrac{1}{f}", n: "periodo y frecuencia", for: ["gráficas", "rapidez"] },
      { tex: "c = f\\lambda", n: "ondas electromagnéticas en el vacío", for: ["espectro"] },
      { tex: "d = \\dfrac{v\\,t}{2}", n: "eco: el pulso recorre ida y vuelta", for: ["eco", "sónar"] },
    ],
    consts: [
      { tex: "c = 3{,}00 \\times 10^{8}\\ \\text{m s}^{-1}", note: "ondas electromagnéticas en el vacío" },
      { tex: "v_{\\text{sonido, aire}} \\approx 340\\ \\text{m s}^{-1}", note: "si el enunciado lo da" },
    ],
  },
  "C.3": {
    title: "C.3 Fenómenos ondulatorios",
    items: [
      { tex: "n_1\\sin\\theta_1 = n_2\\sin\\theta_2", n: "ley de Snell", for: ["refracción", "snell"] },
      { tex: "n = \\dfrac{c}{v}", n: "índice de refracción", for: ["refracción", "ángulo crítico"] },
      { tex: "\\sin\\theta_c = \\dfrac{n_2}{n_1}", n: "ángulo crítico (n₁ > n₂)", for: ["ángulo crítico", "reflexión"] },
      { tex: "s = \\dfrac{\\lambda D}{d}", n: "doble rendija: separación de franjas", for: ["doble rendija"] },
      { tex: "n\\lambda = d\\sin\\theta", n: "red de difracción (máximo de orden n)", for: ["red de difracción"] },
      { tex: "I = \\dfrac{P}{4\\pi r^2}", n: "intensidad de una fuente puntual", for: ["intensidad", "inverso"] },
      { tex: "I = I_0\\cos^2\\theta", n: "ley de Malus (luz ya polarizada)", for: ["polarización", "malus"] },
    ],
    consts: [{ tex: "c = 3{,}00 \\times 10^{8}\\ \\text{m s}^{-1}" }, { tex: "n_{\\text{aire}} = 1{,}00" }],
  },
  "C.4": {
    title: "C.4 Ondas estacionarias y resonancia",
    items: [
      { tex: "L = \\dfrac{n\\lambda}{2},\\quad f_n = \\dfrac{n v}{2L}", n: "cuerda fija en ambos extremos y tubo abierto (n = 1, 2, 3…)", for: ["cuerda", "abierto", "sonómetro"] },
      { tex: "L = \\dfrac{n\\lambda}{4},\\quad f_n = \\dfrac{n v}{4L}", n: "tubo cerrado por un extremo (n = 1, 3, 5…)", for: ["cerrado", "tubo de resonancia"] },
      { tex: "v = f\\lambda", n: "rapidez de la onda", for: ["cuerda", "tubo", "sonómetro"] },
      { tex: "\\text{resonancia: } f_{\\text{fuerza}} = f_{\\text{natural}}", n: "la amplitud es máxima; el amortiguamiento la reduce", for: ["resonancia"] },
      { tex: "L_2 - L_1 = \\dfrac{\\lambda}{2}", n: "dos resonancias consecutivas en un tubo con un extremo cerrado", for: ["tubo de resonancia"] },
    ],
    consts: [{ tex: "v_{\\text{sonido, aire}} \\approx 340\\ \\text{m s}^{-1}", note: "si el enunciado lo da" }],
  },
  "C.5": {
    title: "C.5 Efecto Doppler",
    items: [
      { tex: "f' = f\\,\\dfrac{v}{v \\pm u_s}", n: "fuente en movimiento (− si se acerca, + si se aleja)", for: ["fuente", "cambia", "frecuencia"] },
      { tex: "f' = f\\,\\dfrac{v \\pm u_o}{v}", n: "observador en movimiento (+ si se acerca, − si se aleja)", for: ["observador"] },
      { tex: "\\dfrac{\\Delta f}{f} \\approx \\dfrac{\\Delta\\lambda}{\\lambda} \\approx \\dfrac{v}{c}", n: "luz y ondas EM para v ≪ c", for: ["luz", "corrimiento", "radar"] },
      { tex: "\\Delta f \\approx \\dfrac{2 v f_0}{c}", n: "eco de un radar sobre un objeto que se mueve", for: ["radar"] },
    ],
    consts: [{ tex: "c = 3{,}00 \\times 10^{8}\\ \\text{m s}^{-1}" }, { tex: "v_{\\text{sonido, aire}} \\approx 340\\ \\text{m s}^{-1}", note: "si el enunciado lo da" }],
  },
};
