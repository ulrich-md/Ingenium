/**
 * Exercise generators: original IB-style questions with new numbers every time.
 * Each concept builds an exam sheet whose mark rules are computed from the same
 * numbers, plus a worked solution (shown after marking and used in tests).
 */
import type { Rule } from "./check.ts";
import type { Part, Sheet } from "./content.ts";
import { hasAny, near, normalize } from "./numbers.ts";
import type { Unit } from "./scoring.ts";

export const G = 6.67e-11;
const g = 9.8;

/* ---------- deterministic randomness ---------- */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
const pick = <T,>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];

/* ---------- IB-style number formatting (decimal comma, ×10ⁿ) ---------- */
const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const sup = (n: number) => Array.from(String(n), (c) => SUP[c] ?? c).join("");
function sci(x: number, sig: number): string {
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(sig - 1))) >= 10) { e += 1; m = x / Math.pow(10, e); }
  return `${m.toFixed(sig - 1).replace(".", ",")} × 10${sup(e)}`;
}
export function fmt(x: number, sig = 3): string {
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 1e4 || ax < 1e-2) return sci(x, sig);
  const p = x.toPrecision(sig);
  return p.includes("e") ? sci(x, sig) : p.replace(".", ",");
}
const f2 = (x: number) => fmt(x, 2);

/* ---------- rule helpers ---------- */
const TOL = 0.035;
const val = (code: Rule["code"], text: string, target: number, miss: string = code): Rule =>
  ({ code, text, miss, test: (_, n) => near(n, target, TOL) });
const method = (text: string, re: RegExp, target: number, miss: string): Rule =>
  ({ code: "M1", text, miss, test: (l, n) => re.test(l) || re.test(normalize(l)) || near(n, target, TOL) });

function part(label: string, prompt: string, rules: Rule[], solution: string[], rows = Math.max(3, rules.length * 2)): Part {
  return {
    label, prompt, marks: rules.length, rows, rules, solution,
    sample: { rows: solution, notes: [{ row: solution.length - 1, ok: true, text: "✓ " + rules.map((r) => r.code).join(" ") }] },
  };
}

/* ---------- topics and concepts ---------- */
export interface Concept {
  id: string;
  label: string;
  /** words that, if typed in class notes, suggest this concept */
  keywords: string[];
  make: (r: R) => { stem: string; data?: string; parts: Part[] };
}
export interface Topic { id: string; unit: Unit; name: string; concepts: Concept[] }

const PLANETS = [
  { n: "la Tierra", M: 5.97e24, R: 6.37e6 },
  { n: "Marte", M: 6.42e23, R: 3.39e6 },
  { n: "la Luna", M: 7.35e22, R: 1.74e6 },
] as const;

