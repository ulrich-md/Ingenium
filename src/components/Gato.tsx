/** Psi, Kwanta's mascot: a cat that lives in a box, after Schrödinger's thought experiment.
 *
 *  Drawing rules (the same ones Duolingo's illustrators follow for their own style):
 *   - only three base forms, all rounded: circles, rounded rectangles, rounded triangles. No points;
 *   - as few shapes as possible, so the silhouette reads as one blob even at 32 px;
 *   - one light source, top left: every part gets a lighter top-left and a darker bottom-right
 *     shape clipped to its own outline (no outlines, no doubled strokes);
 *   - geometric eyes: circles, never ovals.
 *  What makes Psi ours: one celeste eye and one amber eye (its "two states"), a single wave stripe on
 *  the forehead and cheeks, white socks, a celeste collar with a yellow Ψ tag, and its cardboard box
 *  with a wavy corrugated edge and a Ψ stamp. In "superposición" half of Psi is a celeste ghost.
 *  Every SVG takes a `uid` so its clip paths never collide with another one on the page.
 *  Animation: with `animated`, the parts move on their own (src/components/psi.css): eyes blink,
 *  tail swishes, paw waves, flames flicker... Hooks are classes on the parts (g-head, g-body, g-eyes,
 *  g-iris, g-wave, g-tail, g-peek, g-jump, g-flame, g-hand, g-tear, g-ghost, g-z, g-star) and each
 *  moving part carries its own pivot as an inline transform-origin. `.g-iris` can be moved by script
 *  so the eyes follow the pointer (see usePsiEyes in the landing). */

export type GatoPose =
  | "hola" | "sube" | "ups" | "superposicion" | "escribe" | "duerme"
  | "senala" | "racha" | "siete" | "lee" | "cronometro" | "triste" | "insiste" | "ipad" | "cara";
export type Mood =
  | "hola" | "feliz" | "ups" | "duda" | "concentrado" | "dormido"
  | "sorprendido" | "triste" | "enojado" | "guino" | "enamorado" | "orgulloso";

export const K = {
  fur: "#3d5a7c", furD: "#2b4565", furL: "#56769c",
  cream: "#f6f9fc", creamD: "#dbe4ee",
  pink: "#ffa3c6", bean: "#ff7eb0", mouth: "#5a1a2e",
  ink: "#0d1b2a", white: "#ffffff",
  eyeA: "#2bb5ff", eyeAD: "#0b7fc4", eyeB: "#ffc23d", eyeBD: "#d18f00",
  wave: "#8fd9ff",
  brand: "#2bb5ff", brandD: "#1590d8", brandL: "#bfe7ff", brandXL: "#e2f4ff",
  sun: "#ffc23d", sunD: "#e9a400", red: "#d62828", pen: "#1d3fbf",
  box: "#efb76a", boxD: "#d9954b", boxDD: "#b06d30", boxL: "#f8d196", tape: "#f7e5c0",
  ground: "#d5dee9", flame: "#ff9b3d", flameD: "#f2711c",
};

type Pt = [number, number];

/** A sine wave of `n` half-periods starting at (x, y), `w` wide. */
const wave = (x: number, y: number, w: number, amp: number, n: number) => {
  const h = w / n;
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` q${h / 2} ${i % 2 ? amp : -amp} ${h} 0`;
  return d;
};

const star = (x: number, y: number, r: number, fill: string = K.sun) => (
  <path key={`${x}-${y}`} className="g-star" d={`M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z`} fill={fill} />
);

/** Fill a path and round its corners with a same-color stroke (rounded triangles, rounded boxes). */
const Soft = ({ d, fill, r = 6, opacity }: { d: string; fill: string; r?: number; opacity?: number }) => (
  <path d={d} fill={fill} stroke={fill} strokeWidth={r} strokeLinejoin="round" opacity={opacity} />
);

/** Light from the top left: a highlight and a shadow clipped to the shape itself. */
function Shade({ id, d, box, hi = 0.45, lo = 0.55 }: { id: string; d: string; box: [number, number, number, number]; hi?: number; lo?: number }) {
  const [x, y, w, h] = box;
  return (
    <>
      <clipPath id={id}><path d={d} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <ellipse cx={x + w * 0.92} cy={y + h * 0.95} rx={w * 0.62} ry={h * 0.5} fill={K.furD} opacity={lo} />
        <ellipse cx={x + w * 0.28} cy={y + h * 0.16} rx={w * 0.3} ry={h * 0.16} fill={K.furL} opacity={hi} />
      </g>
    </>
  );
}

/* ---------------- eyes ---------------- */

