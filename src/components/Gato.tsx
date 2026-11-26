/** Kwanta's mascot: a cat that lives in a box, after Schrödinger's thought experiment.
 *  What makes it ours:
 *   - heterochromia: one celeste eye and one amber eye, its "two states";
 *   - wave stripes (sine waves) on the forehead, cheeks and tail instead of tabby marks;
 *   - white socks with pink beans, a celeste collar with a yellow Ψ tag;
 *   - a cardboard box with a corrugated edge, packing tape and a Ψ stamp;
 *   - the "superposición" pose: half the cat is solid, the other half a cloud of dots.
 *  Flat and rounded like the rest of Kwanta's illustrations: no outlines, a darker shade for the
 *  shadow side. Every SVG gets its own `uid` so clip paths and masks never collide on a page.
 *  Animation hooks (classes): g-tail, g-wave, g-eyes, g-body, g-z, g-star. */

export type GatoPose = "hola" | "sube" | "ups" | "superposicion" | "escribe" | "duerme";
type Mood = "hola" | "feliz" | "ups" | "duda" | "concentrado" | "dormido";

export const K = {
  fur: "#3b5878", furD: "#2a4260", furDD: "#1f3350", furL: "#5f80a6",
  cream: "#f6f9fc", creamD: "#d9e3ee",
  pink: "#ff9ec4", bean: "#ff7eb0", mouth: "#5a1a2e",
  ink: "#0d1b2a", white: "#ffffff",
  eyeA: "#2bb5ff", eyeAD: "#0b7fc4", eyeB: "#ffc23d", eyeBD: "#d18f00",
  wave: "#7fd3ff",
  brand: "#2bb5ff", brandD: "#1590d8", brandL: "#bfe7ff", brandXL: "#e2f4ff",
  sun: "#ffc23d", sunD: "#e9a400", red: "#d62828", pen: "#1d3fbf",
  box: "#eeb466", boxD: "#d48f45", boxDD: "#a9652a", boxL: "#f7cd8d", tape: "#f6e3bb",
  ground: "#d5dee9",
};

/** A sine wave of `n` half-periods starting at (x, y), `w` wide. */
const wave = (x: number, y: number, w: number, amp: number, n: number) => {
  const h = w / n;
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` q${h / 2} ${i % 2 ? amp : -amp} ${h} 0`;
  return d;
};

const star = (x: number, y: number, r: number, fill: string = K.sun, key?: string | number) => (
  <path key={key} className="g-star" d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`} fill={fill} />
);

/* ---------------- eyes ---------------- */

function Eye({ uid, side, x, y, look = [0, 0], lid = 0 }: { uid: string; side: "L" | "R"; x: number; y: number; look?: [number, number]; lid?: number }) {
  const [iris, irisD] = side === "L" ? [K.eyeA, K.eyeAD] : [K.eyeB, K.eyeBD];
  const [dx, dy] = look;
  const id = `${uid}-eye${side}`;
  const lidY = y - 14 + 27 * lid;
  return (
    <g>
      <clipPath id={id}><ellipse cx={x} cy={y} rx={11.5} ry={13} /></clipPath>
      <ellipse cx={x} cy={y} rx={11.5} ry={13} fill={K.white} />
      <g clipPath={`url(#${id})`}>
        <circle cx={x + dx} cy={y + dy} r={9.4} fill={iris} />
        <circle cx={x + dx} cy={y + dy} r={8.4} fill="none" stroke={irisD} strokeWidth={2} />
        <path d={`M${x + dx - 6} ${y + dy + 3} a6.5 6.5 0 0 0 12 0`} fill="none" stroke={K.white} strokeWidth={1.4} opacity={0.35} />
        <ellipse cx={x + dx} cy={y + dy} rx={4.1} ry={7.2} fill={K.ink} />
        <circle cx={x + dx + 3.4} cy={y + dy - 4.6} r={3.1} fill={K.white} />
        <circle cx={x + dx - 3.1} cy={y + dy + 4.2} r={1.4} fill={K.white} />
        {lid > 0 && (
          <path d={`M${x - 13} ${y - 15} H${x + 13} V${lidY} Q${x} ${lidY + 4} ${x - 13} ${lidY} Z`} fill={K.fur} />
        )}
      </g>
      {lid > 0 && <path d={`M${x - 11} ${lidY + 0.6} Q${x} ${lidY + 4.4} ${x + 11} ${lidY + 0.6}`} fill="none" stroke={K.furDD} strokeWidth={2.2} strokeLinecap="round" />}
    </g>
  );
}

