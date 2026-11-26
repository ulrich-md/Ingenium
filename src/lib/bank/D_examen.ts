/**
 * Unit D · more questions (intermedio y examen). See kit.ts. Concepts are added to the
 * subtopics of bank/D.ts by topic id (e.g. "D1"). Ids start with x_.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { E_CHARGE, f2, fmt, G, g, hasAny, K_COUL, method, MU0, near, normalize, part, pick, PLANETS, reason, TOL, U_AMU, val, valAny, type Concept, type Fig, type FigItem, type Rule } from "./kit.ts";

const MT = 5.97e24, RT = 6.37e6;
const MP = 1.67e-27;
const rad = (deg: number) => (deg * Math.PI) / 180;
const T = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle"): FigItem => ({ t: "text", x, y, s, anchor });
const arr = (x1: number, y1: number, x2: number, y2: number, w = 1.6): FigItem => ({ t: "line", x1, y1, x2, y2, w, arrow: "end" });
const cross = (cx: number, cy: number, s = 3.5): FigItem[] => [
  { t: "line", x1: cx - s, y1: cy - s, x2: cx + s, y2: cy + s, w: 0.9 },
  { t: "line", x1: cx - s, y1: cy + s, x2: cx + s, y2: cy - s, w: 0.9 },
];
const range = (a: number, b: number, step: number) => { const o: number[] = []; for (let x = a; x <= b + 1e-9; x += step) o.push(Number(x.toFixed(6))); return o; };
const curve = (f: (x: number) => number, a: number, b: number, n = 24): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const x = a + ((b - a) * i) / n; return [x, f(x)] as [number, number]; });
/** |n| close to |t| (the sign is not marked) */
const na = (n: number[], t: number, tol = TOL) => n.some((x) => Math.abs(Math.abs(x) - Math.abs(t)) <= Math.abs(t) * tol);
/** a rule that passes when the line matches a regular expression */
const rx = (code: Rule["code"], text: string, re: RegExp, miss: string = code): Rule => ({ code, text, miss, test: (l) => re.test(l) || re.test(normalize(l)) });
/** A1 for a factor (k), accepting "1/9", "/9" or "9 veces menor" when k < 1 */
const factor = (text: string, k: number, miss = "A1"): Rule => {
  const inv = k < 1 ? Math.round(1 / k) : 0;
  const re = inv ? new RegExp(`(/|÷)\\s*${inv}(?![\\d.,])|${inv}\\s*veces\\s*menor`, "i") : null;
  return { code: "A1", text, miss, test: (l, n) => near(n, k, 0.03) || (re !== null && re.test(normalize(l))) };
};

