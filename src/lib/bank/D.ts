/**
 * Unit D · Campos. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { E_CHARGE, f2, fmt, G, g, hasAny, K_COUL, ME, method, MU0, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type FigItem, type FormulaGroup, type Topic } from "./kit.ts";

const MP = 1.67e-27; // masa del protón (kg)
const MT = 5.97e24, RT = 6.37e6, ML = 7.35e22; // Tierra y Luna
const sgn = (q: number) => (q > 0 ? "+" : "−");
const rad = (deg: number) => (deg * Math.PI) / 180;

/* ---------- pequeños dibujos reutilizables ---------- */
/** Cruz (×): campo que entra en la página. */
const cross = (cx: number, cy: number, s = 3.5): FigItem[] => [
  { t: "line", x1: cx - s, y1: cy - s, x2: cx + s, y2: cy + s, w: 0.9 },
  { t: "line", x1: cx - s, y1: cy + s, x2: cx + s, y2: cy - s, w: 0.9 },
];
/** Punto en círculo (⊙): campo que sale de la página. */
const dotc = (cx: number, cy: number, s = 4): FigItem[] => [
  { t: "circle", cx, cy, r: s, sw: 0.9 },
  { t: "circle", cx, cy, r: 1.2, fill: "dark" },
];
const marks = (kind: "in" | "out", xs: number[], ys: number[]): FigItem[] => xs.flatMap((x) => ys.flatMap((y) => (kind === "in" ? cross(x, y) : dotc(x, y))));
const range = (a: number, b: number, step: number) => { const o: number[] = []; for (let x = a; x <= b + 1e-9; x += step) o.push(x); return o; };
const arr = (x1: number, y1: number, x2: number, y2: number, w = 1.6): FigItem => ({ t: "line", x1, y1, x2, y2, w, arrow: "end" });
const dim = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2, w: 1, arrow: "both" });
const T = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle", italic = false): FigItem => ({ t: "text", x, y, s, anchor, italic });

