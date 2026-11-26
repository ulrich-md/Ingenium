/**
 * Unit A · more questions (basico). See kit.ts. Concepts are added to the subtopics of
 * bank/A.ts by topic id (e.g. "A1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, TOL, val, valAny, type Concept } from "./kit.ts";

export const extra: Record<string, Concept[]> = {
  A1: [
    {
      id: "b_rapidez", label: "Rapidez media y conversión a km h⁻¹", level: 1,
      keywords: ["rapidez media", "km/h", "v = d / t"],
      make: (r) => {
        const d = pick(r, [120, 160, 240, 300, 360, 450, 600]), t = pick(r, [10, 15, 20, 25, 30, 40, 50]);
        const v = d / t, vk = v * 3.6;
        const pa = part("(a)", "Calcule la rapidez media del atleta en m s⁻¹.", [
          method("Usa v = d / t", /d\s*\/\s*t|\/\s*t\b/i, v, "v = d / t"),
          val("A1", `v = ${fmt(v)} m s⁻¹`, v),
        ], ["v = d / t", `v = ${d} / ${t}`, `v = ${fmt(v)} m s⁻¹`]);
        pa.hints = ["Qué usar: la rapidez media es la distancia recorrida entre el tiempo empleado.", "Para empezar: escribe v = d / t y sustituye d en metros y t en segundos."];
        const pb = part("(b)", "Convierta esa rapidez a km h⁻¹.", [
          val("A1", `v = ${fmt(vk)} km h⁻¹`, vk),
        ], [`v × 3,6 = ${fmt(v)} × 3,6`, `v = ${fmt(vk)} km h⁻¹`]);
        pb.hints = ["Qué usar: el factor de conversión entre m s⁻¹ y km h⁻¹ (1 km = 1000 m y 1 h = 3600 s).", "Para empezar: multiplica la rapidez en m s⁻¹ por 3,6."];
        return { stem: `Un atleta recorre ${d} m en línea recta en ${t} s.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_distancia", label: "Distancia con rapidez constante (d = vt)", level: 1,
      keywords: ["d = vt", "rapidez constante", "distancia recorrida"],
      make: (r) => {
        const v = pick(r, [12, 15, 18, 20, 25]), t = pick(r, [10, 20, 30, 40, 60]);
        const d = v * t;
        const pa = part("(a)", "Indique la ecuación que relaciona la distancia d con la rapidez v y el tiempo t.", [
          method("Escribe d = vt", /v\s*[·×x*]?\s*t\b/i, d, "d = vt"),
        ], ["d = v t"]);
        pa.hints = ["Qué usar: la distancia es la rapidez por el tiempo.", "Para empezar: escribe la ecuación con d, v y t, sin números."];
        const pb = part("(b)", "Calcule la distancia recorrida en ese tiempo.", [
          val("A1", `d = ${fmt(d)} m`, d),
        ], [`d = v t = ${v} × ${t}`, `d = ${fmt(d)} m`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: sustituye v en m s⁻¹ y t en segundos."];
        return { stem: `Un tren de cercanías viaja en línea recta a ${v} m s⁻¹, con rapidez constante.`, parts: [pa, pb] };
      },
    },
  ],
  A2: [
    {
      id: "b_peso", label: "Masa y peso (W = mg)", level: 1,
      keywords: ["peso", "masa", "w = mg"],
      make: (r) => {
        const m = pick(r, [2.0, 3.5, 4.0, 5.5, 7.5, 12.0]);
        const W = m * g;
        const pa = part("(a)", "Indique la diferencia entre la masa y el peso del objeto.", [
          reason("Indica qué mide la masa y qué es el peso", "Diferencia masa y peso", "cantidad de materia", "fuerza gravitatoria", "fuerza de la gravedad"),
        ], ["La masa es la cantidad de materia (kg); el peso es la fuerza gravitatoria sobre el objeto (N)."]);
        pa.hints = ["Qué usar: piensa en las unidades de cada magnitud (kg y N).", "Para empezar: piensa si la masa cambia al cambiar de lugar y si el peso sí puede cambiar."];
        const pb = part("(b)", "Calcule el peso del objeto.", [
          method("Usa W = mg", /m\s*[×x*·]?\s*g\b/i, W, "W = mg"),
          val("A1", `W = ${fmt(W)} N`, W),
        ], ["W = m g", `W = ${f2(m)} × 9,8`, `W = ${fmt(W)} N`]);
        pb.hints = ["Qué usar: W = m g, con g = 9,8 m s⁻².", "Para empezar: sustituye la masa en kg y multiplica por 9,8."];
        return { stem: `Un objeto tiene una masa de ${f2(m)} kg en la superficie de la Tierra. Use g = 9,8 m s⁻².`, parts: [pa, pb] };
      },
    },
    {
      id: "b_momento", label: "Momento lineal p = mv", level: 1,
      keywords: ["momento lineal", "p = mv", "cantidad de movimiento"],
      make: (r) => {
        const m = pick(r, [0.2, 0.4, 0.5, 0.8, 1.5]), v = pick(r, [4, 6, 8, 12, 15]);
        const p = m * v;
        const pa = part("(a)", "Indique la ecuación del momento lineal p en función de la masa m y la velocidad v.", [
          method("Escribe p = mv", /p\s*=\s*m\s*v|mv|m\s*[×x*·]\s*v/i, p, "p = mv"),
        ], ["p = m v"]);
        pa.hints = ["Qué usar: el momento lineal depende de la masa y de la velocidad.", "Para empezar: es un producto, no una suma."];
        const pb = part("(b)", "Calcule el momento lineal de la pelota.", [
          val("A1", `p = ${fmt(p)} kg m s⁻¹`, p),
        ], ["p = m v", `p = ${f2(m)} × ${v}`, `p = ${fmt(p)} kg m s⁻¹`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: multiplica la masa en kg por la velocidad en m s⁻¹."];
        return { stem: `Una pelota de ${f2(m)} kg se mueve a ${v} m s⁻¹ en línea recta.`, parts: [pa, pb] };
      },
    },
  ],
  A3: [
    {
      id: "b_ec", label: "Energía cinética de un objeto", level: 1,
      keywords: ["energia cinetica", "½mv²", "energia del movimiento"],
      make: (r) => {
        const m = pick(r, [600, 900, 1200, 1500]), v = pick(r, [5, 8, 10, 12, 15, 20]);
        const Ek = 0.5 * m * v * v;
        const pa = part("(a)", "Indique la ecuación de la energía cinética de un objeto de masa m y rapidez v.", [
          method("Escribe Ek = ½mv²", /½\s*m\s*v|1\/2\s*m\s*v|0\.5\s*m\s*v/i, Ek, "Ek = ½mv²"),
        ], ["E_k = ½ m v²"]);
        pa.hints = ["Qué usar: la energía cinética depende de la masa y del cuadrado de la rapidez.", "Para empezar: la ecuación lleva un factor ½."];
        const pb = part("(b)", "Calcule la energía cinética del coche.", [
          val("A1", `E_k = ${fmt(Ek)} J`, Ek),
        ], ["E_k = ½ m v²", `E_k = ½ × ${m} × ${v}²`, `E_k = ${fmt(Ek)} J`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: eleva la rapidez al cuadrado antes de multiplicar."];
        return { stem: `Un coche de ${m} kg se mueve a ${v} m s⁻¹ en línea recta.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_trabajo", label: "Trabajo de una fuerza (W = Fd)", level: 1,
      keywords: ["trabajo", "w = fd", "fuerza por distancia"],
      make: (r) => {
        const F = pick(r, [20, 30, 40, 50, 60, 80]), d = pick(r, [2, 3, 4, 5, 8]);
        const W = F * d;
        const pa = part("(a)", "Indique la ecuación del trabajo realizado por una fuerza en la dirección del movimiento.", [
          method("Escribe W = Fd", /F\s*[×x*·]?\s*d\b|W\s*=\s*F/i, W, "W = Fd"),
        ], ["W = F d"]);
        pa.hints = ["Qué usar: el trabajo es la fuerza por la distancia recorrida en la dirección de la fuerza.", "Para empezar: usa W para el trabajo, F para la fuerza y d para la distancia."];
        const pb = part("(b)", "Calcule el trabajo realizado por la fuerza.", [
          val("A1", `W = ${fmt(W)} J`, W),
        ], ["W = F d", `W = ${F} × ${f2(d)}`, `W = ${fmt(W)} J`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: F en newtons y d en metros dan W en julios."];
        return {
          stem: `Un empujón horizontal de ${F} N desplaza una caja ${f2(d)} m por el suelo, en la misma dirección que la fuerza.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  A4: [
    {
      id: "b_torque", label: "Momento de una fuerza con una llave", level: 1,
      keywords: ["torque", "momento de una fuerza", "llave"],
      make: (r) => {
        const d = pick(r, [0.15, 0.2, 0.25, 0.3, 0.4]), F = pick(r, [40, 50, 60, 80, 120]);
        const tau = F * d;
        // the wrench: a handle of length d (drawn to scale), the force at its end, perpendicular to it
        const L = d * 400, x0 = 90, y0 = 110;
        const pa = part("(a)", "Indique la ecuación del momento de la fuerza respecto al eje de giro.", [
          method("Escribe τ = Fd", /F\s*[×x*·]?\s*d\b/i, tau, "τ = Fd"),
        ], ["τ = F d"]);
        pa.hints = ["Qué usar: el momento de una fuerza es la fuerza por la distancia perpendicular al eje.", "Para empezar: usa la letra griega τ (tau) para el momento."];
        const pb = part("(b)", "Calcule el momento de la fuerza respecto al eje de la tuerca.", [
          val("A1", `τ = ${fmt(tau)} N m`, tau),
        ], ["τ = F d", `τ = ${F} × ${f2(d)}`, `τ = ${fmt(tau)} N m`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: sustituye F en newtons y la distancia en metros."];
        const pc = part("(c)", "Explique por qué una llave más larga es más fácil de girar.", [
          reason("Relaciona el brazo con el momento", "Explica el efecto del brazo", "brazo", "distancia al eje", "palanca"),
        ], ["Un brazo mayor (distancia al eje) da un momento mayor con la misma fuerza."]);
        pc.hints = ["Qué usar: piensa en la distancia entre el eje y el punto donde se aplica la fuerza.", "Para empezar: compara dos llaves a las que se aplica la misma fuerza."];
        return {
          stem: `Se usa una llave para girar una tuerca. Una fuerza de ${F} N se aplica a ${f2(d)} m del eje de la tuerca, perpendicular a la llave.`,
          fig: {
            w: 360, h: 170, alt: `Llave de ${f2(d)} m con una fuerza de ${F} N perpendicular en su extremo`,
            items: [
              { t: "circle", cx: x0, cy: y0, r: 14, fill: "light" },
              { t: "line", x1: x0, y1: y0, x2: x0 + L, y2: y0, w: 4 },
              { t: "dot", x: x0, y: y0, r: 3 },
              { t: "line", x1: x0 + L, y1: y0 - 62, x2: x0 + L, y2: y0 - 4, arrow: "end", w: 1.6 },
              { t: "text", x: x0 + L + 8, y: y0 - 56, s: `F = ${F} N`, anchor: "start" },
              { t: "text", x: x0 + L / 2, y: y0 + 20, s: `d = ${f2(d)} m`, anchor: "middle" },
            ],
          },
          parts: [pa, pb, pc],
        };
      },
    },
    {
      id: "b_inercia", label: "Momento de inercia de una masa puntual", level: 1,
      keywords: ["momento de inercia", "masa puntual", "i = mr²"],
      make: (r) => {
        const m = pick(r, [0.5, 1.0, 1.5, 2.0]), rr = pick(r, [0.4, 0.5, 0.6, 0.8, 1.2]);
        const I = m * rr * rr;
        const pa = part("(a)", "Indique la ecuación del momento de inercia de una masa puntual m a una distancia r del eje.", [
          method("Escribe I = mr²", /m\s*r\s*(\^\s*2|²|2)/i, I, "I = mr²"),
        ], ["I = m r²"]);
        pa.hints = ["Qué usar: el momento de inercia depende de la masa y de la distancia al eje.", "Para empezar: la distancia entra en la ecuación elevada al cuadrado."];
        const pb = part("(b)", "Calcule el momento de inercia de la masa respecto al eje.", [
          val("A1", `I = ${fmt(I)} kg m²`, I),
        ], ["I = m r²", `I = ${f2(m)} × ${f2(rr)}²`, `I = ${fmt(I)} kg m²`]);
        pb.hints = ["Qué usar: la ecuación del apartado (a).", "Para empezar: sustituye m en kg y r en metros, y eleva r al cuadrado."];
        return {
          stem: `Una masa puntual de ${f2(m)} kg está unida a una varilla sin masa, a ${f2(rr)} m del eje de giro.`,
          parts: [pa, pb],
        };
      },
    },
  ],
  A5: [
    {
      id: "b_lorentz", label: "Factor de Lorentz", level: 1,
      keywords: ["factor de lorentz", "gamma", "γ"],
      make: (r) => {
        const v = pick(r, [0.6, 0.8]);
        const gam = 1 / Math.sqrt(1 - v * v);
        const pa = part("(a)", "Calcule el factor de Lorentz γ de la nave. Dé la respuesta con tres cifras significativas.", [
          method("Usa γ = 1 / √(1 − v²/c²)", /√|sqrt|v\s*\^?\s*2|v²/i, gam, "γ = 1 / √(1 − v²/c²)"),
          val("A1", `γ = ${fmt(gam)}`, gam),
        ], [
          "γ = 1 / √(1 − v²/c²)",
          `γ = 1 / √(1 − ${f2(v)}²)`,
          `γ = 1 / ${f2(Math.sqrt(1 - v * v))} = ${fmt(gam)}`,
        ]);
        pa.hints = ["Qué usar: la ecuación del factor de Lorentz, con v y c en las mismas unidades.", "Para empezar: calcula primero v²/c² con v en fracción de c."];
        const pb = part("(b)", "Indique si el factor de Lorentz puede ser menor que 1. Justifique.", [
          reason("Dice que γ no es menor que 1", "Justifica que γ es mayor o igual que 1", "mayor o igual", "mayor que 1", "nunca es menor", "no puede ser menor"),
        ], ["No: γ ≥ 1 siempre, porque 1 − v²/c² ≤ 1 y así γ es mayor o igual que 1."]);
        pb.hints = ["Qué usar: el signo de 1 − v²/c² cuando v es menor que c.", "Para empezar: piensa en la raíz de un número menor o igual que 1."];
        return { stem: `Una nave se mueve a ${f2(v)} c respecto a la Tierra, donde c es la rapidez de la luz en el vacío.`, parts: [pa, pb] };
      },
    },
    {
      id: "b_dilatacion", label: "Dilatación del tiempo en un reloj que viaja", level: 1,
      keywords: ["dilatacion del tiempo", "tiempo propio", "reloj en movimiento"],
      make: (r) => {
        const v = pick(r, [0.6, 0.8]), t0 = pick(r, [2.0, 4.0, 5.0, 8.0]);
        const gam = 1 / Math.sqrt(1 - v * v), dt = gam * t0;
        const pa = part("(a)", "Indique la ecuación que relaciona el tiempo Δt medido desde la Tierra con el tiempo propio Δt₀.", [
          method("Escribe Δt = γΔt₀", /γ|gamma|√/i, dt, "Δt = γΔt₀"),
        ], ["Δt = γ Δt₀"]);
        pa.hints = ["Qué usar: el tiempo propio es el medido con el reloj que está en el mismo lugar que los sucesos.", "Para empezar: el tiempo medido desde la Tierra es mayor, y se obtiene multiplicando por γ."];
        const pb = part("(b)", "Calcule el intervalo de tiempo Δt que mide un observador en la Tierra.", [
          val("A1", `Δt = ${fmt(dt)} s`, dt),
        ], ["Δt = γ Δt₀", `Δt = ${fmt(gam)} × ${f2(t0)}`, `Δt = ${fmt(dt)} s`]);
        pb.hints = ["Qué usar: el factor de Lorentz γ = 1 / √(1 − v²/c²) y la ecuación del apartado (a).", "Para empezar: calcula γ primero y luego multiplícalo por el tiempo propio."];
        const pc = part("(c)", "Explique por qué el observador en la Tierra mide un intervalo mayor que el reloj de la nave.", [
          reason("Dice que el reloj de la nave mide el tiempo propio", "Explica la dilatación del tiempo", "tiempo propio", "dilatacion del tiempo", "se dilata"),
        ], ["El reloj de la nave mide el tiempo propio. Por la dilatación del tiempo, el observador de la Tierra mide un intervalo mayor."]);
        pc.hints = ["Qué usar: quién está en el mismo lugar que los sucesos.", "Para empezar: compara el reloj de la nave con el reloj de la Tierra."];
        return {
          stem: `Un reloj viaja en una nave a ${f2(v)} c respecto a la Tierra (c es la rapidez de la luz en el vacío). Entre dos sucesos ocurridos en ese reloj transcurren ${f2(t0)} s.`,
          parts: [pa, pb, pc],
        };
      },
    },
  ],
};
