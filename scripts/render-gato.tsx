/** Renders every pose of the Kwanta cat (src/components/Gato.tsx) to an optimized SVG in
 *  public/mascota/, for the README, social images and anywhere outside React.
 *  Run: npm run mascota */
import { writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { optimize } from "svgo";
import Gato, { type GatoPose } from "../src/components/Gato.tsx";

const POSES: GatoPose[] = ["hola", "sube", "ups", "superposicion", "escribe", "duerme"];
const out = process.argv[2] ?? "public/mascota";
mkdirSync(out, { recursive: true });
for (const pose of POSES) {
  const raw = renderToStaticMarkup(<Gato pose={pose} />);
  const { data } = optimize(raw, { multipass: true, plugins: [{ name: "preset-default", params: { overrides: { cleanupIds: false } } }] });
  writeFileSync(`${out}/gato-${pose}.svg`, data);
  console.log(`gato-${pose}.svg  ${(raw.length / 1024).toFixed(1)} KB → ${(data.length / 1024).toFixed(1)} KB`);
}