function Eye({ uid, side, x, y, look = [0, 0], lid = 0, small }: { uid: string; side: "L" | "R"; x: number; y: number; look?: Pt; lid?: number; small?: boolean }) {
  const [iris, irisD] = side === "L" ? [K.eyeA, K.eyeAD] : [K.eyeB, K.eyeBD];
  const [dx, dy] = look;
  const id = `${uid}-eye${side}`;
  const r = 12.5;
  const lidY = y - r + 2 * r * lid;
  return (
    <g>
      <clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath>
      <circle cx={x} cy={y} r={r} fill={K.white} />
      <g clipPath={`url(#${id})`}>
        <g className="g-iris" transform={small ? `translate(${x + dx} ${y + dy}) scale(0.72) translate(${-(x + dx)} ${-(y + dy)})` : undefined}>
          <circle cx={x + dx} cy={y + dy} r={9.8} fill={irisD} />
          <circle cx={x + dx - 0.6} cy={y + dy - 0.6} r={8.6} fill={iris} />
          <circle cx={x + dx} cy={y + dy} r={5.2} fill={K.ink} />
          <circle cx={x + dx + 3.8} cy={y + dy - 4} r={3.3} fill={K.white} />
          <circle cx={x + dx - 3.6} cy={y + dy + 3.8} r={1.5} fill={K.white} />
        </g>
        {lid > 0 && <rect x={x - r} y={y - r - 2} width={2 * r} height={lidY - (y - r) + 2} fill={K.fur} />}
      </g>
    </g>
  );
}

function Eyes({ uid, cx, cy, mood }: { uid: string; cx: number; cy: number; mood: Mood }) {
  const L = cx - 19, R = cx + 19, y = cy - 3;
  const arc = (x: number, kind: "up" | "down" | "flat") => (
    <path key={x} d={kind === "up" ? `M${x - 9} ${y + 4} Q${x} ${y - 9} ${x + 9} ${y + 4}` : kind === "flat" ? `M${x - 9} ${y + 2} Q${x} ${y - 5} ${x + 9} ${y + 2}` : `M${x - 9} ${y + 1} Q${x} ${y + 8} ${x + 9} ${y + 1}`}
      fill="none" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
  );
  if (mood === "feliz") return <g className="g-eyes">{arc(L, "up")}{arc(R, "up")}</g>;
  if (mood === "dormido") return <g className="g-eyes">{arc(L, "down")}{arc(R, "down")}</g>;
  if (mood === "orgulloso") return <g className="g-eyes">{arc(L, "flat")}{arc(R, "flat")}</g>;
  if (mood === "enamorado") {
    const heart = (x: number) => (
      <g key={x}>
        <path d={`M${x} ${y + 9} C${x - 15} ${y - 1} ${x - 8} ${y - 13} ${x} ${y - 5} C${x + 8} ${y - 13} ${x + 15} ${y - 1} ${x} ${y + 9} Z`} fill={K.bean} stroke={K.bean} strokeWidth={2} strokeLinejoin="round" />
        <circle cx={x - 5} cy={y - 4} r={2.2} fill={K.white} opacity={0.8} />
      </g>
    );
    return <g className="g-eyes">{heart(L)}{heart(R)}</g>;
  }
  const conf: Record<"hola" | "ups" | "duda" | "concentrado" | "sorprendido" | "triste" | "enojado" | "guino", { l: Pt; r: Pt; ll: number; rl: number }> = {
    hola: { l: [1, 0.6], r: [1, 0.6], ll: 0, rl: 0 },
    ups: { l: [2.6, -2.6], r: [2.6, -2.6], ll: 0, rl: 0 },
    duda: { l: [1.4, -2.8], r: [1.4, -1.6], ll: 0, rl: 0.42 },
    concentrado: { l: [1.2, 3.2], r: [1.2, 3.2], ll: 0.3, rl: 0.3 },
    sorprendido: { l: [0, 0], r: [0, 0], ll: 0, rl: 0 },
    triste: { l: [-0.6, 3], r: [-0.6, 3], ll: 0.18, rl: 0.18 },
    enojado: { l: [0.6, 1.4], r: [-0.6, 1.4], ll: 0.36, rl: 0.36 },
    guino: { l: [1, 0.6], r: [1, 0.6], ll: 0, rl: 0 },
  };
  const c = conf[mood];
  const brow = (x: number, dir: 1 | -1) => <path d={`M${x - dir * 8} ${y - 17} Q${x} ${y - 23} ${x + dir * 8} ${y - 22}`} fill="none" stroke={K.cream} strokeWidth={3} strokeLinecap="round" />;
  const angry = (x: number, dir: 1 | -1) => <path d={`M${x - dir * 10} ${y - 21} L${x + dir * 8} ${y - 14}`} fill="none" stroke={K.cream} strokeWidth={3.4} strokeLinecap="round" />;
  const high = (x: number) => <path d={`M${x - 9} ${y - 20} Q${x} ${y - 27} ${x + 9} ${y - 20}`} fill="none" stroke={K.cream} strokeWidth={3} strokeLinecap="round" />;
  return (
    <g className="g-eyes">
      <Eye uid={uid} side="L" x={L} y={y} look={c.l} lid={c.ll} small={mood === "sorprendido"} />
      {mood === "guino" ? arc(R, "up") : <Eye uid={uid} side="R" x={R} y={y} look={c.r} lid={c.rl} small={mood === "sorprendido"} />}
      {(mood === "ups" || mood === "triste") && <>{brow(L, 1)}{brow(R, -1)}</>}
      {mood === "enojado" && <>{angry(L, 1)}{angry(R, -1)}</>}
      {mood === "sorprendido" && <>{high(L)}{high(R)}</>}
      {mood === "duda" && <path d={`M${L - 9} ${y - 19} Q${L} ${y - 26} ${L + 9} ${y - 20}`} fill="none" stroke={K.cream} strokeWidth={3} strokeLinecap="round" />}
      {mood === "triste" && <path className="g-tear" style={{ transformOrigin: `${L - 6}px ${y + 12}px` }} d={`M${L - 6} ${y + 12} q-5 8 0 11 q5 -3 0 -11z`} fill={K.brandL} />}
    </g>
  );
}

