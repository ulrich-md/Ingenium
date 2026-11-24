/**
 * Demo sign-in for the MVP. There is no server or database yet, so this only
 * gates the app in the browser and loads sample data; it is not security.
 * Real accounts come with the database (Supabase) in the next version.
 */
import { DIAG_KEY, freshDiag, type DiagState } from "./diag.ts";
import { listNotes, saveNote, today, type Note } from "./notes.ts";
import { store } from "./storage.ts";

export const DEMO = { email: "demo@kwanta.app", password: "Kwanta2027", name: "Alumno demo" };

export interface Session { email: string; name: string; demo: boolean; since: number }

const KEY = "kw-session";

export const getSession = () => store.get<Session | null>(KEY, null);
export const logout = () => store.del(KEY);

export function login(email: string, password: string): Session | null {
  if (email.trim().toLowerCase() !== DEMO.email || password !== DEMO.password) return null;
  const s: Session = { email: DEMO.email, name: DEMO.name, demo: true, since: Date.now() };
  store.set(KEY, s);
  seedDemo(false);
  return s;
}

/** Sample data so the demo account opens with something to see. */
export function seedDemo(force: boolean) {
  const diag = store.get<DiagState | null>(DIAG_KEY, null);
  if (force || !diag || diag.stage !== "results") {
    const d = freshDiag();
    d.stage = "results";
    d.mcq = 10;
    d.answers = { m1: 2, m2: 1, m3: 2, m4: 1, m5: 1, m6: 0, m7: 1, m8: 0, m9: 2, m10: 1 };
    d.checked = Object.fromEntries(Object.keys(d.answers).map((k) => [k, true]));
    d.awarded = {
      s1: [[true], [true, false], [true]],
      s2: [[false, false], [true, false]],
      s3: [[true], [true, false, false], [false, false]],
    };
    d.marked = { s1: true, s2: true, s3: true };
    d.done = { s1: true, s2: true, s3: true };
    d.sheet = 2;
    store.set(DIAG_KEY, d);
  }
  if (force || !listNotes().some((n) => n.id === "demo-orbitas")) {
    const n: Note = {
      id: "demo-orbitas",
      title: "Clase 12 · Órbitas y escape",
      topic: "D1",
      date: today(),
      concepts: ["orbita", "escape"],
      pages: 1,
      text: {
        claves: "¿Por qué r = R + h?\n¿De qué depende la rapidez orbital?\nRapidez de escape",
        notas: "Satélite en órbita circular: la gravedad es la fuerza centrípeta.\nGMm/r² = mv²/r → v = √(GM/r)\nr se mide desde el CENTRO del planeta: r = R + h\nRapidez de escape: Ek + Ep = 0 → v = √(2GM/R). La masa del objeto se cancela.",
        ejemplo: "Satélite a 500 km de la Tierra:\nr = 6,37×10⁶ + 5,0×10⁵ = 6,87×10⁶ m\nv = √(6,67×10⁻¹¹ × 5,97×10²⁴ / 6,87×10⁶) = 7,6×10³ m s⁻¹",
        resumen: "Órbita: v = √(GM/r) con r desde el centro.\nEscape: v = √(2GM/R), no depende de la masa.",
      },
      updated: Date.now(),
    };
    saveNote(n);
  }
}
