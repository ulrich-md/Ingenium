/**
 * Unit D · more questions (basico). See kit.ts. Concepts are added to the subtopics of
 * bank/D.ts by topic id (e.g. "D1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { E_CHARGE, fmt, G, hasAny, K_COUL, method, normalize, part, pick, PLANETS, reason, val, type Concept, type FigItem } from "./kit.ts";

const MP = 1.67e-27; // masa del protón (kg)

/* ---------- pequeños dibujos ---------- */
const T = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle"): FigItem => ({ t: "text", x, y, s, anchor });
const arr = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2, w: 1.6, arrow: "end" });
const dim = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2, w: 1, arrow: "both" });
/** Cruz (×): campo magnético que entra en la página. */
const cross = (cx: number, cy: number, s = 3.5): FigItem[] => [
  { t: "line", x1: cx - s, y1: cy - s, x2: cx + s, y2: cy + s, w: 0.9 },
  { t: "line", x1: cx - s, y1: cy + s, x2: cx + s, y2: cy - s, w: 0.9 },
];
const crosses = (xs: number[], ys: number[]): FigItem[] => xs.flatMap((x) => ys.flatMap((y) => cross(x, y)));

/* ---------- regex comunes para los pasos de método ---------- */
const RE_EQ_FQ = /F\s*\/\s*q|F\/q/i;
const RE_VED = /V\s*=\s*E\s*d|\bE\s*[·×*]?\s*d\b/i;

