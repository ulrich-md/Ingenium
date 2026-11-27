/**
 * Draws a Fig (lib/fig.ts): black lines and Arial labels on white, like a printed IB paper.
 */
import type { Arrow, CompKind, Fig, FigItem } from "@/lib/fig";

const INK = "#111";
const FILL = { none: "none", light: "#e9ebef", dark: "#5b6270" } as const;
const T = { fontFamily: "Arial, Helvetica, sans-serif", fill: INK } as const;

function head(x: number, y: number, ang: number, size = 8) {
  const a1 = ang + Math.PI * 0.85, a2 = ang - Math.PI * 0.85;
  return `M${x} ${y}L${x + size * Math.cos(a1)} ${y + size * Math.sin(a1)}L${x + size * Math.cos(a2)} ${y + size * Math.sin(a2)}Z`;
}
function heads(x1: number, y1: number, x2: number, y2: number, arrow: Arrow | undefined, key: string, size = 8) {
  if (!arrow) return null;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g key={key} fill={INK} stroke="none">
      {(arrow === "end" || arrow === "both") && <path d={head(x2, y2, a, size)} />}
      {(arrow === "start" || arrow === "both") && <path d={head(x1, y1, a + Math.PI, size)} />}
    </g>
  );
}

/** A circuit symbol drawn along the x axis from −20 to 20 (rotated into place). */
function symbol(kind: CompKind): React.ReactNode {
  switch (kind) {
    case "resistor": return <rect x={-16} y={-6} width={32} height={12} fill="#fff" />;
    case "variable": return <><rect x={-16} y={-6} width={32} height={12} fill="#fff" /><line x1={-14} y1={12} x2={14} y2={-12} /><path d={head(14, -12, Math.atan2(-24, 28), 6)} fill={INK} stroke="none" /></>;
    case "ldr": return <><rect x={-16} y={-6} width={32} height={12} fill="#fff" /><circle cx={0} cy={0} r={13} fill="none" /><line x1={-14} y1={-24} x2={-6} y2={-14} /><path d={head(-6, -14, Math.atan2(10, 8), 5)} fill={INK} stroke="none" /><line x1={-4} y1={-26} x2={4} y2={-16} /><path d={head(4, -16, Math.atan2(10, 8), 5)} fill={INK} stroke="none" /></>;
    case "thermistor": return <><rect x={-16} y={-6} width={32} height={12} fill="#fff" /><polyline points="-16,12 -8,12 12,-12" fill="none" /></>;
    case "cell": return <><rect x={-5} y={-14} width={10} height={28} fill="#fff" stroke="none" /><line x1={-4} y1={-14} x2={-4} y2={14} /><line x1={4} y1={-7} x2={4} y2={7} strokeWidth={3} /></>;
    case "battery": return <><rect x={-12} y={-14} width={24} height={28} fill="#fff" stroke="none" /><line x1={-10} y1={-14} x2={-10} y2={14} /><line x1={-3} y1={-7} x2={-3} y2={7} strokeWidth={3} /><line x1={3} y1={-14} x2={3} y2={14} /><line x1={10} y1={-7} x2={10} y2={7} strokeWidth={3} /></>;
    case "lamp": return <><circle cx={0} cy={0} r={11} fill="#fff" /><line x1={-7.8} y1={-7.8} x2={7.8} y2={7.8} /><line x1={-7.8} y1={7.8} x2={7.8} y2={-7.8} /></>;
    case "switch": return <><rect x={-14} y={-14} width={28} height={16} fill="#fff" stroke="none" /><circle cx={-12} cy={0} r={2} fill={INK} /><circle cx={12} cy={0} r={2} fill={INK} /><line x1={-12} y1={0} x2={10} y2={-11} /></>;
    case "ammeter": case "voltmeter":
      return <circle cx={0} cy={0} r={11} fill="#fff" />; // its letter is drawn upright (see "comp")
    case "diode": return <><rect x={-9} y={-10} width={18} height={20} fill="#fff" stroke="none" /><path d="M-8 -9L8 0L-8 9Z" fill={INK} /><line x1={8} y1={-9} x2={8} y2={9} /></>;
  }
}

/** Tick labels that fit: one that would touch the previous label is left out (the tick stays). */
function spaced(ticks: number[], at: (v: number) => number, size: (v: number) => number): number[] {
  const out: number[] = [];
  let last: { p: number; s: number } | null = null;
  for (const v of [...ticks].sort((a, b) => at(a) - at(b))) {
    const p = at(v), s = size(v);
    if (last && Math.abs(p - last.p) < (s + last.s) / 2) continue;
    out.push(v);
    last = { p, s };
  }
  return out;
}

