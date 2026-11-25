/** Kwanta mark: energy levels with an electron jumping up. Your grade is your level.
 *  The electron is lime with an ink outline: lime alone has no contrast on white. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 30 22" width={size} height={(size * 22) / 30} aria-hidden="true">
      <g stroke="#0d1330" strokeWidth="2.2" strokeLinecap="round">
        <line x1="3" y1="19" x2="14" y2="19" />
        <line x1="3" y1="12" x2="14" y2="12" />
        <line x1="3" y1="5" x2="27" y2="5" />
      </g>
      <path d="M9 17 Q 15 8 20 6.5" fill="none" stroke="#1235c2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="23" cy="5" r="3.4" fill="#c6f432" stroke="#0d1330" strokeWidth="1.4" />
    </svg>
  );
}

/** Levels n = 1..7. A dot sits on the current grade; the goal is n = 7.
 *  Reached levels are ultramar, the goal is a lime band with an ink edge. */
export function EnergyLevels({ grade, goal = 7 }: { grade: number; goal?: number }) {
  const y = (n: number) => 150 - (n - 1) * 20;
  return (
    <svg viewBox="0 0 360 170" style={{ width: "100%", maxWidth: 420, height: "auto", display: "block" }} role="img" aria-label={`Nivel actual ${grade} de 7, meta ${goal}`}>
      <g fontFamily="JetBrains Mono, monospace" fontSize="11">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <g key={n}>
            {n === goal ? (
              <>
                <line x1="62" y1={y(n)} x2="270" y2={y(n)} style={{ stroke: "var(--ink)" }} strokeWidth={6} strokeLinecap="round" />
                <line x1="62" y1={y(n)} x2="270" y2={y(n)} style={{ stroke: "var(--lime)" }} strokeWidth={3.6} strokeLinecap="round" />
              </>
            ) : (
              <line x1="62" y1={y(n)} x2="270" y2={y(n)} style={{ stroke: n <= grade ? "var(--vec)" : "var(--line2)" }} strokeWidth={2} />
            )}
            <text x="12" y={y(n) + 4} style={{ fill: n === goal ? "var(--ink)" : "var(--muted)" }} fontWeight={n === goal ? 700 : 400}>n = {n}</text>
          </g>
        ))}
        <circle cx="130" cy={y(grade)} r="7" style={{ fill: "var(--vec)" }} />
        {grade < goal && (
          <>
            <path d={`M137 ${y(grade) - 4} Q 180 ${(y(grade) + y(goal)) / 2 - 10} 216 ${y(goal) + 3}`} fill="none" style={{ stroke: "var(--vec)" }} strokeWidth="1.8" strokeDasharray="4 3" />
            <circle cx="224" cy={y(goal)} r="7.5" style={{ fill: "var(--lime)", stroke: "var(--ink)" }} strokeWidth="2" />
          </>
        )}
        <text x="282" y={y(goal) + 4} style={{ fill: "var(--ink)" }} fontWeight={700}>meta</text>
        {grade !== goal && <text x="282" y={y(grade) + 4} style={{ fill: "var(--vec)" }} fontWeight={700}>hoy</text>}
      </g>
    </svg>
  );
}
