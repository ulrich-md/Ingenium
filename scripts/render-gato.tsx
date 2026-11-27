/** Renders Psi, the Kwanta cat (src/components/Gato.tsx), to optimized SVG files in public/mascota/:
 *   psi-<pose>.svg        still, for anywhere outside React
 *   psi-<pose>-anim.svg   the same pose with its animation embedded (works inside <img>)
 *   psi-cara-<mood>.svg   the head alone, one per expression
 *  Run: npm run mascota */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { optimize } from "svgo";
import Gato, { type GatoPose, type Mood } from "../src/components/Gato.tsx";

export const POSES: GatoPose[] = ["hola", "sube", "ups", "superposicion", "escribe", "duerme", "senala", "racha", "siete", "lee", "cronometro", "triste", "insiste", "ipad", "cara"];
export const MOODS: Mood[] = ["hola", "feliz", "guino", "enamorado", "orgulloso", "sorprendido", "duda", "concentrado", "ups", "triste", "enojado", "dormido"];

const out = process.argv[2] ?? "public/mascota";
mkdirSync(out, { recursive: true });
const css = readFileSync(new URL("../src/components/psi.css", import.meta.url), "utf8");

// keep ids (clip paths) and inline styles (the pivots of the animated parts)
const svgo = (svg: string) =>
  optimize(svg, { multipass: true, plugins: [{ name: "preset-default", params: { overrides: { cleanupIds: false, inlineStyles: false, minifyStyles: false, mergePaths: false } } }] }).data;

const write = (name: string, svg: string) => {
  writeFileSync(`${out}/${name}.svg`, svg);
  return svg.length;
};

let total = 0;
for (const pose of POSES) {
  total += write(`psi-${pose}`, svgo(renderToStaticMarkup(<Gato pose={pose} />)));
  const anim = renderToStaticMarkup(<Gato pose={pose} animated />).replace(/(<svg[^>]*>)/, `$1<style><![CDATA[${css}]]></style>`);
  total += write(`psi-${pose}-anim`, svgo(anim));
}
for (const mood of MOODS) total += write(`psi-cara-${mood}`, svgo(renderToStaticMarkup(<Gato pose="cara" mood={mood} />)));
console.log(`${POSES.length * 2 + MOODS.length} archivos en ${out} (${(total / 1024).toFixed(0)} KB)`);
