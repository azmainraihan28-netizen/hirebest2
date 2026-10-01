import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Sparkles, TrendingUp, Target, Zap, Award, FileText, ArrowUpRight } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import PlanGate from '../../components/PlanGate'
import { SkeletonStats, Skeleton } from '../../components/Skeleton'
import { listScreeningsWithStats, listCandidatesIn, type Candidate, type ScreeningStats } from '../../lib/screenings'

// Avg minutes a recruiter spends manually screening one CV. Industry studies
// (LinkedIn 2023, SHRM) put this at 6–8 minutes per resume; we use 7 for the
// "time saved" tile so the headline number stays defensible.
const MINUTES_SAVED_PER_CV = 7

type Range = 7 | 30 | 90 | 'All'
const RANGES: Range[] = [7, 30, 90, 'All']

// Analytics dashboard / hiring analytics are Team-plan features (see /pricing).
export default function DashAnalytics() {
  return (
    <PlanGate feature="analytics" title="The analytics dashboard">
      <DashAnalyticsView />
    </PlanGate>
  )
}

function DashAnalyticsView() {
  const [loading, setLoading] = useState(true)
  const [all, setAll] = useState<Candidate[]>([])
  const [screenings, setScreenings] = useState<ScreeningStats[]>([])
  const [range, setRange] = useState<Range>(30)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // Two round-trips for the whole page: the scoped screening list, then
      // every candidate inside it (previously one query per screening).
      const ss = await listScreeningsWithStats(200)
      if (!alive) return
      setScreenings(ss)
      const cs = await listCandidatesIn(ss.map(s => s.id))
      if (!alive) return
      setAll(cs)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  const inRange = useMemo(() => {
    if (range === 'All') return all
    const from = Date.now() - range * 86_400_000
    return all.filter(c => +new Date(c.created_at) >= from)
  }, [all, range])

  const totals = useMemo(() => {
    const total = inRange.length
    const fit = inRange.filter(c => c.verdict === 'Fit').length
    const maybe = inRange.filter(c => c.verdict === 'Maybe').length
    const skip = inRange.filter(c => c.verdict === 'Skip').length
    const avgScore = total ? Math.round(inRange.reduce((s, c) => s + c.score, 0) / total) : 0
    return {
      total, fit, maybe, skip, avgScore,
      fitRate: total ? Math.round((fit / total) * 100) : 0,
      minutesSaved: total * MINUTES_SAVED_PER_CV,
    }
  }, [inRange])

  const skillRows = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const c of inRange) for (const s of (c.skills ?? [])) freq[s] = (freq[s] ?? 0) + 1
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [inRange])

  const gapRows = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const c of inRange) for (const g of (c.gaps ?? [])) freq[g] = (freq[g] ?? 0) + 1
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [inRange])

  const buckets = useMemo(() => {
    const b = [0, 0, 0, 0, 0]
    for (const c of inRange) b[Math.min(4, Math.floor(c.score / 20))]++
    return b
  }, [inRange])
  const bucketLabels = ['0–19', '20–39', '40–59', '60–79', '80–100']

  const days = useMemo(() => {
    const span = range === 'All' ? 30 : range
    const start = new Date(); start.setHours(0, 0, 0, 0)
    return Array.from({ length: span }, (_, i) => {
      const from = +start - (span - 1 - i) * 86_400_000
      const to = from + 86_400_000
      const count = all.filter(c => {
        const t = +new Date(c.created_at)
        return t >= from && t < to
      }).length
      return { count, full: new Date(from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [all, range])

  const topCandidates = useMemo(() => [...inRange].sort((a, b) => b.score - a.score).slice(0, 5), [inRange])
  const busiestScreenings = useMemo(() => [...screenings].sort((a, b) => b.total - a.total).slice(0, 5), [screenings])
  const screeningName = (id: string) => screenings.find(s => s.id === id)?.name ?? '—'

  if (loading) return (
    <>
      <DashboardTopBar title="Analytics"/>
      <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-5">
        <Skeleton className="h-40 w-full rounded-2xl"/>
        <SkeletonStats count={4}/>
        <div className="grid lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-2xl"/>)}
        </div>
      </div>
    </>
  )

  return (
    <>
      <DashboardTopBar
        title="Analytics"
        subtitle={`${screenings.length} screenings · ${all.length} CVs scored all-time`}
      />

      <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-5">

        {/* Filters live in one row above the charts */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="seg">
            {RANGES.map(r => (
              <button key={String(r)} onClick={() => setRange(r)} data-active={range === r} className="seg-item">
                {r === 'All' ? 'All time' : `${r} days`}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[var(--color-muted)]">
            Showing <span className="text-[var(--color-fg)] tabular">{totals.total}</span> CVs
            {range !== 'All' && <> from the last {range} days</>}
          </span>
        </div>

        <TimeSavedHero
          minutesSaved={totals.minutesSaved}
          total={totals.total}
          fitRate={totals.fitRate}
          screeningCount={screenings.length}
        />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat d={40} icon={<FileText size={15}/>} label="CVs reviewed" value={totals.total}/>
          <Stat d={80} icon={<Sparkles size={15}/>} label="Fit candidates" value={totals.fit} tone="fit" sub={`${totals.fitRate}% fit rate`}/>
          <Stat d={120} icon={<Target size={15}/>} label="Avg match score" value={totals.avgScore} sub="out of 100"/>
          <Stat d={160} icon={<Zap size={15}/>} label="Screenings run" value={screenings.length}/>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="panel rise" style={{ '--d': '200ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Verdict mix</div>
                <div className="panel-sub">How the pipeline breaks down</div>
              </div>
            </div>
            <div className="p-5">
              <VerdictDonut fit={totals.fit} maybe={totals.maybe} skip={totals.skip}/>
            </div>
          </div>

          <div className="panel rise lg:col-span-2" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Score distribution</div>
                <div className="panel-sub">Where CVs land on the 0–100 scale</div>
              </div>
              <span className="text-xs text-[var(--color-muted)] tabular">avg {totals.avgScore}</span>
            </div>
            <div className="p-5">
              {totals.total === 0 ? <EmptyNote/> : (
                <div className="flex items-end gap-3 h-52">
                  {buckets.map((n, i) => {
                    const max = Math.max(1, ...buckets)
                    const share = totals.total ? Math.round((n / totals.total) * 100) : 0
                    return (
                      <div key={i} className="bar-col flex-1 h-full flex flex-col items-center group">
                        <div className="text-[11px] font-medium tabular text-[var(--color-fg-dim)] mb-1.5">{n}</div>
                        <div className="bar-col-track w-full flex-1">
                          <div
                            className="bar-fill w-full"
                            style={{ height: `${(n / max) * 100}%`, minHeight: n ? 6 : 0, opacity: 0.5 + i * 0.125 }}
                          />
                          <span className="pointer-events-none absolute inset-x-0 top-1.5 flex justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border-strong)]">{share}%</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-muted-2)] mt-2 tabular">{bucketLabels[i]}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel rise" style={{ '--d': '280ms' } as React.CSSProperties}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Screening activity</div>
              <div className="panel-sub">CVs scored per day · last {range === 'All' ? 30 : range} days</div>
            </div>
            <span className="text-xs text-[var(--color-muted)] inline-flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[var(--color-primary-2)]"/>
              <span className="tabular">{days.reduce((s, d) => s + d.count, 0)}</span> in this period
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-40">
              {days.map((d, i) => {
                const max = Math.max(1, ...days.map(x => x.count))
                return (
                  <div key={i} className="bar-col flex-1 h-full flex flex-col items-center group relative">
                    <div className="bar-col-track w-full flex-1">
                      <div className="bar-fill w-full" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0 }}/>
                    </div>
                    <span className="pointer-events-none absolute -top-8 opacity-0 group-hover:opacity-100 transition text-[11px] px-2 py-1 rounded-md bg-[var(--color-card)] border border-[var(--color-border-strong)] whitespace-nowrap z-10 shadow-lg">
                      {d.full} · <span className="tabular font-medium">{d.count}</span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[var(--color-muted-2)] mt-2 tabular">
              <span>{days[0]?.full}</span><span>{days[days.length - 1]?.full}</span>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="panel rise" style={{ '--d': '320ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div className="panel-title flex items-center gap-2"><Award size={15} className="text-[var(--color-primary-2)]"/>Top candidates</div>
            </div>
            <div className="p-3">
              {topCandidates.length === 0 ? <EmptyNote/> : topCandidates.map((c, i) => (
                <Link
                  key={c.id}
                  to={`/dashboard/results/${c.screening_id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] transition"
                >
                  <span className="w-6 h-6 rounded-md bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] text-[11px] font-semibold text-[var(--color-muted)] flex items-center justify-center tabular">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm truncate">{c.name || c.file_name || 'Unnamed candidate'}</span>
                    <span className="block text-[11px] text-[var(--color-muted)] truncate">{screeningName(c.screening_id)}</span>
                  </span>
                  <span className="text-sm font-semibold tabular" style={{
                    color: c.score >= 80 ? 'var(--color-viz-fit)' : c.score >= 60 ? 'var(--color-viz-maybe)' : 'var(--color-muted)',
                  }}>{c.score}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="panel rise" style={{ '--d': '360ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Top skills across CVs</div>
                <div className="panel-sub">What your pipeline brings to the table</div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {skillRows.length === 0 && <EmptyNote/>}
              {skillRows.map(([s, n]) => (
                <div key={s} className="bar-col">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="text-sm text-[var(--color-fg-dim)] truncate" title={s}>{s}</span>
                    <span className="text-xs tabular text-[var(--color-muted)] shrink-0">{n}</span>
                  </div>
                  <div className="bar-track h-2">
                    <div className="bar-fill h-full" style={{ width: `${(n / skillRows[0][1]) * 100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="panel rise" style={{ '--d': '400ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Most common gaps</div>
                <div className="panel-sub">Missing skills across the pipeline — useful for sourcing</div>
              </div>
            </div>
            <div className="p-5">
              {gapRows.length === 0 ? <EmptyNote/> : (
                <div className="flex flex-wrap gap-2">
                  {gapRows.map(([g, n]) => (
                    <span key={g} className="inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] text-[var(--color-fg-dim)]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-viz-maybe)' }}/>
                      <span className="leading-snug">{g}</span>
                      <span className="count-pill tabular">{n}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel rise" style={{ '--d': '440ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Biggest screenings</div>
                <div className="panel-sub">All-time, by candidates processed</div>
              </div>
            </div>
            <div className="p-3">
              {busiestScreenings.length === 0 ? <EmptyNote/> : busiestScreenings.map(s => (
                <Link key={s.id} to={`/dashboard/results/${s.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] transition group">
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm truncate">{s.name}</span>
                    <span className="block text-[11px] text-[var(--color-muted)]">
                      {s.total} CVs · {s.fit} fit · avg {s.avgScore}
                    </span>
                  </span>
                  <ArrowUpRight size={14} className="text-[var(--color-muted-2)] group-hover:text-[var(--color-fg)] transition shrink-0"/>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

/* ── pieces ──────────────────────────────────────────────────────── */

function EmptyNote() {
  return <p className="text-sm text-[var(--color-muted)] py-8 text-center">Nothing scored in this period yet.</p>
}

function TimeSavedHero({ minutesSaved, total, fitRate, screeningCount }: {
  minutesSaved: number; total: number; fitRate: number; screeningCount: number
}) {
  const hours = Math.floor(minutesSaved / 60)
  const minutes = minutesSaved % 60
  const workDays = (minutesSaved / 60 / 8).toFixed(1)

  return (
    <div className="panel rise relative overflow-hidden p-6 md:p-8" style={{ '--d': '0ms' } as React.CSSProperties}>
      <div className="pointer-events-none absolute -top-28 -right-20 w-80 h-80 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"/>
      <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="eyebrow">Time saved</div>
          <div className="flex items-baseline gap-3 mt-2">
            <Clock size={26} className="text-[var(--color-primary-2)] self-center"/>
            <span className="text-4xl md:text-[3.5rem] font-semibold tabular leading-none tracking-[-0.04em]">
              {hours.toLocaleString()}<span className="text-[var(--color-muted)] text-2xl font-medium">h</span>
              {' '}{minutes.toString().padStart(2, '0')}<span className="text-[var(--color-muted)] text-2xl font-medium">m</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)] max-w-xl leading-relaxed">
            Manual CV review averages <span className="text-[var(--color-fg)] font-medium">~{MINUTES_SAVED_PER_CV} min</span> per resume.
            You've put <span className="text-[var(--color-fg)] font-medium tabular">{total.toLocaleString()}</span> CVs through HireBest — roughly
            {' '}<span className="text-[var(--color-fg)] font-medium tabular">{workDays}</span> full work-days back in your week.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:min-w-[190px]">
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
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_3%,transparent)] px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div className="text-lg font-semibold tabular mt-0.5">{value}</div>
    </div>
  )
}

function Stat({ icon, label, value, sub, tone, d = 0 }: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string; tone?: 'fit'; d?: number
}) {
  return (
    <div className="panel panel-hover rise p-4 md:p-5" style={{ '--d': `${d}ms` } as React.CSSProperties}>
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--color-fg) 5%, transparent)',
            color: tone === 'fit' ? 'var(--color-viz-fit)' : 'var(--color-primary-2)',
          }}
        >{icon}</span>
      </div>
      <div className="text-[1.9rem] md:text-[2.15rem] font-semibold tabular leading-none mt-3 tracking-[-0.03em]">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-muted)] mt-2">{sub}</div>}
    </div>
  )
}

/** Donut with a 2px surface gap between segments and a labelled legend. */
function VerdictDonut({ fit, maybe, skip }: { fit: number; maybe: number; skip: number }) {
  const total = fit + maybe + skip
  if (total === 0) return <EmptyNote/>
  const r = 54
  const c = 2 * Math.PI * r
  const gap = 2
  const seg = (n: number) => Math.max(0, (n / total) * c - gap)

  const fitLen = seg(fit)
  const maybeLen = seg(maybe)
  const skipLen = seg(skip)
  const fitOffset = 0
  const maybeOffset = -(fit / total) * c
  const skipOffset = -((fit + maybe) / total) * c

  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90 shrink-0" role="img" aria-label={`Fit ${fit}, Maybe ${maybe}, Skip ${skip}`}>
        <circle cx="68" cy="68" r={r} fill="none" strokeWidth="13" stroke="color-mix(in srgb, var(--color-fg) 6%, transparent)"/>
        <circle cx="68" cy="68" r={r} fill="none" strokeWidth="13" stroke="var(--color-viz-fit)" strokeDasharray={`${fitLen} ${c - fitLen}`} strokeDashoffset={fitOffset}/>
        <circle cx="68" cy="68" r={r} fill="none" strokeWidth="13" stroke="var(--color-viz-maybe)" strokeDasharray={`${maybeLen} ${c - maybeLen}`} strokeDashoffset={maybeOffset}/>
        <circle cx="68" cy="68" r={r} fill="none" strokeWidth="13" stroke="var(--color-viz-skip)" strokeDasharray={`${skipLen} ${c - skipLen}`} strokeDashoffset={skipOffset}/>
        <text x="68" y="68" textAnchor="middle" dominantBaseline="central" transform="rotate(90 68 68)"
          className="fill-[var(--color-fg)]" style={{ fontSize: 21, fontWeight: 600 }}>{total}</text>
      </svg>
      <div className="space-y-2.5 text-sm flex-1 min-w-[150px]">
        <Legend color="var(--color-viz-fit)" label="Fit" n={fit} pct={Math.round((fit / total) * 100)}/>
        <Legend color="var(--color-viz-maybe)" label="Maybe" n={maybe} pct={Math.round((maybe / total) * 100)}/>
        <Legend color="var(--color-viz-skip)" label="Skip" n={skip} pct={Math.round((skip / total) * 100)}/>
      </div>
    </div>
  )
}

function Legend({ color, label, n, pct }: { color: string; label: string; n: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }}/>
      <span className="text-[var(--color-fg-dim)] flex-1">{label}</span>
      <span className="text-[var(--color-muted)] text-xs tabular">{n} · {pct}%</span>
    </div>
  )
}
