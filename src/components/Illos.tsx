/** Kwanta's own spot illustrations: flat, rounded, chunky shapes, no outlines, with a darker
 *  shade of each color as the "shadow" side. Celeste is the hero color; yellow is for wins.
 *  All decorative (aria-hidden): the text next to them carries the meaning. */
import type { Unit } from "@/lib/scoring";

const C = {
  brand: "#2bb5ff", brandD: "#1590d8", brandL: "#bfe7ff", brandXL: "#e2f4ff",
  sun: "#ffc23d", sunD: "#e9a400", ink: "#0d1b2a", inkL: "#3a4a5e",
  white: "#ffffff", cloud: "#eef3f8", cloudD: "#d5dee9", red: "#ff5a5a", redD: "#d93f3f",
  green: "#58c23a", greenD: "#3f9a25", orange: "#ff9b3d", orangeD: "#e07812", pink: "#ff7eb0",
};

type P = { className?: string };
const svg = (vb: string, cls: string | undefined, children: React.ReactNode) => (
  <svg viewBox={vb} className={"illo " + (cls ?? "")} aria-hidden="true" focusable="false">{children}</svg>
);

/** A · Espacio, tiempo y movimiento: a rocket on its trajectory. */
export function IlloRocket({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill={C.brandXL} />
    <path d="M22 104 Q 70 96 118 30" fill="none" stroke={C.brandL} strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
    <g transform="rotate(38 104 52)">
      <path d="M92 70 L86 86 L98 78 Z" fill={C.orange} />
      <path d="M116 70 L122 86 L110 78 Z" fill={C.orangeD} />
      <path d="M104 18 C116 28 118 50 116 74 L92 74 C90 50 92 28 104 18 Z" fill={C.white} />
      <path d="M104 18 C116 28 118 50 116 74 L104 74 Z" fill={C.cloudD} />
      <path d="M104 18 C108 21 111 25 113 30 L95 30 C97 25 100 21 104 18 Z" fill={C.red} />
      <circle cx="104" cy="46" r="8" fill={C.brand} />
      <circle cx="104" cy="46" r="4" fill={C.brandXL} />
      <path d="M96 74 L112 74 L110 84 Q 104 96 98 84 Z" fill={C.sun} />
      <path d="M100 82 L108 82 Q 104 92 100 82 Z" fill={C.white} />
    </g>
    <circle cx="30" cy="30" r="3" fill={C.sun} /><circle cx="140" cy="94" r="3" fill={C.brand} /><circle cx="44" cy="58" r="2" fill={C.brandD} />
  </>);
}

/** B · Naturaleza particulada de la materia: gas particles in a box, a thermometer. */
export function IlloGas({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill="#fdecd9" />
    <rect x="34" y="30" width="72" height="70" rx="12" fill={C.white} />
    <rect x="34" y="88" width="72" height="12" rx="6" fill={C.cloudD} />
    {[[50, 46, C.orange], [76, 52, C.brand], [92, 40, C.orangeD], [58, 72, C.brandD], [86, 74, C.orange], [70, 36, C.brand]].map(([x, y, f], i) => (
      <g key={i}><circle cx={x as number} cy={y as number} r="7" fill={f as string} /><circle cx={(x as number) - 2} cy={(y as number) - 2} r="2.2" fill={C.white} opacity=".7" /></g>
    ))}
    <path d="M44 60 l-8 -4 M100 62 l8 3 M64 86 l-3 7" stroke={C.inkL} strokeWidth="3" strokeLinecap="round" opacity=".35" />
    <rect x="118" y="24" width="16" height="66" rx="8" fill={C.white} />
    <rect x="123" y="48" width="6" height="40" rx="3" fill={C.red} />
    <circle cx="126" cy="94" r="11" fill={C.red} />
    <circle cx="123" cy="91" r="3" fill={C.white} opacity=".6" />
  </>);
}