/* ---------------- head ---------------- */

const headPath = (cx: number, cy: number) =>
  `M${cx - 50} ${cy} C${cx - 50} ${cy - 30} ${cx - 30} ${cy - 42} ${cx} ${cy - 42} C${cx + 30} ${cy - 42} ${cx + 50} ${cy - 30} ${cx + 50} ${cy}
   C${cx + 52} ${cy + 26} ${cx + 30} ${cy + 40} ${cx} ${cy + 40} C${cx - 30} ${cy + 40} ${cx - 52} ${cy + 26} ${cx - 50} ${cy} Z`;

function Ear({ cx, cy, side, down }: { cx: number; cy: number; side: 1 | -1; down?: boolean }) {
  const s = side;
  const P = (dx: number, dy: number) => `${cx + s * dx} ${cy + dy}`;
  return (
    <g transform={down ? `rotate(${s * 34} ${cx + s * 30} ${cy - 24})` : undefined}>
      <Soft d={`M${P(47, -10)} L${P(41, -62)} L${P(7, -33)} Z`} fill={s < 0 ? K.fur : K.furD} r={9} />
      <Soft d={`M${P(39, -22)} L${P(37, -50)} L${P(18, -34)} Z`} fill={K.pink} r={5} />
    </g>
  );
}

function Mouth({ cx, cy, mood }: { cx: number; cy: number; mood: Mood }) {
  const y = cy + 16;
  const w = <path d={`M${cx - 8} ${y + 2} Q${cx - 4} ${y + 6} ${cx} ${y + 1.5} Q${cx + 4} ${y + 6} ${cx + 8} ${y + 2}`} fill="none" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />;
  switch (mood) {
    case "feliz":
      return (
        <g>
          <path d={`M${cx - 11} ${y + 1} Q${cx} ${y + 22} ${cx + 11} ${y + 1} Z`} fill={K.mouth} stroke={K.mouth} strokeWidth={2} strokeLinejoin="round" />
          <ellipse cx={cx} cy={y + 11} rx={5.6} ry={3.6} fill={K.bean} />
        </g>
      );
    case "ups":
      return <path d={`M${cx - 7} ${y + 5} q3.5 -4 7 0 t7 0`} fill="none" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />;
    case "duda":
      return <path d={`M${cx - 4} ${y + 4} Q${cx + 4} ${y + 1} ${cx + 10} ${y + 5}`} fill="none" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />;
    case "concentrado":
    case "guino":
      return <g>{w}<path d={`M${cx + 4} ${y + 4} q4 7 9 2 q-2 -5 -9 -2z`} fill={K.bean} /></g>;
    case "enamorado":
      return (
        <g>
          <path d={`M${cx - 9} ${y + 1} Q${cx} ${y + 18} ${cx + 9} ${y + 1} Z`} fill={K.mouth} stroke={K.mouth} strokeWidth={2} strokeLinejoin="round" />
          <ellipse cx={cx} cy={y + 9} rx={4.6} ry={3} fill={K.bean} />
        </g>
      );
    case "sorprendido":
      return <ellipse cx={cx} cy={y + 8} rx={5.5} ry={7} fill={K.mouth} />;
    case "triste":
      return <path d={`M${cx - 8} ${y + 8} Q${cx} ${y + 1} ${cx + 8} ${y + 8}`} fill="none" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />;
    case "enojado":
      return <path d={`M${cx - 8} ${y + 6} Q${cx} ${y + 3} ${cx + 8} ${y + 6}`} fill="none" stroke={K.ink} strokeWidth={2.8} strokeLinecap="round" />;
    case "orgulloso":
      return <path d={`M${cx - 9} ${y + 2} Q${cx + 1} ${y + 10} ${cx + 10} ${y}`} fill="none" stroke={K.ink} strokeWidth={2.8} strokeLinecap="round" />;
    case "dormido":
      return <path d={`M${cx - 4} ${y + 3} Q${cx} ${y + 6} ${cx + 4} ${y + 3}`} fill="none" stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" />;
    default:
      return w;
  }
}

