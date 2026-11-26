"use client";
/**
 * One exam question laid out like a printed IB paper:
 * "1. [Puntuación máxima: 4]", parts with [marks] on the right and a boxed
 * answer area with dotted lines. Variants:
 *  - ink: blank dotted lines; the InkLayer is passed in as an overlay (iPad)
 *  - typed: each dotted line is a text input (computer)
 *  - sample: a handwritten example answer, read-only (demo of AI marking)
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { RowNote } from "@/lib/check";
import { SHEET_MAX, type Sheet } from "@/lib/content";
import { prettify } from "@/lib/numbers";
import { Figure } from "./Figures";

interface Props {
  sheet: Sheet;
  variant: "ink" | "typed" | "sample";
  typed?: string[][];
  onType?: (part: number, row: number, value: string) => void;
  onFocusInput?: (el: HTMLInputElement) => void;
  notes?: RowNote[][];
  totals?: (number | null)[];
  overlay?: ReactNode;
  readOnly?: boolean;
  /** ink only: extra room asked for below the default work space (px) */
  extra?: number;
  onMore?: () => void;
}

/** With ink the page is at least this tall (design px): a portrait iPad shows paper to
 *  the bottom of the screen. Same in both orientations, so the ink always lines up. */
const MIN_INK_PAGE = 1240;

/** Work space after the last part. Added at the bottom only, so ink already written in
 *  the boxes above never moves. */
function WorkSpace({ extra = 0, onMore }: { extra?: number; onMore?: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(260);
  useLayoutEffect(() => {
    const e = el.current;
    if (!e) return;
    setH(Math.max(260, MIN_INK_PAGE - e.offsetTop - 40));
  }, []);
  return (
    <div ref={el} className="workspace" style={{ height: h + extra }}>
      <span className="ws-lab">Espacio extra · si no te alcanza un recuadro, sigue aquí e indica la parte, por ejemplo «(b) continúa»</span>
      {onMore && <button type="button" className="ws-more" onClick={onMore}>+ Más espacio</button>}
    </div>
  );
}

function moveFocus(from: HTMLInputElement, dir: 1 | -1) {
  const all = Array.from(from.closest(".paper")?.querySelectorAll<HTMLInputElement>("input[data-r]") ?? []);
  const i = all.indexOf(from);
  all[i + dir]?.focus();
}

export default function ExamSheet({ sheet, variant, typed, onType, onFocusInput, notes, totals, overlay, readOnly, extra, onMore }: Props) {
  return (
    <div className={"paper" + (variant === "ink" ? " ink" : "")}>
      <div className="qh">
        <span><b>{sheet.num}.</b>&nbsp; [Puntuación máxima: {SHEET_MAX(sheet)}]</span>
        <span className="code">{sheet.code}</span>
      </div>
      <p className="stem">{sheet.stem}</p>
      {sheet.data && <p className="data">{sheet.data}</p>}
      {sheet.figure && <Figure id={sheet.figure} />}

      {sheet.parts.map((part, pi) => {
        const rows = variant === "sample" ? Math.max(part.rows, part.sample.rows.length) : part.rows;
        const rowNotes = variant === "sample" ? part.sample.notes : notes?.[pi] ?? [];
        const total = totals?.[pi];
        return (
          <div key={part.label}>
            <div className="prt">
              <span className="lb">{part.label}</span>
              <span>{part.prompt}</span>
              <span className="mk">{total != null && <span className="tot" aria-label={`${total} de ${part.marks}`}>{total}</span>}[{part.marks}]</span>
            </div>
            <div className="abox">
              {Array.from({ length: rows }, (_, ri) => {
                const here = rowNotes.filter((n) => n.row === ri);
                const bad = here.some((n) => !n.ok);
                return (
                  <div key={ri} className={"r" + (bad && variant !== "ink" ? " hl" : "")}>
                    {variant === "typed" && (
                      <input
                        data-p={pi}
                        data-r={ri}
                        value={typed?.[pi]?.[ri] ?? ""}
                        readOnly={readOnly}
                        aria-label={`Parte ${part.label}, renglón ${ri + 1}`}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        onFocus={(e) => onFocusInput?.(e.currentTarget)}
                        onChange={(e) => onType?.(pi, ri, e.currentTarget.value)}
                        onBlur={(e) => {
                          const v = prettify(e.currentTarget.value);
                          if (v !== e.currentTarget.value) onType?.(pi, ri, v);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); moveFocus(e.currentTarget, 1); }
                          if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(e.currentTarget, -1); }
                        }}
                      />
                    )}
                    {variant === "sample" && <span className="hw">{part.sample.rows[ri] ?? ""}</span>}
                    {here.map((n, k) => (
                      <span key={k} className="note" style={k ? { bottom: "auto", top: "calc(100% - 4px)" } : undefined}>{n.text}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {variant === "ink" && <WorkSpace extra={extra} onMore={onMore} />}
      {overlay}
    </div>
  );
}