export const TOPICS: Topic[] = [
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
          return {
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
  {
    id: "B3", unit: "B", name: "B.3 Modelos de gases",
    concepts: [
      {
        id: "gasideal", label: "Ecuación del gas ideal", keywords: ["gas ideal", "pv = nrt", "pv=nrt", "moles", "kelvin"],
        make: (r) => {
          const n = pick(r, [0.10, 0.20, 0.25, 0.50, 1.2]), Tc = pick(r, [15, 20, 27, 35, 50]), V = pick(r, [2.0e-3, 4.0e-3, 5.0e-3, 1.0e-2]);
          const T = Tc + 273, p = (n * 8.31 * T) / V;
          return {
            stem: `Un recipiente rígido de ${fmt(V, 2)} m³ contiene ${f2(n)} mol de un gas ideal a ${Tc} °C.`,
            data: "R = 8,31 J K⁻¹ mol⁻¹",
            parts: [part("(a)", "Calcule la presión del gas.", [
              val("M1", `Temperatura en kelvin: T = ${T} K`, T, "T en K"),
              val("A1", `p = nRT / V = ${fmt(p)} Pa`, p),
            ], [`T = ${Tc} + 273 = ${T} K`, `p = nRT / V = ${f2(n)} × 8,31 × ${T} / ${fmt(V, 2)}`, `p = ${fmt(p)} Pa`])],
          };
        },
      },
      {
        id: "isocorico", label: "Calentar a volumen constante", keywords: ["volumen constante", "isocorico", "se calienta", "p/t"],
        make: (r) => {
          const p1 = pick(r, [1.0e5, 1.2e5, 1.5e5, 2.0e5]), T1c = pick(r, [10, 20, 27]), T2c = pick(r, [80, 100, 127, 150]);
          const T1 = T1c + 273, T2 = T2c + 273, p2 = (p1 * T2) / T1;
          return {
            stem: `Un gas ideal en un recipiente rígido está a ${fmt(p1, 2)} Pa y ${T1c} °C. Se calienta hasta ${T2c} °C.`,
            parts: [part("(a)", "Calcule la nueva presión del gas.", [
              val("M1", `p₁/T₁ = p₂/T₂ con kelvin: T₂ = ${T2} K`, T2, "T en K"),
              val("A1", `p₂ = ${fmt(p2)} Pa`, p2),
            ], [`T₁ = ${T1} K, T₂ = ${T2} K`, `p₂ = p₁ × T₂ / T₁ = ${fmt(p1, 2)} × ${T2} / ${T1}`, `p₂ = ${fmt(p2)} Pa`])],
          };
        },
      },
    ],
  },
  {
    id: "D1", unit: "D", name: "D.1 Campos gravitatorios",
    concepts: [
      {
        id: "gravitacion", label: "Ley de gravitación de Newton", keywords: ["gravitacion", "ley de newton", "gm1m2", "fuerza gravitatoria", "atraccion"],
        make: (r) => {
          const m1 = pick(r, [2.0e12, 4.5e12, 6.0e12]), m2 = pick(r, [1.5e11, 3.0e11, 8.0e11]), d = pick(r, [2.0e3, 5.0e3, 8.0e3]);
          const F = (G * m1 * m2) / (d * d);
          return {
            stem: `Dos asteroides de masas ${fmt(m1, 2)} kg y ${fmt(m2, 2)} kg están separados ${fmt(d, 2)} m entre sus centros.`,
            data: "G = 6,67 × 10⁻¹¹ N m² kg⁻²",
            parts: [
              part("(a)", "Calcule la fuerza gravitatoria entre los asteroides.", [
                method("Usa F = G m₁ m₂ / r²", /G\s*[·×*]?\s*m|r\^?2|r²/i, F, "F = Gm₁m₂/r²"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["F = G m₁ m₂ / r²", `F = 6,67×10⁻¹¹ × ${fmt(m1, 2)} × ${fmt(m2, 2)} / (${fmt(d, 2)})²`, `F = ${fmt(F)} N`]),
              part("(b)", "La distancia entre los centros se reduce a la mitad. Indique el nuevo valor de la fuerza.", [val("A1", `F' = 4F = ${fmt(4 * F)} N`, 4 * F)],
                ["F ∝ 1/r²: si r se divide entre 2, F se multiplica por 4", `F' = ${fmt(4 * F)} N`]),
            ],
          };
        },
      },
      {
        id: "orbita", label: "Órbitas y rapidez orbital", keywords: ["orbita", "satelite", "rapidez orbital", "centripeta"],
        make: (r) => {
          const P = pick(r, PLANETS), hk = pick(r, [300, 500, 800, 1200]);
          const rad = P.R + hk * 1e3, v = Math.sqrt((G * P.M) / rad);
          return {
            stem: `Un satélite describe una órbita circular a ${hk} km sobre la superficie de ${P.n}.`,
            data: `Masa de ${P.n} = ${fmt(P.M)} kg · Radio de ${P.n} = ${fmt(P.R)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", "Calcule el radio de la órbita.", [{ code: "A1", text: `r = R + h = ${fmt(rad)} m`, miss: "r = R + h", test: (_, n) => near(n, rad, 0.01) }],
                [`r = R + h = ${fmt(P.R)} + ${fmt(hk * 1e3, 2)}`, `r = ${fmt(rad)} m`]),
              part("(b)", "Calcule la rapidez orbital del satélite.", [
                method("v = √(GM / r), o GMm/r² = mv²/r", /GM|√|sqrt|mv\^?2|v\^2|v²/i, v, "v = √(GM/r)"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["GMm / r² = m v² / r  →  v = √(GM / r)", `v = √(6,67×10⁻¹¹ × ${fmt(P.M)} / ${fmt(rad)})`, `v = ${fmt(v)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "escape", label: "Rapidez de escape", keywords: ["escape", "velocidad de escape", "rapidez de escape"],
        make: (r) => {
          const P = pick(r, PLANETS);
          const v = Math.sqrt((2 * G * P.M) / P.R);
          return {
            stem: `Se quiere lanzar una sonda desde la superficie de ${P.n} para que escape de su campo gravitatorio.`,
            data: `Masa de ${P.n} = ${fmt(P.M)} kg · Radio de ${P.n} = ${fmt(P.R)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", `Calcule la rapidez de escape desde la superficie de ${P.n}.`, [
                method("v = √(2GM / R)", /2\s*G\s*M|2GM/i, v, "v = √(2GM/R)"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["½ m v² − GMm / R = 0  →  v = √(2GM / R)", `v = √(2 × 6,67×10⁻¹¹ × ${fmt(P.M)} / ${fmt(P.R)})`, `v = ${fmt(v)} m s⁻¹`]),
              part("(b)", "Explique por qué la rapidez de escape no depende de la masa de la sonda.", [{
                code: "R1", text: "La masa de la sonda aparece en la energía cinética y en la potencial, y se cancela", miss: "la masa se cancela",
                test: (l) => hasAny(l, "cancela", "simplifica", "ambos lados", "ambas energias"),
              }], ["m aparece en ½mv² y en GMm/R: se cancela al igualar"], 2),
            ],
          };
        },
      },
      {
        id: "kepler", label: "Tercera ley de Kepler", keywords: ["kepler", "periodo", "t^2", "t²"],
        make: (r) => {
          const rad = pick(r, [7.0e6, 1.2e7, 2.66e7, 4.22e7]);
          const T = 2 * Math.PI * Math.sqrt(rad ** 3 / (G * 5.97e24));
          return {
            stem: `Un satélite describe una órbita circular de radio ${fmt(rad)} m alrededor de la Tierra.`,
            data: "Masa de la Tierra = 5,97 × 10²⁴ kg · G = 6,67 × 10⁻¹¹ N m² kg⁻²",
            parts: [part("(a)", "Calcule el periodo de la órbita.", [
              method("T² = 4π² r³ / GM", /T\^?2|T²|r\^?3|r³|2\s*π|4\s*π|2\s*pi/i, T, "T² = 4π²r³/GM"),
              { code: "A1", text: `T = ${fmt(T)} s (${fmt(T / 3600)} h)`, miss: "A1", test: (_, n) => near(n, T, TOL) || near(n, T / 3600, TOL) || near(n, T / 60, TOL) },
            ], ["T² = 4π² r³ / (GM)", `T = 2π √((${fmt(rad)})³ / (6,67×10⁻¹¹ × 5,97×10²⁴))`, `T = ${fmt(T)} s = ${fmt(T / 3600)} h`])],
          };
        },
      },
    ],
  },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

/** Build n exam sheets from the chosen concepts (cycling through them). */
export function generateSet(topicId: string, conceptIds: string[], seed: number, n = 4, idPrefix = "x"): Sheet[] {
  const topic = topicById(topicId);
  if (!topic) return [];
  const chosen = topic.concepts.filter((c) => conceptIds.includes(c.id));
  const list = chosen.length ? chosen : topic.concepts;
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const c = list[i % list.length];
    const q = c.make(r);
    return {
      id: `${idPrefix}-${i}`,
      num: i + 1,
      code: `KW.F.${topic.id}.${c.id.toUpperCase()}.${(seed % 9000) + 1000}`,
      unit: topic.unit,
      topic: `${topic.name} · ${c.label}`,
      paper: "Práctica",
      stem: q.stem,
      data: q.data,
      parts: q.parts,
    };
  });
}

/** Concepts whose keywords appear in typed notes. */
export function detectConcepts(topicId: string, text: string): string[] {
  const topic = topicById(topicId);
  if (!topic || !text.trim()) return [];
  return topic.concepts.filter((c) => c.keywords.some((k) => hasAny(text, k))).map((c) => c.id);
}

/** A short Paper 2 mock: one sheet per topic in turn, a random concept each, renumbered 1..n. */
export function generateMock(seed: number, n: number, idPrefix: string): Sheet[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const topic = TOPICS[i % TOPICS.length];
    const concept = pick(r, topic.concepts);
    const [sh] = generateSet(topic.id, [concept.id], seed + i * 7919, 1, `${idPrefix}-${i}`);
    return { ...sh, num: i + 1, paper: "Prueba 2" };
  });
}

/** IB Paper 2 runs at roughly 1.8 minutes per mark (90 min for 50 marks at SL). */
export const minutesFor = (sheets: Sheet[]) => Math.round(sheets.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.marks, 0), 0) * 1.8);