function Eyes({ uid, cx, cy, mood }: { uid: string; cx: number; cy: number; mood: Mood }) {
  const L = cx - 17, R = cx + 17, y = cy - 2;
  if (mood === "feliz") {
    return (
      <g className="g-eyes">
        {[L, R].map((x) => <path key={x} d={`M${x - 9} ${y + 3} Q${x} ${y - 10} ${x + 9} ${y + 3}`} fill="none" stroke={K.ink} strokeWidth={3.8} strokeLinecap="round" />)}
      </g>
    );
  }
  if (mood === "dormido") {
    return (
      <g className="g-eyes">
        {[L, R].map((x) => <path key={x} d={`M${x - 9} ${y} Q${x} ${y + 7} ${x + 9} ${y}`} fill="none" stroke={K.ink} strokeWidth={3.4} strokeLinecap="round" />)}
      </g>
    );
  }
  const brow = (x: number, dir: 1 | -1, lift = 0) => (
    <path d={`M${x - dir * 9} ${y - 17 + lift} L${x + dir * 7} ${y - 22 + lift}`} stroke={K.cream} strokeWidth={2.6} strokeLinecap="round" opacity={0.9} />
  );
  const conf = {
    hola: { l: [0.8, 0.6] as [number, number], r: [0.8, 0.6] as [number, number], ll: 0, rl: 0 },
    ups: { l: [2.6, -2.2] as [number, number], r: [2.6, -2.2] as [number, number], ll: 0, rl: 0 },
    duda: { l: [1.6, -2.6] as [number, number], r: [1.2, -1.2] as [number, number], ll: 0, rl: 0.46 },
    concentrado: { l: [1, 3.2] as [number, number], r: [1, 3.2] as [number, number], ll: 0.32, rl: 0.32 },
  }[mood];
  return (
    <g className="g-eyes">
      <Eye uid={uid} side="L" x={L} y={y} look={conf.l} lid={conf.ll} />
      <Eye uid={uid} side="R" x={R} y={y} look={conf.r} lid={conf.rl} />
      {mood === "ups" && <>{brow(L, 1)}{brow(R, -1)}</>}
      {mood === "duda" && <path d={`M${L - 9} ${y - 20} Q${L} ${y - 26} ${L + 8} ${y - 21}`} fill="none" stroke={K.cream} strokeWidth={2.6} strokeLinecap="round" opacity={0.9} />}
    </g>
  );
}

/* ---------------- head ---------------- */

function Ear({ cx, cy, side, down }: { cx: number; cy: number; side: 1 | -1; down?: boolean }) {
  const s = side;
  const p = (dx: number, dy: number) => `${cx + s * dx} ${cy + dy}`;
  return (
    <g transform={down ? `rotate(${s * 30} ${cx + s * 28} ${cy - 22})` : undefined}>
      <path d={`M${p(40, -12)} Q${p(54, -56)} ${p(46, -66)} Q${p(28, -60)} ${p(9, -34)} Z`} fill={s < 0 ? K.fur : K.furD} />
      <path d={`M${p(36, -22)} Q${p(46, -50)} ${p(43, -57)} Q${p(30, -52)} ${p(16, -34)} Z`} fill={K.pink} />
      <path d={`M${p(35, -30)} l${s * 3} -12 M${p(30, -31)} l${s * 1} -14 M${p(25, -32)} l${-s * 2} -10`} stroke={K.cream} strokeWidth={1.8} strokeLinecap="round" opacity={0.9} fill="none" />
    </g>
  );
}

const headPath = (cx: number, cy: number) => {
  const p = (dx: number, dy: number) => `${cx + dx} ${cy + dy}`;
  return `M${p(-44, -10)} C${p(-46, -36)} ${p(-22, -43)} ${p(0, -43)} C${p(22, -43)} ${p(46, -36)} ${p(44, -10)}
    L${p(57, 3)} L${p(45, 8)} L${p(55, 18)} L${p(38, 23)}
    C${p(30, 37)} ${p(14, 41)} ${p(0, 41)} C${p(-14, 41)} ${p(-30, 37)} ${p(-38, 23)}
    L${p(-55, 18)} L${p(-45, 8)} L${p(-57, 3)} Z`;
};

