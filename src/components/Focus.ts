"use client";
import { useEffect } from "react";

/** While a sheet or a note is open, the page shows only the sheet: no site header, no app
 *  tabs (see `body.focus` in globals.css). Each screen keeps its own way out. */
export function useFocusMode(on = true) {
  useEffect(() => {
    if (!on) return;
    document.body.classList.add("focus");
    return () => document.body.classList.remove("focus");
  }, [on]);
}
