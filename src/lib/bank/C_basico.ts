/**
 * Unit C · more questions (basico). See kit.ts. Concepts are added to the subtopics of
 * bank/C.ts by topic id (e.g. "C1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { C_LIGHT, f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Concept, type Fig } from "./kit.ts";

const PI = Math.PI;
const rad = (d: number) => (d * PI) / 180;
const deg = (r: number) => (r * 180) / PI;

export const extra: Record<string, Concept[]> = {
  C1: [
    {
      id: "b_periodo_frec", label: "Periodo y frecuencia (T = 1/f)", level: 1,
      keywords: ["periodo", "frecuencia", "t = 1/f", "oscilaciones"],
      make: (r) => {
        const n = pick(r, [20, 24, 30, 40, 60]), t = pick(r, [10, 12, 15, 20, 30]);
        const f = n / t, T = 1 / f;
        const pa = part("(a)", "Calcule la frecuencia de oscilación.", [
          method("f = número de oscilaciones / tiempo", /f\s*=|n\s*\/\s*t/i, f, "f = N / t"),
          val("A1", `f = ${fmt(f)} Hz`, f),
        ], [`f = N / t = ${n} / ${t}`, `f = ${fmt(f)} Hz`]);
        pa.hints = ["Qué usar: f = número de oscilaciones / tiempo.", "Para empezar: divide el número de oscilaciones entre el tiempo total, en segundos."];
        const pb = part("(b)", "Calcule el periodo de oscilación.", [
          method("T = 1 / f", /t\s*=\s*1\s*\/\s*f|1\s*\/\s*f/i, T, "T = 1/f"),
          val("A1", `T = ${fmt(T)} s`, T),
        ], [`T = 1 / f = 1 / ${fmt(f)}`, `T = ${fmt(T)} s`]);
        pb.hints = ["Qué usar: el periodo es el inverso de la frecuencia.", "Para empezar: usa la frecuencia de la parte (a)."];
        return {
          stem: `Un objeto que oscila con movimiento armónico simple completa ${n} oscilaciones en ${t} s.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_pendulo_T", label: "Periodo de un péndulo simple", level: 1,
      keywords: ["pendulo", "periodo del pendulo", "longitud del hilo", "T = 2π√(L/g)"],
      make: (r) => {
        const L = pick(r, [0.40, 0.50, 0.80, 1.0, 1.2]);
        const T = 2 * PI * Math.sqrt(L / g);
        const pa = part("(a)", "Indique la ecuación que relaciona el periodo T con la longitud L del hilo y con g.", [
          method("T = 2π√(L / g)", /2\s*π|2π|2\s*pi|√|sqrt/i, T, "T = 2π√(L/g)"),
        ], ["T = 2π √(L / g)"]);
        pa.hints = ["Qué usar: el periodo de un péndulo simple depende de la longitud del hilo y de g; busca la ecuación en la hoja de fórmulas."];
        const pb = part("(b)", "Calcule el periodo del péndulo.", [
          method("Sustituye L y g en T = 2π√(L / g)", /2\s*π|2π|2\s*pi|√|sqrt/i, T, "sustituir en T = 2π√(L/g)"),
          val("A1", `T = ${fmt(T)} s`, T),
        ], [`T = 2π √(${f2(L)} / 9,8)`, `T = ${fmt(T)} s`]);
        pb.hints = ["Qué usar: la ecuación del periodo de un péndulo simple, con L en metros y g de la pregunta.", "Para empezar: calcula primero el cociente L / g dentro de la raíz cuadrada."];
        return {
          stem: `Un péndulo simple tiene un hilo de ${f2(L)} m de longitud. Se separa un poco de la vertical, se suelta desde el reposo y oscila con movimiento armónico simple. Tome g = 9,8 m s⁻².`,
          parts: [pa, pb],
        };
      },
    },
  ],
  C2: [
    {
      id: "b_radio_lambda", label: "Longitud de onda de una onda de radio", level: 1,
      keywords: ["radio", "longitud de onda", "c = f lambda", "mhz"],
      make: (r) => {
        const fM = pick(r, [88, 100, 105, 150]);
        const f = fM * 1e6, lam = C_LIGHT / f;
        const pa = part("(a)", "Convierta la frecuencia de la emisora a hercios.", [
          val("A1", `f = ${fmt(f)} Hz`, f),
        ], [`f = ${fM} × 10⁶ Hz`, `f = ${fmt(f)} Hz`]);
        pa.hints = ["Qué usar: 1 MHz = 10⁶ Hz."];
        const pb = part("(b)", "Calcule la longitud de onda de la onda de radio. Use c = 3,00 × 10⁸ m s⁻¹.", [
          method("c = f λ", /c\s*=|f\s*[·×*]?\s*λ|λ\s*=\s*c/i, lam, "c = fλ"),
          val("A1", `λ = ${fmt(lam)} m`, lam),
        ], [`c = f λ, así que λ = c / f = 3,00 × 10⁸ / ${fmt(f)}`, `λ = ${fmt(lam)} m`]);
        pb.hints = ["Qué usar: c = f λ, despejando λ.", "Para empezar: usa la frecuencia en hercios de la parte (a)."];
        return {
          stem: `Una emisora de radio emite una onda electromagnética de frecuencia ${fM} MHz, que se propaga en el aire con la rapidez de la luz.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_periodo_lambda", label: "Frecuencia y rapidez de una onda a partir del periodo", level: 1,
      keywords: ["periodo", "v = f lambda", "rapidez de la onda", "longitud de onda"],
      make: (r) => {
        const T = pick(r, [0.25, 0.40, 0.50, 0.80]), lam = pick(r, [1.2, 2.0, 2.5, 3.0]);
        const f = 1 / T, v = f * lam;
        const pa = part("(a)", "Calcule la frecuencia de la onda.", [
          method("f = 1 / T", /f\s*=|1\s*\/\s*t/i, f, "f = 1/T"),
          val("A1", `f = ${fmt(f)} Hz`, f),
        ], [`f = 1 / T = 1 / ${f2(T)}`, `f = ${fmt(f)} Hz`]);
        pa.hints = ["Qué usar: f = 1 / T."];
        const pb = part("(b)", "Calcule la rapidez de propagación de la onda.", [
          method("v = f λ", /v\s*=|f\s*[·×*]?\s*λ/i, v, "v = fλ"),
          val("A1", `v = ${fmt(v)} m s⁻¹`, v),
        ], [`v = f λ = ${fmt(f)} × ${f2(lam)}`, `v = ${fmt(v)} m s⁻¹`]);
        pb.hints = ["Qué usar: v = f λ.", "Para empezar: usa la frecuencia que has calculado en la parte (a)."];
        return {
          stem: `Una onda en el agua tiene un periodo de ${f2(T)} s y una longitud de onda de ${f2(lam)} m.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  C3: [
    {
      id: "b_snell_angulo", label: "Ley de Snell con un ángulo", level: 1,
      keywords: ["snell", "refraccion", "n1 sin θ1 = n2 sin θ2", "angulo de refraccion"],
      make: (r) => {
        const t1 = pick(r, [30, 40, 50, 60]), n2 = pick(r, [1.33, 1.50, 1.52]);
        const t2 = deg(Math.asin(Math.sin(rad(t1)) / n2));
        // the rays are drawn at the real angles (from the normal, x = 160 at the surface y = 100)
        const fig: Fig = {
          w: 320, h: 200, alt: `Rayo que pasa del aire al vidrio con un ángulo de incidencia de ${t1}° y un ángulo de refracción, medidos respecto a la normal (línea de trazos)`,
          items: [
            { t: "line", x1: 20, y1: 100, x2: 300, y2: 100, w: 1.5 },
            { t: "text", x: 40, y: 92, s: "aire" },
            { t: "text", x: 40, y: 118, s: "vidrio" },
            { t: "line", x1: 160, y1: 20, x2: 160, y2: 180, dash: true, w: 1 },
            { t: "text", x: 175, y: 24, s: "normal", anchor: "start" },
            { t: "line", x1: 160 - 70 * Math.tan(rad(t1)), y1: 30, x2: 160, y2: 100, arrow: "end", w: 1.8 },
            { t: "line", x1: 160, y1: 100, x2: 160 + 70 * Math.tan(rad(t2)), y2: 170, arrow: "end", w: 1.8 },
            { t: "text", x: 160 - 30 * Math.tan(rad(t1)) - 22, y: 80, s: "θ₁" },
            { t: "text", x: 160 + 45 * Math.tan(rad(t2)) + 16, y: 150, s: "θ₂" },
          ],
        };
        const pa = part("(a)", "Indique la ley de Snell que relaciona los índices de refracción y los ángulos.", [
          method("n₁ sin θ₁ = n₂ sin θ₂", /sin|sen/i, t2, "n₁ sin θ₁ = n₂ sin θ₂"),
        ], ["n₁ sin θ₁ = n₂ sin θ₂"]);
        pa.hints = ["Qué usar: la ley de Snell, con un índice de refracción y un ángulo a cada lado de la superficie."];
        const pb = part("(b)", "Calcule el ángulo de refracción θ₂ en el vidrio.", [
          method("sin θ₂ = (n₁ / n₂) sin θ₁", /sin|sen/i, Math.sin(rad(t2)), "sin θ₂ = (n₁/n₂) sin θ₁"),
          val("A1", `θ₂ = ${fmt(t2)}°`, t2),
        ], [`sin θ₂ = (1,00 / ${fmt(n2)}) × sin ${t1}°`, `θ₂ = ${fmt(t2)}°`]);
        pb.hints = ["Qué usar: sin θ₂ = (n₁ / n₂) sin θ₁, con n₁ = 1,00 para el aire.", "Para empezar: calcula sin θ₁ con la calculadora y divídelo entre n₂ antes de tomar el arco seno."];
        return {
          fig,
          stem: `Un rayo de luz pasa del aire a un vidrio con un ángulo de incidencia θ₁ = ${t1}° respecto a la normal, como muestra la figura. El vidrio tiene un índice de refracción n₂ = ${fmt(n2)}; el del aire es 1,00.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_indice_luz", label: "Índice de refracción a partir de la rapidez de la luz", level: 1,
      keywords: ["indice de refraccion", "n = c / v", "rapidez de la luz", "vidrio"],
      make: (r) => {
        const v = pick(r, [2.00e8, 2.25e8, 2.40e8, 1.97e8]);
        const n = C_LIGHT / v;
        const pa = part("(a)", "Indique la ecuación que relaciona el índice de refracción n con la rapidez c de la luz en el vacío y la rapidez v en el medio.", [
          method("n = c / v", /n\s*=\s*c|c\s*\/\s*v/i, n, "n = c/v"),
        ], ["n = c / v"]);
        pa.hints = ["Qué usar: el índice de refracción es el cociente entre la rapidez en el vacío y la rapidez en el medio."];
        const pb = part("(b)", "Calcule el índice de refracción del vidrio.", [
          method("n = c / v", /c\s*\/\s*v|n\s*=\s*c/i, n, "n = c/v"),
          val("A1", `n = ${fmt(n)}`, n),
        ], [`n = c / v = 3,00 × 10⁸ / ${fmt(v)}`, `n = ${fmt(n)}`]);
        pb.hints = ["Qué usar: n = c / v, con c = 3,00 × 10⁸ m s⁻¹.", "Para empezar: sustituye la rapidez de la luz en el vidrio que da el enunciado."];
        return {
          stem: `La luz viaja por un vidrio con una rapidez de ${fmt(v)} m s⁻¹. La rapidez de la luz en el vacío es c = 3,00 × 10⁸ m s⁻¹.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  C4: [
    {
      id: "b_cuerda_fundamental", label: "Frecuencia fundamental de una cuerda fija", level: 1,
      keywords: ["cuerda", "fundamental", "lambda = 2L", "frecuencia fundamental"],
      make: (r) => {
        const L = pick(r, [0.40, 0.65, 0.75, 0.80]), v = pick(r, [80, 100, 120, 160]);
        const lam = 2 * L, f = v / lam;
        const pa = part("(a)", "Indique la longitud de onda del modo fundamental en función de L.", [
          method("λ = 2L", /2\s*[·×*]?\s*l\b/i, lam, "λ = 2L"),
        ], ["λ = 2L"]);
        pa.hints = ["Qué usar: en el modo fundamental, la cuerda tiene un solo vientre entre dos nodos fijos."];
        const pb = part("(b)", "Calcule la frecuencia fundamental de la cuerda.", [
          method("f = v / λ", /f\s*=\s*v|v\s*\/\s*(λ|2\s*[·×*]?\s*l)/i, f, "f = v/λ"),
          val("A1", `f = ${fmt(f)} Hz`, f),
        ], [`f = v / λ = ${v} / ${fmt(lam)}`, `f = ${fmt(f)} Hz`]);
        pb.hints = ["Qué usar: f = v / λ, con λ la longitud de onda de la parte (a).", "Para empezar: sustituye la rapidez de la onda y la longitud de onda en la ecuación."];
        return {
          stem: `Una cuerda de ${f2(L)} m de longitud está fija por sus dos extremos y vibra en su modo fundamental. Las ondas viajan por la cuerda con una rapidez de ${v} m s⁻¹.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_resonancia_expl", label: "Resonancia: qué ocurre con la amplitud", level: 1,
      keywords: ["resonancia", "frecuencia natural", "amplitud", "oscilacion forzada"],
      make: (r) => {
        const f0 = pick(r, [0.40, 0.50, 0.80]);
        const pa = part("(a)", "Defina la frecuencia natural del columpio.", [
          reason("Es la frecuencia con la que el columpio oscila cuando nadie lo empuja", "la frecuencia de oscilación sin empujes", "oscila libremente", "sin fuerza externa", "sin empujes", "sin forzar", "por si solo"),
        ], ["Es la frecuencia con la que el columpio oscila cuando nadie lo empuja (sin fuerza externa)."]);
        pa.hints = ["Qué usar: piensa en cómo oscila el columpio si lo sueltas y nadie lo empuja."];
        const pb = part("(b)", `Indique qué ocurre con la amplitud de oscilación si la frecuencia de los empujes se hace igual a ${f2(f0)} Hz.`, [
          reason("La amplitud es máxima: hay resonancia, y la energía se transfiere mejor", "la amplitud máxima (resonancia)", "maxima", "resonancia", "mayor", "aumenta", "grande"),
        ], ["La amplitud es máxima: se produce resonancia y el columpio recibe la energía de los empujes de forma más eficaz."]);
        pb.hints = ["Qué usar: el fenómeno que aparece cuando la frecuencia forzada coincide con la frecuencia natural."];
        return {
          stem: `Un columpio se comporta como un oscilador, con una frecuencia natural de ${f2(f0)} Hz. Una persona lo empuja periódicamente, y puede cambiar la frecuencia de sus empujes.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  C5: [
    {
      id: "b_ambulancia_R1", label: "Frecuencia que oye alguien al acercarse una ambulancia", level: 1,
      keywords: ["doppler", "ambulancia", "sirena", "se acerca", "frecuencia aumenta"],
      make: (r) => {
        const v = pick(r, [15, 20, 25, 30]);
        const pa = part("(a)", "Indique cómo cambia la frecuencia del sonido que percibe la persona mientras la ambulancia se acerca.", [
          reason("La frecuencia percibida aumenta (el tono se hace más agudo)", "que la frecuencia percibida aumenta", "aumenta", "mayor", "mas alta", "aguda", "incrementa", "sube"),
        ], ["La frecuencia percibida aumenta: el tono de la sirena se hace más agudo."]);
        pa.hints = ["Qué usar: el efecto Doppler; piensa si la persona oye más o menos ondas por segundo que la sirena emite."];
        const pb = part("(b)", "Explique por qué ocurre este cambio, en términos de las ondas sonoras.", [
          reason("Las crestas se juntan delante de la fuente: la longitud de onda disminuye", "que las ondas se comprimen delante de la fuente", "comprim", "juntas", "mas juntas", "menor longitud de onda", "longitud de onda disminuye", "se acortan"),
        ], ["Delante de la fuente las ondas se comprimen, se juntan más: la longitud de onda que llega al observador es menor, y la frecuencia es mayor."]);
        pb.hints = ["Qué usar: los frentes de onda se acercan entre sí delante de una fuente que se mueve hacia el observador."];
        return {
          stem: `Una ambulancia con la sirena encendida se acerca con velocidad constante de ${v} m s⁻¹ a una persona que está parada en la acera.`,
          parts: [pa, pb],
        };
      },
    },
    {
      id: "b_doppler_calc", label: "Frecuencia percibida por un observador (fuente que se acerca)", level: 1,
      keywords: ["doppler", "frecuencia percibida", "fuente en movimiento", "f = f0 v / (v - vs)"],
      make: (r) => {
        const f0 = pick(r, [500, 600, 700, 800]), vs = pick(r, [20, 30]), v = 340;
        const fo = (f0 * v) / (v - vs);
        const pa = part("(a)", "Indique la expresión de la frecuencia f que percibe el observador en reposo, en función de f₀, v y v_s.", [
          method("f = f₀ v / (v − v_s)", /v\s*[-−]\s*v/i, fo, "f = f₀ v / (v − v_s)"),
        ], ["f = f₀ v / (v − v_s)"]);
        pa.hints = ["Qué usar: el efecto Doppler para una fuente que se acerca a un observador en reposo; v_s es la rapidez de la fuente."];
        const pb = part("(b)", "Calcule la frecuencia que percibe el observador.", [
          val("A1", `f = ${fmt(fo)} Hz`, fo),
        ], [`f = ${f0} × 340 / (340 − ${vs})`, `f = ${fmt(fo)} Hz`]);
        pb.hints = ["Qué usar: la expresión de la parte (a), con v = 340 m s⁻¹.", "Para empezar: calcula primero v − v_s en el denominador."];
        return {
          stem: `Una fuente sonora emite un tono de ${f0} Hz y se mueve hacia un observador en reposo a ${vs} m s⁻¹. La rapidez del sonido en el aire es 340 m s⁻¹.`,
          parts: [pa, pb],
        };
      },
    },
  ],
};
