/**
 * Unit A · Espacio, tiempo y movimiento. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, C_LIGHT, type FigItem, type FormulaGroup, type Topic } from "./kit.ts";

const AR = (x1: number, y1: number, x2: number, y2: number, w = 1.6): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "end", w });
const TX = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle"): FigItem => ({ t: "text", x, y, s, anchor });
const RAD = Math.PI / 180;

export const topics: Topic[] = [
  {
    id: "A1", unit: "A", name: "A.1 Cinemática",
    concepts: [
      {
        id: "suvat", label: "Aceleración constante (suvat)", keywords: ["acelera", "aceleracion constante", "suvat", "mrua", "uniformemente"],
        make: (r) => {
          const a = pick(r, [1.5, 2.0, 2.5, 3.0, 3.5, 4.0]), t = pick(r, [4, 5, 6, 8, 10]);
          const v = a * t, s = 0.5 * a * t * t;
          return {
            stem: `Un coche parte del reposo y acelera uniformemente a ${f2(a)} m s⁻² durante ${t} s.`,
            parts: [
              part("(a)", `Calcule la rapidez del coche al cabo de ${t} s.`, [val("A1", `v = u + at = ${fmt(v)} m s⁻¹`, v)],
                [`v = u + at = 0 + ${f2(a)} × ${t}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(b)", "Determine la distancia recorrida en ese tiempo.", [
                method("Usa s = ½at², o s = (u + v)t / 2", /½|1\/2|0\.5|t\^?2|t²|\(\s*u\s*\+\s*v\s*\)/i, s, "s = ½at²"),
                val("A1", `s = ${fmt(s)} m`, s),
              ], ["s = ½ a t²", `s = 0,5 × ${f2(a)} × ${t}²`, `s = ${fmt(s)} m`]),
            ],
          };
        },
      },
      {
        id: "caida", label: "Caída libre", keywords: ["caida libre", "se deja caer", "gravedad", "g = 9"],
        make: (r) => {
          const h = pick(r, [12, 18, 25, 32, 45, 60]);
          const t = Math.sqrt((2 * h) / g), v = Math.sqrt(2 * g * h);
          return {
            stem: `Se deja caer una piedra desde el reposo a ${h} m del suelo. Ignore la resistencia del aire y use g = 9,8 m s⁻².`,
            parts: [
              part("(a)", "Calcule el tiempo que tarda la piedra en llegar al suelo.", [
                method("Usa s = ½gt², o t = √(2h / g)", /2\s*h|½|0\.5|1\/2|g\s*t/i, t, "s = ½gt²"),
                val("A1", `t = ${fmt(t)} s`, t),
              ], ["h = ½ g t²  →  t = √(2h / g)", `t = √(2 × ${h} / 9,8)`, `t = ${fmt(t)} s`]),
              part("(b)", "Calcule la rapidez de la piedra al llegar al suelo.", [val("A1", `v = √(2gh) = ${fmt(v)} m s⁻¹`, v)],
                [`v = √(2 × 9,8 × ${h})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "proyectil", label: "Tiro horizontal", keywords: ["proyectil", "tiro horizontal", "parabolico", "alcance", "horizontal"],
        make: (r) => {
          const h = pick(r, [1.2, 1.8, 2.5, 3.2, 5.0]), u = pick(r, [3, 4, 5, 6, 8]);
          const t = Math.sqrt((2 * h) / g), x = u * t;
          return {
            stem: `Una pelota rueda sobre una mesa horizontal de ${f2(h)} m de altura y sale del borde con rapidez ${u} m s⁻¹. Ignore la resistencia del aire (g = 9,8 m s⁻²).`,
            parts: [
              part("(a)", "Calcule el tiempo de vuelo de la pelota.", [val("A1", `t = √(2h / g) = ${fmt(t)} s`, t)],
                ["La caída vertical empieza desde el reposo: h = ½ g t²", `t = √(2 × ${f2(h)} / 9,8) = ${fmt(t)} s`]),
              part("(b)", "Determine la distancia horizontal que recorre la pelota hasta tocar el suelo.", [
                method("La velocidad horizontal es constante: x = u t", /u\s*[·×*x]?\s*t|v\s*[·×*x]\s*t|x\s*=/i, x, "x = ut"),
                val("A1", `x = ${fmt(x)} m`, x),
              ], ["x = u t (la velocidad horizontal no cambia)", `x = ${u} × ${fmt(t)}`, `x = ${fmt(x)} m`]),
            ],
          };
        },
      },
      {
        id: "grafvt", label: "Gráficas velocidad–tiempo", keywords: ["grafica v-t", "pendiente", "area bajo la curva", "velocidad-tiempo"],
        make: (r) => {
          const v1 = pick(r, [4, 6, 8, 10]), t1 = pick(r, [2, 4]), t2 = t1 + pick(r, [4, 6]), t3 = t2 + pick(r, [2, 4]);
          const a = v1 / t1, d = 0.5 * v1 * t1 + v1 * (t2 - t1) + 0.5 * v1 * (t3 - t2), vm = d / t3;
          return {
            stem: `La gráfica muestra cómo varía la velocidad de un tren de juguete que se mueve en línea recta por una vía horizontal durante ${t3} s.`,
            fig: {
              w: 360, h: 200, alt: "Gráfica velocidad–tiempo: aumento lineal, tramo de velocidad constante y frenado lineal hasta el reposo",
              items: [{
                t: "graph", x: 55, y: 30, w: 270, h: 130, xr: [0, t3], yr: [0, v1], xticks: [0, t1, t2, t3], yticks: [0, v1], grid: true,
                xlabel: "t / s", ylabel: "v / m s⁻¹", series: [{ pts: [[0, 0], [t1, v1], [t2, v1], [t3, 0]] }],
              }],
            },
            parts: [
              part("(a)", "Determine la aceleración del tren durante el primer tramo del movimiento.", [
                method("La aceleración es la pendiente del gráfico: a = Δv / Δt", /pendiente|gradiente|Δ\s*v|\/\s*t/i, v1, "a = Δv / Δt"),
                val("A1", `a = ${fmt(a)} m s⁻²`, a),
              ], ["a = pendiente del gráfico v–t = Δv / Δt", `a = ${v1} / ${t1}`, `a = ${fmt(a)} m s⁻²`]),
              part("(b)", "Calcule la distancia total que recorre el tren.", [
                method("La distancia es el área bajo el gráfico v–t", /área|area|trapecio|½|1\/2/i, 0.5 * v1 * t1, "área bajo la curva"),
                val("A1", `d = ${fmt(d)} m`, d),
              ], ["distancia = área bajo el gráfico v–t", `d = ½ × ${v1} × ${t1} + ${v1} × ${t2 - t1} + ½ × ${v1} × ${t3 - t2}`, `d = ${fmt(d)} m`]),
              part("(c)", "Calcule la rapidez media del tren durante todo el recorrido.", [val("A1", `rapidez media = d / t = ${fmt(vm)} m s⁻¹`, vm)],
                [`rapidez media = d / t = ${fmt(d)} / ${t3}`, `rapidez media = ${fmt(vm)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "vertical", label: "Lanzamiento vertical", keywords: ["hacia arriba", "lanzamiento vertical", "altura maxima", "punto mas alto"],
        make: (r) => {
          const u = pick(r, [12, 15, 18, 20, 24]);
          const H = (u * u) / (2 * g), t = u / g;
          return {
            stem: `Se lanza una pelota verticalmente hacia arriba desde el suelo con una rapidez inicial de ${u} m s⁻¹. Ignore la resistencia del aire (g = 9,8 m s⁻²).`,
            fig: {
              w: 300, h: 190, alt: `Una pelota lanzada hacia arriba con rapidez inicial ${u} m s⁻¹`,
              items: [
                { t: "ground", x1: 90, y1: 170, x2: 210, y2: 170 },
                { t: "circle", cx: 150, cy: 160, r: 7, fill: "dark" },
                AR(150, 148, 150, 50), TX(162, 100, `u = ${u} m s⁻¹`, "start"),
              ],
            },
            parts: [
              part("(a)", "Calcule la altura máxima que alcanza la pelota.", [
                method("En el punto más alto v = 0: v² = u² − 2gH", /v\s*²\s*=|v\^2\s*=|2\s*g\s*h|u\s*²\s*\/\s*2|2\s*a\s*s/i, u * u, "v² = u² − 2gH"),
                val("A1", `H = ${fmt(H)} m`, H),
              ], ["En el punto más alto v = 0:  0 = u² − 2 g H", `H = u² / 2g = ${u}² / (2 × 9,8)`, `H = ${fmt(H)} m`]),
              part("(b)", "Determine el tiempo que tarda la pelota en llegar al punto más alto.", [val("A1", `t = u / g = ${fmt(t)} s`, t)],
                ["0 = u − g t", `t = u / g = ${u} / 9,8`, `t = ${fmt(t)} s`]),
              part("(c)", "Explique por qué la aceleración de la pelota en el punto más alto no es nula aunque su velocidad lo sea.", [
                reason("Sigue actuando la gravedad (peso): a = g hacia abajo", "la gravedad / el peso sigue actuando", "gravedad", "peso", "9,8", "hacia abajo", "sigue actuando", "fuerza"),
              ], ["Sobre la pelota sigue actuando su peso (la gravedad)", "a = g = 9,8 m s⁻² hacia abajo en todo el vuelo; solo la velocidad se anula un instante"]),
            ],
          };
        },
      },
      {
        id: "oblicuo", label: "Tiro oblicuo", keywords: ["tiro oblicuo", "angulo de lanzamiento", "componentes", "alcance", "proyectil"],
        make: (r) => {
          const v0 = pick(r, [15, 20, 25, 30]), th = pick(r, [30, 40, 50, 60]);
          const vx = v0 * Math.cos(th * RAD), vy = v0 * Math.sin(th * RAD), T = (2 * vy) / g, R = vx * T;
          const L = Math.min(270, 320 / Math.tan(th * RAD)), hc = (L / 2) * Math.tan(th * RAD), x0 = 30, y0 = 150;
          return {
            stem: `Un balón se patea desde el suelo con una rapidez de ${v0} m s⁻¹ y un ángulo de ${th}° sobre la horizontal. Ignore la resistencia del aire y use g = 9,8 m s⁻². El terreno es horizontal.`,
            fig: {
              w: 360, h: 170, alt: `Trayectoria parabólica de un balón lanzado a ${th}° sobre la horizontal`,
              items: [
                { t: "ground", x1: 10, y1: y0, x2: 350, y2: y0 },
                { t: "path", d: `M${x0} ${y0} Q${x0 + L / 2} ${y0 - hc} ${x0 + L} ${y0}`, dash: true, w: 1.4 },
                AR(x0, y0, x0 + 55 * Math.cos(th * RAD), y0 - 55 * Math.sin(th * RAD)),
                { t: "angle", x: x0, y: y0, r: 30, a1: 0, a2: th, label: `${th}°` },
                TX(x0, y0 + 16, `v = ${v0} m s⁻¹`, "start"),
              ],
            },
            parts: [
              part("(a)", "Determine las componentes horizontal y vertical de la velocidad inicial.", [
                val("A1", `vₓ = v cosθ = ${fmt(vx)} m s⁻¹`, vx),
                val("A1", `v_y = v senθ = ${fmt(vy)} m s⁻¹`, vy),
              ], [`vₓ = v cosθ = ${v0} × cos ${th}° = ${fmt(vx)} m s⁻¹`, `v_y = v senθ = ${v0} × sen ${th}° = ${fmt(vy)} m s⁻¹`]),
              part("(b)", "Calcule el tiempo que el balón permanece en el aire.", [
                method("Sube y baja en el mismo tiempo: t = 2v_y / g", /2\s*[·×*]?\s*v|2\s*v_?y|v_?y\s*\/\s*g|t\s*=\s*2/i, vy / g, "t = 2v_y / g"),
                val("A1", `t = ${fmt(T)} s`, T),
              ], ["El balón vuelve a la altura inicial: 0 = v_y t − ½ g t²", `t = 2 v_y / g = 2 × ${fmt(vy)} / 9,8`, `t = ${fmt(T)} s`]),
              part("(c)", "Calcule el alcance horizontal del balón.", [
                method("La componente horizontal es constante: x = vₓ t", /v\s*[ₓx]\s*[·×*]?\s*t|x\s*=/i, R, "x = vₓ t"),
                val("A1", `x = ${fmt(R)} m`, R),
              ], [`x = vₓ t = ${fmt(vx)} × ${fmt(T)}`, `x = ${fmt(R)} m`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "A2", unit: "A", name: "A.2 Fuerzas y momento lineal",
    concepts: [
      {
        id: "newton2", label: "Segunda ley de Newton", keywords: ["segunda ley", "f = ma", "fuerza resultante", "rozamiento", "friccion"],
        make: (r) => {
          const m = pick(r, [2.0, 4.0, 5.0, 8.0, 12]), F = pick(r, [20, 30, 40, 50, 60]), f = pick(r, [4, 6, 8, 10]);
          const net = F - f, a = net / m;
          return {
            stem: `Se empuja una caja de ${f2(m)} kg sobre el suelo con una fuerza horizontal de ${F} N. La fuerza de rozamiento sobre la caja es de ${f} N.`,
            parts: [
              part("(a)", "Calcule la fuerza resultante sobre la caja.", [val("A1", `F = ${F} − ${f} = ${fmt(net)} N`, net)],
                [`F_res = ${F} − ${f}`, `F_res = ${fmt(net)} N`]),
              part("(b)", "Calcule la aceleración de la caja.", [val("A1", `a = F / m = ${fmt(a)} m s⁻²`, a)],
                [`a = F_res / m = ${fmt(net)} / ${f2(m)}`, `a = ${fmt(a)} m s⁻²`]),
            ],
          };
        },
      },
      {
        id: "impulso", label: "Impulso y momento lineal", keywords: ["impulso", "momento lineal", "cantidad de movimiento", "rebota", "Δp"],
        make: (r) => {
          const m = pick(r, [0.15, 0.20, 0.25, 0.40, 0.50]), u = pick(r, [8, 10, 12, 15]), v = pick(r, [5, 6, 7]), dt = pick(r, [0.02, 0.04, 0.05, 0.08]);
          const dp = m * (u + v), F = dp / dt;
          return {
            stem: `Una pelota de ${f2(m)} kg golpea perpendicularmente una pared con rapidez ${u} m s⁻¹ y rebota con rapidez ${v} m s⁻¹. El contacto dura ${fmt(dt, 1)} s.`,
            parts: [
              part("(a)", "Calcule la magnitud del cambio en el momento lineal de la pelota.", [
                { code: "M1", text: "La velocidad cambia de sentido: Δp = m(v + u)", miss: "cambia de sentido", test: (_, n) => near(n, u + v, TOL) || near(n, dp, TOL) },
                val("A1", `Δp = ${fmt(dp)} N s`, dp),
              ], ["La velocidad cambia de sentido: Δp = m(v − (−u)) = m(v + u)", `Δp = ${f2(m)} × (${v} + ${u})`, `Δp = ${fmt(dp)} N s`]),
              part("(b)", "Calcule la fuerza media que ejerce la pared sobre la pelota.", [val("A1", `F = Δp / Δt = ${fmt(F)} N`, F)],
                [`F = Δp / Δt = ${fmt(dp)} / ${fmt(dt, 1)}`, `F = ${fmt(F)} N`]),
            ],
          };
        },
      },
      {
        id: "choque", label: "Choques y conservación del momento", keywords: ["choque", "colision", "conservacion del momento", "unidos", "inelastico"],
        make: (r) => {
          const m1 = pick(r, [1.0, 1.5, 2.0, 3.0]), u1 = pick(r, [4, 5, 6, 8]), m2 = pick(r, [0.5, 1.0, 2.0, 2.5]);
          const vf = (m1 * u1) / (m1 + m2), Ei = 0.5 * m1 * u1 * u1, Ef = 0.5 * (m1 + m2) * vf * vf, loss = Ei - Ef;
          return {
            stem: `Un carrito de ${f2(m1)} kg que se mueve a ${u1} m s⁻¹ choca con otro carrito de ${f2(m2)} kg en reposo. Después del choque se mueven unidos.`,
            parts: [
              part("(a)", "Calcule la rapidez de los carritos justo después del choque.", [
                { code: "M1", text: "Conservación del momento: m₁u₁ = (m₁ + m₂)v", miss: "conservación del momento", test: (l, n) => near(n, m1 * u1, TOL) || hasAny(l, "conserv") || /\(\s*[\d.]+\s*\+\s*[\d.]+\s*\)\s*[·×*]?\s*v/.test(normalize(l)) },
                val("A1", `v = ${fmt(vf)} m s⁻¹`, vf),
              ], ["m₁u₁ = (m₁ + m₂) v", `${f2(m1)} × ${u1} = ${fmt(m1 * u1)} = (${f2(m1)} + ${f2(m2)}) v`, `v = ${fmt(vf)} m s⁻¹`]),
              part("(b)", "Determine la energía cinética que se pierde en el choque.", [
                { code: "M1", text: `Ek antes = ${fmt(Ei)} J o Ek después = ${fmt(Ef)} J`, miss: "Ek antes y después", test: (_, n) => near(n, Ei, TOL) || near(n, Ef, TOL) },
                val("A1", `pérdida = ${fmt(loss)} J`, loss),
              ], [`Ek antes = ½ × ${f2(m1)} × ${u1}² = ${fmt(Ei)} J`, `Ek después = ½ × ${fmt(m1 + m2, 2)} × ${fmt(vf)}² = ${fmt(Ef)} J`, `pérdida = ${fmt(loss)} J`]),
            ],
          };
        },
      },
      {
        id: "inclinado", label: "Plano inclinado con rozamiento", keywords: ["plano inclinado", "rozamiento", "componente del peso", "desliza"],
        make: (r) => {
          const m = pick(r, [2, 3, 4, 5]), th = pick(r, [30, 35, 40]), mu = pick(r, [0.10, 0.15, 0.20, 0.25]);
          const s = Math.sin(th * RAD), c = Math.cos(th * RAD);
          const Wp = m * g * s, N = m * g * c, Ff = mu * N, a = (Wp - Ff) / m;
          const L = 210, base = L * c, H = L * s, x0 = 50, yG = 170;
          const A = [x0, yG - H], d = [c, s], n = [s, -c], bw = 40, bh = 26, s0 = 0.5 * L;
          const p0 = [A[0] + d[0] * (s0 - bw / 2), A[1] + d[1] * (s0 - bw / 2)];
          const blk = [p0, [p0[0] + d[0] * bw, p0[1] + d[1] * bw], [p0[0] + d[0] * bw + n[0] * bh, p0[1] + d[1] * bw + n[1] * bh], [p0[0] + n[0] * bh, p0[1] + n[1] * bh]].flat();
          const cx = p0[0] + (d[0] * bw + n[0] * bh) / 2, cy = p0[1] + (d[1] * bw + n[1] * bh) / 2;
          return {
            stem: `Un bloque de ${m} kg desliza hacia abajo por un plano inclinado ${th}° respecto de la horizontal. El coeficiente de rozamiento dinámico entre el bloque y el plano es ${f2(mu)} (g = 9,8 m s⁻²).`,
            fig: {
              w: 300, h: 190, alt: `Bloque sobre un plano inclinado ${th}° con su peso W, la normal N y el rozamiento F`,
              items: [
                { t: "poly", pts: [A[0], A[1], x0 + base, yG, x0, yG], close: true, fill: "light" },
                { t: "ground", x1: 30, y1: yG, x2: 280, y2: yG },
                { t: "poly", pts: blk, close: true, fill: "dark" },
                AR(cx, cy, cx, cy + 48), TX(cx - 8, cy + 58, "W", "end"),
                AR(cx, cy, cx + n[0] * 50, cy + n[1] * 50), TX(cx + n[0] * 50 + 6, cy + n[1] * 50 - 2, "N", "start"),
                AR(cx, cy, cx - d[0] * 40, cy - d[1] * 40), TX(cx - d[0] * 40 - 6, cy - d[1] * 40 - 4, "F", "end"),
                { t: "angle", x: x0 + base, y: yG, r: 32, a1: 180 - th, a2: 180, label: `${th}°` },
              ],
            },
            parts: [
              part("(a)", "Calcule la componente del peso del bloque paralela al plano.", [
                method("Componente paralela: mg senθ", /sen|sin/i, m * g, "mg senθ"),
                val("A1", `mg senθ = ${fmt(Wp)} N`, Wp),
              ], [`mg senθ = ${m} × 9,8 × sen ${th}°`, `mg senθ = ${fmt(Wp)} N`]),
              part("(b)", "Calcule la fuerza de rozamiento sobre el bloque.", [
                val("M1", `N = mg cosθ = ${fmt(N)} N`, N),
                val("A1", `F = μN = ${fmt(Ff)} N`, Ff),
              ], [`N = mg cosθ = ${m} × 9,8 × cos ${th}° = ${fmt(N)} N`, `F = μ N = ${f2(mu)} × ${fmt(N)}`, `F = ${fmt(Ff)} N`]),
              part("(c)", "Determine la aceleración del bloque.", [val("A1", `a = (mg senθ − F) / m = ${fmt(a)} m s⁻²`, a)],
                [`F_res = mg senθ − F = ${fmt(Wp)} − ${fmt(Ff)} = ${fmt(Wp - Ff)} N`, `a = F_res / m = ${fmt(Wp - Ff)} / ${m}`, `a = ${fmt(a)} m s⁻²`]),
            ],
          };
        },
      },
      {
        id: "poleas", label: "Masas unidas por una cuerda (polea)", keywords: ["polea", "cuerda", "tension", "dos masas", "atwood"],
        make: (r) => {
          const m1 = pick(r, [2.0, 3.0, 4.0]), m2 = pick(r, [1.0, 1.5, 2.0]);
          const a = (m2 * g) / (m1 + m2), T = m1 * a;
          return {
            stem: `Un bloque de ${f2(m1)} kg descansa sobre una mesa horizontal lisa (sin rozamiento). Está unido por una cuerda ligera, que pasa por una polea ideal en el borde de la mesa, a una masa colgante de ${f2(m2)} kg. El sistema se suelta desde el reposo (g = 9,8 m s⁻²).`,
            fig: {
              w: 340, h: 200, alt: "Bloque sobre una mesa unido por una cuerda sobre una polea a una masa colgante",
              items: [
                { t: "rect", x: 30, y: 70, w: 220, h: 18, fill: "light" },
                { t: "line", x1: 50, y1: 88, x2: 50, y2: 180 }, { t: "line", x1: 230, y1: 88, x2: 230, y2: 180 },
                { t: "rect", x: 80, y: 36, w: 50, h: 34, fill: "light" }, TX(105, 58, "m₁"),
                { t: "circle", cx: 250, cy: 62, r: 10 },
                { t: "line", x1: 130, y1: 52, x2: 250, y2: 52 },
                { t: "line", x1: 260, y1: 62, x2: 260, y2: 120 },
                { t: "rect", x: 240, y: 120, w: 40, h: 34, fill: "light" }, TX(260, 142, "m₂"),
              ],
            },
            parts: [
              part("(a)", "Calcule la aceleración del sistema.", [
                method("Para el sistema: m₂g = (m₁ + m₂)a", /m\s*₂\s*g|\(\s*m\s*₁\s*\+\s*m\s*₂\s*\)|m2\s*g|\(.*\+.*\)\s*[·×*]?\s*a/i, m2 * g, "m₂g = (m₁ + m₂)a"),
                val("A1", `a = ${fmt(a)} m s⁻²`, a),
              ], ["La fuerza que acelera el sistema es el peso de m₂: m₂ g = (m₁ + m₂) a", `a = ${f2(m2)} × 9,8 / (${f2(m1)} + ${f2(m2)})`, `a = ${fmt(a)} m s⁻²`]),
              part("(b)", "Calcule la tensión de la cuerda.", [val("A1", `T = m₁a = ${fmt(T)} N`, T)],
                ["Sobre el bloque de la mesa, la tensión es la fuerza resultante: T = m₁ a", `T = ${f2(m1)} × ${fmt(a)}`, `T = ${fmt(T)} N`]),
              part("(c)", "Explique por qué la tensión es menor que el peso de la masa colgante.", [
                reason("La masa colgante acelera hacia abajo: hay fuerza resultante hacia abajo (m₂g − T = m₂a)", "acelera: peso > tensión", "acelera", "aceleracion", "resultante", "no esta en equilibrio", "baja", "desciende"),
              ], ["La masa colgante acelera hacia abajo", "Hay una fuerza resultante hacia abajo: m₂ g − T = m₂ a > 0, así que T < m₂ g"]),
            ],
          };
        },
      },
      {
        id: "circular", label: "Movimiento circular y fuerza centrípeta", keywords: ["circular", "fuerza centripeta", "curva", "aceleracion centripeta"],
        make: (r) => {
          const m = pick(r, [800, 1000, 1200, 1500]), v = pick(r, [10, 12, 15]), R = pick(r, [40, 50, 60, 80]);
          const ac = (v * v) / R, F = m * ac, mu = ac / g;
          return {
            stem: `Un automóvil de ${m} kg recorre con rapidez constante de ${v} m s⁻¹ una curva horizontal circular de ${R} m de radio (g = 9,8 m s⁻²). La figura muestra la curva vista desde arriba.`,
            fig: {
              w: 320, h: 200, alt: "Vista desde arriba de un automóvil en una curva circular con su velocidad y la fuerza hacia el centro",
              items: [
                { t: "circle", cx: 150, cy: 100, r: 70, dash: true },
                { t: "dot", x: 150, y: 100, r: 2.5 },
                { t: "line", x1: 150, y1: 100, x2: 150, y2: 170, w: 1.1 },
                TX(158, 146, `r = ${R} m`, "start"),
                { t: "rect", x: 150 + 70 - 10, y: 100 - 8, w: 20, h: 16, fill: "dark" },
                AR(220, 92, 220, 42), TX(228, 52, "v", "start"),
                AR(208, 100, 168, 100), TX(188, 120, "F"),
              ],
            },
            parts: [
              part("(a)", "Calcule la aceleración centrípeta del automóvil.", [val("A1", `a = v² / r = ${fmt(ac)} m s⁻²`, ac)],
                [`a = v² / r = ${v}² / ${R}`, `a = ${fmt(ac)} m s⁻²`]),
              part("(b)", "Indique qué fuerza proporciona la fuerza centrípeta sobre el automóvil en una curva sin peralte.", [
                reason("El rozamiento (estático) entre los neumáticos y la carretera", "el rozamiento entre neumáticos y suelo", "rozamiento", "friccion", "roce"),
              ], ["La fuerza centrípeta la proporciona el rozamiento (estático) entre los neumáticos y la carretera"]),
              part("(c)", "Calcule el valor mínimo del coeficiente de rozamiento estático para que el automóvil no derrape.", [
                method("Rozamiento = fuerza centrípeta: μmg = mv²/r", /μ\s*[·×*]?\s*m\s*[·×*]?\s*g|μ\s*=|mv\s*²\s*\/\s*r|m\s*a/i, F, "μmg = mv²/r"),
                val("A1", `μ = ${fmt(mu)}`, mu),
              ], ["En el límite: μ m g = m v² / r  →  μ = v² / (r g)", `μ = ${v}² / (${R} × 9,8)`, `μ = ${fmt(mu)}`]),
            ],
          };
        },
      },
      {
        id: "fuerzat", label: "Gráfica fuerza–tiempo (impulso)", keywords: ["fuerza-tiempo", "impulso", "area bajo la curva", "patada", "golpe"],
        make: (r) => {
          const t2 = pick(r, [4, 6, 8, 10]), Fm = pick(r, [400, 600, 800, 1000]), m = pick(r, [0.40, 0.50, 0.60]);
          const J = 0.5 * Fm * t2 * 1e-3, v = J / m, Fa = J / (t2 * 1e-3);
          return {
            stem: `Un futbolista patea un balón de ${f2(m)} kg que está en reposo. La gráfica muestra la fuerza que el pie ejerce sobre el balón durante el contacto.`,
            fig: {
              w: 360, h: 200, alt: "Gráfica fuerza–tiempo triangular de un golpe sobre un balón",
              items: [{
                t: "graph", x: 60, y: 30, w: 260, h: 130, xr: [0, t2], yr: [0, Fm], xticks: [0, t2 / 2, t2], yticks: [0, Fm / 2, Fm], grid: true,
                xlabel: "t / ms", ylabel: "F / N", series: [{ pts: [[0, 0], [t2 / 2, Fm], [t2, 0]] }],
              }],
            },
            parts: [
              part("(a)", "Determine el impulso que recibe el balón.", [
                method("El impulso es el área bajo el gráfico F–t", /área|area|½|1\/2|triangulo/i, J, "área bajo F–t"),
                val("A1", `J = ${fmt(J)} N s`, J),
              ], ["Impulso = área bajo el gráfico F–t", `J = ½ × ${Fm} × ${t2} × 10⁻³`, `J = ${fmt(J)} N s`]),
              part("(b)", "Calcule la rapidez con que sale el balón.", [val("A1", `v = J / m = ${fmt(v)} m s⁻¹`, v)],
                ["J = Δp = m v", `v = ${fmt(J)} / ${f2(m)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Calcule la fuerza media sobre el balón durante el contacto.", [val("A1", `F = J / Δt = ${fmt(Fa)} N`, Fa)],
                [`F = J / Δt = ${fmt(J)} / (${t2} × 10⁻³)`, `F = ${fmt(Fa)} N`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "A3", unit: "A", name: "A.3 Trabajo, energía y potencia",
    concepts: [
      {
        id: "energia", label: "Conservación de la energía", keywords: ["energia potencial", "energia cinetica", "conservacion de la energia", "rampa", "mgh"],
        make: (r) => {
          const h = pick(r, [0.8, 1.2, 1.8, 2.5, 3.2]), m = pick(r, [0.5, 1.0, 2.0]);
          const Ep = m * g * h, v = Math.sqrt(2 * g * h);
          // the ramp drawn to the question's height: 50 figure units per metre, at most 120
          const H = Math.min(120, 40 + h * 25), base = 220;
          const len = Math.hypot(base, H), d = [base / len, H / len], n = [H / len, -base / len]; // along the slope, and out of it
          const p0 = [90 + d[0] * 18, 150 - H + d[1] * 18], bw = 26, bh = 18;
          const blk = [p0, [p0[0] + d[0] * bw, p0[1] + d[1] * bw], [p0[0] + d[0] * bw + n[0] * bh, p0[1] + d[1] * bw + n[1] * bh], [p0[0] + n[0] * bh, p0[1] + n[1] * bh]].flat();
          const ang = Math.atan2(H, base);
          return {
            fig: {
              w: 360, h: 170, alt: `Rampa sin rozamiento de ${f2(h)} m de altura con un bloque en lo alto`,
              items: [
                { t: "poly", pts: [90, 150 - H, 90 + base, 150, 90, 150], close: true, fill: "light" },
                { t: "ground", x1: 70, y1: 150, x2: 340, y2: 150 },
                { t: "poly", pts: blk, close: true, fill: "dark" },
                { t: "line", x1: 72, y1: 150 - H, x2: 72, y2: 150, arrow: "both", w: 1.1 },
                { t: "text", x: 64, y: 150 - H / 2 + 4, s: `${f2(h)} m`, anchor: "end" },
                { t: "angle", x: 90 + base, y: 150, r: 34, a1: 180 - (ang * 180) / Math.PI, a2: 180 },
              ],
            },
            stem: `Un bloque de ${f2(m)} kg se suelta desde el reposo en lo alto de una rampa sin rozamiento de ${f2(h)} m de altura (g = 9,8 m s⁻²).`,
            parts: [
              part("(a)", "Calcule la pérdida de energía potencial gravitatoria del bloque.", [val("A1", `ΔEp = mgh = ${fmt(Ep)} J`, Ep)],
                [`ΔEp = m g h = ${f2(m)} × 9,8 × ${f2(h)}`, `ΔEp = ${fmt(Ep)} J`]),
              part("(b)", "Determine la rapidez del bloque al llegar al pie de la rampa.", [
                method("Iguala mgh = ½mv²", /½|0\.5|1\/2|m\s*v|2\s*g\s*h/i, v, "mgh = ½mv²"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["m g h = ½ m v²  →  v = √(2gh)", `v = √(2 × 9,8 × ${f2(h)})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "potencia", label: "Potencia y rendimiento", keywords: ["potencia", "rendimiento", "eficiencia", "watt", "motor"],
        make: (r) => {
          const m = pick(r, [20, 40, 50, 80]), h = pick(r, [3, 5, 6, 8, 10]), t = pick(r, [4, 5, 8, 10, 12]);
          const W = m * g * h, P = W / t;
          const Pin = Math.ceil(P / pick(r, [0.6, 0.7, 0.75, 0.8]) / 10) * 10, eff = P / Pin;
          return {
            stem: `Un motor eleva una carga de ${m} kg a velocidad constante una altura de ${h} m en ${t} s (g = 9,8 m s⁻²).`,
            parts: [
              part("(a)", "Calcule el trabajo realizado sobre la carga.", [val("A1", `W = mgh = ${fmt(W)} J`, W)], [`W = m g h = ${m} × 9,8 × ${h}`, `W = ${fmt(W)} J`]),
              part("(b)", "Calcule la potencia útil del motor.", [val("A1", `P = W / t = ${fmt(P)} W`, P)], [`P = W / t = ${fmt(W)} / ${t}`, `P = ${fmt(P)} W`]),
              part("(c)", `El motor consume ${Pin} W. Calcule su rendimiento.`, [{
                code: "A1", text: `rendimiento = ${fmt(eff, 2)} (${Math.round(eff * 100)} %)`, miss: "A1",
                test: (_, n) => near(n, eff, TOL) || near(n, eff * 100, TOL),
              }], [`rendimiento = P útil / P consumida = ${fmt(P)} / ${Pin}`, `rendimiento = ${fmt(eff, 2)} = ${Math.round(eff * 100)} %`]),
            ],
          };
        },
      },
      {
        id: "trabajoang", label: "Trabajo de una fuerza con ángulo", keywords: ["trabajo", "fuerza con angulo", "w = fs cos", "cos"],
        make: (r) => {
          const F = pick(r, [40, 50, 60]), th = pick(r, [30, 40, 60]), s = pick(r, [8, 10, 12, 15]), f = pick(r, [8, 10, 12]), m = pick(r, [10, 15, 20]);
          const W = F * s * Math.cos(th * RAD), Wf = f * s, Wn = W - Wf, v = Math.sqrt((2 * Wn) / m);
          const cx = 160, ex = 190 + 80 * Math.cos(th * RAD), ey = 130 - 80 * Math.sin(th * RAD);
          return {
            stem: `Una persona arrastra una caja de ${m} kg, inicialmente en reposo, tirando de una cuerda con una fuerza constante de ${F} N que forma ${th}° con la horizontal. La caja se desplaza ${s} m sobre el suelo horizontal y el rozamiento es constante e igual a ${f} N.`,
            fig: {
              w: 350, h: 170, alt: `Caja arrastrada por una fuerza de ${F} N a ${th}° sobre la horizontal`,
              items: [
                { t: "ground", x1: 50, y1: 150, x2: 340, y2: 150 },
                { t: "rect", x: 130, y: 110, w: 60, h: 40, fill: "light" }, TX(160, 135, "m"),
                AR(190, 130, ex, ey), TX(ex + 6, ey + 2, "F", "start"),
                { t: "line", x1: 190, y1: 130, x2: 290, y2: 130, dash: true, w: 1 },
                { t: "angle", x: 190, y: 130, r: 30, a1: 0, a2: th, label: `${th}°` },
                AR(130, 140, 85, 140), TX(78, 144, "f", "end"),
              ],
            },
            parts: [
              part("(a)", "Calcule el trabajo realizado por la fuerza de la cuerda.", [
                method("W = F s cosθ", /cos/i, F * s, "W = Fs cosθ"),
                val("A1", `W = ${fmt(W)} J`, W),
              ], [`W = F s cosθ = ${F} × ${s} × cos ${th}°`, `W = ${fmt(W)} J`]),
              part("(b)", "Calcule el trabajo realizado contra el rozamiento.", [val("A1", `W = fs = ${fmt(Wf)} J`, Wf)],
                [`W = f s = ${f} × ${s}`, `W = ${fmt(Wf)} J`]),
              part("(c)", "Determine la rapidez de la caja al final del desplazamiento.", [
                val("M1", `Trabajo neto = ΔEk = ${fmt(Wn)} J`, Wn),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], [`Trabajo neto = ${fmt(W)} − ${fmt(Wf)} = ${fmt(Wn)} J = ½ m v²`, `v = √(2 × ${fmt(Wn)} / ${m})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "resorte", label: "Resorte y energía elástica", keywords: ["resorte", "muelle", "hooke", "energia elastica", "constante elastica"],
        make: (r) => {
          const k = pick(r, [100, 200, 250, 400]), X = pick(r, [4, 6, 8, 10]), m = pick(r, [0.20, 0.50, 1.0]);
          const x = X / 100, F = k * x, E = 0.5 * F * x, v = Math.sqrt((2 * E) / m);
          return {
            stem: `La gráfica muestra cómo varía la fuerza necesaria para comprimir un muelle hasta ${X} cm.`,
            fig: {
              w: 360, h: 200, alt: "Gráfica fuerza–compresión de un muelle: una recta que pasa por el origen",
              items: [{
                t: "graph", x: 55, y: 30, w: 265, h: 130, xr: [0, X], yr: [0, F], xticks: [0, X / 2, X], yticks: [0, F / 2, F], grid: true,
                xlabel: "x / cm", ylabel: "F / N", series: [{ pts: [[0, 0], [X, F]] }],
              }],
            },
            parts: [
              part("(a)", "Determine la constante elástica del muelle, en N m⁻¹.", [
                method("k = F / x (pendiente), con x en metros", /pendiente|gradiente|f\s*\/\s*x|k\s*=/i, F, "k = F / x"),
                val("A1", `k = ${fmt(k)} N m⁻¹`, k),
              ], ["k = pendiente del gráfico F–x = F / x", `k = ${fmt(F)} / ${fmt(x)}  (x en metros)`, `k = ${fmt(k)} N m⁻¹`]),
              part("(b)", `Calcule la energía elástica almacenada cuando el muelle se comprime ${X} cm.`, [
                method("E = área bajo el gráfico = ½kx² = ½Fx", /½|1\/2|0\.5|área|area/i, F * x, "E = ½kx²"),
                val("A1", `E = ${fmt(E)} J`, E),
              ], [`E = ½ k x² = ½ × ${fmt(k)} × ${fmt(x)}²`, `E = ${fmt(E)} J`]),
              part("(c)", `El muelle, comprimido ${X} cm, lanza desde el reposo un bloque de ${f2(m)} kg sobre una superficie horizontal lisa. Calcule la rapidez del bloque cuando lo abandona el muelle.`, [
                method("Toda la energía elástica pasa a cinética: ½kx² = ½mv²", /½\s*m|m\s*v|0\.5\s*m|1\/2\s*m/i, E, "E elástica = Ek"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], [`½ k x² = ½ m v²  →  v = √(2E / m)`, `v = √(2 × ${fmt(E)} / ${f2(m)})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "disipa", label: "Rozamiento y energía disipada", keywords: ["rozamiento", "energia disipada", "se detiene", "energia termica", "frenado"],
        make: (r) => {
          const m = pick(r, [0.5, 1.0, 2.0]), u = pick(r, [4, 5, 6, 8]), mu = pick(r, [0.20, 0.25, 0.40, 0.50]);
          const Ek = 0.5 * m * u * u, f = mu * m * g, d = Ek / f;
          return {
            stem: `Un bloque de ${f2(m)} kg se desliza sobre una superficie horizontal rugosa. Pasa por un punto con una rapidez de ${u} m s⁻¹ y acaba deteniéndose. El coeficiente de rozamiento dinámico es ${f2(mu)} (g = 9,8 m s⁻²).`,
            fig: {
              w: 320, h: 130, alt: "Bloque que se desliza hacia la derecha sobre una superficie rugosa, con su velocidad y el rozamiento",
              items: [
                { t: "ground", x1: 30, y1: 100, x2: 300, y2: 100 },
                { t: "rect", x: 120, y: 66, w: 56, h: 34, fill: "light" }, TX(148, 88, "m"),
                AR(180, 80, 240, 80), TX(244, 84, `${u} m s⁻¹`, "start"),
                AR(120, 92, 80, 92), TX(74, 96, "f", "end"),
              ],
            },
            parts: [
              part("(a)", "Calcule la energía cinética del bloque en ese punto.", [val("A1", `Ek = ½mv² = ${fmt(Ek)} J`, Ek)],
                [`Ek = ½ m v² = ½ × ${f2(m)} × ${u}²`, `Ek = ${fmt(Ek)} J`]),
              part("(b)", "Calcule la fuerza de rozamiento sobre el bloque.", [val("A1", `f = μmg = ${fmt(f)} N`, f)],
                [`f = μ m g = ${f2(mu)} × ${f2(m)} × 9,8`, `f = ${fmt(f)} N`]),
              part("(c)", "Determine la distancia que recorre el bloque hasta detenerse.", [
                method("El trabajo del rozamiento iguala la energía cinética: f d = Ek", /f\s*[·×*]?\s*d|μ\s*m\s*g\s*[·×*]?\s*d|trabajo/i, Ek, "f d = Ek"),
                val("A1", `d = ${fmt(d)} m`, d),
              ], ["Trabajo del rozamiento = energía cinética perdida: f d = Ek", `d = Ek / f = ${fmt(Ek)} / ${fmt(f)}`, `d = ${fmt(d)} m`]),
              part("(d)", "Indique en qué forma de energía se transforma la energía cinética perdida por el bloque.", [
                reason("Energía térmica (interna) del bloque y la superficie", "energía térmica / calor", "termica", "calor", "interna", "calentamiento", "thermal"),
              ], ["La energía cinética se disipa como energía térmica (interna) en el bloque y la superficie"]),
            ],
          };
        },
      },
      {
        id: "potenciafv", label: "Potencia, fuerza motriz y combustible", keywords: ["potencia", "p = fv", "velocidad constante", "combustible", "densidad de energia"],
        make: (r) => {
          const P = pick(r, [18, 24, 30, 36]), v = pick(r, [20, 25, 30]), s = pick(r, [10, 20, 30]), eta = pick(r, [0.25, 0.30, 0.40]), q = pick(r, [32, 34, 36]);
          const F = (P * 1e3) / v, W = F * s * 1e3, Ein = W / eta, V = Ein / (q * 1e6);
          return {
            stem: `Un automóvil viaja por una carretera horizontal recta con rapidez constante de ${v} m s⁻¹. La potencia útil que entrega el motor a las ruedas es de ${P} kW.`,
            parts: [
              part("(a)", "Calcule la fuerza motriz que impulsa al automóvil.", [
                method("P = F v", /p\s*=\s*f\s*[·×*]?\s*v|f\s*=\s*p\s*\/\s*v/i, P * 1e3, "P = Fv"),
                val("A1", `F = P / v = ${fmt(F)} N`, F),
              ], ["P = F v  →  F = P / v", `F = ${P} × 10³ / ${v}`, `F = ${fmt(F)} N`]),
              part("(b)", "Explique por qué la fuerza total de resistencia al avance tiene el mismo valor que la fuerza motriz.", [
                reason("La velocidad es constante: fuerza resultante nula", "velocidad constante, resultante cero", "velocidad constante", "resultante", "equilibrio", "no acelera", "aceleracion nula", "aceleracion es cero"),
              ], ["La velocidad es constante, así que la aceleración es cero", "La fuerza resultante es nula: la resistencia iguala a la fuerza motriz"]),
              part("(c)", `Calcule el trabajo útil que realiza el motor en un recorrido de ${s} km.`, [val("A1", `W = F s = ${fmt(W)} J`, W)],
                [`W = F s = ${fmt(F)} × ${s} × 10³`, `W = ${fmt(W)} J`]),
              part("(d)", `El motor tiene un rendimiento de ${Math.round(eta * 100)} % y el combustible tiene una densidad de energía de ${q} MJ L⁻¹. Calcule el volumen de combustible que se consume en ese recorrido.`, [
                method("Energía del combustible = trabajo útil / rendimiento", /rendimiento|eta|η|\/\s*0[.,]\d/i, Ein, "E = W / rendimiento"),
                val("A1", `V = ${fmt(V)} L`, V),
              ], [`E combustible = W / rendimiento = ${fmt(W)} / ${f2(eta)} = ${fmt(Ein)} J`, `V = E / densidad de energía = ${fmt(Ein)} / (${q} × 10⁶)`, `V = ${fmt(V)} L`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "A4", unit: "A", name: "A.4 Mecánica del sólido rígido", hl: true,
    concepts: [
      {
        id: "viga", label: "Torque y equilibrio de una viga", keywords: ["torque", "momento de una fuerza", "equilibrio", "viga", "palanca"],
        make: (r) => {
          const mp = pick(r, [20, 30, 40]), Lb = pick(r, [3.0, 4.0, 5.0]), M = pick(r, [50, 60, 70, 80]), xp = pick(r, [0.5, 1.0, 1.2]);
          const Tq = mp * g * (Lb / 2) + M * g * xp, RB = Tq / Lb, RA = (mp + M) * g - RB;
          const X0 = 40, X1 = 340, xs = X0 + (xp / Lb) * (X1 - X0);
          return {
            stem: `Una tabla uniforme de ${mp} kg y ${f2(Lb)} m de longitud descansa en equilibrio horizontal sobre dos soportes, A y B, situados en sus extremos. Una persona de ${M} kg está de pie sobre la tabla a ${f2(xp)} m del soporte A (g = 9,8 m s⁻²).`,
            fig: {
              w: 380, h: 190, alt: `Tabla de ${f2(Lb)} m sobre dos soportes con una persona a ${f2(xp)} m del soporte A`,
              items: [
                { t: "rect", x: X0, y: 90, w: X1 - X0, h: 12, fill: "light" },
                { t: "poly", pts: [X0, 102, X0 - 10, 126, X0 + 10, 126], close: true, fill: "light" }, TX(X0, 142, "A"),
                { t: "poly", pts: [X1, 102, X1 - 10, 126, X1 + 10, 126], close: true, fill: "light" }, TX(X1, 142, "B"),
                AR(xs, 40, xs, 88), TX(xs - 8, 56, "persona", "end"),
                AR((X0 + X1) / 2, 40, (X0 + X1) / 2, 88), TX((X0 + X1) / 2 + 8, 56, "peso de la tabla", "start"),
                { t: "line", x1: X0, y1: 158, x2: xs, y2: 158, arrow: "both", w: 1.1 }, TX((X0 + xs) / 2, 154, `${f2(xp)} m`),
                { t: "line", x1: X0, y1: 178, x2: X1, y2: 178, arrow: "both", w: 1.1 }, TX((X0 + X1) / 2, 174, `${f2(Lb)} m`),
              ],
            },
            parts: [
              part("(a)", "Calcule la fuerza que ejerce el soporte B sobre la tabla.", [
                method("Torques respecto de A: R_B L = mg L/2 + Mg x", /torque|momento|τ|respecto|punto a|l\s*\/\s*2|\bR\s*_?B/i, Tq, "Στ = 0 respecto de A"),
                val("A1", `R_B = ${fmt(RB)} N`, RB),
              ], ["Torques respecto de A (Στ = 0):  R_B × L = m g (L/2) + M g x", `R_B = (${mp} × 9,8 × ${f2(Lb / 2)} + ${M} × 9,8 × ${f2(xp)}) / ${f2(Lb)}`, `R_B = ${fmt(RB)} N`]),
              part("(b)", "Determine la fuerza que ejerce el soporte A sobre la tabla.", [val("A1", `R_A = ${fmt(RA)} N`, RA)],
                ["ΣF = 0:  R_A + R_B = (m + M) g", `R_A = ${fmt(mp + M, 2)} × 9,8 − ${fmt(RB)}`, `R_A = ${fmt(RA)} N`]),
              part("(c)", "Indique qué otra condición, además de que la fuerza resultante sea nula, debe cumplirse para que la tabla no gire.", [
                reason("El torque (momento) resultante sobre la tabla es nulo", "torque resultante nulo", "torque", "momento", "giro", "rotacion"),
              ], ["El torque (momento) resultante respecto de cualquier punto debe ser nulo"]),
            ],
          };
        },
      },
      {
        id: "inercia", label: "Momento de inercia y aceleración angular", keywords: ["momento de inercia", "aceleracion angular", "torque", "disco", "volante"],
        make: (r) => {
          const M = pick(r, [2.0, 4.0, 6.0, 8.0]), R = pick(r, [0.10, 0.20, 0.25, 0.30, 0.40]), F = pick(r, [5, 10, 15, 20]), t = pick(r, [2, 3, 4, 5]);
          const I = 0.5 * M * R * R, tau = F * R, al = tau / I, w = al * t;
          return {
            stem: `Un volante es un disco macizo uniforme de ${f2(M)} kg y ${f2(R)} m de radio que gira sin rozamiento alrededor de su eje. Se tira de una cuerda enrollada en su borde con una fuerza constante de ${F} N, tangente al disco. El volante parte del reposo. Para un disco macizo I = ½MR².`,
            fig: {
              w: 300, h: 200, alt: "Disco con una cuerda enrollada en el borde que se tira hacia abajo con una fuerza F",
              items: [
                { t: "circle", cx: 120, cy: 90, r: 60, fill: "light" }, { t: "dot", x: 120, y: 90, r: 3 },
                { t: "line", x1: 120, y1: 90, x2: 120 - 60 * Math.cos(40 * RAD), y2: 90 + 60 * Math.sin(40 * RAD) * -1, w: 1.1 },
                TX(88, 62, "R", "end"),
                { t: "line", x1: 180, y1: 90, x2: 180, y2: 140, w: 1.6 }, AR(180, 140, 180, 175), TX(190, 168, "F", "start"),
              ],
            },
            parts: [
              part("(a)", "Calcule el momento de inercia del volante.", [val("A1", `I = ½MR² = ${fmt(I)} kg m²`, I)],
                [`I = ½ M R² = 0,5 × ${f2(M)} × ${f2(R)}²`, `I = ${fmt(I)} kg m²`]),
              part("(b)", "Calcule la aceleración angular del volante.", [
                val("M1", `τ = FR = ${fmt(tau)} N m`, tau),
                val("A1", `α = τ / I = ${fmt(al)} rad s⁻²`, al),
              ], [`τ = F R = ${F} × ${f2(R)} = ${fmt(tau)} N m`, `α = τ / I = ${fmt(tau)} / ${fmt(I)}`, `α = ${fmt(al)} rad s⁻²`]),
              part("(c)", `Determine la velocidad angular del volante al cabo de ${t} s.`, [val("A1", `ω = αt = ${fmt(w)} rad s⁻¹`, w)],
                [`ω = ω₀ + α t = 0 + ${fmt(al)} × ${t}`, `ω = ${fmt(w)} rad s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "rodar", label: "Energía cinética de rotación (rodar)", keywords: ["rodar", "energia de rotacion", "rueda", "cilindro", "sin deslizar"],
        make: (r) => {
          const m = pick(r, [1.0, 2.0, 3.0]), R = pick(r, [0.05, 0.10, 0.15]), h = pick(r, [0.5, 0.8, 1.2, 1.5]);
          const Ep = m * g * h, v = Math.sqrt((4 * g * h) / 3), Er = Ep / 3, w = v / R;
          const H = Math.min(120, 40 + h * 25), base = 220, len = Math.hypot(base, H), d = [base / len, H / len], n = [H / len, -base / len];
          const rr = 12, cx = 90 + d[0] * 40 + n[0] * rr, cy = 150 - H + d[1] * 40 + n[1] * rr;
          return {
            stem: `Un cilindro macizo uniforme de ${f2(m)} kg y ${f2(R)} m de radio se suelta desde el reposo en lo alto de un plano inclinado de ${f2(h)} m de altura y rueda sin deslizar hasta la base. Para un cilindro macizo I = ½mR² (g = 9,8 m s⁻²).`,
            fig: {
              w: 360, h: 170, alt: `Cilindro en lo alto de un plano inclinado de ${f2(h)} m de altura`,
              items: [
                { t: "poly", pts: [90, 150 - H, 90 + base, 150, 90, 150], close: true, fill: "light" },
                { t: "ground", x1: 70, y1: 150, x2: 340, y2: 150 },
                { t: "circle", cx, cy, r: rr, fill: "dark" },
                { t: "line", x1: 72, y1: 150 - H, x2: 72, y2: 150, arrow: "both", w: 1.1 },
                TX(64, 150 - H / 2 + 4, `${f2(h)} m`, "end"),
              ],
            },
            parts: [
              part("(a)", "Determine la rapidez del centro del cilindro al llegar a la base del plano.", [
                method("mgh = ½mv² + ½Iω², con ω = v/R", /½\s*I|I\s*ω|ω|3\s*\/\s*4|¾|0[.,]75|mgh\s*=/i, Ep, "mgh = ½mv² + ½Iω²"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["mgh = ½ m v² + ½ I ω²  con  I = ½ m R²  y  ω = v / R", "mgh = ½ m v² + ¼ m v² = ¾ m v²  →  v = √(4gh / 3)", `v = √(4 × 9,8 × ${f2(h)} / 3) = ${fmt(v)} m s⁻¹`]),
              part("(b)", "Calcule la energía cinética de rotación del cilindro en la base.", [val("A1", `E_rot = ${fmt(Er)} J`, Er)],
                [`E_rot = ½ I ω² = ¼ m v² = ¼ × ${f2(m)} × ${fmt(v)}²`, `E_rot = ${fmt(Er)} J`]),
              part("(c)", "Calcule la velocidad angular del cilindro en la base.", [val("A1", `ω = v / R = ${fmt(w)} rad s⁻¹`, w)],
                [`ω = v / R = ${fmt(v)} / ${f2(R)}`, `ω = ${fmt(w)} rad s⁻¹`]),
              part("(d)", "Explique por qué el cilindro llega a la base con menor rapidez que un bloque sin rozamiento que se deslizara desde la misma altura.", [
                reason("Parte de la energía potencial se convierte en energía de rotación", "parte de la energía va a rotación", "rotacion", "gira", "rota", "parte de la energia", "no toda"),
              ], ["Parte de la energía potencial se convierte en energía cinética de rotación", "Queda menos energía para la traslación, así que v es menor que √(2gh)"]),
            ],
          };
        },
      },
      {
        id: "momang", label: "Conservación del momento angular", keywords: ["momento angular", "patinadora", "conservacion del momento angular", "l = iω"],
        make: (r) => {
          const I1 = pick(r, [3.0, 3.6, 4.0, 4.5]), I2 = pick(r, [1.2, 1.5, 1.8, 2.0]), w1 = pick(r, [2.0, 3.0, 4.0]);
          const L = I1 * w1, w2 = L / I2, dE = 0.5 * I2 * w2 * w2 - 0.5 * I1 * w1 * w1;
          return {
            stem: `Una patinadora gira sobre el hielo con los brazos extendidos; su momento de inercia es ${f2(I1)} kg m² y su velocidad angular, ${f2(w1)} rad s⁻¹. Al recoger los brazos, su momento de inercia pasa a ser ${f2(I2)} kg m². Ignore el rozamiento con el hielo.`,
            parts: [
              part("(a)", "Calcule el momento angular inicial de la patinadora.", [val("A1", `L = Iω = ${fmt(L)} kg m² s⁻¹`, L)],
                [`L = I ω = ${f2(I1)} × ${f2(w1)}`, `L = ${fmt(L)} kg m² s⁻¹`]),
              part("(b)", "Determine la velocidad angular de la patinadora con los brazos recogidos.", [
                method("Se conserva el momento angular: I₁ω₁ = I₂ω₂", /i\s*₁|i1|conserv|ω\s*₂|i\s*₂/i, L, "I₁ω₁ = I₂ω₂"),
                val("A1", `ω₂ = ${fmt(w2)} rad s⁻¹`, w2),
              ], ["No hay torque externo: se conserva L.   I₁ω₁ = I₂ω₂", `ω₂ = ${fmt(L)} / ${f2(I2)}`, `ω₂ = ${fmt(w2)} rad s⁻¹`]),
              part("(c)", "Calcule el aumento de la energía cinética de rotación de la patinadora.", [val("A1", `ΔEk = ${fmt(dE)} J`, dE)],
                [`Ek inicial = ½ × ${f2(I1)} × ${f2(w1)}² = ${fmt(0.5 * I1 * w1 * w1)} J`, `Ek final = ½ × ${f2(I2)} × ${fmt(w2)}² = ${fmt(0.5 * I2 * w2 * w2)} J`, `ΔEk = ${fmt(dE)} J`]),
              part("(d)", "Sugiera de dónde procede la energía adicional.", [
                reason("Del trabajo que hace la patinadora (sus músculos) al recoger los brazos", "trabajo de sus músculos al recoger los brazos", "trabajo", "musculo", "fuerza", "brazos", "esfuerzo", "interna"),
              ], ["La patinadora realiza trabajo (con sus músculos) al acercar los brazos al eje de giro"]),
            ],
          };
        },
      },
      {
        id: "cinang", label: "Cinemática angular con aceleración constante", keywords: ["velocidad angular", "aceleracion angular", "revoluciones", "ventilador", "ω"],
        make: (r) => {
          const w0 = pick(r, [4, 6, 8]), al = pick(r, [2, 3, 4]), t = pick(r, [4, 5, 6]);
          const w1 = w0 + al * t, th = ((w0 + w1) / 2) * t, rev = th / (2 * Math.PI);
          return {
            stem: `La gráfica muestra cómo cambia la velocidad angular de un ventilador durante los ${t} s siguientes a pasar al modo rápido.`,
            fig: {
              w: 360, h: 210, alt: "Gráfica velocidad angular–tiempo: una recta creciente que no parte de cero",
              items: [{
                t: "graph", x: 60, y: 30, w: 260, h: 140, xr: [0, t], yr: [0, w1], xticks: [0, t], yticks: [0, w0, w1], grid: true,
                xlabel: "t / s", ylabel: "ω / rad s⁻¹", series: [{ pts: [[0, w0], [t, w1]] }],
              }],
            },
            parts: [
              part("(a)", "Determine la aceleración angular del ventilador.", [
                method("α es la pendiente: α = Δω / Δt", /pendiente|gradiente|Δ\s*ω|\/\s*t/i, w1 - w0, "α = Δω / Δt"),
                val("A1", `α = ${fmt(al)} rad s⁻²`, al),
              ], ["α = pendiente del gráfico ω–t = Δω / Δt", `α = (${w1} − ${w0}) / ${t}`, `α = ${fmt(al)} rad s⁻²`]),
              part("(b)", "Calcule el ángulo que gira el ventilador durante ese intervalo.", [
                method("El ángulo es el área bajo el gráfico ω–t", /área|area|trapecio|½|ω\s*₀\s*t|1\/2/i, th, "θ = área bajo ω–t"),
                val("A1", `θ = ${fmt(th)} rad`, th),
              ], ["θ = área bajo el gráfico ω–t = ½ (ω₀ + ω) t", `θ = ½ × (${w0} + ${w1}) × ${t}`, `θ = ${fmt(th)} rad`]),
              part("(c)", "Determine el número de vueltas que da el ventilador en ese intervalo.", [val("A1", `vueltas = θ / 2π = ${fmt(rev)}`, rev)],
                [`vueltas = θ / 2π = ${fmt(th)} / (2π)`, `vueltas = ${fmt(rev)}`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "A5", unit: "A", name: "A.5 Relatividad galileana y especial", hl: true,
    concepts: [
      {
        id: "galileo", label: "Transformación de Galileo", keywords: ["galileo", "marco de referencia", "velocidad relativa", "x' = x - vt"],
        make: (r) => {
          const V = pick(r, [20, 25, 30]), up = pick(r, [1.0, 1.5, 2.0]), X = pick(r, [600, 800, 1000, 1200]), T = pick(r, [10, 15, 20]);
          const u = V + up, xp = X - V * T;
          return {
            stem: `Un tren se mueve en línea recta a ${V} m s⁻¹ respecto del andén. Un pasajero camina por el pasillo en el sentido de avance del tren a ${f2(up)} m s⁻¹ respecto del tren.`,
            parts: [
              part("(a)", "Calcule la velocidad del pasajero respecto del andén según la relatividad galileana.", [val("A1", `u = u′ + v = ${fmt(u)} m s⁻¹`, u)],
                [`u = u′ + v = ${f2(up)} + ${V}`, `u = ${fmt(u)} m s⁻¹`]),
              part("(b)", `Un suceso ocurre en el andén en la posición x = ${X} m cuando t = ${T} s (el origen de ambos sistemas coincide en t = 0). Determine la posición de ese suceso en el sistema de referencia del tren.`, [
                method("Transformación de Galileo: x′ = x − vt", /x\s*[′']\s*=|x\s*−\s*v\s*t|x\s*-\s*v\s*t/i, V * T, "x′ = x − vt"),
                val("A1", `x′ = ${fmt(xp)} m`, xp),
              ], ["x′ = x − v t", `x′ = ${X} − ${V} × ${T}`, `x′ = ${fmt(xp)} m`]),
              part("(c)", "Indique por qué la transformación galileana de velocidades no es válida para la luz.", [
                reason("La rapidez de la luz en el vacío es la misma (c) para todos los observadores inerciales", "c es invariante", "misma", "invariante", "constante", "todos los observadores", "independiente"),
              ], ["La rapidez de la luz en el vacío es la misma para todos los observadores inerciales", "No se suma la velocidad del observador: c es invariante"]),
            ],
          };
        },
      },
      {
        id: "dilatacion", label: "Dilatación del tiempo (muones)", keywords: ["dilatacion del tiempo", "factor de lorentz", "muon", "tiempo propio", "gamma"],
        make: (r) => {
          const b = pick(r, [0.80, 0.90, 0.95, 0.98]), t0 = 2.2e-6;
          const gam = 1 / Math.sqrt(1 - b * b), t = gam * t0, d = b * C_LIGHT * t, d0 = b * C_LIGHT * t0;
          return {
            stem: `Los muones se producen en la alta atmósfera y descienden hacia el suelo con una rapidez de ${f2(b)}c. En su propio sistema de referencia, la vida media de un muón es de 2,2 μs (c = 3,0 × 10⁸ m s⁻¹).`,
            parts: [
              part("(a)", "Calcule el factor de Lorentz γ de los muones.", [
                method("γ = 1 / √(1 − v²/c²)", /√|sqrt|1\s*−|1\s*-|v\s*²\s*\/\s*c\s*²/i, b * b, "γ = 1/√(1 − v²/c²)"),
                val("A1", `γ = ${fmt(gam)}`, gam),
              ], ["γ = 1 / √(1 − v²/c²)", `γ = 1 / √(1 − ${f2(b)}²)`, `γ = ${fmt(gam)}`]),
              part("(b)", "Determine la vida media de los muones medida por un observador en la Tierra.", [val("A1", `Δt = γΔt₀ = ${fmt(t * 1e6)} μs`, t * 1e6)],
                ["Δt = γ Δt₀", `Δt = ${fmt(gam)} × 2,2 μs`, `Δt = ${fmt(t * 1e6)} μs`]),
              part("(c)", "Calcule la distancia que recorre un muón, medida por el observador en la Tierra, durante su vida media.", [
                method("d = v Δt, con el tiempo medido en la Tierra", /v\s*[·×*]?\s*Δ?t|d\s*=/i, t * 1e6, "d = vΔt"),
                val("A1", `d = ${fmt(d)} m`, d),
              ], [`d = v Δt = ${f2(b)} × 3,0 × 10⁸ × ${fmt(t)}`, `d = ${fmt(d)} m`]),
              part("(d)", "Explique por qué llegan al suelo muchos más muones de los que se esperarían si se ignorase la relatividad.", [
                reason("Para el observador en la Tierra el tiempo del muón se dilata: vive más tiempo y recorre más distancia", "dilatación del tiempo", "dilatacion", "mas tiempo", "mayor", "tiempo propio", "relativ"),
              ], [`Sin relatividad recorrerían solo ${fmt(d0)} m`, "Por la dilatación del tiempo, su vida media medida desde la Tierra es mayor y recorren más distancia"]),
            ],
          };
        },
      },
      {
        id: "contraccion", label: "Contracción de la longitud", keywords: ["contraccion de la longitud", "longitud propia", "nave", "lorentz"],
        make: (r) => {
          const b = pick(r, [0.60, 0.80, 0.90, 0.95]), L0 = pick(r, [80, 100, 120, 150]);
          const gam = 1 / Math.sqrt(1 - b * b), L = L0 / gam, v = b * C_LIGHT, t = L / v;
          return {
            stem: `Una nave espacial de ${L0} m de longitud medida por su tripulación pasa junto a una estación a ${f2(b)}c (c = 3,0 × 10⁸ m s⁻¹).`,
            fig: {
              w: 360, h: 140, alt: "Una nave se mueve hacia la derecha junto a una estación fija",
              items: [
                { t: "poly", pts: [40, 50, 150, 50, 185, 70, 150, 90, 40, 90], close: true, fill: "light" }, TX(95, 76, "nave"),
                AR(195, 70, 255, 70), TX(225, 62, `${f2(b)}c`),
                { t: "ground", x1: 20, y1: 120, x2: 340, y2: 120 },
                { t: "rect", x: 290, y: 90, w: 30, h: 30, fill: "light" }, TX(305, 82, "estación"),
              ],
            },
            parts: [
              part("(a)", "Calcule el factor de Lorentz γ.", [val("A1", `γ = ${fmt(gam)}`, gam)],
                ["γ = 1 / √(1 − v²/c²)", `γ = 1 / √(1 − ${f2(b)}²)`, `γ = ${fmt(gam)}`]),
              part("(b)", "Determine la longitud de la nave medida por un observador de la estación.", [
                method("L = L₀ / γ", /l\s*₀\s*\/\s*γ|l0\s*\/|\/\s*γ|\/\s*gamma/i, gam, "L = L₀/γ"),
                val("A1", `L = ${fmt(L)} m`, L),
              ], ["L = L₀ / γ", `L = ${L0} / ${fmt(gam)}`, `L = ${fmt(L)} m`]),
              part("(c)", "Calcule el tiempo que tarda la nave en pasar por completo ante un punto de la estación, medido por el observador de la estación.", [
                method("t = L / v, con L la longitud medida en la estación", /l\s*\/\s*v|t\s*=/i, L, "t = L / v"),
                val("A1", `t = ${fmt(t)} s`, t),
              ], [`t = L / v = ${fmt(L)} / (${f2(b)} × 3,0 × 10⁸)`, `t = ${fmt(t)} s`]),
              part("(d)", "Identifique quién mide la longitud propia de la nave.", [
                reason("Un observador en reposo respecto de la nave (la tripulación)", "el observador en reposo respecto a la nave", "tripulacion", "nave", "reposo", "pasajeros", "piloto"),
              ], ["La longitud propia la mide el observador en reposo respecto de la nave (la tripulación)"]),
            ],
          };
        },
      },
      {
        id: "sumavel", label: "Suma relativista de velocidades", keywords: ["suma de velocidades", "velocidad relativista", "limite c", "velocidad de la luz"],
        make: (r) => {
          const v = pick(r, [0.60, 0.70, 0.80]), up = pick(r, [0.50, 0.60, 0.70]);
          const gal = v + up, rel = (up + v) / (1 + up * v);
          return {
            stem: `Una nave se aleja de la Tierra con una velocidad de ${f2(v)}c respecto de la Tierra. La nave dispara un proyectil hacia delante con una velocidad de ${f2(up)}c respecto de la nave.`,
            parts: [
              part("(a)", "Determine, en unidades de c, la velocidad del proyectil respecto de la Tierra que predice la relatividad galileana.", [val("A1", `u = ${fmt(gal)}c`, gal)],
                [`u = u′ + v = ${f2(up)}c + ${f2(v)}c`, `u = ${fmt(gal)}c`]),
              part("(b)", "Calcule, en unidades de c, la velocidad del proyectil respecto de la Tierra según la relatividad especial.", [
                method("u = (u′ + v) / (1 + u′v/c²)", /1\s*\+|u\s*′?\s*v\s*\/\s*c|\(\s*u/i, 1 + up * v, "u = (u′ + v)/(1 + u′v/c²)"),
                val("A1", `u = ${fmt(rel)}c`, rel),
              ], ["u = (u′ + v) / (1 + u′v / c²)", `u = (${f2(up)} + ${f2(v)})c / (1 + ${f2(up)} × ${f2(v)})`, `u = ${fmt(rel)}c`]),
              part("(c)", "Indique por qué el resultado del apartado (a) es imposible.", [
                reason("Supera la rapidez de la luz c, que es el límite máximo", "supera c", "mayor que c", "supera", "excede", "limite", "velocidad de la luz", "mayor que la"),
              ], ["Es mayor que c, y nada con masa puede alcanzar o superar la rapidez de la luz"]),
            ],
          };
        },
      },
      {
        id: "intervalo", label: "Intervalo espacio-tiempo invariante", keywords: ["intervalo", "espacio-tiempo", "invariante", "tiempo propio", "sucesos"],
        make: (r) => {
          const dt = pick(r, [4, 5, 6, 8]), dx = pick(r, [450, 600, 750, 900]);
          const cdt = (C_LIGHT * dt * 1e-6), ds = Math.sqrt(cdt * cdt - dx * dx), tau = ds / C_LIGHT * 1e6, v = dx / (dt * 1e-6);
          return {
            stem: `Un observador mide dos sucesos en su sistema de referencia: el segundo ocurre ${dt} μs después del primero y a ${dx} m de distancia de él, en línea recta (c = 3,0 × 10⁸ m s⁻¹).`,
            parts: [
              part("(a)", "Calcule el intervalo espacio-tiempo Δs entre los dos sucesos.", [
                method("(Δs)² = (cΔt)² − (Δx)²", /c\s*Δ?t|\(\s*Δs\s*\)\s*²|Δs\s*²|−|-/i, cdt, "(Δs)² = c²Δt² − Δx²"),
                val("A1", `Δs = ${fmt(ds)} m`, ds),
              ], ["(Δs)² = (cΔt)² − (Δx)²", `cΔt = 3,0 × 10⁸ × ${dt} × 10⁻⁶ = ${fmt(cdt)} m`, `Δs = √(${fmt(cdt)}² − ${dx}²) = ${fmt(ds)} m`]),
              part("(b)", "Determine el tiempo propio entre los sucesos.", [val("A1", `Δτ = Δs / c = ${fmt(tau)} μs`, tau)],
                ["El tiempo propio es el medido por quien ve ambos sucesos en el mismo lugar: Δτ = Δs / c", `Δτ = ${fmt(ds)} / (3,0 × 10⁸) = ${fmt(tau * 1e-6)} s`, `Δτ = ${fmt(tau)} μs`]),
              part("(c)", "Calcule la rapidez de un observador que ve ambos sucesos en el mismo lugar.", [val("A1", `v = Δx / Δt = ${fmt(v)} m s⁻¹`, v)],
                [`Debe recorrer ${dx} m en ${dt} μs: v = Δx / Δt`, `v = ${dx} / (${dt} × 10⁻⁶)`, `v = ${fmt(v)} m s⁻¹`]),
              part("(d)", "Explique por qué otro observador en movimiento relativo obtiene el mismo valor de Δs aunque mida un Δt y un Δx distintos.", [
                reason("El intervalo espacio-tiempo es invariante: tiene el mismo valor en todos los sistemas inerciales", "el intervalo es invariante", "invariante", "mismo valor", "todos los observadores", "todos los sistemas", "no cambia"),
              ], ["El intervalo espacio-tiempo es invariante: tiene el mismo valor en todos los sistemas inerciales", "Los cambios de Δt y de Δx se compensan en (cΔt)² − (Δx)²"]),
            ],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
  "A.1": {
    title: "A.1 Cinemática",
    items: [
      { tex: "v = u + at", n: "rapidez final", for: ["suvat", "caída", "proyectil", "tiro"] },
      { tex: "s = ut + \\tfrac{1}{2}at^2", n: "desplazamiento", for: ["suvat", "caída", "proyectil", "tiro"] },
      { tex: "v^2 = u^2 + 2as", n: "sin el tiempo", for: ["suvat", "caída"] },
      { tex: "s = \\dfrac{(u + v)\\,t}{2}", n: "con la rapidez media", for: ["suvat"] },
      { tex: "x = u_x\\, t", n: "tiro horizontal: la componente horizontal es constante", for: ["proyectil", "tiro"] },
      { tex: "a = \\dfrac{\\Delta v}{\\Delta t}", n: "pendiente del gráfico v–t" },
      { tex: "s = \\text{área bajo } v\\text{–}t", n: "desplazamiento a partir del gráfico", for: ["gráficas"] },
      { tex: "v_x = v\\cos\\theta \\qquad v_y = v\\sin\\theta", n: "componentes de la velocidad inicial", for: ["oblicuo"] },
      { tex: "v = u - gt \\qquad H = \\dfrac{u^2}{2g}", n: "lanzamiento vertical hacia arriba (v = 0 en lo más alto)", for: ["vertical"] },
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
      { tex: "W_\\parallel = mg\\sin\\theta \\qquad N = mg\\cos\\theta", n: "componentes del peso en un plano inclinado", for: ["inclinado"] },
      { tex: "a_c = \\dfrac{v^2}{r} = \\omega^2 r \\qquad F_c = \\dfrac{mv^2}{r}", n: "movimiento circular uniforme", for: ["circular", "centrípeta"] },
      { tex: "J = \\text{área bajo } F\\text{–}t", n: "impulso a partir del gráfico", for: ["fuerza–tiempo", "impulso"] },
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
      { tex: "F = k\\,\\Delta x", n: "ley de Hooke", for: ["resorte"] },
      { tex: "E_H = \\tfrac{1}{2}k\\,\\Delta x^2", n: "energía elástica (área bajo F–x)", for: ["resorte"] },
      { tex: "\\text{energía de la fuente} = \\text{densidad de energía} \\times V", n: "combustibles", for: ["combustible"] },
      { tex: "W_{\\text{neto}} = \\Delta E_k", n: "trabajo neto y energía cinética", for: ["rozamiento", "trabajo"] },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}" }],
  },
  "A.4": {
    title: "A.4 Mecánica del sólido rígido",
    items: [
      { tex: "\\tau = Fr\\sin\\theta", n: "torque de una fuerza", for: ["torque", "viga"] },
      { tex: "\\sum F = 0 \\qquad \\sum \\tau = 0", n: "equilibrio de un cuerpo rígido", for: ["viga", "equilibrio"] },
      { tex: "\\tau = I\\alpha", n: "segunda ley para la rotación", for: ["inercia", "aceleración angular"] },
      { tex: "I = \\tfrac{1}{2}MR^2", n: "disco o cilindro macizo (suele darse en el enunciado)", for: ["inercia", "rodar"] },
      { tex: "E_k = \\tfrac{1}{2}I\\omega^2", n: "energía cinética de rotación", for: ["rodar", "rotación", "momento angular"] },
      { tex: "L = I\\omega", n: "momento angular", for: ["momento angular"] },
      { tex: "\\omega = \\omega_0 + \\alpha t \\qquad \\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2", n: "cinemática angular con α constante", for: ["angular"] },
      { tex: "\\omega^2 = \\omega_0^2 + 2\\alpha\\theta", n: "sin el tiempo", for: ["angular"] },
      { tex: "v = \\omega r", n: "rapidez lineal y velocidad angular", for: ["rodar", "angular"] },
    ],
  },
  "A.5": {
    title: "A.5 Relatividad galileana y especial",
    items: [
      { tex: "x' = x - vt \\qquad u' = u - v", n: "transformación de Galileo", for: ["galileo"] },
      { tex: "\\gamma = \\dfrac{1}{\\sqrt{1 - v^2/c^2}}", n: "factor de Lorentz", for: ["dilatación", "contracción", "muones"] },
      { tex: "\\Delta t = \\gamma\\,\\Delta t_0", n: "dilatación del tiempo (Δt₀ = tiempo propio)", for: ["dilatación"] },
      { tex: "L = \\dfrac{L_0}{\\gamma}", n: "contracción de la longitud (L₀ = longitud propia)", for: ["contracción"] },
      { tex: "u' = \\dfrac{u - v}{1 - uv/c^2}", n: "suma relativista de velocidades", for: ["suma", "velocidades"] },
      { tex: "(\\Delta s)^2 = (c\\Delta t)^2 - (\\Delta x)^2", n: "intervalo espacio-tiempo (invariante)", for: ["intervalo"] },
    ],
    consts: [{ tex: "c = 3{,}00 \\times 10^{8}\\ \\text{m s}^{-1}" }],
  },
};
