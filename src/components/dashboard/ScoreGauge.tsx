export default function ScoreGauge({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const dash = c * pct
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={3} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={3} fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}