export function Head({ uid, cx, cy, mood, earsDown, collar = true }: { uid: string; cx: number; cy: number; mood: Mood; earsDown?: boolean; collar?: boolean }) {
  const d = headPath(cx, cy);
  const blush = !["ups", "duda", "enojado", "triste"].includes(mood);
  return (
    <g className="g-head" style={{ transformOrigin: `${cx}px ${cy + 40}px` }}>
      <Ear cx={cx} cy={cy} side={-1} down={earsDown} />
      <Ear cx={cx} cy={cy} side={1} down={earsDown} />
      {collar && <path d={`M${cx - 30} ${cy + 33} Q${cx} ${cy + 49} ${cx + 30} ${cy + 33}`} fill="none" stroke={K.brand} strokeWidth={7} strokeLinecap="round" />}
      <path d={d} fill={K.fur} />
      <Shade id={`${uid}-head`} d={d} box={[cx - 50, cy - 42, 100, 82]} />
      {/* one wave on the forehead and one on each cheek: Psi's markings */}
      <g fill="none" stroke={K.wave} strokeLinecap="round" strokeWidth={4}>
        <path d={wave(cx - 13, cy - 29, 26, 3.4, 3)} />
        <path d={wave(cx - 49, cy + 4, 13, 2.6, 2)} opacity={0.85} />
        <path d={wave(cx + 36, cy + 4, 13, 2.6, 2)} opacity={0.85} />
      </g>
      {/* muzzle: two circles and a chin, all cream */}
      <circle cx={cx - 9.5} cy={cy + 17} r={11.5} fill={K.cream} />
      <circle cx={cx + 9.5} cy={cy + 17} r={11.5} fill={K.cream} />
      <circle cx={cx} cy={cy + 24} r={9.5} fill={K.cream} />
      {blush && <><circle cx={cx - 33} cy={cy + 14} r={6.5} fill={K.pink} opacity={0.55} /><circle cx={cx + 33} cy={cy + 14} r={6.5} fill={K.pink} opacity={0.55} /></>}
      <Eyes uid={uid} cx={cx} cy={cy} mood={mood} />
      <rect x={cx - 5.5} y={cy + 7} width={11} height={7.5} rx={3.75} fill={K.bean} />
      <Mouth cx={cx} cy={cy} mood={mood} />
      <g fill="none" stroke={K.cream} strokeWidth={1.8} strokeLinecap="round" opacity={0.8}>
        <path d={`M${cx - 22} ${cy + 15} Q${cx - 38} ${cy + 10} ${cx - 56} ${cy + 12}`} />
        <path d={`M${cx - 22} ${cy + 20} Q${cx - 38} ${cy + 20} ${cx - 54} ${cy + 25}`} />
        <path d={`M${cx + 22} ${cy + 15} Q${cx + 38} ${cy + 10} ${cx + 56} ${cy + 12}`} />
        <path d={`M${cx + 22} ${cy + 20} Q${cx + 38} ${cy + 20} ${cx + 54} ${cy + 25}`} />
      </g>
      {collar && (
        <g>
          <circle cx={cx} cy={cy + 47} r={8.5} fill={K.sunD} />
          <circle cx={cx - 0.7} cy={cy + 46.3} r={7.6} fill={K.sun} />
          <text x={cx - 0.7} y={cy + 50.4} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={11} fontWeight={700} fill={K.ink}>Ψ</text>
        </g>
      )}
    </g>
  );
}

/* ---------------- body ---------------- */

const bodyPath = (cx: number, top: number) =>
  `M${cx - 30} ${top} C${cx - 42} ${top + 30} ${cx - 46} ${top + 72} ${cx - 20} ${top + 80} L${cx + 20} ${top + 80} C${cx + 46} ${top + 72} ${cx + 42} ${top + 30} ${cx + 30} ${top} Z`;

function Body({ uid, cx, top }: { uid: string; cx: number; top: number }) {
  const d = bodyPath(cx, top);
  return (
    <g className="g-body" style={{ transformOrigin: `${cx}px ${top + 80}px` }}>
      <path d={d} fill={K.fur} stroke={K.fur} strokeWidth={6} strokeLinejoin="round" />
      <Shade id={`${uid}-body`} d={d} box={[cx - 44, top, 88, 80]} hi={0.3} />
      <ellipse cx={cx} cy={top + 36} rx={17} ry={26} fill={K.cream} />
      <g fill="none" stroke={K.wave} strokeWidth={3.6} strokeLinecap="round" opacity={0.8}>
        <path d={wave(cx - 40, top + 40, 13, 2.6, 2)} /><path d={wave(cx + 27, top + 40, 13, 2.6, 2)} />
      </g>
    </g>
  );
}

/** A capsule arm ending in a white sock. With `beans`, the paw shows its pink pads. */
function Arm({ from, to, beans, cls }: { from: Pt; to: Pt; beans?: boolean; cls?: string }) {
  const [px, py] = to;
  return (
    <g className={cls} style={cls ? { transformOrigin: `${from[0]}px ${from[1]}px` } : undefined}>
      <path d={`M${from[0]} ${from[1]} L${px} ${py}`} stroke={K.fur} strokeWidth={15} strokeLinecap="round" />
      <circle cx={px} cy={py} r={11} fill={K.cream} />
      {beans && (
        <g fill={K.bean}>
          <ellipse cx={px} cy={py + 2.6} rx={4.6} ry={3.6} />
          <circle cx={px - 5.4} cy={py - 3.6} r={2.2} /><circle cx={px} cy={py - 6} r={2.2} /><circle cx={px + 5.4} cy={py - 3.6} r={2.2} />
        </g>
      )}
    </g>
  );
}

/** A paw resting on an edge: only the white sock shows. */
const RestPaw = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x - 12} y={y - 8} width={24} height={16} rx={8} fill={K.cream} />
    <path d={`M${x - 4} ${y - 1} v5 M${x + 4} ${y - 1} v5`} stroke={K.creamD} strokeWidth={1.8} strokeLinecap="round" />
  </g>
);

