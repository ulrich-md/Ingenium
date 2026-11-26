/**
 * Unit B · more questions (intermedio y examen). See kit.ts. Concepts are added to the
 * subtopics of bank/B.ts by topic id (e.g. "B1").
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Rule } from "../check.ts";
import { f2, fmt, G, g, hasAny, method, near, normalize, part, pick, PLANETS, reason, SIGMA, R_GAS, TOL, val, valAny, type Concept, type FigItem } from "./kit.ts";

const txt = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle", size?: number): FigItem => ({ t: "text", x, y, s, anchor, size });
/** maps data coordinates of a graph FigItem to figure coordinates */
const gmap = (x: number, y: number, w: number, h: number, xr: [number, number], yr: [number, number]) => ({
  X: (v: number) => x + ((v - xr[0]) / (xr[1] - xr[0])) * w,
  Y: (v: number) => y + h - ((v - yr[0]) / (yr[1] - yr[0])) * h,
});
/** A1 for a factor or ratio: the number, or one of the ways of writing it as a fraction */
const fac = (text: string, f: number, ...res: RegExp[]): Rule => ({
  code: "A1", text, miss: "A1",
  test: (l, n) => near(n, f, 0.04) || res.some((re) => re.test(l) || re.test(normalize(l))),
});

export const extra: Record<string, Concept[]> = {
  /* ------------------------------------------------------------------ B.1 */
  B1: [
    {
      id: "x_bloqueheater", level: 2, label: "Calor específico con un calefactor y una gráfica θ–t", keywords: ["calor especifico", "calefactor", "grafica temperatura tiempo", "perdidas de energia"],
      make: (r) => {
        const [P, m, dth] = pick(r, [[60, 0.5, 30], [100, 1.0, 30], [100, 1.2, 20], [120, 1.2, 30], [80, 1.0, 20]] as const);
        const th0 = 20, t1 = 300, s = dth / t1, c = (P * t1) / (m * dth), cacc = 900;
        const xr: [number, number] = [0, 360], yr: [number, number] = [0, 60];
        return {
          fig: {
            w: 360, h: 210, alt: `Gráfica de la temperatura de un bloque frente al tiempo: recta que sube desde ${th0} °C hasta ${th0 + dth} °C en ${t1} s`,
            items: [{ t: "graph", x: 55, y: 22, w: 275, h: 145, xr, yr, xlabel: "t / s", ylabel: "θ / °C", xticks: [60, 120, 180, 240, 300], yticks: [10, 20, 30, 40, 50], grid: true, series: [{ pts: [[0, th0], [t1, th0 + dth]] }, { pts: [[0, th0], [t1, th0 + dth]], dots: true }] }],
          },
          stem: `Un bloque de aluminio de masa ${fmt(m)} kg se calienta con un calefactor eléctrico de potencia ${P} W introducido en él. La gráfica muestra cómo cambia la temperatura del bloque con el tiempo.`,
          data: `Valor aceptado del calor específico del aluminio: ${cacc} J kg⁻¹ K⁻¹`,
          parts: [
            part("(a)", "Use la gráfica para determinar la rapidez con que aumenta la temperatura del bloque, en K s⁻¹.", [
              method("Gradiente = Δθ / Δt", /Δθ|Δ\s*θ|gradiente|pendiente|Δt/i, dth, "gradiente de la gráfica"),
              val("A1", `Δθ/Δt = ${fmt(s)} K s⁻¹`, s),
            ], [`Gradiente = Δθ / Δt = (${th0 + dth} − ${th0}) / (${t1} − 0)`, `Δθ/Δt = ${fmt(s)} K s⁻¹`]),
            part("(b)", "Suponga que toda la energía del calefactor pasa al bloque. Calcule el calor específico del aluminio que resulta.", [
              method("P = m c Δθ / Δt (o Q = P t = m c Δθ)", /mcΔθ|m\s*c\s*Δ|Q\s*=\s*P\s*t|P\s*=\s*m\s*c/i, P * t1, "energía = m c Δθ"),
              val("A1", `c = ${fmt(c)} J kg⁻¹ K⁻¹`, c),
            ], [`P = m c (Δθ/Δt)`, `c = P / (m × Δθ/Δt) = ${P} / (${fmt(m)} × ${fmt(s)})`, `c = ${fmt(c)} J kg⁻¹ K⁻¹`]),
            part("(c)", "El valor obtenido es mayor que el aceptado. Sugiera una razón.", [
              reason("Parte de la energía se pierde hacia el entorno, así que el bloque recibe menos de la que se supone", "pérdida de energía al entorno", "perd", "pierde", "entorno", "ambiente", "disipa", "no toda", "no pasa toda"),
            ], ["Parte de la energía del calefactor se pierde al ambiente: el bloque recibe menos energía que P t, y por eso el cálculo da un c demasiado grande"]),
          ],
        };
      },
    },
  ],
  /* ------------------------------------------------------------------ B.2 */
  B2: [
    {
      id: "x_planetaT", level: 2, label: "Intensidad solar, albedo y temperatura de un planeta", keywords: ["temperatura de equilibrio", "albedo", "intensidad solar", "luminosidad"],
      make: (r) => {
        const [nm, d] = pick(r, [["Venus", 1.08e11], ["la Tierra", 1.50e11], ["Marte", 2.28e11]] as const);
        const alb = pick(r, [0.25, 0.30, 0.35]), L = 3.83e26;
        const S = L / (4 * Math.PI * d * d), Iabs = (S * (1 - alb)) / 4, T = Math.pow(Iabs / SIGMA, 0.25);
        return {
          stem: `El Sol tiene una luminosidad de ${fmt(L)} W. ${nm[0].toUpperCase() + nm.slice(1)} orbita a ${fmt(d)} m del Sol y tiene un albedo medio de ${fmt(alb)}. Trate al planeta como un cuerpo negro que emite como una esfera y no tenga en cuenta la atmósfera.`,
          parts: [
            part("(a)", `Calcule la intensidad de la radiación solar que llega a ${nm}.`, [
              method("I = L / (4πd²)", /4\s*π|L\s*\/\s*\(?4|4πd/i, S, "intensidad = L / 4πd²"),
              val("A1", `S = ${fmt(S)} W m⁻²`, S),
            ], ["S = L / (4π d²)", `S = ${fmt(L)} / (4π × (${fmt(d)})²)`, `S = ${fmt(S)} W m⁻²`]),
            part("(b)", `Determine la temperatura media de equilibrio de ${nm}.`, [
              method("Potencia absorbida por unidad de área de la superficie: S(1 − α)/4 = σT⁴", /\(\s*1\s*[−-]\s*α\s*\)|σ\s*T|T\^4|T⁴/i, Iabs, "S(1 − α)/4 = σT⁴"),
              val("A1", `T = ${fmt(T)} K`, T),
            ], [`En equilibrio: potencia absorbida = potencia emitida`, `σ T⁴ = S (1 − α) / 4 = ${fmt(S)} × ${fmt(1 - alb)} / 4 = ${fmt(Iabs)} W m⁻²`, `T = (${fmt(Iabs)} / ${fmt(SIGMA)})^¼ = ${fmt(T)} K`]),
            part("(c)", "Explique por qué en la expresión de la intensidad media absorbida aparece el factor 1/4.", [
              reason("El planeta intercepta la radiación con su sección de disco (πR²) pero emite con toda su superficie esférica (4πR²): la razón de áreas es 1/4", "πR² frente a 4πR²", "4πr", "superficie", "esfera", "disco", "seccion", "area", "área"),
            ], ["La radiación solar es interceptada por un disco de área πR², mientras que la emisión sale de toda la esfera, de área 4πR²; por eso el promedio es S/4"]),
          ],
        };
      },
    },
    {
      id: "x_planetasrazon", level: 3, label: "Distancia, intensidad y temperatura: razones y albedo", keywords: ["distancia al sol", "razon de intensidades", "albedo", "temperatura de equilibrio", "muestre que"],
      make: (r) => {
        const d = pick(r, [1.08e11, 1.50e11, 2.28e11]), k = pick(r, [2, 3]), L = 3.83e26;
        const S = L / (4 * Math.PI * d * d), fI = 1 / (k * k), fT = Math.pow(k, -0.5);
        const x0 = 48, xa = x0 + 80, xb = x0 + 80 * k;
        return {
          fig: {
            w: 380, h: 150, alt: `Una estrella y dos planetas alineados: el planeta A a una distancia d de la estrella y el planeta B a una distancia ${k}d`,
            items: [
              { t: "circle", cx: x0, cy: 70, r: 16, fill: "light" }, txt(x0, 108, "estrella"), txt(x0, 124, "(luminosidad L)"),
              { t: "circle", cx: xa, cy: 70, r: 6, fill: "dark" }, txt(xa, 56, "A"),
              { t: "circle", cx: xb, cy: 70, r: 8, fill: "dark" }, txt(xb, 54, "B"),
              { t: "line", x1: x0 + 16, y1: 92, x2: xa, y2: 92, arrow: "both" }, txt((x0 + xa) / 2 + 8, 108, "d"),
              { t: "line", x1: xa + 6, y1: 84, x2: xa + 6, y2: 96, gray: true },
              { t: "line", x1: x0, y1: 140, x2: xb, y2: 140, arrow: "both" }, txt((x0 + xb) / 2, 134, `${k}d`),
              { t: "line", x1: x0, y1: 88, x2: x0, y2: 142, gray: true }, { t: "line", x1: xb, y1: 78, x2: xb, y2: 142, gray: true },
            ],
          },
          stem: `Una estrella de luminosidad L = ${fmt(3.83e26)} W tiene dos planetas, A y B, en órbitas circulares. El planeta A orbita a una distancia d = ${fmt(d)} m y el planeta B a ${k}d. Ambos tienen el mismo albedo.`,
          parts: [
            part("(a)", `Muestre que la intensidad de la radiación de la estrella que llega al planeta A es de aproximadamente ${fmt(S)} W m⁻².`, [
              method("I = L / (4πd²)", /4\s*π|L\s*\/\s*\(?4|4πd/i, S, "intensidad = L / 4πd²"),
              val("A1", `S = ${fmt(S)} W m⁻²`, S),
            ], ["S = L / (4π d²)", `S = ${fmt(L)} / (4π × (${fmt(d)})²) = ${fmt(S)} W m⁻²`]),
            part("(b)", "Deduzca la intensidad que llega al planeta B, en función de S.", [
              fac(`I_B = S / ${k * k} = ${fmt(fI)} S`, fI, new RegExp(`\\/\\s*${k * k}(?!\\d)`), new RegExp(`1\\s*\\/\\s*${k * k}(?!\\d)`), new RegExp(`\\b${k * k}\\s*veces\\s*menor`, "i")),
            ], [`La intensidad es inversamente proporcional a d²: I_B = S × (d / ${k}d)²`, `I_B = S / ${k * k} = ${fmt(fI)} S`]),
            part("(c)", "Deduzca la razón T_B / T_A entre las temperaturas de equilibrio de los dos planetas.", [
              method("Con el mismo albedo, σT⁴ es proporcional a la intensidad: T ∝ I^¼", /\^\s*\(?1\s*\/\s*4|T\^4|T⁴|∝|\(\s*1\s*\/\s*\d+\s*\)\s*\^|√|cuarta|ra[ií]z/i, fT, "σT⁴ proporcional a I"),
              fac(`T_B / T_A = ${fmt(fT)}`, fT, new RegExp(`1\\s*\\/\\s*√\\s*${k}(?!\\d)`), new RegExp(`√\\s*${k}\\s*\\)?\\s*\\/\\s*${k}`)),
            ], ["En equilibrio σT⁴ = I (1 − α) / 4, y con el mismo albedo T⁴ ∝ I", `T_B / T_A = (I_B / S)^¼ = (1 / ${k * k})^¼ = ${fmt(fT)}`]),
            part("(d)", "El hielo del planeta A se derrite y su albedo disminuye. Explique cómo cambia la temperatura de equilibrio de A.", [
              reason("Con menor albedo el planeta refleja menos y absorbe más radiación", "menos reflexión, más absorción", "refleja menos", "absorbe mas", "absorbe más", "mayor absorcion", "mas energia", "más energía"),
              reason("Debe emitir más para igualar a lo absorbido, así que su temperatura de equilibrio aumenta", "aumenta la temperatura hasta igualar emisión y absorción", "aumenta", "sube", "calienta", "mayor temperatura", "emitir mas", "emitir más"),
            ], ["Un albedo menor significa que el planeta refleja menos y absorbe más radiación de la estrella", "Para que la potencia emitida (σT⁴) iguale a la absorbida, la temperatura de equilibrio sube"]),
          ],
        };
      },
    },
  ],
  /* ------------------------------------------------------------------ B.3 */
  B3: [
    {
      id: "x_bombona", level: 2, label: "Gas encerrado: presión, moles y rapidez al calentar", keywords: ["gas ideal", "volumen constante", "p/t", "rapidez cuadratica media"],
      make: (r) => {
        const p1k = pick(r, [150, 200, 250]), Vd = pick(r, [10, 20, 25]), th1 = pick(r, [17, 27]), th2 = pick(r, [77, 127]);
        const T1 = th1 + 273, T2 = th2 + 273, V = Vd * 1e-3, p1 = p1k * 1e3, p2 = (p1 * T2) / T1, n = (p1 * V) / (R_GAS * T1);
        return {
          stem: `Una bombona rígida de ${Vd} dm³ contiene gas ideal a ${p1k} kPa y ${th1} °C. La bombona se calienta hasta ${th2} °C.`,
          parts: [
            part("(a)", "Determine la presión final del gas, en kPa.", [
              method("Convertir a kelvin y usar p/T constante (volumen constante)", /p\s*\/\s*T|p₁\s*\/\s*T₁|T₂\s*\/\s*T₁|T2\s*\/\s*T1/i, T2, "T en kelvin; p/T = constante"),
              valAny("A1", `p₂ = ${fmt(p2 / 1e3)} kPa`, [p2 / 1e3, p2]),
            ], [`T₁ = ${th1} + 273 = ${T1} K,  T₂ = ${th2} + 273 = ${T2} K`, `V constante: p₂ / T₂ = p₁ / T₁`, `p₂ = ${p1k} × ${T2} / ${T1} = ${fmt(p2 / 1e3)} kPa`]),
            part("(b)", "Calcule el número de moles de gas en la bombona.", [
              method("pV = nRT, con V en m³ (convertido) y T en kelvin", /pV\s*=\s*nRT|n\s*=\s*pV|nRT/i, p1 * V, "pV = nRT en unidades SI"),
              val("A1", `n = ${fmt(n)} mol`, n),
            ], [`V = ${Vd} dm³ = ${fmt(V)} m³`, `pV = nRT`, `n = p₁V / (R T₁) = (${p1k} × 10³ × ${fmt(V)}) / (${fmt(R_GAS)} × ${T1})`, `n = ${fmt(n)} mol`]),
            part("(c)", "La temperatura absoluta del gas se duplica. Determine el factor por el que cambia la rapidez media cuadrática de las moléculas.", [
              { code: "A1", text: "La rapidez rms es proporcional a √T: el factor es √2 ≈ 1,41", miss: "v ∝ √T", test: (l, nn) => near(nn, Math.SQRT2, 0.03) || /√\s*2/.test(l) },
            ], ["La energía cinética media es proporcional a T, y ½ m v² rms ∝ T, así que v_rms ∝ √T", "Factor = √2 = 1,41"]),
          ],
        };
      },
    },
    {
      id: "x_graficaVT", level: 3, label: "Gráfica V–T de un gas a presión constante", keywords: ["grafica v-t", "presion constante", "gradiente", "moles", "modelo cinetico"],
      make: (r) => {
        const u = pick(r, [2, 3, 4]), pk = pick(r, [100, 150, 200]), p = pk * 1e3;
        const grad = u * 1e-5, n = (p * grad) / R_GAS, nR = p * grad;
        const Ts = [100, 200, 300, 400, 500], xr: [number, number] = [0, 560], yr: [number, number] = [0, 5.6 * u];
        const pts = Ts.map((T): [number, number] => [T, (u * T) / 100]);
        return {
          fig: {
            w: 360, h: 215, alt: `Gráfica del volumen de un gas frente a su temperatura absoluta: línea recta que pasa por el origen, con V = ${4 * u} dm³ a 400 K`,
            items: [{ t: "graph", x: 55, y: 22, w: 275, h: 150, xr, yr, xlabel: "T / K", ylabel: "V / dm³", xticks: [100, 200, 300, 400, 500], yticks: [u, 2 * u, 3 * u, 4 * u, 5 * u], grid: true, series: [{ pts: [[0, 0], pts[0]], dash: true }, { pts }, { pts, dots: true }] }],
          },
          stem: `Un cilindro con émbolo móvil contiene una cantidad fija de gas ideal a la presión constante de ${pk} kPa. La gráfica muestra el volumen del gas en función de su temperatura absoluta.`,
          parts: [
            part("(a)", "Use la gráfica para determinar el volumen del gas a 400 K.", [valAny("A1", `V = ${4 * u} dm³`, [4 * u, 4 * u * 1e-3])], ["Se lee en la gráfica a T = 400 K", `V = ${4 * u} dm³`]),
            part("(b)", "Determine el gradiente de la gráfica, en m³ K⁻¹.", [
              method("Gradiente = ΔV / ΔT", /Δ\s*V|gradiente|pendiente|V\s*\/\s*T/i, 4 * u, "gradiente = ΔV/ΔT"),
              valAny("A1", `gradiente = ${fmt(grad)} m³ K⁻¹`, [grad, u / 100]),
            ], [`Gradiente = ΔV / ΔT = (${5 * u} − ${u}) × 10⁻³ / (500 − 100)`, `Gradiente = ${fmt(grad)} m³ K⁻¹`]),
            part("(c)", "Determine el número de moles de gas.", [
              method("Con p constante, V = (nR/p) T: el gradiente es nR/p (o pV = nRT)", /pV\s*=\s*nRT|nR\s*\/\s*p|n\s*=\s*p|nR\b/i, nR, "gradiente = nR/p"),
              val("A1", `n = ${fmt(n)} mol`, n),
            ], ["De pV = nRT: V = (nR / p) T, así que gradiente = nR / p", `n = p × gradiente / R = ${pk} × 10³ × ${fmt(grad)} / ${fmt(R_GAS)}`, `n = ${fmt(n)} mol`]),
            part("(d)", "A presión constante la temperatura absoluta del gas se duplica. Determine el factor por el que cambia la rapidez media cuadrática de las moléculas.", [
              { code: "A1", text: "v_rms ∝ √T: el factor es √2 ≈ 1,41", miss: "v ∝ √T", test: (l, nn) => near(nn, Math.SQRT2, 0.03) || /√\s*2/.test(l) },
            ], ["La energía cinética media es proporcional a T, así que v_rms ∝ √T", "Factor = √2 = 1,41"]),
            part("(e)", "Explique, con el modelo cinético, por qué el volumen debe aumentar para que la presión se mantenga constante al calentar el gas.", [
              reason("Las moléculas más rápidas (mayor energía cinética media) chocan con las paredes con más fuerza", "moléculas más rápidas, choques más fuertes", "mas rapid", "más rápid", "mayor rapidez", "energia cinetica", "energía cinética", "mas fuerza", "más fuerza", "mayor fuerza"),
              reason("En un volumen mayor los choques por unidad de área son menos frecuentes, lo que compensa el aumento y mantiene la presión", "menos choques por unidad de área", "menos frecuente", "menos choques", "menos colisiones", "mayor distancia", "mas separad", "más separad", "recorrer mas", "recorrer más"),
            ], ["Al subir T las moléculas tienen mayor energía cinética media y cada choque con las paredes transfiere más impulso", "Un volumen mayor hace que los choques por unidad de área sean menos frecuentes; así la presión (fuerza media por unidad de área) no cambia"]),
          ],
        };
      },
    },
  ],
  /* ------------------------------------------------------------------ B.4 */
  B4: [
    {
      id: "x_expansionisobara", level: 2, label: "Expansión a presión constante: W, ΔU y temperatura", keywords: ["primera ley", "presion constante", "trabajo realizado por el gas", "energia interna"],
      make: (r) => {
        const pk = pick(r, [100, 150, 200]), V1 = pick(r, [2, 3, 4]), dV = pick(r, [2, 4, 6]), V2 = V1 + dV;
        const W = pk * dV, Q = 2.5 * W, dU = Q - W;
        return {
          stem: `Un gas ideal está en un cilindro con un émbolo sin rozamiento. Se calienta a la presión constante de ${pk} kPa y su volumen pasa de ${V1} dm³ a ${V2} dm³. El gas absorbe ${fmt(Q)} J de energía térmica.`,
          parts: [
            part("(a)", "Calcule el trabajo realizado por el gas.", [
              method("W = pΔV, con ΔV convertido a m³", /pΔV|p\s*Δ\s*V|p\s*\(\s*V/i, dV * 1e-3, "W = pΔV"),
              val("A1", `W = ${fmt(W)} J`, W),
            ], [`ΔV = (${V2} − ${V1}) dm³ = ${fmt(dV * 1e-3)} m³`, `W = p ΔV = ${pk} × 10³ × ${fmt(dV * 1e-3)}`, `W = ${fmt(W)} J`]),
            part("(b)", "Determine el cambio de energía interna del gas.", [
              method("Primera ley: Q = ΔU + W", /ΔU\s*=\s*Q|Q\s*=\s*ΔU|Q\s*[−-]\s*W/i, dU, "Q = ΔU + W"),
              val("A1", `ΔU = ${fmt(dU)} J`, dU),
            ], ["Primera ley: Q = ΔU + W", `ΔU = Q − W = ${fmt(Q)} − ${fmt(W)}`, `ΔU = ${fmt(dU)} J`]),
            part("(c)", "Indique, con una razón, si la temperatura del gas aumenta, disminuye o no cambia.", [
              reason("ΔU > 0: la energía interna (cinética media de las moléculas) aumenta, luego la temperatura aumenta", "ΔU positivo, T aumenta", "aumenta", "sube", "ΔU > 0", "du > 0", "positivo", "mayor"),
            ], ["ΔU es positivo, y la energía interna de un gas ideal depende solo de la temperatura: la temperatura aumenta"]),
          ],
        };
      },
    },
    {
      id: "x_cicloefic", level: 3, label: "Ciclo p–V: trabajo, calor absorbido, eficiencia y límite de Carnot", keywords: ["ciclo", "diagrama p-v", "eficiencia", "carnot", "calor absorbido"],
      make: (r) => {
        const V1 = pick(r, [2, 3]), dV = pick(r, [2, 4]), V2 = V1 + dV, p1 = pick(r, [100, 150]), dp = pick(r, [100, 200]), p2 = p1 + dp;
        const W = dp * dV, QAB = 1.5 * V1 * dp, QBC = 2.5 * p2 * dV, Qin = QAB + QBC, eta = W / Qin, eC = 1 - (p1 * V1) / (p2 * V2);
        const xr: [number, number] = [0, V2 + 2], yr: [number, number] = [0, p2 * 1.25];
        const gm = gmap(60, 24, 260, 140, xr, yr);
        const arr = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "poly", pts: [x1, y1, x2, y2], arrow: "end", w: 1.6 });
        return {
          fig: {
            w: 360, h: 215, alt: `Ciclo rectangular ABCD de un gas en un diagrama p–V: A (${V1} dm³, ${p1} kPa), B (${V1} dm³, ${p2} kPa), C (${V2} dm³, ${p2} kPa) y D (${V2} dm³, ${p1} kPa), recorrido en el sentido de las agujas del reloj`,
            items: [
              { t: "graph", x: 60, y: 24, w: 260, h: 140, xr, yr, xlabel: "V / dm³", ylabel: "p / kPa", xticks: [V1, V2], yticks: [p1, p2], grid: true, series: [{ pts: [[V1, p1], [V1, p2], [V2, p2], [V2, p1], [V1, p1]] }] },
              txt(gm.X(V1) - 10, gm.Y(p1) + 14, "A"), txt(gm.X(V1) - 10, gm.Y(p2) - 6, "B"), txt(gm.X(V2) + 10, gm.Y(p2) - 6, "C"), txt(gm.X(V2) + 10, gm.Y(p1) + 14, "D"),
              arr(gm.X(V1), gm.Y(p1 + dp * 0.4), gm.X(V1), gm.Y(p1 + dp * 0.6)),
              arr(gm.X(V1 + dV * 0.4), gm.Y(p2), gm.X(V1 + dV * 0.6), gm.Y(p2)),
              arr(gm.X(V2), gm.Y(p1 + dp * 0.6), gm.X(V2), gm.Y(p1 + dp * 0.4)),
              arr(gm.X(V1 + dV * 0.6), gm.Y(p1), gm.X(V1 + dV * 0.4), gm.Y(p1)),
            ],
          },
          stem: `Un gas ideal monoatómico recorre el ciclo ABCD del diagrama p–V, en el sentido indicado. Los lados AB y CD son a volumen constante; BC y DA, a presión constante. Para un gas monoatómico ideal U = (3/2) pV.`,
          parts: [
            part("(a)", "Use la gráfica para calcular el trabajo neto realizado por el gas en un ciclo.", [
              method("Trabajo neto = área del rectángulo = Δp ΔV", /área|area|Δp|Δ\s*p|base|p\s*Δ\s*V/i, dp * 1e3, "área encerrada por el ciclo"),
              val("A1", `W neto = ${fmt(W)} J`, W),
            ], [`W neto = área = (${p2} − ${p1}) × 10³ × (${V2} − ${V1}) × 10⁻³`, `W neto = ${fmt(W)} J`]),
            part("(b)", `Muestre que la energía térmica absorbida por el gas en un ciclo (en AB y BC) es de aproximadamente ${fmt(Qin)} J.`, [
              method("En AB: Q = ΔU = (3/2) V Δp; en BC: Q = ΔU + W = (5/2) p ΔV", /3\s*\/\s*2|1[.,]5|5\s*\/\s*2|2[.,]5|ΔU|nRΔT/i, QAB, "calor en AB y en BC"),
              val("A1", `Q absorbido = ${fmt(Qin)} J`, Qin),
            ], [`AB (V constante): Q = ΔU = (3/2) V₁ Δp = 1,5 × ${V1} × 10⁻³ × ${dp} × 10³ = ${fmt(QAB)} J`, `BC (p constante): Q = ΔU + W = (5/2) p₂ ΔV = 2,5 × ${p2} × 10³ × ${fmt(dV * 1e-3)} = ${fmt(QBC)} J`, `Q absorbido = ${fmt(QAB)} + ${fmt(QBC)} = ${fmt(Qin)} J`]),
            part("(c)", "Calcule la eficiencia del ciclo como máquina térmica.", [
              method("Eficiencia = trabajo neto / calor absorbido", /W\s*\/\s*Q|η\s*=|eficiencia\s*=|neto\s*\/\s*calor/i, W, "η = W / Q absorbido"),
              valAny("A1", `η = ${fmt(eta)} (${fmt(eta * 100)} %)`, [eta, eta * 100]),
            ], ["η = W neto / Q absorbido", `η = ${fmt(W)} / ${fmt(Qin)} = ${fmt(eta)} = ${fmt(eta * 100)} %`]),
            part("(d)", "Calcule la eficiencia de una máquina de Carnot que funcionara entre la temperatura máxima y la mínima de este gas.", [
              method("pV = nRT: T es proporcional a pV, y e = 1 − T_mín / T_máx", /1\s*[−-]\s*T|T\s*mín|T_?c|T_?min|pV\s*=\s*nRT|T\s*∝\s*pV/i, (p1 * V1) / (p2 * V2), "e = 1 − Tc/Th con T ∝ pV"),
              valAny("A1", `e Carnot = ${fmt(eC)} (${fmt(eC * 100)} %)`, [eC, eC * 100]),
            ], [`T ∝ pV: la mínima es en A (${p1} × ${V1}) y la máxima en C (${p2} × ${V2})`, `e = 1 − T_mín / T_máx = 1 − (${p1} × ${V1}) / (${p2} × ${V2}) = ${fmt(eC)}`]),
            part("(e)", "Compare la eficiencia del ciclo con la de Carnot.", [
              reason("La eficiencia del ciclo es menor que la de Carnot (el límite máximo posible entre esas temperaturas)", "menor que Carnot", "menor", "inferior", "por debajo", "no supera"),
            ], [`La eficiencia del ciclo (${fmt(eta)}) es menor que la de Carnot (${fmt(eC)}), como debe ser: Carnot es el máximo posible entre esas temperaturas`]),
          ],
        };
      },
    },
  ],
  /* ------------------------------------------------------------------ B.5 */
  B5: [
    {
      id: "x_hervidor", level: 2, label: "Hervidor eléctrico: corriente, resistencia y tiempo de calentamiento", keywords: ["hervidor", "potencia electrica", "calor especifico", "p = vi", "resistencia"],
      make: (r) => {
        const P = pick(r, [1800, 2000, 2200]), m = pick(r, [0.75, 1.0, 1.5]), th0 = pick(r, [15, 20, 25]), V = 230, c = 4180;
        const I = P / V, R = (V * V) / P, Q = m * c * (100 - th0), t = Q / P;
        return {
          stem: `Un hervidor eléctrico lleva la inscripción «${V} V, ${fmt(P / 1000)} kW». Se conecta a una red de ${V} V y funciona con normalidad.`,
          data: `Calor específico del agua: ${fmt(c)} J kg⁻¹ K⁻¹`,
          parts: [
            part("(a)", "Calcule la corriente en el elemento calefactor.", [val("A1", `I = P / V = ${fmt(I)} A`, I)], ["P = V I", `I = P / V = ${P} / ${V}`, `I = ${fmt(I)} A`]),
            part("(b)", "Calcule la resistencia del elemento calefactor.", [val("A1", `R = V / I = ${fmt(R)} Ω`, R)], [`R = V / I = ${V} / ${fmt(I)}`, `R = ${fmt(R)} Ω`]),
            part("(c)", `Estime el tiempo que tarda en llevar ${fmt(m)} kg de agua desde ${th0} °C hasta 100 °C, si toda la energía eléctrica pasa al agua.`, [
              method("Energía necesaria: Q = m c Δθ (= P t)", /mcΔθ|m\s*c\s*Δ|Q\s*=\s*P\s*t|P\s*t/i, Q, "Q = m c Δθ"),
              valAny("A1", `t = ${fmt(t)} s`, [t, t / 60]),
            ], [`Q = m c Δθ = ${fmt(m)} × ${fmt(c)} × (100 − ${th0}) = ${fmt(Q)} J`, `t = Q / P = ${fmt(Q)} / ${P}`, `t = ${fmt(t)} s`]),
            part("(d)", "Sugiera por qué el tiempo real es algo mayor que el estimado.", [
              reason("Parte de la energía calienta el propio hervidor y se pierde al ambiente, así que el agua recibe menos de la que suministra el elemento", "pérdidas de energía", "perd", "pierde", "ambiente", "entorno", "calienta el hervidor", "disipa", "no toda"),
            ], ["Parte de la energía eléctrica calienta el hervidor y se pierde al ambiente: el agua recibe menos de P t, y hace falta más tiempo"]),
          ],
        };
      },
    },
    {
      id: "x_redesidenticas", level: 3, label: "Red de resistores idénticos: equivalente, corrientes y cortocircuito", keywords: ["serie y paralelo", "resistores identicos", "resistencia equivalente", "cortocircuito", "razon de corrientes"],
      make: (r) => {
        const R = pick(r, [4, 6, 8, 12]), V = pick(r, [5, 7.5, 15]);
        const Req = (5 * R) / 3, Req2 = 1.5 * R;
        const circuit = (short: boolean): FigItem[] => {
          const it: FigItem[] = [
            { t: "comp", kind: "cell", x1: 40, y1: 40, x2: 40, y2: 170, label: `${V} V` },
            { t: "comp", kind: "resistor", x1: 40, y1: 40, x2: 170, y2: 40, label: "R" },
            { t: "line", x1: 170, y1: 40, x2: 290, y2: 40 }, { t: "line", x1: 40, y1: 170, x2: 290, y2: 170 },
            { t: "comp", kind: "resistor", x1: 200, y1: 40, x2: 200, y2: 105, label: "R" },
            { t: "comp", kind: "resistor", x1: 200, y1: 105, x2: 200, y2: 170, label: "R" },
            { t: "comp", kind: "resistor", x1: 290, y1: 40, x2: 290, y2: 170, label: "R" },
            { t: "dot", x: 200, y: 40 }, { t: "dot", x: 200, y: 170 }, txt(216, 100, "Q", "start"),
          ];
          if (short) it.push({ t: "line", x1: 200, y1: 105, x2: 170, y2: 105 }, { t: "line", x1: 170, y1: 105, x2: 170, y2: 170 }, { t: "dot", x: 200, y: 105 }, { t: "dot", x: 170, y: 170 });
          return it;
        };
        return {
          fig: { w: 340, h: 200, alt: "Una pila en serie con un resistor R, y después dos ramas en paralelo: una con dos resistores R en serie y otra con un solo resistor R", items: circuit(false) },
          stem: `En el circuito, los cuatro resistores son idénticos, de resistencia R = ${R} Ω. La pila, de ${V} V, tiene resistencia interna despreciable.`,
          parts: [
            part("(a)", "Calcule la resistencia equivalente del circuito conectada a la pila.", [
              method("Dos resistores en serie (2R) en paralelo con R: 1/R_p = 1/2R + 1/R", /1\s*\/\s*R|2\s*R|serie|paralelo|R_?p/i, (2 * R) / 3, "combinación paralelo de 2R y R"),
              val("A1", `R_eq = ${fmt(Req)} Ω`, Req),
            ], ["Rama 1: R + R = 2R. Las dos ramas en paralelo: R_p = (2R × R) / (2R + R) = 2R/3", `R_p = ${fmt((2 * R) / 3)} Ω`, `R_eq = R + R_p = ${R} + ${fmt((2 * R) / 3)} = ${fmt(Req)} Ω`]),
            part("(b)", "Determine la razón entre la corriente en la rama de dos resistores y la corriente en la rama de un resistor.", [
              fac("I₁ / I₂ = R / 2R = 0,50", 0.5, /1\s*\/\s*2/),
            ], ["Las dos ramas tienen la misma diferencia de potencial, luego I ∝ 1/R", "I₁ / I₂ = R / (2R) = 0,50"]),
            part("(c)", "Un cable une ahora el punto Q con el extremo inferior del circuito, como muestra el diagrama. Determine la nueva resistencia equivalente.", [
              method("El resistor inferior de la rama 1 queda cortocircuitado (no pasa corriente por él)", /cortocircuit|corto|no pasa|sin corriente|1\s*\/\s*R|R\s*\/\s*2|paralelo/i, R / 2, "un resistor cortocircuitado"),
              val("A1", `R_eq = ${fmt(Req2)} Ω`, Req2),
            ], ["El cable cortocircuita el resistor inferior de la rama 1; quedan dos resistores R en paralelo: R_p = R/2", `R_eq = R + R/2 = ${R} + ${fmt(R / 2)} = ${fmt(Req2)} Ω`]),
            { ...part("(d)", "Una pila de fem ε alimenta directamente un resistor hecho de un alambre. Otro resistor, del mismo material y de la misma sección pero de triple longitud, se conecta a una pila de fem 2ε. Determine la razón entre la potencia del segundo y la del primero.", [
              method("R ∝ L, así que R₂ = 3R₁; y P = ε²/R", /ε\s*²|ε\^2|V\^2|V²|R\s*∝|3R/i, 4 / 3, "P = ε²/R, R ∝ L"),
              fac("P₂ / P₁ = 2² / 3 = 1,33", 4 / 3, /4\s*\/\s*3/),
            ], ["R = ρL/A: con L triple, R₂ = 3R₁. P = ε²/R", "P₂ / P₁ = (2ε)² / (3R₁) × R₁ / ε² = 4 / 3 = 1,33"]) },
          ].map((p, i) => (i === 2 ? { ...p, fig: { w: 340, h: 200, alt: "El mismo circuito con un cable que une el punto Q con el conductor inferior", items: circuit(true) } } : p)),
        };
      },
    },
    {
      id: "x_pilavoltamperimetro", level: 3, label: "Pila real con voltímetro y amperímetro: resistencia interna y resistividad", keywords: ["resistencia interna", "voltimetro", "amperimetro", "resistencia en paralelo", "resistividad"],
      make: (r) => {
        const eps = pick(r, [6, 9]), Ima = pick(r, [25, 40]), ri = pick(r, [10, 20, 30]), RA = 50.0;
        const I = Ima * 1e-3, V = eps - I * ri, R = eps / I - ri - RA, L = pick(r, [1.5, 2.0, 2.5]), k = R / L;
        const circuit = (extra: boolean): FigItem[] => {
          const it: FigItem[] = [
            { t: "comp", kind: "voltmeter", x1: 50, y1: 40, x2: 50, y2: 170, label: "V" },
            { t: "line", x1: 50, y1: 40, x2: 130, y2: 40 }, { t: "line", x1: 50, y1: 170, x2: 130, y2: 170 },
            { t: "comp", kind: "cell", x1: 130, y1: 40, x2: 130, y2: 170, label: "ε, r" },
            { t: "comp", kind: "ammeter", x1: 130, y1: 40, x2: 230, y2: 40, label: "A" },
            { t: "line", x1: 230, y1: 40, x2: 300, y2: 40 }, { t: "line", x1: 130, y1: 170, x2: 300, y2: 170 },
            { t: "comp", kind: "resistor", x1: 300, y1: 40, x2: 300, y2: 170, label: "R" },
            { t: "dot", x: 130, y: 40 }, { t: "dot", x: 130, y: 170 },
          ];
          if (extra) it.push({ t: "line", x1: 300, y1: 40, x2: 360, y2: 40 }, { t: "line", x1: 300, y1: 170, x2: 360, y2: 170 }, { t: "comp", kind: "resistor", x1: 360, y1: 40, x2: 360, y2: 170, label: "R′" }, { t: "dot", x: 300, y: 40 }, { t: "dot", x: 300, y: 170 });
          return it;
        };
        const unit = /Ω\s*(\^\s*)?\(?\s*(m\s*\^?\s*-\s*1|\/\s*m)|ohm\w*\s*(\/|por)\s*metro/i;
        return {
          fig: { w: 400, h: 200, alt: "Una pila con resistencia interna, un amperímetro y un resistor R en serie, y un voltímetro conectado en los terminales de la pila", items: circuit(false) },
          stem: `Una pila de fem ε = ${fmt(eps)} V y resistencia interna r alimenta un resistor R. En serie hay un amperímetro cuya resistencia es ${fmt(RA)} Ω. Un voltímetro ideal está conectado en los terminales de la pila. El voltímetro marca ${fmt(V)} V y el amperímetro ${fmt(Ima)} mA.`,
          parts: [
            part("(a)", "Calcule la resistencia interna de la pila.", [
              method("Los «voltios perdidos» son ε − V = I r", /ε\s*[−-]\s*V|I\s*r|Ir|V\s*=\s*ε/i, eps - V, "ε − V = I r"),
              val("A1", `r = ${fmt(ri)} Ω`, ri),
            ], ["V = ε − I r", `r = (ε − V) / I = (${fmt(eps)} − ${fmt(V)}) / ${fmt(I)}`, `r = ${fmt(ri)} Ω`]),
            part("(b)", "Determine la resistencia de R.", [
              val("A1", `R = ε/I − r − R_A = ${fmt(R)} Ω`, R),
            ], [`ε = I (R + R_A + r)`, `R = ε / I − r − R_A = ${fmt(eps)} / ${fmt(I)} − ${fmt(ri)} − ${fmt(RA)}`, `R = ${fmt(R)} Ω`]),
            { ...part("(c)", "Se conecta ahora un segundo resistor R′ en paralelo con R, como muestra el diagrama. Explique cómo cambian la lectura del amperímetro y la del voltímetro.", [
              reason("La resistencia total del circuito disminuye (R y R′ en paralelo)", "resistencia total menor", "resistencia total disminuye", "resistencia total del circuito disminuye", "resistencia menor", "resistencia total menor", "resistencia equivalente disminuye", "resistencia disminuye", "menor resistencia", "disminuye la resistencia", "resistencia total baja"),
              reason("Por tanto la corriente total aumenta: la lectura del amperímetro aumenta", "el amperímetro aumenta", "amperimetro aumenta", "amperímetro aumenta", "corriente aumenta", "corriente total aumenta", "aumenta la corriente", "lectura del amperimetro aumenta"),
              reason("Aumenta la caída de potencial dentro de la pila (I r mayor)", "I r mayor, más voltios perdidos", "voltios perdidos", "caida", "caída", "I r", "ir mayor", "dentro de la pila", "resistencia interna"),
              reason("El voltímetro mide ε − I r, así que su lectura disminuye", "el voltímetro disminuye", "voltimetro disminuye", "voltímetro disminuye", "lectura disminuye", "lectura del voltimetro disminuye", "disminuye la lectura", "mide menos", "diferencia de potencial disminuye"),
            ], ["Dos resistores en paralelo dan una resistencia menor: la resistencia total del circuito disminuye", "Con ε constante, la corriente total aumenta: el amperímetro marca más", "Con más corriente aumentan los voltios perdidos en la resistencia interna, I r", "El voltímetro lee V = ε − I r, de modo que su lectura disminuye"]), fig: { w: 400, h: 200, alt: "El circuito anterior con un segundo resistor R′ en paralelo con R", items: circuit(true) } },
            part("(d)", `El resistor R es un alambre uniforme de longitud ${fmt(L)} m y sección A, hecho de un material de resistividad ρ. Muestre que R = kL y calcule k, con su unidad.`, [
              method("R = ρL/A, con k = ρ/A", /ρ\s*L\s*\/\s*A|R\s*=\s*ρ|k\s*=\s*ρ|ρ\s*\/\s*A/i, k, "R = ρL/A, k = ρ/A"),
              { code: "A1", text: `k = R / L = ${fmt(k)} Ω m⁻¹`, miss: "valor y unidad de k", test: (l, n) => near(n, k) && unit.test(normalize(l)) },
            ], ["R = ρL/A = (ρ/A) L, con k = ρ/A constante para el alambre", `k = R / L = ${fmt(R)} / ${fmt(L)} = ${fmt(k)} Ω m⁻¹`]),
          ],
        };
      },
    },
    {
      id: "x_componentenoohmico", level: 3, label: "Componente no óhmico con resistencia variable: gráfica I–V, resistencia y potencia", keywords: ["no ohmico", "grafica i-v", "resistencia variable", "potencia total", "fem"],
      make: (r) => {
        const eps = pick(r, [9, 12]), It = pick(r, [15, 30, 75]);
        const Vs = [0, 1, 2, 3, 4, 5, 6], Is = Vs.map((v) => 2.5 * v * (v + 1));
        const Vx = Vs[Is.indexOf(It)], Rv = (eps - Vx) / (It * 1e-3), P = eps * It * 1e-3;
        const pts = Vs.map((v, i): [number, number] => [v, Is[i]]);
        const xr: [number, number] = [0, 6.6], yr: [number, number] = [0, 115];
        return {
          fig: {
            w: 360, h: 215, alt: "Gráfica de la corriente en un componente X frente a la diferencia de potencial: curva que sube cada vez más deprisa; 30 mA a 3 V y 75 mA a 5 V",
            items: [{ t: "graph", x: 58, y: 22, w: 270, h: 150, xr, yr, xlabel: "V / V", ylabel: "I / mA", xticks: [1, 2, 3, 4, 5, 6], yticks: [15, 30, 45, 60, 75, 90, 105], grid: true, series: [{ pts, smooth: true }, { pts, dots: true }] }],
          },
          stem: `La gráfica muestra la característica I–V de un componente X. El componente se conecta en serie con una resistencia variable y una pila de fem ${eps} V y resistencia interna despreciable. Se ajusta la resistencia variable hasta que la corriente es ${It} mA.`,
          parts: [
            part("(a)", "Use la gráfica para determinar la diferencia de potencial en X.", [val("A1", `V_X = ${Vx} V`, Vx)], [`Se lee en la gráfica con I = ${It} mA`, `V_X = ${Vx} V`]),
            { ...part("(b)", "Calcule la resistencia de la resistencia variable.", [
              method("ε = V_X + I R", /ε\s*=|V_?X\s*\+|I\s*R|ε\s*[−-]\s*V/i, eps - Vx, "ε = V_X + I R"),
              val("A1", `R = ${fmt(Rv)} Ω`, Rv),
            ], [`ε = V_X + I R`, `R = (ε − V_X) / I = (${eps} − ${Vx}) / ${fmt(It * 1e-3)}`, `R = ${fmt(Rv)} Ω`]), fig: {
              w: 340, h: 190, alt: "Circuito en serie: una pila, el componente X y una resistencia variable",
              items: [
                { t: "comp", kind: "cell", x1: 40, y1: 40, x2: 40, y2: 150, label: `${eps} V` },
                { t: "line", x1: 40, y1: 40, x2: 100, y2: 40 }, { t: "comp", kind: "thermistor", x1: 100, y1: 40, x2: 220, y2: 40, label: "X" }, { t: "line", x1: 220, y1: 40, x2: 300, y2: 40 },
                { t: "comp", kind: "variable", x1: 300, y1: 40, x2: 300, y2: 150 }, txt(316, 98, "R", "start"),
                { t: "line", x1: 40, y1: 150, x2: 300, y2: 150 },
              ],
            } },
            part("(c)", "Calcule la potencia total que suministra la pila.", [
              method("P = ε I", /P\s*=\s*ε\s*I|ε\s*I|ε\s*×\s*I/i, P, "P = εI"),
              val("A1", `P = ${fmt(P)} W`, P),
            ], [`P = ε I = ${eps} × ${fmt(It * 1e-3)}`, `P = ${fmt(P)} W`]),
            part("(d)", "Indique por qué X no es un componente óhmico.", [
              reason("La gráfica no es una recta que pase por el origen: I no es proporcional a V (V/I cambia)", "I no proporcional a V", "no es una recta", "no es recta", "no es lineal", "no lineal", "curva", "no es proporcional", "no proporcional", "cambia", "no es constante", "no constante"),
            ], ["Su gráfica I–V es una curva: la corriente no es proporcional a la diferencia de potencial y V/I (su resistencia) cambia"]),
          ],
        };
      },
    },
    {
      id: "x_bombillafilamento", level: 3, label: "Lámpara de filamento: gráfica I–V, resistencia y resistividad", keywords: ["lampara", "filamento", "grafica i-v", "resistividad", "potencia"],
      make: (r) => {
        const I12 = pick(r, [0.4, 0.6, 0.8]), L = pick(r, [0.020, 0.025, 0.030]), rho = 7.0e-7;
        const fs = [0, 0.30, 0.50, 0.65, 0.78, 0.90, 1.0], Vs = [0, 2, 4, 6, 8, 10, 12];
        const P = 12 * I12, R4 = 4 / (0.5 * I12), R12 = 12 / I12, A = (rho * L) / R12, d = Math.sqrt((4 * A) / Math.PI);
        const pts = Vs.map((v, i): [number, number] => [v, fs[i] * I12]);
        const xr: [number, number] = [0, 13], yr: [number, number] = [0, I12 * 1.2];
        const yt = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].filter((y) => y <= I12 + 1e-9);
        return {
          fig: {
            w: 360, h: 215, alt: `Gráfica de la corriente en una lámpara de filamento frente a la diferencia de potencial: curva que sube cada vez más despacio; I = ${fmt(I12 / 2)} A a 4 V e I = ${fmt(I12)} A a 12 V`,
            items: [{ t: "graph", x: 58, y: 22, w: 270, h: 150, xr, yr, xlabel: "V / V", ylabel: "I / A", xticks: [2, 4, 6, 8, 10, 12], yticks: yt, grid: true, series: [{ pts, smooth: true }, { pts, dots: true }] }],
          },
          stem: "Una lámpara con filamento de tungsteno se conecta a una fuente de tensión variable, de resistencia interna despreciable. La gráfica muestra la corriente I en la lámpara en función de la diferencia de potencial V entre sus extremos. La lámpara está diseñada para funcionar a 12 V.",
          data: `Resistividad del filamento a su temperatura de funcionamiento: ${fmt(rho)} Ω m`,
          parts: [
            part("(a)", `Muestre que la potencia de la lámpara a 12 V es de aproximadamente ${fmt(P)} W.`, [
              method("P = V I, con I leída en la gráfica a 12 V", /P\s*=\s*V\s*I|V\s*I|V\s*×\s*I/i, I12, "P = VI"),
              val("A1", `P = ${fmt(P)} W`, P),
            ], [`De la gráfica, I = ${fmt(I12)} A a 12 V`, `P = V I = 12 × ${fmt(I12)} = ${fmt(P)} W`]),
            part("(b)", "Determine la resistencia del filamento cuando V = 4,0 V y cuando V = 12 V.", [
              val("A1", `R(4 V) = 4,0 / ${fmt(I12 / 2)} = ${fmt(R4)} Ω`, R4),
              val("A1", `R(12 V) = 12 / ${fmt(I12)} = ${fmt(R12)} Ω`, R12),
            ], [`A 4,0 V la gráfica da I = ${fmt(I12 / 2)} A: R = V / I = 4,0 / ${fmt(I12 / 2)} = ${fmt(R4)} Ω`, `A 12 V, I = ${fmt(I12)} A: R = 12 / ${fmt(I12)} = ${fmt(R12)} Ω`]),
            part("(c)", "Explique, en términos del modelo microscópico, por qué la resistencia del filamento aumenta al aumentar V.", [
              reason("Con más corriente el filamento se calienta y su temperatura sube", "más corriente, más temperatura", "temperatura", "se calienta", "calienta"),
              reason("Los iones de la red vibran con más amplitud, hay más colisiones con los electrones y la resistividad (y R) aumenta", "más vibración de los iones, más colisiones", "vibr", "colision", "choques", "iones", "red"),
            ], ["Al aumentar V pasa más corriente por el filamento, que se calienta: su temperatura sube", "Los iones de la red vibran con mayor amplitud; hay más colisiones con los electrones de conducción y aumentan la resistividad y la resistencia"]),
            part("(d)", `El filamento mide ${fmt(L)} m de longitud y es un cilindro de sección uniforme. Calcule su diámetro a 12 V.`, [
              method("R = ρL / A, así que A = ρL / R", /ρ\s*L\s*\/\s*A|R\s*=\s*ρ|A\s*=\s*ρ|ρ\s*L/i, A, "R = ρL/A"),
              valAny("A1", `d = ${fmt(d * 1e6)} μm`, [d, d * 1e6]),
            ], [`R = ρ L / A  →  A = ρ L / R = ${fmt(rho)} × ${fmt(L)} / ${fmt(R12)} = ${fmt(A)} m²`, `A = π d² / 4  →  d = √(4A / π) = ${fmt(d)} m = ${fmt(d * 1e6)} μm`]),
          ],
        };
      },
    },
  ],
};
