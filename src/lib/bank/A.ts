/**
 * Unit A · Espacio, tiempo y movimiento. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type FormulaGroup, type Topic } from "./kit.ts";

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
      { tex: "s = \\text{área bajo } v\\text{–}t", n: "desplazamiento a partir del gráfico" },
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
      { tex: "E_H = \\tfrac{1}{2}k\\,\\Delta x^2", n: "energía elástica" },
    ],
    consts: [{ tex: "g = 9{,}81\\ \\text{m s}^{-2}" }],
  },
};
