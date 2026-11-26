"use client";
/**
 * One exam sheet of the diagnostic, in the experience of the device:
 * iPad writes with the Pencil (self-marked in this demo, with an example of AI marking),
 * the computer types line by line (marked automatically by the rule checker).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { store } from "@/lib/storage";
import { markTyped, type RowNote } from "@/lib/check";
import type { Sheet } from "@/lib/content";
import ExamSheet from "./ExamSheet";
import FitPage from "./FitPage";
import InkLayer, { type InkHandle } from "./InkLayer";
import { useFocusMode } from "./Focus";
import { useCamera, ZoomBadge } from "./Camera";
import { InkToolbar, useInkTools } from "./InkTools";
import SaveStatus from "./SaveStatus";
import { FormulaColumn, FormulaDrawer, hasFormulas, useFormulasOpen, useWide } from "./FormulaPanel";

type Awarded = (boolean | null)[][];

const KEYS = ["√(", "×", "×10ⁿ", "²", "³", "⁻¹", "π", "θ", "Δ", "λ", "ω", "μ", "ρ", "≈", "°", "→"];

/** On the iPad the exam sheet is a fixed-size page scaled to the screen (see FitPage). */
function SheetFit({ ipad, children }: { ipad: boolean; children: React.ReactNode }) {
  return ipad ? <FitPage width={SHEET_W}>{children}</FitPage> : <>{children}</>;
}
const SHEET_W = 860;