/** C · Comportamiento ondulatorio: a wave train and a wavefront. */
export function IlloWave({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill="#eee4fb" />
    <path d="M18 70 Q 31 40 44 70 T 70 70 T 96 70 T 122 70 T 148 70 L148 104 L18 104 Z" fill="#a77be6" />
    <path d="M18 80 Q 31 56 44 80 T 70 80 T 96 80 T 122 80 T 148 80 L148 104 L18 104 Z" fill="#8a4bd0" />
    <path d="M18 70 Q 31 40 44 70 T 70 70 T 96 70 T 122 70 T 148 70" fill="none" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
    <circle cx="57" cy="55" r="9" fill={C.sun} />
    <path d="M57 46 L57 30" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
    <path d="M57 30 L70 35 L57 40 Z" fill={C.red} />
    <path d="M110 36 a14 14 0 0 1 0 22 M118 30 a22 22 0 0 1 0 34" fill="none" stroke={C.brand} strokeWidth="4.5" strokeLinecap="round" />
  </>);
}

/** D · Campos: a horseshoe magnet with its field lines. */
export function IlloMagnet({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill="#fbe3ec" />
    <path d="M44 48 C 44 18 116 18 116 48" fill="none" stroke={C.pink} strokeWidth="5" strokeLinecap="round" strokeDasharray="1 10" />
    <path d="M30 56 C 26 4 134 4 130 56" fill="none" stroke={C.pink} strokeWidth="5" strokeLinecap="round" strokeDasharray="1 10" opacity=".6" />
    <path d="M56 104 L56 66 A24 24 0 0 1 104 66 L104 104 L86 104 L86 66 A6 6 0 0 0 74 66 L74 104 Z" fill="#c2366b" />
    <path d="M56 104 L56 66 A24 24 0 0 1 80 42 L80 50 A16 16 0 0 0 74 62 L74 104 Z" fill="#e0507f" />
    <rect x="56" y="88" width="18" height="16" rx="3" fill={C.white} />
    <rect x="86" y="88" width="18" height="16" rx="3" fill={C.cloudD} />
    <circle cx="30" cy="92" r="5" fill={C.brand} /><circle cx="132" cy="90" r="5" fill={C.sun} />
  </>);
}

/** E · Física nuclear y cuántica: an atom (nucleus + orbits) — Kwanta's home turf. */
export function IlloAtom({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill="#e3f2e1" />
    <g fill="none" strokeWidth="5" strokeLinecap="round">
      <ellipse cx="80" cy="60" rx="50" ry="17" stroke={C.brand} />
      <ellipse cx="80" cy="60" rx="50" ry="17" stroke={C.brandD} transform="rotate(60 80 60)" />
      <ellipse cx="80" cy="60" rx="50" ry="17" stroke={C.brand} transform="rotate(-60 80 60)" />
    </g>
    <circle cx="74" cy="56" r="9" fill={C.red} /><circle cx="86" cy="56" r="9" fill={C.sun} />
    <circle cx="80" cy="66" r="9" fill={C.redD} /><circle cx="76" cy="53" r="2.6" fill={C.white} opacity=".7" />
    <circle cx="130" cy="60" r="7" fill={C.ink} /><circle cx="55" cy="18" r="7" fill={C.ink} />
  </>);
}

export const UNIT_ILLO: Record<Unit, (p: P) => React.ReactElement> = { A: IlloRocket, B: IlloGas, C: IlloWave, D: IlloMagnet, E: IlloAtom };