function Mouth({ cx, cy, mood }: { cx: number; cy: number; mood: Mood }) {
  const y = cy + 13;
  const w = <path d={`M${cx} ${y} v4 M${cx - 8} ${y + 5} Q${cx - 4} ${y + 9} ${cx} ${y + 4} Q${cx + 4} ${y + 9} ${cx + 8} ${y + 5}`} fill="none" stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />;
  switch (mood) {
    case "feliz":
      return (
        <g>
          <path d={`M${cx - 11} ${y + 5} Q${cx} ${y + 26} ${cx + 11} ${y + 5} Q${cx} ${y + 9} ${cx - 11} ${y + 5} Z`} fill={K.mouth} />
          <ellipse cx={cx} cy={y + 15} rx={5.6} ry={3.6} fill={K.bean} />
          <path d={`M${cx} ${y} v5`} stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      );
    case "ups":
      return <path d={`M${cx - 7} ${y + 8} q3.5 -4 7 0 t7 0`} fill="none" stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" />;
    case "duda":
      return <path d={`M${cx - 4} ${y + 7} Q${cx + 4} ${y + 4} ${cx + 10} ${y + 8}`} fill="none" stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" />;
    case "concentrado":
      return <g>{w}<path d={`M${cx + 5} ${y + 7} q4 6 8 1 q-2 -4 -8 -1z`} fill={K.bean} /></g>;
    default:
      return w;
  }
}

