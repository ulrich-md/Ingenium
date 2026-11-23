/** Exam-style figures: black lines, Arial labels, like a printed paper. */

const T = { fontFamily: "Arial, Helvetica, sans-serif", fill: "#111" } as const;

export function VtGraph() {
  // origin (60,190); t: 0..15 s -> x 60..330 (18 px/s); v: 0..5 m/s -> y 190..50 (28 px per m/s)
  const x = (t: number) => 60 + t * 18;
  const y = (v: number) => 190 - v * 28;
  return (
    <svg className="fig" viewBox="0 0 360 230" role="img" aria-label="Gráfico velocidad-tiempo: la velocidad sube de 0 a 4,0 m/s en 5,0 s y se mantiene constante hasta 15 s">
      <g stroke="#d4d8e0" strokeWidth="1">
        {[1, 2, 3, 4, 5].map((v) => <line key={"h" + v} x1={x(0)} y1={y(v)} x2={x(15)} y2={y(v)} />)}
        {[5, 10, 15].map((t) => <line key={"v" + t} x1={x(t)} y1={y(0)} x2={x(t)} y2={y(5)} />)}
      </g>
      <line x1={x(0)} y1={y(0)} x2={x(15) + 8} y2={y(0)} stroke="#111" strokeWidth="1.4" />
      <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(5) - 8} stroke="#111" strokeWidth="1.4" />
      <polyline points={`${x(0)},${y(0)} ${x(5)},${y(4)} ${x(15)},${y(4)}`} fill="none" stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
      <g {...T} fontSize="12">
        {[0, 5, 10, 15].map((t) => <text key={"t" + t} x={x(t)} y={y(0) + 16} textAnchor="middle">{t}</text>)}
        {[0, 1, 2, 3, 4, 5].map((v) => <text key={"y" + v} x={x(0) - 8} y={y(v) + 4} textAnchor="end">{v}</text>)}
        <text x={x(7.5)} y={y(0) + 34} textAnchor="middle">t / s</text>
        <text x="18" y={y(2.5)} textAnchor="middle" transform={`rotate(-90 18 ${y(2.5)})`}>v / m s⁻¹</text>
      </g>
    </svg>
  );
}

export function GasBox() {
  const dots = [[42, 40], [70, 62], [98, 34], [126, 70], [58, 88], [110, 96], [150, 46], [86, 112], [140, 104], [36, 116], [164, 82], [120, 22]];
  return (
    <svg className="fig" viewBox="0 0 300 160" role="img" aria-label="Recipiente rígido cerrado con un gas ideal">
      <rect x="20" y="10" width="170" height="125" fill="#f4f5f7" stroke="#111" strokeWidth="3" />
      {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="4" fill="#111" />)}
      <g {...T} fontSize="12">
        <text x="210" y="60">gas ideal</text>
        <text x="210" y="78">recipiente</text>
        <text x="210" y="94">rígido</text>
      </g>
    </svg>
  );
}

export function Orbit() {
  return (
    <svg className="fig" viewBox="0 0 320 170" role="img" aria-label="La Tierra y la órbita circular de un satélite a 700 km de altura">
      <circle cx="130" cy="85" r="56" fill="#f1f1f1" stroke="#111" strokeWidth="1.2" />
      <circle cx="130" cy="85" r="76" fill="none" stroke="#111" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="201" y="79" width="11" height="12" fill="#111" />
      <line x1="186" y1="42" x2="206" y2="42" stroke="#111" strokeWidth="1" />
      <line x1="196" y1="42" x2="196" y2="68" stroke="#111" strokeWidth="1" />
      <g {...T} fontSize="12">
        <text x="112" y="89">Tierra</text>
        <text x="218" y="89">satélite</text>
        <text x="206" y="38">700 km</text>
      </g>
    </svg>
  );
}

export function Figure({ id }: { id: "vt" | "gas" | "orbit" }) {
  if (id === "vt") return <VtGraph />;
  if (id === "gas") return <GasBox />;
  return <Orbit />;
}