/** Tail: one capsule stroke; two celeste rings and the cream tip are dashes on the same path. */
function Tail({ d }: { d: string }) {
  const [, x, y] = d.match(/M\s*([\d.]+)[\s,]+([\d.]+)/) ?? [];
  return (
    <g className="g-tail" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={d} fill="none" stroke={K.fur} strokeWidth={13} strokeLinecap="round" />
      <path d={d} pathLength={100} fill="none" stroke={K.wave} strokeWidth={13} strokeDasharray="0 42 6 10 6 36" opacity={0.75} />
      <path d={d} pathLength={100} fill="none" stroke={K.cream} strokeWidth={13} strokeLinecap="round" strokeDasharray="0 86 14" />
    </g>
  );
}

/* ---------------- the box ---------------- */

function BoxBack() {
  return (
    <g>
      <Soft d="M52 150 L72 137 L210 137 L190 150 Z" fill={K.boxDD} r={4} />
      <Soft d="M72 137 L82 108 L206 108 L210 137 Z" fill={K.boxD} r={5} />
      <Soft d="M52 150 L72 137 L48 116 L28 131 Z" fill={K.boxL} r={5} />
    </g>
  );
}

function BoxFront() {
  return (
    <g>
      <Soft d="M190 150 L210 137 L210 207 L190 220 Z" fill={K.boxD} r={5} />
      <Soft d="M190 150 L210 137 L231 152 L212 166 Z" fill={K.boxL} r={5} />
      <rect x={50} y={148} width={142} height={74} rx={6} fill={K.box} />
      <rect x={50} y={210} width={142} height={12} rx={6} fill={K.boxD} opacity={0.4} />
      <path d={wave(56, 154, 130, 1.6, 26)} fill="none" stroke={K.boxD} strokeWidth={1.8} strokeLinecap="round" />
      <rect x={113} y={148} width={16} height={36} rx={2} fill={K.tape} />
      <g transform="rotate(-10 158 188)" opacity={0.8}>
        <circle cx={158} cy={188} r={16} fill="none" stroke={K.boxDD} strokeWidth={2.6} />
        <text x={158} y={194.5} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={18} fontWeight={700} fill={K.boxDD}>Ψ</text>
      </g>
    </g>
  );
}

const Ground = ({ cx = 130, w = 96 }: { cx?: number; w?: number }) => <ellipse cx={cx} cy={226} rx={w} ry={7} fill={K.ground} />;

const Sweat = ({ x, y }: { x: number; y: number }) => (
  <g><path d={`M${x} ${y} q-7 10 0 14 q7 -4 0 -14z`} fill={K.brandL} /><circle cx={x - 1.8} cy={y + 8} r={1.5} fill={K.white} /></g>
);

/* ---------------- poses ---------------- */

const LABEL: Record<GatoPose, string> = {
  hola: "Psi, el gato de Kwanta, saluda desde su caja",
  sube: "Psi salta de la caja, feliz: subiste de nivel",
  ups: "Psi, preocupado, junto a una marca roja de corrección",
  superposicion: "Psi en superposición: mitad gato, mitad fantasma celeste",
  escribe: "Psi resuelve una hoja de examen con su lápiz",
  duerme: "Psi duerme en su caja",
  senala: "Psi guiña un ojo y señala hacia un lado",
  racha: "Psi sostiene una llama con el número de días de tu racha",
  siete: "Psi con birrete y una medalla con un 7",
  lee: "Psi lee el cuadernillo de fórmulas",
  cronometro: "Psi, sorprendido, mira un cronómetro",
  triste: "Psi, triste, en su caja",
  insiste: "Psi, serio, te recuerda tu hoja de hoy",
  ipad: "Psi escribe en un iPad con el Apple Pencil",
  cara: "Psi, el gato de Kwanta",
};

export type GatoProps = {
  pose?: GatoPose;
  /** Only for pose "cara": the expression. */
  mood?: Mood;
  /** Let the parts move on their own (needs src/components/psi.css). */
  animated?: boolean;
  uid?: string;
  className?: string;
  title?: string;
};

export default function Gato({ pose = "hola", mood, animated, uid, className, title }: GatoProps) {
  const id = uid ?? `psi-${pose}${mood ? `-${mood}` : ""}`;
  const cls = ["psi", `psi--${pose}`, animated ? "psi-anim" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <svg viewBox={pose === "cara" ? "50 46 140 140" : "0 0 240 240"} className={cls} role="img" aria-label={title ?? LABEL[pose]} xmlns="http://www.w3.org/2000/svg">
      {POSES[pose](id, mood)}
    </svg>
  );
}

/** Psi sitting outside the box: body, feet, tail and head. Arms and props go in `front`/`back`. */
function Sitting({ uid, cx = 112, mood, earsDown, tail, back, front, collar = true }: {
  uid: string; cx?: number; mood: Mood; earsDown?: boolean; tail: string; back?: React.ReactNode; front?: React.ReactNode; collar?: boolean;
}) {
  const top = 138;
  return (
    <>
      <Ground cx={cx + 8} w={84} />
      <Tail d={tail} />
      {back}
      <Body uid={uid} cx={cx} top={top} />
      <RestPaw x={cx - 16} y={top + 80} />
      <RestPaw x={cx + 16} y={top + 80} />
      <Head uid={uid} cx={cx} cy={top - 32} mood={mood} earsDown={earsDown} collar={collar} />
      {front}
    </>
  );
}

