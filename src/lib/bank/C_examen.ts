/**
 * Unit C · more questions (intermedio y examen). See kit.ts. Concepts are added to the subtopics of
 * bank/C.ts by topic id (e.g. "C1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Concept, type Fig, type FigItem } from "./kit.ts";

const PI = Math.PI;
const rad = (d: number) => (d * PI) / 180;
const deg = (r: number) => (r * 180) / PI;
const q4 = (x: number) => Math.round(x * 1e4) / 1e4;
const q2 = (x: number) => Math.round(x * 100) / 100;
const tk = (x: number) => Math.round(x * 1000) / 1000;
/** n + 1 points of y = f(x) between a and b (for graphs). */
const curve = (f: (x: number) => number, a: number, b: number, n = 120): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const x = a + ((b - a) * i) / n; return [q4(x), q4(f(x))] as [number, number]; });
/** A length in metres written in centimetres: 0,075 → "7,5". */
const nc = (x: number) => String(Math.round(x * 1e3) / 10).replace(".", ",");
const dim = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "both", w: 1.1 });

/** Wavefronts of a source that moves to the right (compressed ahead, spread behind), observers A (ahead) and B (behind). */
function ambulanceFig(): Fig {
  const items: FigItem[] = [];
  for (let j = 1; j <= 4; j++) items.push({ t: "circle", cx: 190 - 7 * j, cy: 100, r: 22 * j, sw: 1.1 });
  items.push(
    { t: "circle", cx: 190, cy: 100, r: 4, fill: "dark" },
    { t: "line", x1: 198, y1: 100, x2: 236, y2: 100, arrow: "end", w: 2 },
    { t: "text", x: 217, y: 91, s: "u", italic: true },
    { t: "dot", x: 338, y: 100, r: 4 }, { t: "text", x: 338, y: 86, s: "A" },
    { t: "dot", x: 42, y: 100, r: 4 }, { t: "text", x: 42, y: 86, s: "B" },
  );
  return { w: 380, h: 200, alt: "Frentes de onda de una sirena que se mueve a la derecha a rapidez u: más juntos delante, hacia el observador A, y más separados detrás, hacia el observador B", items };
}

