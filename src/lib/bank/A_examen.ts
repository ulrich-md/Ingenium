/**
 * Unit A · more questions (intermedio y examen). See kit.ts. Concepts are added to the subtopics of
 * bank/A.ts by topic id (e.g. "A1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "../check.ts";
import { C_LIGHT, f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Concept, type FigItem } from "./kit.ts";

const AR = (x1: number, y1: number, x2: number, y2: number, w = 1.6): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "end", w });
const TX = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle"): FigItem => ({ t: "text", x, y, s, anchor });
const RAD = Math.PI / 180;
/** value read from a graph or carried over from a previous part: wider tolerance */
const valT = (code: Rule["code"], text: string, target: number, tol: number, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => near(n, target, tol) });
/** a ratio / factor, also accepted as a fraction ("1/4") or in words */
const ratio = (code: Rule["code"], text: string, f: number, frac: string, ...words: string[]): Rule =>
  ({ code, text, miss: code, test: (l, n) => near(n, f, TOL) || normalize(l).replace(/\s/g, "").includes(frac) || hasAny(l, ...words) });
const cm = (x: number) => String(x).replace(".", ",");
const gam = (b: number) => 1 / Math.sqrt(1 - b * b);

export const extra: Record<string, Concept[]> = {
  A1: [
    {
      id: "x_stgraf", label: "Gráfica posición–tiempo (corredora)", level: 2,
      keywords: ["posicion-tiempo", "grafica s-t", "pendiente", "rapidez media"],
      make: (r) => {
        const v1 = pick(r, [2, 3, 4, 5]), t1 = pick(r, [4, 6]), pause = pick(r, [2, 4]), t2 = t1 + pause;
        const v3 = v1 + pick(r, [1, 2]), t3 = t2 + pick(r, [4, 6]);
        const s1 = v1 * t1, s2 = s1 + v3 * (t3 - t2), vm = s2 / t3;
        return {
          stem: `La gráfica muestra la posición s de una corredora, medida desde el punto de salida a lo largo de una pista recta, durante ${t3} s.`,
          fig: {
            w: 360, h: 200, alt: "Gráfica posición–tiempo con un tramo inclinado, un tramo horizontal y otro tramo inclinado más pendiente",
            items: [{
              t: "graph", x: 55, y: 30, w: 270, h: 130, xr: [0, t3], yr: [0, s2], xticks: [0, t1, t2, t3], yticks: [0, s1, s2], grid: true,
              xlabel: "t / s", ylabel: "s / m", series: [{ pts: [[0, 0], [t1, s1], [t2, s1], [t3, s2]] }],
            }],
          },
          parts: [
            part("(a)", `Determine la velocidad de la corredora durante los primeros ${t1} s.`, [
              method("La velocidad es la pendiente del gráfico s–t: v = Δs / Δt", /pendiente|gradiente|Δ\s*s|\/\s*t/i, s1, "v = Δs / Δt"),
              val("A1", `v = ${fmt(v1)} m s⁻¹`, v1),
            ], ["v = pendiente del gráfico s–t = Δs / Δt", `v = ${s1} / ${t1}`, `v = ${fmt(v1)} m s⁻¹`]),
            part("(b)", `Explique qué hace la corredora entre t = ${t1} s y t = ${t2} s.`, [
              reason("Su posición no cambia: está en reposo (velocidad cero)", "está en reposo", "reposo", "detenid", "parad", "no se mueve", "velocidad cero", "velocidad nula", "inmovil", "quiet"),
            ], ["La pendiente es cero: la posición no cambia", "La corredora está en reposo (detenida)"]),
            part("(c)", "Calcule la rapidez media de la corredora durante todo el recorrido.", [
              method("rapidez media = distancia total / tiempo total", /total|distancia\s*\/\s*tiempo|s\s*\/\s*t/i, s2, "distancia total / tiempo total"),
              val("A1", `rapidez media = ${fmt(vm)} m s⁻¹`, vm),
            ], ["rapidez media = distancia total / tiempo total", `rapidez media = ${s2} / ${t3}`, `rapidez media = ${fmt(vm)} m s⁻¹`]),
          ],
        };
      },
    },
    {
      id: "x_paracaidas", label: "Salto en paracaídas: gráfica v–t y resistencia del aire", level: 3,
      keywords: ["paracaidas", "resistencia del aire", "grafica v-t", "velocidad terminal"],
      make: (r) => {
        const [v1, t1] = pick(r, [[30, 4], [30, 5], [40, 5]] as const), vf = pick(r, [5, 6]);
        const t2 = t1 + pick(r, [4, 6]), t3 = t2 + pick(r, [4, 6]), m = pick(r, [70, 75, 80, 85]);
        const a = v1 / t1, R1 = m * (g - a), d = 0.5 * v1 * t1 + 0.5 * (v1 + vf) * (t2 - t1), Rf = m * g;
        return {
          stem: `Un paracaidista de ${m} kg salta de un avión y cae en vertical. La gráfica muestra su rapidez hacia abajo; el paracaídas empieza a abrirse en t = ${t1} s y está totalmente abierto en t = ${t2} s (g = 9,8 m s⁻²).`,
          fig: {
            w: 380, h: 210, alt: "Gráfica velocidad–tiempo: aumento lineal, descenso rápido al abrirse el paracaídas y rapidez final constante",
            items: [{
              t: "graph", x: 55, y: 25, w: 300, h: 140, xr: [0, t3], yr: [0, v1], xticks: [0, t1, t2, t3], yticks: [0, vf, v1], grid: true,
              xlabel: "t / s", ylabel: "v / m s⁻¹", series: [{ pts: [[0, 0], [t1, v1], [t2, vf], [t3, vf]] }],
            }],
          },
          parts: [
            part("(a)", `Determine la aceleración del paracaidista durante los primeros ${t1} s.`, [
              method("a = pendiente del gráfico v–t", /pendiente|gradiente|Δ\s*v|\/\s*t/i, v1, "a = Δv / Δt"),
              val("A1", `a = ${fmt(a)} m s⁻²`, a),
            ], ["a = pendiente = Δv / Δt", `a = ${v1} / ${t1}`, `a = ${fmt(a)} m s⁻²`]),
            part("(b)", `Calcule la fuerza de resistencia del aire sobre el paracaidista al final de esos ${t1} s.`, [
              method("Segunda ley de Newton: mg − R = ma", /m\s*g\s*[-−]\s*R|m\s*a|F\s*=\s*m\s*a|resultante/i, m * a, "mg − R = ma"),
              val("A1", `R = m(g − a) = ${fmt(R1)} N`, R1),
            ], ["m g − R = m a", `R = m (g − a) = ${m} × (9,8 − ${fmt(a)})`, `R = ${fmt(R1)} N`]),
            part("(c)", `Calcule la distancia que cae el paracaidista desde t = 0 hasta t = ${t2} s.`, [
              method("La distancia es el área bajo el gráfico v–t", /área|area|½|1\/2|trapecio/i, 0.5 * v1 * t1, "área bajo el gráfico"),
              val("A1", `d = ${fmt(d)} m`, d),
            ], ["d = área bajo el gráfico v–t", `d = ½ × ${t1} × ${v1} + ½ × (${v1} + ${vf}) × ${t2 - t1}`, `d = ${fmt(d)} m`]),
            part("(d)", `Determine la fuerza de resistencia del aire cuando la rapidez es constante (t > ${t2} s).`, [
              val("A1", `R = mg = ${fmt(Rf)} N`, Rf),
            ], ["Rapidez constante: fuerza neta cero, R = peso", `R = m g = ${m} × 9,8 = ${fmt(Rf)} N`]),
            part("(e)", "Explique, en dos puntos, por qué el paracaidista se frena justo después de abrirse el paracaídas.", [
              reason("La resistencia del aire pasa a ser mayor que el peso", "R > peso", "mayor que el peso", "mayor que mg", "supera", "excede", "mayor resistencia", "resistencia aumenta", "resistencia mayor", "r > w"),
              reason("Hay una fuerza neta hacia arriba, luego la aceleración es hacia arriba (desaceleración)", "fuerza neta hacia arriba", "hacia arriba", "fuerza neta", "resultante", "desaceler"),
            ], ["Al abrirse el paracaídas, la resistencia del aire aumenta y pasa a ser mayor que el peso", "La fuerza neta apunta hacia arriba, así que la aceleración es hacia arriba y el paracaidista desacelera"]),
          ],
        };
      },
    },
  ],
  A2: [
    {
      id: "x_deslizaf", label: "Bloque que se detiene por rozamiento (gráfica v–t)", level: 2,
      keywords: ["rozamiento", "grafica v-t", "coeficiente de rozamiento", "se detiene"],
      make: (r) => {
        const v0 = pick(r, [4, 6, 8, 10]), T = pick(r, [2, 4, 5]), m = pick(r, [2, 3, 5, 6]);
        const a = v0 / T, f = m * a, mu = a / g;
        return {
          stem: `Se lanza un bloque de ${m} kg sobre una mesa horizontal rugosa y se desliza en línea recta hasta detenerse. La gráfica muestra su velocidad (g = 9,8 m s⁻²).`,
          fig: {
            w: 340, h: 190, alt: "Gráfica velocidad–tiempo de un bloque que frena de forma lineal hasta el reposo",
            items: [{
              t: "graph", x: 55, y: 25, w: 250, h: 120, xr: [0, T], yr: [0, v0], xticks: [0, T], yticks: [0, v0 / 2, v0], grid: true,
              xlabel: "t / s", ylabel: "v / m s⁻¹", series: [{ pts: [[0, v0], [T, 0]] }],
            }],
          },
          parts: [
            part("(a)", "Determine la desaceleración del bloque.", [
              method("a = pendiente del gráfico v–t", /pendiente|gradiente|Δ\s*v|\/\s*t/i, v0, "a = Δv / Δt"),
              val("A1", `a = ${fmt(a)} m s⁻²`, a),
            ], ["a = |pendiente| = Δv / Δt", `a = ${v0} / ${T}`, `a = ${fmt(a)} m s⁻²`]),
            part("(b)", "Calcule el coeficiente de rozamiento dinámico entre el bloque y la mesa.", [
              method("La fuerza de rozamiento es la fuerza neta: f = ma = μmg", /f\s*=\s*m\s*a|μ\s*m\s*g|μ\s*N|m\s*a/i, f, "f = ma = μmg"),
              val("A1", `μ = a / g = ${fmt(mu)}`, mu),
            ], [`f = m a = ${m} × ${fmt(a)} = ${fmt(f)} N`, "f = μ m g  →  μ = a / g", `μ = ${fmt(a)} / 9,8 = ${fmt(mu)}`]),
            part("(c)", "Se repite el lanzamiento sobre la misma mesa con el mismo bloque, pero con el doble de la rapidez inicial. Deduzca en qué factor cambia la distancia que recorre hasta detenerse.", [
              ratio("A1", "d ∝ v₀²: la distancia se multiplica por 4", 4, "x4", "cuatro", "4 veces"),
            ], ["a es la misma; v² = 2 a d  →  d ∝ v₀²", "Con 2v₀: d' = (2)² d = 4 d  →  factor 4"]),
          ],
        };
      },
    },
    {
      id: "x_choquedesliza", label: "Choque inelástico seguido de deslizamiento", level: 3,
      keywords: ["choque", "rozamiento", "conservacion del momento", "unidos", "energia disipada"],
      make: (r) => {
        const m1 = pick(r, [2, 3, 5]), m2 = pick(r, [1, 2, 3]), u = pick(r, [6, 8, 10]), mu = pick(r, [0.25, 0.40, 0.50]);
        const v = (m1 * u) / (m1 + m2), Ei = 0.5 * m1 * u * u, Ef = 0.5 * (m1 + m2) * v * v, dE = Ei - Ef;
        const a = mu * g, d = (v * v) / (2 * a), F = mu * (m1 + m2) * g;
        return {
          stem: `Un bloque A de ${m1} kg se desliza con rapidez ${u} m s⁻¹ por una superficie lisa y choca con un bloque B de ${m2} kg en reposo. Tras el choque quedan unidos y entran en una zona rugosa, de coeficiente de rozamiento dinámico ${f2(mu).replace(/^0/, "0")}, donde se frenan hasta detenerse (g = 9,8 m s⁻²).`,
          fig: {
            w: 360, h: 135, alt: "Bloque A con velocidad u hacia un bloque B en reposo sobre una superficie lisa; a la derecha, una zona rugosa",
            items: [
              { t: "line", x1: 15, y1: 100, x2: 205, y2: 100, w: 1.6 },
              { t: "ground", x1: 205, y1: 100, x2: 345, y2: 100 },
              { t: "rect", x: 40, y: 70, w: 36, h: 30, fill: "light" }, TX(58, 90, "A"),
              { t: "rect", x: 135, y: 70, w: 36, h: 30, fill: "light" }, TX(153, 90, "B"),
              AR(82, 55, 122, 55), TX(102, 45, "u"),
              TX(110, 124, "liso"), TX(275, 124, `rugoso, μ = ${f2(mu)}`),
            ],
          },
          parts: [
            part("(a)", "Calcule la rapidez de los bloques unidos justo después del choque.", [
              method("Conservación del momento lineal: m₁u = (m₁ + m₂)v", /m\s*₁\s*u|m\s*1\s*u|p\s*=|\(\s*m\s*₁\s*\+/i, m1 * u, "m₁u = (m₁+m₂)v"),
              val("A1", `v = ${fmt(v)} m s⁻¹`, v),
            ], ["m₁ u = (m₁ + m₂) v", `${m1} × ${u} = ${m1 + m2} × v`, `v = ${fmt(v)} m s⁻¹`]),
            part("(b)", "Determine la energía cinética que se disipa en el choque.", [
              method("ΔE = ½m₁u² − ½(m₁ + m₂)v²", /½|1\/2|0[.,]5|Ek|cin[ée]tica/i, Ei, "Ek antes − Ek después"),
              val("A1", `ΔE = ${fmt(dE)} J`, dE),
            ], [`Ek antes = ½ × ${m1} × ${u}² = ${fmt(Ei)} J`, `Ek después = ½ × ${m1 + m2} × ${fmt(v)}² = ${fmt(Ef)} J`, `ΔE = ${fmt(Ei)} − ${fmt(Ef)} = ${fmt(dE)} J`]),
            part("(c)", `Muestre que la desaceleración de los bloques unidos en la zona rugosa es ${fmt(a)} m s⁻².`, [
              method("Rozamiento = masa × aceleración: μ(m₁ + m₂)g = (m₁ + m₂)a", /μ\s*N|μ\s*\(|f\s*=\s*μ|μ\s*g|m\s*a|\(\s*m\s*₁/i, F, "μ(m₁+m₂)g = (m₁+m₂)a"),
              val("A1", `a = μg = ${fmt(a)} m s⁻²`, a),
            ], [`f = μ N = μ (m₁ + m₂) g = ${fmt(F)} N`, "f = (m₁ + m₂) a  →  a = μ g", `a = ${f2(mu)} × 9,8 = ${fmt(a)} m s⁻²`]),
            part("(d)", "Calcule la distancia que recorren los bloques en la zona rugosa hasta detenerse.", [
              method("v² = 2ad con velocidad final cero", /v\s*²\s*=\s*2|2\s*a\s*d|d\s*=\s*v|v\s*²\s*\/\s*\(?\s*2/i, v * v, "v² = 2ad"),
              val("A1", `d = ${fmt(d)} m`, d),
            ], ["0 = v² − 2 a d  →  d = v² / (2a)", `d = ${fmt(v)}² / (2 × ${fmt(a)})`, `d = ${fmt(d)} m`]),
            part("(e)", "Si la rapidez inicial u del bloque A se duplicara (mismas masas y misma superficie), ¿en qué factor cambiaría la distancia de (d)?", [
              ratio("A1", "v ∝ u y d ∝ v²: la distancia se multiplica por 4", 4, "x4", "cuatro", "4 veces"),
            ], ["v ∝ u y d ∝ v²", "d ∝ u²: con 2u, d' = 4 d  →  factor 4"]),
          ],
        };
      },
    },
    {
      id: "x_discorazones", label: "Razones en un disco que gira", level: 2,
      keywords: ["disco", "movimiento circular", "aceleracion centripeta", "razon", "velocidad angular"],
      make: (r) => {
        const [f, fw, fs] = pick(r, [[0.5, "la mitad", "1/2"], [0.25, "la cuarta parte", "1/4"], [0.75, "tres cuartos", "3/4"]] as const);
        const R = pick(r, [2.0, 3.0, 4.0]), T = pick(r, [4, 5, 8, 10]);
        const ac = (4 * Math.PI * Math.PI * R) / (T * T), w = (2 * Math.PI) / T;
        const cx = 110, cy = 100, rr = 80, xa = cx + rr * f;
        return {
          stem: `Un disco horizontal gira con velocidad angular constante. El punto A está a ${fw} de la distancia que hay entre el eje y el borde, y el punto B está en el borde. El borde del disco, de ${f2(R)} m de radio, tarda ${T} s en dar una vuelta completa.`,
          fig: {
            w: 300, h: 200, alt: "Disco visto desde arriba con un radio que va del centro al borde y dos puntos marcados, A a una fracción del radio y B en el borde",
            items: [
              { t: "circle", cx, cy, r: rr, fill: "light" },
              { t: "line", x1: cx, y1: cy, x2: cx + rr, y2: cy, w: 1.2 },
              { t: "dot", x: cx, y: cy, r: 3 }, { t: "dot", x: xa, y: cy, r: 3.5 }, { t: "dot", x: cx + rr, y: cy, r: 3.5 },
              TX(xa, cy - 9, "A"), TX(cx + rr + 12, cy + 4, "B", "start"), TX(cx - 3, cy + 16, "eje"),
            ],
          },
          parts: [
            part("(a)", "Determine la razón entre la rapidez lineal de A y la de B, vA / vB.", [
              ratio("A1", `v = ωr con la misma ω: vA / vB = ${fs}`, f, fs.replace("/", "") === "" ? fs : fs),
            ], ["Misma ω en todo el disco; v = ω r", `vA / vB = r_A / r_B = ${fs} = ${fmt(f)}`]),
            part("(b)", "Determine la razón entre las aceleraciones centrípetas, aA / aB.", [
              method("a = ω²r: con la misma ω, a es proporcional a r", /ω\s*²\s*r|a\s*∝|proporcional|r\s*_?\s*A\s*\/\s*r/i, f, "a = ω²r"),
              ratio("A1", `aA / aB = ${fs}`, f, fs),
            ], ["a = ω² r  →  a ∝ r", `aA / aB = ${fs} = ${fmt(f)}`]),
            part("(c)", "Calcule la aceleración centrípeta de B.", [
              method("ω = 2π / T (o v = 2πr / T)", /2\s*π|ω\s*=|v\s*=/i, w, "ω = 2π / T"),
              val("A1", `a = ω²r = ${fmt(ac)} m s⁻²`, ac),
            ], [`ω = 2π / T = 2π / ${T} = ${fmt(w)} rad s⁻¹`, `a = ω² r = ${fmt(w)}² × ${f2(R)}`, `a = ${fmt(ac)} m s⁻²`]),
          ],
        };
      },
    },
    {
      id: "x_rotor", label: "Rotor de feria: rozamiento y fuerza centrípeta", level: 3,
      keywords: ["rotor", "movimiento circular", "fuerza centripeta", "rozamiento", "revoluciones por minuto"],
      make: (r) => {
        const R = pick(r, [2.0, 2.5, 3.0]), mu = pick(r, [0.40, 0.50, 0.60]), m = pick(r, [50, 60, 70]);
        const wmin = Math.sqrt(g / (mu * R)), rpm = Math.round((wmin * pick(r, [1.3, 1.5]) * 60) / (2 * Math.PI));
        const w = (rpm * 2 * Math.PI) / 60, N = m * w * w * R, W = m * g;
        const rpmmin = (wmin * 60) / (2 * Math.PI);
        return {
          stem: `En un rotor de feria, los pasajeros se apoyan de pie contra la pared interior de un cilindro vertical de ${f2(R)} m de radio que gira alrededor de su eje. Cuando gira lo bastante rápido, se retira el suelo y las personas no caen. El coeficiente de rozamiento estático entre la ropa y la pared es ${f2(mu)} (g = 9,8 m s⁻²).`,
          fig: {
            w: 340, h: 195, alt: "Corte del rotor: persona contra la pared con la fuerza normal horizontal, el rozamiento hacia arriba y el peso hacia abajo, y el radio hasta el eje",
            items: [
              { t: "ground", x1: 60, y1: 15, x2: 60, y2: 175, side: -1 },
              { t: "line", x1: 290, y1: 15, x2: 290, y2: 175, dash: true, w: 1.1 }, TX(290, 190, "eje de giro"),
              { t: "rect", x: 62, y: 85, w: 24, h: 50, fill: "light" },
              AR(74, 85, 74, 45), TX(86, 52, "f", "start"),
              AR(74, 135, 74, 172), TX(86, 168, "W", "start"),
              AR(86, 110, 135, 110), TX(142, 114, "N", "start"),
              { t: "line", x1: 62, y1: 30, x2: 290, y2: 30, arrow: "both", w: 1.1 }, TX(176, 24, "R"),
            ],
          },
          parts: [
            part("(a)", `Muestre que la rapidez angular mínima con la que la persona no resbala es ${fmt(wmin)} rad s⁻¹.`, [
              method("N = mω²R y f = μN = mg", /μ\s*N|N\s*=\s*m\s*ω|ω\s*²\s*R|g\s*\/\s*\(?\s*μ|m\s*g\s*=/i, g / (mu * R), "μN = mg con N = mω²R"),
              val("A1", `ω = √(g / μR) = ${fmt(wmin)} rad s⁻¹`, wmin),
            ], ["f = μ N = m g  y  N = m ω² R", "μ m ω² R = m g  →  ω = √(g / (μ R))", `ω = √(9,8 / (${f2(mu)} × ${f2(R)})) = ${fmt(wmin)} rad s⁻¹`]),
            part("(b)", `El rotor gira a ${rpm} revoluciones por minuto. Calcule su rapidez angular en rad s⁻¹.`, [
              method("ω = 2πf, con f en vueltas por segundo", /2\s*π|\/\s*60|ω\s*=/i, rpm / 60, "ω = 2π f"),
              val("A1", `ω = ${fmt(w)} rad s⁻¹`, w),
            ], [`f = ${rpm} / 60 = ${fmt(rpm / 60)} Hz`, `ω = 2π f = 2π × ${fmt(rpm / 60)}`, `ω = ${fmt(w)} rad s⁻¹`]),
            part("(c)", "Deduzca si las personas resbalan a esa rapidez.", [
              reason("ω es mayor que la mínima: no resbalan", "ω > ω mínima: no resbalan", "no resbal", "no se desliza", "no caen", "no deslizan", "mayor que la minima", "supera", "mayor que el minimo", "mayor que"),
            ], [`ω = ${fmt(w)} rad s⁻¹ es mayor que ω mínima = ${fmt(wmin)} rad s⁻¹ (${fmt(rpmmin)} rpm)`, "Luego la fuerza normal basta para que f ≥ mg: no resbalan"]),
            part("(d)", `Calcule la fuerza normal de la pared sobre una persona de ${m} kg y explique por qué el rozamiento sobre ella no aumenta si el rotor gira todavía más rápido.`, [
              method("N = mω²R (fuerza centrípeta)", /N\s*=\s*m\s*ω|m\s*ω\s*²\s*R|m\s*v\s*²\s*\/\s*R|ω\s*²\s*R/i, w * w * R, "N = mω²R"),
              val("A1", `N = ${fmt(N)} N`, N),
              reason("El rozamiento es estático y solo equilibra el peso (f = mg), que no cambia; N aumenta pero f no", "f = mg, no depende de ω", "peso", "mg", "m g", "equilibra", "igual", "no cambia", "constante"),
            ], [`N = m ω² R = ${m} × ${fmt(w)}² × ${f2(R)}`, `N = ${fmt(N)} N`, `En vertical no hay aceleración: f = m g = ${fmt(W)} N, que no depende de ω; al girar más rápido solo aumenta N`]),
          ],
        };
      },
    },
  ],
  A3: [
    {
      id: "x_fuerzax", label: "Gráfica fuerza–posición: trabajo y rapidez", level: 2,
      keywords: ["fuerza-posicion", "trabajo", "area bajo la curva", "energia cinetica"],
      make: (r) => {
        const F1 = pick(r, [20, 30, 40]), x1 = pick(r, [2, 4]), x2 = x1 + pick(r, [4, 6]), m = pick(r, [2, 4, 5, 10]);
        const W = 0.5 * F1 * x1 + F1 * (x2 - x1), v = Math.sqrt((2 * W) / m), Fm = W / x2;
        return {
          stem: `Un carrito de ${m} kg, inicialmente en reposo, se empuja a lo largo de un carril horizontal sin rozamiento con una fuerza horizontal variable. La gráfica muestra la fuerza en función de la posición del carrito.`,
          fig: {
            w: 360, h: 200, alt: "Gráfica fuerza–posición: la fuerza crece linealmente y luego se mantiene constante",
            items: [{
              t: "graph", x: 55, y: 30, w: 270, h: 130, xr: [0, x2], yr: [0, F1], xticks: [0, x1, x2], yticks: [0, F1 / 2, F1], grid: true,
              xlabel: "x / m", ylabel: "F / N", series: [{ pts: [[0, 0], [x1, F1], [x2, F1]] }],
            }],
          },
          parts: [
            part("(a)", `Determine el trabajo realizado por la fuerza entre x = 0 y x = ${x2} m.`, [
              method("El trabajo es el área bajo el gráfico F–x", /área|area|½|1\/2|trapecio/i, 0.5 * F1 * x1, "área bajo F–x"),
              val("A1", `W = ${fmt(W)} J`, W),
            ], ["W = área bajo el gráfico F–x", `W = ½ × ${x1} × ${F1} + ${F1} × ${x2 - x1}`, `W = ${fmt(W)} J`]),
            part("(b)", "Calcule la rapidez del carrito en x = " + x2 + " m.", [
              method("W = ΔEk = ½mv²", /½|1\/2|0[.,]5|Ek|cin[ée]tica|m\s*v\s*²/i, W, "W = ½mv²"),
              val("A1", `v = ${fmt(v)} m s⁻¹`, v),
            ], ["W = ΔEk = ½ m v²", `v = √(2W / m) = √(2 × ${fmt(W)} / ${m})`, `v = ${fmt(v)} m s⁻¹`]),
            part("(c)", "Calcule la fuerza media sobre el carrito en esa distancia.", [
              val("A1", `F media = W / x = ${fmt(Fm)} N`, Fm),
            ], [`F media = W / x = ${fmt(W)} / ${x2}`, `F media = ${fmt(Fm)} N`]),
          ],
        };
      },
    },
    {
      id: "x_ascensor", label: "Ascensor con motor: fuerzas, potencia y rendimiento", level: 3,
      keywords: ["ascensor", "potencia", "rendimiento", "tension", "motor"],
      make: (r) => {
        const M = pick(r, [800, 1000, 1200]), v = pick(r, [1.5, 2.5, 3.0, 4.0]), eps = pick(r, [0.70, 0.75, 0.80, 0.85]), a = pick(r, [0.8, 1.2, 1.5]);
        const T = M * g, Po = T * v, Pi = Po / eps, T2 = M * (g + a);
        return {
          stem: `Un motor eléctrico sube una cabina de ascensor con su carga, de masa total ${M} kg, mediante un cable. La cabina sube con rapidez constante de ${cm(v)} m s⁻¹. El rendimiento del motor y del mecanismo es ${Math.round(eps * 100)} % (g = 9,8 m s⁻²).`,
          fig: {
            w: 300, h: 225, alt: "Cabina de ascensor colgada de un cable que pasa por una polea movida por un motor, con su peso hacia abajo y la rapidez hacia arriba",
            items: [
              { t: "circle", cx: 150, cy: 38, r: 15, fill: "light" }, { t: "dot", x: 150, y: 38, r: 2.5 },
              { t: "rect", x: 40, y: 24, w: 64, h: 28, fill: "light" }, TX(72, 43, "motor"),
              { t: "line", x1: 104, y1: 38, x2: 135, y2: 38, w: 1.2 },
              { t: "line", x1: 150, y1: 53, x2: 150, y2: 105, w: 1.6 }, TX(160, 85, "T", "start"),
              { t: "rect", x: 115, y: 105, w: 70, h: 70, fill: "light" }, TX(150, 144, "cabina"),
              AR(150, 175, 150, 215), TX(160, 212, "W", "start"),
              AR(235, 165, 235, 110), TX(245, 140, "v", "start"),
            ],
          },
          parts: [
            part("(a)", "Determine la tensión del cable.", [
              method("Rapidez constante: fuerza neta cero, T = Mg", /T\s*=\s*M\s*g|T\s*=\s*W|m\s*g|equilibr|fuerza\s*neta\s*(es\s*)?cero/i, T, "T = Mg"),
              val("A1", `T = ${fmt(T)} N`, T),
            ], ["Aceleración cero: T = M g", `T = ${M} × 9,8 = ${fmt(T)} N`]),
            part("(b)", "Calcule la potencia útil que el cable entrega a la cabina.", [
              method("P = Tv", /P\s*=\s*[FT]\s*v|[FT]\s*v|T\s*×|F\s*×/i, Po, "P = Tv"),
              val("A1", `P útil = ${fmt(Po)} W`, Po),
            ], ["P = F v = T v", `P = ${fmt(T)} × ${cm(v)}`, `P útil = ${fmt(Po)} W`]),
            part("(c)", "Calcule la potencia eléctrica que consume el motor.", [
              method("rendimiento = P útil / P eléctrica", /rendimiento|eficiencia|ε|útil\s*\/|P\s*_?(ent|in|el)/i, Po, "rendimiento = P útil / P entrada"),
              val("A1", `P eléctrica = ${fmt(Pi)} W`, Pi),
            ], ["rendimiento = P útil / P eléctrica", `P eléctrica = ${fmt(Po)} / ${f2(eps)}`, `P eléctrica = ${fmt(Pi)} W`]),
            part("(d)", `Al arrancar, la cabina sube con una aceleración de ${cm(a)} m s⁻². Determine entonces la tensión del cable.`, [
              method("Segunda ley de Newton: T − Mg = Ma", /T\s*[-−]\s*M\s*g|M\s*\(\s*g\s*\+|m\s*a/i, M * a, "T − Mg = Ma"),
              val("A1", `T = M(g + a) = ${fmt(T2)} N`, T2),
            ], ["T − M g = M a", `T = M (g + a) = ${M} × (9,8 + ${cm(a)})`, `T = ${fmt(T2)} N`]),
            part("(e)", "Con la misma carga, el ascensor sube a velocidad constante al doble de rapidez. Deduzca en qué factor cambia la potencia útil.", [
              ratio("A1", "P = Tv con T constante: la potencia se multiplica por 2", 2, "x2", "dos veces", "2 veces"),
            ], ["T no cambia (aceleración cero) y P = T v", "Con 2v: P' = 2 P  →  factor 2"]),
          ],
        };
      },
    },
  ],
  A4: [
    {
      id: "x_omegat", label: "Gráfica ω–t de un volante que frena", level: 2,
      keywords: ["omega-tiempo", "aceleracion angular", "revoluciones", "torque", "volante"],
      make: (r) => {
        const w0 = pick(r, [20, 30, 40]), T = pick(r, [4, 5, 10]), I = pick(r, [0.50, 1.0, 2.0]);
        const al = w0 / T, th = 0.5 * w0 * T, rev = th / (2 * Math.PI), tau = I * al;
        return {
          stem: `Un volante de momento de inercia ${f2(I)} kg m² gira libremente y se frena con un freno de zapata hasta detenerse. La gráfica muestra su velocidad angular.`,
          fig: {
            w: 340, h: 195, alt: "Gráfica velocidad angular–tiempo: disminución lineal hasta cero",
            items: [{
              t: "graph", x: 55, y: 25, w: 250, h: 125, xr: [0, T], yr: [0, w0], xticks: [0, T / 2, T], yticks: [0, w0 / 2, w0], grid: true,
              xlabel: "t / s", ylabel: "ω / rad s⁻¹", series: [{ pts: [[0, w0], [T, 0]] }],
            }],
          },
          parts: [
            part("(a)", "Determine la magnitud de la aceleración angular del volante.", [
              method("α = pendiente del gráfico ω–t", /pendiente|gradiente|Δ\s*ω|\/\s*t/i, w0, "α = Δω / Δt"),
              val("A1", `α = ${fmt(al)} rad s⁻²`, al),
            ], ["α = |pendiente| = Δω / Δt", `α = ${w0} / ${T}`, `α = ${fmt(al)} rad s⁻²`]),
            part("(b)", "Calcule cuántas vueltas completas da el volante hasta detenerse.", [
              method("El ángulo girado es el área bajo el gráfico ω–t", /área|area|½|1\/2|trian/i, th, "θ = área bajo ω–t"),
              val("A1", `vueltas = θ / 2π = ${fmt(rev)}`, rev),
            ], [`θ = área bajo el gráfico = ½ × ${w0} × ${T} = ${fmt(th)} rad`, `vueltas = θ / 2π = ${fmt(th)} / 2π`, `vueltas = ${fmt(rev)}`]),
            part("(c)", "Calcule el momento de fuerza (torque) que ejerce el freno.", [
              val("A1", `τ = Iα = ${fmt(tau)} N m`, tau),
            ], [`τ = I α = ${f2(I)} × ${fmt(al)}`, `τ = ${fmt(tau)} N m`]),
          ],
        };
      },
    },
    {
      id: "x_cilindrorueda", label: "Cilindro que rueda por un plano: energía y comparaciones", level: 3,
      keywords: ["rodar", "energia de rotacion", "cilindro", "plano inclinado", "momento de inercia"],
      make: (r) => {
        const h = pick(r, [0.60, 0.80, 1.0, 1.5]), R = pick(r, [0.10, 0.20, 0.25]), m = pick(r, [2.0, 3.0, 5.0]);
        const v = Math.sqrt((4 * g * h) / 3), w = v / R, Er = 0.25 * m * v * v, vh = Math.sqrt(g * h), q = vh / v;
        // plane drawn to the question's height
        const H = 50 + 40 * h, base = 230, yb = 165, len = Math.hypot(base, H), d = [base / len, H / len], n = [H / len, -base / len];
        const c0 = [60 + d[0] * 38 + n[0] * 17, yb - H + d[1] * 38 + n[1] * 17];
        return {
          stem: `Un cilindro macizo y uniforme de ${f2(m)} kg y ${f2(R)} m de radio se suelta desde el reposo en lo alto de un plano inclinado, de ${f2(h)} m de altura, y rueda hacia abajo sin deslizar. Para un cilindro macizo I = ½mR² (g = 9,8 m s⁻²).`,
          fig: {
            w: 340, h: 185, alt: "Plano inclinado con un cilindro en la parte alta y la altura marcada a la izquierda",
            items: [
              { t: "poly", pts: [60, yb - H, 60 + base, yb, 60, yb], close: true, fill: "light" },
              { t: "ground", x1: 40, y1: yb, x2: 310, y2: yb },
              { t: "circle", cx: c0[0], cy: c0[1], r: 17, fill: "none" }, { t: "dot", x: c0[0], y: c0[1], r: 2.5 },
              { t: "line", x1: c0[0], y1: c0[1], x2: c0[0] + 12, y2: c0[1] - 12, w: 1.1 },
              { t: "line", x1: 46, y1: yb - H, x2: 46, y2: yb, arrow: "both", w: 1.1 }, TX(40, yb - H / 2 + 4, `${f2(h)} m`, "end"),
            ],
          },
          parts: [
            part("(a)", `Muestre que la rapidez del centro del cilindro al pie del plano es ${fmt(v)} m s⁻¹.`, [
              method("Conservación de la energía: mgh = ½mv² + ½Iω²", /m\s*g\s*h|½|1\/2|0[.,]5|I\s*ω/i, m * g * h, "mgh = ½mv² + ½Iω²"),
              val("A1", `v = √(4gh/3) = ${fmt(v)} m s⁻¹`, v),
            ], ["m g h = ½ m v² + ½ I ω²  con  I = ½ m R²  y  ω = v / R", "m g h = ½ m v² + ¼ m v² = ¾ m v²  →  v = √(4 g h / 3)", `v = √(4 × 9,8 × ${f2(h)} / 3) = ${fmt(v)} m s⁻¹`]),
            part("(b)", "Calcule la velocidad angular del cilindro al pie del plano.", [
              val("A1", `ω = v / R = ${fmt(w)} rad s⁻¹`, w),
            ], ["Sin deslizar: v = ω R", `ω = ${fmt(v)} / ${f2(R)} = ${fmt(w)} rad s⁻¹`]),
            part("(c)", "Determine la fracción de la energía cinética total, al pie del plano, que es energía cinética de rotación.", [
              method("Ek de rotación = ½Iω² = ¼mv²", /½\s*I\s*ω|I\s*ω\s*²|¼|1\/4|0[.,]25/i, Er, "Ek rot = ½Iω²"),
              { code: "A1", text: "fracción = ⅓ ≈ 0,33", miss: "fracción = 1/3", test: (l, n) => near(n, 1 / 3, TOL) || near(n, 33.3, TOL) || /1\s*\/\s*3|⅓/.test(l) },
            ], [`Ek rot = ½ I ω² = ½ × (½ m R²) × (v / R)² = ¼ m v² = ${fmt(Er)} J`, "Ek total = ¾ m v²", "fracción = ¼ / ¾ = 1/3 = 0,333"]),
            part("(d)", "Explique, en dos puntos, por qué el cilindro llega al pie del plano con menos rapidez que un bloque que desliza sin rozamiento desde la misma altura.", [
              reason("Parte de la energía potencial perdida se convierte en energía cinética de rotación", "parte de la energía pasa a rotación", "rotacion", "gira", "giro"),
              reason("Queda menos energía cinética de traslación, luego la rapidez del centro es menor", "menos energía para la traslación", "traslacion", "menos energia", "menor energia", "menor rapidez", "menos rapido"),
            ], ["La pérdida de energía potencial es la misma, pero parte se convierte en energía cinética de rotación", "Queda menos energía para la traslación, así que v es menor que √(2gh)"]),
            part("(e)", "Un cilindro hueco de pared delgada (I = mR²), con la misma masa y el mismo radio, rueda desde la misma altura. Calcule la razón entre su rapidez y la del cilindro macizo, v(hueco) / v(macizo).", [
              valT("A1", `v_hueco = √(gh), razón = ${fmt(q)}`, q, TOL),
            ], ["m g h = ½ m v² + ½ m v² = m v²  →  v_hueco = √(g h)", `v_hueco = ${fmt(vh)} m s⁻¹`, `razón = ${fmt(vh)} / ${fmt(v)} = ${fmt(q)}`]),
          ],
        };
      },
    },
  ],
  A5: [
    {
      id: "x_gammagraf", label: "Gráfica del factor de Lorentz (piones)", level: 2,
      keywords: ["factor de lorentz", "grafica", "dilatacion del tiempo", "pion", "gamma"],
      make: (r) => {
        const gm = pick(r, [1.5, 2.0, 2.5]), t0 = 26;
        const b = Math.sqrt(1 - 1 / (gm * gm)), v = b * C_LIGHT, t = gm * t0, ts = t * 1e-9, d = v * ts;
        const pts: [number, number][] = [];
        for (let k = 0; k <= 19; k++) pts.push([k * 0.05, gam(k * 0.05)]);
        return {
          stem: `Un haz de piones cargados viaja por un laboratorio con un factor de Lorentz γ = ${f2(gm).replace(".", ",")}. En su propio sistema de referencia, la vida media de un pión es de ${t0} ns. La gráfica muestra γ en función de la rapidez v/c (c = 3,0 × 10⁸ m s⁻¹).`,
          fig: {
            w: 380, h: 230, alt: "Gráfica del factor de Lorentz en función de v/c: crece despacio al principio y se dispara cerca de 1",
            items: [{
              t: "graph", x: 55, y: 20, w: 305, h: 160, xr: [0, 1], yr: [1, 3.5], xticks: [0, 0.2, 0.4, 0.6, 0.8, 1], yticks: [1, 1.5, 2, 2.5, 3, 3.5], grid: true,
              xlabel: "v / c", ylabel: "γ", series: [{ pts, smooth: true }],
            }],
          },
          parts: [
            part("(a)", "Utilice la gráfica para determinar la rapidez de los piones, como fracción de c.", [
              valT("A1", `v/c ≈ ${fmt(b)} (lectura de la gráfica)`, b, 0.06),
            ], [`Se lee la abscisa donde la curva alcanza γ = ${f2(gm)}`, `v / c = ${fmt(b)}`]),
            part("(b)", "Calcule la vida media de los piones medida en el laboratorio.", [
              method("Dilatación del tiempo: Δt = γΔt₀", /γ\s*[·×*]?\s*Δ?\s*t|Δ\s*t\s*=/i, gm, "Δt = γΔt₀"),
              valAny("A1", `Δt = ${fmt(t)} ns`, [t, ts]),
            ], ["Δt = γ Δt₀", `Δt = ${f2(gm)} × ${t0} ns`, `Δt = ${fmt(t)} ns`]),
            part("(c)", "Calcule la distancia que recorre un pión en el laboratorio durante su vida media.", [
              method("d = vΔt, con v = (v/c)c y el tiempo medido en el laboratorio", /v\s*[·×*]?\s*Δ?\s*t|d\s*=|β\s*c|v\s*=/i, v, "d = vΔt"),
              valT("A1", `d = ${fmt(d)} m`, d, 0.06),
            ], [`v = ${fmt(b)} × 3,0 × 10⁸ = ${fmt(v)} m s⁻¹`, `d = v Δt = ${fmt(v)} × ${fmt(ts)}`, `d = ${fmt(d)} m`]),
          ],
        };
      },
    },
    {
      id: "x_viajeestrella", label: "Viaje a una estrella: tiempo propio y contracción", level: 3,
      keywords: ["tiempo propio", "contraccion de la longitud", "nave", "dilatacion del tiempo", "suma de velocidades"],
      make: (r) => {
        const b = pick(r, [0.60, 0.80]), L = pick(r, [6, 9, 12, 15]), u = 0.5;
        const gm = gam(b), t = L / b, t0 = t / gm, L2 = L / gm, vs = (b + u) / (1 + b * u);
        return {
          stem: `Una nave espacial viaja de la Tierra a una estrella con rapidez constante ${f2(b)}c respecto de la Tierra. En el sistema de la Tierra, la distancia a la estrella es de ${L} años luz (1 año luz es la distancia que recorre la luz en un año; c = 1 año luz por año).`,
          fig: {
            w: 360, h: 130, alt: "La Tierra a la izquierda y una estrella a la derecha, separadas por una distancia L, con una nave que se mueve hacia la estrella",
            items: [
              { t: "circle", cx: 45, cy: 75, r: 15, fill: "light" }, TX(45, 108, "Tierra"),
              { t: "circle", cx: 315, cy: 75, r: 9, fill: "dark" }, TX(315, 108, "estrella"),
              { t: "line", x1: 62, y1: 45, x2: 298, y2: 45, arrow: "both", w: 1.1 }, TX(180, 38, `L = ${L} años luz`),
              { t: "poly", pts: [105, 70, 125, 75, 105, 80], close: true, fill: "dark" }, AR(132, 75, 175, 75), TX(155, 66, `${f2(b)}c`),
            ],
          },
          parts: [
            part("(a)", "Calcule el tiempo que dura el viaje, medido en el sistema de la Tierra.", [
              val("A1", `Δt = d / v = ${fmt(t)} años`, t),
            ], [`Δt = d / v = ${L} / ${f2(b)}`, `Δt = ${fmt(t)} años`]),
            part("(b)", "Determine el tiempo que dura el viaje según los relojes de la nave.", [
              method("Tiempo propio: Δt₀ = Δt / γ, con γ = 1/√(1 − v²/c²)", /γ|\/\s*√|Δ\s*t\s*₀|1\s*[-−]\s*v/i, gm, "Δt₀ = Δt / γ"),
              val("A1", `Δt₀ = ${fmt(t0)} años`, t0),
            ], [`γ = 1 / √(1 − ${f2(b)}²) = ${fmt(gm)}`, `Δt₀ = Δt / γ = ${fmt(t)} / ${fmt(gm)}`, `Δt₀ = ${fmt(t0)} años`]),
            part("(c)", `Muestre que, para la tripulación, la distancia hasta la estrella es ${fmt(L2)} años luz.`, [
              method("Contracción de la longitud: L = L₀ / γ", /L\s*₀\s*\/\s*γ|\/\s*γ|L\s*=|v\s*[·×*]?\s*Δ?\s*t\s*₀/i, gm, "L = L₀ / γ"),
              val("A1", `L = ${fmt(L2)} años luz`, L2),
            ], [`L = L₀ / γ = ${L} / ${fmt(gm)}`, `L = ${fmt(L2)} años luz`, `Comprobación: v Δt₀ = ${f2(b)} × ${fmt(t0)} = ${fmt(L2)} años luz`]),
            part("(d)", "Explique, en dos puntos, por qué la tripulación y los observadores de la Tierra no miden el mismo tiempo de viaje.", [
              reason("El reloj de la nave mide el tiempo propio, porque ambos sucesos (salida y llegada) ocurren en el mismo lugar de la nave", "tiempo propio: sucesos en el mismo lugar", "propio", "mismo lugar", "mismo punto", "misma posicion", "reloj de la nave"),
              reason("Para la tripulación la distancia hasta la estrella está contraída: la longitud propia es la medida en el sistema de la Tierra", "la distancia está contraída para la nave", "contrae", "contraccion", "contraida", "mas corta", "longitud propia", "menor distancia"),
            ], ["Los dos sucesos (salida y llegada) ocurren en el mismo lugar de la nave: sus relojes miden el tiempo propio, el menor", "Para la tripulación la distancia hasta la estrella está contraída; la longitud propia es la de la Tierra"]),
            part("(e)", `Desde la nave se lanza una sonda hacia la estrella con rapidez ${f2(u)}c respecto de la nave. Determine su rapidez, como fracción de c, respecto de la Tierra.`, [
              method("Suma relativista: w = (u + v) / (1 + uv/c²)", /1\s*\+|\(\s*u\s*\+\s*v\s*\)|u\s*\+\s*v|u\s*v\s*\/\s*c/i, 1 + b * u, "w = (u+v)/(1+uv/c²)"),
              val("A1", `w = ${fmt(vs)}c`, vs),
            ], ["w = (u + v) / (1 + u v / c²)", `w = (${f2(u)} + ${f2(b)}) / (1 + ${f2(u)} × ${f2(b)})`, `w = ${fmt(vs)}c`]),
          ],
        };
      },
    },
  ],
};
