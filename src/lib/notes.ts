/**
 * Class notes and practice sets, stored in this browser (no database in the MVP).
 * A note keeps its template text (computer) and how many ink pages it has (iPad);
 * the ink itself lives under kw-ink-note-<id>-p<n>.
 */
import { store } from "./storage.ts";

export interface NoteText { claves: string; notas: string; ejemplo: string; resumen: string }

export interface Note {
  id: string;
  title: string;
  topic: string;
  date: string;
  concepts: string[];
  pages: number;
  text: NoteText;
  updated: number;
}

export interface PracticeSet {
  id: string;
  title: string;
  topic: string;
  concepts: string[];
  seed: number;
  n: number;
  noteId?: string;
  created: number;
  idx: number;
  typed: Record<string, string[][]>;
  awarded: Record<string, (boolean | null)[][]>;
  marked: Record<string, boolean>;
  done: Record<string, boolean>;
  /** how sheets are picked (sets made before levels: none, in concept order) */
  lv?: "prog" | 1 | 2 | 3;
  /** hints opened, per sheet and part */
  hints?: Record<string, number[]>;
}

const NOTES = "kw-notes";
const SETS = "kw-sets";

export const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);

export const listNotes = () => store.get<Note[]>(NOTES, []).sort((a, b) => b.updated - a.updated);
export const getNote = (id: string) => listNotes().find((n) => n.id === id) ?? null;
export function saveNote(n: Note) {
  const all = store.get<Note[]>(NOTES, []).filter((x) => x.id !== n.id);
  store.set(NOTES, [{ ...n, updated: Date.now() }, ...all]);
}
export function newNote(topic = "D1"): Note {
  const n: Note = { id: uid(), title: "", topic, date: today(), concepts: [], pages: 1, text: { claves: "", notas: "", ejemplo: "", resumen: "" }, updated: Date.now() };
  saveNote(n);
  return n;
}
export function deleteNote(id: string) {
  const n = getNote(id);
  store.set(NOTES, store.get<Note[]>(NOTES, []).filter((x) => x.id !== id));
  for (let p = 0; p < (n?.pages ?? 1); p++) store.del(`kw-ink-note-${id}-p${p}`);
}

export const listSets = () => store.get<PracticeSet[]>(SETS, []).sort((a, b) => b.created - a.created);
export const getSet = (id: string) => listSets().find((s) => s.id === id) ?? null;
export function saveSet(s: PracticeSet) {
  store.set(SETS, [s, ...store.get<PracticeSet[]>(SETS, []).filter((x) => x.id !== s.id)]);
}
export function newSet(o: { title: string; topic: string; concepts: string[]; noteId?: string; n?: number; lv?: "prog" | 1 | 2 | 3 }): PracticeSet {
  const s: PracticeSet = {
    id: uid(), title: o.title, topic: o.topic, concepts: o.concepts, noteId: o.noteId,
    seed: Math.floor(Math.random() * 1e9), n: o.n ?? 4, created: Date.now(), idx: 0,
    typed: {}, awarded: {}, marked: {}, done: {}, lv: o.lv ?? "prog",
  };
  saveSet(s);
  return s;
}

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${M[m - 1]} ${y}`;
}