function Head({ uid, cx, cy, mood, earsDown, collar = true }: { uid: string; cx: number; cy: number; mood: Mood; earsDown?: boolean; collar?: boolean }) {
  const p = (dx: number, dy: number) => [cx + dx, cy + dy] as const;
  const blush = mood === "feliz" || mood === "hola" || mood === "dormido";
  return (
    <g className="g-head">
      <Ear cx={cx} cy={cy} side={-1} down={earsDown} />
      <Ear cx={cx} cy={cy} side={1} down={earsDown} />
      {collar && (
        <g>
          <path d={`M${cx - 30} ${cy + 31} Q${cx} ${cy + 47} ${cx + 30} ${cy + 31}`} fill="none" stroke={K.brandD} strokeWidth={7} strokeLinecap="round" />
          <path d={`M${cx - 30} ${cy + 30} Q${cx} ${cy + 45} ${cx + 30} ${cy + 30}`} fill="none" stroke={K.brand} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      )}
      <path d={headPath(cx + 3, cy + 3)} fill={K.furD} />
      <path d={`M${cx - 7} ${cy - 41} l3 -9 l4 6 l3 -10 l3 8 l4 -5 l1 10 Z`} fill={K.fur} />
      <path d={headPath(cx, cy)} fill={K.fur} />
      <ellipse cx={cx - 16} cy={cy - 20} rx={20} ry={11} transform={`rotate(-14 ${cx - 16} ${cy - 20})`} fill={K.furL} opacity={0.45} />
      {/* wave stripes instead of tabby marks */}
      <g fill="none" stroke={K.wave} strokeLinecap="round">
        <path d={wave(cx - 14, cy - 33, 28, 3, 4)} strokeWidth={3.2} />
        <path d={wave(cx - 9, cy - 26, 18, 2.4, 4)} strokeWidth={2.6} opacity={0.8} />
        <path d={wave(...p(-47, -4), 12, 2.2, 2)} strokeWidth={2.4} opacity={0.75} />
        <path d={wave(...p(-49, 3), 10, 2, 2)} strokeWidth={2.2} opacity={0.6} />
        <path d={wave(...p(35, -4), 12, 2.2, 2)} strokeWidth={2.4} opacity={0.75} />
        <path d={wave(...p(39, 3), 10, 2, 2)} strokeWidth={2.2} opacity={0.6} />
      </g>
      {/* muzzle */}
      <ellipse cx={cx - 9} cy={cy + 17} rx={13} ry={10} fill={K.cream} />
      <ellipse cx={cx + 9} cy={cy + 17} rx={13} ry={10} fill={K.cream} />
      <ellipse cx={cx} cy={cy + 27} rx={9.5} ry={6} fill={K.cream} />
      <ellipse cx={cx + 10} cy={cy + 22} rx={9} ry={5} fill={K.creamD} opacity={0.6} />
      {[[-13, 16], [-17, 20], [-11, 21], [13, 16], [17, 20], [11, 21]].map(([dx, dy]) => <circle key={`${dx},${dy}`} cx={cx + dx} cy={cy + dy} r={1.1} fill={K.furL} />)}
      {blush && <><ellipse cx={cx - 30} cy={cy + 13} rx={7} ry={4} fill={K.pink} opacity={0.5} /><ellipse cx={cx + 30} cy={cy + 13} rx={7} ry={4} fill={K.pink} opacity={0.5} /></>}
      <Eyes uid={uid} cx={cx} cy={cy} mood={mood} />
      <path d={`M${cx - 5.5} ${cy + 7} Q${cx} ${cy + 4.6} ${cx + 5.5} ${cy + 7} Q${cx + 3} ${cy + 12.6} ${cx} ${cy + 13} Q${cx - 3} ${cy + 12.6} ${cx - 5.5} ${cy + 7} Z`} fill={K.bean} />
      <ellipse cx={cx - 1.6} cy={cy + 7.6} rx={1.8} ry={1} fill={K.white} opacity={0.7} />
      <Mouth cx={cx} cy={cy} mood={mood} />
      {/* whiskers */}
      <g fill="none" stroke={K.cream} strokeWidth={1.5} strokeLinecap="round" opacity={0.85}>
        <path d={`M${cx - 20} ${cy + 15} Q${cx - 36} ${cy + 9} ${cx - 54} ${cy + 10}`} />
        <path d={`M${cx - 20} ${cy + 19} Q${cx - 38} ${cy + 18} ${cx - 55} ${cy + 22}`} />
        <path d={`M${cx - 19} ${cy + 23} Q${cx - 34} ${cy + 27} ${cx - 48} ${cy + 33}`} />
        <path d={`M${cx + 20} ${cy + 15} Q${cx + 36} ${cy + 9} ${cx + 54} ${cy + 10}`} />
        <path d={`M${cx + 20} ${cy + 19} Q${cx + 38} ${cy + 18} ${cx + 55} ${cy + 22}`} />
        <path d={`M${cx + 19} ${cy + 23} Q${cx + 34} ${cy + 27} ${cx + 48} ${cy + 33}`} />
      </g>
      {collar && (
        <g>
          <circle cx={cx} cy={cy + 45} r={8} fill={K.sunD} />
          <circle cx={cx - 0.6} cy={cy + 44.4} r={7.2} fill={K.sun} />
          <text x={cx - 0.6} y={cy + 48.4} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={11} fontWeight={700} fill={K.ink}>Ψ</text>
        </g>
      )}
    </g>
  );
}

/* ---------------- body parts ---------------- */

/** An arm ending in a white sock. With `beans`, the paw shows its pink pads to the viewer. */
function Arm({ from, to, beans, cls }: { from: [number, number]; to: [number, number]; beans?: boolean; cls?: string }) {
  const [px, py] = to;
  return (
    <g className={cls}>
      <path d={`M${from[0]} ${from[1]} L${px} ${py}`} stroke={K.furD} strokeWidth={16} strokeLinecap="round" />
      <path d={`M${from[0]} ${from[1]} L${px} ${py}`} stroke={K.fur} strokeWidth={12} strokeLinecap="round" />
      <circle cx={px} cy={py} r={11} fill={K.cream} />
      <circle cx={px + 2} cy={py + 2} r={9} fill={K.creamD} opacity={0.5} />
      {beans ? (
        <g fill={K.bean}>
          <ellipse cx={px} cy={py + 2.4} rx={4.6} ry={3.6} />
          <circle cx={px - 5.4} cy={py - 4} r={2.2} /><circle cx={px} cy={py - 6.4} r={2.2} /><circle cx={px + 5.4} cy={py - 4} r={2.2} />
        </g>
      ) : (
        <path d={`M${px - 3.4} ${py - 9} v5 M${px + 3.4} ${py - 9} v5`} stroke={K.creamD} strokeWidth={1.6} strokeLinecap="round" />
      )}
    </g>
  );
}

