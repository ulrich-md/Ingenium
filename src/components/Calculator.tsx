"use client";
/**
 * A scientific calculator for the mocks (the IB allows a calculator in Paper 2).
 * Floating over the sheet, outside the camera; drag it by its top bar. Buttons only on
 * the iPad; on a computer the keyboard works too.
 */
import { useEffect, useRef, useState } from "react";
import { evaluate, show } from "@/lib/calc";
import { store } from "@/lib/storage";
import { Floating } from "./Camera";

type Key = { k: string; ins?: string; alt?: string; altIns?: string; cls?: string; label?: string };
const KEYS: Key[] = [
  { k: "2nd", cls: "fn" }, { k: "sin", ins: "sin(", alt: "sin⁻¹", altIns: "asin(", cls: "fn" }, { k: "cos", ins: "cos(", alt: "cos⁻¹", altIns: "acos(", cls: "fn" }, { k: "tan", ins: "tan(", alt: "tan⁻¹", altIns: "atan(", cls: "fn" }, { k: "DEG", cls: "fn" },
  { k: "log", ins: "log(", cls: "fn" }, { k: "ln", ins: "ln(", cls: "fn" }, { k: "√", ins: "√(", cls: "fn" }, { k: "x²", ins: "²", cls: "fn" }, { k: "^", ins: "^", cls: "fn" },
  { k: "7" }, { k: "8" }, { k: "9" }, { k: "(", cls: "op" }, { k: ")", cls: "op" },
  { k: "4" }, { k: "5" }, { k: "6" }, { k: "×", cls: "op" }, { k: "÷", cls: "op" },
  { k: "1" }, { k: "2" }, { k: "3" }, { k: "+", cls: "op" }, { k: "−", cls: "op" },
  { k: "0" }, { k: ",", ins: "," }, { k: "×10ⁿ", ins: "E", cls: "op" }, { k: "π", cls: "op" }, { k: "Ans", cls: "op" },
  { k: "AC", cls: "warn" }, { k: "⌫", cls: "warn", label: "Borrar" }, { k: "=", cls: "eq" },
];

export default function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("");
  const [res, setRes] = useState<{ e: string; v: string; err?: boolean } | null>(null);
  const [ans, setAns] = useState(0);
  const [second, setSecond] = useState(false);
  const [deg, setDeg] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDeg(store.get<boolean>("kw-calc-deg", true));
    const p = store.get<{ x: number; y: number } | null>("kw-calc-pos", null);
    if (p) setPos({ x: Math.min(p.x, window.innerWidth - 300), y: Math.min(p.y, window.innerHeight - 200) });
  }, []);

  const press = (key: Key) => {
    if (key.k === "2nd") { setSecond((s) => !s); return; }
    if (key.k === "DEG") { setDeg((d) => { store.set("kw-calc-deg", !d); return !d; }); return; }
    if (key.k === "AC") { setExpr(""); setRes(null); return; }
    if (key.k === "⌫") { setExpr((e) => e.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|√\(|Ans|.)$/, "")); return; }
    if (key.k === "=") {
      if (!expr.trim()) return;
      try {
        const v = evaluate(expr, { deg, ans });
        setAns(v);
        setRes({ e: expr, v: show(v) });
        setExpr("");
      } catch (err) {
        setRes({ e: expr, v: (err as Error).message, err: true });
      }
      return;
    }
    let ins = second && key.altIns ? key.altIns : key.ins ?? key.k;
    // starting with an operator continues from the last answer, as on a calculator
    if (!expr && res && !res.err && /^[×÷+^²E]$/.test(ins)) ins = "Ans" + ins;
    setExpr((e) => e + ins);
    if (second) setSecond(false);
  };

  // computer keyboard
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      const map: Record<string, string> = { "*": "×", "/": "÷", "-": "−", Enter: "=", "=": "=", Backspace: "⌫", Escape: "AC", ".": ",", p: "π" };
      const k = map[e.key] ?? e.key;
      const key = KEYS.find((x) => x.k === k);
      if (key) { e.preventDefault(); press(key); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  const style = pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined;
  return (
    <Floating>
      <div ref={box} className="calc" style={style} role="dialog" aria-label="Calculadora">
        <div
          className="calc-bar"
          onPointerDown={(e) => {
            const r = box.current!.getBoundingClientRect();
            drag.current = { x: e.clientX, y: e.clientY, px: r.left, py: r.top };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const x = Math.max(4, Math.min(window.innerWidth - 120, d.px + e.clientX - d.x));
            const y = Math.max(4, Math.min(window.innerHeight - 60, d.py + e.clientY - d.y));
            setPos({ x, y });
          }}
          onPointerUp={() => { drag.current = null; if (pos) store.set("kw-calc-pos", pos); }}
        >
          <span className="calc-grip" aria-hidden="true">⠿</span>
          <span>Calculadora · {deg ? "grados" : "radianes"}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar la calculadora">✕</button>
        </div>
        <div className="calc-screen" aria-live="polite">
          <div className="calc-prev">{res ? `${res.e} =` : " "}</div>
          <div className="calc-expr">{expr || (res ? <span className={res.err ? "calc-err" : ""}>{res.v}</span> : "0")}</div>
        </div>
        <div className="calc-keys">
          {KEYS.map((key) => (
            <button key={key.k} type="button" className={(key.cls ?? "") + (key.k === "2nd" && second ? " on" : "") + (key.k === "=" ? " wide" : "")}
              aria-label={key.label} onClick={() => press(key)}>
              {key.k === "DEG" ? (deg ? "DEG" : "RAD") : second && key.alt ? key.alt : key.k}
            </button>
          ))}
        </div>
      </div>
    </Floating>
  );
}
