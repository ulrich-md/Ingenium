/**
 * Unit B · more questions (basico). See kit.ts. Concepts are added to the subtopics of
 * bank/B.ts by topic id (e.g. "B1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Concept, type Fig, type FigItem } from "./kit.ts";

const AR = (x1: number, y1: number, x2: number, y2: number, w = 1.6): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "end", w });
const TX = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle"): FigItem => ({ t: "text", x, y, s, anchor });
/** a decimal with a comma, without forcing digits: 0,5 · 2 · 0,025 */
const dec = (x: number) => String(x).replace(".", ",");

export const extra: Record<string, Concept[]> = {
  B1: [
    {
      id: "b_calentaragua", label: "Calentar agua: calor con Q = mcΔT", level: 1,
      keywords: ["q = mcδt", "calentar agua", "calor especifico"],
      make: (r) => {
        const m = pick(r, [0.5, 1.0, 1.5, 2.0]), T0 = pick(r, [15, 20, 25]), dT = pick(r, [20, 30, 40, 50]);
        const T1 = T0 + dT, Q = m * 4180 * dT;
        const pa = part("(a)", "Indique la ecuación que relaciona Q con m, c y ΔT.", [
          method("Escribe Q = m c ΔT", /q\s*=\s*m\s*c/i, Q, "Q = mcΔT"),
        ], ["Q = m c ΔT"], 2);
        pa.hints = [
          "Qué usar: el calor que recibe una masa que se calienta sin cambiar de fase es Q = m c ΔT.",
          "Para empezar: escriba la ecuación con sus símbolos y diga qué representa c (el calor específico).",
        ];
        const pb = part("(b)", "Calcule la energía térmica que recibe el agua.", [
          method("Sustituye m, c y ΔT", /4180|4,18|4\.18/i, Q, "sustitución de m, c y ΔT"),
          val("A1", `Q = ${fmt(Q)} J`, Q),
        ], [`Q = m c ΔT = ${f2(m)} × 4180 × ${dT}`, `Q = ${fmt(Q)} J`]);
        pb.hints = [
          "Qué usar: Q = m c ΔT, con c el dato del calor específico del agua que da el enunciado.",
          "Para empezar: ΔT es T₂ − T₁, y la diferencia de temperatura es la misma en °C que en K.",
        ];
        return {
          stem: `Se calientan ${f2(m)} kg de agua desde ${T0} °C hasta ${T1} °C, sin que cambie de fase. El calor específico del agua es 4180 J kg⁻¹ K⁻¹.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_calorarena", label: "Calor específico: arena frente a agua", level: 1,
      keywords: ["calor especifico", "arena", "agua", "mayor calor"],
      make: (r) => {
        const m = pick(r, [0.5, 1.0, 2.0]), E = pick(r, [20, 40, 60]);
        const pa = part("(a)", "Indique cuál de las dos sustancias tiene mayor calor específico.", [
          reason("El agua tiene mayor calor específico", "el agua, con mayor calor específico", "agua tiene mayor", "mayor calor especifico", "el agua"),
        ], ["El agua tiene mayor calor específico."], 2);
        pa.hints = [
          "Qué usar: el calor específico indica cuánta energía necesita 1 kg de una sustancia para subir 1 K.",
          "Para empezar: compare el valor del calor específico de la arena con el del agua.",
        ];
        const pb = part("(b)", "Explique por qué la arena sube más de temperatura que el agua.", [
          reason("Con menor calor específico, la arena sube más", "que la arena tiene menor calor específico", "menor calor", "calor especifico menor", "menos energia", "se calienta mas", "sube mas"),
        ], ["La arena tiene menor calor específico, así que la misma energía eleva más su temperatura."], 2);
        pb.hints = [
          "Qué usar: Q = m c ΔT. Si Q y m son iguales, ΔT es mayor cuando c es menor.",
          "Para empezar: piense qué le pasa a ΔT cuando c es pequeño y Q no cambia.",
        ];
        return {
          stem: `Una masa de ${f2(m)} kg de arena y otra masa igual de agua reciben la misma energía, ${E} kJ, del Sol durante una tarde.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  B2: [
    {
      id: "b_albedo", label: "Albedo: potencia reflejada y absorbida", level: 1,
      keywords: ["albedo", "reflejada", "absorbida", "fraccion reflejada"],
      make: (r) => {
        const E = pick(r, [200, 240, 300, 320]), a = pick(r, [0.2, 0.25, 0.3, 0.4]);
        const Pr = a * E, Pa = (1 - a) * E;
        const pa = part("(a)", "Calcule la potencia reflejada por cada metro cuadrado de la superficie.", [
          method("Potencia reflejada = albedo × irradiancia", /albedo|alfa|α/i, Pr, "P = αI"),
          val("A1", `P reflejada = ${fmt(Pr)} W m⁻²`, Pr),
        ], ["P_refl = α × I", `P_refl = ${f2(a)} × ${E} = ${fmt(Pr)} W m⁻²`]);
        pa.hints = [
          "Qué usar: el albedo es la fracción de la radiación incidente que la superficie refleja.",
          "Para empezar: multiplique el albedo por la irradiancia que da el enunciado.",
        ];
        const pb = part("(b)", "Calcule la potencia absorbida por cada metro cuadrado de la superficie.", [
          method("Potencia absorbida = (1 − albedo) × irradiancia", /absorb|1\s*[-−]\s*(α|albedo)/i, Pa, "P = (1 − α)I"),
          val("A1", `P absorbida = ${fmt(Pa)} W m⁻²`, Pa),
        ], ["P_abs = (1 − α) × I", `P_abs = (1 − ${f2(a)}) × ${E} = ${fmt(Pa)} W m⁻²`]);
        pb.hints = [
          "Qué usar: lo que no se refleja se absorbe, así que la fracción absorbida es 1 − albedo.",
          "Para empezar: multiplique esa fracción por la irradiancia del enunciado.",
        ];
        const fig: Fig = {
          w: 320, h: 190, alt: "Superficie horizontal iluminada por el Sol: parte de la radiación incidente se refleja hacia arriba",
          items: [
            { t: "ground", x1: 40, y1: 140, x2: 280, y2: 140, side: 1 },
            AR(100, 30, 100, 130), AR(200, 30, 200, 130),
            AR(100, 130, 125, 60), AR(200, 130, 225, 60),
            TX(160, 20, "radiación solar"),
            TX(240, 48, "reflejada", "start"),
            TX(160, 172, "superficie"),
          ],
        };
        return {
          stem: `Una superficie recibe una irradiancia solar de ${E} W m⁻². Su albedo es ${f2(a)}: refleja esa fracción de la radiación que le llega.`,
          fig,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_invernadero", label: "Invernadero: radiación visible e infrarroja", level: 1,
      keywords: ["invernadero", "infrarroja", "onda larga", "efecto invernadero"],
      make: (r) => {
        const E = pick(r, [400, 500, 600, 700]);
        const pa = part("(a)", "Indique qué tipo de radiación del Sol atraviesa el vidrio.", [
          reason("Radiación visible o de onda corta", "la radiacion visible, de onda corta", "visible", "onda corta", "luz"),
        ], ["La radiación visible, de onda corta, atraviesa el vidrio."], 2);
        pa.hints = [
          "Qué usar: el vidrio deja pasar la luz visible del Sol.",
          "Para empezar: recuerde qué tipo de onda es la luz visible.",
        ];
        const pb = part("(b)", "Explique por qué el calor queda atrapado dentro del invernadero.", [
          reason("El suelo emite radiación infrarroja", "el suelo emite infrarroja o de onda larga", "infrarroja", "onda larga", "terrestre"),
          reason("El vidrio absorbe y retiene esa radiación", "el vidrio la absorbe y la retiene", "absorbe", "retiene", "atrapa", "no deja salir", "no sale"),
        ], ["El suelo emite radiación infrarroja (onda larga).", "El vidrio absorbe esa radiación y la retiene dentro."], 3);
        pb.hints = [
          "Qué usar: el suelo caliente emite un tipo de radiación distinto del que llega del Sol.",
          "Para empezar: piense si el vidrio deja escapar esa radiación de salida.",
        ];
        return {
          stem: `Un invernadero de vidrio recibe ${E} W m⁻² de radiación solar al mediodía.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  B3: [
    {
      id: "b_pvnrt", label: "Gas ideal: presión con pV = nRT", level: 1,
      keywords: ["gas ideal", "pv = nrt", "presion del gas", "kelvin"],
      make: (r) => {
        const n = pick(r, [0.2, 0.25, 0.4, 0.5]), V = pick(r, [0.02, 0.025, 0.04]), th = pick(r, [27, 47, 57, 77]);
        const T = th + 273, p = (n * 8.31 * T) / V;
        const pa = part("(a)", `Convierta ${th} °C a kelvin.`, [val("A1", `T = ${T} K`, T)], [`T = ${th} + 273 = ${T} K`], 2);
        pa.hints = [
          "Qué usar: para pasar de grados Celsius a kelvin se suma 273 a la temperatura.",
          "Para empezar: escriba T = θ + 273 y sustituya θ del enunciado.",
        ];
        const pb = part("(b)", "Calcule la presión del gas, en pascales.", [
          method("Use pV = nRT", /pv\s*=\s*nrt|p\s*=\s*nrt/i, p, "pV = nRT"),
          val("A1", `p = ${fmt(p)} Pa`, p),
        ], ["pV = nRT", `p = nRT / V = ${dec(n)} × 8,31 × ${T} / ${dec(V)}`, `p = ${fmt(p)} Pa`]);
        pb.hints = [
          "Qué usar: pV = nRT, con R = 8,31 J K⁻¹ mol⁻¹ y T en kelvin.",
          "Para empezar: despeje p, use la T de la parte (a) y los valores de n y V del enunciado.",
        ];
        return {
          stem: `Un gas ideal de ${dec(n)} mol ocupa ${dec(V)} m³ a ${th} °C.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_presion", label: "Presión: fuerza sobre un área", level: 1,
      keywords: ["presion", "p = f/a", "newton por metro cuadrado", "pascal"],
      make: (r) => {
        const F = pick(r, [300, 450, 600, 800]), A = pick(r, [0.2, 0.25, 0.3, 0.5]);
        const P = F / A;
        const fig: Fig = {
          w: 320, h: 200, alt: "Bloque apoyado sobre una superficie horizontal, con una fuerza F perpendicular a la superficie",
          items: [
            { t: "ground", x1: 60, y1: 150, x2: 260, y2: 150, side: 1 },
            { t: "rect", x: 120, y: 100, w: 120, h: 50, fill: "light" },
            AR(180, 30, 180, 98),
            TX(196, 62, "F", "start"),
            { t: "line", x1: 120, y1: 166, x2: 240, y2: 166, arrow: "both", w: 1.2 },
            TX(180, 186, "área de contacto A"),
          ],
        };
        const pa = part("(a)", "Indique la ecuación que relaciona la presión p con la fuerza F y el área A.", [
          method("Escribe p = F / A", /p\s*=\s*f\s*\/\s*a/i, P, "p = F/A"),
        ], ["p = F / A"], 2);
        pa.hints = [
          "Qué usar: la presión es la fuerza perpendicular dividida entre el área de contacto.",
          "Para empezar: escriba p con su ecuación y diga qué unidad tiene la presión.",
        ];
        const pb = part("(b)", "Calcule la presión que ejerce el bloque sobre la superficie, en pascales.", [
          val("A1", `p = ${fmt(P)} Pa`, P),
        ], [`p = ${F} / ${dec(A)}`, `p = ${fmt(P)} Pa`]);
        pb.hints = [
          "Qué usar: p = F / A, con F en newton y A en metros cuadrados.",
          "Para empezar: sustituya F y A del enunciado; el resultado sale en N m⁻², es decir en Pa.",
        ];
        const pc = part("(c)", "Exprese la presión en kilopascales.", [
          val("A1", `p = ${fmt(P / 1000)} kPa`, P / 1000),
        ], [`p = ${fmt(P)} Pa = ${fmt(P / 1000)} kPa`]);
        pc.hints = [
          "Qué usar: un kilopascal equivale a mil pascales; divida entre mil.",
        ];
        return {
          stem: `Un bloque ejerce una fuerza perpendicular de ${F} N sobre una superficie. El área de contacto es de ${dec(A)} m².`,
          fig,
          parts: [pa, pb, pc],
        };
      },
    },
  ],
  B4: [
    {
      id: "b_primeraley", label: "Primera ley: ΔU = Q − W con números", level: 1,
      keywords: ["primera ley", "energia interna", "q = δu + w", "variacion de energia interna"],
      make: (r) => {
        const qh = pick(r, [400, 500, 600, 800]), wk = pick(r, [120, 150, 250]), dU = qh - wk;
        const pa = part("(a)", "Indique la ecuación de la primera ley de la termodinámica, con los símbolos Q, ΔU y W.", [
          method("Escribe Q = ΔU + W", /q\s*=\s*(δ|Δ|∆|delta)?\s*u\s*\+\s*w/i, qh, "Q = ΔU + W"),
        ], ["Q = ΔU + W"], 2);
        pa.hints = [
          "Qué usar: la primera ley relaciona el calor que entra con el cambio de energía interna y el trabajo.",
          "Para empezar: Q es el calor que entra al gas y W es el trabajo que el gas realiza.",
        ];
        const pb = part("(b)", "Calcule la variación de la energía interna del gas.", [
          method("Sustituya en ΔU = Q − W", /[-−]\s*w|q\s*[-−]/i, qh, "ΔU = Q − W"),
          val("A1", `ΔU = ${fmt(dU)} J`, dU),
        ], ["ΔU = Q − W", `ΔU = ${qh} − ${wk} = ${fmt(dU)} J`]);
        pb.hints = [
          "Qué usar: despeje ΔU de la ecuación de la parte (a), recordando que W es trabajo realizado por el gas.",
          "Para empezar: el trabajo que hace el gas se resta del calor que recibe.",
        ];
        return {
          stem: `Un gas recibe ${qh} J de energía como calor desde su entorno y, al expandirse, realiza un trabajo de ${wk} J sobre el entorno.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_trabajo", label: "Trabajo a presión constante: W = pΔV", level: 1,
      keywords: ["trabajo del gas", "w = pδv", "presion constante", "expansion"],
      make: (r) => {
        const p = pick(r, [100, 150, 200, 250]), V1 = pick(r, [2, 3, 4]), V2 = V1 + pick(r, [2, 3]);
        const dV = (V2 - V1) * 1e-3, W = p * (V2 - V1);
        const fig: Fig = {
          w: 320, h: 210, alt: "Gas encerrado en un cilindro con un pistón móvil que sube al expandirse a presión constante",
          items: [
            { t: "poly", pts: [80, 60, 80, 170, 240, 170, 240, 60], w: 1.6 },
            { t: "rect", x: 80, y: 60, w: 160, h: 10, fill: "dark" },
            AR(200, 58, 200, 32),
            TX(160, 20, "pistón móvil"),
            TX(160, 130, "gas"),
            TX(160, 196, "presión p constante"),
          ],
        };
        const pa = part("(a)", "Calcule la variación de volumen del gas, en m³.", [
          val("A1", `ΔV = ${fmt(dV)} m³`, dV),
        ], [`ΔV = (${dec(V2)} − ${dec(V1)}) dm³ = ${dec(V2 - V1)} dm³`, `ΔV = ${fmt(dV)} m³`]);
        pa.hints = [
          "Qué usar: ΔV = V₂ − V₁, con los volúmenes en dm³.",
          "Para empezar: un decímetro cúbico es la milésima parte de un metro cúbico.",
        ];
        const pb = part("(b)", "Calcule el trabajo realizado por el gas durante la expansión.", [
          method("Use W = pΔV", /w\s*=\s*p\s*(δ|Δ|∆|delta)?\s*v/i, W, "W = pΔV"),
          val("A1", `W = ${fmt(W)} J`, W),
        ], ["W = p ΔV", `W = (${fmt(p * 1000)} Pa) × ${fmt(dV)} m³`, `W = ${fmt(W)} J`]);
        pb.hints = [
          "Qué usar: a presión constante, el trabajo es W = pΔV; use p en pascales y ΔV en m³.",
          "Para empezar: pase la presión de kilopascales a pascales multiplicando por mil.",
        ];
        return {
          stem: `Un gas se mantiene a presión constante de ${p} kPa mientras se expande desde ${dec(V1)} dm³ hasta ${dec(V2)} dm³.`,
          fig,
          parts: [pa, pb],
        };
      },
    },
  ],
  B5: [
    {
      id: "b_corriente", label: "Corriente: I = Q / t", level: 1,
      keywords: ["corriente", "carga", "i = q/t", "amperio"],
      make: (r) => {
        const Q = pick(r, [120, 180, 300, 450, 600]), tm = pick(r, [2, 3, 4, 5]), ts = tm * 60, I = Q / ts;
        const fig: Fig = {
          w: 320, h: 200, alt: "Circuito con una pila y un amperímetro en serie; la corriente I recorre el circuito en sentido horario",
          items: [
            { t: "line", x1: 60, y1: 60, x2: 260, y2: 60, w: 1.6 },
            { t: "line", x1: 260, y1: 60, x2: 260, y2: 160, w: 1.6 },
            { t: "line", x1: 260, y1: 160, x2: 60, y2: 160, w: 1.6 },
            { t: "line", x1: 60, y1: 160, x2: 60, y2: 60, w: 1.6 },
            { t: "comp", kind: "ammeter", x1: 120, y1: 60, x2: 200, y2: 60, label: "A" },
            { t: "comp", kind: "cell", x1: 60, y1: 150, x2: 60, y2: 70 },
            AR(260, 90, 260, 130),
            TX(276, 112, "I", "start"),
          ],
        };
        const pa = part("(a)", "Convierta el tiempo a segundos.", [
          val("A1", `t = ${ts} s`, ts),
        ], [`t = ${tm} min × 60 s/min`, `t = ${ts} s`]);
        pa.hints = [
          "Qué usar: multiplique los minutos por sesenta para obtener segundos.",
        ];
        const pb = part("(b)", "Calcule la corriente que pasa por el amperímetro.", [
          method("Use I = Q / t", /i\s*=\s*q\s*\/\s*t/i, I, "I = Q/t"),
          val("A1", `I = ${fmt(I)} A`, I),
        ], ["I = Q / t", `I = ${Q} / ${ts} = ${fmt(I)} A`]);
        pb.hints = [
          "Qué usar: I = Q / t, con t en segundos.",
          "Para empezar: use el tiempo de la parte (a) y la carga Q del enunciado.",
        ];
        return {
          stem: `En el circuito de la figura, una carga de ${Q} C pasa por el amperímetro durante ${tm} min.`,
          fig,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_ohm", label: "Ley de Ohm: V = IR y potencia", level: 1,
      keywords: ["ley de ohm", "v = ir", "potencia", "resistor"],
      make: (r) => {
        const R = pick(r, [4, 6, 8, 12]), I = pick(r, [0.5, 0.75, 1.5, 2.0]), V = I * R, P = V * I;
        const fig: Fig = {
          w: 320, h: 200, alt: "Circuito con una pila y un resistor en serie; la corriente I circula en el sentido indicado",
          items: [
            { t: "line", x1: 60, y1: 60, x2: 260, y2: 60, w: 1.6 },
            { t: "line", x1: 260, y1: 60, x2: 260, y2: 160, w: 1.6 },
            { t: "line", x1: 260, y1: 160, x2: 60, y2: 160, w: 1.6 },
            { t: "line", x1: 60, y1: 160, x2: 60, y2: 60, w: 1.6 },
            { t: "comp", kind: "resistor", x1: 120, y1: 60, x2: 200, y2: 60, label: `${R} Ω` },
            { t: "comp", kind: "cell", x1: 60, y1: 150, x2: 60, y2: 70 },
            AR(260, 90, 260, 130),
            TX(276, 112, "I", "start"),
          ],
        };
        const pa = part("(a)", "Calcule la diferencia de potencial entre los extremos del resistor.", [
          method("Use V = IR", /v\s*=\s*i\s*r|v\s*=\s*ir|i\s*[×x*]\s*r/i, V, "V = IR"),
          val("A1", `V = ${fmt(V)} V`, V),
        ], ["V = I R", `V = ${dec(I)} × ${R} = ${fmt(V)} V`]);
        pa.hints = [
          "Qué usar: V = I R, con I la corriente del enunciado y R la resistencia del resistor.",
          "Para empezar: sustituya los dos valores del enunciado en la ecuación.",
        ];
        const pb = part("(b)", "Calcule la potencia disipada en el resistor.", [
          method("Use P = VI", /p\s*=\s*v\s*i/i, P, "P = VI"),
          val("A1", `P = ${fmt(P)} W`, P),
        ], ["P = V I", `P = ${fmt(V)} × ${dec(I)} = ${fmt(P)} W`]);
        pb.hints = [
          "Qué usar: P = V I, con el V que calculó en la parte (a).",
          "Para empezar: sustituya V y la corriente I del enunciado.",
        ];
        return {
          stem: `Un resistor de ${R} Ω está conectado a una pila de resistencia interna despreciable. La corriente que pasa por el resistor es ${dec(I)} A.`,
          fig,
          parts: [pa, pb],
        };
      },
    },
  ],
};