/** A paw resting on the box edge (only the sock shows). */
const RestPaw = ({ x, y }: { x: number; y: number }) => (
  <g>
    <ellipse cx={x} cy={y} rx={12} ry={8.5} fill={K.cream} />
    <path d={`M${x - 4} ${y - 2} v6 M${x + 4} ${y - 2} v6`} stroke={K.creamD} strokeWidth={1.6} strokeLinecap="round" />
  </g>
);

function Torso({ cx, top }: { cx: number; top: number }) {
  return (
    <g className="g-body">
      <path d={`M${cx - 28} ${top} Q${cx - 44} ${top + 52} ${cx - 30} ${top + 78} L${cx + 30} ${top + 78} Q${cx + 44} ${top + 52} ${cx + 28} ${top} Z`} fill={K.furD} />
      <path d={`M${cx - 28} ${top} Q${cx - 42} ${top + 50} ${cx - 28} ${top + 76} L${cx + 24} ${top + 76} Q${cx + 36} ${top + 50} ${cx + 24} ${top} Z`} fill={K.fur} />
      <ellipse cx={cx} cy={top + 30} rx={17} ry={25} fill={K.cream} />
      <g fill="none" stroke={K.wave} strokeWidth={2.6} strokeLinecap="round" opacity={0.7}>
        <path d={wave(cx - 38, top + 34, 14, 2.4, 2)} /><path d={wave(cx - 39, top + 44, 12, 2.2, 2)} />
        <path d={wave(cx + 22, top + 34, 14, 2.4, 2)} /><path d={wave(cx + 24, top + 44, 12, 2.2, 2)} />
      </g>
    </g>
  );
}

/** Tail: navy with darker rings and a cream tip. */
function Tail({ d, tip }: { d: string; tip: [number, number] }) {
  return (
    <g className="g-tail">
      <path d={d} fill="none" stroke={K.furD} strokeWidth={15} strokeLinecap="round" />
      <path d={d} fill="none" stroke={K.fur} strokeWidth={11} strokeLinecap="round" />
      <path d={d} fill="none" stroke={K.wave} strokeWidth={11} strokeDasharray="3 11" opacity={0.55} />
      <circle cx={tip[0]} cy={tip[1]} r={7.5} fill={K.cream} />
    </g>
  );
}

/* ---------------- the box ---------------- */

function BoxBack() {
  return (
    <g>
      <path d="M50 150 L70 136 L212 136 L192 150 Z" fill={K.boxDD} />
      <path d="M70 136 L80 106 L208 106 L212 136 Z" fill={K.boxD} />
      <path d={wave(80, 108, 128, 1.4, 20)} fill="none" stroke={K.boxDD} strokeWidth={1.4} opacity={0.6} />
      <path d="M50 150 L70 136 L46 114 L24 130 Z" fill={K.boxL} />
      <path d="M50 150 L70 136 L58 125 Z" fill={K.box} opacity={0.6} />
    </g>
  );
}

function BoxFront() {
  return (
    <g>
      <path d="M192 150 L212 136 L212 208 L192 222 Z" fill={K.boxD} />
      <path d="M192 150 L212 136 L234 152 L214 168 Z" fill={K.boxL} />
      <path d="M192 150 L212 136 L222 145 Z" fill={K.box} opacity={0.7} />
      <rect x={50} y={150} width={142} height={72} rx={4} fill={K.box} />
      <rect x={50} y={150} width={142} height={7} fill={K.boxL} />
      <path d={wave(50, 153.5, 142, 1.3, 30)} fill="none" stroke={K.boxD} strokeWidth={1.3} />
      <rect x={50} y={212} width={142} height={10} rx={4} fill={K.boxD} opacity={0.35} />
      {/* packing tape */}
      <path d="M114 150 H129 V183 L126.5 186 L124 183 L121.5 186 L119 183 L116.5 186 L114 183 Z" fill={K.tape} opacity={0.95} />
      <path d="M116 150 V182" stroke={K.white} strokeWidth={1.6} opacity={0.6} />
      {/* this side up */}
      <g stroke={K.boxDD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7}>
        <path d="M70 206 v-16 m-6 6 l6 -6 l6 6" /><path d="M84 206 v-16 m-6 6 l6 -6 l6 6" />
        <path d="M62 211 h30" />
      </g>
      {/* the Ψ stamp */}
      <g transform="rotate(-10 162 190)" opacity={0.75}>
        <circle cx={162} cy={190} r={17} fill="none" stroke={K.boxDD} strokeWidth={2.4} />
        <circle cx={162} cy={190} r={12.5} fill="none" stroke={K.boxDD} strokeWidth={1.2} strokeDasharray="2 2.4" />
        <text x={162} y={196.5} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={18} fontWeight={700} fill={K.boxDD}>Ψ</text>
      </g>
    </g>
  );
}

