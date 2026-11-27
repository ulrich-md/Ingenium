/**
 * Unit B · Naturaleza particulada de la materia. Original IB-style questions (see kit.ts for how they work).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { f2, fmt, G, g, hasAny, KB, method, NA, near, normalize, part, pick, PLANETS, R_GAS, reason, SIGMA, TOL, val, valAny, WIEN, type FigItem, type FormulaGroup, type Topic } from "./kit.ts";

type CompKind = Extract<FigItem, { t: "comp" }>["kind"];
const wire = (x1: number, y1: number, x2: number, y2: number): FigItem => ({ t: "line", x1, y1, x2, y2 });
const comp = (kind: CompKind, x1: number, y1: number, x2: number, y2: number, label?: string): FigItem => ({ t: "comp", kind, x1, y1, x2, y2, label });
const txt = (x: number, y: number, s: string, anchor: "start" | "middle" | "end" = "middle", size?: number): FigItem => ({ t: "text", x, y, s, anchor, size });
const arrow = (x1: number, y1: number, x2: number, y2: number, dash?: boolean): FigItem => ({ t: "line", x1, y1, x2, y2, arrow: "end", dash });
const sg = (n: number) => String(n).replace("-", "−");
/** maps data coordinates of a graph FigItem to figure coordinates (to overlay guides and labels) */
const gmap = (x: number, y: number, w: number, h: number, xr: [number, number], yr: [number, number]) => ({
  X: (v: number) => x + ((v - xr[0]) / (xr[1] - xr[0])) * w,
  Y: (v: number) => y + h - ((v - yr[0]) / (yr[1] - yr[0])) * h,
});
const planck = (x: number) => 1 / Math.pow(x, 5) / (Math.exp(4.965 / x) - 1); // x = λ / λmax, peak at x = 1
const U1 = 1.66e-27;

