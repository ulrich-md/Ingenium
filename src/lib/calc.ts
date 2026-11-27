/**
 * The mock's scientific calculator: evaluates an expression typed with its keys, with no
 * eval(). Precedence: functions, ^ (right-associative), unary minus, × ÷, + −.
 * Implicit multiplication: 2π, 3(4+1), 2sin(30). Angles in degrees by default.
 */
export type Token = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn"; v: string } | { t: "(" } | { t: ")" };

const FN = ["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "√"] as const;

export function tokenize(src: string, ans = 0): Token[] {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".").replace(/\s+/g, "");
  const out: Token[] = [];
  let i = 0;
  const prevValue = () => {
    const p = out[out.length - 1];
    return p && (p.t === "num" || p.t === ")");
  };
  while (i < s.length) {
    const c = s[i];
    const num = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      if (prevValue()) out.push({ t: "op", v: "*" });
      out.push({ t: "num", v: parseFloat(num[0].replace("E", "e")) });
      i += num[0].length;
      continue;
    }
    if (s.startsWith("π", i) || s.startsWith("Ans", i)) {
      if (prevValue()) out.push({ t: "op", v: "*" });
      out.push({ t: "num", v: s.startsWith("π", i) ? Math.PI : ans });
      i += s.startsWith("π", i) ? 1 : 3;
      continue;
    }
    const fn = FN.find((f) => s.startsWith(f, i));
    if (fn) {
      if (prevValue()) out.push({ t: "op", v: "*" });
      out.push({ t: "fn", v: fn });
      i += fn.length;
      continue;
    }
    if (c === "(") { if (prevValue()) out.push({ t: "op", v: "*" }); out.push({ t: "(" }); i++; continue; }
    if (c === ")") { out.push({ t: ")" }); i++; continue; }
    if ("+-*/^".includes(c)) {
      // a minus with nothing to its left is a sign
      out.push({ t: "op", v: c === "-" && !prevValue() ? "neg" : c === "+" && !prevValue() ? "pos" : c });
      i++;
      continue;
    }
    if (c === "²") { out.push({ t: "op", v: "^" }, { t: "num", v: 2 }); i++; continue; }
    throw new Error("Símbolo no válido");
  }
  return out;
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, neg: 3, pos: 3, "^": 4 };

export function evaluate(src: string, opts: { deg?: boolean; ans?: number } = {}): number {
  const deg = opts.deg ?? true;
  const toRad = (x: number) => (deg ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (deg ? (x * 180) / Math.PI : x);
  const tokens = tokenize(src, opts.ans ?? 0);
  // shunting-yard to RPN
  const outq: Token[] = [], st: Token[] = [];
  for (const tk of tokens) {
    if (tk.t === "num") outq.push(tk);
    else if (tk.t === "fn" || tk.t === "(") st.push(tk);
    else if (tk.t === "op") {
      const unary = tk.v === "neg" || tk.v === "pos";
      while (!unary && st.length) {
        const top = st[st.length - 1];
        if (top.t === "fn") { outq.push(st.pop()!); continue; }
        if (top.t !== "op") break;
        const a = PREC[top.v], b = PREC[tk.v];
        if (a > b || (a === b && tk.v !== "^")) outq.push(st.pop()!); else break;
      }
      st.push(tk);
    } else {
      while (st.length && st[st.length - 1].t !== "(") outq.push(st.pop()!);
      if (!st.length) throw new Error("Paréntesis de más");
      st.pop();
      if (st.length && st[st.length - 1].t === "fn") outq.push(st.pop()!);
    }
  }
  while (st.length) {
    const tk = st.pop()!;
    if (tk.t === "(") continue; // unclosed brackets close themselves, as on a calculator
    outq.push(tk);
  }
  const v: number[] = [];
  const need = (n: number) => { if (v.length < n) throw new Error("Expresión incompleta"); };
  for (const tk of outq) {
    if (tk.t === "num") { v.push(tk.v); continue; }
    if (tk.t === "fn") {
      need(1);
      const x = v.pop()!;
      const r = { sin: Math.sin(toRad(x)), cos: Math.cos(toRad(x)), tan: Math.tan(toRad(x)), asin: fromRad(Math.asin(x)), acos: fromRad(Math.acos(x)), atan: fromRad(Math.atan(x)), log: Math.log10(x), ln: Math.log(x), "√": Math.sqrt(x) }[tk.v as (typeof FN)[number]];
      v.push(r);
      continue;
    }
    if (tk.t !== "op") continue;
    if (tk.v === "neg" || tk.v === "pos") { need(1); const x = v.pop()!; v.push(tk.v === "neg" ? -x : x); continue; }
    need(2);
    const b = v.pop()!, a = v.pop()!;
    v.push(tk.v === "+" ? a + b : tk.v === "-" ? a - b : tk.v === "*" ? a * b : tk.v === "/" ? a / b : Math.pow(a, b));
  }
  if (v.length !== 1 || !Number.isFinite(v[0])) throw new Error(v.length === 1 ? "Error matemático" : "Expresión incompleta");
  // tidy floating-point noise: sin(30) = 0.5, not 0.49999999999999994
  return Number(v[0].toPrecision(12));
}

/** A result for the display: up to 10 significant figures, ×10ⁿ when large or small, decimal comma. */
export function show(x: number): string {
  if (x === 0) return "0";
  const ax = Math.abs(x);
  if (ax >= 1e10 || ax < 1e-6) {
    const [m, e] = x.toExponential(9).split("e");
    return `${String(Number(m)).replace(".", ",")} × 10^${Number(e)}`;
  }
  return String(Number(x.toPrecision(10))).replace(".", ",");
}
