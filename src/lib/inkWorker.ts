/// <reference lib="webworker" />
/**
 * Computes the clean (unioned) outline of finished strokes off the main thread.
 * polygon-clipping can take tens of ms on a long stroke; on the main thread it ran
 * right when the next stroke started (Safari has no requestIdleCallback) and the
 * Pencil stuttered.
 */
import { cleanPath, type StrokeLike } from "./inkGeom";

self.onmessage = (e: MessageEvent<{ id: number; st: StrokeLike }>) => {
  const { id, st } = e.data;
  let d = "";
  try { d = cleanPath(st); } catch { /* keep the fast outline */ }
  (self as unknown as Worker).postMessage({ id, d });
};
