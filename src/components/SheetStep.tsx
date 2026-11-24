"use client";
/**
 * One exam sheet of the diagnostic, in the experience of the device:
 * iPad writes with the Pencil (self-marked in this demo, with an example of AI marking),
 * the computer types line by line (marked automatically by the rule checker).
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { markTyped, type RowNote } from "@/lib/check";
import type { Sheet } from "@/lib/content";
import ExamSheet from "./ExamSheet";
import InkLayer, { type InkHandle } from "./InkLayer";
import { InkToolbar, useInkTools } from "./InkTools";

type Awarded = (boolean | null)[][];

const KEYS = ["√(", "×", "×10ⁿ", "²", "³", "⁻¹", "π", "θ", "Δ", "λ", "ω", "μ", "ρ", "≈", "°", "→"];

export default function SheetStep({
  sheet, mode, typed, onTyped, awarded, onAwarded, marked, onMarked, onNext, nextLabel,
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
}) {
  const ink = useRef<InkHandle>(null);
  const lastInput = useRef<HTMLInputElement | null>(null);
  const tools = useInkTools();
  const [showSol, setShowSol] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const onStrokes = useCallback((n: number) => setStrokes(n), []);

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
        <InkToolbar t={tools} ink={ink} />
      ) : (
        <div className="toolbar" role="toolbar" aria-label="Símbolos">
          <span className="lab">Símbolos</span>
          {KEYS.map((k) => (
            <button key={k} className="fkey" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(k)}>{k}</button>
          ))}
          <span className="grow" />
          <span className="lab">Enter: siguiente renglón · 10^6 → 10⁶</span>
        </div>
      )}

      <div className="sheetwrap">
        <div className="desk">
          <ExamSheet
            sheet={sheet}
            variant={mode === "ipad" ? "ink" : "typed"}
            typed={typed}
            onType={setRow}
            onFocusInput={(el) => { lastInput.current = el; }}
            notes={notes}
            totals={totals}
            overlay={mode === "ipad" ? <InkLayer ref={ink} storageKey={`kw-ink-${sheet.id}`} tool={tools.tool} color={tools.color} size={tools.size} fingerDraws={tools.finger} onStrokes={onStrokes} onSelect={tools.setSelected} /> : null}
          />
          {mode === "ipad" && marked && showSample && (
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <p className="eyebrow">Ejemplo · así corregirá la IA una hoja escrita a mano</p>
              <ExamSheet sheet={sheet} variant="sample" />
            </div>
          )}
        </div>

        <aside className="side">
          {!marked ? (
            <>
              <span className="h">{sheet.paper} · {sheet.topic}</span>
              {mode === "ipad" ? (
                <p className="muted" style={{ fontSize: ".92rem" }}>Escribe dentro de los recuadros con el Apple Pencil, como en el examen. Con el dedo desplazas la hoja, así puedes apoyar la mano. Si te equivocas, tacha o usa el borrador.</p>
              ) : (
                <p className="muted" style={{ fontSize: ".92rem" }}>Escribe un paso por renglón, como en el examen. Usa la barra de símbolos o escribe <span className="mono">10^6</span>, <span className="mono">sqrt(</span>: se convierten solos al pasar de renglón.</p>
              )}
              <button className="btn primary" type="button" onClick={doMark} disabled={!wrote}>Terminar y corregir</button>
              {!wrote && <p className="muted" style={{ fontSize: ".82rem" }}>Escribe al menos un renglón para corregir.</p>}
              <button className="btn ghost sm" type="button" onClick={onNext}>Saltar esta pregunta</button>
            </>
          ) : (
            <>
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
          )}
        </aside>
      </div>
    </div>
  );
}