const Ground = ({ cx = 130, w = 98 }: { cx?: number; w?: number }) => <ellipse cx={cx} cy={226} rx={w} ry={7} fill={K.ground} />;

const Sweat = ({ x, y }: { x: number; y: number }) => (
  <g><path d={`M${x} ${y} q-7 10 0 14 q7 -4 0 -14z`} fill={K.brandL} /><circle cx={x - 1.8} cy={y + 8} r={1.5} fill={K.white} /></g>
);

/* ---------------- poses ---------------- */

const LABEL: Record<GatoPose, string> = {
  hola: "El gato de Kwanta saluda desde su caja",
  sube: "El gato de Kwanta salta de la caja, feliz: subiste de nivel",
  ups: "El gato de Kwanta, preocupado, junto a una marca roja de corrección",
  superposicion: "El gato de Kwanta en superposición: mitad sólido, mitad nube de puntos",
  escribe: "El gato de Kwanta resuelve una hoja de examen con su lápiz",
  duerme: "El gato de Kwanta duerme en su caja",
};

export default function Gato({ pose = "hola", uid, className, title }: { pose?: GatoPose; uid?: string; className?: string; title?: string }) {
  const id = uid ?? `gato-${pose}`;
  const label = title ?? LABEL[pose];
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      {POSES[pose](id)}
    </svg>
  );
}

