import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Sparkles, TrendingUp, Target, Zap, Award, FileText } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import { SkeletonStats, Skeleton } from '../../components/Skeleton'
import { listScreenings, listCandidates, type Candidate, type Screening } from '../../lib/screenings'

// Avg minutes a recruiter spends manually screening one CV. Industry studies
// (LinkedIn 2023, SHRM) put this at 6–8 minutes per resume; we use 7 for the
// "time saved" tile so the headline number stays defensible.
const MINUTES_SAVED_PER_CV = 7

export default function DashAnalytics() {
  const [loading, setLoading] = useState(true)
  const [all, setAll] = useState<Candidate[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])

  useEffect(() => {
    (async () => {
      const ss = await listScreenings(200)
      setScreenings(ss)
      const lists = await Promise.all(ss.map(s => listCandidates(s.id)))
      setAll(lists.flat())
      setLoading(false)
    })()
  }, [])

  const totals = useMemo(() => {
    const total = all.length
    const fit = all.filter(c => c.verdict === 'Fit').length
    const maybe = all.filter(c => c.verdict === 'Maybe').length
    const skip = all.filter(c => c.verdict === 'Skip').length
    const avgScore = total ? Math.round(all.reduce((s, c) => s + c.score, 0) / total) : 0
    const fitRate = total ? Math.round((fit / total) * 100) : 0
    const minutesSaved = total * MINUTES_SAVED_PER_CV
    return { total, fit, maybe, skip, avgScore, fitRate, minutesSaved }
  }, [all])

  if (loading) return (
    <>
      <DashboardTopBar title="CV Review"/>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <Skeleton className="h-44 w-full"/>
        <SkeletonStats count={4}/>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-6"><Skeleton className="h-5 w-40 mb-5"/><div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-3 w-full"/>)}</div></div>
          <div className="card p-6"><Skeleton className="h-5 w-40 mb-5"/><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-3 w-full"/>)}</div></div>
        </div>
      </div>
    </>
  )

  const skillFreq: Record<string, number> = {}
  for (const c of all) for (const s of (c.skills ?? [])) skillFreq[s] = (skillFreq[s] ?? 0) + 1
  const topSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const gapsFreq: Record<string, number> = {}
  for (const c of all) for (const g of (c.gaps ?? [])) gapsFreq[g] = (gapsFreq[g] ?? 0) + 1
  const topGaps = Object.entries(gapsFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Score distribution buckets
  const buckets = [0, 0, 0, 0, 0]
  for (const c of all) {
    const idx = Math.min(4, Math.floor(c.score / 20))
    buckets[idx]++
  }
  const maxBucket = Math.max(1, ...buckets)
  const bucketLabels = ['0–19', '20–39', '40–59', '60–79', '80–100']

  // Activity over last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    d.setHours(0, 0, 0, 0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const count = all.filter(c => {
      const t = new Date(c.created_at)
      return t >= d && t < next
    }).length
    return { label: d.toLocaleDateString('en-US', { day: 'numeric' }), full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }
  })
  const maxDay = Math.max(1, ...days.map(d => d.count))

  const topCandidates = [...all].sort((a, b) => b.score - a.score).slice(0, 5)

  return (
    <>
      <DashboardTopBar title="CV Review"/>
      <div className="p-6 max-w-7xl mx-auto space-y-5">

        {/* Hero — live time-saved counter */}
        <TimeSavedHero
          minutesSaved={totals.minutesSaved}
          total={totals.total}
          fitRate={totals.fitRate}
          screeningCount={screenings.length}
        />

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={<FileText size={18}/>} label="CVs reviewed" value={totals.total} accent="from-sky-500/20 to-sky-500/0" iconColor="text-sky-400"/>
          <Stat icon={<Sparkles size={18}/>} label="Fit candidates" value={totals.fit} accent="from-emerald-500/20 to-emerald-500/0" iconColor="text-emerald-400" sub={`${totals.fitRate}% fit rate`}/>
          <Stat icon={<Target size={18}/>} label="Avg match score" value={totals.avgScore} accent="from-amber-500/20 to-amber-500/0" iconColor="text-amber-400" sub="out of 100"/>
          <Stat icon={<Zap size={18}/>} label="Screenings run" value={screenings.length} accent="from-fuchsia-500/20 to-fuchsia-500/0" iconColor="text-fuchsia-400"/>
        </div>

        {/* Verdict mix + score distribution */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="card p-6 lg:col-span-1">
            <h3 className="font-semibold mb-1">Verdict mix</h3>
            <p className="text-xs text-[var(--color-muted)] mb-5">How your pipeline breaks down</p>
            <VerdictDonut fit={totals.fit} maybe={totals.maybe} skip={totals.skip}/>
          </div>

          <div className="card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-1">Score distribution</h3>
            <p className="text-xs text-[var(--color-muted)] mb-5">Where most CVs land on the 0–100 scale</p>
            {totals.total === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-12 text-center">No CVs scored yet.</p>
            ) : (
              <div className="flex items-end gap-3 h-52">
                {buckets.map((n, i) => {
                  const pct = maxBucket ? (n / maxBucket) * 100 : 0
                  const share = totals.total ? Math.round((n / totals.total) * 100) : 0
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col items-center group">
                      <div className="text-[11px] font-semibold tabular-nums text-[var(--color-fg)] mb-1.5">{n}</div>
                      <div className="relative w-full flex-1 flex items-end rounded-lg overflow-hidden bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] border border-[var(--color-border)]">
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-2)] shadow-[0_-4px_20px_-4px_var(--color-primary-2)] transition-all duration-500 ease-out group-hover:brightness-110"
                          style={{ height: `${pct}%`, minHeight: n ? 8 : 0, opacity: 0.55 + i * 0.11 }}
                        />
                        <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-card)]/90 border border-[var(--color-border)] backdrop-blur">
                            {share}%
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--color-muted)] mt-2 tabular-nums">{bucketLabels[i]}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity chart */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold">Screening activity</h3>
              <p className="text-xs text-[var(--color-muted)] mt-1">CVs scored — last 14 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <TrendingUp size={14} className="text-[var(--color-primary-2)]"/>
              <span>{days.reduce((s, d) => s + d.count, 0)} CVs this period</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div className="w-full rounded-t bg-gradient-to-t from-[var(--color-primary)]/60 to-[var(--color-primary-2)] hover:from-[var(--color-primary)] transition"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 1 }}/>
                <div className="text-[9px] text-[var(--color-muted)]">{d.label}</div>
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none text-[10px] bg-[var(--color-card)] border border-[var(--color-border)] rounded px-2 py-0.5 whitespace-nowrap z-10">
                  {d.full}: {d.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top candidates leaderboard */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award size={16} className="text-[var(--color-primary-2)]"/>
              <h3 className="font-semibold">Top candidates</h3>
            </div>
            {topCandidates.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No CVs scored yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topCandidates.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] transition">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-300' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/30 text-orange-300' : 'bg-[var(--color-card)] text-[var(--color-muted)]'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name || c.file_name || 'Unnamed candidate'}</div>
                      <div className="text-[11px] text-[var(--color-muted)] truncate">{(c.skills ?? []).slice(0, 3).join(' · ') || '—'}</div>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-300' : 'text-[var(--color-muted)]'}`}>{c.score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-1">Top skills across CVs</h3>
            <p className="text-xs text-[var(--color-muted)] mb-5">What your pipeline brings to the table</p>
            <div className="space-y-2.5">
              {topSkills.length === 0 && <p className="text-sm text-[var(--color-muted)]">No data yet.</p>}
              {topSkills.map(([s, n]) => (
                <div key={s} className="group text-sm">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="font-medium text-[var(--color-fg)] leading-tight break-words" title={s}>{s}</span>
                    <span className="text-xs tabular-nums font-semibold text-[var(--color-fg)]/80 shrink-0">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-2)] transition-all duration-500 group-hover:brightness-110"
                      style={{ width: `${(n / topSkills[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gaps */}
        <div className="card p-6">
          <h3 className="font-semibold mb-1">Most common gaps</h3>
          <p className="text-xs text-[var(--color-muted)] mb-5">Skills missing across your pipeline — useful for sourcing decisions</p>
          {topGaps.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topGaps.map(([g, n]) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-100 shadow-sm hover:bg-amber-500/25 transition"
                >
                  <span className="leading-snug">{g}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-950 dark:text-amber-50 tabular-nums">×{n}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function TimeSavedHero({ minutesSaved, total, fitRate, screeningCount }: { minutesSaved: number; total: number; fitRate: number; screeningCount: number }) {
  // Smooth animated counter — starts from current value and ticks forward at
  // a tiny rate so the number feels live, even on an idle dashboard.
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const targetRef = useRef(minutesSaved)
  targetRef.current = minutesSaved

  useEffect(() => {
    let raf = 0
    const animate = (ts: number) => {
      if (startRef.current == null) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000
      // Ease-out cap: hit target in ~1.2s, then drift up 1 minute per 60s viewed.
      const progress = Math.min(1, elapsed / 1.2)
      const eased = 1 - Math.pow(1 - progress, 3)
      const drift = Math.max(0, elapsed - 1.2) / 60
      setDisplay(targetRef.current * eased + drift)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  const totalSeconds = Math.floor(display * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const workDays = (display / 60 / 8).toFixed(1)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-card))] via-[var(--color-card)] to-[var(--color-card)] p-6 md:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--color-primary)]/20 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[var(--color-primary-2)]/15 blur-3xl"/>
      <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"/>
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold">Live · Time saved</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <Clock size={28} className="text-[var(--color-primary-2)] mb-1"/>
            <span className="text-4xl md:text-6xl font-extrabold tabular-nums gradient-text leading-none">
              {hours.toLocaleString()}<span className="text-[var(--color-muted)] text-2xl md:text-3xl font-bold">h</span>
              {' '}{minutes.toString().padStart(2, '0')}<span className="text-[var(--color-muted)] text-2xl md:text-3xl font-bold">m</span>
              {' '}<span className="text-2xl md:text-3xl font-bold text-[var(--color-fg)]/80">{seconds.toString().padStart(2, '0')}<span className="text-[var(--color-muted)] text-base">s</span></span>
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-xl">
            Manual CV review averages <span className="text-[var(--color-fg)] font-semibold">~{MINUTES_SAVED_PER_CV} min</span> per resume.
            You've put <span className="text-[var(--color-fg)] font-semibold">{total.toLocaleString()}</span> CVs through HireBest — that's roughly
            {' '}<span className="text-[var(--color-fg)] font-semibold">{workDays}</span> full work-days back in your week.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:min-w-[180px]">
          <MiniMetric label="Screenings" value={screeningCount}/>
          <MiniMetric label="CVs scored" value={total}/>
          <MiniMetric label="Fit rate" value={`${fitRate}%`}/>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_3%,transparent)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  )
}

function Stat({ icon, label, value, sub, accent, iconColor }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; accent: string; iconColor: string }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${accent} blur-2xl`}/>
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
          <div className="text-3xl font-bold mt-2 tabular-nums">{value}</div>
          {sub && <div className="text-[11px] text-[var(--color-muted)] mt-1">{sub}</div>}
        </div>
        <div className={`w-9 h-9 rounded-lg bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center ${iconColor}`}>{icon}</div>
      </div>
    </div>
  )
}

function VerdictDonut({ fit, maybe, skip }: { fit: number; maybe: number; skip: number }) {
  const total = fit + maybe + skip
  if (total === 0) return <p className="text-sm text-[var(--color-muted)] py-8 text-center">No CVs scored yet.</p>
  const r = 56
  const c = 2 * Math.PI * r
  const fitPct = fit / total
  const maybePct = maybe / total
  const skipPct = skip / total

  const fitLen = c * fitPct
  const maybeLen = c * maybePct
  const skipLen = c * skipPct

  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="color-mix(in srgb, var(--color-fg) 6%, transparent)" strokeWidth="14"/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgb(52 211 153)" strokeWidth="14"
          strokeDasharray={`${fitLen} ${c - fitLen}`} strokeDashoffset="0" strokeLinecap="butt"/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgb(251 191 36)" strokeWidth="14"
          strokeDasharray={`${maybeLen} ${c - maybeLen}`} strokeDashoffset={`${-fitLen}`} strokeLinecap="butt"/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgb(148 163 184)" strokeWidth="14"
          strokeDasharray={`${skipLen} ${c - skipLen}`} strokeDashoffset={`${-(fitLen + maybeLen)}`} strokeLinecap="butt"/>
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central" className="fill-[var(--color-fg)]" style={{ fontSize: 22, fontWeight: 700 }} transform="rotate(90 70 70)">{total}</text>
      </svg>
      <div className="space-y-2 text-sm flex-1">
        <Legend dot="bg-emerald-400" label="Fit" n={fit} pct={Math.round(fitPct * 100)}/>
        <Legend dot="bg-amber-400" label="Maybe" n={maybe} pct={Math.round(maybePct * 100)}/>
        <Legend dot="bg-slate-400" label="Skip" n={skip} pct={Math.round(skipPct * 100)}/>
      </div>
    </div>
  )
}

function Legend({ dot, label, n, pct }: { dot: string; label: string; n: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`}/>
      <span className="text-[var(--color-fg)] flex-1">{label}</span>
      <span className="text-[var(--color-muted)] text-xs tabular-nums">{n} · {pct}%</span>
    </div>
  )
}