export const extra: Record<string, Concept[]> = {
  D1: [
    {
      id: "b_gplaneta", label: "Campo gravitatorio en la superficie de otro planeta", level: 1,
      keywords: ["campo gravitatorio", "gravedad en otro planeta", "gm/r2"],
      make: (r) => {
        const cases = [
          { mT: "la mitad de la masa", rT: "el doble del radio", mf: 0.5, rf: 2 },
          { mT: "el doble de la masa", rT: "el doble del radio", mf: 2, rf: 2 },
          { mT: "una cuarta parte de la masa", rT: "el doble del radio", mf: 0.25, rf: 2 },
        ];
        const c = pick(r, cases);
        const f = c.mf / (c.rf * c.rf);
        const pa = part("(a)", "Indique la expresión de la intensidad del campo gravitatorio en la superficie de un planeta de masa M y radio R.", [
          { code: "M1", text: "g = GM / R²", miss: "g = GM / R²", test: (l) => /G\s*M\s*\/\s*R\^?2/i.test(normalize(l)) },
        ], ["g = G M / R²"]);
        pa.hints = [
          "Qué usar: el peso mg de una masa m en la superficie es igual a la fuerza gravitatoria sobre ella.",
          "Para empezar: iguala mg = G M m / R² y cancela m.",
        ];
        const pb = part("(b)", "Calcule la intensidad del campo gravitatorio en la superficie de este planeta, en función de g de la Tierra.", [
          method("g ∝ M / R²", /R\^?2|R²/i, f, "g ∝ M/R²"),
          val("A1", `g = ${fmt(f)} g_T`, f),
        ], [
          "g ∝ M / R²  →  g_p / g_T = (M_p / M_T) × (R_T / R_p)²",
          `g_p / g_T = (${fmt(c.mf)}) × (1 / ${fmt(c.rf)})² = ${fmt(f)}`,
          `g = ${fmt(f)} g_T`,
        ]);
        pb.hints = [
          "Qué usar: g ∝ M / R²: compara la masa y el radio del planeta con los de la Tierra.",
          "Para empezar: escribe el cociente (R_T / R_p)² con los datos del enunciado.",
        ];
        return { stem: `Un planeta tiene ${c.mT} y ${c.rT} que la Tierra.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_proporcion_r", label: "Fuerza gravitatoria y distancia entre centros", level: 1,
      keywords: ["inversamente", "cuadrado de la distancia", "fuerza gravitatoria"],
      make: (r) => {
        const k = pick(r, [2, 3, 4]);
        const word = k === 2 ? "el doble" : k === 3 ? "el triple" : "el cuádruple";
        const f = 1 / (k * k);
        const pa = part("(a)", "Explique cómo cambia la fuerza gravitatoria al aumentar la distancia entre los centros.", [
          reason("Es inversamente proporcional al cuadrado de la distancia", "inversamente proporcional al cuadrado de r", "inversamente", "1/r²", "1/r^2", "cuadrado de la distancia"),
        ], ["F ∝ 1/r²: la fuerza es inversamente proporcional al cuadrado de la distancia"]);
        pa.hints = ["Qué usar: F = G m₁ m₂ / r². Mira qué potencia de r aparece."];
        const pb = part("(b)", "Calcule la fuerza final F' en función de la fuerza inicial F.", [
          val("A1", `F' = ${fmt(f)} F`, f),
        ], [`F' / F = (r / r')² = (1 / ${k})²`, `F' = ${fmt(f)} F`]);
        pb.hints = [
          "Qué usar: escribe F' / F con la proporción inversa al cuadrado de r.",
          "Para empezar: la nueva distancia es r' = k r. Sustitúyela en F' = G m₁ m₂ / r'².",
        ];
        return { stem: `Dos satélites se atraen con una fuerza gravitatoria F. La distancia entre sus centros aumenta hasta ${word} de su valor inicial.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_peso_luna", label: "Peso de una sonda en la Luna", level: 1,
      keywords: ["peso", "luna", "campo gravitatorio en la luna"],
      make: (r) => {
        const Luna = PLANETS[2];
        const c = pick(r, [{ t: "800", m: 800 }, { t: "1 200", m: 1200 }, { t: "1 500", m: 1500 }]);
        const gL = (G * Luna.M) / (Luna.R * Luna.R);
        const W = c.m * gL;
        const pa = part("(a)", "Calcule la intensidad del campo gravitatorio en la superficie de la Luna.", [
          method("g = GM / R²", /G\s*M\s*\/\s*R\^?2|GM\/R/i, gL, "g = GM/R²"),
          val("A1", `g = ${fmt(gL)} N kg⁻¹`, gL),
        ], [
          "g = G M / R²",
          `g = 6,67×10⁻¹¹ × ${fmt(Luna.M)} / (${fmt(Luna.R)})²`,
          `g = ${fmt(gL)} N kg⁻¹`,
        ]);
        pa.hints = [
          "Qué usar: g = GM / R², con M y R de la Luna (están en la tabla de datos del enunciado).",
          "Para empezar: sustituye G, M y R con sus unidades SI.",
        ];
        const pb = part("(b)", "Calcule el peso de la sonda en la superficie de la Luna.", [
          method("W = mg", /W\s*=|m\s*g/i, W, "W = mg"),
          val("A1", `W = ${fmt(W)} N`, W),
        ], ["W = m g", `W = ${c.m} kg × ${fmt(gL)} N kg⁻¹`, `W = ${fmt(W)} N`]);
        pb.hints = [
          "Qué usar: el peso es W = m g, con g el valor que acabas de calcular.",
          "Para empezar: multiplica la masa de la sonda (en kg) por g de la Luna.",
        ];
        return {
          stem: `Una sonda de masa ${c.t} kg desciende hasta la superficie de la Luna.`,
          fig: {
            w: 300, h: 200, alt: "Una sonda sobre la superficie de la Luna, con una flecha hacia abajo que representa su peso W",
            items: [
              { t: "rect", x: 135, y: 50, w: 30, h: 20, fill: "dark" },
              arr(150, 72, 150, 106),
              T(164, 96, "W", "start"),
              { t: "circle", cx: 150, cy: 150, r: 38, fill: "light" },
              T(150, 154, "Luna"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
  ],
  D2: [
    {
      id: "b_coulomb", label: "Fuerza entre dos cargas puntuales (Coulomb)", level: 1,
      keywords: ["coulomb", "fuerza electrica", "cargas puntuales", "atraccion"],
      make: (r) => {
        const q1 = pick(r, [2.0e-6, 4.0e-6, 5.0e-6]), q2 = -pick(r, [1.5e-6, 3.0e-6]), d = pick(r, [0.20, 0.30, 0.50]);
        const F = (K_COUL * Math.abs(q1 * q2)) / (d * d);
        const pa = part("(a)", "Indique si la fuerza entre las dos cargas es de atracción o de repulsión.", [
          reason("Atracción: las cargas tienen signos opuestos", "atracción", "atraccion", "atractiva", "se atraen", "atrae"),
        ], ["Las cargas tienen signos opuestos, así que la fuerza es de atracción"]);
        pa.hints = ["Qué usar: compara el signo de las dos cargas."];
        const pb = part("(b)", "Calcule el módulo de la fuerza electrostática entre las cargas.", [
          method("F = k q₁ q₂ / r²", /k\s*q|q₁\s*q₂|q1\s*q2/i, F, "F = kq₁q₂/r²"),
          val("A1", `F = ${fmt(F)} N`, F),
        ], [
          "F = k q₁ q₂ / r²",
          `F = 8,99×10⁹ × ${fmt(q1)} × ${fmt(Math.abs(q2))} / (${fmt(d, 2)})²`,
          `F = ${fmt(F)} N`,
        ]);
        pb.hints = [
          "Qué usar: F = k q₁ q₂ / r², con las cargas en C (μ = 10⁻⁶) y la distancia en m.",
          "Para empezar: usa los valores absolutos de las cargas para el módulo y eleva r al cuadrado.",
        ];
        return {
          stem: `Dos cargas puntuales, de +${fmt(q1)} C y de −${fmt(Math.abs(q2))} C, están separadas ${fmt(d, 2)} m.`,
          data: "k = 8,99 × 10⁹ N m² C⁻²",
          fig: {
            w: 340, h: 120, alt: "Dos cargas puntuales, una positiva y otra negativa, separadas una distancia r",
            items: [
              { t: "circle", cx: 90, cy: 55, r: 15, fill: "light" }, T(90, 60, "+"),
              { t: "circle", cx: 250, cy: 55, r: 15, fill: "light" }, T(250, 60, "−"),
              dim(90, 92, 250, 92), T(170, 110, "r"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_E_fq", label: "Intensidad del campo eléctrico: E = F / q", level: 1,
      keywords: ["campo electrico", "e = f/q", "carga de prueba"],
      make: (r) => {
        const q = pick(r, [2.0e-6, 4.0e-6, 5.0e-6]), E = pick(r, [1.5e3, 2.5e3, 4.0e3]);
        const F = q * E;
        const pa = part("(a)", "Indique la expresión que define la intensidad del campo eléctrico en función de F y q.", [
          method("E = F / q", RE_EQ_FQ, E, "E = F/q"),
        ], ["E = F / q"]);
        pa.hints = ["Qué usar: la intensidad del campo es la fuerza por unidad de carga."];
        const pb = part("(b)", "Calcule la intensidad del campo eléctrico en ese punto.", [
          method("E = F / q", RE_EQ_FQ, E, "E = F/q"),
          val("A1", `E = ${fmt(E)} N C⁻¹`, E),
        ], ["E = F / q", `E = ${fmt(F)} / ${fmt(q)}`, `E = ${fmt(E)} N C⁻¹`]);
        pb.hints = [
          "Qué usar: E = F / q, con F en newton y q en coulomb.",
          "Para empezar: escribe q en C (μ = 10⁻⁶) y divide F entre q.",
        ];
        return { stem: `Una carga de prueba de +${fmt(q)} C se coloca en un campo eléctrico y sufre una fuerza eléctrica de ${fmt(F)} N.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_placas", label: "Diferencia de potencial entre placas: V = Ed", level: 1,
      keywords: ["placas", "diferencia de potencial", "campo uniforme", "v = ed"],
      make: (r) => {
        const E = pick(r, [2.0e3, 2.5e3, 3.0e3]), d = pick(r, [0.020, 0.040, 0.050]);
        const V = E * d;
        const pa = part("(a)", "Indique la relación entre la diferencia de potencial V, la intensidad E y la separación d, para un campo uniforme.", [
          method("V = E d", RE_VED, V, "V = Ed"),
        ], ["V = E d"]);
        pa.hints = ["Qué usar: en un campo uniforme, la intensidad es la diferencia de potencial por unidad de distancia."];
        const pb = part("(b)", "Calcule la diferencia de potencial entre las placas.", [
          method("V = E d", RE_VED, V, "V = Ed"),
          val("A1", `V = ${fmt(V)} V`, V),
        ], ["V = E d", `V = ${fmt(E)} V m⁻¹ × ${fmt(d, 2)} m`, `V = ${fmt(V)} V`]);
        pb.hints = [
          "Qué usar: V = E d, con E en V m⁻¹ (lo mismo que N C⁻¹) y d en m.",
          "Para empezar: multiplica E por d con los datos del enunciado.",
        ];
        return {
          stem: `Entre dos placas metálicas paralelas separadas ${fmt(d, 2)} m hay un campo eléctrico uniforme de ${fmt(E)} N C⁻¹.`,
          fig: {
            w: 340, h: 170, alt: "Dos placas paralelas horizontales, la superior con signo + y la inferior con signo −, con un campo E dirigido de la superior a la inferior y una separación d",
            items: [
              { t: "rect", x: 60, y: 50, w: 200, h: 4, fill: "dark" },
              { t: "rect", x: 60, y: 120, w: 200, h: 4, fill: "dark" },
              T(160, 42, "+"),
              T(160, 146, "−"),
              arr(160, 62, 160, 110), T(172, 92, "E", "start"),
              dim(285, 54, 285, 124), T(300, 92, "d", "start"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
  ],
  D3: [
    {
      id: "b_qvB", label: "Fuerza magnética sobre una carga: F = qvB", level: 1,
      keywords: ["fuerza magnetica", "qvb", "carga en movimiento", "campo perpendicular"],
      make: (r) => {
        const v = pick(r, [2.0e6, 4.0e6, 5.0e6]), B = pick(r, [0.020, 0.050, 0.10]);
        const F = E_CHARGE * v * B;
        const pa = part("(a)", "Calcule la fuerza magnética sobre el electrón.", [
          method("F = qvB", /q\s*v\s*B|qvB|evB|e\s*v\s*B/i, F, "F = qvB"),
          val("A1", `F = ${fmt(F)} N`, F),
        ], ["F = q v B", `F = ${fmt(E_CHARGE)} × ${fmt(v)} × ${fmt(B)}`, `F = ${fmt(F)} N`]);
        pa.hints = [
          "Qué usar: F = q v B, con v y B perpendiculares entre sí.",
          "Para empezar: escribe la carga del electrón en C (está en los datos) y los valores de v y B con sus unidades.",
        ];
        const pb = part("(b)", "Indique por qué la fuerza magnética no cambia el módulo de la velocidad del electrón.", [
          reason("La fuerza es perpendicular a la velocidad y no realiza trabajo", "perpendicular", "perpendicular", "no realiza trabajo", "no hace trabajo", "trabajo es cero", "trabajo nulo"),
        ], ["La fuerza es perpendicular a v, así que no realiza trabajo sobre el electrón"]);
        pb.hints = ["Piensa en el ángulo entre F y v, y en el trabajo que hace una fuerza perpendicular al desplazamiento."];
        return {
          stem: `Un electrón se mueve con rapidez ${fmt(v)} m s⁻¹ perpendicular a un campo magnético uniforme de ${fmt(B)} T.`,
          data: `Carga del electrón = ${fmt(E_CHARGE)} C`,
          fig: {
            w: 340, h: 170, alt: "Un electrón con velocidad v hacia la derecha en un campo magnético B hacia dentro de la página, con una fuerza F perpendicular hacia abajo",
            items: [
              ...crosses([60, 110, 280, 320], [45, 90, 135]),
              { t: "circle", cx: 170, cy: 90, r: 5, fill: "dark" }, T(170, 78, "e⁻"),
              arr(180, 90, 240, 90), T(246, 94, "v", "start"),
              arr(170, 98, 170, 150), T(178, 150, "F", "start"),
              T(170, 22, "B (× hacia dentro de la página)"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_BIL", label: "Fuerza sobre un conductor recto con corriente: F = BIL", level: 1,
      keywords: ["fuerza sobre un conductor", "bil", "corriente en campo magnetico"],
      make: (r) => {
        const L = pick(r, [0.15, 0.35, 0.40]), I = pick(r, [2.0, 4.0, 5.0]), B = pick(r, [0.20, 0.30, 0.50]);
        const F = B * I * L;
        const pa = part("(a)", "Calcule la fuerza sobre el conductor.", [
          method("F = BIL", /B\s*I\s*L|BIL/i, F, "F = BIL"),
          val("A1", `F = ${fmt(F)} N`, F),
        ], ["F = B I L", `F = ${fmt(B)} × ${fmt(I)} × ${fmt(L)}`, `F = ${fmt(F)} N`]);
        pa.hints = [
          "Qué usar: la fuerza sobre un conductor de longitud L que transporta una corriente I, perpendicular a un campo B.",
          "Para empezar: escribe B, I y L con sus unidades (T, A, m) y multiplica.",
        ];
        const pb = part("(b)", "Indique qué ocurre con la fuerza si se invierte el sentido de la corriente.", [
          reason("La fuerza cambia de sentido (es la contraria)", "invert", "invert", "sentido contrario", "contrari", "opuest", "cambia de sentido"),
        ], ["La fuerza cambia de sentido: tiene sentido contrario al anterior"]);
        pb.hints = ["Piensa en la regla de la mano derecha: el sentido de F depende del sentido de I."];
        return {
          stem: `Un conductor recto de ${fmt(L, 2)} m transporta una corriente de ${fmt(I, 2)} A y está en un campo magnético uniforme de ${fmt(B, 2)} T, perpendicular al conductor.`,
          fig: {
            w: 340, h: 170, alt: "Un conductor horizontal con corriente I hacia la derecha, en un campo B hacia dentro de la página, y una fuerza F hacia arriba",
            items: [
              { t: "line", x1: 60, y1: 85, x2: 280, y2: 85, w: 3 },
              arr(100, 62, 150, 62), T(125, 54, "I"),
              arr(220, 85, 220, 35), T(228, 40, "F", "start"),
              T(170, 105, "L"),
              ...crosses([80, 130, 180, 230, 280], [125, 150]),
              T(170, 22, "B (× hacia dentro de la página)"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_periodo", label: "Periodo del movimiento circular en un campo magnético", level: 1,
      keywords: ["periodo", "movimiento circular", "proton", "ciclotron"],
      make: (r) => {
        const B = pick(r, [0.25, 0.50, 0.80]);
        const Tp = (2 * Math.PI * MP) / (E_CHARGE * B);
        const pa = part("(a)", "Calcule el periodo del movimiento circular del protón.", [
          method("T = 2π m / (qB)", /2\s*π\s*m|2\s*pi\s*m|T\s*=\s*2\s*π/i, Tp, "T = 2πm/(qB)"),
          val("A1", `T = ${fmt(Tp)} s`, Tp),
        ], ["T = 2π m / (q B)", `T = 2π × ${fmt(MP)} / (${fmt(E_CHARGE)} × ${fmt(B, 2)})`, `T = ${fmt(Tp)} s`]);
        pa.hints = [
          "Qué usar: qvB = mv²/r da r; después T = 2πr / v.",
          "Para empezar: iguala la fuerza magnética qvB con mv²/r y despeja r.",
        ];
        const pb = part("(b)", "Indique si el periodo cambia si aumenta la rapidez del protón. Explique.", [
          reason("No cambia: el periodo no depende de la rapidez", "no cambia", "no depende", "independ", "no varia", "no se modifica", "no afecta"),
        ], ["T = 2π m / (q B): el periodo no depende de la rapidez v, así que no cambia"]);
        pb.hints = ["Mira la expresión de T que acabas de obtener: ¿aparece la velocidad?"];
        return {
          stem: `Un protón describe una trayectoria circular perpendicular a un campo magnético uniforme de ${fmt(B, 2)} T.`,
          data: `Masa del protón = ${fmt(MP)} kg · Carga elemental = ${fmt(E_CHARGE)} C`,
          parts: [pa, pb],
        };
      },
    },
  ],
  D4: [
    {
      id: "b_flujo", label: "Flujo magnético: Φ = BA", level: 1,
      keywords: ["flujo magnetico", "phi = ba", "espira", "weber"],
      make: (r) => {
        const A = pick(r, [0.010, 0.020, 0.040]), B = pick(r, [0.25, 0.40, 0.60]);
        const Phi = B * A;
        const pa = part("(a)", "Calcule el flujo magnético a través de la espira.", [
          method("Φ = BA", /B\s*A|BA|Φ\s*=\s*B/i, Phi, "Φ = BA"),
          val("A1", `Φ = ${fmt(Phi)} Wb`, Phi),
        ], ["Φ = B A (la espira es perpendicular al campo)", `Φ = ${fmt(B)} × ${fmt(A)}`, `Φ = ${fmt(Phi)} Wb`]);
        pa.hints = [
          "Qué usar: Φ = B A cuando B es perpendicular al plano de la espira.",
          "Para empezar: escribe B y A con sus unidades (T y m²).",
        ];
        const pb = part("(b)", "Indique el flujo magnético cuando el plano de la espira es paralelo al campo.", [
          reason("El flujo es cero", "flujo cero", "cero", "nulo", "0 wb", "no hay flujo", "es 0"),
        ], ["Con el plano paralelo al campo, la normal forma 90° con B: el flujo es cero"]);
        pb.hints = ["Piensa en el ángulo entre B y la normal al plano de la espira: Φ = B A cos θ."];
        return {
          stem: `Una espira plana de área ${fmt(A, 2)} m² está en un campo magnético uniforme de ${fmt(B, 2)} T, perpendicular a su plano.`,
          fig: {
            w: 340, h: 170, alt: "Una espira rectangular en un campo magnético B dirigido hacia dentro de la página",
            items: [
              { t: "rect", x: 110, y: 55, w: 120, h: 70, fill: "none" },
              T(170, 95, "espira"),
              ...crosses([45, 75, 265, 295], [35, 70, 105, 140]),
              T(45, 22, "B"),
            ],
          },
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_faraday", label: "Fem media por variación de flujo: ε = ΔΦ / Δt", level: 1,
      keywords: ["fem media", "variacion del flujo", "dphi/dt", "bobina"],
      make: (r) => {
        const c = pick(r, [{ p1: 0.015, p2: 0.045, dt: 0.20 }, { p1: 0.020, p2: 0.080, dt: 0.25 }, { p1: 0.010, p2: 0.040, dt: 0.40 }]);
        const emf = (c.p2 - c.p1) / c.dt;
        const pa = part("(a)", "Calcule la fem media inducida en la bobina.", [
          method("ε = ΔΦ / Δt", /Δ\s*Φ|ΔΦ|Δφ|Δ\s*phi|ΔΦ\/Δt/i, emf, "ε = ΔΦ/Δt"),
          val("A1", `ε = ${fmt(emf)} V`, emf),
        ], ["|ε| = ΔΦ / Δt", `ε = (${fmt(c.p2)} − ${fmt(c.p1)}) / ${fmt(c.dt)}`, `ε = ${fmt(emf)} V`]);
        pa.hints = [
          "Qué usar: la ley de Faraday: la fem es la variación de flujo dividida entre el tiempo.",
          "Para empezar: calcula ΔΦ = Φ final − Φ inicial.",
        ];
        const pb = part("(b)", "Calcule la fem media si el mismo cambio de flujo ocurre en la mitad de ese tiempo.", [
          val("A1", `ε = ${fmt(2 * emf)} V`, 2 * emf),
        ], [`ε = ΔΦ / (Δt / 2) = 2 × ${fmt(emf)} V`, `ε = ${fmt(2 * emf)} V`]);
        pb.hints = ["Piensa en cómo depende ε de Δt en ε = ΔΦ / Δt: ¿qué pasa si Δt se divide entre 2?"];
        return {
          stem: `El flujo magnético a través de una bobina cambia de ${fmt(c.p1, 2)} Wb a ${fmt(c.p2, 2)} Wb en ${fmt(c.dt, 2)} s.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_varilla_fem", label: "Fem de movimiento en una varilla: ε = BLv", level: 1,
      keywords: ["varilla", "fem de movimiento", "bLv", "rieles"],
      make: (r) => {
        const L = pick(r, [0.25, 0.35]), B = pick(r, [0.6, 0.8]), v = pick(r, [1.2, 1.8]);
        const emf = B * L * v;
        const pa = part("(a)", "Calcule la fem inducida entre los extremos de la varilla.", [
          method("ε = BLv", /B\s*L\s*v|BLv/i, emf, "ε = BLv"),
          val("A1", `ε = ${fmt(emf)} V`, emf),
        ], ["ε = B L v", `ε = ${fmt(B)} × ${fmt(L)} × ${fmt(v)}`, `ε = ${fmt(emf)} V`]);
        pa.hints = [
          "Qué usar: la fem de movimiento ε = B L v (B, L y v son perpendiculares entre sí).",
          "Para empezar: escribe B, L y v en unidades SI y multiplica.",
        ];
        const pb = part("(b)", "Indique cómo cambia la fem si la velocidad se duplica.", [
          reason("Se duplica: la fem es proporcional a v", "duplica", "duplica", "doble", "dobla", "se multiplica por 2", "proporcional"),
        ], ["ε = B L v es proporcional a v: si v se duplica, la fem se duplica"]);
        pb.hints = ["Mira la ecuación de la fem: ¿cómo aparece v en ella?"];
        return {
          stem: `Una varilla metálica de ${fmt(L, 2)} m se desliza sobre dos rieles con velocidad de ${fmt(v, 2)} m s⁻¹, perpendicular a un campo magnético uniforme de ${fmt(B, 2)} T.`,
          parts: [pa, pb],
        };
      },
    },
  ],
};
