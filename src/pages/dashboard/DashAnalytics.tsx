import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Users, Sparkles } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import { SkeletonStats, Skeleton } from '../../components/Skeleton'
import { listScreenings, listCandidates, type Candidate } from '../../lib/screenings'

export default function DashAnalytics() {
  const [loading, setLoading] = useState(true)
  const [all, setAll] = useState<Candidate[]>([])
  const [screeningCount, setScreeningCount] = useState(0)

  useEffect(() => {
    (async () => {
      const ss = await listScreenings(200)
      setScreeningCount(ss.length)
      const lists = await Promise.all(ss.map(s => listCandidates(s.id)))
      setAll(lists.flat())
      setLoading(false)
    })()
  }, [])

  if (loading) return (
    <>
      <DashboardTopBar title="Analytics"/>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <SkeletonStats count={4}/>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-6"><Skeleton className="h-5 w-40 mb-5"/><div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-3 w-full"/>)}</div></div>
          <div className="card p-6"><Skeleton className="h-5 w-40 mb-5"/><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-3 w-full"/>)}</div></div>
        </div>
      </div>
    </>
  )

  const total = all.length
  const fit = all.filter(c => c.verdict === 'Fit').length
  const avgScore = total ? Math.round(all.reduce((s, c) => s + c.score, 0) / total) : 0
  const skillFreq: Record<string, number> = {}
  for (const c of all) for (const s of (c.skills ?? [])) skillFreq[s] = (skillFreq[s] ?? 0) + 1
  const topSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const gapsFreq: Record<string, number> = {}
  for (const c of all) for (const g of (c.gaps ?? [])) gapsFreq[g] = (gapsFreq[g] ?? 0) + 1
  const topGaps = Object.entries(gapsFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <>
      <DashboardTopBar title="Analytics"/>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={<BarChart3 size={18}/>} label="Total screenings" value={screeningCount}/>
          <Stat icon={<Users size={18}/>} label="CVs scored" value={total}/>
          <Stat icon={<Sparkles size={18}/>} label="Fit candidates" value={fit}/>
          <Stat icon={<TrendingUp size={18}/>} label="Avg score" value={avgScore}/>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Top skills across CVs</h3>
            <div className="space-y-2.5">
              {topSkills.length === 0 && <p className="text-sm text-[var(--color-muted)]">No data yet.</p>}
              {topSkills.map(([s, n]) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-32 truncate">{s}</span>
                  <div className="flex-1 h-2 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)]" style={{ width: `${(n / topSkills[0][1]) * 100}%` }}/>
                  </div>
                  <span className="w-8 text-right text-xs text-[var(--color-muted)]">{n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Most common gaps</h3>
            <ul className="space-y-2">
              {topGaps.length === 0 && <p className="text-sm text-[var(--color-muted)]">No data yet.</p>}
              {topGaps.map(([g, n]) => (
                <li key={g} className="flex items-center justify-between text-sm border-b border-[var(--color-border)] last:border-0 pb-2">
                  <span className="text-[var(--color-fg)] flex-1 pr-3">{g}</span>
                  <span className="text-xs text-yellow-300">×{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
          <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center text-[var(--color-primary-2)]">{icon}</div>
      </div>
    </div>
  )
}
