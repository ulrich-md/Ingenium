/** The offer, built with Alex Hormozi's "$100M Offers" in mind:
 *  value = (dream outcome × perceived likelihood) / (time delay × effort).
 *  Every line here describes something the product already does (checked against the code);
 *  promises that are not built yet stay out of this file. 3D icons: public/3d (Fluent Emoji, MIT). */

/** What only Kwanta does. */
export const DIFFS = [
  { img: "pencil", t: "Escribes a mano, como en el examen", d: "En el iPad, con el Apple Pencil, sobre hojas con pregunta, [marcas] y recuadro. Nada de opción múltiple disfrazada." },
  { img: "check-mark-button", t: "Corrección con el esquema de marcas", d: "Renglón por renglón: M1 por el método, A1 por la respuesta. Sabes en qué paso se fue el punto." },
  { img: "books", t: "149 tipos de ejercicio en 24 subtemas", d: "De las 5 unidades, con números nuevos cada vez. Cada vez que practicas, la hoja cambia." },
  { img: "light-bulb", t: "Pistas por pasos, sin darte la respuesta", d: "Qué usar y cómo empezar. La primera vez de cada tipo, un ejemplo resuelto con sus marcas." },
  { img: "chart-increasing", t: "Tu nota proyectada, del 1 al 7", d: "El diagnóstico te ubica en 15 minutos y tu plan empieza por la unidad que más te cuesta." },
  { img: "stopwatch", t: "Simulacros con tiempo real", d: "1,8 minutos por marca, como la Prueba 2, sin pistas y con calculadora." },
  { img: "memo", t: "Fórmulas al lado de cada hoja", d: "Las del cuadernillo de datos de ese tema, primero las de ese tipo de ejercicio." },
  { img: "globe-showing-americas", t: "Todo en español", d: "Con los términos del examen (Calcule, Determine, Explique) y qué pide cada uno." },
] as const;

/** Hormozi's first step: list every obstacle, then solve each one. */
export const PROBLEMS = [
  { p: "No sé por dónde empezar", s: "El diagnóstico gratis te dice tu nivel y arma tu plan de 12 semanas." },
  { p: "Estudio, pero en el examen pierdo marcas", s: "Practicas con el esquema de marcas: ves qué vale cada renglón." },
  { p: "Me bloqueo con los problemas largos", s: "Pistas por pasos y un ejemplo resuelto antes de que lo intentes tú." },
  { p: "Siempre practico lo mismo", s: "Números nuevos en cada hoja, en 149 tipos de ejercicio." },
  { p: "No sé si voy bien", s: "Tu nota proyectada se mueve con cada hoja que resuelves." },
  { p: "Todo está en inglés", s: "Kwanta es en español, con los términos del examen explicados." },
] as const;

/** The value equation, told from the student's side. */
export const LEVERS = {
  more: [
    { t: "Tu meta", d: "Un 7 en Física IB, con tu nota proyectada a la vista." },
    { t: "La certeza de que funciona", d: "Corrección con el esquema de marcas, y 14 días para probar el Sprint o te devolvemos el dinero." },
  ],
  less: [
    { t: "Espera", d: "15 minutos para saber tu nivel. En computadora, corrección al instante." },
    { t: "Esfuerzo perdido", d: "El plan empieza por lo que más te cuesta; no repasas lo que ya sabes." },
  ],
} as const;
