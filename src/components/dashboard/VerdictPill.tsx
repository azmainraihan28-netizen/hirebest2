export default function VerdictPill({ verdict }: { verdict: 'Fit' | 'Maybe' | 'Skip' }) {
  const cls = verdict === 'Fit' ? 'verdict-fit' : verdict === 'Maybe' ? 'verdict-maybe' : 'verdict-skip'
  return <span className={`text-xs font-semibold px-3 py-1 rounded-md ${cls}`}>{verdict}</span>
}
