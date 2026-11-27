/** Builds Psi's character sheet (one self-contained HTML page) from a template:
 *   {{pose}}            that pose, animated
 *   {{pose:still}}      that pose, still
 *   {{cara:mood}}       the head with that expression
 *  Usage: npm run psi-sheet -- <template.html> <out.html> */
import { readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Gato, { type GatoPose, type Mood } from "../src/components/Gato.tsx";

const [tpl, out] = process.argv.slice(2);
const css = readFileSync(new URL("../src/components/psi.css", import.meta.url), "utf8");
let n = 0;
const html = readFileSync(tpl, "utf8")
  .replace("/*{{psi.css}}*/", css)
  .replace(/\{\{(\w+)(?::(\w+))?\}\}/g, (_, a: string, b?: string) => {
    const uid = `s${n++}`;
    if (a === "cara") return renderToStaticMarkup(<Gato pose="cara" mood={(b ?? "hola") as Mood} uid={uid} animated />);
    return renderToStaticMarkup(<Gato pose={a as GatoPose} uid={uid} animated={b !== "still"} />);
  });
writeFileSync(out, html);
console.log(`${out}: ${n} ilustraciones, ${(html.length / 1024).toFixed(0)} KB`);
