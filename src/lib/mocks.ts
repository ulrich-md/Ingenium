/** Timed Paper 2 mocks, stored in this browser. */
import { generateMock, minutesFor } from "./generators.ts";
import { uid } from "./notes.ts";
import { store } from "./storage.ts";

export interface Mock {
  id: string;
  level: "NM" | "NS";
  seed: number;
  n: number;
  minutes: number;
  started: number;
  endsAt: number;
  submitted?: number;
  phase: "running" | "review" | "done";
  idx: number;
  typed: Record<string, string[][]>;
  awarded: Record<string, (boolean | null)[][]>;
  marked: Record<string, boolean>;
}

const KEY = "kw-mocks";
export const MOCK_SIZE = { NM: 6, NS: 8 } as const;

export const listMocks = () => store.get<Mock[]>(KEY, []).sort((a, b) => b.started - a.started);
export const getMock = (id: string) => listMocks().find((m) => m.id === id) ?? null;
export const saveMock = (m: Mock) => store.set(KEY, [m, ...store.get<Mock[]>(KEY, []).filter((x) => x.id !== m.id)]);
export const mockSheets = (m: Mock) => generateMock(m.seed, m.n, m.id);

export function newMock(level: "NM" | "NS"): Mock {
  const id = uid();
  const seed = Math.floor(Math.random() * 1e9);
  const n = MOCK_SIZE[level];
  const minutes = minutesFor(generateMock(seed, n, id));
  const now = Date.now();
  const m: Mock = { id, level, seed, n, minutes, started: now, endsAt: now + minutes * 60_000, phase: "running", idx: 0, typed: {}, awarded: {}, marked: {} };
  saveMock(m);
  return m;
}