/** Rounded flame, base at (x, y + 24). */
const flamePath = (x: number, y: number, s = 1) =>
  `M${x} ${y - 34 * s} C${x + 8 * s} ${y - 20 * s} ${x + 26 * s} ${y - 10 * s} ${x + 24 * s} ${y + 8 * s} C${x + 22 * s} ${y + 26 * s} ${x - 22 * s} ${y + 26 * s} ${x - 24 * s} ${y + 8 * s}
   C${x - 26 * s} ${y - 6 * s} ${x - 12 * s} ${y - 14 * s} ${x - 7 * s} ${y - 26 * s} C${x - 3 * s} ${y - 17 * s} ${x - 1 * s} ${y - 14 * s} ${x} ${y - 34 * s} Z`;

const POSES: Record<GatoPose, (uid: string, mood?: Mood) => React.ReactNode> = {
  hola: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <g className="g-peek"><Head uid={uid} cx={122} cy={106} mood="hola" /></g>
      <BoxFront />
      <RestPaw x={92} y={150} />
      <Arm cls="g-wave" from={[154, 150]} to={[186, 88]} beans />
      <g fill="none" stroke={K.brandL} strokeWidth={3.6} strokeLinecap="round">
        <path d="M201 68 q8 8 5 18" /><path d="M209 58 q12 12 8 28" />
      </g>
      <Tail d="M208 192 C 236 182, 236 140, 220 126" />
    </>
  ),

  sube: (uid) => (
    <>
      <circle cx={120} cy={98} r={80} fill={K.brandXL} />
      <circle cx={120} cy={98} r={58} fill={K.brandL} opacity={0.4} />
      <Ground />
      <BoxBack />
      <g className="g-jump" style={{ transformOrigin: "120px 180px" }}>
        <Tail d="M146 170 C 190 172, 206 128, 184 110" />
        <Arm from={[96, 116]} to={[60, 60]} beans />
        <Arm from={[144, 116]} to={[180, 60]} beans />
        <Body uid={uid} cx={120} top={100} />
        <Head uid={uid} cx={120} cy={68} mood="feliz" />
      </g>
      <BoxFront />
      {star(26, 42, 11)}{star(214, 34, 8)}{star(216, 106, 6, K.brand)}{star(30, 112, 6, K.brand)}{star(194, 12, 4.5)}
    </>
  ),

  ups: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={122} cy={118} mood="ups" earsDown />
      <BoxFront />
      <RestPaw x={94} y={150} />
      <RestPaw x={150} y={150} />
      <Sweat x={176} y={72} />
      <g fill="none" stroke={K.red} strokeWidth={5} strokeLinecap="round" transform="rotate(-8 204 80)">
        <path d="M192 66 L214 94" /><path d="M215 66 L192 95" />
      </g>
    </>
  ),

  superposicion: (uid) => {
    const cx = 122, cy = 106;
    const trail: [number, number, number][] = [[184, 66, 4.5], [196, 88, 3.6], [192, 114, 3], [206, 72, 2.6], [208, 102, 2.2], [218, 86, 1.8]];
    // the other state: the same silhouette as a celeste ghost, keeping only its amber eye
    const ghost = (
      <g>
        <Soft d={`M${cx + 47} ${cy - 10} L${cx + 41} ${cy - 62} L${cx + 7} ${cy - 33} Z`} fill={K.brandL} r={9} />
        <path d={headPath(cx, cy)} fill={K.brandL} />
        <path d={wave(cx + 4, cy - 29, 13, 3.4, 2)} fill="none" stroke={K.white} strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx + 19} cy={cy - 3} r={12.5} fill={K.white} opacity={0.75} />
        <circle cx={cx + 20.4} cy={cy - 4.6} r={8.6} fill={K.eyeB} opacity={0.8} />
        <circle cx={cx + 21} cy={cy - 4} r={5.2} fill={K.ink} opacity={0.7} />
        <rect x={cx - 5.5} y={cy + 7} width={11} height={7.5} rx={3.75} fill={K.white} opacity={0.6} />
      </g>
    );
    return (
      <>
        <Ground />
        <BoxBack />
        <clipPath id={`${uid}-left`}><rect x={0} y={0} width={cx} height={240} /></clipPath>
        <clipPath id={`${uid}-right`}><rect x={cx} y={0} width={240 - cx} height={240} /></clipPath>
        <g className="g-ghost" clipPath={`url(#${uid}-right)`}>{ghost}</g>
        <g clipPath={`url(#${uid}-left)`}><Head uid={`${uid}-c`} cx={cx} cy={cy} mood="duda" /></g>
        <g className="g-ghost">{trail.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={K.brand} opacity={0.55} />)}</g>
        <BoxFront />
        <RestPaw x={94} y={150} />
        <text x={36} y={72} fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900} fontSize={28} fill={K.brand}>?</text>
      </>
    );
  },

  escribe: (uid) => (
    <>
      <Ground cx={124} w={92} />
      <Tail d="M148 196 C 194 200, 212 160, 194 144" />
      <Body uid={uid} cx={112} top={112} />
      <Head uid={uid} cx={112} cy={80} mood="concentrado" />
      <g transform="rotate(-5 128 194)">
        <rect x={48} y={162} width={160} height={60} rx={5} fill={K.creamD} />
        <rect x={46} y={160} width={160} height={60} rx={5} fill={K.white} />
        <rect x={58} y={170} width={136} height={42} rx={2} fill="none" stroke="#8a93a3" strokeWidth={1.4} />
        <path d="M64 184 H188 M64 199 H188" stroke="#c3c9d4" strokeWidth={1.4} strokeDasharray="2 3.4" strokeLinecap="round" />
        <path d={`${wave(68, 181, 24, 3, 4)} M98 181 h10 M114 181 l6 -7 m-6 0 l6 7`} fill="none" stroke={K.pen} strokeWidth={2.2} strokeLinecap="round" />
        <path d={wave(68, 196, 30, 3, 5)} fill="none" stroke={K.pen} strokeWidth={2.2} strokeLinecap="round" />
        <text x={158} y={211} fontFamily="Caveat, 'Bradley Hand', cursive" fontWeight={700} fontSize={17} fill={K.red}>M1 ✓</text>
      </g>
      <RestPaw x={80} y={176} />
      <path d="M132 196 L160 150" stroke={K.creamD} strokeWidth={9} strokeLinecap="round" />
      <path d="M132 196 L160 150" stroke={K.white} strokeWidth={6.4} strokeLinecap="round" />
      <path d="M152 163 L160 150" stroke={K.brand} strokeWidth={6.4} strokeLinecap="round" />
      <circle cx={130.6} cy={198.6} r={2.4} fill={K.ink} />
      <Arm from={[134, 146]} to={[146, 172]} />
    </>
  ),

  duerme: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={122} cy={142} mood="dormido" collar={false} />
      <BoxFront />
      <RestPaw x={98} y={150} />
      <Tail d="M154 150 C 176 156, 184 176, 172 192" />
      <g className="g-z" fill={K.brand} fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900}>
        <text x={164} y={104} fontSize={16}>z</text>
        <text x={180} y={86} fontSize={22}>z</text>
        <text x={200} y={64} fontSize={28}>Z</text>
      </g>
    </>
  ),

  senala: (uid) => (
    <Sitting uid={uid} mood="guino" tail="M90 214 C 52 214, 40 172, 58 156"
      back={<Arm from={[92, 152]} to={[84, 196]} />}
      front={<>
        <Arm cls="g-point" from={[132, 154]} to={[196, 132]} />
        <g fill="none" stroke={K.brandL} strokeWidth={3.6} strokeLinecap="round"><path d="M214 118 l10 -6" /><path d="M216 134 h12" /><path d="M214 150 l10 6" /></g>
      </>} />
  ),

  racha: (uid) => (
    <Sitting uid={uid} mood="feliz" tail="M134 214 C 176 214, 190 172, 170 156"
      back={<><Arm from={[94, 152]} to={[86, 186]} /><Arm from={[130, 152]} to={[138, 186]} /></>}
      front={<>
        <g className="g-flame" style={{ transformOrigin: "112px 200px" }}>
          <path d={flamePath(112, 176)} fill={K.flameD} stroke={K.flameD} strokeWidth={4} strokeLinejoin="round" />
          <path d={flamePath(110, 174)} fill={K.sun} />
          <path d={flamePath(110, 184, 0.55)} fill={K.flame} opacity={0.75} />
          <text x={110} y={194} textAnchor="middle" fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900} fontSize={26} fill={K.white}>7</text>
        </g>
        <circle cx={86} cy={186} r={11} fill={K.cream} /><circle cx={138} cy={186} r={11} fill={K.cream} />
        {star(40, 70, 8)}{star(190, 60, 6, K.flame)}
      </>} />
  ),

  siete: (uid) => (
    <Sitting uid={uid} mood="orgulloso" tail="M134 214 C 176 214, 190 172, 170 156"
      back={<><Arm from={[92, 150]} to={[56, 100]} beans /><Arm from={[132, 150]} to={[168, 100]} beans /></>}
      front={<>
        {/* the mortarboard */}
        <rect x={86} y={58} width={52} height={18} rx={6} fill="#1c2a3a" />
        <Soft d="M68 62 L112 46 L156 62 L112 78 Z" fill={K.ink} r={5} />
        <path d="M112 62 L150 68 L152 92" fill="none" stroke={K.sun} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={147} y={90} width={10} height={14} rx={4} fill={K.sun} />
        {/* the medal: a 7 on a celeste ribbon */}
        <path d="M92 142 L112 166 L132 142" fill="none" stroke={K.brand} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={112} cy={174} r={19} fill={K.sunD} />
        <circle cx={111} cy={173} r={17} fill={K.sun} />
        <text x={111} y={182} textAnchor="middle" fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900} fontSize={24} fill={K.ink}>7</text>
        {star(36, 62, 9)}{star(196, 54, 7)}{star(200, 128, 5, K.brand)}{star(28, 128, 5, K.brand)}
      </>} />
  ),

  lee: (uid) => (
    <Sitting uid={uid} mood="concentrado" tail="M134 214 C 176 214, 190 172, 170 156"
      back={<><Arm from={[94, 152]} to={[68, 170]} /><Arm from={[130, 152]} to={[156, 170]} /></>}
      front={<>
        <g transform="rotate(-4 112 190)">
          <rect x={58} y={160} width={108} height={60} rx={7} fill={K.brandD} />
          <path d="M62 162 Q87 154 111 162 V214 Q87 206 62 214 Z" fill={K.white} />
          <path d="M113 162 Q137 154 162 162 V214 Q137 206 113 214 Z" fill={K.cream} />
          <path d="M70 174 h32 M70 184 h26 M70 194 h30 M70 204 h20" stroke="#c3c9d4" strokeWidth={2.4} strokeLinecap="round" />
          <text x={137} y={182} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontSize={10} fill={K.ink}>F = ma</text>
          <path d="M122 194 h30 M122 204 h22" stroke="#c3c9d4" strokeWidth={2.4} strokeLinecap="round" />
        </g>
        <circle cx={64} cy={172} r={10.5} fill={K.cream} /><circle cx={160} cy={170} r={10.5} fill={K.cream} />
      </>} />
  ),

  cronometro: (uid) => (
    <Sitting uid={uid} mood="sorprendido" tail="M90 214 C 52 214, 40 172, 58 156"
      back={<Arm from={[92, 152]} to={[84, 196]} />}
      front={<>
        <rect x={176} y={70} width={14} height={12} rx={4} fill={K.brandD} />
        <circle cx={183} cy={110} r={30} fill={K.brandD} />
        <circle cx={182} cy={109} r={27} fill={K.brand} />
        <circle cx={182} cy={109} r={21} fill={K.white} />
        {[0, 90, 180, 270].map((a) => { const r = (a * Math.PI) / 180; return <circle key={a} cx={182 + Math.cos(r) * 16} cy={109 + Math.sin(r) * 16} r={1.8} fill={K.ink} />; })}
        <g className="g-hand" style={{ transformOrigin: "182px 109px" }}><path d="M182 109 L182 93" stroke={K.red} strokeWidth={3.4} strokeLinecap="round" /></g>
        <circle cx={182} cy={109} r={3} fill={K.ink} />
        <Arm from={[132, 154]} to={[160, 128]} />
        <Sweat x={58} y={62} />
      </>} />
  ),

  triste: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={122} cy={120} mood="triste" earsDown />
      <BoxFront />
      <RestPaw x={100} y={150} />
      <RestPaw x={144} y={150} />
    </>
  ),

  insiste: (uid) => (
    <Sitting uid={uid} mood="enojado" tail="M134 214 C 176 214, 190 172, 170 156"
      back={<Arm from={[94, 152]} to={[86, 196]} />}
      front={<>
        <Arm cls="g-point" from={[132, 152]} to={[156, 104]} />
        <rect x={150} y={82} width={8} height={18} rx={4} fill={K.cream} />
        <g className="g-star" style={{ transformOrigin: "196px 58px" }}>
          <rect x={174} y={34} width={44} height={44} rx={14} fill={K.sun} />
          <path d="M182 74 L178 88 L194 76 Z" fill={K.sun} />
          <text x={196} y={68} textAnchor="middle" fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900} fontSize={32} fill={K.ink}>!</text>
        </g>
      </>} />
  ),

  ipad: (uid) => (
    <>
      <Ground cx={124} w={92} />
      <Tail d="M148 196 C 194 200, 212 160, 194 144" />
      <Body uid={uid} cx={112} top={112} />
      <Head uid={uid} cx={112} cy={80} mood="concentrado" />
      <g transform="rotate(-5 128 194)">
        <rect x={40} y={156} width={172} height={70} rx={12} fill={K.ink} />
        <rect x={48} y={163} width={156} height={56} rx={5} fill={K.white} />
        <path d="M58 182 H194 M58 198 H194" stroke="#c3c9d4" strokeWidth={1.4} strokeDasharray="2 3.4" strokeLinecap="round" />
        <path d={`${wave(62, 179, 26, 3, 4)} M94 179 h10 M110 179 l6 -7 m-6 0 l6 7`} fill="none" stroke={K.pen} strokeWidth={2.2} strokeLinecap="round" />
        <path d={wave(62, 195, 34, 3, 5)} fill="none" stroke={K.pen} strokeWidth={2.2} strokeLinecap="round" />
        <text x={158} y={212} fontFamily="Caveat, 'Bradley Hand', cursive" fontWeight={700} fontSize={17} fill={K.red}>A1 ✓</text>
      </g>
      <RestPaw x={78} y={176} />
      <path d="M132 192 L162 146" stroke={K.creamD} strokeWidth={8} strokeLinecap="round" />
      <path d="M132 192 L162 146" stroke={K.white} strokeWidth={6} strokeLinecap="round" />
      <path d="M130 196 L133 190" stroke="#8a93a3" strokeWidth={4} strokeLinecap="round" />
      <Arm from={[134, 146]} to={[146, 170]} />
    </>
  ),

  /** Head only, for small sizes (favicon, app icon, avatar) and for the expression sheet. */
  cara: (uid, mood = "hola") => (
    <>
      <circle cx={120} cy={116} r={70} fill={K.brandXL} />
      <Head uid={uid} cx={120} cy={126} mood={mood} collar={false} earsDown={mood === "triste" || mood === "ups"} />
    </>
  ),
};