export const extra: Record<string, Concept[]> = {
  /* ------------------------------------------------------------------ C.1 */
  C1: [
    {
      id: "x_a_x_grafica", label: "Gráfica aceleración–desplazamiento del MAS", level: 2,
      keywords: ["grafica aceleracion desplazamiento", "a = -w2x", "pendiente", "mas"],
      make: (r) => {
        const [w, A] = pick(r, [[15, 4], [20, 5], [25, 4], [20, 3], [12, 5], [15, 6]] as const); // ω en rad s⁻¹, A en cm
        const Am = A / 100, amax = w * w * Am, T = (2 * PI) / w, vmax = w * Am;
        return {
          fig: {
            w: 370, h: 210, alt: "Gráfica de la aceleración en función del desplazamiento de una partícula en MAS: una recta de pendiente negativa que pasa por el origen",
            items: [{
              t: "graph", x: 60, y: 28, w: 285, h: 150, xr: [-A * 1.25, A * 1.25], yr: [-amax * 1.25, amax * 1.25],
              xlabel: "x / cm", ylabel: "a / m s⁻²", xticks: [-A, -A / 2, A / 2, A].map(tk), yticks: [-amax, -amax / 2, amax / 2, amax].map(tk), grid: true,
              series: [{ pts: [[-A, amax], [A, -amax]] }],
            }],
          },
          stem: `La gráfica muestra la aceleración a de una partícula que describe un movimiento armónico simple, en función de su desplazamiento x. La amplitud del movimiento es de ${A} cm.`,
          parts: [
            part("(a)", "Determine, a partir de la gráfica, la magnitud de la aceleración máxima.", [valAny("A1", `a máx = ${fmt(amax)} m s⁻²`, [amax])],
              [`En x = ${A} cm (la amplitud) se lee a máx = ${fmt(amax)} m s⁻²`]),
            part("(b)", "Determine la frecuencia angular ω del movimiento.", [
              method("a = −ω²x (el gradiente de la gráfica es −ω²)", /ω|omega|a\s*=|gradiente|pendiente/i, w * w, "a = −ω²x"),
              val("A1", `ω = ${fmt(w)} rad s⁻¹`, w),
            ], ["|a| = ω² x  →  ω² = a máx / A", `ω² = ${fmt(amax)} / ${fmt(Am)} = ${fmt(w * w)} rad² s⁻²`, `ω = ${fmt(w)} rad s⁻¹`]),
            part("(c)", "Calcule el periodo de la oscilación.", [val("A1", `T = ${fmt(T)} s`, T)],
              ["T = 2π / ω", `T = 2π / ${fmt(w)} = ${fmt(T)} s`]),
            part("(d)", "Calcule la rapidez máxima de la partícula.", [valAny("A1", `v máx = ${fmt(vmax)} m s⁻¹`, [vmax, vmax * 100])],
              ["v máx = ω A", `v máx = ${fmt(w)} × ${fmt(Am)} = ${fmt(vmax)} m s⁻¹`]),
          ],
        };
      },
    },
    {
      id: "x_resorte_vertical", label: "Resorte vertical: periodo, energía y transformaciones", level: 3,
      keywords: ["resorte vertical", "masa colgada", "extension en equilibrio", "periodo", "energia"],
      make: (r) => {
        const e = pick(r, [0.10, 0.20, 0.25, 0.40]), m = pick(r, [0.20, 0.50, 1.0]), fa = pick(r, [0.3, 0.5]);
        const A = fa * e, k = (m * g) / e, T = 2 * PI * Math.sqrt(e / g), w = (2 * PI) / T, vmax = w * A, E = 0.5 * k * A * A;
        const ye = 125, px = 40 / e, ya = fa * 40, y0 = 38;
        const fig: Fig = {
          w: 360, h: 210, alt: "Bloque colgado de un resorte vertical: se indican la extensión e en equilibrio respecto de la longitud natural y la amplitud A de la oscilación",
          items: [
            { t: "ground", x1: 100, y1: y0, x2: 200, y2: y0, side: -1 },
            { t: "spring", x1: 150, y1: y0, x2: 150, y2: ye, coils: 10, width: 14 },
            { t: "rect", x: 125, y: ye, w: 50, h: 28, fill: "light" }, { t: "text", x: 150, y: ye + 19, s: "m", italic: true },
            { t: "line", x1: 70, y1: ye - 40, x2: 140, y2: ye - 40, dash: true, w: 1 }, { t: "text", x: 32, y: ye - 36, s: "longitud", anchor: "start", size: 11 },
            { t: "line", x1: 70, y1: ye, x2: 125, y2: ye, dash: true, w: 1 },
            dim(90, ye - 40, 90, ye), { t: "text", x: 82, y: ye - 16, s: "e", italic: true, anchor: "end" },
            { t: "line", x1: 175, y1: ye, x2: 262, y2: ye, dash: true, w: 1 }, { t: "text", x: 268, y: ye + 4, s: "equilibrio", anchor: "start", size: 11 },
            { t: "line", x1: 175, y1: ye - ya, x2: 235, y2: ye - ya, dash: true, w: 1 },
            dim(222, ye - ya, 222, ye), { t: "text", x: 232, y: ye - ya / 2 + 4, s: "A", italic: true, anchor: "start" },
          ],
        };
        return {
          fig,
          stem: `Un bloque de ${f2(m)} kg cuelga en reposo de un resorte vertical, que se estira ${nc(e)} cm respecto de su longitud natural. Se tira del bloque ${nc(A)} cm hacia abajo desde su posición de equilibrio y se suelta. El bloque oscila verticalmente sin rozamiento.`,
          parts: [
            part("(a)", `Muestre que el periodo de las oscilaciones es de aproximadamente ${f2(T)} s.`, [
              method("En equilibrio mg = ke, de donde k/m = g/e", /m\s*g\s*=\s*k|k\s*e|k\s*=\s*m\s*g|g\s*\/\s*e|m\s*g\s*\/\s*e/i, g / e, "mg = ke"),
              method("T = 2π√(m/k) = 2π√(e/g)", /2\s*π|2π|√|sqrt|m\s*\/\s*k|e\s*\/\s*g/i, T, "T = 2π√(m/k)"),
            ], ["En equilibrio: m g = k e, así que k / m = g / e", "T = 2π √(m / k) = 2π √(e / g)", `T = 2π √(${f2(e)} / 9,8) = ${fmt(T)} s`]),
            part("(b)", "Calcule la rapidez máxima del bloque.", [
              method("ω = 2π/T = √(g/e)", /ω|omega|2\s*π|2π|√/i, w, "ω = 2π/T"),
              valAny("A1", `v máx = ωA = ${fmt(vmax)} m s⁻¹`, [vmax, vmax * 100]),
            ], ["ω = 2π / T = √(g / e)", `ω = ${fmt(w)} rad s⁻¹`, `v máx = ω A = ${fmt(w)} × ${fmt(A)}`, `v máx = ${fmt(vmax)} m s⁻¹`]),
            part("(c)", "Calcule la energía total del sistema oscilante (sin contar la energía potencial gravitatoria).", [
              method("E = ½kA², con k = mg/e (o E = ½mv²máx)", /½|1\/2|0\.5|k\s*A|m\s*v/i, k, "E = ½kA²"),
              val("A1", `E = ${fmt(E)} J`, E),
            ], ["k = m g / e", `k = ${f2(m)} × 9,8 / ${f2(e)} = ${fmt(k)} N m⁻¹`, "E = ½ k A²", `E = ½ × ${fmt(k)} × ${fmt(A)}² = ${fmt(E)} J`]),
            part("(d)", "Resuma cómo cambian las energías cinética, potencial gravitatoria y potencial elástica del bloque cuando se mueve desde la posición de equilibrio hasta el punto más alto de su recorrido.", [
              reason("La energía cinética disminuye hasta hacerse cero en el punto más alto", "la Ec disminuye", "cinetica disminuye", "cinetica decrece", "cinetica se reduce", "cinetica baja", "cinetica es cero", "cinetica se anula", "cinetica nula", "pierde energia cinetica", "cinetica menor"),
              reason("La energía potencial gravitatoria aumenta (el bloque sube)", "la Eg aumenta", "gravitatoria aumenta", "gravitatoria crece", "gravitatoria sube", "gravitatoria se incrementa", "gravitatoria mayor", "gana energia potencial gravitatoria", "gana energia gravitatoria"),
              reason("La energía potencial elástica disminuye (el resorte está menos estirado)", "la Ee disminuye", "elastica disminuye", "elastica decrece", "elastica se reduce", "elastica baja", "elastica menor", "menos estirado", "se estira menos", "pierde energia elastica"),
            ], [
              "La energía cinética disminuye hasta ser cero en el punto más alto (el bloque se detiene un instante).",
              "La energía potencial gravitatoria aumenta porque el bloque sube.",
              "La energía potencial elástica disminuye: el resorte está menos estirado (la suma de las tres se conserva).",
            ], 5),
          ],
        };
      },
    },
  ],

  /* ------------------------------------------------------------------ C.2 */
  C2: [
    {
      id: "x_onda_yx", label: "Leer una gráfica de onda: longitud de onda, rapidez y periodo", level: 2,
      keywords: ["grafica desplazamiento distancia", "longitud de onda", "rapidez de la onda", "periodo"],
      make: (r) => {
        const lam = pick(r, [0.40, 0.60, 0.80, 1.2]), f = pick(r, [5, 10, 15, 20, 25]), A = pick(r, [2, 3, 4]);
        const v = f * lam, T = 1 / f, d25 = 2.5 * lam;
        const yt: number[] = [];
        for (let y = -A; y <= A; y++) if (y !== 0) yt.push(y);
        return {
          fig: {
            w: 380, h: 200, alt: "Gráfica del desplazamiento de los puntos de una cuerda en función de la posición, en un instante dado: dos longitudes de onda de una onda sinusoidal",
            items: [{
              t: "graph", x: 55, y: 28, w: 300, h: 140, xr: [0, 2 * lam], yr: [-A * 1.25, A * 1.25],
              xlabel: "x / m", ylabel: "y / cm", xticks: [lam / 2, lam, 1.5 * lam, 2 * lam].map(tk), yticks: yt, grid: true,
              series: [{ pts: curve((x) => A * Math.sin((2 * PI * x) / lam), 0, 2 * lam, 160) }],
            }],
          },
          stem: `Una onda transversal sinusoidal de frecuencia ${f} Hz se propaga por una cuerda. La gráfica muestra el desplazamiento y de los puntos de la cuerda en función de su posición x en un instante dado.`,
          parts: [
            part("(a)", "Determine la longitud de onda.", [valAny("A1", `λ = ${fmt(lam)} m`, [lam, lam * 100])],
              [`Una longitud de onda es la distancia de una cresta a la siguiente: λ = ${fmt(lam)} m`]),
            part("(b)", "Calcule la rapidez de la onda.", [
              method("v = fλ", /v\s*=\s*f|f\s*λ|fλ|λ\s*[·×*]\s*f|f\s*[·×*]|λ\s*f/i, v, "v = fλ"),
              val("A1", `v = ${fmt(v)} m s⁻¹`, v),
            ], ["v = f λ", `v = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
            part("(c)", "Calcule el periodo de la onda.", [val("A1", `T = ${fmt(T)} s`, T)],
              ["T = 1 / f", `T = 1 / ${f} = ${fmt(T)} s`]),
            part("(d)", "Determine la distancia que avanza la onda en 2,5 periodos.", [valAny("A1", `d = 2,5 λ = ${fmt(d25)} m`, [d25, d25 * 100])],
              ["En un periodo la onda avanza una longitud de onda: d = 2,5 λ", `d = 2,5 × ${fmt(lam)} = ${fmt(d25)} m`]),
          ],
        };
      },
    },
    {
      id: "x_dos_graficas", label: "Dos gráficas de una onda en una cuerda: rapidez y cambio de medio", level: 3,
      keywords: ["dos graficas", "desplazamiento distancia", "desplazamiento tiempo", "rapidez", "cambio de cuerda"],
      make: (r) => {
        const lam = pick(r, [0.40, 0.60, 0.80, 1.2]), Tms = pick(r, [20, 40, 50, 100]), A = pick(r, [2, 3, 4]), k = pick(r, [1.5, 2, 0.5]);
        const T = Tms / 1000, v = lam / T, lam2 = k * lam, f = 1 / T;
        const yt: number[] = [];
        for (let y = -A; y <= A; y++) if (y !== 0) yt.push(y);
        const gx: Fig = {
          w: 380, h: 200, alt: "Gráfica 1: desplazamiento y de los puntos de una cuerda en función de la posición x, dos longitudes de onda",
          items: [{
            t: "graph", x: 55, y: 28, w: 300, h: 140, xr: [0, 2 * lam], yr: [-A * 1.25, A * 1.25],
            xlabel: "x / m", ylabel: "y / mm", xticks: [lam / 2, lam, 1.5 * lam, 2 * lam].map(tk), yticks: yt, grid: true,
            series: [{ pts: curve((x) => A * Math.sin((2 * PI * x) / lam), 0, 2 * lam, 160) }],
          }],
        };
        const gt: Fig = {
          w: 380, h: 200, alt: "Gráfica 2: desplazamiento y de un punto de la cuerda en función del tiempo t, dos periodos",
          items: [{
            t: "graph", x: 55, y: 28, w: 300, h: 140, xr: [0, 2 * Tms], yr: [-A * 1.25, A * 1.25],
            xlabel: "t / ms", ylabel: "y / mm", xticks: [Tms / 2, Tms, 1.5 * Tms, 2 * Tms].map(tk), yticks: yt, grid: true,
            series: [{ pts: curve((t) => A * Math.sin((2 * PI * t) / Tms), 0, 2 * Tms, 160) }],
          }],
        };
        return {
          fig: gx,
          stem: "Una onda transversal sinusoidal se propaga por una cuerda. La gráfica 1 muestra el desplazamiento y de los puntos de la cuerda en función de la posición x en un instante dado. La gráfica 2 (en la parte (b)) muestra cómo varía con el tiempo el desplazamiento de un punto de la cuerda.",
          parts: [
            part("(a)", "Determine, a partir de la gráfica 1, la longitud de onda.", [valAny("A1", `λ = ${fmt(lam)} m`, [lam, lam * 100])],
              [`Se lee la distancia entre dos crestas consecutivas: λ = ${fmt(lam)} m`]),
            part("(b)", "Determine, a partir de la gráfica 2, el periodo de la onda.", [valAny("A1", `T = ${fmt(T)} s = ${Tms} ms`, [T, Tms])],
              [`Tiempo de una oscilación completa: T = ${Tms} ms = ${fmt(T)} s`], 3, gt),
            part("(c)", `Muestre que la rapidez de la onda es de aproximadamente ${fmt(v)} m s⁻¹.`, [
              method("v = λ/T (o v = fλ)", /v\s*=\s*λ|λ\s*\/\s*T|λ\s*\/|f\s*λ|fλ|λ\s*f/i, f, "v = λ/T"),
              val("A1", `v = ${fmt(v)} m s⁻¹`, v),
            ], ["v = λ / T", `v = ${fmt(lam)} / ${fmt(T)}`, `v = ${fmt(v)} m s⁻¹`]),
            part("(d)", `La onda pasa a otra cuerda, en la que su rapidez es ${fmt(k)} veces la anterior. Calcule la longitud de onda en la segunda cuerda.`, [
              val("A1", `λ' = ${fmt(k)} λ = ${fmt(lam2)} m (la frecuencia no cambia)`, lam2),
            ], ["La frecuencia es la misma, así que λ es proporcional a v: λ' = λ v' / v", `λ' = ${fmt(k)} × ${fmt(lam)} = ${fmt(lam2)} m`]),
            part("(e)", "Explique por qué, al cambiar de cuerda, cambia la longitud de onda pero no la frecuencia.", [
              reason("La frecuencia la fija la fuente: llegan a la unión tantas oscilaciones por segundo como salen", "la frecuencia la fija la fuente", "fuente", "misma frecuencia", "mismo numero", "misma cantidad", "frontera", "union", "continuidad", "oscilador"),
              reason("Como v = fλ, con f constante, si v cambia λ cambia en la misma proporción", "v = fλ con f constante", "proporcional", "lambda cambia", "λ cambia", "longitud de onda cambia", "cambia la longitud", "v = f"),
            ], [
              "La frecuencia la determina la fuente: en la unión de las cuerdas llegan y salen las mismas oscilaciones por segundo, la frecuencia es la misma.",
              "Como v = fλ y f no cambia, si cambia la rapidez v, la longitud de onda λ cambia en la misma proporción.",
            ]),
          ],
        };
      },
    },
  ],

  /* ------------------------------------------------------------------ C.3 */
  C3: [
    {
      id: "x_red_grafica", label: "Red de difracción: intensidad frente al ángulo", level: 2,
      keywords: ["red de difraccion", "intensidad angulo", "orden maximo", "lineas por mm"],
      make: (r) => {
        const lam = pick(r, [450, 500, 600, 650]), th1 = pick(r, [10, 20]);
        const s1 = Math.sin(rad(th1)), d = (lam * 1e-9) / s1, N = 1e-3 / d, nmax = Math.floor(d / (lam * 1e-9));
        const peaks: [number, number][] = [];
        for (let n = 1; n <= nmax; n++) {
          const th = deg(Math.asin(n * s1));
          if (th <= 57) peaks.push([th, 0.8 * Math.pow(0.72, n - 1)]);
        }
        const all: [number, number][] = [[0, 1]];
        for (const [th, h] of peaks) { all.push([th, h]); all.push([-th, h]); }
        const I = (x: number) => all.reduce((s, [c, h]) => s + h * Math.exp(-(((x - c) / 0.9) ** 2)), 0);
        return {
          fig: {
            w: 390, h: 210, alt: `Gráfica de la intensidad relativa de la luz que sale de una red de difracción en función del ángulo: un máximo central y máximos simétricos, el primero en ${th1}°`,
            items: [{
              t: "graph", x: 55, y: 28, w: 315, h: 150, xr: [-60, 60], yr: [0, 1.15],
              xlabel: "θ / °", ylabel: "intensidad relativa", xticks: [-60, -40, -20, 0, 20, 40, 60], yticks: [0.5, 1], grid: true,
              series: [{ pts: curve(I, -60, 60, 720) }],
            }],
          },
          stem: `Luz monocromática de longitud de onda ${lam} nm incide perpendicularmente sobre una red de difracción. La gráfica muestra la intensidad relativa de la luz que sale de la red en función del ángulo θ respecto de la normal.`,
          parts: [
            part("(a)", "Determine, a partir de la gráfica, el ángulo del máximo de primer orden.", [val("A1", `θ₁ = ${th1}°`, th1)],
              [`El primer máximo a cada lado del central está en θ₁ = ${th1}°`]),
            part("(b)", "Calcule el espaciado d de la red.", [
              method("nλ = d sen θ", /sin|sen|n\s*λ/i, s1, "nλ = d sen θ"),
              valAny("A1", `d = ${fmt(d)} m = ${fmt(d * 1e6)} μm`, [d, d * 1e6]),
            ], ["n λ = d sen θ, con n = 1", `d = λ / sen θ₁ = ${lam}×10⁻⁹ / sen ${th1}°`, `d = ${fmt(d)} m`]),
            part("(c)", "Calcule el número de líneas por milímetro de la red.", [val("A1", `N = 1 / d = ${fmt(N)} líneas mm⁻¹`, N)],
              ["N = 1 mm / d = 1×10⁻³ / d", `N = ${fmt(N)} líneas por mm`]),
            part("(d)", "Calcule el mayor orden de máximo que se puede observar con esta red.", [val("A1", `n máx = ${nmax}`, nmax)],
              ["n máx es el mayor entero con n λ / d < 1  (sen θ < 1)", `d / λ = ${fmt(d / (lam * 1e-9))}, luego n máx = ${nmax}`]),
          ],
        };
      },
    },
    {
      id: "x_fibra_zigzag", label: "Fibra óptica: ángulo crítico, ángulo de entrada y dispersión de tiempos", level: 3,
      keywords: ["fibra optica", "reflexion total interna", "angulo critico", "nucleo", "revestimiento"],
      make: (r) => {
        const [n1, n2] = pick(r, [[1.50, 1.40], [1.50, 1.44], [1.52, 1.44], [1.48, 1.40]] as const), L = pick(r, [1.0, 2.0, 5.0]);
        const thc = deg(Math.asin(n2 / n1)), beta = 90 - thc, sa = n1 * Math.sin(rad(beta)), al = deg(Math.asin(sa));
        const t0 = (L * 1e3 * n1) / 3.0e8, dt = t0 * (n1 / n2 - 1);
        // diagram: core between y = 70 and 120, cladding strips around it
        const x0 = 50, x1 = 360, yc = 95, yt = 70, yb = 120, tb = Math.tan(rad(beta));
        const ray: number[] = [x0, yc];
        let x = x0, y = yc, dir = 1;
        for (;;) {
          const yn = dir > 0 ? yb : yt, dx = Math.abs(yn - y) / tb;
          if (x + dx >= x1 - 4) { ray.push(q2(x1 - 4), q2(y + dir * (x1 - 4 - x) * tb)); break; }
          x += dx; y = yn; ray.push(q2(x), q2(y)); dir = -dir;
        }
        const items: FigItem[] = [
          { t: "rect", x: x0, y: 46, w: x1 - x0, h: 24, fill: "light" }, { t: "rect", x: x0, y: 120, w: x1 - x0, h: 24, fill: "light" },
          { t: "rect", x: x0, y: yt, w: x1 - x0, h: yb - yt },
          { t: "line", x1: 14, y1: yc, x2: 200, y2: yc, dash: true, w: 1, gray: true },
          { t: "line", x1: x0 - 50 * Math.cos(rad(al)), y1: yc - 50 * Math.sin(rad(al)), x2: x0, y2: yc, arrow: "end", w: 1.6 },
          { t: "poly", pts: ray, w: 1.6 },
          { t: "angle", x: x0, y: yc, r: 30, a1: 180 - al, a2: 180, label: "α" },
          { t: "angle", x: x0, y: yc, r: 36, a1: -beta, a2: 0, label: "β" },
          { t: "text", x: 205, y: 38, s: "revestimiento (n₂)" }, { t: "text", x: 205, y: 160, s: "revestimiento (n₂)" },
          { t: "text", x: 330, y: 111, s: "núcleo (n₁)", size: 11 }, { t: "text", x: 30, y: 130, s: "aire", size: 11 },
        ];
        return {
          fig: { w: 380, h: 175, alt: "Fibra óptica: un rayo entra por la cara plana con ángulo α respecto del eje, se refracta con ángulo β y rebota por reflexión total en la frontera entre el núcleo (n₁) y el revestimiento (n₂)", items },
          stem: `Una fibra óptica tiene un núcleo de índice de refracción n₁ = ${f2(n1)} rodeado de un revestimiento de índice n₂ = ${f2(n2)}. Un rayo de luz entra desde el aire por el extremo plano de la fibra con un ángulo α respecto del eje y viaja por el núcleo con reflexión total interna.`,
          data: "c = 3,0 × 10⁸ m s⁻¹",
          parts: [
            part("(a)", "Calcule el ángulo crítico en la frontera entre el núcleo y el revestimiento.", [
              method("sen θc = n₂ / n₁", /sin|sen|n\s*2\s*\/\s*n\s*1|n₂\s*\/\s*n₁/i, n2 / n1, "sen θc = n₂/n₁"),
              val("A1", `θc = ${fmt(thc)}°`, thc),
            ], ["sen θc = n₂ / n₁", `sen θc = ${f2(n2)} / ${f2(n1)} = ${fmt(n2 / n1)}`, `θc = ${fmt(thc)}°`]),
            part("(b)", "Calcule el máximo valor de α para el que el rayo todavía sufre reflexión total en la frontera.", [
              method("En el extremo, β = 90° − θc (el rayo incide en la frontera con θc)", /90\s*[-−]\s*θ|90°\s*[-−]|β\s*=/i, beta, "β = 90° − θc"),
              method("Ley de Snell en el extremo: sen α = n₁ sen β", /sin|sen/i, sa, "sen α = n₁ sen β"),
              val("A1", `α máx = ${fmt(al)}°`, al),
            ], ["En la frontera el ángulo de incidencia es θc, por lo que β = 90° − θc", `β = 90° − ${fmt(thc)}° = ${fmt(beta)}°`, `sen α = n₁ sen β = ${f2(n1)} × sen ${fmt(beta)}° = ${fmt(sa)}`, `α máx = ${fmt(al)}°`]),
            part("(c)", `El rayo axial viaja a lo largo del eje y otro rayo, con el ángulo máximo, rebota en zigzag con β = ${fmt(beta)}° respecto del eje. Calcule la diferencia entre los tiempos que tardan en recorrer ${f2(L)} km de fibra.`, [
              method("Δt = (L n₁/c)(1/sen θc − 1): el camino del rayo en zigzag es L / sen θc", /L\s*n|n\s*L|1\s*\/\s*sin|1\s*\/\s*sen|L\s*\/\s*sin|L\s*\/\s*sen|c\s*\/\s*n|n\s*1\s*\/\s*n\s*2|n₁\s*\/\s*n₂/i, t0, "Δt = (L n₁/c)(1/sen θc − 1)"),
              valAny("A1", `Δt = ${fmt(dt * 1e9)} ns`, [dt, dt * 1e9, dt * 1e6]),
            ], ["Rayo axial: t₀ = L n₁ / c", `t₀ = ${fmt(L * 1e3)} × ${f2(n1)} / 3,0×10⁸ = ${fmt(t0)} s`, "El rayo en zigzag recorre L / sen θc, luego Δt = t₀ (1 / sen θc − 1) = t₀ (n₁ / n₂ − 1)", `Δt = ${fmt(t0)} × (${f2(n1)} / ${f2(n2)} − 1) = ${fmt(dt)} s = ${fmt(dt * 1e9)} ns`], 5),
            part("(d)", "Sugiera por qué esta diferencia de tiempos limita la rapidez con la que se pueden transmitir pulsos de luz por la fibra.", [
              reason("Los rayos con distintos ángulos siguen trayectorias de distinta longitud y llegan en tiempos distintos", "trayectorias de distinta longitud", "tiempos distintos", "distintos tiempos", "distinto tiempo", "diferente tiempo", "tiempos diferentes", "caminos distintos", "trayectorias distintas", "camino mas largo", "trayectoria mas larga", "mas tiempo", "momentos distintos"),
              reason("El pulso se ensancha y puede solaparse con el siguiente, por lo que no se distinguen", "el pulso se ensancha y se solapa", "ensancha", "solapa", "superpon", "se mezclan", "se confunden", "distorsion", "dispersion", "se extiende", "traslapa"),
            ], [
              "Los rayos que entran con distintos ángulos siguen trayectorias de distinta longitud y llegan en tiempos distintos.",
              "El pulso se ensancha y puede solaparse con el siguiente, así que los pulsos deben estar más espaciados: se limita la rapidez de transmisión.",
            ]),
          ],
        };
      },
    },
  ],

  /* ------------------------------------------------------------------ C.4 */
  C4: [
    {
      id: "x_cuerda_proporciones", label: "Cuerda de guitarra: longitud, tensión y frecuencia fundamental", level: 2,
      keywords: ["cuerda de guitarra", "frecuencia fundamental", "tension", "longitud de la cuerda", "armonico"],
      make: (r) => {
        const L = pick(r, [0.60, 0.65, 0.80]), f1 = pick(r, [110, 196, 220, 330]), p = pick(r, [0.75, 0.80, 0.60]);
        const lam = 2 * L, v = lam * f1, f2c = f1 / p, f4 = 2 * f1;
        const xf = 340 - p * 300;
        return {
          fig: {
            w: 380, h: 190, alt: "Cuerda de guitarra de longitud L fija en sus dos extremos; un dedo la presiona y deja libre a vibrar solo una fracción de su longitud",
            items: [
              { t: "line", x1: 40, y1: 70, x2: 340, y2: 70, w: 1.8 },
              { t: "line", x1: 40, y1: 55, x2: 40, y2: 85, w: 3 }, { t: "line", x1: 340, y1: 55, x2: 340, y2: 85, w: 3 },
              { t: "circle", cx: xf, cy: 58, r: 7, fill: "dark" }, { t: "text", x: xf, y: 40, s: "dedo" },
              { t: "line", x1: 40, y1: 90, x2: 40, y2: 130, dash: true, w: 1 }, { t: "line", x1: 340, y1: 90, x2: 340, y2: 160, dash: true, w: 1 },
              { t: "line", x1: xf, y1: 90, x2: xf, y2: 160, dash: true, w: 1 },
              dim(40, 125, 340, 125), { t: "text", x: 190, y: 120, s: "L", italic: true },
              dim(xf, 155, 340, 155), { t: "text", x: (xf + 340) / 2, y: 150, s: "parte que vibra", size: 12 },
            ],
          },
          stem: `Una cuerda de guitarra de ${f2(L)} m de longitud, fija en sus extremos, vibra en su modo fundamental con una frecuencia de ${f1} Hz.`,
          parts: [
            part("(a)", "Calcule la rapidez de las ondas en la cuerda.", [
              method("En el modo fundamental λ = 2L", /λ\s*=\s*2|2\s*[·×*]?\s*L|2\s*[·×*]\s*0/i, lam, "λ = 2L"),
              val("A1", `v = fλ = ${fmt(v)} m s⁻¹`, v),
            ], ["En el modo fundamental L = λ / 2, así que λ = 2L", `λ = 2 × ${f2(L)} = ${fmt(lam)} m`, `v = f λ = ${f1} × ${fmt(lam)} = ${fmt(v)} m s⁻¹`]),
            part("(b)", `Se presiona la cuerda con un dedo de modo que solo vibra la fracción ${fmt(p)} de su longitud, con la misma tensión. Calcule la nueva frecuencia fundamental.`, [
              val("A1", `f' = f / ${fmt(p)} = ${fmt(f2c)} Hz`, f2c),
            ], ["v no cambia (misma tensión) y f = v / 2L, así que f es inversamente proporcional a L", `f' = ${f1} / ${fmt(p)} = ${fmt(f2c)} Hz`]),
            part("(c)", "Con la longitud original, la tensión de la cuerda se cuadruplica (la masa por unidad de longitud no cambia). Calcule la nueva frecuencia fundamental.", [
              val("A1", `f' = 2f = ${fmt(f4)} Hz`, f4),
            ], ["v ∝ √T: si T se multiplica por 4, v se duplica", "Con la misma longitud, f ∝ v", `f' = 2 × ${f1} = ${fmt(f4)} Hz`]),
            part("(d)", "Explique por qué al acortar la parte vibrante de la cuerda el sonido es más agudo.", [
              reason("La longitud de onda del modo fundamental (2L) es menor; con la misma rapidez, f = v/λ es mayor", "λ = 2L menor, f = v/λ mayor", "longitud de onda menor", "lambda menor", "λ menor", "menor longitud de onda", "f = v", "inversamente proporcional", "frecuencia aumenta", "frecuencia mayor", "aumenta la frecuencia"),
            ], ["Al acortar la cuerda, λ = 2L es menor; la rapidez no cambia, así que f = v / λ aumenta: la frecuencia es mayor y el sonido más agudo."]),
          ],
        };
      },
    },
    {
      id: "x_altavoz_pared", label: "Altavoz frente a una pared: ondas estacionarias y tubo cerrado", level: 3,
      keywords: ["altavoz", "pared", "ondas estacionarias", "microfono", "tubo cerrado", "nodos"],
      make: (r) => {
        const [d, f] = pick(r, [[17, 1000], [20, 850], [25, 680], [34, 500], [40, 425]] as const); // cm, Hz
        const lam = (2 * d) / 100, v = f * lam, L = pick(r, [0.20, 0.25, 0.30]), f1 = v / (4 * L);
        return {
          fig: {
            w: 390, h: 210, alt: "Gráfica de la intensidad relativa registrada por un micrófono en función de su distancia a la pared: máximos a distancias regulares",
            items: [{
              t: "graph", x: 55, y: 28, w: 315, h: 150, xr: [0, 3.25 * d], yr: [0, 1.15],
              xlabel: "x / cm", ylabel: "intensidad relativa", xticks: [d, 2 * d, 3 * d], yticks: [0.5, 1], grid: true,
              series: [{ pts: curve((x) => Math.cos((PI * x) / d) ** 2, 0, 3.25 * d, 260) }],
            }],
          },
          stem: `Un altavoz que emite un tono puro de ${f} Hz se coloca frente a una pared plana que refleja el sonido. Un micrófono se desplaza desde la pared hacia el altavoz, a lo largo de la línea que los une, y registra la intensidad relativa del sonido en función de la distancia x a la pared (gráfica).`,
          parts: [
            part("(a)", "Determine, a partir de la gráfica, la longitud de onda del sonido.", [
              method("Dos máximos consecutivos están separados media longitud de onda", /λ\s*\/\s*2|2\s*[·×*]|medio|mitad|d\s*=|separaci|entre\s+(dos\s+)?m[aá]ximos/i, d, "separación entre máximos = λ/2"),
              valAny("A1", `λ = ${fmt(lam * 100)} cm = ${fmt(lam)} m`, [lam, lam * 100]),
            ], [`Máximos consecutivos separados ${d} cm = λ / 2`, `λ = 2 × ${d} = ${fmt(lam * 100)} cm = ${fmt(lam)} m`]),
            part("(b)", "Calcule la rapidez del sonido en el aire.", [
              method("v = fλ", /v\s*=\s*f|f\s*λ|fλ|λ\s*[·×*]\s*f|f\s*[·×*]|λ\s*f/i, v, "v = fλ"),
              val("A1", `v = ${fmt(v)} m s⁻¹`, v),
            ], ["v = f λ", `v = ${f} × ${fmt(lam)}`, `v = ${fmt(v)} m s⁻¹`]),
            part("(c)", `Se quita la pared y el mismo altavoz se coloca en la boca de un tubo de ${f2(L)} m cerrado en el otro extremo. Calcule la frecuencia más baja a la que el tubo entra en resonancia.`, [
              method("En el modo fundamental de un tubo cerrado L = λ/4", /λ\s*=\s*4|4\s*[·×*]?\s*L|L\s*=\s*λ\s*\/\s*4|4\s*[·×*]\s*0/i, 4 * L, "λ = 4L"),
              val("A1", `f₁ = v / 4L = ${fmt(f1)} Hz`, f1),
            ], ["Tubo cerrado: nodo en el extremo cerrado, antinodo en el abierto; L = λ / 4, λ = 4L", `λ = 4 × ${f2(L)} = ${fmt(4 * L)} m`, `f₁ = v / λ = ${fmt(v)} / ${fmt(4 * L)} = ${fmt(f1)} Hz`]),
            part("(d)", "Explique por qué el micrófono registra posiciones de intensidad máxima y de intensidad mínima.", [
              reason("La onda incidente y la reflejada se superponen (forman una onda estacionaria)", "se superponen la onda incidente y la reflejada", "onda reflejada", "incidente y reflejada", "reflejada y la incidente", "superponen", "superposicion", "interfieren", "interferencia", "estacionaria"),
              reason("Hay interferencia constructiva en unos puntos (antinodos) y destructiva en otros (nodos)", "constructiva en unos puntos y destructiva en otros", "constructiva", "destructiva", "antinodo", "nodos", "maximos y minimos"),
            ], [
              "La onda emitida por el altavoz y la reflejada en la pared tienen la misma frecuencia y se superponen: forman una onda estacionaria.",
              "En algunos puntos la interferencia es constructiva (antinodos, intensidad máxima) y en otros destructiva (nodos, intensidad mínima).",
            ]),
          ],
        };
      },
    },
  ],

  /* ------------------------------------------------------------------ C.5 */
  C5: [
    {
      id: "x_doppler_dos_observadores", label: "Sirena que pasa entre dos observadores", level: 2,
      keywords: ["efecto doppler", "ambulancia", "sirena", "dos observadores", "longitud de onda"],
      make: (r) => {
        const f0 = pick(r, [500, 600, 800, 1000]), u = pick(r, [20, 25, 30]), v = 340;
        const fa = (f0 * v) / (v - u), fb = (f0 * v) / (v + u), lamA = (v - u) / f0;
        return {
          fig: ambulanceFig(),
          stem: `Una ambulancia cuya sirena emite un tono de ${f0} Hz avanza a ${u} m s⁻¹ en línea recta hacia un observador A en reposo, que tiene detrás a otro observador B también en reposo (figura).`,
          data: "Rapidez del sonido en el aire: 340 m s⁻¹",
          parts: [
            part("(a)", "Calcule la frecuencia del sonido que percibe el observador A.", [
              method("f' = f₀ v / (v − u) para una fuente que se acerca", /\(\s*v\s*[-−]\s*u|\(\s*340\s*[-−]/i, v - u, "f' = f₀v/(v − u)"),
              val("A1", `f'A = ${fmt(fa)} Hz`, fa),
            ], ["Fuente que se acerca: f' = f₀ v / (v − u)", `f'A = ${f0} × 340 / (340 − ${u})`, `f'A = ${fmt(fa)} Hz`]),
            part("(b)", "Calcule la frecuencia del sonido que percibe el observador B.", [val("A1", `f'B = ${fmt(fb)} Hz`, fb)],
              ["Fuente que se aleja: f' = f₀ v / (v + u)", `f'B = ${f0} × 340 / (340 + ${u}) = ${fmt(fb)} Hz`]),
            part("(c)", "Calcule la longitud de onda del sonido que llega al observador A.", [
              method("λ' = v / f'A = (v − u) / f₀", /λ|lambda|v\s*\/\s*f|\(\s*v\s*[-−]\s*u|\/\s*f/i, v - u, "λ' = v / f'"),
              val("A1", `λ' = ${fmt(lamA)} m`, lamA),
            ], ["Delante de la fuente los frentes de onda se acercan: λ' = v / f'A", `λ' = 340 / ${fmt(fa)} = ${fmt(lamA)} m`]),
          ],
        };
      },
    },
    {
      id: "x_dron_pared_pulsaciones", label: "Dron con altavoz que se acerca a una pared: Doppler y pulsaciones", level: 3,
      keywords: ["doppler", "pared", "pulsaciones", "batido", "fuente en movimiento", "onda reflejada"],
      make: (r) => {
        const f0 = pick(r, [600, 800, 1000]), u = pick(r, [15, 20, 25]), v = 340;
        const fd = (f0 * v) / (v + u), fr = (f0 * v) / (v - u), fb = fr - fd;
        const fig: Fig = {
          w: 390, h: 175, alt: "Un dron con un altavoz vuela hacia una pared a rapidez u; un micrófono en reposo, detrás del dron, recibe el sonido directo y el sonido reflejado en la pared",
          items: [
            { t: "ground", x1: 345, y1: 20, x2: 345, y2: 130, side: -1 },
            { t: "rect", x: 185, y: 60, w: 60, h: 18, fill: "light" }, { t: "circle", cx: 192, cy: 69, r: 5, fill: "dark" }, { t: "text", x: 218, y: 53, s: "dron", size: 12 },
            { t: "line", x1: 250, y1: 69, x2: 300, y2: 69, arrow: "end", w: 2 }, { t: "text", x: 275, y: 60, s: "u", italic: true },
            { t: "circle", cx: 50, cy: 105, r: 7, fill: "light" }, { t: "text", x: 50, y: 132, s: "micrófono", size: 12 },
            { t: "line", x1: 180, y1: 82, x2: 62, y2: 102, arrow: "end", dash: true, w: 1.2 }, { t: "text", x: 125, y: 80, s: "directo", size: 12 },
            { t: "line", x1: 342, y1: 112, x2: 62, y2: 110, arrow: "end", dash: true, w: 1.2 }, { t: "text", x: 200, y: 128, s: "reflejado", size: 12 },
          ],
        };
        return {
          fig,
          stem: `Un dron que lleva un altavoz con un tono de ${f0} Hz vuela en línea recta hacia una pared plana a ${u} m s⁻¹. Un micrófono en reposo, en la misma línea y detrás del dron, recibe el sonido que llega directamente del altavoz y también el sonido reflejado en la pared (figura).`,
          data: "Rapidez del sonido en el aire: 340 m s⁻¹",
          parts: [
            part("(a)", "Calcule la frecuencia del sonido directo que recibe el micrófono.", [
              method("Fuente que se aleja del micrófono: f' = f₀ v / (v + u)", /\(\s*v\s*\+\s*u|\(\s*340\s*\+/i, v + u, "f' = f₀v/(v + u)"),
              val("A1", `f_d = ${fmt(fd)} Hz`, fd),
            ], ["Respecto del micrófono, el dron se aleja: f' = f₀ v / (v + u)", `f_d = ${f0} × 340 / (340 + ${u}) = ${fmt(fd)} Hz`]),
            part("(b)", "Determine la frecuencia del sonido reflejado que recibe el micrófono.", [
              method("La pared (en reposo) recibe f₀v/(v − u) y la reemite con esa frecuencia", /\(\s*v\s*[-−]\s*u|\(\s*340\s*[-−]/i, v - u, "f_pared = f₀v/(v − u)"),
              val("A1", `f_r = ${fmt(fr)} Hz`, fr),
            ], ["Para la pared, el dron se acerca: f_pared = f₀ v / (v − u)", `f_pared = ${f0} × 340 / (340 − ${u}) = ${fmt(fr)} Hz`, "La pared, en reposo, reemite el sonido con esa misma frecuencia, que el micrófono (también en reposo) recibe sin cambio", `f_r = ${fmt(fr)} Hz`]),
            part("(c)", "Calcule la frecuencia de las pulsaciones que oye una persona situada junto al micrófono.", [
              val("A1", `f_pulsaciones = f_r − f_d = ${fmt(fb)} Hz`, fb),
            ], ["Frecuencia de pulsaciones = diferencia de frecuencias", `f_p = ${fmt(fr)} − ${fmt(fd)} = ${fmt(fb)} Hz`]),
            part("(d)", "Explique por qué la persona oye que el volumen sube y baja periódicamente.", [
              reason("Llegan dos ondas de frecuencias ligeramente distintas (la directa y la reflejada) que se superponen", "llegan dos ondas de frecuencias distintas que se superponen", "dos ondas", "ambas ondas", "directa y reflejada", "directo y reflejado", "superpon", "superposicion", "interfieren", "interferencia"),
              reason("La interferencia es alternativamente constructiva y destructiva a la frecuencia de la diferencia", "alterna constructiva y destructiva", "constructiva", "destructiva", "maximos y minimos", "pulsaciones", "pulsos", "batido", "sube y baja", "fluctua"),
            ], [
              "Al micrófono llegan dos ondas con frecuencias ligeramente distintas, la directa y la reflejada, que se superponen.",
              "Su interferencia es alternativamente constructiva y destructiva: la amplitud (el volumen) oscila a la frecuencia de la diferencia, las pulsaciones.",
            ]),
            part("(e)", "Si la rapidez u del dron se duplica (con u mucho menor que la rapidez del sonido), ¿por qué factor se multiplica aproximadamente la frecuencia de las pulsaciones?", [
              val("A1", "Δf ≈ 2f₀u/v ∝ u: el factor es 2", 2),
            ], ["Con u ≪ v, Δf ≈ 2 f₀ u / v, proporcional a u", "Si u se duplica, Δf se multiplica por 2."]),
          ],
        };
      },
    },
  ],
};