export default function SheetStep({
  sheet, mode, typed, onTyped, awarded, onAwarded, marked, onMarked, onNext, nextLabel, exam,
}: {
  sheet: Sheet;
  mode: "ipad" | "computadora";
  typed: string[][];
  onTyped: (t: string[][]) => void;
  awarded: Awarded | undefined;
  onAwarded: (a: Awarded) => void;
  marked: boolean;
  onMarked: (m: boolean) => void;
  onNext: () => void;
  nextLabel: string;
  /** Exam mode: no marking, hints or skipping; the parent controls navigation. */
  exam?: { onPrev?: () => void; info: string };
}) {
  const ink = useRef<InkHandle>(null);
  const lastInput = useRef<HTMLInputElement | null>(null);
  const tools = useInkTools({ exam: !!exam });
  const [sheetOpen, setSheetOpen] = useState(true);
  // the booklet formulas for this topic, beside the sheet (a panel on narrow screens)
  const wide = useWide();
  const [fOpen, setFOpen] = useFormulasOpen(wide);
  const showF = !marked && hasFormulas(sheet.topic);
  useFocusMode();
  // writing on the iPad: the sheet has its own pan and zoom; marking scrolls normally
  useCamera(mode === "ipad" && !marked);
  // on narrow screens the markscheme panel and the pen bar share the bottom edge:
  // while the panel is open the bar steps aside (globals.css, body.marksheet)
  useEffect(() => {
    if (!marked || !sheetOpen) return;
    document.body.classList.add("marksheet");
    return () => document.body.classList.remove("marksheet");
  }, [marked, sheetOpen]);
  // room added below the sheet ("+ Más espacio"), remembered per sheet
  const spaceKey = `kw-space-${sheet.id}`;
  const [space, setSpace] = useState(0);
  useEffect(() => setSpace(store.get<number>(spaceKey, 0)), [spaceKey]);
  const more = () => setSpace((v) => { const n = Math.min(4000, v + 160); store.set(spaceKey, n); return n; });
  // stretched answer boxes, except on sheets that already have ink in the earlier layout
  const [tall, setTall] = useState(true);
  useEffect(() => {
    const flag = `kw-tall-${sheet.id}`;
    const old = store.get<unknown[]>(`kw-ink-${sheet.id}`, []).length > 0 && !store.get<boolean>(flag, false);
    if (!old) store.set(flag, true);
    setTall(!old);
  }, [sheet.id]);
  const [showSol, setShowSol] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const onStrokes = useCallback((n: number) => setStrokes(n), []);
  // the how-to line shows until the student closes it (once per device type)
  const tipKey = `kw-tip-sheet-${exam ? "exam" : mode}`;
  const [tip, setTip] = useState(false);
  useEffect(() => setTip(!store.get<boolean>(tipKey, false)), [tipKey]);
  const closeTip = () => { store.set(tipKey, true); setTip(false); };

  const setRow = (p: number, r: number, v: string) => {
    const next = sheet.parts.map((part, i) => Array.from({ length: part.rows }, (_, j) => typed[i]?.[j] ?? ""));
    next[p][r] = v;
    onTyped(next);
    if (marked) onMarked(false);
  };

  const insert = (txt: string) => {
    const el = lastInput.current;
    if (!el) return;
    const ins = txt === "×10ⁿ" ? " × 10^" : txt;
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? s;
    const v = el.value.slice(0, s) + ins + el.value.slice(e);
    setRow(Number(el.dataset.p), Number(el.dataset.r), v);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + ins.length, s + ins.length); });
  };

  // Typed answers are marked by the rules; notes land on the matching rows.
  const typedMarks = useMemo(
    () => sheet.parts.map((p, i) => markTyped(typed[i] ?? [], p.rules)),
    [sheet, typed],
  );

  const doMark = () => {
    if (mode === "computadora") onAwarded(typedMarks.map((m) => m.awarded));
    else onAwarded(sheet.parts.map((p, i) => awarded?.[i] ?? p.rules.map(() => null)));
    onMarked(true);
  };

  const toggle = (pi: number, ri: number, v: boolean) => {
    const a = sheet.parts.map((p, i) => p.rules.map((_, j) => awarded?.[i]?.[j] ?? null));
    a[pi][ri] = a[pi][ri] === v ? null : v;
    onAwarded(a);
  };

  const partScore = (pi: number) => (awarded?.[pi] ?? []).filter((x) => x === true).length;
  const allSet = sheet.parts.every((p, i) => p.rules.every((_, j) => awarded?.[i]?.[j] != null));
  const notes: RowNote[][] | undefined = marked && mode === "computadora" ? typedMarks.map((m) => m.notes) : undefined;
  const totals = marked ? sheet.parts.map((p, i) => (awarded?.[i]?.some((x) => x != null) ? partScore(i) : null)) : undefined;
  const wrote = mode === "ipad" ? strokes > 0 : typed.some((p) => p?.some((r) => r.trim()));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {mode === "ipad" ? (
        // the pen bar stays while marking too (to correct in red); only the zoom badge is for writing
        <><InkToolbar t={tools} ink={ink} />{!marked && <ZoomBadge />}</>
      ) : !marked && (
        <div className="toolbar" role="toolbar" aria-label="Símbolos">
          <span className="lab">Símbolos</span>
          {KEYS.map((k) => (
            <button key={k} className="fkey" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(k)}>{k}</button>
          ))}
          <span className="grow" />
          <span className="lab">Enter: siguiente renglón · 10^6 → 10⁶</span>
        </div>
      )}

      {!marked ? (
        <div className="focuswrap">
          {tip && (
            <div className="tipline" role="note">
              <span>
                {exam ? exam.info : mode === "ipad"
                  ? "Escribe en los recuadros con el Apple Pencil. Con el dedo desplazas la hoja, así puedes apoyar la mano."
                  : <>Un paso por renglón. Escribe <span className="mono">10^6</span> o <span className="mono">sqrt(</span> y se convierten solos.</>}
              </span>
              <button type="button" className="tipx" aria-label="Entendido, ocultar" onClick={closeTip}>Entendido</button>
            </div>
          )}
          {(exam || showF) && (
            // above the sheet: in an exam the arrows (clear of the pen bar and the clock), and the formulas
            <div className="sheettop">
              {exam?.onPrev ? <button className="btn sm" type="button" onClick={exam.onPrev}>← Anterior</button> : exam ? <SaveStatus /> : null}
              <span className="st-right">
                {showF && <button className="btn sm fbtn" type="button" aria-pressed={fOpen} onClick={() => setFOpen(!fOpen)}>Fórmulas</button>}
                {exam && <button className="btn primary sm" type="button" onClick={onNext}>{nextLabel}</button>}
              </span>
            </div>
          )}
          {showF && fOpen && !wide && <FormulaDrawer topic={sheet.topic} onClose={() => setFOpen(false)} />}
          <div className={"sheetgrid" + (showF && fOpen && wide ? " withf" : "")}>
          <div className="desk">
            <SheetFit ipad={mode === "ipad"}>
              <ExamSheet
                sheet={sheet}
                variant={mode === "ipad" ? "ink" : "typed"}
                extra={space} onMore={marked ? undefined : more} tall={tall}
                typed={typed}
                onType={setRow}
                onFocusInput={(el) => { lastInput.current = el; }}
                overlay={mode === "ipad" ? <InkLayer ref={ink} storageKey={`kw-ink-${sheet.id}`} tool={tools.tool} color={tools.color} size={tools.size} fingerDraws={tools.finger} eraseMode={tools.eraseMode} eraseR={tools.eraseR} onStrokes={onStrokes} onSelect={tools.setSelected} /> : null}
              />
            </SheetFit>
          </div>
          {showF && fOpen && wide && <FormulaColumn topic={sheet.topic} onClose={() => setFOpen(false)} />}
          </div>
          {!exam && (
            <div className="sheetact">
              <button className="btn ghost" type="button" onClick={onNext}>Saltar esta pregunta</button>
              <span className="sa-main">
                <SaveStatus />
                {!wrote && <span className="muted sa-hint">Escribe al menos un renglón para corregir</span>}
                <button className="btn primary" type="button" onClick={doMark} disabled={!wrote}>Terminar y corregir</button>
              </span>
            </div>
          )}
        </div>
      ) : (
      <div className={"sheetwrap marking" + (sheetOpen ? "" : " closed")}>
        <div className="desk">
          <SheetFit ipad={mode === "ipad"}>
            <ExamSheet
              sheet={sheet}
              variant={mode === "ipad" ? "ink" : "typed"}
                extra={space} onMore={marked ? undefined : more} tall={tall}
              typed={typed}
              onType={setRow}
              onFocusInput={(el) => { lastInput.current = el; }}
              notes={notes}
              totals={totals}
              overlay={mode === "ipad" ? <InkLayer ref={ink} storageKey={`kw-ink-${sheet.id}`} tool={tools.tool} color={tools.color} size={tools.size} fingerDraws={tools.finger} eraseMode={tools.eraseMode} eraseR={tools.eraseR} onStrokes={onStrokes} onSelect={tools.setSelected} /> : null}
            />
          </SheetFit>
          {mode === "ipad" && marked && showSample && (
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <p className="eyebrow">Ejemplo · así corregirá la IA una hoja escrita a mano</p>
              <SheetFit ipad><ExamSheet sheet={sheet} variant="sample" /></SheetFit>
            </div>
          )}
        </div>

        <aside className="side" aria-label="Esquema de marcas">
          <>
              <button type="button" className="sheet-toggle" aria-expanded={sheetOpen} onClick={() => setSheetOpen((v) => !v)}>
                <span className="grab" aria-hidden="true" />
                {sheetOpen ? "Ocultar esquema para ver tu hoja" : "Mostrar esquema de marcas"}
              </button>
              <span className="h">Corrección · {mode === "ipad" ? "márcate con el esquema" : "automática por renglón"}</span>
              {mode === "ipad" && (
                <p className="muted" style={{ fontSize: ".86rem" }}>En la versión final, la IA lee tu tinta y escribe las marcas en el margen. En esta demo, marca tú cada punto del esquema: ✓ si lo escribiste, ✗ si no.</p>
              )}
              {sheet.parts.map((p, pi) => (
                <div key={p.label} style={{ display: "grid", gap: 8 }}>
                  <div className="partscore"><span>Parte {p.label}</span><span>{partScore(pi)} / {p.marks}</span></div>
                  <ul className="rules">
                    {p.rules.map((r, ri) => {
                      const v = awarded?.[pi]?.[ri] ?? null;
                      return (
                        <li key={ri} className="rule">
                          <span style={{ display: "grid", gap: 4 }}>
                            <button type="button" className={v === true ? "y" : ""} aria-pressed={v === true} aria-label={`Marca ${r.code} conseguida`} onClick={() => toggle(pi, ri, true)}>✓</button>
                            <button type="button" className={v === false ? "n" : ""} aria-pressed={v === false} aria-label={`Marca ${r.code} no conseguida`} onClick={() => toggle(pi, ri, false)}>✗</button>
                          </span>
                          <span><b>{r.code}</b> {r.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {mode === "computadora" && <p className="muted" style={{ fontSize: ".82rem" }}>¿No estás de acuerdo con una marca? Cámbiala con ✓ o ✗.</p>}
              {sheet.parts.some((p) => p.solution) && (
                <button className="btn sm" type="button" onClick={() => setShowSol((v) => !v)}>{showSol ? "Ocultar solución" : "Ver solución paso a paso"}</button>
              )}
              {showSol && (
                <div className="solution">
                  {sheet.parts.map((p) => p.solution && (
                    <div key={p.label}><b>{p.label}</b>{p.solution.map((l, i) => <span key={i} className="sl">{l}</span>)}</div>
                  ))}
                </div>
              )}
              {mode === "ipad" && !sheet.parts.some((p) => p.solution) && (
                <button className="btn sm" type="button" onClick={() => setShowSample((s) => !s)}>
                  {showSample ? "Ocultar ejemplo" : "Ver ejemplo de corrección con IA"}
                </button>
              )}
              <button className="btn primary" type="button" onClick={onNext} disabled={mode === "ipad" && !allSet}>{nextLabel}</button>
              {mode === "ipad" && !allSet && <p className="muted" style={{ fontSize: ".82rem" }}>Marca todos los puntos para continuar.</p>}
          </>
        </aside>
      </div>
      )}
    </div>
  );
}