export const topics: Topic[] = [
  {
    id: "B1", unit: "B", name: "B.1 Transferencias de energía térmica",
    concepts: [
      {
        id: "calorespecifico", label: "Calor específico", keywords: ["calor especifico", "q = mcδt", "capacidad calorifica", "se calienta"],
        make: (r) => {
          const mat = pick(r, [{ n: "cobre", c: 385 }, { n: "aluminio", c: 900 }, { n: "hierro", c: 450 }, { n: "agua", c: 4180 }]);
          const m = pick(r, [0.20, 0.50, 1.5, 2.0]), T1 = pick(r, [15, 20, 25]), dT = pick(r, [30, 45, 60, 75]), T2 = T1 + dT;
          const Q = m * mat.c * dT, P = pick(r, [100, 250, 500, 1000]), t = Q / P;
          return {
            stem: `Una muestra de ${mat.n} de ${f2(m)} kg se calienta de ${T1} °C a ${T2} °C.`,
            data: `Calor específico del ${mat.n}: ${mat.c} J kg⁻¹ K⁻¹`,
            parts: [
              part("(a)", "Calcule la energía térmica que recibe la muestra.", [
                val("M1", `ΔT = ${dT} K`, dT, "ΔT"),
                val("A1", `Q = mcΔT = ${fmt(Q)} J`, Q),
              ], [`ΔT = ${T2} − ${T1} = ${dT} K`, `Q = m c ΔT = ${f2(m)} × ${mat.c} × ${dT}`, `Q = ${fmt(Q)} J`]),
              part("(b)", `La energía la suministra un calentador eléctrico de ${P} W. Suponga que toda la energía pasa a la muestra y calcule el tiempo que tarda en calentarse.`, [
                method("Usa P = Q / t", /Q\s*\/\s*P|P\s*t|Q\s*=\s*P/i, Q, "t = Q / P"),
                valAny("A1", `t = ${fmt(t)} s`, [t, t / 60]),
              ], ["P = Q / t  →  t = Q / P", `t = ${fmt(Q)} / ${P}`, `t = ${fmt(t)} s`]),
            ],
          };
        },
      },
      {
        id: "fusion", label: "Calor latente y cambio de fase", keywords: ["calor latente", "fusion", "cambio de fase", "temperatura constante"],
        make: (r) => {
          const met = pick(r, [{ n: "plomo", Tm: 327, c: 130 }, { n: "estaño", Tm: 232, c: 227 }, { n: "zinc", Tm: 420, c: 390 }]);
          const Lt = { plomo: 2.5e4, estaño: 6.0e4, zinc: 1.1e5 }[met.n as "plomo"];
          const m = pick(r, [0.40, 0.50, 0.80]), P = pick(r, [100, 150, 200]), T0 = 20, Tend = met.Tm + 60;
          const rd = (x: number, s: number) => Math.max(s, Math.round(x / s) * s);
          const t1 = rd((m * met.c * (met.Tm - T0)) / P, 5), t2 = t1 + rd((m * Lt) / P, 5), t3 = t2 + rd((m * met.c * 1.1 * 60) / P, 5);
          const dt = t2 - t1, L = (P * dt) / m, cs = (P * t1) / (m * (met.Tm - T0));
          const xr: [number, number] = [0, t3 * 1.1], yr: [number, number] = [0, Tend * 1.12];
          const gm = gmap(55, 26, 265, 140, xr, yr);
          return {
            fig: {
              w: 360, h: 215, alt: `Gráfica temperatura–tiempo de ${f2(m)} kg de ${met.n} calentado: sube, se mantiene en ${met.Tm} °C entre ${t1} s y ${t2} s y vuelve a subir`,
              items: [
                { t: "graph", x: 55, y: 26, w: 265, h: 140, xr, yr, xlabel: "t / s", ylabel: "θ / °C", xticks: [t1, t2, t3], yticks: [T0, met.Tm, Tend], series: [{ pts: [[0, T0], [t1, met.Tm], [t2, met.Tm], [t3, Tend]] }] },
                { t: "line", x1: gm.X(t1), y1: gm.Y(met.Tm), x2: gm.X(t1), y2: gm.Y(0), dash: true, gray: true, w: 1 },
                { t: "line", x1: gm.X(t2), y1: gm.Y(met.Tm), x2: gm.X(t2), y2: gm.Y(0), dash: true, gray: true, w: 1 },
              ],
            },
            stem: `Un bloque de ${met.n} sólido de ${f2(m)} kg, inicialmente a ${T0} °C, se calienta con un calentador de potencia constante ${P} W (toda la energía pasa al bloque). La gráfica muestra cómo cambia su temperatura con el tiempo.`,
            parts: [
              part("(a)", "Use la gráfica para determinar cuánto tiempo dura la fusión del bloque.", [val("A1", `Δt = ${t2} − ${t1} = ${dt} s`, dt)], [`La temperatura es constante de ${t1} s a ${t2} s`, `Δt = ${t2} − ${t1} = ${dt} s`]),
              part("(b)", "Calcule el calor latente específico de fusión del metal.", [
                val("M1", `Q = P Δt = ${fmt(P * dt)} J`, P * dt, "Q = PΔt"),
                val("A1", `L = Q / m = ${fmt(L)} J kg⁻¹`, L),
              ], [`Q = P Δt = ${P} × ${dt} = ${fmt(P * dt)} J`, `L = Q / m = ${fmt(P * dt)} / ${f2(m)}`, `L = ${fmt(L)} J kg⁻¹`]),
              part("(c)", `Calcule el calor específico del metal sólido a partir del tramo inicial de la gráfica (hasta que empieza a fundirse).`, [
                val("M1", `Q = P t = ${fmt(P * t1)} J`, P * t1, "Q = Pt"),
                val("A1", `c = Q / (mΔθ) = ${fmt(cs)} J kg⁻¹ K⁻¹`, cs),
              ], [`Q = P t = ${P} × ${t1} = ${fmt(P * t1)} J`, `Δθ = ${met.Tm} − ${T0} = ${met.Tm - T0} K`, `c = Q / (m Δθ) = ${fmt(P * t1)} / (${f2(m)} × ${met.Tm - T0})`, `c = ${fmt(cs)} J kg⁻¹ K⁻¹`]),
              part("(d)", "Explique por qué la temperatura no cambia mientras el metal se funde.", [
                reason("La energía suministrada se usa para romper enlaces / cambiar el estado, no para aumentar la energía cinética de las partículas", "energía para el cambio de fase", "enlace", "cambio de fase", "cambio de estado", "energia potencial", "romper", "fusion", "latente"),
              ], ["La energía suministrada se emplea en romper los enlaces entre las partículas (aumenta su energía potencial), no en aumentar su energía cinética media; por eso θ no cambia durante el cambio de fase."]),
            ],
          };
        },
      },
      {
        id: "mezcla", label: "Equilibrio térmico de una mezcla", keywords: ["equilibrio termico", "mezcla", "calorimetro", "temperatura final"],
        make: (r) => {
          const mt = pick(r, [{ n: "cobre", c: 385 }, { n: "aluminio", c: 900 }, { n: "hierro", c: 450 }]);
          const mm = pick(r, [0.20, 0.40, 0.50]), mw = pick(r, [0.30, 0.50, 0.60]), Tm = pick(r, [100, 150, 200]), Tw = pick(r, [15, 20, 25]), cw = 4180;
          const Tf = (mm * mt.c * Tm + mw * cw * Tw) / (mm * mt.c + mw * cw), Q = mw * cw * (Tf - Tw);
          return {
            fig: {
              w: 360, h: 180, alt: `Un bloque de ${mt.n} de ${f2(mm)} kg a ${Tm} °C dentro de un vaso con ${f2(mw)} kg de agua a ${Tw} °C`,
              items: [
                { t: "poly", pts: [140, 25, 140, 150, 270, 150, 270, 25] },
                { t: "rect", x: 141, y: 70, w: 128, h: 79, fill: "light", sw: 0.5 },
                { t: "rect", x: 185, y: 95, w: 40, h: 30, fill: "dark" },
                txt(130, 100, `${f2(mm)} kg`, "end"), txt(130, 115, `${Tm} °C`, "end"), arrow(134, 108, 183, 108),
                txt(285, 100, `${f2(mw)} kg`, "start"), txt(285, 115, `agua, ${Tw} °C`, "start"),
              ],
            },
            stem: `Un bloque de ${mt.n} de ${f2(mm)} kg a ${Tm} °C se introduce en ${f2(mw)} kg de agua a ${Tw} °C contenida en un vaso aislado. No se pierde energía al entorno ni al vaso.`,
            data: `Calores específicos: ${mt.n}, ${mt.c} J kg⁻¹ K⁻¹; agua, 4180 J kg⁻¹ K⁻¹`,
            parts: [
              part("(a)", "Determine la temperatura final del sistema cuando alcanza el equilibrio térmico.", [
                method("Energía cedida por el metal = energía ganada por el agua", /cede|perd|gana|m\s*[₁1]?\s*c[₁1]?\s*\(|mcΔ|m\s*c\s*Δ/i, Q, "calor cedido = calor ganado"),
                val("A1", `θf = ${fmt(Tf)} °C`, Tf),
              ], [`calor cedido por el metal = calor ganado por el agua`, `${f2(mm)} × ${mt.c} × (${Tm} − θ) = ${f2(mw)} × 4180 × (θ − ${Tw})`, `θf = ${fmt(Tf)} °C`]),
              part("(b)", "En un experimento real la temperatura final medida es algo menor que la calculada. Sugiera una razón.", [
                reason("Parte de la energía se pierde al entorno / el vaso absorbe energía", "pérdidas al entorno o al calorímetro", "entorno", "ambiente", "vaso", "recipiente", "calorimetro", "pierde", "aire", "evapor"),
              ], ["Parte de la energía se transfiere al entorno (aire) y al vaso, por lo que el agua recibe menos energía de la supuesta."]),
            ],
          };
        },
      },
      {
        id: "conduccion", label: "Conducción térmica a través de una pared", keywords: ["conduccion", "ley de fourier", "pared", "conductividad termica", "aislante"],
        make: (r) => {
          const mt = pick(r, [{ n: "ladrillo", k: 0.70 }, { n: "vidrio", k: 1.0 }, { n: "hormigón", k: 1.4 }, { n: "madera", k: 0.15 }]);
          const A = pick(r, [8, 10, 12, 15]), dx = pick(r, [0.10, 0.20, 0.30]), Ti = pick(r, [20, 22, 24]), To = pick(r, [-5, 0, 2, 5]);
          const dT = Ti - To, P = (mt.k * A * dT) / dx;
          return {
            fig: {
              w: 360, h: 190, alt: `Pared de ${mt.n} de ${f2(dx)} m de espesor y ${A} m² con ${Ti} °C en el interior y ${sg(To)} °C en el exterior`,
              items: [
                { t: "rect", x: 150, y: 35, w: 60, h: 105, fill: "light" },
                txt(180, 26, `A = ${A} m²`),
                txt(72, 92, `${Ti} °C`), txt(290, 92, `${sg(To)} °C`),
                arrow(40, 108, 140, 108), arrow(220, 108, 320, 108),
                { t: "line", x1: 150, y1: 158, x2: 210, y2: 158, arrow: "both", w: 1.1 },
                txt(180, 178, `Δx = ${f2(dx)} m`),
              ],
            },
            stem: `Una pared de ${mt.n} de ${A} m² de área y ${f2(dx)} m de espesor separa el interior de una casa, a ${Ti} °C, del exterior, a ${sg(To)} °C. Las temperaturas de las dos caras de la pared son estas y se mantienen constantes.`,
            data: `Conductividad térmica del ${mt.n}: ${f2(mt.k)} W m⁻¹ K⁻¹`,
            parts: [
              part("(a)", "Calcule la potencia térmica que se transfiere por conducción a través de la pared.", [
                val("M1", `ΔT = ${dT} K`, dT, "ΔT"),
                val("A1", `P = kAΔT / Δx = ${fmt(P)} W`, P),
              ], [`ΔT = ${Ti} − (${sg(To)}) = ${dT} K`, `P = k A ΔT / Δx = ${f2(mt.k)} × ${A} × ${dT} / ${f2(dx)}`, `P = ${fmt(P)} W`]),
              part("(b)", "Se duplica el espesor de la pared con el mismo material. Determine la nueva potencia térmica.", [
                method("La potencia es inversamente proporcional al espesor", /mitad|inversa|1\s*\/\s*2|½|\/\s*2|÷\s*2|0\.5/i, P / 2, "P ∝ 1/Δx"),
                val("A1", `P′ = ${fmt(P / 2)} W`, P / 2),
              ], ["P ∝ 1/Δx: al duplicar el espesor, la potencia se reduce a la mitad", `P′ = ${fmt(P)} / 2`, `P′ = ${fmt(P / 2)} W`]),
            ],
          };
        },
      },
      {
        id: "stefan", label: "Radiación de cuerpo negro: luminosidad", keywords: ["stefan", "cuerpo negro", "luminosidad", "estrella", "σat⁴"],
        make: (r) => {
          const R = pick(r, [3.5e8, 7.0e8, 1.4e9, 2.1e9]), T = pick(r, [3500, 4500, 5800, 6500, 9000]), f = pick(r, [1.5, 2, 3]);
          const A = 4 * Math.PI * R * R, L = SIGMA * A * Math.pow(T, 4), L2 = L * Math.pow(f, 4);
          return {
            stem: `Una estrella esférica se comporta como un cuerpo negro con radio ${fmt(R, 2)} m y temperatura superficial ${T} K.`,
            data: "σ = 5,67 × 10⁻⁸ W m⁻² K⁻⁴",
            parts: [
              part("(a)", "Calcule la luminosidad de la estrella.", [
                val("M1", `A = 4πR² = ${fmt(A)} m²`, A, "área 4πR²"),
                val("A1", `L = σAT⁴ = ${fmt(L)} W`, L),
              ], [`A = 4 π R² = 4π × (${fmt(R, 2)})² = ${fmt(A)} m²`, `L = σ A T⁴ = 5,67 × 10⁻⁸ × ${fmt(A)} × ${T}⁴`, `L = ${fmt(L)} W`]),
              part("(b)", `Con el mismo radio, la temperatura superficial se multiplica por ${fmt(f, 2)}. Calcule la nueva luminosidad.`, [
                method("L ∝ T⁴", /T\s*\^?\s*4|T⁴|\^\s*4|fuerza\s*4|cuarta/i, Math.pow(f, 4), "L ∝ T⁴"),
                val("A1", `L′ = ${fmt(L2)} W`, L2),
              ], [`L ∝ T⁴ → L′ = L × ${fmt(f, 2)}⁴ = L × ${fmt(Math.pow(f, 4))}`, `L′ = ${fmt(L)} × ${fmt(Math.pow(f, 4))}`, `L′ = ${fmt(L2)} W`]),
            ],
          };
        },
      },
      {
        id: "wien", label: "Ley de Wien y espectro de cuerpo negro", keywords: ["wien", "longitud de onda maxima", "espectro", "color de una estrella"],
        make: (r) => {
          const lm = pick(r, [300, 400, 500, 600, 725]), lmm = lm * 1e-9, T = WIEN / lmm;
          const xr: [number, number] = [0, 3 * lm], yr: [number, number] = [0, 1.2], pk = planck(1);
          const pts: [number, number][] = [];
          for (let x = 0.2; x <= 3.001; x += 0.05) pts.push([x * lm, planck(x) / pk]);
          const gm = gmap(45, 26, 280, 140, xr, yr);
          const lm2 = pick(r, [lm * 2, lm * 1.5]), T2 = WIEN / (lm2 * 1e-9);
          return {
            fig: {
              w: 360, h: 215, alt: `Espectro de una estrella: la intensidad de la radiación según la longitud de onda, con máximo en ${lm} nm`,
              items: [
                { t: "graph", x: 45, y: 26, w: 280, h: 140, xr, yr, xlabel: "λ / nm", ylabel: "intensidad (u. arb.)", xticks: [lm, 2 * lm, 3 * lm], series: [{ pts }] },
                { t: "line", x1: gm.X(lm), y1: gm.Y(1), x2: gm.X(lm), y2: gm.Y(0), dash: true, gray: true, w: 1 },
              ],
            },
            stem: "La gráfica muestra el espectro de la radiación emitida por una estrella, que se comporta como un cuerpo negro.",
            data: "Constante de Wien: λmáx T = 2,90 × 10⁻³ m K",
            parts: [
              part("(a)", "Determine la temperatura superficial de la estrella.", [
                val("M1", `λmáx = ${lm} nm = ${fmt(lmm, 3)} m`, lmm, "λmáx en m"),
                val("A1", `T = ${fmt(WIEN, 3)} / λmáx = ${fmt(T)} K`, T),
              ], [`De la gráfica, λmáx = ${lm} nm = ${fmt(lmm, 3)} m`, `T = (2,90 × 10⁻³) / ${fmt(lmm, 3)}`, `T = ${fmt(T)} K`]),
              part("(b)", `Otra estrella tiene su máximo en ${lm2} nm. Calcule su temperatura superficial.`, [
                val("A1", `T = ${fmt(T2)} K`, T2),
              ], [`T = (2,90 × 10⁻³) / (${lm2} × 10⁻⁹)`, `T = ${fmt(T2)} K`]),
              part("(c)", "Indique cómo cambiaría la posición del máximo si la estrella se enfriara.", [
                reason("El máximo se desplaza hacia longitudes de onda mayores", "λmáx aumenta (hacia el rojo)", "mayor", "aumenta", "largas", "rojo", "derecha", "infrarrojo"),
              ], ["λmáx ∝ 1/T: si T disminuye, el máximo se desplaza hacia longitudes de onda mayores (hacia el rojo)."]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "B2", unit: "B", name: "B.2 Efecto invernadero",
    concepts: [
      {
        id: "albedo", label: "Albedo y potencia absorbida", keywords: ["albedo", "constante solar", "radiacion reflejada", "potencia absorbida"],
        make: (r) => {
          const S = 1360, a = pick(r, [0.25, 0.30, 0.35, 0.40]), Re = 6.37e6;
          const Iabs = (S * (1 - a)) / 4, P = S * (1 - a) * Math.PI * Re * Re;
          return {
            fig: {
              w: 360, h: 190, alt: `Luz solar de intensidad ${S} W m⁻² que llega a la Tierra y una fracción α que se refleja`,
              items: [
                arrow(20, 70, 125, 70), arrow(20, 95, 125, 95), arrow(20, 120, 125, 120),
                txt(20, 55, `S = ${S} W m⁻²`, "start"),
                { t: "circle", cx: 200, cy: 95, r: 55, fill: "light" },
                txt(200, 100, "Tierra"),
                arrow(135, 60, 80, 20), arrow(133, 130, 80, 170),
                txt(95, 14, "luz reflejada", "start"), txt(95, 185, "(fracción α)", "start"),
              ],
            },
            stem: `La intensidad de la radiación solar que llega a la Tierra, perpendicular a los rayos, es S = ${S} W m⁻². El albedo medio de la Tierra es ${f2(a)}. Tome el radio de la Tierra como 6,37 × 10⁶ m.`,
            parts: [
              part("(a)", "Calcule la intensidad media absorbida por unidad de superficie terrestre.", [
                val("M1", `El área que intercepta la luz es πR² y la superficie es 4πR²: S/4 = ${fmt(S / 4)} W m⁻²`, S / 4, "factor 1/4"),
                val("A1", `I = S(1 − α)/4 = ${fmt(Iabs)} W m⁻²`, Iabs),
              ], [`La Tierra intercepta πR² y tiene superficie 4πR²: S / 4 = ${S} / 4 = ${fmt(S / 4)} W m⁻²`, `I = S(1 − α) / 4 = ${fmt(S / 4)} × ${f2(1 - a)}`, `I = ${fmt(Iabs)} W m⁻²`]),
              part("(b)", "Calcule la potencia total absorbida por la Tierra.", [
                method("P = S(1 − α)πR²", /π\s*R|pi\s*R|R\^?2|R²|\(1\s*[−-]\s*α/i, Math.PI * Re * Re, "área πR²"),
                val("A1", `P = ${fmt(P)} W`, P),
              ], [`P = S (1 − α) π R²`, `P = ${S} × ${f2(1 - a)} × π × (6,37 × 10⁶)²`, `P = ${fmt(P)} W`]),
            ],
          };
        },
      },
      {
        id: "intensidadsolar", label: "Intensidad de la radiación solar y distancia", keywords: ["intensidad", "ley del inverso del cuadrado", "luminosidad del sol", "distancia al sol"],
        make: (r) => {
          const pl = pick(r, [{ n: "Venus", d: 1.08e11 }, { n: "la Tierra", d: 1.50e11 }, { n: "Marte", d: 2.28e11 }, { n: "Júpiter", d: 7.78e11 }]);
          const Ls = 3.85e26, I = Ls / (4 * Math.PI * pl.d * pl.d), I2 = I / 4;
          return {
            fig: {
              w: 360, h: 140, alt: `Sol y ${pl.n} separados una distancia d = ${fmt(pl.d, 3)} m`,
              items: [
                { t: "circle", cx: 70, cy: 60, r: 30, fill: "light" }, txt(70, 65, "Sol"),
                { t: "circle", cx: 290, cy: 60, r: 9, fill: "dark" }, txt(290, 90, pl.n.charAt(0).toUpperCase() + pl.n.slice(1)),
                { t: "line", x1: 100, y1: 60, x2: 281, y2: 60, arrow: "both", w: 1.1 },
                txt(190, 50, `d = ${fmt(pl.d, 3)} m`),
              ],
            },
            stem: `El Sol emite una potencia total L = 3,85 × 10²⁶ W de forma uniforme en todas las direcciones. Considere ${pl.n}, a una distancia d = ${fmt(pl.d, 3)} m del Sol.`,
            parts: [
              part("(a)", `Calcule la intensidad de la radiación solar al llegar a ${pl.n}.`, [
                method("I = L / 4πd²", /4\s*π|4\s*pi|L\s*\/|d\^?2|d²/i, 4 * Math.PI * pl.d * pl.d, "área esférica 4πd²"),
                val("A1", `I = ${fmt(I)} W m⁻²`, I),
              ], [`I = L / (4π d²)`, `I = 3,85 × 10²⁶ / (4π × (${fmt(pl.d, 3)})²)`, `I = ${fmt(I)} W m⁻²`]),
              part("(b)", "Un cometa se encuentra al doble de distancia del Sol que ese planeta. Determine la intensidad solar en el cometa.", [
                method("I ∝ 1/d²", /1\s*\/\s*d|d\^?2|d²|cuarta|\/\s*4|÷\s*4|1\/4|¼/i, I2, "I ∝ 1/d²"),
                val("A1", `I = ${fmt(I2)} W m⁻²`, I2),
              ], ["I ∝ 1/d²: al duplicar d, la intensidad se divide por 4", `I = ${fmt(I)} / 4`, `I = ${fmt(I2)} W m⁻²`]),
            ],
          };
        },
      },
      {
        id: "tempequilibrio", label: "Temperatura de equilibrio de un planeta", keywords: ["temperatura de equilibrio", "equilibrio radiativo", "temperatura de un planeta", "balance de potencia"],
        make: (r) => {
          const pl = pick(r, [{ n: "un planeta A", S: 1360, a: 0.30 }, { n: "un planeta B", S: 590, a: 0.25 }, { n: "un planeta C", S: 2600, a: 0.75 }, { n: "un planeta D", S: 1360, a: 0.10 }]);
          const Iabs = (pl.S * (1 - pl.a)) / 4, T = Math.pow(Iabs / SIGMA, 0.25);
          return {
            stem: `${pl.n[0].toUpperCase() + pl.n.slice(1)} sin atmósfera recibe del Sol una intensidad S = ${pl.S} W m⁻² y tiene un albedo de ${f2(pl.a)}. Se comporta como un cuerpo negro en el infrarrojo.`,
            data: "σ = 5,67 × 10⁻⁸ W m⁻² K⁻⁴",
            parts: [
              part("(a)", "Calcule la intensidad media absorbida por la superficie del planeta.", [val("A1", `I = S(1 − α)/4 = ${fmt(Iabs)} W m⁻²`, Iabs)], [`I = S (1 − α) / 4 = ${pl.S} × ${f2(1 - pl.a)} / 4`, `I = ${fmt(Iabs)} W m⁻²`]),
              part("(b)", "Determine la temperatura de equilibrio del planeta.", [
                method("En equilibrio, potencia emitida = potencia absorbida: σT⁴ = I", /σ\s*T|sigma\s*T|T\^?4|T⁴/i, Iabs, "σT⁴ = I"),
                val("A1", `T = (I / σ)^¼ = ${fmt(T)} K`, T),
              ], ["En equilibrio: σ T⁴ = I", `T⁴ = ${fmt(Iabs)} / 5,67 × 10⁻⁸ = ${fmt(Iabs / SIGMA)}`, `T = ${fmt(T)} K`]),
              part("(c)", "La temperatura media medida en la superficie es mayor que este valor. Sugiera una razón.", [
                reason("Una atmósfera con gases de efecto invernadero absorbe la radiación infrarroja y la devuelve a la superficie", "efecto invernadero de la atmósfera", "invernadero", "atmosfera", "infrarroj", "absorbe"),
              ], ["La atmósfera, con gases de efecto invernadero, absorbe parte de la radiación infrarroja emitida y la reemite hacia la superficie, que se calienta más."]),
            ],
          };
        },
      },
      {
        id: "emisividad", label: "Emisividad y potencia emitida", keywords: ["emisividad", "potencia emitida", "emisor real", "cuerpo gris"],
        make: (r) => {
          const R = pick(r, [0.50, 1.0, 2.0]), T = pick(r, [250, 300, 350, 400]), e = pick(r, [0.6, 0.8, 0.9]);
          const A = 4 * Math.PI * R * R, P = e * SIGMA * A * Math.pow(T, 4), T2 = T * Math.pow(2, 0.25);
          return {
            stem: `Un satélite esférico de ${f2(R)} m de radio tiene una superficie a ${T} K con emisividad e = ${f2(e)}.`,
            data: "σ = 5,67 × 10⁻⁸ W m⁻² K⁻⁴",
            parts: [
              part("(a)", "Calcule la potencia total que emite el satélite.", [
                val("M1", `A = 4πR² = ${fmt(A)} m²`, A, "A = 4πR²"),
                val("A1", `P = eσAT⁴ = ${fmt(P)} W`, P),
              ], [`A = 4π R² = 4π × ${f2(R)}² = ${fmt(A)} m²`, `P = e σ A T⁴ = ${f2(e)} × 5,67 × 10⁻⁸ × ${fmt(A)} × ${T}⁴`, `P = ${fmt(P)} W`]),
              part("(b)", "Se cambia el recubrimiento y la emisividad se reduce a la mitad. Determine la temperatura que debe tener la superficie para emitir la misma potencia.", [
                method("e T⁴ constante: T⁴ se duplica", /T\s*\^?4|T⁴|\^\s*4|duplic|\bx\s*2\b|×\s*2|2\s*\^\s*\(?\s*(1\/4|0[.,]25)/i, T2, "e T⁴ = constante"),
                val("A1", `T′ = T × 2^¼ = ${fmt(T2)} K`, T2),
              ], ["P = e σ A T⁴ constante: con e/2, T⁴ debe duplicarse", `T′ = ${T} × 2^(1/4)`, `T′ = ${fmt(T2)} K`]),
            ],
          };
        },
      },
      {
        id: "balance", label: "Balance energético de la Tierra (flujos)", keywords: ["balance energetico", "flujos de energia", "radiacion de retorno", "atmosfera"],
        make: (r) => {
          const I = 340, a = pick(r, [0.28, 0.30, 0.32]), Rf = Math.round(I * a), out = I - Rf;
          const Ss = pick(r, [150, 160, 170]), U = pick(r, [380, 390, 400]), B = U - Ss;
          return {
            fig: {
              w: 380, h: 225, alt: `Flujos de energía en W m⁻²: entran ${I}, se reflejan ${Rf}, la superficie absorbe ${Ss} y emite ${U}; la radiación de retorno y la emitida al espacio son desconocidas`,
              items: [
                { t: "rect", x: 15, y: 75, w: 350, h: 50, fill: "light" },
                txt(190, 105, "atmósfera"),
                { t: "ground", x1: 15, y1: 195, x2: 365, y2: 195 },
                txt(190, 213, "superficie"),
                txt(190, 14, "espacio"),
                arrow(45, 22, 45, 75), txt(55, 45, `${I}`, "start"),
                arrow(100, 75, 100, 22), txt(108, 45, `${Rf}`, "start"),
                arrow(155, 75, 155, 195), txt(163, 165, `${Ss}`, "start"),
                arrow(215, 195, 215, 125), txt(223, 165, `${U}`, "start"),
                arrow(275, 125, 275, 190), txt(283, 165, "B = ?", "start"),
                arrow(335, 75, 335, 22), txt(327, 45, "E = ?", "end"),
              ],
            },
            stem: `El diagrama muestra los flujos de energía, en W m⁻², para la Tierra en equilibrio: la radiación solar incidente, la reflejada, la absorbida por la superficie, la infrarroja que emite la superficie, la radiación de retorno B que la atmósfera dirige a la superficie y la infrarroja E que sale al espacio. Ignore las demás transferencias. El albedo de la Tierra es ${f2(a)}.`,
            parts: [
              part("(a)", "Determine la energía por unidad de área y tiempo, E, que sale al espacio.", [
                reason("En equilibrio, la energía que sale es igual a la que entra y no se refleja", "entra = sale en equilibrio", "equilibrio", "igual", "absorb", "entra", "no se refleja"),
                val("A1", `E = ${I} − ${Rf} = ${fmt(out)} W m⁻²`, out),
              ], ["En equilibrio, la energía que sale es igual a la absorbida por el sistema Tierra–atmósfera", `E = ${I} − ${Rf}`, `E = ${fmt(out)} W m⁻²`]),
              part("(b)", "Determine la radiación de retorno B que llega a la superficie desde la atmósfera.", [
                method("Superficie en equilibrio: potencia que absorbe = potencia que emite", /B\s*\+|\+\s*B|[Ss]s?\s*\+|recibe|absorbe|emite/i, Ss + B, "absorbido = emitido"),
                val("A1", `B = ${U} − ${Ss} = ${fmt(B)} W m⁻²`, B),
              ], [`Para la superficie: ${Ss} + B = ${U}`, `B = ${U} − ${Ss}`, `B = ${fmt(B)} W m⁻²`]),
              part("(c)", "Explique por qué la superficie emite más energía de la que sale al espacio.", [
                reason("La atmósfera absorbe la radiación infrarroja de la superficie y devuelve parte de ella (efecto invernadero)", "atmósfera absorbe y reemite IR", "atmosfera", "invernadero", "absorbe", "devuelve", "reemite", "retorno"),
              ], ["Los gases de efecto invernadero de la atmósfera absorben parte de la radiación infrarroja de la superficie y la reemiten en todas direcciones, también hacia abajo; solo una parte escapa al espacio."]),
            ],
          };
        },
      },
      {
        id: "gei", label: "Gases de efecto invernadero y radiación infrarroja", keywords: ["gases de efecto invernadero", "infrarrojo", "co2", "resonancia"],
        make: (r) => {
          const Te = pick(r, [255, 288, 300]), Ts = pick(r, [5500, 5800, 6000]);
          const le = WIEN / Te, ls = WIEN / Ts;
          return {
            stem: `La superficie terrestre, a unos ${Te} K, emite como un cuerpo negro, mientras que la superficie del Sol está a ${Ts} K.`,
            data: "λmáx T = 2,90 × 10⁻³ m K",
            parts: [
              part("(a)", "Calcule la longitud de onda del máximo de emisión de la radiación terrestre.", [
                method("Ley de Wien: λmáx = 2,90 × 10⁻³ / T", /wien|2[.,]9\s*[x×*]|2[.,]90?\s*[x×*]|\/\s*T/i, le, "ley de Wien"),
                val("A1", `λmáx = ${fmt(le)} m`, le),
              ], [`λmáx = (2,90 × 10⁻³) / T = (2,90 × 10⁻³) / ${Te}`, `λmáx = ${fmt(le)} m (infrarrojo)`]),
              part("(b)", "Compare el máximo de la radiación terrestre con el del Sol y explique por qué los gases de efecto invernadero absorben la infrarroja terrestre pero dejan pasar casi toda la luz visible del Sol.", [
                valAny("A1", `λ del Sol = ${fmt(ls)} m (visible), mucho menor que la terrestre`, [ls, ls * 1e9, ls * 1e6]),
                reason("Las moléculas (CO₂, H₂O, CH₄) tienen frecuencias naturales de vibración en el infrarrojo y absorben por resonancia", "resonancia con las vibraciones moleculares", "vibra", "resona", "frecuencia natural", "frecuencias naturales", "enlace"),
              ], [`λmáx del Sol = ${fmt(ls)} m (visible)`, "La radiación terrestre tiene longitudes de onda mucho mayores (infrarrojo).", "Las moléculas de CO₂, H₂O y CH₄ tienen frecuencias naturales de vibración en el infrarrojo y absorben esa radiación por resonancia; el visible tiene frecuencias que no coinciden."]),
              part("(c)", "Explique cómo un aumento de la concentración de gases de efecto invernadero eleva la temperatura media de la superficie.", [
                reason("Se absorbe y reemite más infrarrojo hacia la superficie; hasta que la superficie emite más, la temperatura sube", "más IR reemitido a la superficie, T sube", "reemite", "devuelve", "hacia la superficie", "retiene", "mas infrarrojo", "mayor temperatura", "aumenta la temperatura"),
              ], ["Se absorbe y reemite más radiación infrarroja hacia la superficie; ésta se calienta hasta emitir lo suficiente para restablecer el equilibrio, así que la temperatura media aumenta."]),
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
      {
        id: "boyle", label: "Ley de Boyle (compresión isotérmica)", keywords: ["boyle", "isotermico", "temperatura constante", "p1v1 = p2v2"],
        make: (r) => {
          const p1 = pick(r, [100, 150, 200]), V1 = pick(r, [6.0, 12]), k = pick(r, [2, 3, 4]);
          const V2 = V1 / k, p2 = p1 * k, pV = p1 * V1;
          const xr: [number, number] = [0, V1 * 1.5], yr: [number, number] = [0, p1 * k * 1.4];
          const gm = gmap(60, 24, 260, 140, xr, yr);
          const pts: [number, number][] = [];
          for (let i = 0; i <= 40; i++) { const V = V2 * 0.75 + ((V1 * 1.45 - V2 * 0.75) * i) / 40; pts.push([V, (pV) / V]); }
          return {
            fig: {
              w: 360, h: 215, alt: `Gráfica p–V de una compresión isotérmica: curva decreciente que pasa por el estado inicial (${fmt(V1, 2)} dm³, ${p1} kPa)`,
              items: [
                { t: "graph", x: 60, y: 24, w: 260, h: 140, xr, yr, xlabel: "V / dm³", ylabel: "p / kPa", xticks: [V2, V1], yticks: [p1], series: [{ pts }] },
                { t: "line", x1: gm.X(V1), y1: gm.Y(p1), x2: gm.X(V1), y2: gm.Y(0), dash: true, gray: true, w: 1 },
                { t: "line", x1: gm.X(0), y1: gm.Y(p1), x2: gm.X(V1), y2: gm.Y(p1), dash: true, gray: true, w: 1 },
                { t: "line", x1: gm.X(V2), y1: gm.Y(yr[1] * 0.93), x2: gm.X(V2), y2: gm.Y(0), dash: true, gray: true, w: 1 },
                { t: "dot", x: gm.X(V1), y: gm.Y(p1) }, txt(gm.X(V1) + 8, gm.Y(p1) - 8, "1", "start"),
              ],
            },
            stem: `Un gas ideal encerrado en un cilindro con émbolo está en el estado 1: p₁ = ${p1} kPa y V₁ = ${fmt(V1, 2)} dm³, como indica la gráfica. Se comprime lentamente, a temperatura constante, hasta que su volumen es ${fmt(V2, 3)} dm³.`,
            parts: [
              part("(a)", "Calcule el producto pV del gas en el estado 1, en julios.", [val("A1", `pV = ${p1} kPa × ${fmt(V1, 2)} dm³ = ${fmt(pV)} J`, pV)], [`p V = ${p1} × 10³ × ${fmt(V1, 2)} × 10⁻³`, `p V = ${fmt(pV)} J`]),
              part("(b)", "Determine la presión del gas al final de la compresión.", [
                method("Temperatura constante: p₁V₁ = p₂V₂", /p\s*[₁1]\s*V\s*[₁1]|pV|p\s*V|constante/i, pV, "p₁V₁ = p₂V₂"),
                val("A1", `p₂ = ${fmt(p2)} kPa`, p2),
              ], ["T constante: p₁ V₁ = p₂ V₂", `p₂ = p₁ V₁ / V₂ = ${p1} × ${fmt(V1, 2)} / ${fmt(V2, 3)}`, `p₂ = ${fmt(p2)} kPa`]),
              part("(c)", "Explique, usando el modelo cinético, por qué aumenta la presión.", [
                reason("Al disminuir el volumen, las moléculas chocan con las paredes más a menudo (a la misma temperatura)", "choques más frecuentes con las paredes", "frecuen", "mas choques", "mas colisiones", "mas veces", "mayor numero de choques", "mayor numero de colisiones", "a menudo"),
              ], ["La temperatura (la rapidez media de las moléculas) no cambia, pero en menos volumen las moléculas chocan con las paredes más a menudo, así que la fuerza media por unidad de área aumenta."]),
            ],
          };
        },
      },
      {
        id: "energiacinetica", label: "Energía cinética media y rapidez de las moléculas", keywords: ["energia cinetica media", "3/2 kt", "rapidez cuadratica media", "rms"],
        make: (r) => {
          const gas = pick(r, [{ n: "helio", M: 4.0 }, { n: "neón", M: 20 }, { n: "nitrógeno", M: 28 }, { n: "oxígeno", M: 32 }, { n: "argón", M: 40 }]);
          const T = pick(r, [250, 300, 350, 400]), f = pick(r, [4, 9]);
          const Ek = 1.5 * KB * T, m = gas.M * U1, v = Math.sqrt((2 * Ek) / m), fv = Math.sqrt(f);
          return {
            stem: `Una muestra de ${gas.n} (masa molar relativa ${gas.M}) se comporta como un gas ideal a ${T} K.`,
            data: "kB = 1,38 × 10⁻²³ J K⁻¹; 1 u = 1,66 × 10⁻²⁷ kg",
            parts: [
              part("(a)", "Calcule la energía cinética media de traslación de una molécula.", [val("A1", `Ek = (3/2) kB T = ${fmt(Ek)} J`, Ek)], [`Ek = (3/2) kB T = 1,5 × 1,38 × 10⁻²³ × ${T}`, `Ek = ${fmt(Ek)} J`]),
              part("(b)", "Determine la rapidez cuadrática media de las moléculas.", [
                val("M1", `m = ${gas.M} × 1,66 × 10⁻²⁷ = ${fmt(m)} kg`, m, "masa de una molécula"),
                val("A1", `v = √(2Ek / m) = ${fmt(v)} m s⁻¹`, v),
              ], [`m = ${gas.M} × 1,66 × 10⁻²⁷ = ${fmt(m)} kg`, `½ m v² = Ek  →  v = √(2 Ek / m) = √(2 × ${fmt(Ek)} / ${fmt(m)})`, `v = ${fmt(v)} m s⁻¹`]),
              part("(c)", `La temperatura absoluta se multiplica por ${f}. Determine el factor por el que cambia la rapidez cuadrática media.`, [val("A1", `v ∝ √T: factor = √${f} = ${fmt(fv)}`, fv)], [`Ek ∝ T y v ∝ √T`, `factor = √${f} = ${fmt(fv)}`]),
            ],
          };
        },
      },
      {
        id: "moleculas", label: "Número de moles y de moléculas", keywords: ["numero de moleculas", "moles", "avogadro", "densidad de moleculas"],
        make: (r) => {
          const p = pick(r, [1.0e5, 2.0e5, 5.0e4]), V = pick(r, [2.0, 4.0, 5.0]), Tc = pick(r, [17, 27, 47]);
          const T = Tc + 273, n = (p * V * 1e-3) / (R_GAS * T), N = n * NA, d = N / (V * 1e-3);
          return {
            fig: {
              w: 360, h: 190, alt: `Cilindro con émbolo que contiene un gas a ${fmt(p, 2)} Pa, ${f2(V)} dm³ y ${Tc} °C`,
              items: [
                { t: "poly", pts: [110, 30, 110, 150, 250, 150, 250, 30] },
                { t: "rect", x: 111, y: 70, w: 138, h: 79, fill: "light", sw: 0.5 },
                { t: "rect", x: 108, y: 60, w: 144, h: 10, fill: "dark" },
                { t: "line", x1: 180, y1: 60, x2: 180, y2: 20, w: 3 },
                txt(180, 118, "gas"),
                txt(265, 100, `${Tc} °C`, "start"), txt(265, 116, `p = ${fmt(p, 2)} Pa`, "start"), txt(265, 132, `V = ${f2(V)} dm³`, "start"),
              ],
            },
            stem: `Un cilindro con émbolo contiene un gas ideal a una presión de ${fmt(p, 2)} Pa, con un volumen de ${f2(V)} dm³ y a ${Tc} °C.`,
            data: "R = 8,31 J K⁻¹ mol⁻¹; NA = 6,02 × 10²³ mol⁻¹",
            parts: [
              part("(a)", "Calcule la cantidad de gas, en moles.", [
                val("M1", `T = ${T} K y V = ${fmt(V * 1e-3, 2)} m³`, T, "T en kelvin"),
                val("A1", `n = pV / RT = ${fmt(n)} mol`, n),
              ], [`T = ${Tc} + 273 = ${T} K;  V = ${f2(V)} dm³ = ${fmt(V * 1e-3, 2)} m³`, `n = pV / RT = ${fmt(p, 2)} × ${fmt(V * 1e-3, 2)} / (8,31 × ${T})`, `n = ${fmt(n)} mol`]),
              part("(b)", "Determine el número de moléculas.", [val("A1", `N = nNA = ${fmt(N)}`, N)], [`N = n NA = ${fmt(n)} × 6,02 × 10²³`, `N = ${fmt(N)}`]),
              part("(c)", "Calcule el número de moléculas por metro cúbico.", [val("A1", `N / V = ${fmt(d)} m⁻³`, d)], [`N / V = ${fmt(N)} / ${fmt(V * 1e-3, 2)}`, `N / V = ${fmt(d)} m⁻³`]),
            ],
          };
        },
      },
      {
        id: "presioncinetica", label: "Presión y modelo cinético", keywords: ["modelo cinetico", "presion de un gas", "choques con las paredes", "densidad"],
        make: (r) => {
          const rho = pick(r, [0.90, 1.20, 1.80, 2.40]), c = pick(r, [400, 450, 500, 600]), f = pick(r, [1.2, 1.5]);
          const p = (rho * c * c) / 3, p2 = p * f * f;
          return {
            fig: {
              w: 360, h: 170, alt: "Recipiente cúbico con una molécula de gas que rebota contra las paredes",
              items: [
                { t: "rect", x: 100, y: 25, w: 130, h: 110 },
                { t: "poly", pts: [120, 120, 160, 50, 200, 110, 224, 70], w: 1.3, arrow: "end" },
                { t: "dot", x: 120, y: 120, r: 4 },
                txt(240, 80, "molécula", "start", 12),
                txt(165, 155, `ρ = ${f2(rho)} kg m⁻³`),
              ],
            },
            stem: `Un gas ideal de densidad ${f2(rho)} kg m⁻³ está en un recipiente rígido. La rapidez cuadrática media de sus moléculas es ${c} m s⁻¹.`,
            parts: [
              part("(a)", "Calcule la presión del gas.", [
                method("p = ⅓ρ⟨c²⟩", /ρ|rho|⅓|1\s*\/\s*3|c\^?2|c²/i, (c * c) / 3, "p = ⅓ρ⟨c²⟩"),
                val("A1", `p = ρ⟨c²⟩ / 3 = ${fmt(p)} Pa`, p),
              ], ["p = (1/3) ρ ⟨c²⟩", `p = (1/3) × ${f2(rho)} × ${c}²`, `p = ${fmt(p)} Pa`]),
              part("(b)", `Se calienta el gas sin cambiar el volumen y la rapidez cuadrática media aumenta un factor ${fmt(f, 2)}. Calcule la nueva presión.`, [
                method("p ∝ c² a densidad constante", /c\s*\^?2|c²|f\s*\^?2|cuadrad|\^\s*2/i, f * f, "p ∝ c²"),
                val("A1", `p′ = ${fmt(p2)} Pa`, p2),
              ], ["La densidad no cambia, así que p ∝ ⟨c²⟩", `p′ = ${fmt(p)} × ${fmt(f, 2)}² = ${fmt(p)} × ${fmt(f * f)}`, `p′ = ${fmt(p2)} Pa`]),
              part("(c)", "Explique, a nivel molecular, por qué aumenta la presión al calentar el gas.", [
                reason("Las moléculas se mueven más rápido: chocan con más frecuencia y con mayor fuerza", "más rápidas: más frecuentes y más fuertes los choques", "mas rapid", "mayor rapidez", "mayor velocidad", "mas fuerza", "mayor fuerza", "mas frecuen", "mayor frecuencia", "mayor cambio de momento"),
              ], ["Las moléculas tienen mayor rapidez media: chocan con las paredes más a menudo y con mayor cambio de momento en cada choque, por lo que la fuerza media por unidad de área aumenta."]),
            ],
          };
        },
      },
      {
        id: "gasreal", label: "Gas real frente a gas ideal", keywords: ["gas real", "cero absoluto", "extrapolar", "fuerzas intermoleculares"],
        make: (r) => {
          const p0 = pick(r, [110, 140, 165, 190]), Vg = pick(r, [5, 10, 15, 20]), p100 = Math.round(p0 * (1 + 100 / 273)), kk = (p100 - p0) / 100;
          const xr: [number, number] = [-300, 100], yr: [number, number] = [0, p100 * 1.2];
          const th = [0, 20, 40, 60, 80, 100];
          return {
            fig: {
              w: 360, h: 215, alt: `Presión de un gas a volumen constante según la temperatura en °C: puntos alineados entre 0 °C (${fmt(p0, 3)} kPa) y 100 °C (${fmt(p100, 3)} kPa)`,
              items: [
                { t: "graph", x: 45, y: 26, w: 280, h: 140, xr, yr, xlabel: "θ / °C", ylabel: "p / kPa", xticks: [-300, -200, -100, 100], yticks: [p0, p100], grid: true, series: [{ pts: th.map((t): [number, number] => [t, p0 + kk * t]) }, { pts: th.map((t): [number, number] => [t, p0 + kk * t]), dots: true }] },
              ],
            },
            stem: `Se mide la presión de una cantidad fija de un gas en un recipiente rígido de ${Vg} dm³ a distintas temperaturas. La gráfica muestra los resultados.`,
            parts: [
              part("(a)", "Determine el gradiente de la recta.", [
                method("Gradiente = Δp / Δθ", /Δ\s*p|\/\s*100|p\s*[₂2]|gradiente|pendiente/i, p100 - p0, "Δp / Δθ"),
                val("A1", `gradiente = ${fmt(kk)} kPa °C⁻¹`, kk),
              ], [`Gradiente = Δp / Δθ = (${fmt(p100, 3)} − ${fmt(p0, 3)}) / (100 − 0)`, `gradiente = ${fmt(kk)} kPa °C⁻¹`]),
              part("(b)", "Extrapolando la recta, estime la temperatura a la que la presión sería cero.", [valAny("A1", "θ ≈ −273 °C", [-p0 / kk])], [`p = 0 cuando θ = −p₀ / gradiente = −${fmt(p0, 3)} / ${fmt(kk)}`, `θ = ${fmt(-p0 / kk, 3)} °C ≈ −273 °C`]),
              part("(c)", "Sugiera por qué un gas real no se comporta como ideal a temperaturas muy bajas.", [
                reason("A baja temperatura actúan las fuerzas intermoleculares y el gas se condensa", "fuerzas intermoleculares / licuación", "fuerza", "atraccion", "intermolecular", "licu", "condens", "volumen de las moleculas", "interaccion"),
              ], ["Al enfriarse, la energía cinética de las moléculas es menor y las fuerzas de atracción entre ellas dejan de ser despreciables; el gas termina condensándose, así que la presión no llega a cero."]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "B4", unit: "B", name: "B.4 Termodinámica", hl: true,
    concepts: [
      {
        id: "primeraley", label: "Primera ley de la termodinámica", keywords: ["primera ley", "energia interna", "q = δu + w", "calentar a presion constante"],
        make: (r) => {
          const n = pick(r, [0.50, 1.0, 2.0]), T1 = pick(r, [300, 320, 350]), dT = pick(r, [20, 40, 60]), T2 = T1 + dT;
          const dU = 1.5 * n * R_GAS * dT, W = n * R_GAS * dT, Q = dU + W;
          return {
            fig: {
              w: 360, h: 190, alt: "Gas en un cilindro con émbolo móvil: entra energía térmica Q por debajo y el gas realiza trabajo W al empujar el émbolo",
              items: [
                { t: "poly", pts: [130, 40, 130, 140, 230, 140, 230, 40] },
                { t: "rect", x: 131, y: 70, w: 98, h: 69, fill: "light", sw: 0.5 },
                { t: "rect", x: 128, y: 60, w: 104, h: 10, fill: "dark" },
                arrow(180, 56, 180, 18), txt(192, 24, "W", "start"),
                arrow(180, 182, 180, 146), txt(192, 172, "Q", "start"),
                txt(180, 110, "gas"),
              ],
            },
            stem: `${f2(n)} mol de un gas ideal monoatómico se calientan a presión constante de ${T1} K a ${T2} K. El gas se expande empujando el émbolo.`,
            data: "R = 8,31 J K⁻¹ mol⁻¹",
            parts: [
              part("(a)", "Calcule el aumento de la energía interna del gas.", [
                val("M1", `ΔT = ${dT} K`, dT, "ΔT"),
                val("A1", `ΔU = (3/2) nRΔT = ${fmt(dU)} J`, dU),
              ], [`ΔT = ${T2} − ${T1} = ${dT} K`, `ΔU = (3/2) n R ΔT = 1,5 × ${f2(n)} × 8,31 × ${dT}`, `ΔU = ${fmt(dU)} J`]),
              part("(b)", "Determine el trabajo realizado por el gas.", [val("A1", `W = pΔV = nRΔT = ${fmt(W)} J`, W)], ["A presión constante, W = p ΔV = n R ΔT", `W = ${f2(n)} × 8,31 × ${dT}`, `W = ${fmt(W)} J`]),
              part("(c)", "Calcule la energía térmica que recibe el gas.", [
                method("Primera ley: Q = ΔU + W", /ΔU\s*\+\s*W|Q\s*=|U\s*\+\s*W/i, dU + W, "Q = ΔU + W"),
                val("A1", `Q = ${fmt(Q)} J`, Q),
              ], ["Q = ΔU + W", `Q = ${fmt(dU)} + ${fmt(W)}`, `Q = ${fmt(Q)} J`]),
            ],
          };
        },
      },
      {
        id: "trabajopv", label: "Trabajo y ciclos en un diagrama p–V", keywords: ["diagrama p-v", "trabajo del gas", "area bajo la curva", "ciclo"],
        make: (r) => {
          const V1 = pick(r, [2, 3, 4]), V2 = V1 + pick(r, [2, 4]), p1 = pick(r, [100, 150, 200]), p2 = p1 + pick(r, [100, 200]);
          const WAB = p2 * (V2 - V1), Wnet = 0.5 * (V2 - V1) * (p2 - p1);
          const xr: [number, number] = [0, V2 + 2], yr: [number, number] = [0, p2 * 1.25];
          const gm = gmap(60, 24, 260, 140, xr, yr);
          return {
            fig: {
              w: 360, h: 215, alt: `Ciclo de un gas en un diagrama p–V: A (${V1} dm³, ${p2} kPa) a B (${V2} dm³, ${p2} kPa) a presión constante, B a C (${V2} dm³, ${p1} kPa) a volumen constante y C de vuelta a A en línea recta`,
              items: [
                { t: "graph", x: 60, y: 24, w: 260, h: 140, xr, yr, xlabel: "V / dm³", ylabel: "p / kPa", xticks: [V1, V2], yticks: [p1, p2], grid: true, series: [{ pts: [[V1, p2], [V2, p2], [V2, p1], [V1, p2]] }] },
                txt(gm.X(V1) - 10, gm.Y(p2) - 6, "A"), txt(gm.X(V2) + 10, gm.Y(p2) - 6, "B"), txt(gm.X(V2) + 10, gm.Y(p1) + 14, "C"),
                { t: "poly", pts: [gm.X(V1 + (V2 - V1) * 0.4), gm.Y(p2), gm.X(V1 + (V2 - V1) * 0.6), gm.Y(p2)], arrow: "end", w: 1.6 },
                { t: "poly", pts: [gm.X(V2), gm.Y(p2 - (p2 - p1) * 0.4), gm.X(V2), gm.Y(p2 - (p2 - p1) * 0.6)], arrow: "end", w: 1.6 },
              ],
            },
            stem: `Una cantidad fija de gas ideal recorre el ciclo ABCA que muestra el diagrama p–V. En el estado A el gas ocupa ${V1} dm³.`,
            parts: [
              part("(a)", "Calcule el trabajo realizado por el gas en la etapa AB.", [
                method("El trabajo es el área bajo la gráfica (W = pΔV)", /pΔV|p\s*Δ\s*V|área|area|p\s*\(\s*V/i, V2 - V1, "área bajo la curva"),
                val("A1", `W = ${p2} kPa × ${V2 - V1} dm³ = ${fmt(WAB)} J`, WAB),
              ], [`En AB la presión es constante: W = p ΔV`, `W = ${p2} × 10³ × (${V2} − ${V1}) × 10⁻³`, `W = ${fmt(WAB)} J`]),
              part("(b)", "Determine el trabajo neto realizado por el gas en el ciclo completo.", [
                method("Trabajo neto = área encerrada por el ciclo (triángulo)", /½|1\s*\/\s*2|0[.,]5|triang|área|area|base/i, Wnet, "área del triángulo"),
                val("A1", `W neto = ${fmt(Wnet)} J`, Wnet),
              ], ["Trabajo neto = área encerrada = área del triángulo ABC", `W neto = ½ × (${V2} − ${V1}) × 10⁻³ × (${p2} − ${p1}) × 10³`, `W neto = ${fmt(Wnet)} J`]),
              part("(c)", "Determine la energía térmica neta que absorbe el gas en un ciclo.", [
                reason("En un ciclo completo ΔU = 0, así que Q neto = W neto", "ΔU = 0 en un ciclo", "ΔU = 0", "du = 0", "energia interna no cambia", "no cambia la energia interna", "igual al trabajo", "q = w"),
                val("A1", `Q neto = ${fmt(Wnet)} J`, Wnet),
              ], ["En un ciclo completo el gas vuelve al estado inicial: ΔU = 0, y Q = ΔU + W da Q neto = W neto", `Q neto = ${fmt(Wnet)} J`]),
            ],
          };
        },
      },
      {
        id: "adiabatico", label: "Compresión adiabática", keywords: ["adiabatico", "pv^(5/3)", "sin intercambio de calor", "isoterma"],
        make: (r) => {
          const p1 = pick(r, [100, 120, 150]), V1 = pick(r, [4.0, 6.0, 8.0]), k = pick(r, [2, 4]);
          const V2 = V1 / k, p2 = p1 * Math.pow(k, 5 / 3), pi = p1 * k;
          const xr: [number, number] = [0, V1 * 1.25], yr: [number, number] = [0, p2 * 1.2];
          const gm = gmap(60, 24, 260, 140, xr, yr);
          const ad: [number, number][] = [], is: [number, number][] = [];
          for (let i = 0; i <= 30; i++) { const V = V1 + ((V2 - V1) * i) / 30; ad.push([V, p1 * Math.pow(V1 / V, 5 / 3)]); is.push([V, (p1 * V1) / V]); }
          return {
            fig: {
              w: 360, h: 215, alt: `Dos curvas p–V desde el estado inicial (${fmt(V1, 2)} dm³, ${p1} kPa): la adiabática sube más que la isoterma al comprimir hasta ${fmt(V2, 3)} dm³`,
              items: [
                { t: "graph", x: 60, y: 24, w: 260, h: 140, xr, yr, xlabel: "V / dm³", ylabel: "p / kPa", xticks: [V2, V1], yticks: [p1], series: [{ pts: ad }, { pts: is, dash: true }] },
                wire(215, 40, 245, 40), txt(252, 44, "adiabática", "start", 12),
                { t: "line", x1: 215, y1: 58, x2: 245, y2: 58, dash: true }, txt(252, 62, "isoterma", "start", 12),
                { t: "line", x1: gm.X(V1), y1: gm.Y(p1), x2: gm.X(V1), y2: gm.Y(0), dash: true, gray: true, w: 1 },
                { t: "dot", x: gm.X(V1), y: gm.Y(p1) },
              ],
            },
            stem: `Un gas ideal monoatómico a ${p1} kPa ocupa ${fmt(V1, 2)} dm³. Se comprime con rapidez, sin intercambio de energía térmica con el entorno, hasta ${fmt(V2, 3)} dm³ (proceso adiabático, pV^(5/3) = constante). El diagrama compara este proceso con una compresión isoterma.`,
            parts: [
              part("(a)", "Calcule la presión final del gas.", [
                method("Adiabático: p₁V₁^(5/3) = p₂V₂^(5/3)", /5\s*\/\s*3|\^\s*\(?5|γ|1[.,]67/i, Math.pow(k, 5 / 3), "pV^(5/3) = constante"),
                val("A1", `p₂ = ${fmt(p2)} kPa`, p2),
              ], ["p₁ V₁^(5/3) = p₂ V₂^(5/3)", `p₂ = p₁ (V₁ / V₂)^(5/3) = ${p1} × ${k}^(5/3)`, `p₂ = ${fmt(p2)} kPa`]),
              part("(b)", "Calcule la presión final si la compresión hubiera sido isoterma.", [val("A1", `p = ${fmt(pi)} kPa`, pi)], ["Isoterma: p₁ V₁ = p₂ V₂", `p₂ = ${p1} × ${fmt(V1, 2)} / ${fmt(V2, 3)}`, `p₂ = ${fmt(pi)} kPa`]),
              part("(c)", "Explique por qué la presión final es mayor en el proceso adiabático.", [
                reason("Q = 0 y se hace trabajo sobre el gas: aumenta su energía interna y su temperatura", "el trabajo aumenta U y T (Q = 0)", "temperatura", "energia interna", "calienta", "trabajo", "aumenta t"),
              ], ["En el proceso adiabático Q = 0, así que el trabajo realizado sobre el gas aumenta su energía interna: sube la temperatura (y con ella p a igual volumen), mientras que en la isoterma la temperatura se mantiene."]),
            ],
          };
        },
      },
      {
        id: "carnot", label: "Rendimiento de una máquina térmica y de Carnot", keywords: ["maquina termica", "carnot", "rendimiento", "foco caliente"],
        make: (r) => {
          const Th = pick(r, [500, 600, 800]), Tc = 300, eC = 1 - Tc / Th;
          const Qh = pick(r, [800, 1000, 1200, 2000]), eReal0 = eC * pick(r, [0.5, 0.6, 0.7]);
          const Qc = Math.round((Qh * (1 - eReal0)) / 10) * 10, W = Qh - Qc, e = W / Qh;
          return {
            fig: {
              w: 360, h: 240, alt: `Máquina térmica entre un foco caliente a ${Th} K y uno frío a ${Tc} K: absorbe ${Qh} J, cede ${Qc} J`,
              items: [
                { t: "rect", x: 100, y: 8, w: 160, h: 34, fill: "light" }, txt(180, 30, `Foco caliente, ${Th} K`),
                arrow(180, 42, 180, 88), txt(190, 70, `QH = ${Qh} J`, "start"),
                { t: "circle", cx: 180, cy: 118, r: 30 }, txt(180, 122, "motor"),
                arrow(210, 118, 290, 118), txt(250, 108, "W"),
                arrow(180, 148, 180, 192), txt(190, 174, `QC = ${Qc} J`, "start"),
                { t: "rect", x: 100, y: 194, w: 160, h: 34, fill: "light" }, txt(180, 216, `Foco frío, ${Tc} K`),
              ],
            },
            stem: `Una máquina térmica absorbe ${Qh} J de un foco caliente a ${Th} K en cada ciclo y cede ${Qc} J a un foco frío a ${Tc} K.`,
            parts: [
              part("(a)", "Calcule el trabajo útil que realiza la máquina por ciclo.", [val("A1", `W = QH − QC = ${fmt(W)} J`, W)], [`W = QH − QC = ${Qh} − ${Qc}`, `W = ${fmt(W)} J`]),
              part("(b)", "Calcule el rendimiento de la máquina.", [valAny("A1", `rendimiento = W / QH = ${fmt(e, 2)} (${Math.round(e * 100)} %)`, [e, e * 100])], [`rendimiento = W / QH = ${fmt(W)} / ${Qh}`, `rendimiento = ${fmt(e, 2)} = ${Math.round(e * 100)} %`]),
              part("(c)", "Calcule el rendimiento máximo posible entre esos focos e indique si el rendimiento de la máquina es compatible con él.", [
                valAny("A1", `ηCarnot = 1 − TC/TH = ${fmt(eC, 2)} (${Math.round(eC * 100)} %)`, [eC, eC * 100]),
                reason("El rendimiento real es menor que el de Carnot, por tanto es posible", "real < Carnot: es compatible", "menor", "inferior", "posible", "compatible", "no supera"),
              ], [`η máx = 1 − TC / TH = 1 − ${Tc} / ${Th}`, `η máx = ${fmt(eC, 2)} = ${Math.round(eC * 100)} %`, `El rendimiento de la máquina (${Math.round(e * 100)} %) es menor que el máximo: es posible.`]),
            ],
          };
        },
      },
      {
        id: "entropia", label: "Entropía y segunda ley", keywords: ["entropia", "segunda ley", "irreversible", "δs = δq/t"],
        make: (r) => {
          const m = pick(r, [0.10, 0.20, 0.50]), Tr = pick(r, [293, 298, 303]), L = 3.34e5, Tm = 273;
          const Q = m * L, dS1 = Q / Tm, dS2 = -Q / Tr, dS = dS1 + dS2;
          return {
            stem: `${f2(m)} kg de hielo a 0 °C (273 K) se funden por completo con la energía térmica que les cede el aire de una habitación a ${Tr} K. La temperatura de la habitación casi no cambia.`,
            data: "Calor latente específico de fusión del hielo: 3,34 × 10⁵ J kg⁻¹",
            parts: [
              part("(a)", "Calcule la energía térmica necesaria para fundir el hielo.", [val("A1", `Q = mL = ${fmt(Q)} J`, Q)], [`Q = m L = ${f2(m)} × 3,34 × 10⁵`, `Q = ${fmt(Q)} J`]),
              part("(b)", "Calcule el cambio de entropía del hielo.", [val("A1", `ΔS = Q/T = ${fmt(dS1)} J K⁻¹`, dS1)], [`ΔS = Q / T = ${fmt(Q)} / 273`, `ΔS = ${fmt(dS1)} J K⁻¹`]),
              part("(c)", "Determine el cambio total de entropía del hielo y la habitación.", [
                valAny("M1", `ΔS habitación = −Q/T = ${fmt(dS2)} J K⁻¹`, [dS2, -dS2], "ΔS del aire = −Q/T"),
                val("A1", `ΔS total = ${fmt(dS)} J K⁻¹`, dS),
              ], [`ΔS habitación = −Q / T = −${fmt(Q)} / ${Tr} = ${fmt(dS2)} J K⁻¹`, `ΔS total = ${fmt(dS1)} + (${fmt(dS2)})`, `ΔS total = ${fmt(dS)} J K⁻¹`]),
              part("(d)", "Indique qué indica el signo de ΔS total sobre el proceso.", [
                reason("ΔS total > 0: el proceso es irreversible / es posible según la segunda ley", "entropía total aumenta: irreversible", "irreversible", "aumenta", "positivo", "mayor que cero", "segunda ley", "espontaneo"),
              ], ["ΔS total > 0: la entropía del universo aumenta; es un proceso irreversible, posible según la segunda ley de la termodinámica."]),
            ],
          };
        },
      },
      {
        id: "ciclomaquina", label: "Rendimiento de un ciclo rectangular", keywords: ["ciclo rectangular", "trabajo neto", "calor cedido", "eficiencia del ciclo"],
        make: (r) => {
          const V1 = pick(r, [2, 3, 4]), V2 = V1 + pick(r, [2, 4]), p1 = pick(r, [100, 150, 200]), p2 = p1 + pick(r, [100, 200, 300]);
          const W = (p2 - p1) * (V2 - V1), eta = pick(r, [0.10, 0.15, 0.20, 0.25]);
          const Qin = Math.round(W / eta / 10) * 10, e = W / Qin, Qout = Qin - W;
          const xr: [number, number] = [0, V2 + 2], yr: [number, number] = [0, p2 * 1.25];
          const gm = gmap(60, 24, 260, 140, xr, yr);
          return {
            fig: {
              w: 360, h: 215, alt: `Ciclo rectangular en un diagrama p–V entre ${V1} y ${V2} dm³ y entre ${p1} y ${p2} kPa, recorrido en el sentido de las agujas del reloj`,
              items: [
                { t: "graph", x: 60, y: 24, w: 260, h: 140, xr, yr, xlabel: "V / dm³", ylabel: "p / kPa", xticks: [V1, V2], yticks: [p1, p2], grid: true, series: [{ pts: [[V1, p1], [V1, p2], [V2, p2], [V2, p1], [V1, p1]] }] },
                { t: "poly", pts: [gm.X(V1 + (V2 - V1) * 0.4), gm.Y(p2), gm.X(V1 + (V2 - V1) * 0.6), gm.Y(p2)], arrow: "end", w: 1.6 },
                { t: "poly", pts: [gm.X(V2), gm.Y(p2 - (p2 - p1) * 0.4), gm.X(V2), gm.Y(p2 - (p2 - p1) * 0.6)], arrow: "end", w: 1.6 },
                { t: "poly", pts: [gm.X(V1 + (V2 - V1) * 0.6), gm.Y(p1), gm.X(V1 + (V2 - V1) * 0.4), gm.Y(p1)], arrow: "end", w: 1.6 },
                { t: "poly", pts: [gm.X(V1), gm.Y(p1 + (p2 - p1) * 0.4), gm.X(V1), gm.Y(p1 + (p2 - p1) * 0.6)], arrow: "end", w: 1.6 },
              ],
            },
            stem: `Una máquina térmica usa un gas ideal que recorre el ciclo rectangular del diagrama p–V. En cada ciclo el gas absorbe ${Qin} J de energía térmica.`,
            parts: [
              part("(a)", "Determine el trabajo neto que realiza el gas en un ciclo.", [
                method("Trabajo neto = área del rectángulo = ΔpΔV", /área|area|Δp|Δ\s*p|\(\s*p|rect/i, p2 - p1, "área encerrada"),
                val("A1", `W = ${fmt(W)} J`, W),
              ], ["W neto = área encerrada = Δp × ΔV", `W = (${p2} − ${p1}) × 10³ × (${V2} − ${V1}) × 10⁻³`, `W = ${fmt(W)} J`]),
              part("(b)", "Calcule el rendimiento de la máquina.", [valAny("A1", `rendimiento = ${fmt(e, 2)} (${fmt(e * 100, 2)} %)`, [e, e * 100])], [`rendimiento = W / Qin = ${fmt(W)} / ${Qin}`, `rendimiento = ${fmt(e, 2)}`]),
              part("(c)", "Determine la energía térmica que cede la máquina al entorno en cada ciclo.", [val("A1", `Qout = Qin − W = ${fmt(Qout)} J`, Qout)], ["Qout = Qin − W (ΔU = 0 en un ciclo)", `Qout = ${Qin} − ${fmt(W)}`, `Qout = ${fmt(Qout)} J`]),
            ],
          };
        },
      },
    ],
  },
  {
    id: "B5", unit: "B", name: "B.5 Corriente y circuitos",
    concepts: [
      {
        id: "carga", label: "Corriente y carga eléctrica", keywords: ["corriente electrica", "carga", "amperimetro", "electrones"],
        make: (r) => {
          const I = pick(r, [0.20, 0.40, 0.50, 0.80, 1.5]), t = pick(r, [2, 5, 10]), ts = t * 60;
          const q = I * ts, N = q / 1.6e-19;
          return {
            fig: {
              w: 330, h: 175, alt: "Circuito en serie con una pila, un amperímetro, una lámpara y un interruptor",
              items: [
                wire(50, 30, 50, 140), wire(280, 30, 280, 140),
                comp("cell", 50, 140, 50, 30), comp("ammeter", 50, 30, 165, 30), comp("lamp", 165, 30, 280, 30, "lámpara"), comp("switch", 280, 140, 50, 140),
              ],
            },
            stem: `En el circuito de la figura el amperímetro indica una corriente constante de ${f2(I)} A durante ${t} minutos.`,
            data: "Carga elemental e = 1,6 × 10⁻¹⁹ C",
            parts: [
              part("(a)", "Calcule la carga que atraviesa la lámpara en ese tiempo.", [
                val("M1", `Δt = ${t} min = ${ts} s`, ts, "tiempo en segundos"),
                val("A1", `Δq = IΔt = ${fmt(q)} C`, q),
              ], [`Δt = ${t} × 60 = ${ts} s`, `Δq = I Δt = ${f2(I)} × ${ts}`, `Δq = ${fmt(q)} C`]),
              part("(b)", "Determine el número de electrones que pasan por la lámpara en ese tiempo.", [val("A1", `N = Δq / e = ${fmt(N)}`, N)], [`N = Δq / e = ${fmt(q)} / 1,6 × 10⁻¹⁹`, `N = ${fmt(N)}`]),
            ],
          };
        },
      },
      {
        id: "ohm", label: "Ley de Ohm y lecturas de V e I", keywords: ["ley de ohm", "v = ir", "resistencia", "voltimetro"],
        make: (r) => {
          const V = pick(r, [3, 6, 9, 12]), I = pick(r, [0.20, 0.25, 0.40, 0.50, 0.60]), V2 = V + pick(r, [3, 6]);
          const R = V / I, I2 = V2 / R;
          return {
            fig: {
              w: 330, h: 175, alt: "Circuito con una pila, un amperímetro en serie con una resistencia y un voltímetro en paralelo con la resistencia",
              items: [
                wire(50, 30, 50, 140), wire(260, 30, 300, 30), wire(300, 30, 300, 140), wire(300, 140, 50, 140),
                comp("cell", 50, 140, 50, 30), comp("ammeter", 50, 30, 140, 30), comp("resistor", 140, 30, 260, 30, "R"),
                wire(140, 30, 140, 85), wire(260, 30, 260, 85), comp("voltmeter", 140, 85, 260, 85),
                { t: "dot", x: 140, y: 30 }, { t: "dot", x: 260, y: 30 },
              ],
            },
            stem: `En el circuito de la figura el voltímetro marca ${V} V y el amperímetro ${f2(I)} A. La resistencia R es óhmica.`,
            parts: [
              part("(a)", "Calcule la resistencia R.", [val("A1", `R = V / I = ${fmt(R)} Ω`, R)], [`R = V / I = ${V} / ${f2(I)}`, `R = ${fmt(R)} Ω`]),
              part("(b)", `Se sustituye la pila por otra con la que el voltímetro marcaría ${V2} V. Calcule la nueva lectura del amperímetro.`, [
                method("R no cambia: I = V / R", /V\s*\/\s*R|V\s*=\s*I\s*R|proporcional/i, I2, "I = V / R"),
                val("A1", `I = ${fmt(I2)} A`, I2),
              ], ["R no cambia; I = V / R", `I = ${V2} / ${fmt(R)}`, `I = ${fmt(I2)} A`]),
            ],
          };
        },
      },
      {
        id: "resistividad", label: "Resistividad de un alambre", keywords: ["resistividad", "alambre", "r = ρl/a", "diametro"],
        make: (r) => {
          const mt = pick(r, [{ n: "cobre", rho: 1.7e-8 }, { n: "constantán", rho: 4.9e-7 }, { n: "nicromo", rho: 1.1e-6 }]);
          const L = pick(r, [1.0, 2.0, 2.5, 5.0]), dmm = pick(r, [0.20, 0.30, 0.40, 0.50]), d = dmm * 1e-3;
          const A = (Math.PI * d * d) / 4, R = (mt.rho * L) / A, R8 = R * 8;
          return {
            fig: {
              w: 360, h: 140, alt: `Alambre de ${mt.n} de longitud ${f2(L)} m y diámetro ${f2(dmm)} mm`,
              items: [
                { t: "rect", x: 20, y: 70, w: 230, h: 16, fill: "light" },
                { t: "line", x1: 20, y1: 50, x2: 250, y2: 50, arrow: "both", w: 1.1 },
                txt(135, 40, `L = ${f2(L)} m`),
                { t: "line", x1: 266, y1: 70, x2: 266, y2: 86, arrow: "both", w: 1.1 },
                txt(274, 82, `d = ${f2(dmm)} mm`, "start", 12),
                txt(135, 108, `alambre de ${mt.n}`),
              ],
            },
            stem: `Un alambre de ${mt.n} tiene sección circular, con la longitud y el diámetro indicados en la figura.`,
            data: `Resistividad del ${mt.n}: ${fmt(mt.rho, 2)} Ω m`,
            parts: [
              part("(a)", "Calcule el área de la sección transversal del alambre.", [
                val("M1", `d = ${f2(dmm)} mm = ${fmt(d, 2)} m`, d, "d en metros"),
                val("A1", `A = πd²/4 = ${fmt(A)} m²`, A),
              ], [`d = ${f2(dmm)} × 10⁻³ = ${fmt(d, 2)} m`, `A = π d² / 4 = π × (${fmt(d, 2)})² / 4`, `A = ${fmt(A)} m²`]),
              part("(b)", "Determine la resistencia del alambre.", [
                method("R = ρL / A", /ρ\s*L|rho\s*L|L\s*\/\s*A|ρ/i, R, "R = ρL / A"),
                val("A1", `R = ${fmt(R)} Ω`, R),
              ], ["R = ρ L / A", `R = ${fmt(mt.rho, 2)} × ${f2(L)} / ${fmt(A)}`, `R = ${fmt(R)} Ω`]),
              part("(c)", "Se duplica la longitud del alambre y su diámetro se reduce a la mitad. Calcule la nueva resistencia.", [
                val("A1", `R′ = 2 × 4 × R = 8R = ${fmt(R8)} Ω`, R8),
              ], ["L se duplica: R × 2. d a la mitad: A se reduce a ¼, R × 4", `R′ = 8 R = 8 × ${fmt(R)}`, `R′ = ${fmt(R8)} Ω`]),
            ],
          };
        },
      },
      {
        id: "serieparalelo", label: "Resistencias en serie y en paralelo", keywords: ["serie", "paralelo", "resistencia equivalente", "circuito"],
        make: (r) => {
          const V = pick(r, [6, 9, 12]), R1 = pick(r, [2, 3, 4, 5]), [R2, R3] = pick(r, [[6, 12], [4, 12], [6, 3], [10, 15], [20, 5]]);
          const Rp = (R2 * R3) / (R2 + R3), Rt = R1 + Rp, I = V / Rt, Vp = V - I * R1;
          return {
            fig: {
              w: 360, h: 190, alt: `Pila de ${V} V en serie con una resistencia de ${R1} Ω y con dos resistencias en paralelo, de ${R2} Ω y ${R3} Ω`,
              items: [
                wire(190, 30, 310, 30), wire(310, 30, 310, 160), wire(310, 160, 40, 160),
                comp("cell", 40, 160, 40, 30, `${V} V`), comp("resistor", 40, 30, 190, 30, `${R1} Ω`),
                comp("resistor", 230, 30, 230, 160, `${R2} Ω`), { t: "dot", x: 230, y: 30 }, { t: "dot", x: 230, y: 160 },
                comp("resistor", 310, 30, 310, 160, `${R3} Ω`),
              ],
            },
            stem: `Una pila de ${V} V, de resistencia interna despreciable, se conecta como indica el circuito.`,
            parts: [
              part("(a)", "Calcule la resistencia equivalente de las dos resistencias en paralelo.", [
                method("1/R = 1/R₂ + 1/R₃", /1\s*\/\s*R|1\s*\/\s*\d/i, 1 / Rp, "1/R = 1/R₂ + 1/R₃"),
                val("A1", `Rp = ${fmt(Rp)} Ω`, Rp),
              ], ["1/Rp = 1/R₂ + 1/R₃", `1/Rp = 1/${R2} + 1/${R3} = ${fmt(1 / Rp)}`, `Rp = ${fmt(Rp)} Ω`]),
              part("(b)", "Determine la resistencia total del circuito.", [val("A1", `R = R₁ + Rp = ${fmt(Rt)} Ω`, Rt)], [`R = R₁ + Rp = ${R1} + ${fmt(Rp)}`, `R = ${fmt(Rt)} Ω`]),
              part("(c)", "Calcule la corriente que suministra la pila.", [val("A1", `I = V / R = ${fmt(I)} A`, I)], [`I = V / R = ${V} / ${fmt(Rt)}`, `I = ${fmt(I)} A`]),
              part("(d)", `Determine la diferencia de potencial entre los extremos de la resistencia de ${R2} Ω.`, [
                method("V en el paralelo = V − IR₁", /V\s*[−-]\s*I|I\s*R|[−-]\s*\d/i, I * R1, "V₁ = IR₁"),
                val("A1", `V = ${fmt(Vp)} V`, Vp),
              ], [`V en R₁ = I R₁ = ${fmt(I)} × ${R1} = ${fmt(I * R1)} V`, `V en el paralelo = ${V} − ${fmt(I * R1)}`, `V = ${fmt(Vp)} V`]),
            ],
          };
        },
      },
      {
        id: "potenciaelec", label: "Potencia disipada en un resistor", keywords: ["potencia electrica", "efecto joule", "p = vi", "calefactor"],
        make: (r) => {
          const V = pick(r, [12, 24, 48]), R = pick(r, [6, 8, 12, 16, 24]), t = pick(r, [5, 10, 15, 30]);
          const P = (V * V) / R, E = P * t * 60;
          return {
            fig: {
              w: 330, h: 175, alt: `Pila de ${V} V con un interruptor y un calefactor de resistencia ${R} Ω`,
              items: [
                wire(50, 30, 50, 140), wire(280, 30, 280, 140), wire(50, 30, 280, 30),
                comp("cell", 50, 140, 50, 30, `${V} V`), comp("resistor", 280, 30, 280, 140, `${R} Ω`), comp("switch", 280, 140, 50, 140),
              ],
            },
            stem: `Un calefactor de resistencia ${R} Ω se conecta a una fuente de ${V} V (resistencia interna despreciable) durante ${t} minutos.`,
            parts: [
              part("(a)", "Calcule la potencia disipada en el calefactor.", [
                method("P = V²/R (o P = VI)", /V\^?2\s*\/\s*R|V²\s*\/\s*R|V\s*I|I\^?2\s*R|I²\s*R/i, V / R, "P = V²/R"),
                val("A1", `P = ${fmt(P)} W`, P),
              ], [`I = V / R = ${V} / ${R} = ${fmt(V / R)} A`, `P = V I = ${V} × ${fmt(V / R)}`, `P = ${fmt(P)} W`]),
              part("(b)", "Determine la energía transferida al calefactor en ese tiempo.", [
                val("M1", `t = ${t} min = ${t * 60} s`, t * 60, "t en segundos"),
                val("A1", `E = Pt = ${fmt(E)} J`, E),
              ], [`t = ${t} × 60 = ${t * 60} s`, `E = P t = ${fmt(P)} × ${t * 60}`, `E = ${fmt(E)} J`]),
              part("(c)", "Se sustituye el calefactor por otro de resistencia la mitad, con la misma fuente. Calcule la nueva potencia.", [val("A1", `P′ = V²/(R/2) = 2P = ${fmt(2 * P)} W`, 2 * P)], ["P = V² / R: con R/2, la potencia se duplica", `P′ = 2 × ${fmt(P)}`, `P′ = ${fmt(2 * P)} W`]),
            ],
          };
        },
      },
      {
        id: "femr", label: "Fuerza electromotriz y resistencia interna", keywords: ["fem", "resistencia interna", "diferencia de potencial en los terminales", "pila real"],
        make: (r) => {
          const e = pick(r, [6, 9, 12]), ri = pick(r, [0.5, 1.0, 2.0]), R = pick(r, [4, 5, 8, 10]);
          const I = e / (R + ri), Vt = I * R, Pr = I * I * ri;
          return {
            fig: {
              w: 360, h: 190, alt: `Pila de fem ${e} V con resistencia interna r, conectada a un resistor de ${R} Ω con un amperímetro y un voltímetro en paralelo con el resistor`,
              items: [
                { t: "rect", x: 16, y: 16, w: 82, h: 152, dash: true },
                wire(40, 30, 40, 160), wire(240, 30, 280, 30), wire(280, 30, 280, 160), wire(280, 160, 200, 160), wire(120, 160, 40, 160),
                comp("cell", 40, 160, 40, 108, `${e} V`), comp("resistor", 40, 108, 40, 30, "r"),
                comp("ammeter", 120, 160, 200, 160), wire(40, 30, 120, 30),
                comp("resistor", 120, 30, 240, 30, `${R} Ω`),
                wire(120, 30, 120, 85), wire(240, 30, 240, 85), comp("voltmeter", 120, 85, 240, 85),
                { t: "dot", x: 120, y: 30 }, { t: "dot", x: 240, y: 30 },
              ],
            },
            stem: `Una pila de fem ${e} V y resistencia interna r = ${f2(ri)} Ω alimenta un resistor de ${R} Ω, como muestra el circuito.`,
            parts: [
              part("(a)", "Calcule la corriente en el circuito.", [
                val("M1", `Resistencia total = R + r = ${fmt(R + ri)} Ω`, R + ri, "R + r"),
                val("A1", `I = ε / (R + r) = ${fmt(I)} A`, I),
              ], [`R total = R + r = ${R} + ${f2(ri)} = ${fmt(R + ri)} Ω`, `I = ε / (R + r) = ${e} / ${fmt(R + ri)}`, `I = ${fmt(I)} A`]),
              part("(b)", "Determine la lectura del voltímetro.", [val("A1", `V = IR = ${fmt(Vt)} V`, Vt)], [`V = I R = ${fmt(I)} × ${R}`, `V = ${fmt(Vt)} V`]),
              part("(c)", "Calcule la potencia que se disipa en la resistencia interna de la pila.", [val("A1", `P = I²r = ${fmt(Pr)} W`, Pr)], [`P = I² r = ${fmt(I)}² × ${f2(ri)}`, `P = ${fmt(Pr)} W`]),
            ],
          };
        },
      },
      {
        id: "graficavi", label: "Gráfica V–I de una pila real", keywords: ["grafica v-i", "ordenada en el origen", "gradiente", "corriente de cortocircuito"],
        make: (r) => {
          const e = pick(r, [6, 9, 12]), ri = pick(r, [0.5, 1.0, 1.5, 2.0]), RL = pick(r, [3, 4, 5, 6]), Isc = e / (ri + RL);
          const Is = [0, 0.2, 0.4, 0.6, 0.8, 1.0], step = e / 3;
          const xr: [number, number] = [0, 1.2], yr: [number, number] = [0, e * 1.15];
          const pts = Is.map((i): [number, number] => [i, e - ri * i]);
          return {
            fig: {
              w: 360, h: 210, alt: `Gráfica de la diferencia de potencial en los terminales de una pila frente a la corriente: recta que baja desde ${e} V cuando I = 0`,
              items: [
                { t: "graph", x: 55, y: 24, w: 265, h: 140, xr, yr, xlabel: "I / A", ylabel: "V / V", xticks: [0.2, 0.4, 0.6, 0.8, 1.0], yticks: [step, 2 * step, 3 * step], grid: true, series: [{ pts }, { pts, dots: true }] },
              ],
            },
            stem: "Un alumno mide la diferencia de potencial V en los terminales de una pila para distintas corrientes I que suministra a un circuito. La gráfica muestra los resultados.",
            parts: [
              part("(a)", "Use la gráfica para determinar la fem de la pila.", [val("A1", `ε = ordenada en el origen = ${fmt(e)} V`, e)], ["Cuando I = 0, V = ε (ordenada en el origen)", `ε = ${fmt(e)} V`]),
              part("(b)", "Determine la resistencia interna de la pila.", [
                method("V = ε − Ir: el gradiente es −r", /gradiente|pendiente|ΔV|Δ\s*V|ε\s*[−-]\s*I|−\s*r/i, ri, "gradiente = −r"),
                val("A1", `r = ${fmt(ri)} Ω`, ri),
              ], ["V = ε − I r, así que el gradiente de la recta es −r", `r = |ΔV / ΔI| = (${fmt(e)} − ${fmt(e - ri * 1.0)}) / (1,0 − 0)`, `r = ${fmt(ri)} Ω`]),
              part("(c)", `La pila se conecta ahora a un resistor de ${RL} Ω. Calcule la corriente que suministra.`, [val("A1", `I = ε / (R + r) = ${fmt(Isc)} A`, Isc)], [`I = ε / (R + r) = ${fmt(e)} / (${RL} + ${fmt(ri)})`, `I = ${fmt(Isc)} A`]),
            ],
          };
        },
      },
      {
        id: "divisor", label: "Divisor de potencial", keywords: ["divisor de potencial", "divisor de tension", "voltaje de salida", "resistencias en serie"],
        make: (r) => {
          const V = pick(r, [6, 9, 12]), R1 = pick(r, [2, 4, 6]), R2 = pick(r, [1, 3, 6, 12]);
          const Vo = (V * R2) / (R1 + R2), I = V / (R1 + R2), Rpar = R2 / 2, Vo2 = (V * Rpar) / (R1 + Rpar);
          return {
            fig: {
              w: 360, h: 190, alt: `Pila de ${V} V en serie con dos resistencias, de ${R1} kΩ y ${R2} kΩ, con un voltímetro en paralelo con la segunda`,
              items: [
                wire(40, 30, 40, 160), wire(270, 30, 270, 160), wire(270, 160, 40, 160),
                comp("cell", 40, 160, 40, 30, `${V} V`), comp("resistor", 40, 30, 150, 30, `${R1} kΩ`), comp("resistor", 150, 30, 270, 30, `${R2} kΩ`),
                wire(150, 30, 150, 90), comp("voltmeter", 150, 90, 270, 90), { t: "dot", x: 150, y: 30 }, { t: "dot", x: 270, y: 90 },
              ],
            },
            stem: `Dos resistencias de ${R1} kΩ y ${R2} kΩ forman un divisor de potencial con una pila de ${V} V, como se muestra. El voltímetro ideal mide la diferencia de potencial en la resistencia de ${R2} kΩ.`,
            parts: [
              part("(a)", "Calcule la lectura del voltímetro.", [
                val("M1", `I = V / (R₁ + R₂) = ${fmt(I)} mA`, I, "corriente en serie"),
                val("A1", `V₂ = IR₂ = ${fmt(Vo)} V`, Vo),
              ], [`I = V / (R₁ + R₂) = ${V} / (${R1} + ${R2}) = ${fmt(I)} mA`, `V₂ = I R₂ = ${fmt(I)} × ${R2}`, `V₂ = ${fmt(Vo)} V`]),
              part("(b)", `Se conecta en paralelo con la resistencia de ${R2} kΩ otra de ${R2} kΩ. Determine la nueva lectura del voltímetro.`, [
                val("M1", `Resistencia del paralelo = ${fmt(Rpar)} kΩ`, Rpar, "R en paralelo"),
                val("A1", `V₂′ = ${fmt(Vo2)} V`, Vo2),
              ], [`R en paralelo = ${R2} / 2 = ${fmt(Rpar)} kΩ`, `V₂′ = V R / (R₁ + R) = ${V} × ${fmt(Rpar)} / (${R1} + ${fmt(Rpar)})`, `V₂′ = ${fmt(Vo2)} V`]),
            ],
          };
        },
      },
      {
        id: "sensor", label: "Divisor de potencial con LDR o termistor", keywords: ["ldr", "termistor", "sensor", "luz", "temperatura"],
        make: (r) => {
          const kind = pick(r, [0, 1]), V = pick(r, [6, 9, 12]), Rf = pick(r, [5, 10]);
          const names = kind === 0 ? ["un LDR", "oscuridad", "luz intensa"] : ["un termistor NTC", "20 °C", "60 °C"];
          const Ra = kind === 0 ? pick(r, [20, 40]) : 12, Rb = kind === 0 ? pick(r, [1, 2]) : 2;
          const Va = (V * Rf) / (Rf + Ra), Vb = (V * Rf) / (Rf + Rb);
          return {
            fig: {
              w: 360, h: 190, alt: `Pila de ${V} V en serie con ${names[0]} y una resistencia fija de ${Rf} kΩ, con un voltímetro en paralelo con la resistencia fija`,
              items: [
                wire(40, 30, 40, 160), wire(270, 30, 270, 160), wire(270, 160, 40, 160),
                comp("cell", 40, 160, 40, 30, `${V} V`), comp(kind === 0 ? "ldr" : "thermistor", 40, 30, 150, 30), comp("resistor", 150, 30, 270, 30, `${Rf} kΩ`),
                wire(150, 30, 150, 90), comp("voltmeter", 150, 90, 270, 90), { t: "dot", x: 150, y: 30 }, { t: "dot", x: 270, y: 90 },
              ],
            },
            stem: `${names[0][0].toUpperCase() + names[0].slice(1)} se conecta en serie con una resistencia fija de ${Rf} kΩ y una pila de ${V} V, como se muestra. Con ${names[1]} la resistencia del sensor es ${Ra} kΩ y con ${names[2]} es ${Rb} kΩ. El voltímetro ideal mide la diferencia de potencial en la resistencia fija.`,
            parts: [
              part("(a)", `Calcule la lectura del voltímetro con ${names[1]}.`, [
                val("M1", `I = V / (Rs + R) = ${fmt(V / (Ra + Rf))} mA`, V / (Ra + Rf), "corriente en serie"),
                val("A1", `V = ${fmt(Va)} V`, Va),
              ], [`I = ${V} / (${Ra} + ${Rf}) = ${fmt(V / (Ra + Rf))} mA`, `V = I R = ${fmt(V / (Ra + Rf))} × ${Rf}`, `V = ${fmt(Va)} V`]),
              part("(b)", `Calcule la lectura con ${names[2]}.`, [val("A1", `V = ${fmt(Vb)} V`, Vb)], [`I = ${V} / (${Rb} + ${Rf}) = ${fmt(V / (Rb + Rf))} mA`, `V = ${fmt(V / (Rb + Rf))} × ${Rf}`, `V = ${fmt(Vb)} V`]),
              part("(c)", "Explique por qué la lectura del voltímetro aumenta cuando disminuye la resistencia del sensor.", [
                reason("La resistencia total disminuye, la corriente aumenta y V = IR en la resistencia fija aumenta (o: el sensor toma una fracción menor de la tensión)", "I aumenta, V = IR en la resistencia fija sube", "corriente aumenta", "aumenta la corriente", "mayor corriente", "menor fraccion", "menos tension", "menor diferencia de potencial", "I aumenta"),
              ], ["Al disminuir la resistencia del sensor baja la resistencia total del circuito en serie, así que la corriente aumenta; como V = IR con R fija, la lectura aumenta (el sensor toma una fracción menor de los " + V + " V)."]),
            ],
          };
        },
      },
      {
        id: "lecturas", label: "Lecturas de amperímetros y voltímetro", keywords: ["amperimetro", "voltimetro", "ramas en paralelo", "ley de los nudos"],
        make: (r) => {
          const R1 = pick(r, [6, 8, 12]), R2 = pick(r, [4, 6, 12]), I2 = pick(r, [0.50, 0.75, 1.0, 1.5]);
          const V = I2 * R2, I1 = V / R1, It = I1 + I2;
          return {
            fig: {
              w: 380, h: 190, alt: `Pila con un voltímetro en paralelo, un amperímetro principal y dos ramas en paralelo: una con una resistencia de ${R1} Ω y otra con un amperímetro y una resistencia de ${R2} Ω`,
              items: [
                wire(40, 30, 40, 150), wire(130, 30, 130, 135), wire(340, 55, 340, 150), wire(340, 150, 40, 150),
                comp("cell", 40, 150, 40, 30), comp("ammeter", 40, 30, 130, 30, "A₁"),
                comp("resistor", 130, 55, 340, 55, `${R1} Ω`),
                comp("ammeter", 130, 95, 215, 95, "A₂"), comp("resistor", 215, 95, 340, 95, `${R2} Ω`),
                comp("voltmeter", 130, 135, 340, 135),
                { t: "dot", x: 130, y: 55 }, { t: "dot", x: 130, y: 95 }, { t: "dot", x: 340, y: 95 }, { t: "dot", x: 340, y: 135 },
              ],
            },
            stem: `En el circuito de la figura, la pila tiene resistencia interna despreciable y los medidores son ideales. El amperímetro A₂ marca ${fmt(I2, 3)} A.`,
            parts: [
              part("(a)", "Determine la lectura del voltímetro.", [val("A1", `V = I₂R₂ = ${fmt(V)} V`, V)], [`V = I₂ R₂ = ${fmt(I2, 3)} × ${R2}`, `V = ${fmt(V)} V`]),
              part("(b)", `Calcule la corriente en la resistencia de ${R1} Ω.`, [val("A1", `I = V / R = ${fmt(I1)} A`, I1)], [`I = V / R = ${fmt(V)} / ${R1}`, `I = ${fmt(I1)} A`]),
              part("(c)", "Determine la lectura del amperímetro A₁.", [
                method("Las corrientes de las dos ramas se suman en el nudo", /suma|\+|nudo/i, I1 + I2, "I₁ + I₂"),
                val("A1", `I = ${fmt(It)} A`, It),
              ], ["Por el nudo, la corriente total es la suma de las de las ramas", `I = ${fmt(I1)} + ${fmt(I2, 3)}`, `I = ${fmt(It)} A`]),
              part("(d)", "Explique por qué un voltímetro ideal debe tener una resistencia muy grande.", [
                reason("Para que no circule corriente por él y no altere el circuito ni la medida", "no desvía corriente / no altera la medida", "no circule", "no circula", "no pase", "no desvia", "no altera", "no afecta", "corriente despreciable", "no consuma"),
              ], ["Se conecta en paralelo: si su resistencia es muy grande, casi no circula corriente por él y no modifica la corriente ni la diferencia de potencial que mide."]),
            ],
          };
        },
      },
    ],
  },
];

export const formulas: Record<string, FormulaGroup> = {
  "B.1": {
    title: "B.1 Transferencias de energía térmica",
    items: [
      { tex: "Q = mc\\,\\Delta T", n: "energía térmica y calor específico", for: ["calor específico", "equilibrio térmico", "mezcla"] },
      { tex: "Q = mL", n: "cambio de fase (calor latente)", for: ["calor latente", "cambio de fase", "fase"] },
      { tex: "\\dfrac{\\Delta Q}{\\Delta t} = \\dfrac{kA\\,\\Delta T}{\\Delta x}", n: "conducción térmica", for: ["conducción", "pared"] },
      { tex: "P = e\\sigma A T^4", n: "potencia radiada (e = 1 para un cuerpo negro)", for: ["radiación", "luminosidad", "cuerpo negro"] },
      { tex: "A = 4\\pi r^2", n: "área de una esfera", for: ["luminosidad", "radiación"] },
      { tex: "\\lambda_{\\max} T = 2{,}90\\times10^{-3}\\ \\text{m K}", n: "ley de Wien", for: ["wien", "espectro"] },
      { tex: "I = \\dfrac{P}{A}", n: "intensidad de la radiación" },
    ],
    consts: [
      { tex: "\\sigma = 5{,}67\\times10^{-8}\\ \\text{W m}^{-2}\\,\\text{K}^{-4}" },
      { tex: "b = 2{,}90\\times10^{-3}\\ \\text{m K}", note: "constante de Wien" },
    ],
  },
  "B.2": {
    title: "B.2 Efecto invernadero",
    items: [
      { tex: "\\alpha = \\dfrac{\\text{potencia reflejada}}{\\text{potencia incidente}}", n: "albedo", for: ["albedo"] },
      { tex: "I_{\\text{abs}} = \\dfrac{S(1-\\alpha)}{4}", n: "intensidad media absorbida por unidad de superficie del planeta", for: ["albedo", "equilibrio", "temperatura"] },
      { tex: "I = \\dfrac{L}{4\\pi d^2}", n: "intensidad de la radiación a una distancia d", for: ["intensidad", "distancia"] },
      { tex: "P = e\\sigma A T^4", n: "potencia emitida", for: ["emisividad", "equilibrio"] },
      { tex: "\\sigma T^4 = \\dfrac{S(1-\\alpha)}{4}", n: "equilibrio radiativo de un planeta", for: ["temperatura de equilibrio"] },
      { tex: "\\lambda_{\\max} T = 2{,}90\\times10^{-3}\\ \\text{m K}", n: "ley de Wien", for: ["gases de efecto invernadero", "infrarroja"] },
    ],
    consts: [
      { tex: "\\sigma = 5{,}67\\times10^{-8}\\ \\text{W m}^{-2}\\,\\text{K}^{-4}" },
      { tex: "S \\approx 1360\\ \\text{W m}^{-2}", note: "constante solar (usa el valor del enunciado)" },
    ],
  },
  "B.3": {
    title: "B.3 Modelos de gases",
    items: [
      { tex: "pV = nRT", n: "gas ideal", for: ["gas ideal", "ecuación", "volumen constante", "calentar", "moles"] },
      { tex: "\\dfrac{p}{T} = \\text{constante}", n: "a volumen y cantidad constantes (de pV = nRT)", for: ["volumen constante", "calentar", "real"] },
      { tex: "p_1V_1 = p_2V_2", n: "a temperatura y cantidad constantes (Boyle)", for: ["boyle"] },
      { tex: "T\\,(\\text{K}) = \\theta\\,(^{\\circ}\\text{C}) + 273", n: "pasa siempre a kelvin", for: ["gas ideal", "volumen constante", "calentar", "ecuación", "moles"] },
      { tex: "n = \\dfrac{N}{N_A}", n: "moles y partículas", for: ["moles", "moléculas"] },
      { tex: "pV = N k_B T", n: "con número de partículas", for: ["moléculas", "moles"] },
      { tex: "\\overline{E_k} = \\tfrac{3}{2}k_BT = \\tfrac{3}{2}\\dfrac{RT}{N_A}", n: "energía cinética media de traslación por molécula", for: ["energía cinética", "rapidez"] },
      { tex: "\\tfrac{1}{2}m\\overline{c^2} = \\tfrac{3}{2}k_BT", n: "rapidez cuadrática media: crms = √⟨c²⟩", for: ["energía cinética", "rapidez"] },
      { tex: "p = \\tfrac{1}{3}\\rho\\,\\overline{c^2}", n: "presión según el modelo cinético", for: ["presión", "cinético"] },
      { tex: "p = \\dfrac{F}{A}", n: "presión" },
    ],
    consts: [
      { tex: "R = 8{,}31\\ \\text{J K}^{-1}\\,\\text{mol}^{-1}" },
      { tex: "N_A = 6{,}02 \\times 10^{23}\\ \\text{mol}^{-1}" },
      { tex: "k_B = 1{,}38 \\times 10^{-23}\\ \\text{J K}^{-1}" },
    ],
  },
  "B.4": {
    title: "B.4 Termodinámica",
    items: [
      { tex: "Q = \\Delta U + W", n: "primera ley (W = trabajo hecho por el gas)", for: ["primera ley", "adiabática", "diagrama"] },
      { tex: "\\Delta U = \\tfrac{3}{2}nR\\,\\Delta T", n: "energía interna de un gas ideal monoatómico", for: ["primera ley"] },
      { tex: "W = p\\,\\Delta V", n: "trabajo a presión constante; en general, área bajo la curva p–V", for: ["primera ley", "trabajo", "ciclo", "diagrama"] },
      { tex: "pV^{5/3} = \\text{constante}", n: "proceso adiabático de un gas monoatómico", for: ["adiabática"] },
      { tex: "\\eta = \\dfrac{W}{Q_H} = 1 - \\dfrac{Q_C}{Q_H}", n: "rendimiento de una máquina térmica", for: ["rendimiento", "ciclo", "máquina"] },
      { tex: "\\eta_{\\text{Carnot}} = 1 - \\dfrac{T_C}{T_H}", n: "rendimiento máximo (temperaturas en K)", for: ["rendimiento", "carnot"] },
      { tex: "\\Delta S = \\dfrac{\\Delta Q}{T}", n: "cambio de entropía a temperatura constante", for: ["entropía"] },
    ],
    consts: [{ tex: "R = 8{,}31\\ \\text{J K}^{-1}\\,\\text{mol}^{-1}" }],
  },
  "B.5": {
    title: "B.5 Corriente y circuitos",
    items: [
      { tex: "I = \\dfrac{\\Delta q}{\\Delta t}", n: "corriente y carga", for: ["corriente", "carga"] },
      { tex: "V = IR", n: "ley de Ohm", for: ["ohm", "lecturas", "resistencias", "fuerza electromotriz"] },
      { tex: "R = \\dfrac{\\rho L}{A}", n: "resistencia de un alambre", for: ["resistividad"] },
      { tex: "P = VI = I^2R = \\dfrac{V^2}{R}", n: "potencia disipada", for: ["potencia"] },
      { tex: "R = R_1 + R_2 + \\cdots", n: "resistencias en serie", for: ["serie", "divisor"] },
      { tex: "\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\cdots", n: "resistencias en paralelo", for: ["paralelo"] },
      { tex: "\\varepsilon = I(R + r) \\qquad V = \\varepsilon - Ir", n: "fem, resistencia interna y diferencia de potencial en los terminales", for: ["fuerza electromotriz", "gráfica", "pila"] },
      { tex: "V_2 = V\\,\\dfrac{R_2}{R_1 + R_2}", n: "divisor de potencial", for: ["divisor", "ldr", "termistor"] },
      { tex: "q = N e", n: "carga de N electrones", for: ["corriente", "carga"] },
    ],
    consts: [{ tex: "e = 1{,}6 \\times 10^{-19}\\ \\text{C}" }],
  },
};
