/**
 * Match-score ring. One hue per band (good / warning / recessive) with the
 * number always printed, so score is never carried by color alone.
 */
export default function ScoreGauge({ score, size = 44 }: { score: number; size?: number }) {
  const stroke = size >= 64 ? 4 : 3
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const color = score >= 80 ? 'var(--color-viz-fit)' : score >= 50 ? 'var(--color-viz-maybe)' : 'var(--color-viz-skip)'
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          stroke="color-mix(in srgb, var(--color-fg) 9%, transparent)"/>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: 'stroke-dasharray .7s var(--spring)' }}/>
      </svg>
      <span
        className="absolute font-semibold tabular"
        style={{ color, fontSize: size >= 64 ? '1.05rem' : '0.75rem' }}
      >{score}</span>
      <span className="sr-only">Match score {score} out of 100</span>
    </div>
  )
}