/** Step 1: the diagnostic — a clipboard with ticks. */
export function IlloDiagnostic({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill={C.brandXL} />
    <rect x="46" y="18" width="68" height="90" rx="12" fill={C.brandD} />
    <rect x="50" y="22" width="60" height="80" rx="9" fill={C.white} />
    <rect x="64" y="12" width="32" height="16" rx="7" fill={C.ink} />
    {[40, 60, 80].map((y, i) => (
      <g key={y}>
        <circle cx="64" cy={y} r="7" fill={i < 2 ? C.green : C.cloud} />
        {i < 2 && <path d={`M60 ${y} l3 3 l6 -6`} fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        <rect x="76" y={y - 4} width={i === 1 ? 20 : 26} height="8" rx="4" fill={C.cloudD} />
      </g>
    ))}
    <circle cx="124" cy="92" r="14" fill={C.sun} />
    <text x="124" y="98" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="17" fill={C.ink}>5</text>
  </>);
}

/** Step 2: the plan — a calendar with unit-colored weeks. */
export function IlloPlan({ className }: P) {
  const cols = ["#0a7bbf", "#c26a12", "#8a4bd0", "#c2366b", "#3f8a3a"];
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill={C.brandXL} />
    <rect x="30" y="24" width="100" height="82" rx="14" fill={C.white} />
    <path d="M30 38 a14 14 0 0 1 14 -14 h72 a14 14 0 0 1 14 14 v8 h-100 z" fill={C.brand} />
    <rect x="50" y="16" width="8" height="18" rx="4" fill={C.ink} /><rect x="102" y="16" width="8" height="18" rx="4" fill={C.ink} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={40 + (i % 4) * 21} y={54 + Math.floor(i / 4) * 16} width="16" height="11" rx="4" fill={i < 7 ? cols[Math.floor(i / 2.5)] : C.cloud} opacity={i < 7 ? 0.9 : 1} />
    ))}
  </>);
}

/** Step 3: write by hand — a tablet with a pencil and handwriting. */
export function IlloTablet({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill={C.brandXL} />
    <rect x="28" y="20" width="96" height="84" rx="12" fill={C.ink} />
    <rect x="34" y="26" width="84" height="72" rx="7" fill={C.white} />
    <path d="M42 46 q6 -8 10 0 t10 0 M70 46 h16 M42 62 q5 -7 9 0 t9 0 t9 0" fill="none" stroke="#1d3fbf" strokeWidth="3" strokeLinecap="round" />
    <path d="M96 60 l5 5 l10 -12" fill="none" stroke={C.red} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44 82 h44" stroke={C.cloudD} strokeWidth="3" strokeLinecap="round" strokeDasharray="3 5" />
    <g transform="rotate(35 124 60)">
      <rect x="118" y="20" width="12" height="70" rx="6" fill={C.white} />
      <rect x="124" y="20" width="6" height="70" rx="3" fill={C.cloudD} />
      <path d="M118 90 L130 90 L124 104 Z" fill={C.inkL} />
      <rect x="118" y="20" width="12" height="10" rx="5" fill={C.brand} />
    </g>
  </>);
}

/** Step 4: the mock exam — a stopwatch. */
export function IlloTimer({ className }: P) {
  return svg("0 0 160 120", className, <>
    <circle cx="80" cy="60" r="54" fill={C.brandXL} />
    <rect x="72" y="8" width="16" height="12" rx="4" fill={C.ink} />
    <rect x="110" y="24" width="10" height="16" rx="4" fill={C.inkL} transform="rotate(45 115 32)" />
    <circle cx="80" cy="66" r="42" fill={C.brandD} />
    <circle cx="80" cy="62" r="40" fill={C.brand} />
    <circle cx="80" cy="62" r="31" fill={C.white} />
    <path d="M80 62 L80 31 A31 31 0 0 1 107 47 Z" fill={C.sun} />
    <path d="M80 62 L80 40" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
    <path d="M80 62 L96 70" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
    <circle cx="80" cy="62" r="5" fill={C.ink} />
  </>);
}

/** Closing band: an electron jumping up the energy levels to n = 7. */
export function IlloJump({ className }: P) {
  return svg("0 0 200 140", className, <>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={20 + i * 4} y={124 - i * 17} width={160 - i * 4} height="6" rx="3" fill={C.white} opacity={0.35 + i * 0.09} />
    ))}
    <rect x="44" y="20" width="136" height="8" rx="4" fill={C.sun} />
    <path d="M58 112 Q 100 64 150 26" fill="none" stroke={C.ink} strokeWidth="3" strokeDasharray="4 7" strokeLinecap="round" opacity=".6" />
    <circle cx="58" cy="112" r="8" fill={C.white} opacity=".6" />
    <circle cx="158" cy="18" r="13" fill={C.white} />
    <circle cx="158" cy="18" r="8" fill={C.brand} />
  </>);
}