export const topics: Topic[] = [
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
      {
        id: "campo2masas", label: "Campo gravitatorio de dos masas", keywords: ["intensidad de campo", "punto neutro", "tierra luna", "campo neto"],
        make: (r) => {
          const d = pick(r, [3.60e8, 3.84e8, 4.05e8]);
          const gT = (G * MT) / (d * d);
          const k = Math.sqrt(ML / MT), x = d / (1 + k);
          const px = 270;
          return {
            fig: {
              w: 400, h: 175, alt: "La Tierra y la Luna separadas una distancia d, y un punto P entre ellas donde los campos gravitatorios de ambas tienen sentidos opuestos",
              items: [
                T(200, 16, "(no está a escala)"),
                { t: "circle", cx: 55, cy: 95, r: 28, fill: "light" }, T(55, 60, "Tierra"),
                { t: "circle", cx: 345, cy: 95, r: 10, fill: "light" }, T(345, 76, "Luna"),
                { t: "line", x1: 83, y1: 95, x2: 335, y2: 95, w: 0.8, dash: true, gray: true },
                { t: "dot", x: px, y: 95, r: 3 }, T(px, 118, "P"),
                arr(px, 95, 215, 95), T(240, 86, "gT"),
                arr(px, 95, 300, 95), T(293, 86, "gL"),
                { t: "line", x1: 55, y1: 125, x2: 55, y2: 152, w: 0.8, gray: true }, { t: "line", x1: 345, y1: 107, x2: 345, y2: 152, w: 0.8, gray: true },
                dim(55, 148, 345, 148), T(200, 143, "d"),
              ],
            },
            stem: `La distancia entre los centros de la Tierra y de la Luna es d = ${fmt(d, 3)} m. Considere solo la influencia de estos dos cuerpos sobre un punto P situado entre ellos, en la línea que los une.`,
            data: `Masa de la Tierra = ${fmt(MT)} kg · Masa de la Luna = ${fmt(ML)} kg · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", "Calcule la intensidad del campo gravitatorio de la Tierra en el centro de la Luna.", [
                method("g = GM / r²", /GM|G\s*[·×*]?\s*M|r\^?2|r²/i, gT, "g = GM/r²"),
                val("A1", `g = ${fmt(gT)} N kg⁻¹`, gT),
              ], ["g = G M / r²", `g = 6,67×10⁻¹¹ × ${fmt(MT)} / (${fmt(d, 3)})²`, `g = ${fmt(gT)} N kg⁻¹`]),
              part("(b)", "Determine la distancia desde el centro de la Tierra hasta el punto P en el que la intensidad del campo gravitatorio neta es cero.", [
                { code: "M1", text: "Iguala GM_T / x² = GM_L / (d − x)²", miss: "g_T = g_L en P", test: (l, n) => /\(\s*d\s*[-−]\s*x\s*\)|d\s*[-−]\s*x/i.test(l) || near(n, k, TOL) || near(n, 1 / k, TOL) },
                val("A1", `x = ${fmt(x)} m`, x),
              ], ["En P: G M_T / x² = G M_L / (d − x)²", `x / (d − x) = √(M_T / M_L) = ${fmt(1 / k)}`, `x = d / (1 + √(M_L / M_T)) = ${fmt(x)} m`]),
              part("(c)", "Indique el sentido de la intensidad de campo neta en un punto de la línea Tierra–Luna situado más cerca de la Tierra que P.", [
                reason("Hacia la Tierra (domina el campo de la Tierra)", "hacia la Tierra", "hacia la tierra", "tierra"),
              ], ["Más cerca de la Tierra domina g_T: el campo neto apunta hacia la Tierra"], 2),
            ],
          };
        },
      },
      {
        id: "potencialgrav", label: "Potencial y energía potencial gravitatoria", keywords: ["potencial gravitatorio", "energia potencial", "cambio de orbita", "-gm/r"],
        make: (r) => {
          const m = pick(r, [200, 500, 1000, 1500]), h1 = pick(r, [300, 400, 600]), h2 = pick(r, [2000, 4000, 8000]);
          const r1 = RT + h1 * 1e3, r2 = RT + h2 * 1e3;
          const V1 = (-G * MT) / r1, V2 = (-G * MT) / r2, dE = m * (V2 - V1);
          const cx = 105, cy = 105, o1 = 48, o2 = 82;
          const p = (a: number, rr: number) => [cx + rr * Math.cos(rad(a)), cy - rr * Math.sin(rad(a))];
          const s1 = p(40, o1), s2 = p(-40, o2);
          return {
            fig: {
              w: 320, h: 210, alt: `Satélite de ${m} kg que pasa de una órbita de radio r₁ a otra de radio r₂ alrededor de la Tierra`,
              items: [
                { t: "circle", cx, cy, r: 28, fill: "light" }, T(cx, cy + 4, "Tierra"),
                { t: "circle", cx, cy, r: o1, dash: true }, { t: "circle", cx, cy, r: o2, dash: true },
                { t: "line", x1: p(40, 28)[0], y1: p(40, 28)[1], x2: s1[0], y2: s1[1], w: 1, arrow: "end" }, T(cx + 38, cy - 40, "r₁"),
                { t: "line", x1: p(-40, 28)[0], y1: p(-40, 28)[1], x2: s2[0], y2: s2[1], w: 1, arrow: "end" }, T(cx + 52, cy + 56, "r₂"),
                { t: "circle", cx: s1[0], cy: s1[1], r: 4, fill: "dark" }, { t: "circle", cx: s2[0], cy: s2[1], r: 4, fill: "dark" },
              ],
            },
            stem: `Un satélite de ${m} kg describe una órbita circular a ${h1} km sobre la superficie de la Tierra. Se le transfiere a otra órbita circular a ${h2} km sobre la superficie.`,
            data: `Masa de la Tierra = ${fmt(MT)} kg · Radio de la Tierra = ${fmt(RT)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", "Calcule el potencial gravitatorio en la órbita inicial.", [
                method("V = −GM / r con r = R + h", /GM|G\s*[·×*]?\s*M/i, r1, "V = −GM/r"),
                val("A1", `V₁ = ${fmt(V1)} J kg⁻¹`, V1),
              ], [`r₁ = R + h = ${fmt(r1)} m`, "V = −G M / r", `V₁ = −6,67×10⁻¹¹ × ${fmt(MT)} / ${fmt(r1)} = ${fmt(V1)} J kg⁻¹`]),
              part("(b)", "Determine el aumento de energía potencial gravitatoria del satélite al pasar a la segunda órbita.", [
                { code: "M1", text: "ΔEp = m ΔV, con V₂ en la segunda órbita", miss: "ΔEp = mΔV", test: (l, n) => near(n, V2, TOL) || /Δ\s*V|ΔEp|Δ\s*E/i.test(l) },
                val("A1", `ΔEp = ${fmt(dE)} J`, dE),
              ], [`r₂ = ${fmt(r2)} m;  V₂ = −GM / r₂ = ${fmt(V2)} J kg⁻¹`, `ΔEp = m ΔV = ${m} × (${fmt(V2)} − (${fmt(V1)}))`, `ΔEp = ${fmt(dE)} J`]),
              part("(c)", "Explique por qué el potencial gravitatorio en la superficie de un planeta es negativo.", [
                reason("Se toma V = 0 en el infinito y la fuerza es atractiva: hay que realizar trabajo para llevar la masa al infinito", "V = 0 en el infinito", "infinito", "atractiv", "atraccion", "atrae"),
              ], ["V = 0 en el infinito; como la fuerza gravitatoria es siempre atractiva, el potencial disminuye al acercarse: es negativo"], 2),
            ],
          };
        },
      },
      {
        id: "energiaorbita", label: "Energía total de un satélite en órbita", keywords: ["energia total", "energia orbital", "energia cinetica", "ligado"],
        make: (r) => {
          const m = pick(r, [300, 600, 1000, 2000]), h = pick(r, [400, 800, 1500, 3000]);
          const rr = RT + h * 1e3, Ek = (G * MT * m) / (2 * rr), Ep = -2 * Ek, E = -Ek, dE = Ek / 2;
          const cx = 110, cy = 105;
          const p = (a: number, q: number) => [cx + q * Math.cos(rad(a)), cy - q * Math.sin(rad(a))];
          const s1 = p(45, 50), s2 = p(-35, 100);
          return {
            fig: {
              w: 320, h: 210, alt: "Satélite en una órbita circular de radio r alrededor de la Tierra y órbita final de radio 2r",
              items: [
                { t: "circle", cx, cy, r: 25, fill: "light" }, T(cx, cy + 4, "Tierra"),
                { t: "circle", cx, cy, r: 50, dash: true }, { t: "circle", cx, cy, r: 100, dash: true },
                { t: "line", x1: p(45, 25)[0], y1: p(45, 25)[1], x2: s1[0], y2: s1[1], w: 1, arrow: "end" }, T(cx + 22, cy - 40, "r"),
                { t: "line", x1: p(-35, 25)[0], y1: p(-35, 25)[1], x2: s2[0], y2: s2[1], w: 1, arrow: "end" }, T(cx + 66, cy + 30, "2r"),
                { t: "circle", cx: s1[0], cy: s1[1], r: 4, fill: "dark" }, { t: "circle", cx: s2[0], cy: s2[1], r: 4, fill: "dark" },
              ],
            },
            stem: `Un satélite de ${m} kg describe una órbita circular a ${h} km sobre la superficie de la Tierra. Más tarde se le transfiere a otra órbita circular cuyo radio (medido desde el centro de la Tierra) es el doble del radio de la primera.`,
            data: `Masa de la Tierra = ${fmt(MT)} kg · Radio de la Tierra = ${fmt(RT)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", "Determine la energía cinética del satélite en la órbita inicial.", [
                method("Ek = ½mv² con v² = GM / r, es decir Ek = GMm / 2r", /GMm|G\s*M\s*m|½|1\/2|2\s*r/i, Ek, "Ek = GMm/2r"),
                val("A1", `Ek = ${fmt(Ek)} J`, Ek),
              ], [`r = R + h = ${fmt(rr)} m`, "GMm / r² = m v² / r  →  Ek = ½mv² = GMm / 2r", `Ek = 6,67×10⁻¹¹ × ${fmt(MT)} × ${m} / (2 × ${fmt(rr)}) = ${fmt(Ek)} J`]),
              part("(b)", "Deduzca la energía total del satélite en la órbita inicial.", [
                { code: "M1", text: "Ep = −GMm / r = −2Ek", miss: "Ep = −GMm/r", test: (_, n) => near(n, Ep, TOL) },
                val("A1", `E = Ek + Ep = ${fmt(E)} J`, E),
              ], [`Ep = −GMm / r = ${fmt(Ep)} J`, `E = Ek + Ep = ${fmt(Ek)} + (${fmt(Ep)})`, `E = ${fmt(E)} J`]),
              part("(c)", "Calcule cuánto aumenta la energía total del satélite al pasar a la órbita de radio doble.", [
                { code: "M1", text: "E final = −GMm / 4r = E/2", miss: "E en la órbita final", test: (_, n) => near(n, E / 2, TOL) },
                val("A1", `ΔE = ${fmt(dE)} J`, dE),
              ], [`E final = −GMm / (2 × 2r) = E / 2 = ${fmt(E / 2)} J`, `ΔE = ${fmt(E / 2)} − (${fmt(E)})`, `ΔE = ${fmt(dE)} J`]),
            ],
          };
        },
      },
      {
        id: "galtura", label: "Intensidad de campo y peso a distintas alturas", keywords: ["gravedad", "intensidad del campo", "peso", "altura"],
        make: (r) => {
          const P = pick(r, PLANETS), h = pick(r, [500, 1000, 2000, 4000]), m = pick(r, [60, 70, 80]);
          const g0 = (G * P.M) / (P.R * P.R), rr = P.R + h * 1e3, gh = (G * P.M) / (rr * rr), W = m * gh;
          const cx = 120, cy = 135, Rp = 60;
          return {
            fig: {
              w: 300, h: 200, alt: `Un astronauta a una altura h sobre la superficie de ${P.n}, de radio R`,
              items: [
                { t: "circle", cx, cy, r: Rp, fill: "light" }, T(cx, cy + 20, "centro"), { t: "dot", x: cx, y: cy, r: 2.5 },
                { t: "line", x1: cx, y1: cy, x2: cx, y2: cy - Rp, w: 1, arrow: "both" }, T(cx + 8, cy - 28, "R", "start"),
                { t: "line", x1: cx, y1: cy - Rp, x2: cx, y2: 24, w: 1, arrow: "both" }, T(cx + 8, 50, "h", "start"),
                { t: "dot", x: cx, y: 24, r: 3.5 }, T(cx + 12, 28, `astronauta (${m} kg)`, "start"),
              ],
            },
            stem: `Un astronauta de ${m} kg se encuentra en una nave a ${h} km sobre la superficie de ${P.n}. Ignore la rotación del planeta.`,
            data: `Masa de ${P.n} = ${fmt(P.M)} kg · Radio de ${P.n} = ${fmt(P.R)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
            parts: [
              part("(a)", `Calcule la intensidad del campo gravitatorio en la superficie de ${P.n}.`, [
                method("g = GM / R²", /GM|G\s*[·×*]?\s*M|R\^?2|R²/i, g0, "g = GM/R²"),
                val("A1", `g = ${fmt(g0)} N kg⁻¹`, g0),
              ], ["g = G M / R²", `g = 6,67×10⁻¹¹ × ${fmt(P.M)} / (${fmt(P.R)})²`, `g = ${fmt(g0)} N kg⁻¹`]),
              part("(b)", "Determine la intensidad del campo gravitatorio a la altura de la nave.", [
                { code: "M1", text: "Usa r = R + h desde el centro", miss: "r = R + h", test: (_, n) => near(n, rr, 0.01) },
                val("A1", `g = ${fmt(gh)} N kg⁻¹`, gh),
              ], [`r = R + h = ${fmt(P.R)} + ${h}×10³ = ${fmt(rr)} m`, `g = G M / r² = 6,67×10⁻¹¹ × ${fmt(P.M)} / (${fmt(rr)})²`, `g = ${fmt(gh)} N kg⁻¹`]),
              part("(c)", "Calcule la fuerza gravitatoria que actúa sobre el astronauta en esa posición.", [val("A1", `F = mg = ${fmt(W)} N`, W)],
                [`F = m g = ${m} × ${fmt(gh)}`, `F = ${fmt(W)} N`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "D2", unit: "D", name: "D.2 Campos eléctricos y magnéticos",
    concepts: [
      {
        id: "coulomb", label: "Ley de Coulomb", keywords: ["coulomb", "fuerza electrica", "carga puntual", "cargas"],
        make: (r) => {
          const a = pick(r, [2.0, 3.0, 4.0, 5.0]), b = pick(r, [1.5, 2.5, 6.0, 8.0]), s = pick(r, [1, -1]), dc = pick(r, [10, 15, 20, 30]);
          const q1 = a * 1e-6, q2 = s * b * 1e-6, d = dc / 100;
          const F = (K_COUL * Math.abs(q1 * q2)) / (d * d);
          return {
            fig: {
              w: 380, h: 120, alt: `Dos cargas puntuales, q₁ = +${fmt(a, 2)} μC y q₂ = ${sgn(s)}${fmt(b, 2)} μC, separadas ${dc} cm`,
              items: [
                { t: "circle", cx: 80, cy: 55, r: 14, fill: "light" }, T(80, 60, "+"), T(80, 28, `q₁ = +${fmt(a, 2)} μC`),
                { t: "circle", cx: 300, cy: 55, r: 14, fill: "light" }, T(300, 60, sgn(s)), T(300, 28, `q₂ = ${sgn(s)}${fmt(b, 2)} μC`),
                { t: "line", x1: 80, y1: 69, x2: 80, y2: 92, w: 0.8, gray: true }, { t: "line", x1: 300, y1: 69, x2: 300, y2: 92, w: 0.8, gray: true },
                dim(80, 88, 300, 88), T(190, 110, `d = ${dc} cm`),
              ],
            },
            stem: `Dos cargas puntuales, q₁ = +${fmt(a, 2)} μC y q₂ = ${sgn(s)}${fmt(b, 2)} μC, están fijas en el vacío y separadas ${dc} cm.`,
            data: "k = 8,99 × 10⁹ N m² C⁻²",
            parts: [
              part("(a)", "Calcule la magnitud de la fuerza eléctrica entre las cargas.", [
                method("F = k q₁ q₂ / r²", /k\s*[·×*]?\s*q|q\s*1|q₁|r\^?2|r²/i, F, "F = kq₁q₂/r²"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["F = k q₁ q₂ / r²", `F = 8,99×10⁹ × ${fmt(a * 1e-6, 2)} × ${fmt(b * 1e-6, 2)} / (${fmt(d, 2)})²`, `F = ${fmt(F)} N`]),
              part("(b)", "Indique si la fuerza entre las cargas es de atracción o de repulsión.", [
                s > 0
                  ? reason("Repulsión (cargas del mismo signo)", "repulsión", "repuls", "se repelen", "repele")
                  : reason("Atracción (cargas de signo opuesto)", "atracción", "atrac", "se atraen", "atrae"),
              ], [s > 0 ? "Las dos cargas son positivas: fuerza de repulsión" : "Las cargas tienen signos opuestos: fuerza de atracción"], 2),
              part("(c)", "La separación entre las cargas se duplica. Determine la nueva fuerza.", [val("A1", `F' = F / 4 = ${fmt(F / 4)} N`, F / 4)],
                ["F ∝ 1/r²: si r se duplica, F se divide entre 4", `F' = ${fmt(F)} / 4 = ${fmt(F / 4)} N`]),
            ],
          };
        },
      },
      {
        id: "campopuntual", label: "Campo eléctrico de cargas puntuales", keywords: ["campo electrico", "e = kq/r", "intensidad de campo electrico", "superposicion"],
        make: (r) => {
          const a = pick(r, [2.0, 4.0, 6.0]), b = pick(r, [3.0, 5.0, 8.0]), s = pick(r, [1, -1]), dc = pick(r, [20, 30, 40]);
          const q1 = a * 1e-6, q2 = s * b * 1e-6, rr = dc / 200; // distancia de cada carga al punto medio, en m
          const E1 = (K_COUL * q1) / (rr * rr), E2 = (K_COUL * Math.abs(q2)) / (rr * rr);
          const Ex = (K_COUL * (q1 - q2)) / (rr * rr), net = Math.abs(Ex), right = Ex > 0;
          // sentido de cada campo en P (+1 hacia la derecha)
          const d1 = 1, d2 = s > 0 ? -1 : 1;
          const Emax = Math.max(E1, E2), L1 = 25 + (45 * E1) / Emax, L2 = 25 + (45 * E2) / Emax;
          return {
            fig: {
              w: 380, h: 170, alt: `Cargas q₁ = +${fmt(a, 2)} μC y q₂ = ${sgn(s)}${fmt(b, 2)} μC separadas ${dc} cm, con los campos de cada una en el punto medio P`,
              items: [
                { t: "circle", cx: 60, cy: 85, r: 14, fill: "light" }, T(60, 90, "+"), T(60, 55, `q₁ = +${fmt(a, 2)} μC`),
                { t: "circle", cx: 320, cy: 85, r: 14, fill: "light" }, T(320, 90, sgn(s)), T(320, 55, `q₂ = ${sgn(s)}${fmt(b, 2)} μC`),
                { t: "line", x1: 74, y1: 85, x2: 306, y2: 85, w: 0.8, dash: true, gray: true },
                { t: "dot", x: 190, y: 85, r: 3 }, T(190, 115, "P"),
                arr(190, 70, 190 + d1 * L1, 70), T(190 + d1 * L1 + (d1 > 0 ? 12 : -12), 66, "E₁"),
                arr(190, 100, 190 + d2 * L2, 100), T(190 + d2 * L2 + (d2 > 0 ? 12 : -12), 112, "E₂"),
                { t: "line", x1: 60, y1: 104, x2: 60, y2: 140, w: 0.8, gray: true }, { t: "line", x1: 320, y1: 104, x2: 320, y2: 140, w: 0.8, gray: true },
                dim(60, 136, 320, 136), T(190, 158, `d = ${dc} cm`),
              ],
            },
            stem: `Dos cargas puntuales fijas, q₁ = +${fmt(a, 2)} μC y q₂ = ${sgn(s)}${fmt(b, 2)} μC, están separadas ${dc} cm en el vacío. El punto P es el punto medio del segmento que las une.`,
            data: "k = 8,99 × 10⁹ N m² C⁻²",
            parts: [
              part("(a)", "Calcule la magnitud del campo eléctrico en P debido solo a q₁.", [
                method("E = kq / r², con r = 0,5 d", /k\s*[·×*]?\s*q|q\s*\/\s*r|r\^?2|r²/i, E1, "E = kq/r²"),
                val("A1", `E₁ = ${fmt(E1)} N C⁻¹`, E1),
              ], ["E = k q / r² (r es la distancia de q₁ a P: la mitad de la separación)", `E₁ = 8,99×10⁹ × ${fmt(a * 1e-6, 2)} / (${fmt(rr, 2)})²`, `E₁ = ${fmt(E1)} N C⁻¹`]),
              part("(b)", "Determine la magnitud del campo eléctrico neto en P.", [
                { code: "M1", text: s > 0 ? "E₂ = kq₂ / r² y los campos tienen sentidos opuestos: se restan" : "E₂ = kq₂ / r² y los campos tienen el mismo sentido: se suman", miss: "superposición de E₁ y E₂", test: (_, n) => near(n, E2, TOL) },
                val("A1", `E = ${fmt(net)} N C⁻¹`, net),
              ], [`E₂ = k q₂ / r² = ${fmt(E2)} N C⁻¹`, s > 0 ? "Sentidos opuestos: E = |E₁ − E₂|" : "Mismo sentido: E = E₁ + E₂", `E = ${fmt(net)} N C⁻¹`]),
              part("(c)", "Indique el sentido del campo neto en P (hacia q₁ o hacia q₂).", [
                right
                  ? reason("Hacia q₂ (a la derecha)", "hacia q₂", "q2", "q₂", "derecha")
                  : reason("Hacia q₁ (a la izquierda)", "hacia q₁", "q1", "q₁", "izquierda"),
              ], [right ? "Domina el campo que apunta a la derecha: hacia q₂" : "Domina el campo que apunta a la izquierda: hacia q₁"], 2),
            ],
          };
        },
      },
      {
        id: "placas", label: "Campo entre placas paralelas", keywords: ["placas paralelas", "e = v/d", "campo uniforme", "condensador"],
        make: (r) => {
          const V = pick(r, [100, 200, 300, 500, 1000]), dmm = pick(r, [5, 10, 20, 40]), n = pick(r, [1, 2, 3]);
          const d = dmm * 1e-3, E = V / d, q = n * 1.6e-19, F = q * E;
          return {
            fig: {
              w: 420, h: 185, alt: `Dos placas paralelas separadas ${dmm} mm conectadas a una diferencia de potencial de ${V} V, con las líneas de campo entre ellas`,
              items: [
                { t: "line", x1: 110, y1: 40, x2: 290, y2: 40, w: 3 }, { t: "line", x1: 110, y1: 140, x2: 290, y2: 140, w: 3 },
                ...range(125, 275, 30).flatMap((x) => [T(x, 33, "+"), T(x, 158, "−")]),
                ...[145, 200, 255].map((x) => arr(x, 48, x, 132)),
                { t: "comp", kind: "battery", x1: 325, y1: 40, x2: 325, y2: 140 },
                { t: "line", x1: 290, y1: 40, x2: 325, y2: 40, w: 1.2 }, { t: "line", x1: 290, y1: 140, x2: 325, y2: 140, w: 1.2 },
                T(343, 94, `V = ${V} V`, "start"),
                dim(90, 40, 90, 140), T(82, 94, `d = ${dmm} mm`, "end"),
              ],
            },
            stem: `Dos placas metálicas paralelas, separadas ${dmm} mm en el vacío, se conectan a una fuente de ${V} V. Ignore los efectos de borde.`,
            data: "e = 1,6 × 10⁻¹⁹ C",
            parts: [
              part("(a)", "Calcule la magnitud del campo eléctrico entre las placas.", [
                method("E = V / d", /V\s*\/\s*d|V\s*d/i, E, "E = V/d"),
                val("A1", `E = ${fmt(E)} V m⁻¹`, E),
              ], ["E = V / d", `E = ${V} / (${dmm}×10⁻³)`, `E = ${fmt(E)} V m⁻¹`]),
              part("(b)", `Calcule la fuerza eléctrica sobre una partícula de carga +${n === 1 ? "e" : n + "e"} situada entre las placas.`, [
                val("A1", `F = qE = ${fmt(F)} N`, F),
              ], [`q = ${n} × 1,6×10⁻¹⁹ = ${fmt(q, 2)} C`, `F = q E = ${fmt(q, 2)} × ${fmt(E)}`, `F = ${fmt(F)} N`]),
              part("(c)", "Explique por qué el campo eléctrico es el mismo en todos los puntos situados entre las placas, lejos de los bordes.", [
                reason("Las placas paralelas dan líneas de campo paralelas y equidistantes (misma intensidad)", "líneas paralelas y equidistantes", "paralel", "equidist", "misma intensidad", "mismo valor", "igual"),
              ], ["Las líneas de campo entre las placas son paralelas y están igualmente espaciadas: el campo tiene el mismo valor en todos los puntos"], 2),
            ],
          };
        },
      },
      {
        id: "potencialelec", label: "Potencial eléctrico y energía", keywords: ["potencial electrico", "v = kq/r", "trabajo electrico", "energia potencial electrica"],
        make: (r) => {
          const Q = pick(r, [2.0, 3.0, 5.0]) * 1e-9, q = pick(r, [1.0, 2.0, 4.0]) * 1e-9, r1c = pick(r, [20, 30]), r2c = pick(r, [5, 10]);
          const r1 = r1c / 100, r2 = r2c / 100;
          const V1 = (K_COUL * Q) / r1, V2 = (K_COUL * Q) / r2, W = q * (V2 - V1);
          const cx = 100, cy = 100, p1 = r1c * 3, p2 = r2c * 3, a = rad(35);
          const A = [cx + p1 * Math.cos(a), cy - p1 * Math.sin(a)], B = [cx + p2 * Math.cos(a), cy - p2 * Math.sin(a)];
          return {
            fig: {
              w: 340, h: 200, alt: `Carga fija +Q en el centro; una carga de prueba se acerca desde una distancia r₁ = ${r1c} cm hasta r₂ = ${r2c} cm`,
              items: [
                { t: "circle", cx, cy, r: p1, dash: true }, { t: "circle", cx, cy, r: p2, dash: true },
                { t: "circle", cx, cy, r: 9, fill: "light" }, { t: "text", x: cx, y: cy + 3, s: "+Q", size: 9 },
                arr(A[0], A[1], B[0] + 3, B[1] - 1, 1.8),
                { t: "circle", cx: A[0], cy: A[1], r: 4, fill: "dark" }, T(A[0] + 10, A[1] - 8, `r₁ = ${r1c} cm`, "start"),
                { t: "circle", cx: B[0], cy: B[1], r: 3, fill: "dark" }, T(cx, cy + p2 + 22, `r₂ = ${r2c} cm`),
              ],
            },
            stem: `Una carga puntual fija Q = +${fmt(Q * 1e9, 2)} nC está en el vacío. Una carga de prueba q = +${fmt(q * 1e9, 2)} nC se lleva lentamente desde un punto situado a ${r1c} cm de Q hasta otro a ${r2c} cm de Q.`,
            data: "k = 8,99 × 10⁹ N m² C⁻²",
            parts: [
              part("(a)", "Calcule el potencial eléctrico debido a Q en el punto inicial.", [
                method("V = kQ / r", /k\s*[·×*]?\s*Q|Q\s*\/\s*r/i, V1, "V = kQ/r"),
                val("A1", `V₁ = ${fmt(V1)} V`, V1),
              ], ["V = k Q / r", `V₁ = 8,99×10⁹ × ${fmt(Q, 2)} / ${fmt(r1, 2)}`, `V₁ = ${fmt(V1)} V`]),
              part("(b)", "Determine el trabajo que debe realizar el agente externo.", [
                { code: "M1", text: "W = qΔV, con V₂ = kQ / r₂", miss: "W = qΔV", test: (l, n) => near(n, V2, TOL) || /Δ\s*V|q\s*[·×*]?\s*\(\s*V/i.test(l) },
                val("A1", `W = ${fmt(W)} J`, W),
              ], [`V₂ = k Q / r₂ = ${fmt(V2)} V`, `W = q (V₂ − V₁) = ${fmt(q, 2)} × (${fmt(V2)} − ${fmt(V1)})`, `W = ${fmt(W)} J`]),
              part("(c)", "Explique por qué el trabajo del agente externo es positivo.", [
                reason("Q y q se repelen: hay que empujar la carga contra la fuerza eléctrica", "repulsión: trabajo contra la fuerza", "repuls", "repel", "contra la fuerza", "contra el campo", "mismo signo"),
              ], ["Las dos cargas son positivas y se repelen: el agente externo empuja contra la fuerza eléctrica, así que W > 0"], 2),
            ],
          };
        },
      },
      {
        id: "alambrerecto", label: "Campo magnético de un alambre recto", keywords: ["campo magnetico", "alambre", "conductor recto", "μ₀i/2πr"],
        make: (r) => {
          const I = pick(r, [5, 10, 20, 40, 60]), rc = pick(r, [2, 5, 10, 15]), out = pick(r, [true, false]);
          const rr = rc / 100, B = (MU0 * I) / (2 * Math.PI * rr);
          const BE = 4.5e-5, rE = (MU0 * I) / (2 * Math.PI * BE);
          const cx = 110, cy = 95;
          const ring: FigItem[] = [{ t: "circle", cx, cy, r: 80, dash: true }];
          return {
            fig: {
              w: 300, h: 208, alt: `Alambre largo y recto perpendicular a la página con corriente ${out ? "saliente" : "entrante"}; el punto P está a ${rc} cm del alambre`,
              items: [
                ...ring,
                ...(out ? dotc(cx, cy, 8) : [{ t: "circle", cx, cy, r: 8 } as FigItem, ...cross(cx, cy, 5)]),
                T(cx - 16, cy + 3, "I", "end", true),
                { t: "line", x1: cx, y1: cy, x2: cx + 80, y2: cy, w: 1.2, arrow: "end" }, { t: "dot", x: cx + 80, y: cy, r: 3 }, T(cx + 90, cy + 4, "P", "start"),
                T(cx + 40, cy + 18, `r = ${rc} cm`), T(cx, 197, out ? "corriente saliente de la página (⊙)" : "corriente entrante en la página (⊗)"),
              ],
            },
            stem: `Un alambre largo y recto, perpendicular a la página, transporta una corriente de ${I} A ${out ? "hacia fuera de la página" : "hacia dentro de la página"}. Considere el punto P a ${rc} cm del alambre.`,
            data: "μ₀ = 4π × 10⁻⁷ T m A⁻¹ · Campo magnético terrestre en el lugar = 4,5 × 10⁻⁵ T",
            parts: [
              part("(a)", "Calcule la magnitud del campo magnético en P debido a la corriente.", [
                method("B = μ₀I / 2πr", /μ|mu|2\s*π|2\s*pi|I\s*\/\s*r/i, B, "B = μ₀I/2πr"),
                val("A1", `B = ${fmt(B)} T`, B),
              ], ["B = μ₀ I / (2π r)", `B = 4π×10⁻⁷ × ${I} / (2π × ${fmt(rr, 2)})`, `B = ${fmt(B)} T`]),
              part("(b)", "Indique el sentido de las líneas de campo magnético alrededor del alambre.", [
                out
                  ? reason("Antihorario (regla de la mano derecha)", "antihorario", "antihorario", "contrario a las agujas", "sentido contrario")
                  : { code: "R1", text: "Horario (regla de la mano derecha)", miss: "horario", test: (l) => hasAny(l, "horario", "agujas del reloj") && !hasAny(l, "anti", "contrari") },
              ], [out ? "Pulgar hacia fuera de la página: las líneas giran en sentido antihorario" : "Pulgar hacia dentro de la página: las líneas giran en sentido horario"], 2),
              part("(c)", "Calcule a qué distancia del alambre el campo de la corriente tiene la misma magnitud que el campo magnético terrestre.", [
                valAny("A1", `r = μ₀I / 2πB = ${fmt(rE)} m`, [rE, rE * 100]),
              ], ["r = μ₀ I / (2π B)", `r = 4π×10⁻⁷ × ${I} / (2π × 4,5×10⁻⁵)`, `r = ${fmt(rE)} m`]),
            ],
          };
        },
      },
      {
        id: "alambrespar", label: "Fuerza entre dos alambres paralelos", keywords: ["alambres paralelos", "fuerza entre corrientes", "corrientes paralelas", "amperio"],
        make: (r) => {
          const I1 = pick(r, [5, 10, 15, 20]), I2 = pick(r, [4, 6, 12, 25]), dc = pick(r, [2, 4, 5, 10]), L = pick(r, [0.5, 1.5, 2.0, 3.0]), same = pick(r, [true, false]);
          const d = dc / 100, fl = (MU0 * I1 * I2) / (2 * Math.PI * d), F = fl * L;
          return {
            fig: {
              w: 360, h: 215, alt: `Dos alambres largos y paralelos separados ${dc} cm con corrientes de ${I1} A y de ${I2} A ${same ? "en el mismo sentido" : "en sentidos opuestos"}`,
              items: [
                { t: "line", x1: 110, y1: 40, x2: 110, y2: 165, w: 3 }, { t: "line", x1: 250, y1: 40, x2: 250, y2: 165, w: 3 },
                arr(110, 120, 110, 70, 1.8), same ? arr(250, 120, 250, 70, 1.8) : arr(250, 70, 250, 120, 1.8),
                T(110, 28, `I₁ = ${I1} A`), T(250, 28, `I₂ = ${I2} A`),
                { t: "line", x1: 110, y1: 165, x2: 110, y2: 190, w: 0.8, gray: true }, { t: "line", x1: 250, y1: 165, x2: 250, y2: 190, w: 0.8, gray: true },
                dim(110, 186, 250, 186), T(180, 204, `d = ${dc} cm`),
              ],
            },
            stem: `Dos alambres largos y paralelos, separados ${dc} cm en el vacío, transportan corrientes de ${I1} A y de ${I2} A ${same ? "en el mismo sentido" : "en sentidos opuestos"}.`,
            data: "μ₀ = 4π × 10⁻⁷ T m A⁻¹",
            parts: [
              part("(a)", "Calcule la fuerza por unidad de longitud entre los alambres.", [
                method("F/L = μ₀I₁I₂ / 2πd", /μ|mu|2\s*π|2\s*pi|I\s*1|I₁/i, fl, "F/L = μ₀I₁I₂/2πd"),
                val("A1", `F/L = ${fmt(fl)} N m⁻¹`, fl),
              ], ["F / L = μ₀ I₁ I₂ / (2π d)", `F / L = 4π×10⁻⁷ × ${I1} × ${I2} / (2π × ${fmt(d, 2)})`, `F / L = ${fmt(fl)} N m⁻¹`]),
              part("(b)", `Determine la magnitud de la fuerza sobre un tramo de ${fmt(L, 2)} m de uno de los alambres.`, [val("A1", `F = (F/L) L = ${fmt(F)} N`, F)],
                [`F = (F / L) × L = ${fmt(fl)} × ${fmt(L, 2)}`, `F = ${fmt(F)} N`]),
              part("(c)", "Indique si los alambres se atraen o se repelen.", [
                same ? reason("Se atraen (corrientes en el mismo sentido)", "atracción", "atrae", "atraen", "atrac") : reason("Se repelen (corrientes en sentidos opuestos)", "repulsión", "repel", "repuls"),
              ], [same ? "Corrientes en el mismo sentido: los alambres se atraen" : "Corrientes en sentidos opuestos: los alambres se repelen"], 2),
            ],
          };
        },
      },
    ],
  },
  {
    id: "D3", unit: "D", name: "D.3 Movimiento en campos electromagnéticos",
    concepts: [
      {
        id: "aceleracionqv", label: "Carga acelerada por una diferencia de potencial", keywords: ["cañon de electrones", "acelerada", "qv", "energia cinetica"],
        make: (r) => {
          const el = pick(r, [true, false]), V = pick(r, [200, 500, 1000, 2000]);
          const m = el ? ME : MP, name = el ? "un electrón" : "un protón", q = E_CHARGE;
          const dEk = q * V, v = Math.sqrt((2 * q * V) / m), v4 = 2 * v;
          return {
            fig: {
              w: 380, h: 175, alt: `${name} parte del reposo en la placa de la izquierda y es acelerado hacia la placa de la derecha por una diferencia de potencial de ${V} V`,
              items: [
                { t: "line", x1: 110, y1: 30, x2: 110, y2: 125, w: 3 }, { t: "line", x1: 270, y1: 30, x2: 270, y2: 125, w: 3 },
                T(110, 22, el ? "−" : "+"), T(270, 22, el ? "+" : "−"),
                { t: "circle", cx: 124, cy: 78, r: 6, fill: "dark" }, T(124, 62, el ? "e⁻" : "p⁺"),
                arr(136, 78, 215, 78, 1.8), T(176, 70, "v"),
                dim(110, 148, 270, 148), T(190, 166, `V = ${V} V`),
              ],
            },
            stem: `${el ? "Un electrón" : "Un protón"} parte del reposo de una placa y se acelera en el vacío hasta otra placa. La diferencia de potencial entre las placas es de ${V} V. Ignore los efectos relativistas.`,
            data: `e = 1,6 × 10⁻¹⁹ C · ${el ? "masa del electrón = 9,11 × 10⁻³¹ kg" : "masa del protón = 1,67 × 10⁻²⁷ kg"}`,
            parts: [
              part("(a)", "Calcule la energía cinética que gana la partícula.", [
                method("ΔEk = qV", /q\s*[·×*]?\s*V|e\s*[·×*]?\s*V/i, dEk, "ΔEk = qV"),
                val("A1", `ΔEk = ${fmt(dEk)} J`, dEk),
              ], ["ΔEk = q ΔV", `ΔEk = 1,6×10⁻¹⁹ × ${V}`, `ΔEk = ${fmt(dEk)} J`]),
              part("(b)", "Determine la rapidez final de la partícula.", [
                method("½mv² = qV", /½|1\/2|0\.5|m\s*v|2\s*q\s*V|2\s*e\s*V/i, v, "½mv² = qV"),
                val("A1", `v = ${fmt(v)} m s⁻¹`, v),
              ], ["½ m v² = q V  →  v = √(2qV / m)", `v = √(2 × ${fmt(dEk)} / ${fmt(m, 3)})`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Se cuadruplica la diferencia de potencial. Determine la nueva rapidez final.", [val("A1", `v' = 2v = ${fmt(v4)} m s⁻¹`, v4)],
                ["v ∝ √V: si V se multiplica por 4, v se multiplica por 2", `v' = 2 × ${fmt(v)} = ${fmt(v4)} m s⁻¹`]),
            ],
          };
        },
      },
      {
        id: "fuerzamag", label: "Fuerza magnética sobre una carga en movimiento", keywords: ["fuerza magnetica", "qvb", "trayectoria circular", "radio de giro"],
        make: (r) => {
          const el = pick(r, [true, false]);
          const v = el ? pick(r, [1.0e6, 3.0e6, 5.0e6]) : pick(r, [2.0e5, 5.0e5, 1.0e6]);
          const B = el ? pick(r, [1.0e-3, 2.0e-3, 5.0e-3]) : pick(r, [0.20, 0.50, 1.0]);
          const m = el ? ME : MP, q = E_CHARGE, F = q * v * B, rr = (m * v) / (q * B);
          const cx = 190, cy = 125, R0 = 60, up = !el; // protón: centro encima del punto de entrada; electrón: debajo
          const ey = up ? cy + R0 : cy - R0;
          return {
            fig: {
              w: 380, h: 245, alt: `${el ? "Un electrón" : "Un protón"} entra con velocidad v en un campo magnético uniforme B dirigido hacia dentro de la página y describe una circunferencia`,
              items: [
                { t: "rect", x: 20, y: 22, w: 340, h: 212, sw: 1 },
                ...marks("in", range(50, 330, 40), range(45, 205, 40)),
                T(190, 14, "B hacia dentro de la página (×)"),
                { t: "circle", cx, cy, r: R0, sw: 1.6 },
                arr(120, ey, 184, ey, 2), T(126, ey + (up ? -9 : -9), "v"),
                { t: "dot", x: cx, y: ey, r: 3.5 },
                arr(cx, ey, cx, up ? ey - 38 : ey + 38, 2), T(cx + 12, up ? ey - 24 : ey + 30, "F", "start"),
                { t: "line", x1: cx, y1: cy, x2: cx + 42, y2: cy - 42, w: 1.2, arrow: "end" }, T(cx + 36, cy - 14, "r", "start"),
              ],
            },
            stem: `${el ? "Un electrón" : "Un protón"} que se mueve con rapidez ${fmt(v, 2)} m s⁻¹ entra perpendicularmente en una región donde hay un campo magnético uniforme de ${fmt(B, 2)} T. La partícula describe una trayectoria circular.`,
            data: `e = 1,6 × 10⁻¹⁹ C · ${el ? "masa del electrón = 9,11 × 10⁻³¹ kg" : "masa del protón = 1,67 × 10⁻²⁷ kg"}`,
            parts: [
              part("(a)", "Calcule la magnitud de la fuerza magnética sobre la partícula.", [
                method("F = qvB", /q\s*[·×*]?\s*v|e\s*[·×*]?\s*v|vB/i, F, "F = qvB"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["F = q v B (v ⟂ B)", `F = 1,6×10⁻¹⁹ × ${fmt(v, 2)} × ${fmt(B, 2)}`, `F = ${fmt(F)} N`]),
              part("(b)", "Determine el radio de la trayectoria.", [
                method("qvB = mv² / r", /m\s*v\^?2|mv²|m\s*v\s*\/|v\^?2\s*\/\s*r|m\s*[·×*]?\s*v/i, rr, "qvB = mv²/r"),
                val("A1", `r = ${fmt(rr)} m`, rr),
              ], ["La fuerza magnética es la fuerza centrípeta: q v B = m v² / r  →  r = m v / (q B)", `r = ${fmt(m, 3)} × ${fmt(v, 2)} / (1,6×10⁻¹⁹ × ${fmt(B, 2)})`, `r = ${fmt(rr)} m`]),
              part("(c)", "Explique por qué la rapidez de la partícula no cambia mientras se mueve en el campo.", [
                reason("La fuerza magnética es perpendicular a la velocidad: no realiza trabajo", "F ⟂ v: no hace trabajo", "perpendicular", "no realiza trabajo", "no hace trabajo", "angulo recto"),
              ], ["La fuerza magnética es siempre perpendicular a la velocidad, no realiza trabajo y no cambia la energía cinética"], 2),
            ],
          };
        },
      },
      {
        id: "conductorcorriente", label: "Fuerza sobre un conductor con corriente", keywords: ["fuerza sobre un conductor", "bil", "corriente en un campo magnetico", "regla de la mano"],
        make: (r) => {
          const B = pick(r, [0.10, 0.20, 0.40, 0.50]), I = pick(r, [2.0, 4.0, 5.0, 8.0]), L = pick(r, [0.20, 0.30, 0.50, 0.80]), th = pick(r, [30, 45, 60]), out = pick(r, [true, false]);
          const F = B * I * L, Fth = F * Math.sin(rad(th));
          const xs = range(50, 330, 40), ys = [45, 85, 160, 200];
          return {
            fig: {
              w: 380, h: 240, alt: `Conductor horizontal de ${f2(L)} m con corriente de ${f2(I)} A hacia la derecha en un campo magnético uniforme ${out ? "saliente" : "entrante"}`,
              items: [
                { t: "rect", x: 20, y: 22, w: 340, h: 205, sw: 1 },
                ...marks(out ? "out" : "in", xs, ys),
                T(190, 14, out ? "B hacia fuera de la página (⊙)" : "B hacia dentro de la página (×)"),
                { t: "line", x1: 80, y1: 122, x2: 300, y2: 122, w: 4 }, arr(160, 108, 240, 108, 2), T(200, 100, `I = ${f2(I)} A`),
                { t: "line", x1: 80, y1: 130, x2: 80, y2: 148, w: 0.8, gray: true }, { t: "line", x1: 300, y1: 130, x2: 300, y2: 148, w: 0.8, gray: true },
                dim(80, 144, 300, 144), T(190, 140, `L = ${f2(L)} m`),
              ],
            },
            stem: `Un conductor recto y horizontal de ${f2(L)} m de longitud transporta una corriente de ${f2(I)} A hacia la derecha. Está en un campo magnético uniforme de ${f2(B)} T perpendicular al conductor, ${out ? "dirigido hacia fuera de la página" : "dirigido hacia dentro de la página"}.`,
            parts: [
              part("(a)", "Calcule la magnitud de la fuerza magnética sobre el conductor.", [
                method("F = BIL", /B\s*[·×*]?\s*I\s*[·×*]?\s*L|BIL/i, F, "F = BIL"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["F = B I L sen 90° = B I L", `F = ${f2(B)} × ${f2(I)} × ${f2(L)}`, `F = ${fmt(F)} N`]),
              part("(b)", "Indique el sentido de la fuerza sobre el conductor (hacia arriba o hacia abajo en la página).", [
                out ? reason("Hacia abajo (regla de la mano derecha)", "hacia abajo", "abajo") : reason("Hacia arriba (regla de la mano derecha)", "hacia arriba", "arriba"),
              ], [out ? "Corriente a la derecha y B saliente: F = I L × B apunta hacia abajo" : "Corriente a la derecha y B entrante: F = I L × B apunta hacia arriba"], 2),
              part("(c)", `El conductor se gira de modo que forma un ángulo de ${th}° con las líneas del campo. Calcule la nueva fuerza.`, [
                method("F = BIL sen θ", /sen|sin|θ/i, Math.sin(rad(th)), "F = BIL sen θ"),
                val("A1", `F = ${fmt(Fth)} N`, Fth),
              ], ["F = B I L sen θ", `F = ${f2(B)} × ${f2(I)} × ${f2(L)} × sen ${th}°`, `F = ${fmt(Fth)} N`]),
            ],
          };
        },
      },
      {
        id: "selectorvel", label: "Selector de velocidades", keywords: ["selector de velocidades", "campos cruzados", "e y b", "v = e/b"],
        make: (r) => {
          const V = pick(r, [200, 300, 400, 600]), dc = pick(r, [2.0, 4.0, 5.0]), Bm = pick(r, [20, 40, 50, 100]);
          const E = V / (dc / 100), B = Bm * 1e-3, v = E / B;
          return {
            fig: {
              w: 420, h: 190, alt: `Selector de velocidades: placas horizontales con campo eléctrico hacia abajo y campo magnético hacia dentro de la página; una partícula entra con velocidad v por la izquierda`,
              items: [
                { t: "line", x1: 70, y1: 35, x2: 310, y2: 35, w: 3 }, { t: "line", x1: 70, y1: 145, x2: 310, y2: 145, w: 3 },
                T(190, 28, "+  +  +  +  +  +  +"), T(190, 164, "−  −  −  −  −  −  −"),
                ...[110, 190, 270].map((x) => arr(x, 44, x, 74, 1.4)), T(122, 62, "E", "start"),
                ...marks("in", [90, 150, 230, 290], [105, 128]), T(60, 118, "B (×)", "end"),
                { t: "line", x1: 20, y1: 90, x2: 320, y2: 90, w: 1, dash: true, gray: true }, arr(20, 90, 60, 90, 2), T(40, 82, "v"),
                { t: "dot", x: 22, y: 90, r: 3 },
                dim(335, 35, 335, 145), T(345, 94, `d = ${f2(dc)} cm`, "start"),
              ],
            },
            stem: `En un selector de velocidades, las placas están separadas ${f2(dc)} cm y se mantienen a una diferencia de potencial de ${V} V. Entre las placas hay además un campo magnético uniforme de ${Bm} mT perpendicular al campo eléctrico y a la velocidad de las partículas.`,
            parts: [
              part("(a)", "Calcule la magnitud del campo eléctrico entre las placas.", [
                method("E = V / d", /V\s*\/\s*d|V\s*d/i, E, "E = V/d"),
                val("A1", `E = ${fmt(E)} V m⁻¹`, E),
              ], ["E = V / d", `E = ${V} / (${f2(dc)}×10⁻²)`, `E = ${fmt(E)} V m⁻¹`]),
              part("(b)", "Determine la rapidez de las partículas que atraviesan el selector sin desviarse.", [
                method("qE = qvB", /qE|q\s*E|E\s*\/\s*B|v\s*=\s*E/i, v, "qE = qvB"),
                val("A1", `v = E / B = ${fmt(v)} m s⁻¹`, v),
              ], ["Sin desviación: qE = q v B  →  v = E / B", `v = ${fmt(E)} / ${fmt(B, 2)}`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", "Un ión con el doble de carga entra con esa misma rapidez. Indique si atraviesa el selector sin desviarse y justifique su respuesta.", [
                reason("Sí: la carga se cancela en qE = qvB", "la carga se cancela", "cancela", "independ", "no depende", "simplifica", "misma"),
              ], ["Sí. En qE = qvB la carga q se cancela: la rapidez seleccionada no depende de la carga"], 2),
            ],
          };
        },
      },
      {
        id: "desviacion", label: "Desviación de un electrón entre placas", keywords: ["electron entre placas", "trayectoria parabolica", "desviacion", "osciloscopio"],
        make: (r) => {
          const V = pick(r, [100, 150, 200]), dmm = pick(r, [20, 25, 30]), Lmm = pick(r, [40, 50, 60]), v0 = pick(r, [2.0e7, 2.5e7, 3.0e7]);
          const d = dmm * 1e-3, L = Lmm * 1e-3, E = V / d, a = (E_CHARGE * E) / ME, t = L / v0, y = 0.5 * a * t * t;
          const yd = 14 + (y / (d / 2)) * 34; // sólo ilustrativo
          return {
            fig: {
              w: 400, h: 190, alt: `Un electrón entra horizontalmente con velocidad v₀ entre dos placas paralelas, la inferior positiva, y su trayectoria se curva hacia abajo`,
              items: [
                { t: "line", x1: 110, y1: 35, x2: 310, y2: 35, w: 3 }, { t: "line", x1: 110, y1: 135, x2: 310, y2: 135, w: 3 },
                T(210, 28, "−  −  −  −  −  −"), T(210, 152, "+  +  +  +  +  +"),
                arr(30, 85, 100, 85, 2), T(65, 77, "v₀"),
                { t: "path", d: `M 110 85 Q 210 85 310 ${85 + yd}`, w: 1.8 },
                { t: "line", x1: 310, y1: 85, x2: 345, y2: 85, w: 0.8, dash: true, gray: true },
                dim(340, 85, 340, 85 + yd), T(348, 85 + yd / 2 + 4, "y", "start"),
                dim(110, 168, 310, 168), T(210, 184, `L = ${Lmm} mm`),
                dim(95, 35, 95, 135), T(88, 56, `d = ${dmm} mm`, "end"),
              ],
            },
            stem: `Un electrón entra horizontalmente, a lo largo del eje central, en la región entre dos placas paralelas horizontales de ${Lmm} mm de longitud y separadas ${dmm} mm. La rapidez inicial del electrón es ${fmt(v0, 2)} m s⁻¹ y entre las placas hay una diferencia de potencial de ${V} V. Ignore el peso del electrón y los efectos de borde.`,
            data: "e = 1,6 × 10⁻¹⁹ C · masa del electrón = 9,11 × 10⁻³¹ kg",
            parts: [
              part("(a)", "Calcule la aceleración del electrón entre las placas.", [
                method("a = eE / m con E = V / d", /e\s*E|eV|E\s*=\s*V|V\s*\/\s*d|qE/i, E, "a = eV/md"),
                val("A1", `a = ${fmt(a)} m s⁻²`, a),
              ], [`E = V / d = ${V} / (${dmm}×10⁻³) = ${fmt(E)} V m⁻¹`, "a = F / m = e E / m", `a = ${fmt(a)} m s⁻²`]),
              part("(b)", "Determine el tiempo que tarda el electrón en atravesar las placas.", [
                method("La componente horizontal es constante: t = L / v₀", /L\s*\/\s*v|x\s*\/\s*v|distancia/i, t, "t = L/v₀"),
                val("A1", `t = ${fmt(t)} s`, t),
              ], ["Horizontalmente no hay fuerza: t = L / v₀", `t = ${Lmm}×10⁻³ / ${fmt(v0, 2)}`, `t = ${fmt(t)} s`]),
              part("(c)", "Calcule la desviación vertical y del electrón a la salida de las placas.", [
                method("y = ½at² (parte del reposo en vertical)", /½|1\/2|0\.5|a\s*t\^?2|at²/i, y, "y = ½at²"),
                val("A1", `y = ${fmt(y)} m`, y),
              ], ["Verticalmente parte del reposo: y = ½ a t²", `y = 0,5 × ${fmt(a)} × (${fmt(t)})²`, `y = ${fmt(y)} m`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "D4", unit: "D", name: "D.4 Inducción", hl: true,
    concepts: [
      {
        id: "flujo", label: "Flujo magnético", keywords: ["flujo magnetico", "φ = bacosθ", "espira", "weber"],
        make: (r) => {
          const B = pick(r, [0.20, 0.35, 0.50, 0.80]), a = pick(r, [3, 4, 5, 6]), b = pick(r, [8, 10, 12]), th = pick(r, [30, 40, 50, 60]), N = pick(r, [20, 50, 100, 200]);
          const A = a * b * 1e-4, Phi = B * A * Math.cos(rad(th)), link = N * Phi, Pmax = B * A;
          const c = [210, 105], t = rad(th);
          const nx = Math.cos(t), ny = -Math.sin(t); // normal (y de pantalla hacia abajo)
          const ex = Math.sin(t), ey = Math.cos(t); // a lo largo de la espira
          return {
            fig: {
              w: 400, h: 215, alt: `Bobina vista de canto en un campo magnético uniforme B; la normal a la bobina forma un ángulo de ${th}° con el campo`,
              items: [
                ...[60, 105, 150].flatMap((y) => [arr(20, y, 130, y, 1.3), arr(290, y, 385, y, 1.3)]), T(75, 52, "B"),
                { t: "line", x1: c[0] - 55 * ex, y1: c[1] - 55 * ey, x2: c[0] + 55 * ex, y2: c[1] + 55 * ey, w: 4 },
                arr(c[0], c[1], c[0] + 62 * nx, c[1] + 62 * ny, 1.6), T(c[0] + 62 * nx, c[1] + 62 * ny - 8, "normal"),
                { t: "angle", x: c[0], y: c[1], r: 38, a1: 0, a2: th, label: `${th}°` },
                T(c[0], 200, "bobina vista de canto"),
              ],
            },
            stem: `Una bobina rectangular de ${N} espiras, de ${a} cm × ${b} cm, está en un campo magnético uniforme de ${f2(B)} T. La normal al plano de la bobina forma un ángulo de ${th}° con la dirección del campo.`,
            parts: [
              part("(a)", "Calcule el flujo magnético que atraviesa una espira.", [
                method("Φ = BA cos θ, con A = ab", /B\s*[·×*]?\s*A|cos/i, A, "Φ = BA cosθ"),
                val("A1", `Φ = ${fmt(Phi)} Wb`, Phi),
              ], [`A = ${a}×10⁻² × ${b}×10⁻² = ${fmt(A)} m²`, "Φ = B A cos θ", `Φ = ${f2(B)} × ${fmt(A)} × cos ${th}° = ${fmt(Phi)} Wb`]),
              part("(b)", "Determine el enlace de flujo de la bobina.", [val("A1", `NΦ = ${fmt(link)} Wb`, link)],
                [`NΦ = ${N} × ${fmt(Phi)}`, `NΦ = ${fmt(link)} Wb`]),
              part("(c)", "Indique el valor de θ (positivo y menor que 180°) para el que el flujo a través de la bobina sería nulo.", [val("A1", "θ = 90° (el plano de la bobina es paralelo a B)", 90)],
                ["Φ = B A cos θ = 0 cuando cos θ = 0", "θ = 90°"]),
            ],
          };
        },
      },
      {
        id: "faraday", label: "Ley de Faraday", keywords: ["faraday", "fem inducida", "variacion del flujo", "dφ/dt"],
        make: (r) => {
          const N = pick(r, [50, 100, 200, 400]), Ac = pick(r, [20, 25, 40, 50]), B1 = pick(r, [40, 80]), B2 = pick(r, [120, 160, 200]);
          const t1 = pick(r, [0.1, 0.2]), dt = pick(r, [0.2, 0.4, 0.5]), R = pick(r, [2, 4, 5, 8]);
          const t2 = Math.round((t1 + dt) * 10) / 10, tend = Math.round((t2 + 0.1) * 10) / 10;
          const A = Ac * 1e-4, dB = (B2 - B1) * 1e-3, dPhi = A * dB, emf = (N * dPhi) / dt, I = emf / R;
          const ymax = B2 + 40;
          return {
            fig: {
              w: 400, h: 225, alt: `Gráfica del campo magnético en mT frente al tiempo en s: constante, crece de forma lineal y vuelve a ser constante`,
              items: [{
                t: "graph", x: 55, y: 30, w: 320, h: 150, xr: [0, tend], yr: [0, ymax], xlabel: "t / s", ylabel: "B / mT",
                xticks: range(0, tend, 0.1).map((x) => Math.round(x * 10) / 10), yticks: range(0, ymax, 40), grid: true,
                series: [{ pts: [[0, B1], [t1, B1], [t2, B2], [tend, B2]], dots: false }],
              }],
            },
            stem: `Una bobina de ${N} espiras, cada una con un área de ${Ac} cm², se coloca con su plano perpendicular a un campo magnético uniforme. La gráfica muestra cómo varía la magnitud del campo con el tiempo. La resistencia total del circuito de la bobina es ${R} Ω.`,
            parts: [
              part("(a)", "Utilice la gráfica para determinar el cambio de flujo magnético a través de una espira mientras el campo está variando.", [
                { code: "M1", text: `ΔB = ${B2 - B1} mT leído de la gráfica`, miss: "ΔB de la gráfica", test: (_, n) => near(n, B2 - B1, TOL) || near(n, dB, TOL) },
                val("A1", `ΔΦ = AΔB = ${fmt(dPhi)} Wb`, dPhi),
              ], [`ΔB = ${B2} − ${B1} = ${B2 - B1} mT = ${fmt(dB)} T`, `ΔΦ = A ΔB = ${fmt(A)} × ${fmt(dB)}`, `ΔΦ = ${fmt(dPhi)} Wb`]),
              part("(b)", "Calcule la fem media inducida en la bobina mientras el campo varía.", [
                { code: "M1", text: "ε = NΔΦ / Δt, con Δt leído de la gráfica", miss: "ε = NΔΦ/Δt", test: (l, n) => near(n, dt, TOL) || /N\s*[·×*]?\s*Δ|ΔΦ\s*\/\s*Δt/i.test(l) },
                val("A1", `ε = ${fmt(emf)} V`, emf),
              ], [`Δt = ${f2(t2)} − ${f2(t1)} = ${f2(dt)} s`, "ε = N ΔΦ / Δt", `ε = ${N} × ${fmt(dPhi)} / ${f2(dt)} = ${fmt(emf)} V`]),
              part("(c)", "Calcule la corriente inducida en ese intervalo.", [val("A1", `I = ε / R = ${fmt(I)} A`, I)],
                [`I = ε / R = ${fmt(emf)} / ${R}`, `I = ${fmt(I)} A`]),
            ],
          };
        },
      },
      {
        id: "varilla", label: "Varilla que se mueve en un campo magnético", keywords: ["varilla", "fem de movimiento", "bvl", "rieles"],
        make: (r) => {
          const B = pick(r, [0.20, 0.40, 0.50, 0.80]), L = pick(r, [0.20, 0.30, 0.50]), v = pick(r, [2.0, 3.0, 4.0, 5.0]), R = pick(r, [2, 4, 5, 10]);
          const emf = B * v * L, I = emf / R, F = B * I * L;
          const xs = range(105, 330, 36), ys = [80, 105, 130];
          return {
            fig: {
              w: 380, h: 205, alt: `Varilla conductora de longitud L que se desliza con velocidad v sobre dos rieles horizontales conectados por una resistencia R, en un campo magnético entrante`,
              items: [
                { t: "line", x1: 60, y1: 55, x2: 350, y2: 55, w: 1.6 }, { t: "line", x1: 60, y1: 155, x2: 350, y2: 155, w: 1.6 },
                { t: "comp", kind: "resistor", x1: 60, y1: 55, x2: 60, y2: 155 }, T(60, 178, `R = ${R} Ω`),
                ...marks("in", xs.filter((x) => Math.abs(x - 200) > 12 && Math.abs(x - 170) > 14), [80, 130]), ...marks("in", [285, 321], [105]), T(250, 190, "B hacia dentro de la página (×)"),
                { t: "line", x1: 200, y1: 48, x2: 200, y2: 162, w: 4 }, arr(205, 105, 262, 105, 2), T(240, 97, "v"),
                dim(170, 55, 170, 155), T(162, 109, `L = ${f2(L)} m`, "end"),
              ],
            },
            stem: `Una varilla conductora de ${f2(L)} m de longitud se desliza con rapidez constante ${f2(v)} m s⁻¹ sobre dos rieles conductores horizontales unidos por una resistencia de ${R} Ω, como muestra la figura. Hay un campo magnético uniforme de ${f2(B)} T perpendicular al plano de los rieles. La varilla y los rieles tienen resistencia despreciable.`,
            parts: [
              part("(a)", "Calcule la fem inducida en la varilla.", [
                method("ε = BvL", /B\s*[·×*]?\s*v|B\s*[·×*]?\s*L\s*[·×*]?\s*v|BvL|BLv/i, emf, "ε = BvL"),
                val("A1", `ε = ${fmt(emf)} V`, emf),
              ], ["ε = B v L", `ε = ${f2(B)} × ${f2(v)} × ${f2(L)}`, `ε = ${fmt(emf)} V`]),
              part("(b)", "Determine la corriente en la resistencia.", [val("A1", `I = ε / R = ${fmt(I)} A`, I)],
                [`I = ε / R = ${fmt(emf)} / ${R}`, `I = ${fmt(I)} A`]),
              part("(c)", "Calcule la fuerza externa necesaria para que la varilla se mueva con rapidez constante.", [
                method("F = BIL (iguala la fuerza magnética sobre la varilla)", /B\s*[·×*]?\s*I\s*[·×*]?\s*L|BIL/i, F, "F = BIL"),
                val("A1", `F = ${fmt(F)} N`, F),
              ], ["Rapidez constante: la fuerza externa iguala a la fuerza magnética F = B I L", `F = ${f2(B)} × ${fmt(I)} × ${f2(L)}`, `F = ${fmt(F)} N`]),
              part("(d)", "Explique por qué es necesaria esa fuerza externa para mantener la rapidez constante.", [
                reason("La corriente inducida experimenta una fuerza magnética que se opone al movimiento (ley de Lenz)", "ley de Lenz: la fuerza magnética frena la varilla", "lenz", "opone", "frena", "contraria", "se opone", "resist"),
              ], ["La corriente inducida en la varilla sufre una fuerza magnética que se opone al movimiento (ley de Lenz); la fuerza externa la compensa"], 2),
            ],
          };
        },
      },
      {
        id: "lenz", label: "Ley de Lenz", keywords: ["lenz", "sentido de la corriente inducida", "corriente inducida", "se opone"],
        make: (r) => {
          const N = pick(r, [10, 20, 50]), rc = pick(r, [2, 3, 4, 5]), B1 = pick(r, [0.50, 0.60]), dB = pick(r, [0.20, 0.30, 0.40]), inc = pick(r, [true, false]);
          const dt = pick(r, [0.1, 0.2, 0.5]), R = pick(r, [2, 5, 10]);
          const B2 = inc ? B1 + dB : B1 - dB, A = Math.PI * (rc / 100) ** 2, emf = (N * A * dB) / dt, I = emf / R;
          const cx = 150, cy = 100;
          return {
            fig: {
              w: 300, h: 215, alt: `Bobina circular de radio ${rc} cm en un campo magnético uniforme que entra en la página y ${inc ? "aumenta" : "disminuye"}`,
              items: [
                ...range(40, 260, 36).flatMap((x) => range(30, 170, 35).filter((y) => Math.abs(Math.hypot(x - cx, y - cy) - 58) > 11 && !(x > cx - 6 && Math.abs(y - cy) < 14)).flatMap((y) => cross(x, y))),
                { t: "circle", cx, cy, r: 58, sw: 2.2 },
                T(cx, 200, inc ? "B hacia dentro de la página, aumentando" : "B hacia dentro de la página, disminuyendo"),
                dim(cx, cy, cx + 58, cy), T(cx + 29, cy - 5, `r = ${rc} cm`),
              ],
            },
            stem: `Una bobina circular de ${N} espiras y ${rc} cm de radio está en un campo magnético uniforme perpendicular a su plano y dirigido hacia dentro de la página. En ${f2(dt)} s la magnitud del campo ${inc ? "aumenta" : "disminuye"} uniformemente de ${f2(B1)} T a ${f2(B2)} T. La resistencia de la bobina es ${R} Ω.`,
            parts: [
              part("(a)", "Calcule la fem inducida en la bobina.", [
                method("ε = N A ΔB / Δt", /N\s*[·×*]?\s*A|Δ\s*B|ΔΦ|π\s*[·×*]?\s*r|πr/i, A, "ε = NAΔB/Δt"),
                val("A1", `ε = ${fmt(emf)} V`, emf),
              ], [`A = π r² = π × (${rc}×10⁻²)² = ${fmt(A)} m²`, `ε = N A ΔB / Δt = ${N} × ${fmt(A)} × ${f2(dB)} / ${f2(dt)}`, `ε = ${fmt(emf)} V`]),
              part("(b)", "Calcule la corriente inducida.", [val("A1", `I = ε / R = ${fmt(I)} A`, I)], [`I = ε / R = ${fmt(emf)} / ${R}`, `I = ${fmt(I)} A`]),
              part("(c)", "Indique el sentido de la corriente inducida en la bobina, visto desde el lector (horario o antihorario).", [
                inc
                  ? reason("Antihorario", "antihorario", "antihorario", "contrario a las agujas", "sentido contrario")
                  : { code: "R1", text: "Horario", miss: "horario", test: (l) => hasAny(l, "horario", "agujas del reloj") && !hasAny(l, "anti", "contrari") },
              ], [inc ? "El flujo hacia dentro aumenta: la corriente crea un campo hacia fuera dentro de la bobina → sentido antihorario" : "El flujo hacia dentro disminuye: la corriente crea un campo hacia dentro → sentido horario"], 2),
              part("(d)", "Explique su respuesta a (c) utilizando la ley de Lenz.", [
                reason("La corriente inducida crea un campo que se opone al cambio de flujo", "se opone al cambio de flujo", "opone", "oposicion", "contrari", "contrarrest", "se contrapone"),
              ], ["Ley de Lenz: la corriente inducida tiene el sentido que se opone al cambio de flujo que la produce"], 2),
            ],
          };
        },
      },
      {
        id: "generador", label: "Generador de corriente alterna", keywords: ["generador", "corriente alterna", "fem maxima", "alternador"],
        make: (r) => {
          const N = pick(r, [30, 60, 120]), B = pick(r, [0.10, 0.20, 0.30]), Ac = pick(r, [150, 250, 400]), Tms = pick(r, [10, 20, 40]);
          const A = Ac * 1e-4, f = 1000 / Tms, w = 2 * Math.PI * f, e0 = N * B * A * w, erms = e0 / Math.SQRT2;
          const pts: [number, number][] = [];
          for (let i = 0; i <= 48; i++) { const t = (i / 48) * 2 * Tms; pts.push([t, Math.sin((2 * Math.PI * t) / Tms)]); }
          return {
            fig: {
              w: 400, h: 200, alt: `Gráfica sinusoidal de la fem del generador frente al tiempo en ms, con dos ciclos completos`,
              items: [{
                t: "graph", x: 55, y: 30, w: 320, h: 130, xr: [0, 2.3 * Tms], yr: [-1.25, 1.25], xlabel: "t / ms", ylabel: "fem",
                xticks: range(0, 2 * Tms, Tms / 2), yticks: [0], grid: true, series: [{ pts, smooth: true }],
              }],
            },
            stem: `Una bobina de ${N} espiras, cada una de ${Ac} cm² de área, gira con frecuencia constante en un campo magnético uniforme de ${f2(B)} T y genera una fem alterna. La gráfica muestra la fem producida en función del tiempo.`,
            parts: [
              part("(a)", "Determine el periodo y la frecuencia de la fem a partir de la gráfica.", [
                valAny("A1", `T = ${Tms} ms`, [Tms, Tms / 1000]),
                val("A1", `f = 1 / T = ${fmt(f)} Hz`, f),
              ], [`T = ${Tms} ms = ${fmt(Tms / 1000, 2)} s`, `f = 1 / T = 1 / ${fmt(Tms / 1000, 2)}`, `f = ${fmt(f)} Hz`]),
              part("(b)", "Calcule el valor máximo de la fem.", [
                method("ε₀ = NBAω con ω = 2πf", /ω|omega|2\s*π|2\s*pi|N\s*[·×*]?\s*B/i, w, "ε₀ = NBAω"),
                val("A1", `ε₀ = ${fmt(e0)} V`, e0),
              ], [`ω = 2π f = ${fmt(w)} rad s⁻¹`, `ε₀ = N B A ω = ${N} × ${f2(B)} × ${fmt(A)} × ${fmt(w)}`, `ε₀ = ${fmt(e0)} V`]),
              part("(c)", "Determine el valor eficaz (rms) de la fem.", [val("A1", `ε_rms = ε₀ / √2 = ${fmt(erms)} V`, erms)],
                [`ε_rms = ε₀ / √2 = ${fmt(e0)} / √2`, `ε_rms = ${fmt(erms)} V`]),
            ],
          };
        },
      },
      {
        id: "transformador", label: "Transformador ideal", keywords: ["transformador", "bobina primaria", "espiras", "tension"],
        make: (r) => {
          const [Np, Ns] = pick(r, [[1000, 50], [1000, 100], [600, 60], [1200, 60], [500, 2500], [400, 2000]] as [number, number][]);
          const Vp = pick(r, [120, 230]), RL = pick(r, [4, 6, 8, 10]);
          const Vs = (Vp * Ns) / Np, Is = Vs / RL, Ip = (Vs * Is) / Vp;
          return {
            fig: {
              w: 380, h: 190, alt: `Transformador: núcleo de hierro con bobina primaria de ${Np} espiras conectada a ${Vp} V y bobina secundaria de ${Ns} espiras`,
              items: [
                { t: "rect", x: 100, y: 40, w: 180, h: 110 }, { t: "rect", x: 135, y: 70, w: 110, h: 50 },
                { t: "spring", x1: 118, y1: 48, x2: 118, y2: 142, coils: 8, width: 12 }, { t: "spring", x1: 262, y1: 48, x2: 262, y2: 142, coils: 8, width: 12 },
                T(118, 28, `Vp = ${Vp} V`), T(262, 28, "Vs = ?"),
                T(118, 168, `Np = ${Np}`), T(262, 168, `Ns = ${Ns}`),
                T(190, 99, "núcleo"),
              ],
            },
            stem: `Un transformador ideal tiene ${Np} espiras en la bobina primaria y ${Ns} en la secundaria. La bobina primaria se conecta a una fuente alterna de ${Vp} V (valor eficaz) y la secundaria alimenta una resistencia de ${RL} Ω.`,
            parts: [
              part("(a)", "Calcule la tensión en la bobina secundaria.", [
                method("Vs / Vp = Ns / Np", /N\s*s|N\s*p|Ns|Np|Vs\s*\/\s*Vp|Ns\s*\/\s*Np/i, Ns / Np, "Vs/Vp = Ns/Np"),
                val("A1", `Vs = ${fmt(Vs)} V`, Vs),
              ], ["Vs / Vp = Ns / Np", `Vs = ${Vp} × ${Ns} / ${Np}`, `Vs = ${fmt(Vs)} V`]),
              part("(b)", "Determine la corriente en la resistencia.", [val("A1", `Is = Vs / R = ${fmt(Is)} A`, Is)],
                [`Is = Vs / R = ${fmt(Vs)} / ${RL}`, `Is = ${fmt(Is)} A`]),
              part("(c)", "Determine la corriente en la bobina primaria.", [
                method("Transformador ideal: VpIp = VsIs", /Vp\s*[·×*]?\s*Ip|Vs\s*[·×*]?\s*Is|potencia/i, Vs * Is, "VpIp = VsIs"),
                val("A1", `Ip = ${fmt(Ip)} A`, Ip),
              ], [`Potencia de entrada = potencia de salida: Vp Ip = Vs Is = ${fmt(Vs * Is)} W`, `Ip = ${fmt(Vs * Is)} / ${Vp}`, `Ip = ${fmt(Ip)} A`]),
              part("(d)", "Explique por qué un transformador no funciona con una corriente continua constante.", [
                reason("Hace falta un flujo variable para inducir fem en la secundaria", "el flujo debe cambiar para inducir fem", "variable", "cambia", "varia", "variacion", "no cambia"),
              ], ["Con corriente continua el flujo en el núcleo es constante; sin variación de flujo no se induce fem en la secundaria (ley de Faraday)"], 2),
            ],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
  "D.1": {
    title: "D.1 Campos gravitatorios",
    items: [
      { tex: "F = G\\,\\dfrac{m_1 m_2}{r^2}", n: "ley de gravitación de Newton", for: ["gravitación", "ley de newton"] },
      { tex: "g = \\dfrac{F}{m} = \\dfrac{GM}{r^2}", n: "intensidad del campo gravitatorio", for: ["gravitación", "órbita", "orbital", "campo gravitatorio", "intensidad", "alturas"] },
      { tex: "v_{\\text{orb}} = \\sqrt{\\dfrac{GM}{r}}", n: "rapidez orbital (r desde el centro)", for: ["órbita", "orbital"] },
      { tex: "v_{\\text{esc}} = \\sqrt{\\dfrac{2GM}{r}}", n: "rapidez de escape", for: ["escape"] },
      { tex: "\\dfrac{T^2}{r^3} = \\dfrac{4\\pi^2}{GM}", n: "tercera ley de Kepler", for: ["kepler"] },
      { tex: "V_g = -\\dfrac{GM}{r}", n: "potencial gravitatorio", for: ["potencial"] },
      { tex: "E_p = mV_g = -\\dfrac{GMm}{r}", n: "energía potencial gravitatoria", for: ["escape", "potencial", "energía"] },
      { tex: "E_k = \\dfrac{GMm}{2r}\\qquad E = E_k + E_p = -\\dfrac{GMm}{2r}", n: "energías de una órbita circular", for: ["energía total", "satélite en órbita"] },
      { tex: "g = -\\dfrac{\\Delta V_g}{\\Delta r}", n: "campo y potencial" },
    ],
    consts: [
      { tex: "G = 6{,}67 \\times 10^{-11}\\ \\text{N m}^2\\,\\text{kg}^{-2}" },
      { tex: "r = R + h", note: "desde el centro del planeta" },
    ],
  },
  "D.2": {
    title: "D.2 Campos eléctricos y magnéticos",
    items: [
      { tex: "F = k\\,\\dfrac{q_1 q_2}{r^2}\\qquad k = \\dfrac{1}{4\\pi\\varepsilon_0}", n: "ley de Coulomb", for: ["coulomb"] },
      { tex: "E = \\dfrac{F}{q} = k\\,\\dfrac{Q}{r^2}", n: "campo eléctrico de una carga puntual", for: ["campo eléctrico", "cargas puntuales"] },
      { tex: "E = \\dfrac{V}{d}", n: "campo uniforme entre placas paralelas", for: ["placas"] },
      { tex: "V = k\\,\\dfrac{Q}{r}", n: "potencial de una carga puntual", for: ["potencial eléctrico"] },
      { tex: "W = q\\,\\Delta V \\qquad E_p = qV = k\\,\\dfrac{q_1q_2}{r}", n: "trabajo y energía potencial eléctrica", for: ["potencial eléctrico"] },
      { tex: "B = \\dfrac{\\mu_0 I}{2\\pi r}", n: "campo magnético de un alambre largo y recto", for: ["alambre recto"] },
      { tex: "\\dfrac{F}{L} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi d}", n: "fuerza por unidad de longitud entre alambres paralelos", for: ["alambres paralelos"] },
    ],
    consts: [
      { tex: "k = 8{,}99 \\times 10^{9}\\ \\text{N m}^2\\,\\text{C}^{-2}" },
      { tex: "\\varepsilon_0 = 8{,}85 \\times 10^{-12}\\ \\text{C}^2\\,\\text{N}^{-1}\\,\\text{m}^{-2}" },
      { tex: "\\mu_0 = 4\\pi \\times 10^{-7}\\ \\text{T m A}^{-1}" },
      { tex: "e = 1{,}60 \\times 10^{-19}\\ \\text{C}" },
    ],
  },
  "D.3": {
    title: "D.3 Movimiento en campos electromagnéticos",
    items: [
      { tex: "\\Delta E_k = qV \\qquad \\tfrac{1}{2}mv^2 = qV", n: "carga acelerada por una diferencia de potencial", for: ["acelerada"] },
      { tex: "F = qvB\\sin\\theta", n: "fuerza magnética sobre una carga en movimiento", for: ["fuerza magnética"] },
      { tex: "\\dfrac{mv^2}{r} = qvB \;\\Rightarrow\; r = \\dfrac{mv}{qB}", n: "radio de la trayectoria circular", for: ["fuerza magnética"] },
      { tex: "F = BIL\\sin\\theta", n: "fuerza sobre un conductor con corriente", for: ["conductor"] },
      { tex: "qE = qvB \;\\Rightarrow\; v = \\dfrac{E}{B}", n: "selector de velocidades", for: ["selector"] },
      { tex: "a = \\dfrac{qE}{m} = \\dfrac{qV}{md}", n: "aceleración en un campo eléctrico uniforme", for: ["desviación", "electrón"] },
      { tex: "y = \\tfrac{1}{2}at^2 \\qquad t = \\dfrac{L}{v_0}", n: "trayectoria parabólica entre placas", for: ["desviación", "electrón"] },
    ],
    consts: [
      { tex: "e = 1{,}60 \\times 10^{-19}\\ \\text{C}" },
      { tex: "m_e = 9{,}11 \\times 10^{-31}\\ \\text{kg}" },
      { tex: "m_p = 1{,}67 \\times 10^{-27}\\ \\text{kg}" },
    ],
  },
  "D.4": {
    title: "D.4 Inducción",
    items: [
      { tex: "\\Phi = BA\\cos\\theta", n: "flujo magnético", for: ["flujo"] },
      { tex: "\\varepsilon = -N\\,\\dfrac{\\Delta\\Phi}{\\Delta t}", n: "ley de Faraday (el signo es la ley de Lenz)", for: ["faraday", "lenz"] },
      { tex: "\\varepsilon = BvL", n: "fem de una varilla que se mueve en un campo", for: ["varilla"] },
      { tex: "\\varepsilon = BAN\\omega\\sin(\\omega t) \\qquad \\omega = 2\\pi f", n: "generador de corriente alterna", for: ["generador"] },
      { tex: "\\varepsilon_{\\text{rms}} = \\dfrac{\\varepsilon_0}{\\sqrt{2}}", n: "valor eficaz", for: ["generador"] },
      { tex: "\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p} \\qquad V_pI_p = V_sI_s", n: "transformador ideal", for: ["transformador"] },
    ],
    consts: [{ tex: "\\Phi \\text{ en weber: } 1\\ \\text{Wb} = 1\\ \\text{T m}^2" }],
  },
};