export const extra: Record<string, Concept[]> = {
  /* ================= D.1 Campos gravitatorios ================= */
  D1: [
    {
      id: "x_vgrafica", level: 2, label: "Potencial gravitatorio: lectura de una gráfica V–r", keywords: ["potencial gravitatorio", "grafica v r", "g = -v/r"],
      make: (r) => {
        const R = pick(r, [2, 4]), V0 = pick(r, [1, 2, 3]), m = pick(r, [200, 400, 800]);
        const Rm = R * 1e6, V = V0 * 1e7, gs = V / Rm, dE = (m * V) / 2;
        const fig: Fig = {
          w: 380, h: 258, alt: `Gráfica del potencial gravitatorio V (en 10⁷ J kg⁻¹) frente a la distancia r (en 10⁶ m): una curva que sube hacia cero desde ${-V0} en r = ${R}`,
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 12], yr: [-3.5, 0], xlabel: "r / 10⁶ m", ylabel: "V / 10⁷ J kg⁻¹",
            xticks: range(0, 12, 2), yticks: range(-3, 0, 0.5), grid: true,
            series: [{ pts: curve((x) => (-V0 * R) / x, R, 12), smooth: true }, { pts: [[R, 0], [R, -V0]], dash: true }],
          }],
        };
        return {
          stem: `La gráfica muestra el potencial gravitatorio V en función de la distancia r al centro de un planeta, para r ≥ R. La línea discontinua marca la superficie del planeta, de radio R = ${f2(Rm)} m. Ignore la rotación del planeta y su atmósfera.`,
          fig,
          parts: [
            part("(a)", "Utilice la gráfica para determinar el potencial gravitatorio en la superficie del planeta.", [
              valAny("A1", `V = ${fmt(-V)} J kg⁻¹`, [-V, -V0], "V en la superficie (con signo)"),
            ], [`En r = R: V = ${fmt(-V)} J kg⁻¹`], 2),
            part("(b)", "Determine la intensidad del campo gravitatorio en la superficie.", [
              method("g = −V / r (o el gradiente −dV/dr)", /V\s*\/\s*r|dV\s*\/\s*dr|gradiente|pendiente|GM\s*\/\s*R/i, gs, "g = −V/r"),
              val("A1", `g = ${fmt(gs)} m s⁻²`, gs),
            ], ["Para V = −GM/r: g = GM/r² = −V/r", `g = ${fmt(V)} / ${f2(Rm)}`, `g = ${fmt(gs)} m s⁻²`]),
            part("(c)", `Una sonda de masa ${m} kg se lleva desde la superficie hasta una distancia r = 2R del centro. Utilice la gráfica para calcular la energía mínima que hay que suministrarle.`, [
              { code: "M1", text: "ΔEp = mΔV, con V en r = 2R leído de la gráfica", miss: "ΔEp = mΔV", test: (l, n) => na(n, V / 2) || /ΔV|mΔ|m\s*\(\s*V/i.test(l) },
              val("A1", `ΔEp = ${fmt(dE)} J`, dE),
            ], [`En r = 2R = ${f2(2 * Rm)} m la gráfica da V = ${fmt(-V / 2)} J kg⁻¹`, `ΔEp = mΔV = ${m} × (${fmt(-V / 2)} − (${fmt(-V)}))`, `ΔEp = ${fmt(dE)} J`]),
          ],
        };
      },
    },
    {
      id: "x_kepler", level: 3, label: "Razón de radios orbitales y masa de la estrella (Kepler)", keywords: ["kepler", "razon de radios", "periodo orbital", "4π²/gm"],
      make: (r) => {
        const M = pick(r, [1.5e30, 2.0e30, 3.0e30]), rA = pick(r, [0.8e11, 1.1e11, 1.5e11]);
        const TAd = Math.round((2 * Math.PI * Math.sqrt(rA ** 3 / (G * M))) / 86400);
        const TBd = Math.round(TAd * pick(r, [1.8, 2.5, 3.2]));
        const k = TBd / TAd, q = Math.pow(k, 2 / 3);
        const TAs = TAd * 86400, Mc = (4 * Math.PI ** 2 * rA ** 3) / (G * TAs ** 2);
        const cx = 110, cy = 115, pA = 45, pB = 45 * q;
        const fig: Fig = {
          w: 360, h: 235, alt: "Estrella en el centro y las órbitas circulares de los planetas A (interior) y B (exterior)",
          items: [
            { t: "circle", cx, cy, r: 7, fill: "dark" },
            { t: "circle", cx, cy, r: pA, dash: true }, { t: "circle", cx, cy, r: pB, dash: true },
            { t: "circle", cx: cx + pA * Math.cos(rad(40)), cy: cy - pA * Math.sin(rad(40)), r: 4, fill: "dark" },
            { t: "circle", cx: cx - pB * Math.cos(rad(25)), cy: cy - pB * Math.sin(rad(25)), r: 4, fill: "dark" },
            T(cx + pA * Math.cos(rad(40)) + 12, cy - pA * Math.sin(rad(40)) - 6, "A"), T(cx - pB * Math.cos(rad(25)) - 10, cy - pB * Math.sin(rad(25)) - 6, "B"),
            { t: "line", x1: cx, y1: cy, x2: cx + pA * Math.cos(rad(-60)), y2: cy - pA * Math.sin(rad(-60)), w: 1, arrow: "end" }, T(cx + 20, cy + 40, "rₐ", "start"),
            T(250, 60, `Tₐ = ${TAd} días`, "start"), T(250, 82, `T_B = ${TBd} días`, "start"),
          ],
        };
        return {
          stem: `Un planeta A describe una órbita circular de radio rₐ = ${f2(rA)} m alrededor de una estrella de masa M, con un periodo Tₐ = ${TAd} días. Un segundo planeta B describe una órbita circular alrededor de la misma estrella con un periodo T_B = ${TBd} días.`,
          data: "G = 6,67 × 10⁻¹¹ N m² kg⁻² · 1 día = 86 400 s",
          fig,
          parts: [
            part("(a)", "Calcule la razón r_B / rₐ entre los radios de las órbitas.", [
              method("T² ∝ r³, es decir (r_B/rₐ)³ = (T_B/Tₐ)²", /T\^?2|T²|r\^?3|r³|2\s*\/\s*3|\^\s*\(?\s*2\s*\/\s*3/i, k * k, "T² ∝ r³"),
              val("A1", `r_B / rₐ = ${fmt(q)}`, q),
            ], ["T² ∝ r³  →  (r_B / rₐ)³ = (T_B / Tₐ)²", `r_B / rₐ = (${TBd} / ${TAd})^(2/3)`, `r_B / rₐ = ${fmt(q)}`]),
            part("(b)", "Muestre que el periodo orbital T de un planeta cumple T² = (4π² / GM) r³.", [
              rx("M1", "Fuerza gravitatoria = fuerza centrípeta: GMm/r² = mv²/r", /GMm|G\s*M\s*m|G\s*M\s*\/\s*r|mv\^?2|v\^2|v²|mω|ω\^?2\s*r|centripeta/i, "GMm/r² = mv²/r"),
              rx("M1", "Sustituye v = 2πr/T y despeja T²", /2\s*π\s*r\s*\/\s*T|2\s*pi\s*r|4\s*π\^?2|4\s*pi/i, "v = 2πr/T"),
            ], ["GMm / r² = m v² / r,  con  v = 2πr / T", "GM / r = 4π² r² / T²  →  T² = (4π² / GM) r³"]),
            part("(c)", "Determine la masa M de la estrella.", [
              method("M = 4π² r³ / (G T²) con T en segundos", /4\s*π|4π|r\^?3|r³|T\^?2|T²/i, TAs, "M = 4π²r³/GT²"),
              val("A1", `M = ${fmt(Mc)} kg`, Mc),
            ], [`Tₐ = ${TAd} días = ${fmt(TAs)} s`, "M = 4π² r³ / (G T²)", `M = 4π² × (${f2(rA)})³ / (6,67×10⁻¹¹ × (${fmt(TAs)})²)`, `M = ${fmt(Mc)} kg`]),
          ],
        };
      },
    },
    {
      id: "x_escapegraf", level: 3, label: "Proyectil que no escapa: energía total negativa", keywords: ["rapidez de escape", "energia total negativa", "muestre que v = √(2gr)", "ligado"],
      make: (r) => {
        const B = pick(r, [{ n: "la Luna", g: 1.62, R: 1.74e6 }, { n: "Marte", g: 3.71, R: 3.39e6 }, { n: "Mercurio", g: 3.7, R: 2.44e6 }]);
        const n = pick(r, [2, 4]);
        const vesc = Math.sqrt(2 * B.g * B.R);
        const v = Number(Math.sqrt(2 * B.g * B.R * (1 - 1 / n)).toPrecision(3));
        const rho = 1 / (1 - (v * v) / (2 * B.g * B.R)), h = (rho - 1) * B.R;
        const fig: Fig = {
          w: 380, h: 235, alt: "Gráfica de la energía por unidad de masa frente a r/R: la curva de la energía potencial y una recta horizontal discontinua que es la energía total del proyectil",
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 170, xr: [0, 5], yr: [-1.25, 0], xlabel: "r / R", ylabel: "energía / (m g R)",
            xticks: range(0, 5, 1), yticks: range(-1, 0, 0.25), grid: true,
            series: [{ pts: curve((x) => -1 / x, 1, 5), smooth: true }, { pts: [[1, -1 / n], [5, -1 / n]], dash: true }],
          }],
        };
        return {
          stem: `Se lanza verticalmente un proyectil desde la superficie de ${B.n} con una rapidez v = ${fmt(v)} m s⁻¹. En ${B.n}, la intensidad del campo en la superficie es g = ${fmt(B.g)} m s⁻² y el radio es R = ${fmt(B.R)} m. Ignore la atmósfera y la rotación. La gráfica muestra, por unidad de masa y en unidades de gR, la energía potencial (curva continua) y la energía total del proyectil (recta discontinua), en función de la distancia r al centro.`,
          fig,
          parts: [
            part("(a)", `Muestre que la rapidez de escape desde la superficie es de aproximadamente ${fmt(vesc)} m s⁻¹.`, [
              rx("M1", "½mv² = GMm/R, con GM = gR²", /½\s*m\s*v|1\/2\s*m\s*v|GMm|GM\s*=\s*gR|g\s*R\^?2|gR²|2\s*g\s*R|v\^?2\s*=\s*2/i, "½mv² = GMm/R"),
              val("A1", `v_esc = √(2gR) = ${fmt(vesc)} m s⁻¹`, vesc),
            ], ["½mv² = GMm / R  con  GM = gR²  →  v = √(2gR)", `v = √(2 × ${fmt(B.g)} × ${fmt(B.R)})`, `v = ${fmt(vesc)} m s⁻¹`]),
            part("(b)", "Explique, en términos de la energía, por qué el proyectil no escapa del campo.", [
              reason("La energía total (Ek + Ep) es negativa: Ek < |Ep|", "energía total negativa", "negativa", "e < 0", "e<0", "menor que cero", "ek < |ep|", "ek<|ep|"),
              reason("Está ligado: se detiene a una distancia finita y regresa", "queda ligado / regresa", "regresa", "vuelve", "se detiene", "ligado", "ligada", "no alcanza el infinito", "finita", "cae de nuevo"),
            ], ["La energía total, Ek + Ep, es negativa porque v es menor que la rapidez de escape (Ek < |Ep|)", "El proyectil está ligado: se detiene a una distancia finita y regresa a la superficie"]),
            part("(c)", "Estime, a partir de la gráfica, la distancia máxima a la que llega el proyectil, en unidades de R.", [
              { code: "A1", text: `r_max ≈ ${n} R (donde la energía total corta a la curva de Ep)`, miss: "r_max/R de la gráfica", test: (_, nn) => near(nn, rho, 0.06) },
            ], [`La recta de energía total corta la curva de Ep en r ≈ ${n} R`], 2),
            part("(d)", "Calcule la altura máxima del proyectil sobre la superficie.", [
              method("Conservación de la energía: ½mv² − GMm/R = −GMm/r_max", /½\s*m\s*v|1\/2\s*mv|GMm|gR\^?2|conserv|r\s*max/i, rho * B.R, "conservación de la energía"),
              val("A1", `h = r_max − R = ${fmt(h)} m`, h),
            ], ["½v² − gR = −gR² / r_max", `r_max = R / (1 − v² / 2gR) = ${fmt(rho * B.R)} m`, `h = r_max − R = ${fmt(h)} m`]),
          ],
        };
      },
    },
    {
      id: "x_frenado", level: 3, label: "Satélite frenado por la atmósfera: energías y órbita", keywords: ["satelite frenado", "resistencia del aire", "energia total decrece", "descenso de orbita"],
      make: (r) => {
        const m = pick(r, [300, 500, 800]), h1 = pick(r, [800, 1000, 1200]), dh = pick(r, [300, 400]);
        const r1 = RT + h1 * 1e3, r2 = RT + (h1 - dh) * 1e3, GM = G * MT;
        const v1 = Math.sqrt(GM / r1), loss = ((GM * m) / 2) * (1 / r2 - 1 / r1), E1 = (-GM * m) / (2 * r1), E2 = (-GM * m) / (2 * r2);
        const cx = 110, cy = 120, pr = 85;
        const sp: number[] = [];
        for (let i = 0; i <= 60; i++) { const t = i / 60, a = -4 * Math.PI * t, rr = pr - 17 * t; sp.push(cx + rr * Math.cos(a), cy - rr * Math.sin(a)); }
        const fig: Fig = {
          w: 340, h: 240, alt: "La Tierra, la órbita circular inicial del satélite y una espiral que se acerca a la Tierra",
          items: [
            { t: "circle", cx, cy, r: 40, fill: "light" }, T(cx, cy + 4, "Tierra"),
            { t: "circle", cx, cy, r: pr, dash: true },
            { t: "poly", pts: sp, w: 1.4, arrow: "end" },
            { t: "circle", cx: cx + pr, cy, r: 4, fill: "dark" },
            T(cx + pr + 10, cy - 8, "satélite", "start"), T(cx + pr + 10, cy + 8, "(aire muy tenue)", "start"),
          ],
        };
        return {
          stem: `Un satélite de ${m} kg describe una órbita circular a ${h1} km sobre la superficie de la Tierra, en la parte alta de la atmósfera, donde el aire es muy tenue. La resistencia del aire hace que la órbita descienda lentamente, describiendo una espiral. Se puede suponer que en cada instante la órbita es circular.`,
          data: `Masa de la Tierra = ${fmt(MT)} kg · Radio de la Tierra = ${fmt(RT)} m · G = 6,67 × 10⁻¹¹ N m² kg⁻²`,
          fig,
          parts: [
            part("(a)", "Calcule la rapidez orbital inicial del satélite.", [
              method("v = √(GM / r), con r = R + h", /GM|√|sqrt|v\^?2\s*=|mv\^?2/i, v1, "v = √(GM/r)"),
              val("A1", `v = ${fmt(v1)} m s⁻¹`, v1),
            ], [`r = R + h = ${fmt(r1)} m`, "GMm / r² = m v² / r  →  v = √(GM / r)", `v = ${fmt(v1)} m s⁻¹`]),
            part("(b)", "Resuma cómo cambian la energía total, la energía potencial y la energía cinética del satélite mientras desciende.", [
              reason("La energía total disminuye (la resistencia del aire realiza trabajo negativo)", "energía total disminuye", "energia total disminuye", "energia total decrece", "energia total se reduce", "trabajo negativo", "disipa", "pierde energia", "energia total menor"),
              reason("La energía potencial gravitatoria disminuye (el radio de la órbita disminuye)", "Ep disminuye", "energia potencial disminuye", "ep disminuye", "radio disminuye", "radio decrece", "radio se reduce", "orbita mas baja", "menor radio", "se acerca"),
              reason("La energía cinética aumenta (la rapidez aumenta porque v² = GM/r)", "Ek aumenta", "energia cinetica aumenta", "cinetica aumenta", "ek aumenta", "rapidez aumenta", "velocidad aumenta", "aumenta la rapidez", "aumenta la velocidad"),
            ], ["La resistencia del aire realiza trabajo negativo: la energía total disminuye (se disipa)", "El radio disminuye y la energía potencial disminuye (más negativa), en el doble que la energía total", "Como v² = GM / r, la rapidez aumenta: la energía cinética aumenta"]),
            part("(c)", `Determine la energía total que el satélite ha transferido al aire hasta llegar a una órbita a ${h1 - dh} km sobre la superficie.`, [
              { code: "M1", text: "E = −GMm / 2r en cada órbita (o ΔE = ½ΔEp)", miss: "E = −GMm/2r", test: (l, n) => na(n, E1) || na(n, E2) || /2\s*r|½|1\/2/i.test(l) },
              val("A1", `ΔE = ${fmt(loss)} J`, loss),
            ], [`E₁ = −GMm / 2r₁ = ${fmt(E1)} J`, `E₂ = −GMm / 2r₂ = ${fmt(E2)} J`, `Energía transferida = E₁ − E₂ = ${fmt(loss)} J`]),
          ],
        };
      },
    },
  ],

  /* ================= D.2 Campos eléctricos y magnéticos ================= */
  D2: [
    {
      id: "x_campoperfil", level: 2, label: "Campo de una carga puntual: lectura de una gráfica E–r", keywords: ["campo electrico", "grafica e r", "carga puntual", "e = kq/r²"],
      make: (r) => {
        const r1 = pick(r, [2, 3]), E1 = pick(r, [80, 160]), q = pick(r, [2.0, 5.0]);
        const Q = (E1 * 1e3 * (r1 / 100) ** 2) / K_COUL, E2 = (E1 * 1e3) / 4, F = q * 1e-9 * E2;
        const fig: Fig = {
          w: 380, h: 258, alt: `Gráfica de la intensidad de campo eléctrico E (kV m⁻¹) frente a la distancia r (cm) de una carga puntual, desde r = ${r1} cm`,
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 5 * r1], yr: [0, 180], xlabel: "r / cm", ylabel: "E / kV m⁻¹",
            xticks: range(0, 5 * r1, r1), yticks: range(0, 180, 20), grid: true,
            series: [{ pts: curve((x) => (E1 * r1 * r1) / (x * x), r1, 5 * r1), smooth: true }],
          }],
        };
        return {
          stem: `Una pequeña esfera con carga positiva Q se comporta como una carga puntual. La gráfica muestra la intensidad del campo eléctrico E que crea en función de la distancia r a su centro, para r ≥ ${r1} cm.`,
          data: "k = 8,99 × 10⁹ N m² C⁻²",
          fig,
          parts: [
            part("(a)", `Utilice la gráfica para determinar E a una distancia r = ${r1} cm de la esfera.`, [
              valAny("A1", `E = ${E1} kV m⁻¹`, [E1, E1 * 1e3], "lectura de E"),
            ], [`De la gráfica: E = ${E1} kV m⁻¹ = ${fmt(E1 * 1e3)} V m⁻¹`], 2),
            part("(b)", "Calcule la carga Q de la esfera.", [
              method("E = kQ / r²", /kQ|k\s*Q|E\s*r\^?2|Er²|Q\s*=/i, Q, "E = kQ/r²"),
              valAny("A1", `Q = ${fmt(Q)} C`, [Q, Q * 1e9], "Q"),
            ], ["E = kQ / r²  →  Q = E r² / k", `Q = ${fmt(E1 * 1e3)} × (${fmt(r1 / 100)})² / 8,99×10⁹`, `Q = ${fmt(Q)} C`]),
            part("(c)", `Se coloca una carga de prueba de +${fmt(q, 2)} nC a una distancia ${2 * r1} cm de la esfera. Utilice la gráfica para calcular la fuerza eléctrica sobre ella.`, [
              { code: "M1", text: "F = qE, con E leído de la gráfica en r = 2r₁", miss: "F = qE", test: (l, n) => near(n, E1 / 4) || near(n, E2) || /qE|q\s*E/i.test(l) },
              val("A1", `F = ${fmt(F)} N`, F),
            ], [`De la gráfica, en r = ${2 * r1} cm: E = ${fmt(E1 / 4, 2)} kV m⁻¹`, `F = qE = ${fmt(q, 2)}×10⁻⁹ × ${fmt(E2)}`, `F = ${fmt(F)} N`]),
          ],
        };
      },
    },
    {
      id: "x_razonescarga", level: 3, label: "Esferas cargadas: campo y potencial con proporciones", keywords: ["esfera cargada", "e = kq/r²", "potencial en la superficie", "proporcion"],
      make: (r) => {
        const RA = pick(r, [0.040, 0.050, 0.060]), EA = pick(r, [1.0e5, 1.5e5, 2.0e5]), a = pick(r, [2, 3]), n = pick(r, [2, 3]);
        const QA = (EA * RA * RA) / K_COUL, VA = EA * RA, VB = n * a * VA;
        const aw = a === 2 ? "la mitad" : "la tercera parte", nw = n === 2 ? "el doble" : "el triple";
        const pa = 62, pb = pa / a;
        const fig: Fig = {
          w: 360, h: 150, alt: `Dos esferas conductoras: A, grande, con carga +Q y B, de radio ${aw} del de A, con carga ${nw} de la de A`,
          items: [
            { t: "circle", cx: 85, cy: 75, r: pa, fill: "light" }, T(85, 70, "A"), T(85, 86, "+Q"),
            { t: "line", x1: 85, y1: 75, x2: 85 + pa, y2: 75, w: 1 }, T(85 + pa / 2, 66, "R", "middle"),
            { t: "circle", cx: 255, cy: 75, r: pb, fill: "light" }, T(255, 72, "B"), T(255 + pb + 8, 80, `+${n}Q`, "start"),
            { t: "line", x1: 255, y1: 75, x2: 255 + pb, y2: 75, w: 1 }, T(255 + pb / 2, 66, "R/" + a, "middle"),
          ],
        };
        return {
          stem: `Una esfera conductora A, de radio R = ${fmt(RA * 100, 2)} cm y carga +Q, crea en su superficie un campo eléctrico de intensidad E_A = ${fmt(EA)} V m⁻¹. Una segunda esfera conductora B tiene un radio igual a ${aw} del radio de A y una carga igual a ${nw} de la de A. Las esferas están muy alejadas una de otra.`,
          data: "k = 8,99 × 10⁹ N m² C⁻²",
          fig,
          parts: [
            part("(a)", `Muestre que la carga de la esfera A es aproximadamente ${fmt(QA * 1e9)} nC.`, [
              rx("M1", "E = kQ / R²", /kQ|k\s*Q|E\s*R\^?2|ER²|Q\s*=\s*E/i, "E = kQ/R²"),
              valAny("A1", `Q = ${fmt(QA)} C`, [QA, QA * 1e9], "Q"),
            ], ["E = kQ / R²  →  Q = E R² / k", `Q = ${fmt(EA)} × (${fmt(RA)})² / 8,99×10⁹ = ${fmt(QA)} C`]),
            part("(b)", "Indique cuántas veces mayor es la intensidad del campo en la superficie de B que en la de A: E_B / E_A.", [
              factor(`E_B / E_A = ${n * a * a}`, n * a * a),
            ], [`E ∝ Q / R²: E_B / E_A = ${n} × ${a}² = ${n * a * a}`], 2),
            part("(c)", "Indique el valor de V_B / V_A, la razón entre los potenciales en las superficies de B y A.", [
              factor(`V_B / V_A = ${n * a}`, n * a),
            ], [`V ∝ Q / R: V_B / V_A = ${n} × ${a} = ${n * a}`], 2),
            part("(d)", "Calcule el potencial eléctrico en la superficie de B.", [
              method("V_A = kQ/R = E_A R, y V_B = (V_B/V_A) V_A", /kQ|k\s*Q|E\s*R|V_?A/i, VA, "V = kQ/R"),
              val("A1", `V_B = ${fmt(VB)} V`, VB),
            ], [`V_A = E_A R = ${fmt(EA)} × ${fmt(RA)} = ${fmt(VA)} V`, `V_B = ${n * a} × V_A = ${fmt(VB)} V`]),
          ],
        };
      },
    },
    {
      id: "x_dosalambres", level: 3, label: "Campo magnético neto de dos alambres con corrientes opuestas", keywords: ["campo magnetico", "dos alambres", "corrientes opuestas", "campo nulo", "μ₀i/2πr"],
      make: (r) => {
        const d = pick(r, [0.050, 0.10]), I2 = pick(r, [2.0, 3.0]), k = pick(r, [2, 3]), I1 = k * I2;
        const B1 = (MU0 * I1) / (2 * Math.PI * d), B2 = (MU0 * I2) / (2 * Math.PI * d), Bn = B1 + B2;
        const x = (2 * d * I2) / (I1 - I2);
        const fig: Fig = {
          w: 420, h: 170, alt: "Dos alambres paralelos perpendiculares a la página: el de la izquierda con corriente hacia fuera y el de la derecha con corriente hacia dentro; P es el punto medio entre ellos",
          items: [
            { t: "circle", cx: 90, cy: 80, r: 9 }, { t: "circle", cx: 90, cy: 80, r: 2, fill: "dark" },
            { t: "circle", cx: 230, cy: 80, r: 9 }, ...cross(230, 80, 5),
            T(90, 112, `I₁ = ${fmt(I1, 2)} A`), T(230, 112, `I₂ = ${fmt(I2, 2)} A`), T(90, 128, "(hacia fuera)"), T(230, 128, "(hacia dentro)"),
            { t: "dot", x: 160, y: 80, r: 2.5 }, T(160, 70, "P"),
            { t: "line", x1: 99, y1: 80, x2: 151, y2: 80, w: 1, dash: true }, { t: "line", x1: 169, y1: 80, x2: 221, y2: 80, w: 1, dash: true },
            { t: "line", x1: 239, y1: 80, x2: 400, y2: 80, w: 1, dash: true },
            { t: "line", x1: 90, y1: 40, x2: 160, y2: 40, w: 1, arrow: "both" }, { t: "line", x1: 160, y1: 40, x2: 230, y2: 40, w: 1, arrow: "both" },
            T(125, 33, `d = ${fmt(d * 100, 2)} cm`), T(195, 33, `d = ${fmt(d * 100, 2)} cm`),
          ],
        };
        return {
          stem: `Dos alambres largos y rectos, paralelos y perpendiculares a la página, están separados una distancia 2d, con d = ${fmt(d * 100, 2)} cm. Llevan corrientes I₁ = ${fmt(I1, 2)} A hacia fuera de la página e I₂ = ${fmt(I2, 2)} A hacia dentro. P es el punto medio entre los alambres.`,
          data: "μ₀ = 4π × 10⁻⁷ T m A⁻¹",
          fig,
          parts: [
            part("(a)", "Calcule la intensidad del campo magnético en P debida solo al alambre 1.", [
              method("B = μ₀I / 2πr", /μ0|μ₀|mu0|2\s*π\s*r|2πr/i, B1, "B = μ₀I/2πr"),
              val("A1", `B₁ = ${fmt(B1)} T`, B1),
            ], ["B = μ₀ I / (2π r)", `B₁ = 4π×10⁻⁷ × ${fmt(I1, 2)} / (2π × ${fmt(d)})`, `B₁ = ${fmt(B1)} T`]),
            part("(b)", "Determine la intensidad del campo magnético neto en P e indique su dirección.", [
              val("A1", `B = B₁ + B₂ = ${fmt(Bn)} T`, Bn),
              reason("Los dos campos apuntan en el mismo sentido (hacia arriba) y se suman", "dirección: hacia arriba, se suman", "se suman", "suman", "mismo sentido", "misma direccion", "hacia arriba"),
            ], [`B₂ = μ₀ I₂ / (2π d) = ${fmt(B2)} T`, `Los dos campos apuntan hacia arriba (mismo sentido) y se suman: B = ${fmt(B1)} + ${fmt(B2)} = ${fmt(Bn)} T`]),
            part("(c)", "Hay un punto, a la derecha del alambre 2 y sobre la recta que une los alambres, donde el campo neto es nulo. Determine su distancia al alambre 2.", [
              { code: "M1", text: "B₁ = B₂: I₁ / (x + 2d) = I₂ / x", miss: "I₁/(x+2d) = I₂/x", test: (l) => /\(\s*x\s*\+\s*2\s*d\s*\)|x\s*\+\s*2\s*d|I\s*[₁1]\s*\/|\/\s*\(?\s*x/i.test(l) || /B\s*[₁1]\s*=\s*B\s*[₂2]/i.test(l) },
              val("A1", `x = ${fmt(x)} m`, x),
            ], ["En ese punto B₁ = B₂ (sentidos opuestos): I₁ / (x + 2d) = I₂ / x", `${fmt(I1, 2)} x = ${fmt(I2, 2)} (x + ${fmt(2 * d)})`, `x = ${fmt(x)} m`]),
          ],
        };
      },
    },
  ],

  /* ================= D.3 Movimiento en campos electromagnéticos ================= */
  D3: [
    {
      id: "x_radiov", level: 2, label: "Protón en un campo magnético: gráfica del radio frente a la rapidez", keywords: ["radio de giro", "qvb", "grafica r v", "protón"],
      make: (r) => {
        const s = pick(r, [2, 3]), v0 = pick(r, [2, 4]);
        const r0 = s * v0 /* cm */, vm = v0 * 1e6, rm = r0 / 100;
        const B = (MP * vm) / (E_CHARGE * rm), T0 = (2 * Math.PI * rm) / vm;
        const fig: Fig = {
          w: 380, h: 258, alt: "Gráfica del radio de la trayectoria circular (cm) frente a la rapidez (10⁶ m s⁻¹): una recta que pasa por el origen",
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 4], yr: [0, 12], xlabel: "v / 10⁶ m s⁻¹", ylabel: "r / cm",
            xticks: range(0, 4, 1), yticks: range(0, 12, 2), grid: true,
            series: [{ pts: [[0, 0], [1, s], [2, 2 * s], [3, 3 * s], [4, 4 * s]], dots: true }],
          }],
        };
        return {
          stem: "Protones con distintas rapideces entran perpendicularmente en una región de campo magnético uniforme B y describen trayectorias circulares. La gráfica muestra el radio r de la trayectoria en función de la rapidez v de los protones.",
          data: "Masa del protón = 1,67 × 10⁻²⁷ kg · Carga del protón = 1,6 × 10⁻¹⁹ C",
          fig,
          parts: [
            part("(a)", `Utilice la gráfica para determinar el radio de la trayectoria de un protón con una rapidez de ${v0} × 10⁶ m s⁻¹.`, [
              valAny("A1", `r = ${r0} cm`, [r0, rm], "lectura de r"),
            ], [`De la gráfica: r = ${r0} cm = ${fmt(rm)} m`], 2),
            part("(b)", "Calcule la intensidad del campo magnético B.", [
              method("qvB = mv²/r, es decir r = mv / qB", /qvB|mv\s*\/\s*qB|mv\^?2|B\s*=\s*mv|m\s*v/i, B, "r = mv/qB"),
              val("A1", `B = ${fmt(B)} T`, B),
            ], ["qvB = m v² / r  →  B = m v / (q r)", `B = 1,67×10⁻²⁷ × ${fmt(vm, 2)} / (1,6×10⁻¹⁹ × ${fmt(rm)})`, `B = ${fmt(B)} T`]),
            part("(c)", "Calcule el tiempo que tarda un protón de esa rapidez en completar una vuelta.", [
              method("T = 2πr / v (o T = 2πm / qB)", /2\s*π|2π|2\s*pi/i, T0, "T = 2πr/v"),
              val("A1", `T = ${fmt(T0)} s`, T0),
            ], ["T = 2π r / v", `T = 2π × ${fmt(rm)} / ${fmt(vm, 2)}`, `T = ${fmt(T0)} s`]),
          ],
        };
      },
    },
    {
      id: "x_espectro", level: 3, label: "Espectrómetro de masas: dos isótopos", keywords: ["espectrometro de masas", "isotopos", "r = mv/qb", "muestre que"],
      make: (r) => {
        const [A1m, A2m] = pick(r, [[6, 7], [10, 11], [20, 22], [35, 37]]);
        const V = pick(r, [100, 200, 300]), B = pick(r, [0.50, 0.80, 1.20]);
        const m1 = A1m * U_AMU, m2 = A2m * U_AMU;
        const rr = (m: number) => Math.sqrt((2 * m * V) / E_CHARGE) / B;
        const r1 = rr(m1), r2 = rr(m2), ds = 2 * (r2 - r1), v1 = Math.sqrt((2 * E_CHARGE * V) / m1), ratio = r2 / r1;
        const p2 = 90, p1 = (p2 * r1) / r2, ox = 80, oy = 62;
        const arc = (p: number) => `M ${ox} ${oy} A ${p} ${p} 0 0 0 ${ox + 2 * p} ${oy}`;
        const xs = range(120, 300, 45), ys = [oy + 22, oy + 62];
        const fig: Fig = {
          w: 380, h: 190, alt: "Iones que entran por un punto de una placa y describen semicircunferencias de radios distintos en un campo magnético que entra en la página, hasta chocar con la placa",
          items: [
            { t: "line", x1: 15, y1: oy, x2: 365, y2: oy, w: 1.6 },
            ...ys.flatMap((y) => xs.flatMap((x) => cross(x, y))),
            arr(ox, 12, ox, oy - 2), T(ox + 8, 24, "iones", "start"),
            { t: "path", d: arc(p1), w: 1.6 }, { t: "path", d: arc(p2), w: 1.6 },
            { t: "dot", x: ox + 2 * p1, y: oy, r: 3 }, { t: "dot", x: ox + 2 * p2, y: oy, r: 3 },
            T(ox + 2 * p1, oy - 9, "1"), T(ox + 2 * p2, oy - 9, "2"),
            T(340, 170, "B hacia dentro", "end"),
          ],
        };
        return {
          stem: `Un espectrómetro de masas separa dos isótopos de masas ${A1m} u (isótopo 1) y ${A2m} u (isótopo 2). Los iones, con carga +e y que parten del reposo, se aceleran a través de una diferencia de potencial V = ${V} V y entran perpendicularmente en un campo magnético uniforme de intensidad B = ${fmt(B, 2)} T. Describen semicircunferencias y chocan contra una placa, como muestra el diagrama.`,
          data: "1 u = 1,661 × 10⁻²⁷ kg · e = 1,6 × 10⁻¹⁹ C",
          fig,
          parts: [
            part("(a)", "Muestre que el radio de la trayectoria de un ion de masa m es r = (1/B)√(2mV/e).", [
              rx("M1", "eV = ½mv², así que v = √(2eV/m)", /eV|qV|½\s*m\s*v|1\/2\s*m\s*v|mv\^?2\s*=\s*2/i, "eV = ½mv²"),
              rx("M1", "evB = mv²/r, es decir r = mv/eB, y se sustituye v", /mv\s*\/\s*eB|mv\s*\/\s*qB|evB|qvB|r\s*=\s*mv/i, "r = mv/eB"),
            ], ["eV = ½ m v²  →  v = √(2eV / m)", "e v B = m v² / r  →  r = m v / (eB) = (1/B) √(2mV / e)"]),
            part("(b)", "Calcule el radio de la trayectoria del isótopo 1.", [
              method("r = (1/B)√(2mV/e) (o el cálculo de v antes)", /√|sqrt|mv\s*\/\s*eB|2\s*m\s*V|eV/i, v1, "sustituye en r = (1/B)√(2mV/e)"),
              val("A1", `r₁ = ${fmt(r1)} m`, r1),
            ], [`m₁ = ${A1m} × 1,661×10⁻²⁷ = ${fmt(m1)} kg`, `r₁ = (1 / ${fmt(B, 2)}) × √(2 × ${fmt(m1)} × ${V} / 1,6×10⁻¹⁹)`, `r₁ = ${fmt(r1)} m`]),
            part("(c)", "Determine la distancia entre los puntos en que chocan los dos isótopos contra la placa.", [
              { code: "M1", text: "r₂ = r₁ √(m₂/m₁); la separación es 2(r₂ − r₁)", miss: "r₂ y separación = 2(r₂−r₁)", test: (l, n) => near(n, r2) || /2\s*\(\s*r\s*[₂2]\s*[−-]\s*r\s*[₁1]\s*\)/i.test(normalize(l)) },
              val("A1", `d = ${fmt(ds)} m`, ds),
            ], [`r₂ = r₁ √(m₂ / m₁) = ${fmt(r1)} × √(${A2m} / ${A1m}) = ${fmt(r2)} m`, `d = 2(r₂ − r₁) = 2 × (${fmt(r2)} − ${fmt(r1)})`, `d = ${fmt(ds)} m`]),
            part("(d)", "Se duplica la diferencia de potencial V, sin cambiar nada más. Indique el factor por el que cambia el radio de la trayectoria de cada isótopo.", [
              factor(`r ∝ √V: el radio se multiplica por √2 = ${fmt(Math.SQRT2, 3)}`, Math.SQRT2),
            ], ["r ∝ √V  →  r' = √2 r", `r' = ${fmt(Math.SQRT2, 3)} r`], 2),
          ],
        };
      },
    },
    {
      id: "x_graffuerza", level: 3, label: "Conductor en un campo: gradiente de la gráfica F–I", keywords: ["fuerza sobre un conductor", "bil", "grafica f i", "gradiente"],
      make: (r) => {
        const L = pick(r, [0.20, 0.25, 0.40]), B = pick(r, [0.10, 0.30, 0.50]), th = pick(r, [30, 60]);
        const sl = B * L, slth = sl * Math.sin(rad(th)), I0 = 4;
        const F0 = sl * I0 * 1e3 /* mN */;
        const fig: Fig = {
          w: 380, h: 258, alt: "Gráfica de la fuerza magnética sobre el conductor (mN) frente a la corriente (A): una recta que pasa por el origen",
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 5], yr: [0, sl * 5e3], xlabel: "I / A", ylabel: "F / mN",
            xticks: range(0, 5, 1), yticks: range(0, 5, 1).map((k) => Number((k * sl * 1e3).toPrecision(4))), grid: true,
            series: [{ pts: range(0, 5, 1).map((i) => [i, i * sl * 1e3] as [number, number]), dots: true }],
          }],
        };
        return {
          stem: `Un conductor recto de longitud ${fmt(L, 2)} m, perpendicular a un campo magnético uniforme de intensidad desconocida B, lleva una corriente I que se varía. La gráfica muestra la fuerza magnética F sobre el conductor en función de I.`,
          fig,
          parts: [
            part("(a)", `Utilice la gráfica para determinar el gradiente de la recta, en N A⁻¹ (lea la fuerza para I = ${I0} A).`, [
              { code: "M1", text: `F = ${fmt(F0)} mN para I = ${I0} A`, miss: "lectura de F en I = 4 A", test: (_, n) => near(n, F0) || near(n, F0 / 1e3) },
              valAny("A1", `gradiente = ${fmt(sl)} N A⁻¹`, [sl, sl * 1e3], "gradiente = ΔF/ΔI"),
            ], [`Para I = ${I0} A: F = ${fmt(F0)} mN = ${fmt(F0 / 1e3)} N`, `gradiente = F / I = ${fmt(F0 / 1e3)} / ${I0} = ${fmt(sl)} N A⁻¹`]),
            part("(b)", "Determine la intensidad del campo magnético B.", [
              method("F = BIL, así que gradiente = BL", /BIL|BL|B\s*=\s*.*\/\s*L|\/\s*L/i, B, "gradiente = BL"),
              val("A1", `B = ${fmt(B, 2)} T`, B),
            ], ["F = B I L  →  gradiente = B L", `B = ${fmt(sl)} / ${fmt(L, 2)}`, `B = ${fmt(B, 2)} T`]),
            part("(c)", `El conductor se gira de modo que forma un ángulo de ${th}° con las líneas de campo. Calcule el gradiente de la nueva gráfica F–I.`, [
              valAny("A1", `gradiente = BL sen θ = ${fmt(slth)} N A⁻¹`, [slth, slth * 1e3], "BL sen θ"),
            ], [`F = B I L sen θ  →  gradiente = ${fmt(B, 2)} × ${fmt(L, 2)} × sen ${th}°`, `gradiente = ${fmt(slth)} N A⁻¹`], 2),
            part("(d)", "Explique por qué la fuerza sobre el conductor es nula cuando está en la dirección del campo.", [
              reason("sen 0° = 0: no hay componente de la corriente perpendicular al campo", "F = BIL sen θ con θ = 0", "sen 0", "sin 0", "sen(0", "senθ = 0", "componente", "perpendicular"),
            ], ["F = B I L sen θ y sen 0° = 0: la corriente no tiene componente perpendicular al campo"], 2),
          ],
        };
      },
    },
  ],

  /* ================= D.4 Inducción ================= */
  D4: [
    {
      id: "x_flujograf", level: 2, label: "Fem inducida a partir de una gráfica de flujo", keywords: ["flujo magnetico", "fem inducida", "grafica flujo tiempo", "ley de faraday"],
      make: (r) => {
        const N = pick(r, [50, 100, 200]), P = pick(r, [4, 6, 8]);
        const e1 = (N * P * 1e-3) / 2, e3 = (N * P * 1e-3) / 4;
        const fig: Fig = {
          w: 380, h: 258, alt: "Gráfica del flujo magnético (mWb) frente al tiempo (s): sube hasta 2 s, es constante hasta 4 s y baja linealmente hasta cero a los 8 s",
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 8], yr: [0, 10], xlabel: "t / s", ylabel: "Φ / mWb",
            xticks: range(0, 8, 1), yticks: range(0, 10, 2), grid: true,
            series: [{ pts: [[0, 0], [2, P], [4, P], [8, 0]] }],
          }],
        };
        return {
          stem: `Una bobina de ${N} espiras está en un campo magnético que varía. La gráfica muestra el flujo magnético Φ que atraviesa cada espira en función del tiempo.`,
          fig,
          parts: [
            part("(a)", "Determine la magnitud de la fem inducida en la bobina entre t = 0 y t = 2 s.", [
              { code: "M1", text: "ε = −NΔΦ/Δt (la velocidad de cambio del flujo es el gradiente de la gráfica)", miss: "ε = −NΔΦ/Δt", test: (l, n) => /Δ\s*Φ|dΦ|NΔ|N\s*Φ|Δt/i.test(l) || near(n, P / 2) || near(n, P / 2 * 1e-3) },
              valAny("A1", `ε = ${fmt(e1)} V`, [e1, -e1], "ε"),
            ], ["ε = −N ΔΦ / Δt", `ε = ${N} × ${P}×10⁻³ / 2`, `ε = ${fmt(e1)} V`]),
            part("(b)", "Explique por qué la fem inducida es nula entre t = 2 s y t = 4 s.", [
              reason("El flujo es constante: su variación (gradiente) es cero", "flujo constante, ΔΦ/Δt = 0", "constante", "no varia", "no cambia", "variacion nula", "variacion del flujo es cero", "pendiente es cero", "gradiente es cero", "dφ/dt = 0"),
            ], ["El flujo es constante (gradiente cero): ΔΦ/Δt = 0, luego ε = 0"], 2),
            part("(c)", "Determine la fem inducida entre t = 4 s y t = 8 s.", [
              { code: "M1", text: "gradiente de la gráfica entre 4 s y 8 s: ΔΦ/Δt", miss: "ΔΦ/Δt entre 4 y 8 s", test: (l, n) => na(n, P / 4) || na(n, P / 4 * 1e-3) },
              valAny("A1", `ε = ${fmt(e3)} V`, [e3, -e3], "ε"),
            ], [`ΔΦ / Δt = −${P}×10⁻³ / 4 = −${fmt(P / 4 * 1e-3)} Wb s⁻¹`, `ε = −N ΔΦ/Δt = ${N} × ${fmt(P / 4 * 1e-3)}`, `ε = ${fmt(e3)} V`]),
          ],
        };
      },
    },
    {
      id: "x_varillacirc", level: 3, label: "Varilla deslizante: fem, fuerza y potencia", keywords: ["varilla", "fem de movimiento", "bvl", "fuerza y potencia", "rieles"],
      make: (r) => {
        const L = pick(r, [0.30, 0.40, 0.50]), v = pick(r, [2.0, 4.0, 5.0]), B = pick(r, [0.20, 0.50, 0.80]), R = pick(r, [2.0, 4.0, 5.0]);
        const e = B * L * v, I = e / R, F = B * I * L, P = F * v;
        const xs = [100, 140, 170, 245, 285], ys = [72, 128];
        const fig: Fig = {
          w: 390, h: 205, alt: "Dos rieles horizontales unidas por una resistencia R en el extremo izquierdo; una varilla de longitud L se mueve hacia la derecha con rapidez v en un campo magnético que entra en la página",
          items: [
            { t: "line", x1: 60, y1: 50, x2: 330, y2: 50, w: 1.6 }, { t: "line", x1: 60, y1: 150, x2: 330, y2: 150, w: 1.6 },
            { t: "comp", kind: "resistor", x1: 60, y1: 50, x2: 60, y2: 150, label: "R" },
            { t: "line", x1: 210, y1: 46, x2: 210, y2: 154, w: 3 },
            arr(214, 100, 290, 100), T(284, 90, "v"),
            ...ys.flatMap((y) => xs.flatMap((x) => cross(x, y))),
            { t: "line", x1: 350, y1: 50, x2: 350, y2: 150, w: 1, arrow: "both" }, T(366, 105, "L"),
            T(300, 188, "B hacia dentro", "middle"),
          ],
        };
        return {
          stem: `Una varilla conductora de longitud L = ${fmt(L, 2)} m se desliza con rapidez constante v = ${fmt(v, 2)} m s⁻¹ sobre dos rieles conductores horizontales, de resistencia despreciable, unidos por una resistencia R = ${fmt(R, 2)} Ω. Hay un campo magnético uniforme B = ${fmt(B, 2)} T perpendicular al plano de los rieles. La varilla y los rieles se mantienen siempre perpendiculares entre sí. La resistencia de la varilla es despreciable.`,
          fig,
          parts: [
            part("(a)", `Muestre que la fem inducida en la varilla es de ${fmt(e)} V.`, [
              rx("M1", "ε = BLv (o ε = ΔΦ/Δt = B L Δx / Δt)", /BLv|B\s*L\s*v|B\s*v\s*L|BvL|ΔΦ|dΦ|B\s*L\s*Δx/i, "ε = BLv"),
              val("A1", `ε = ${fmt(e)} V`, e),
            ], ["ε = B L v", `ε = ${fmt(B, 2)} × ${fmt(L, 2)} × ${fmt(v, 2)} = ${fmt(e)} V`]),
            part("(b)", "Calcule la corriente en la resistencia.", [val("A1", `I = ε / R = ${fmt(I)} A`, I)], [`I = ε / R = ${fmt(e)} / ${fmt(R, 2)}`, `I = ${fmt(I)} A`], 2),
            part("(c)", "Calcule la fuerza que hay que aplicar a la varilla para mantener su rapidez constante.", [
              method("F = BIL (la fuerza magnética se opone al movimiento)", /BIL|B\s*I\s*L/i, F, "F = BIL"),
              val("A1", `F = ${fmt(F)} N`, F),
            ], ["Para v constante, la fuerza aplicada es igual a la fuerza magnética: F = B I L", `F = ${fmt(B, 2)} × ${fmt(I)} × ${fmt(L, 2)}`, `F = ${fmt(F)} N`]),
            part("(d)", "Calcule la potencia mecánica que se suministra a la varilla y compárela con la potencia disipada en la resistencia.", [
              { code: "M1", text: "P = Fv", miss: "P = Fv", test: (l, n) => near(n, P) || /Fv|F\s*v/.test(l) },
              reason("Son iguales (P = I²R): la energía mecánica se transforma en energía térmica", "se comparan: son iguales", "igual", "misma", "coincide", "conserv", "transforma"),
            ], [`P = F v = ${fmt(F)} × ${fmt(v, 2)} = ${fmt(P)} W`, `I²R = ${fmt(I)}² × ${fmt(R, 2)} = ${fmt(I * I * R)} W: es igual, la energía mecánica se transforma en energía térmica (se conserva la energía)`]),
            part("(e)", "La varilla se mueve ahora al doble de rapidez. Indique el factor por el que aumenta la potencia mecánica necesaria.", [
              factor("ε y I se duplican, F se duplica: P = Fv aumenta 4 veces", 4),
            ], ["ε ∝ v, I ∝ v, F ∝ v  →  P = F v ∝ v²: P aumenta 4 veces"], 2),
          ],
        };
      },
    },
    {
      id: "x_generadorgraf", level: 3, label: "Generador de CA: fem frente al tiempo", keywords: ["generador", "corriente alterna", "fem maxima", "grafica fem tiempo", "bobina giratoria"],
      make: (r) => {
        const e0 = pick(r, [4, 6, 8]), Tm = pick(r, [16, 20, 24]), N = pick(r, [200, 500, 1000]), B = pick(r, [0.050, 0.10, 0.20]);
        const f = 1000 / Tm, w = 2 * Math.PI * f, A = e0 / (N * B * w);
        const fig: Fig = {
          w: 380, h: 258, alt: `Gráfica de la fem (V) frente al tiempo (ms): una sinusoide de amplitud ${e0} V y dos periodos completos`,
          items: [{
            t: "graph", x: 58, y: 14, w: 300, h: 190, xr: [0, 2 * Tm], yr: [-10, 10], xlabel: "t / ms", ylabel: "ε / V",
            xticks: range(0, 2 * Tm, Tm / 4), yticks: range(-10, 10, 2), grid: true,
            series: [{ pts: curve((t) => e0 * Math.sin((2 * Math.PI * t) / Tm), 0, 2 * Tm, 64), smooth: true }],
          }],
        };
        return {
          stem: `Una bobina de ${N} espiras gira con rapidez angular constante en un campo magnético uniforme de intensidad ${fmt(B, 2)} T, y genera una fem alterna. La gráfica muestra la fem ε en función del tiempo.`,
          fig,
          parts: [
            part("(a)", "Determine la frecuencia de rotación de la bobina.", [
              method("f = 1 / T, con T leído de la gráfica", /1\s*\/\s*T|f\s*=\s*1/i, Tm, "f = 1/T"),
              val("A1", `f = ${fmt(f)} Hz`, f),
            ], [`De la gráfica: T = ${Tm} ms = ${fmt(Tm / 1000)} s`, `f = 1 / T = 1 / ${fmt(Tm / 1000)}`, `f = ${fmt(f)} Hz`]),
            part("(b)", "Calcule el área de la bobina.", [
              method("ε₀ = NBAω, con ω = 2πf", /NBA|N\s*B\s*A|ω|2\s*π\s*f|2πf/i, w, "ε₀ = NBAω"),
              val("A1", `A = ${fmt(A)} m²`, A),
            ], [`ω = 2π f = ${fmt(w)} rad s⁻¹`, "ε₀ = N B A ω  →  A = ε₀ / (N B ω)", `A = ${e0} / (${N} × ${fmt(B, 2)} × ${fmt(w)}) = ${fmt(A)} m²`]),
            part("(c)", "La bobina gira ahora al doble de rapidez angular. Indique la nueva amplitud de la fem y el nuevo periodo.", [
              val("A1", `ε₀' = ${2 * e0} V`, 2 * e0, "amplitud doble"),
              val("A1", `T' = ${Tm / 2} ms`, Tm / 2, "periodo mitad"),
            ], [`ε₀ ∝ ω: ε₀' = 2 × ${e0} = ${2 * e0} V`, `T ∝ 1/ω: T' = ${Tm} / 2 = ${Tm / 2} ms`]),
            part("(d)", "Explique por qué la fem es nula cuando el plano de la bobina es perpendicular al campo.", [
              reason("El flujo es máximo y su variación en ese instante es cero (dΦ/dt = 0)", "flujo máximo, dΦ/dt = 0", "flujo maximo", "flujo es maximo", "variacion del flujo es cero", "variacion nula", "dφ/dt = 0", "dφ/dt=0", "no cambia el flujo", "no varia el flujo"),
            ], ["El flujo es máximo en ese instante: su variación es cero (dΦ/dt = 0), luego ε = 0"], 2),
          ],
        };
      },
    },
  ],
};