const POSES: Record<GatoPose, (uid: string) => React.ReactNode> = {
  hola: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={124} cy={106} mood="hola" />
      <BoxFront />
      <RestPaw x={94} y={151} />
      <Arm cls="g-wave" from={[152, 146]} to={[184, 86]} beans />
      <g className="g-wave-lines" fill="none" stroke={K.brandL} strokeWidth={3.4} strokeLinecap="round">
        <path d="M198 66 q8 8 5 18" /><path d="M206 56 q12 12 8 28" />
      </g>
      <Tail d="M210 190 C 238 180, 238 136, 220 124" tip={[220, 124]} />
    </>
  ),

  sube: (uid) => (
    <>
      <circle cx={120} cy={96} r={78} fill={K.brandXL} />
      <circle cx={120} cy={96} r={58} fill={K.brandL} opacity={0.45} />
      <Ground />
      <BoxBack />
      <Tail d="M146 168 C 188 170, 204 126, 182 110" tip={[182, 110]} />
      <Torso cx={120} top={98} />
      <Arm from={[98, 110]} to={[62, 58]} beans />
      <Arm from={[142, 110]} to={[178, 58]} beans />
      <Head uid={uid} cx={120} cy={66} mood="feliz" />
      <BoxFront />
      {star(28, 40, 10, K.sun, 1)}{star(212, 36, 8, K.sun, 2)}{star(214, 104, 6, K.brand, 3)}{star(34, 112, 6, K.brand, 4)}{star(196, 14, 4, K.sun, 5)}
    </>
  ),

  ups: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={122} cy={120} mood="ups" earsDown />
      <BoxFront />
      <RestPaw x={96} y={151} />
      <RestPaw x={150} y={151} />
      <Sweat x={172} y={70} />
      {/* the red correction mark, like the margin of a marked exam */}
      <g fill="none" stroke={K.red} strokeWidth={4.6} strokeLinecap="round" transform="rotate(-8 202 78)">
        <path d="M190 64 L212 92" /><path d="M213 64 L190 93" />
      </g>
    </>
  ),

  superposicion: (uid) => {
    const cat = (
      <>
        <Head uid={`${uid}-a`} cx={122} cy={104} mood="duda" />
        <Arm from={[150, 152]} to={[150, 128]} />
      </>
    );
    const dots: React.ReactNode[] = [];
    for (let y = 26; y < 160; y += 7) for (let x = 123; x < 200; x += 7) dots.push(<circle key={`${x}-${y}`} cx={x + (((y - 26) / 7) % 2) * 3.5} cy={y} r={2.3} fill="#fff" />);
    const strays = [[188, 70, 2.4], [200, 96, 2], [196, 120, 1.8], [210, 82, 1.6], [206, 52, 1.4], [184, 44, 2], [214, 108, 1.2]];
    return (
      <>
        <Ground />
        <BoxBack />
        <clipPath id={`${uid}-left`}><rect x={0} y={0} width={122} height={240} /></clipPath>
        <mask id={`${uid}-cloud`} maskUnits="userSpaceOnUse" x={0} y={0} width={240} height={240}>{dots}</mask>
        <g clipPath={`url(#${uid}-left)`}>{cat}</g>
        <clipPath id={`${uid}-right`}><rect x={122} y={0} width={118} height={240} /></clipPath>
        <g clipPath={`url(#${uid}-right)`} opacity={0.16}>{cat}</g>
        <g mask={`url(#${uid}-cloud)`}>{cat}</g>
        {strays.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={K.fur} opacity={0.55} />)}
        <path d="M122 30 V148" stroke={K.brand} strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" opacity={0.6} />
        <BoxFront />
        <RestPaw x={96} y={151} />
        <text x={40} y={70} fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900} fontSize={26} fill={K.brand}>?</text>
      </>
    );
  },

  escribe: (uid) => (
    <>
      <Ground cx={124} w={92} />
      <Tail d="M150 196 C 196 200, 212 160, 192 146" tip={[192, 146]} />
      <Torso cx={112} top={112} />
      <Head uid={uid} cx={112} cy={80} mood="concentrado" />
      {/* the exam sheet */}
      <g transform="rotate(-5 128 194)">
        <rect x={48} y={160} width={160} height={62} rx={3} fill={K.creamD} />
        <rect x={46} y={158} width={160} height={62} rx={3} fill={K.white} />
        <rect x={58} y={168} width={136} height={44} fill="none" stroke="#5b6270" strokeWidth={1.2} />
        <path d="M62 183 H190 M62 198 H190" stroke="#b6bcc8" strokeWidth={1.3} strokeDasharray="2 3" />
        <path d="M66 180 q4 -8 8 0 t8 0 M88 180 l6 -7 m-6 0 l6 7 M100 177 h8 M112 180 q3 -6 6 0 q3 6 6 0" fill="none" stroke={K.pen} strokeWidth={2} strokeLinecap="round" />
        <text x={158} y={210} fontFamily="Caveat, 'Bradley Hand', cursive" fontWeight={700} fontSize={16} fill={K.red}>M1 ✓</text>
        <path d="M66 195 q5 -7 10 0 t10 0" fill="none" stroke={K.pen} strokeWidth={2} strokeLinecap="round" />
      </g>
      <RestPaw x={82} y={176} />
      {/* the pencil, then the paw holding it */}
      <path d="M132 196 L160 150" stroke={K.creamD} strokeWidth={9} strokeLinecap="round" />
      <path d="M132 196 L160 150" stroke={K.white} strokeWidth={6.4} strokeLinecap="round" />
      <path d="M129 201 L131 192 L136 195 Z" fill={K.ink} />
      <path d="M152 163 L160 150" stroke={K.brand} strokeWidth={6.4} strokeLinecap="round" />
      <Arm from={[134, 146]} to={[146, 172]} />
    </>
  ),

  duerme: (uid) => (
    <>
      <Ground />
      <BoxBack />
      <Head uid={uid} cx={124} cy={142} mood="dormido" collar={false} />
      <BoxFront />
      <RestPaw x={100} y={151} />
      <Tail d="M156 150 C 176 156, 184 174, 172 190" tip={[172, 190]} />
      <g className="g-z" fill={K.brand} fontFamily="Nunito, 'Arial Rounded MT Bold', sans-serif" fontWeight={900}>
        <text x={166} y={102} fontSize={16}>z</text>
        <text x={182} y={84} fontSize={22}>z</text>
        <text x={202} y={62} fontSize={28}>Z</text>
      </g>
    </>
  ),
};
