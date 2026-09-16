import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, ArrowUpRight, Clock, Target, CheckCircle2, FileText, Sparkles,
  TrendingUp, TrendingDown, Minus, Trophy, Upload, Wand2, ListChecks,
} from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import { Skeleton } from '../../components/Skeleton'
import { useAuth } from '../../lib/auth'
import { loadQuota, type QuotaState } from '../../lib/quota'
import { listScreeningsWithStats, listCandidatesIn, type Candidate, type ScreeningStats } from '../../lib/screenings'

/** Minutes a recruiter spends hand-reviewing one CV (LinkedIn 2023 / SHRM ≈ 6–8). */
const MINUTES_PER_CV = 7

export default function Overview() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [screenings, setScreenings] = useState<ScreeningStats[]>([])
  const [cands, setCands] = useState<Candidate[]>([])
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ss = await listScreeningsWithStats(50)
      if (!alive) return
      setScreenings(ss)
      const cs = await listCandidatesIn(ss.map(s => s.id))
      if (!alive) return
      setCands(cs)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [user?.id])

  useEffect(() => { if (profile) loadQuota(profile).then(setQuota) }, [profile])

  const stats = useMemo(() => {
    const total = cands.length
    const fit = cands.filter(c => c.verdict === 'Fit').length
    const shortlisted = cands.filter(c => c.status === 'shortlisted').length
    const avg = total ? Math.round(cands.reduce((s, c) => s + c.score, 0) / total) : 0

    // Trailing 7 days vs the 7 before it — the delta that makes a KPI readable.
    const now = Date.now()
    const day = 86_400_000
    const inWindow = (c: Candidate, from: number, to: number) => {
      const t = +new Date(c.created_at)
      return t >= from && t < to
    }
    const last7 = cands.filter(c => inWindow(c, now - 7 * day, now)).length
    const prev7 = cands.filter(c => inWindow(c, now - 14 * day, now - 7 * day)).length
    const delta = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100)

    const minutes = total * MINUTES_PER_CV
    return {
      total, fit, shortlisted, avg, last7, delta,
      fitRate: total ? Math.round((fit / total) * 100) : 0,
      hours: Math.floor(minutes / 60),
      mins: minutes % 60,
    }
  }, [cands])

  const spark = useMemo(() => {
    const day = 86_400_000
    const start = new Date(); start.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, i) => {
      const from = +start - (13 - i) * day
      const to = from + day
      const count = cands.filter(c => {
        const t = +new Date(c.created_at)
        return t >= from && t < to
      }).length
      return { count, label: new Date(from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [cands])

  const topCandidates = useMemo(
    () => [...cands].sort((a, b) => b.score - a.score).slice(0, 5),
    [cands],
  )
  const screeningOf = (id: string) => screenings.find(s => s.id === id)

  const firstName = (profile?.full_name || user?.email || '').split(/[@ ]/)[0]
  const greeting = getGreeting()

  if (loading) {
    return (
      <>
        <DashboardTopBar title="Overview"/>
        <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-5">
          <Skeleton className="h-28 w-full rounded-2xl"/>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl"/>)}
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl"/>)}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardTopBar
        title="Overview"
        subtitle={screenings.length ? `${screenings.length} screening${screenings.length === 1 ? '' : 's'} · ${stats.total} CVs scored` : 'Your hiring command center'}
        actions={
          <Link to="/dashboard/new" className="btn-primary h-8 px-3 text-xs"><Plus size={13}/>New screening</Link>
        }
      />

      <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-5">

        {/* ── Greeting + quota ─────────────────────────────────────── */}
        <section className="panel rise relative overflow-hidden p-5 md:p-7" style={{ '--d': '0ms' } as React.CSSProperties}>
          <div className="pointer-events-none absolute -top-28 -right-16 w-80 h-80 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"/>
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="eyebrow">{greeting}</div>
              <h2 className="text-2xl md:text-[2rem] font-semibold tracking-[-0.025em] mt-1.5 capitalize">
                {firstName || 'there'}
              </h2>
              <p className="text-sm text-[var(--color-muted)] mt-2 max-w-lg">
                {stats.total > 0
                  ? <>You've screened <span className="text-[var(--color-fg)] font-medium tabular">{stats.total}</span> CVs and saved roughly <span className="text-[var(--color-fg)] font-medium tabular">{stats.hours}h {String(stats.mins).padStart(2, '0')}m</span> of manual review.</>
                  : <>Paste a job description, drop in a batch of CVs, and get a ranked shortlist in minutes.</>}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Link to="/dashboard/new" className="btn-primary text-xs"><Plus size={13}/>New screening</Link>
                <Link to="/dashboard/analytics" className="btn-ghost text-xs">View analytics<ArrowUpRight size={13}/></Link>
              </div>
            </div>

            {quota && !quota.unlimited && (
              <div className="w-full lg:w-72 shrink-0">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="eyebrow">Plan usage</span>
                  <span className="text-xs text-[var(--color-muted)] tabular">
                    <span className="text-[var(--color-fg)] font-medium">{quota.used}</span> / {quota.limit}
                  </span>
                </div>
                <div className="meter">
                  <span style={{
                    width: `${Math.min(100, quota.pct)}%`,
                    background: quota.pct >= 90 ? 'var(--color-skip)' : quota.pct >= 70 ? 'var(--color-viz-maybe)' : 'var(--color-primary)',
                  }}/>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-[var(--color-muted)]">{quota.remaining} CVs left</span>
                  <Link to="/pricing" className="btn-link text-[11px]">Upgrade<ArrowUpRight size={11}/></Link>
                </div>
              </div>
            )}
            {quota?.unlimited && (
              <div className="w-full lg:w-72 shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-4">
                <div className="flex items-center gap-2 text-[var(--color-primary-2)] text-sm font-medium">
                  <Sparkles size={14}/>Unlimited screenings
                </div>
                <p className="text-[11px] text-[var(--color-muted)] mt-1">No cap on this plan — screen as many CVs as you need.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── KPI row ──────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi d={40} icon={<FileText size={15}/>} label="CVs reviewed" value={stats.total}
               foot={<Delta value={stats.delta} suffix="vs prev. 7 days"/>}/>
          <Kpi d={80} icon={<CheckCircle2 size={15}/>} label="Fit candidates" value={stats.fit} tone="fit"
               foot={<span className="text-[11px] text-[var(--color-muted)]">{stats.fitRate}% of pipeline</span>}/>
          <Kpi d={120} icon={<Target size={15}/>} label="Avg match score" value={stats.avg}
               foot={<span className="text-[11px] text-[var(--color-muted)]">out of 100</span>}/>
          <Kpi d={160} icon={<Clock size={15}/>} label="Time saved" value={`${stats.hours}h`}
               foot={<span className="text-[11px] text-[var(--color-muted)]">≈ {(stats.hours / 8).toFixed(1)} work-days</span>}/>
        </section>

        {/* ── Activity + leaderboard ───────────────────────────────── */}
        <section className="grid lg:grid-cols-3 gap-5">
          <div className="panel rise lg:col-span-2" style={{ '--d': '200ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Screening activity</div>
                <div className="panel-sub">CVs scored per day · last 14 days</div>
              </div>
              <span className="text-xs text-[var(--color-muted)] tabular">{stats.last7} in the last 7 days</span>
            </div>
            <div className="p-5">
              <Sparkbars data={spark}/>
            </div>
          </div>

          <div className="panel rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Top candidates</div>
                <div className="panel-sub">Highest match across all screenings</div>
              </div>
              <Trophy size={15} className="text-[var(--color-muted)]"/>
            </div>
            <div className="p-3">
              {topCandidates.length === 0 ? (
                <div className="empty">
                  <span className="empty-icon"><Trophy size={18}/></span>
                  <p className="text-sm text-[var(--color-muted)]">No candidates scored yet.</p>
                </div>
              ) : topCandidates.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => nav(`/dashboard/results/${c.screening_id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] transition text-left"
                >
                  <span className="w-6 h-6 rounded-md bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] text-[11px] font-semibold text-[var(--color-muted)] flex items-center justify-center tabular">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm truncate">{c.name || c.file_name || 'Unnamed'}</span>
                    <span className="block text-[11px] text-[var(--color-muted)] truncate">{screeningOf(c.screening_id)?.name ?? '—'}</span>
                  </span>
                  <ScorePip score={c.score}/>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent screenings ────────────────────────────────────── */}
        <section className="panel rise" style={{ '--d': '300ms' } as React.CSSProperties}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Recent screenings</div>
              <div className="panel-sub">Every batch you've run, with its verdict mix</div>
            </div>
            <Link to="/dashboard/new" className="btn-ghost text-xs"><Plus size={12}/>New</Link>
          </div>

          {screenings.length === 0 ? (
            <GettingStarted onStart={() => nav('/dashboard/new')}/>
          ) : (
            <div className="p-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {screenings.slice(0, 9).map(s => (
                <Link key={s.id} to={`/dashboard/results/${s.id}`} className="panel panel-hover p-4 block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-[11px] text-[var(--color-muted)] mt-0.5">{relativeTime(s.created_at)}</div>
                    </div>
                    <span className="text-xs tabular text-[var(--color-muted)] shrink-0">{s.total} CVs</span>
                  </div>

                  <VerdictBar fit={s.fit} maybe={s.maybe} skip={s.skip}/>

                  <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)] mt-2.5">
                    <span className="flex items-center gap-3">
                      <LegendDot color="var(--color-viz-fit)" label={`${s.fit} fit`}/>
                      <LegendDot color="var(--color-viz-maybe)" label={`${s.maybe} maybe`}/>
                      <LegendDot color="var(--color-viz-skip)" label={`${s.skip} skip`}/>
                    </span>
                    <span className="tabular">avg {s.avgScore}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

/* ── pieces ──────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function relativeTime(iso: string) {
  const diff = Date.now() - +new Date(iso)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function Kpi({ icon, label, value, foot, tone, d = 0 }: {
  icon: React.ReactNode; label: string; value: number | string; foot?: React.ReactNode; tone?: 'fit'; d?: number
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
      <div className="mt-2">{foot}</div>
    </div>
  )
}

function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value > 0, flat = value === 0
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  const color = flat ? 'var(--color-muted)' : up ? 'var(--color-viz-fit)' : 'var(--color-viz-maybe)'
  return (
    <span className="text-[11px] text-[var(--color-muted)] inline-flex items-center gap-1.5">
      <Icon size={12} style={{ color }}/>
      <span className="tabular" style={{ color }}>{flat ? '0%' : `${up ? '+' : ''}${value}%`}</span>
      {suffix}
    </span>
  )
}

function ScorePip({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--color-viz-fit)' : score >= 60 ? 'var(--color-viz-maybe)' : 'var(--color-muted)'
  return <span className="text-sm font-semibold tabular shrink-0" style={{ color }}>{score}</span>
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>{label}
    </span>
  )
}

/** Stacked verdict share. 2px surface gaps keep segments separable in CVD. */
function VerdictBar({ fit, maybe, skip }: { fit: number; maybe: number; skip: number }) {
  const total = fit + maybe + skip
  if (total === 0) return <div className="meter mt-3"/>
  const seg = (n: number, color: string, label: string) => (
    n > 0 ? <span title={label} style={{ width: `${(n / total) * 100}%`, background: color }} className="h-full block"/> : null
  )
  return (
    <div className="mt-3 h-1.5 rounded-full overflow-hidden flex gap-[2px] bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)]">
      {seg(fit, 'var(--color-viz-fit)', `${fit} fit`)}
      {seg(maybe, 'var(--color-viz-maybe)', `${maybe} maybe`)}
      {seg(skip, 'var(--color-viz-skip)', `${skip} skip`)}
    </div>
  )
}

/** Single-series daily bars — no legend needed, hover carries the values. */
function Sparkbars({ data }: { data: { count: number; label: string }[] }) {
  const max = Math.max(1, ...data.map(d => d.count))
  const empty = data.every(d => d.count === 0)
  if (empty) {
    return (
      <div className="empty py-10">
        <span className="empty-icon"><TrendingUp size={18}/></span>
        <p className="text-sm text-[var(--color-muted)]">No CVs scored in the last 14 days.</p>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => (
        <div key={i} className="bar-col flex-1 h-full flex flex-col items-center group relative">
          <div className="bar-track relative w-full flex-1 flex items-end">
            <div
              className="bar-fill w-full"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0, opacity: 0.55 + (d.count / max) * 0.45 }}
            />
          </div>
          <span className="text-[10px] text-[var(--color-muted-2)] mt-1.5 tabular">{d.label.split(' ')[1]}</span>
          <span className="pointer-events-none absolute -top-8 opacity-0 group-hover:opacity-100 transition text-[11px] px-2 py-1 rounded-md bg-[var(--color-card)] border border-[var(--color-border-strong)] whitespace-nowrap z-10 shadow-lg">
            {d.label} · <span className="tabular font-medium">{d.count}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function GettingStarted({ onStart }: { onStart: () => void }) {
  const steps = [
    { icon: <Wand2 size={16}/>, title: 'Paste a job description', body: 'Or upload the JD as a PDF/DOCX — AI names the screening for you.' },
    { icon: <Upload size={16}/>, title: 'Drop in up to 50 CVs', body: 'PDF, DOCX, PNG or JPG. Scanned resumes are read with vision.' },
    { icon: <ListChecks size={16}/>, title: 'Get a ranked shortlist', body: 'Scores, strengths, gaps and interview questions per candidate.' },
  ]
  return (
    <div className="p-6">
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2.5">
              <span className="icon-badge">{s.icon}</span>
              <span className="eyebrow">Step {i + 1}</span>
            </div>
            <div className="text-sm font-medium mt-3">{s.title}</div>
            <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={onStart} className="btn-primary"><Sparkles size={15}/>Run your first screening</button>
      </div>
    </div>
  )
}
