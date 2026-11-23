/** Kwanta mark: energy levels with an electron jumping up. Your grade is your level. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 30 22" width={size} height={(size * 22) / 30} aria-hidden="true">
      <g stroke="#0e1a33" strokeWidth="2.2" strokeLinecap="round">
        <line x1="3" y1="19" x2="14" y2="19" />
        <line x1="3" y1="12" x2="14" y2="12" />
        <line x1="3" y1="5" x2="27" y2="5" />
      </g>
      <path d="M9 17 Q 15 8 21 6" fill="none" stroke="#e8571a" strokeWidth="2" />
      <circle cx="23" cy="5" r="3" fill="#e8571a" />
    </svg>
  );
}

/** Levels n = 1..7. A dot sits on the current grade; the goal is n = 7. */
export function EnergyLevels({ grade, goal = 7 }: { grade: number; goal?: number }) {
  const y = (n: number) => 150 - (n - 1) * 20;
  return (
    <svg viewBox="0 0 360 170" style={{ width: "100%", maxWidth: 420, height: "auto", display: "block" }} role="img" aria-label={`Nivel actual ${grade} de 7, meta ${goal}`}>
      <g fontFamily="JetBrains Mono, monospace" fontSize="11">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <g key={n}>
            <line x1="62" y1={y(n)} x2="270" y2={y(n)} stroke={n === goal ? "#e8571a" : n <= grade ? "#2347d9" : "#d3d9e4"} strokeWidth={n === goal ? 2.6 : 2} />
            <text x="12" y={y(n) + 4} fill={n === goal ? "#e8571a" : "#56627a"}>n = {n}</text>
          </g>
        ))}
        <circle cx="130" cy={y(grade)} r="7" fill="#2347d9" />
        {grade < goal && (
          <>
            <path d={`M137 ${y(grade) - 4} Q 180 ${(y(grade) + y(goal)) / 2 - 10} 218 ${y(goal) + 2}`} fill="none" stroke="#2347d9" strokeWidth="1.8" strokeDasharray="4 3" />
            <circle cx="224" cy={y(goal)} r="7" fill="none" stroke="#e8571a" strokeWidth="2" />
          </>
        )}
        <text x="280" y={y(goal) + 4} fill="#e8571a">meta</text>
        {grade !== goal && <text x="280" y={y(grade) + 4} fill="#2347d9">hoy</text>}
      </g>
    </svg>
  );
}
