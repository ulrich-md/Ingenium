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
  /** ink only: extra room asked for ("+ Más espacio"), px */
  extra?: number;
  onMore?: () => void;
  /** ink only: answer boxes stretched so the page fills a portrait iPad screen. Sheets
   *  written before this layout keep the old one (a work space at the bottom) so their ink
   *  stays on its lines. */
  tall?: boolean;
}

const ROW = 40; // px per answer line (see .abox .r)
/** Page height to fill (design px): from the top of the sheet to the bottom of a portrait
 *  iPad screen. Fixed, so portrait and landscape have the same layout and ink lines up. */
const TALL_PAGE = 880;

/** Extra lines per part so the page reaches TALL_PAGE, shared out by marks. */
function shareRows(total: number, marks: number[]): number[] {
  const W = marks.reduce((a, b) => a + b, 0) || 1;
  const raw = marks.map((m) => (total * m) / W);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) out[i]++; });
  return out;
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

export default function ExamSheet({ sheet, variant, typed, onType, onFocusInput, notes, totals, overlay, readOnly, extra = 0, onMore, tall }: Props) {
  const paper = useRef<HTMLDivElement>(null);
  const stretch = variant === "ink" && !!tall;
  const [add, setAdd] = useState<number[] | null>(null);
  const moreRows = Math.round(extra / ROW);
  // measure the page with its normal boxes once, then share the room left among them
  useLayoutEffect(() => {
    if (!stretch) { setAdd(null); return; }
    const el = paper.current;
    if (!el) return;
    // bottom of the last answer box with the normal number of lines (the same while
    // writing and while marking, so the layout and the ink never differ between them)
    const boxes = el.querySelectorAll<HTMLElement>(".abox");
    const last = boxes[boxes.length - 1];
    if (!last) return;
    const already = (add ?? []).reduce((a, b) => a + b, 0) + moreRows;
    const h = last.offsetTop + last.offsetHeight - already * ROW;
    setAdd(shareRows(Math.max(0, Math.floor((TALL_PAGE - h) / ROW)), sheet.parts.map((p) => p.marks)));
  }, [stretch, sheet.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={paper} className={"paper" + (variant === "ink" ? " ink" : "")}>
      <div className="qh">
        <span><b>{sheet.num}.</b>&nbsp; [Puntuación máxima: {SHEET_MAX(sheet)}]</span>
        <span className="code">{sheet.code}</span>
      </div>
      <p className="stem">{sheet.stem}</p>
      {sheet.data && <p className="data">{sheet.data}</p>}
      {sheet.figure && <Figure id={sheet.figure} />}

      {sheet.parts.map((part, pi) => {
        const rows = variant === "sample" ? Math.max(part.rows, part.sample.rows.length)
          : part.rows + (stretch ? (add?.[pi] ?? 0) + (pi === sheet.parts.length - 1 ? moreRows : 0) : 0);
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
      {variant === "ink" && !stretch && <WorkSpace extra={extra} onMore={onMore} />}
      {stretch && onMore && <div className="morerow"><button type="button" className="ws-more" onClick={onMore}>+ Más espacio</button></div>}
      {overlay}
    </div>
  );
}