function item(it: FigItem, i: number): React.ReactNode {
  const k = `i${i}`;
  switch (it.t) {
    case "line":
      return (
        <g key={k}>
          <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} stroke={it.gray ? "#9aa1ad" : INK} strokeWidth={it.w ?? 1.6} strokeDasharray={it.dash ? "5 4" : undefined} />
          {heads(it.x1, it.y1, it.x2, it.y2, it.arrow, k + "h", 6 + (it.w ?? 1.6) * 1.5)}
        </g>
      );
    case "poly": {
      const p = it.pts, n = p.length;
      return (
        <g key={k}>
          {it.close ? <polygon points={p.join(" ")} fill={FILL[it.fill ?? "none"]} stroke={INK} strokeWidth={it.w ?? 1.6} strokeDasharray={it.dash ? "5 4" : undefined} />
            : <polyline points={p.join(" ")} fill={FILL[it.fill ?? "none"]} stroke={INK} strokeWidth={it.w ?? 1.6} strokeLinejoin="round" strokeDasharray={it.dash ? "5 4" : undefined} />}
          {n >= 4 && (it.arrow === "end" || it.arrow === "both") && heads(p[n - 4], p[n - 3], p[n - 2], p[n - 1], "end", k + "e")}
          {n >= 4 && (it.arrow === "start" || it.arrow === "both") && heads(p[2], p[3], p[0], p[1], "end", k + "s")}
        </g>
      );
    }
    case "path":
      return <path key={k} d={it.d} fill={FILL[it.fill ?? "none"]} stroke={INK} strokeWidth={it.w ?? 1.6} strokeDasharray={it.dash ? "5 4" : undefined} markerEnd={it.arrow ? "url(#fig-ah)" : undefined} markerStart={it.arrow === "start" || it.arrow === "both" ? "url(#fig-ahs)" : undefined} />;
    case "rect":
      return <rect key={k} x={it.x} y={it.y} width={it.w} height={it.h} rx={it.r} fill={FILL[it.fill ?? "none"]} stroke={INK} strokeWidth={it.sw ?? 1.6} strokeDasharray={it.dash ? "5 4" : undefined} />;
    case "circle":
      return <circle key={k} cx={it.cx} cy={it.cy} r={it.r} fill={FILL[it.fill ?? "none"]} stroke={INK} strokeWidth={it.sw ?? 1.6} strokeDasharray={it.dash ? "5 4" : undefined} />;
    case "text":
      return <text key={k} x={it.x} y={it.y} fontSize={it.size ?? 13} textAnchor={it.anchor ?? "middle"} fontStyle={it.italic ? "italic" : undefined} fontWeight={it.bold ? 700 : undefined} {...T}>{it.s}</text>;
    case "dot":
      return <circle key={k} cx={it.x} cy={it.y} r={it.r ?? 3} fill={INK} />;
    case "angle": {
      const a1 = (-it.a1 * Math.PI) / 180, a2 = (-it.a2 * Math.PI) / 180;
      const p1 = [it.x + it.r * Math.cos(a1), it.y + it.r * Math.sin(a1)], p2 = [it.x + it.r * Math.cos(a2), it.y + it.r * Math.sin(a2)];
      const large = Math.abs(it.a2 - it.a1) > 180 ? 1 : 0, sweep = it.a2 > it.a1 ? 0 : 1;
      const mid = (a1 + a2) / 2, lr = it.r + 12;
      return (
        <g key={k}>
          <path d={`M${p1[0]} ${p1[1]}A${it.r} ${it.r} 0 ${large} ${sweep} ${p2[0]} ${p2[1]}`} fill="none" stroke={INK} strokeWidth={1.2} />
          {it.label && <text x={it.x + lr * Math.cos(mid)} y={it.y + lr * Math.sin(mid) + 4} fontSize={12} textAnchor="middle" {...T}>{it.label}</text>}
        </g>
      );
    }
    case "ground": {
      const dx = it.x2 - it.x1, dy = it.y2 - it.y1, L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L, s = it.side ?? 1, nx = -uy * s, ny = ux * s;
      const n = Math.floor(L / 9);
      return (
        <g key={k} stroke={INK}>
          <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} strokeWidth={1.8} />
          {Array.from({ length: n }, (_, j) => {
            const x = it.x1 + ux * (j * 9 + 6), y = it.y1 + uy * (j * 9 + 6);
            return <line key={j} x1={x} y1={y} x2={x - ux * 6 - nx * 7} y2={y - uy * 6 - ny * 7} strokeWidth={1} />;
          })}
        </g>
      );
    }
    case "spring": {
      const dx = it.x2 - it.x1, dy = it.y2 - it.y1, L = Math.hypot(dx, dy) || 1;
      const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, c = it.coils ?? 8, wd = it.width ?? 8;
      const pts: number[] = [it.x1, it.y1];
      const a = L * 0.1, b = L * 0.9;
      pts.push(it.x1 + ux * a, it.y1 + uy * a);
      for (let j = 0; j < c * 2; j++) {
        const d = a + ((b - a) * (j + 0.5)) / (c * 2), sgn = j % 2 ? -1 : 1;
        pts.push(it.x1 + ux * d + nx * wd * sgn, it.y1 + uy * d + ny * wd * sgn);
      }
      pts.push(it.x1 + ux * b, it.y1 + uy * b, it.x2, it.y2);
      return <polyline key={k} points={pts.join(" ")} fill="none" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />;
    }
    case "comp": {
      const cx = (it.x1 + it.x2) / 2, cy = (it.y1 + it.y2) / 2;
      const a = (Math.atan2(it.y2 - it.y1, it.x2 - it.x1) * 180) / Math.PI;
      const vertical = Math.abs(Math.abs(a) - 90) < 1;
      return (
        <g key={k} stroke={INK} strokeWidth={1.6}>
          <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} />
          <g transform={`translate(${cx} ${cy}) rotate(${a})`}>{symbol(it.kind)}</g>
          {(it.kind === "ammeter" || it.kind === "voltmeter") && <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={13} {...T} stroke="none">{it.kind === "ammeter" ? "A" : "V"}</text>}
          {it.label && (
            <text x={vertical ? cx + 22 : cx} y={vertical ? cy + 4 : cy - 18} fontSize={12} textAnchor={vertical ? "start" : "middle"} {...T} stroke="none">{it.label}</text>
          )}
        </g>
      );
    }
    case "graph": {
      const { x, y, w, h, xr, yr } = it;
      const X = (v: number) => x + ((v - xr[0]) / (xr[1] - xr[0] || 1)) * w;
      const Y = (v: number) => y + h - ((v - yr[0]) / (yr[1] - yr[0] || 1)) * h;
      const x0 = X(Math.max(xr[0], Math.min(xr[1], 0))), y0 = Y(Math.max(yr[0], Math.min(yr[1], 0)));
      const xt = it.xticks ?? [], yt = it.yticks ?? [];
      const lab = (v: number) => String(Math.round(v * 1000) / 1000).replace(".", ",");
      return (
        <g key={k}>
          {it.grid && (
            <g stroke="#d4d8e0" strokeWidth={0.8}>
              {xt.map((v) => <line key={"gx" + v} x1={X(v)} y1={y} x2={X(v)} y2={y + h} />)}
              {yt.map((v) => <line key={"gy" + v} x1={x} y1={Y(v)} x2={x + w} y2={Y(v)} />)}
            </g>
          )}
          <line x1={x} y1={y0} x2={x + w + 8} y2={y0} stroke={INK} strokeWidth={1.4} />
          <line x1={x0} y1={y + h} x2={x0} y2={y - 8} stroke={INK} strokeWidth={1.4} />
          {heads(x, y0, x + w + 8, y0, "end", k + "xa", 7)}
          {heads(x0, y + h, x0, y - 8, "end", k + "ya", 7)}
          {it.series.map((s, j) => {
            const pts = s.pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ");
            return (
              <g key={"s" + j}>
                {!s.dots && <polyline points={pts} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" strokeDasharray={s.dash ? "6 4" : undefined} />}
                {s.dots && s.pts.map(([a, b], q) => (
                  <g key={q} stroke={INK} strokeWidth={1.4}><line x1={X(a) - 4} y1={Y(b) - 4} x2={X(a) + 4} y2={Y(b) + 4} /><line x1={X(a) - 4} y1={Y(b) + 4} x2={X(a) + 4} y2={Y(b) - 4} /></g>
                ))}
                {s.label && s.pts.length > 0 && <text x={X(s.pts[s.pts.length - 1][0]) + 6} y={Y(s.pts[s.pts.length - 1][1]) - 6} fontSize={12} {...T}>{s.label}</text>}
              </g>
            );
          })}
          <g {...T} fontSize={11} stroke="#fff" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
            {spaced(xt, X, (v) => lab(v).length * 6.2 + 4).map((v) => <text key={"tx" + v} x={X(v)} y={y0 + 14} textAnchor="middle">{lab(v)}</text>)}
            {spaced(yt, Y, () => 12).map((v) => <text key={"ty" + v} x={x0 - 6} y={Y(v) + 4} textAnchor="end">{lab(v)}</text>)}
            <text x={x + w + 10} y={y0 + 28} textAnchor="end" fontSize={12}>{it.xlabel}</text>
            <text x={x0 + 6} y={y - 12} textAnchor="start" fontSize={12}>{it.ylabel}</text>
          </g>
        </g>
      );
    }
  }
}

/** Room the figure needs above y = 0 (a graph's axis title sits above its plot area). */
function topRoom(fig: Fig): number {
  let top = 0;
  for (const it of fig.items) {
    if (it.t === "graph") top = Math.min(top, it.y - 26);
    if (it.t === "text") top = Math.min(top, it.y - (it.size ?? 13) - 2);
  }
  return Math.ceil(-top);
}

export default function FigView({ fig }: { fig: Fig }) {
  const pad = topRoom(fig);
  return (
    <svg className="fig specfig" viewBox={`0 ${-pad} ${fig.w} ${fig.h + pad}`} role="img" aria-label={fig.alt} style={{ maxWidth: Math.min(560, fig.w * 1.25) }}>
      <defs>
        <marker id="fig-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill={INK} /></marker>
        <marker id="fig-ahs" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill={INK} /></marker>
      </defs>
      {fig.items.map(item)}
    </svg>
  );
}
