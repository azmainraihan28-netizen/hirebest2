import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Search, Download, Mail, Plus, GitCompare, FileDown, X, ChevronDown,
  Briefcase, Users, SlidersHorizontal,
} from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import CandidateRow from '../../components/dashboard/CandidateRow'
import InterviewQsModal from '../../components/dashboard/InterviewQsModal'
import CompareModal from '../../components/dashboard/CompareModal'
import { SkeletonRow, Skeleton } from '../../components/Skeleton'
import { getScreening, listCandidates, countMyCandidates, type Candidate, type Screening } from '../../lib/screenings'
import { pdf } from '@react-pdf/renderer'
import { computeReportStats, ScreeningReportDocument } from '../../lib/reportPdf'

type Tab = 'All' | 'Fit' | 'Maybe' | 'Skip' | 'Shortlisted'
type Sort = 'Score' | 'Name' | 'Date' | 'Experience'
type ShowLimit = 10 | 25 | 50 | 100 | 'All'

const TABS: { key: Tab; tone?: 'fit' | 'maybe' | 'skip' }[] = [
  { key: 'All' }, { key: 'Fit', tone: 'fit' }, { key: 'Maybe', tone: 'maybe' },
  { key: 'Skip', tone: 'skip' }, { key: 'Shortlisted' },
]

export default function Results() {
  const { id } = useParams()
  const nav = useNavigate()
  const [screening, setScreening] = useState<Screening | null>(null)
  const [cands, setCands] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('Score')
  const [showLimit, setShowLimit] = useState<ShowLimit>(25)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [openQs, setOpenQs] = useState<Candidate | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [used, setUsed] = useState(0)
  const [reportBusy, setReportBusy] = useState(false)
  const [jdOpen, setJdOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setSel(new Set())
    Promise.all([getScreening(id), listCandidates(id), countMyCandidates()]).then(([s, c, u]) => {
      setScreening(s); setCands(c); setUsed(u); setLoading(false)
    })
  }, [id])

  // "/" focuses search, like every tool a recruiter already lives in.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key === '/' && !typing) { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) searchRef.current?.blur()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const counts = useMemo(() => ({
    All: cands.length,
    Fit: cands.filter(c => c.verdict === 'Fit').length,
    Maybe: cands.filter(c => c.verdict === 'Maybe').length,
    Skip: cands.filter(c => c.verdict === 'Skip').length,
    Shortlisted: cands.filter(c => c.status === 'shortlisted').length,
  }), [cands])

  const avgScore = useMemo(
    () => (cands.length ? Math.round(cands.reduce((s, c) => s + c.score, 0) / cands.length) : 0),
    [cands],
  )

  const filtered = useMemo(() => {
    let r = tab === 'All' ? cands
      : tab === 'Shortlisted' ? cands.filter(c => c.status === 'shortlisted')
      : cands.filter(c => c.verdict === tab)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      r = r.filter(c =>
        (c.name ?? '').toLowerCase().includes(needle) ||
        (c.email ?? '').toLowerCase().includes(needle) ||
        (c.skills ?? []).some(s => s.toLowerCase().includes(needle))
      )
    }
    const sorted = [...r]
    if (sort === 'Score') sorted.sort((a, b) => b.score - a.score)
    if (sort === 'Name') sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    if (sort === 'Date') sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    if (sort === 'Experience') sorted.sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0))
    return sorted
  }, [cands, tab, q, sort])

  const visible = useMemo(() => (
    showLimit === 'All' ? filtered : filtered.slice(0, showLimit)
  ), [filtered, showLimit])

  const toggleSel = (rowId: string, val: boolean) => {
    setSel(s => { const n = new Set(s); val ? n.add(rowId) : n.delete(rowId); return n })
  }
  const allVisibleSelected = visible.length > 0 && visible.every(c => sel.has(c.id))
  const toggleAllVisible = () => {
    setSel(s => {
      const n = new Set(s)
      if (allVisibleSelected) visible.forEach(c => n.delete(c.id))
      else visible.forEach(c => n.add(c.id))
      return n
    })
  }

  const handleStatusChange = (rowId: string, status: Candidate['status']) => {
    setCands(cs => cs.map(c => c.id === rowId ? { ...c, status, status_email_sent: true } : c))
  }

  const downloadPdfReport = async () => {
    if (reportBusy || filtered.length === 0) return
    setReportBusy(true)
    try {
      const stats = computeReportStats(filtered)
      let aiSummary = ''
      try {
        const res = await fetch('/api/report-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            screeningName: screening?.name,
            total: stats.total,
            fit: stats.fit,
            maybe: stats.maybe,
            skip: stats.skip,
            avgScore: stats.avgScore,
            topSkills: stats.topSkills,
            topGaps: stats.topGaps,
            scoreBuckets: stats.scoreBuckets,
          }),
        })
        if (res.ok) aiSummary = (await res.json()).summary ?? ''
      } catch { /* AI summary is best-effort; report still renders without it */ }

      let blob: Blob
      try {
        blob = await pdf(
          <ScreeningReportDocument
            screeningName={screening?.name ?? 'Screening'}
            generatedAt={new Date().toLocaleDateString()}
            stats={stats}
            aiSummary={aiSummary}
            candidates={filtered}
          />
        ).toBlob()
      } catch (e: any) {
        console.error('PDF report generation failed', e)
        alert(`Failed to build PDF report: ${e?.message ?? 'unknown error'}`)
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${screening?.name ?? 'screening'}-report.pdf`
      a.click(); URL.revokeObjectURL(url)
    } finally {
      setReportBusy(false)
    }
  }

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Score', 'Verdict', 'Status', 'Experience', 'Skills', 'Summary'],
      ...filtered.map(c => [c.name ?? '', c.email ?? '', String(c.score), c.verdict, c.status, String(c.experience_years ?? ''), (c.skills ?? []).join('; '), (c.summary ?? '').replace(/\n/g, ' ')]),
    ]
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${screening?.name ?? 'screening'}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const emailSelected = () => {
    const emails = cands.filter(c => sel.has(c.id)).map(c => c.email).filter(Boolean).join(',')
    if (!emails) return alert('Select candidates with an email address first.')
    window.location.href = `mailto:?bcc=${emails}&subject=Interview opportunity`
  }

  const openCompare = () => {
    if (sel.size < 2) return alert('Select at least 2 candidates to compare.')
    if (sel.size > 4) return alert('Compare up to 4 candidates at a time.')
    setCompareOpen(true)
  }

  if (loading) return (
    <>
      <DashboardTopBar title="Loading…"/>
      <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-5">
        <Skeleton className="h-24 w-full rounded-2xl"/>
        <div className="panel p-5 space-y-3"><SkeletonRow/><SkeletonRow/><SkeletonRow/></div>
      </div>
    </>
  )

  if (!screening) return (
    <>
      <DashboardTopBar title="Not found"/>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="panel empty">
          <span className="empty-icon"><Users size={18}/></span>
          <p className="text-sm text-[var(--color-muted)]">This screening doesn't exist, or it belongs to another account.</p>
          <button onClick={() => nav('/dashboard')} className="btn-ghost text-xs mt-1">Back to overview</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <DashboardTopBar
        title={screening.name}
        subtitle={`${counts.All} CVs · ${counts.Fit} fit · avg ${avgScore}/100 · ${new Date(screening.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
        used={used}
        actions={
          <button onClick={() => nav('/dashboard/new')} className="btn-primary h-8 px-3 text-xs"><Plus size={13}/><span className="hidden sm:inline">New</span></button>
        }
      />

      <div className="p-4 md:p-6 max-w-[88rem] mx-auto space-y-4">

        {/* ── Verdict summary ──────────────────────────────────────── */}
        <section className="panel rise p-4 md:p-5" style={{ '--d': '0ms' } as React.CSSProperties}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Summary label="Candidates" value={counts.All}/>
            <Summary label="Fit" value={counts.Fit} color="var(--color-viz-fit)"/>
            <Summary label="Maybe" value={counts.Maybe} color="var(--color-viz-maybe)"/>
            <Summary label="Skip" value={counts.Skip} color="var(--color-viz-skip)"/>
            <Summary label="Shortlisted" value={counts.Shortlisted}/>
            <Summary label="Avg score" value={avgScore} suffix="/100"/>
            <div className="flex-1 min-w-[200px]">
              <div className="h-2 rounded-full overflow-hidden flex gap-[2px] bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)]">
                {counts.Fit > 0 && <span className="h-full block" style={{ width: `${(counts.Fit / Math.max(1, counts.All)) * 100}%`, background: 'var(--color-viz-fit)' }}/>}
                {counts.Maybe > 0 && <span className="h-full block" style={{ width: `${(counts.Maybe / Math.max(1, counts.All)) * 100}%`, background: 'var(--color-viz-maybe)' }}/>}
                {counts.Skip > 0 && <span className="h-full block" style={{ width: `${(counts.Skip / Math.max(1, counts.All)) * 100}%`, background: 'var(--color-viz-skip)' }}/>}
              </div>
              <button onClick={() => setJdOpen(o => !o)} className="mt-2.5 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-fg)] inline-flex items-center gap-1.5 transition">
                <Briefcase size={12}/>Job description
                <ChevronDown size={12} className={`transition ${jdOpen ? 'rotate-180' : ''}`}/>
              </button>
            </div>
          </div>

          {jdOpen && (
            <pre className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_55%,transparent)] p-4 text-xs leading-relaxed text-[var(--color-fg-dim)] font-mono">
              {screening.jd}
            </pre>
          )}
        </section>

        {/* ── Toolbar ──────────────────────────────────────────────── */}
        <section className="panel rise" style={{ '--d': '60ms' } as React.CSSProperties}>
          <div className="p-3 md:p-4 flex flex-wrap items-center gap-2 border-b border-[var(--color-border)]">
            <div className="seg overflow-x-auto max-w-full">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} data-active={tab === t.key} data-tone={t.tone} className="seg-item">
                  {t.key}<span className="count-pill">{counts[t.key]}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 min-w-[150px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"/>
              <input
                ref={searchRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search name, email or skill"
                className="field pl-9 pr-9 py-1.5 text-sm"
              />
              {q
                ? <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6" aria-label="Clear search"><X size={12}/></button>
                : <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex">/</kbd>}
            </div>

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-[var(--color-muted-2)] hidden md:block"/>
              <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="field text-xs py-1.5 w-auto" aria-label="Sort candidates">
                <option value="Score">Score</option>
                <option value="Name">Name</option>
                <option value="Date">Date added</option>
                <option value="Experience">Experience</option>
              </select>
              <select
                value={String(showLimit)}
                onChange={e => setShowLimit(e.target.value === 'All' ? 'All' : (Number(e.target.value) as ShowLimit))}
                className="field text-xs py-1.5 w-auto"
                aria-label="Rows to show"
              >
                <option value="10">Top 10</option>
                <option value="25">Top 25</option>
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
                <option value="All">All</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={exportCsv} className="icon-btn tt" data-tip="Export CSV"><Download size={15}/></button>
              <button onClick={downloadPdfReport} disabled={reportBusy} className="icon-btn tt" data-tip={reportBusy ? 'Building report…' : 'PDF report'}><FileDown size={15}/></button>
              <button onClick={openCompare} className="icon-btn tt" data-tip="Compare selected"><GitCompare size={15}/></button>
              <button onClick={emailSelected} className="icon-btn tt" data-tip="Email selected"><Mail size={15}/></button>
            </div>
          </div>

          {/* Column header / select-all */}
          <div className="px-4 py-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted-2)] border-b border-[var(--color-border)]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              aria-label="Select all visible candidates"
              className="accent-[var(--color-primary)]"
            />
            <span className="flex-1">Candidate</span>
            <span className="hidden lg:block w-56">Skills</span>
            <span className="w-14 text-center">Score</span>
            <span className="w-16 text-center hidden sm:block">Verdict</span>
            <span className="w-[8.5rem] text-right hidden md:block">Decision</span>
          </div>

          <div className="p-3 space-y-2">
            {filtered.length === 0 && (
              <div className="empty">
                <span className="empty-icon"><Users size={18}/></span>
                <p className="text-sm text-[var(--color-muted)]">
                  {q ? <>No candidate matches “{q}”.</> : <>Nothing in the {tab.toLowerCase()} bucket yet.</>}
                </p>
                {(q || tab !== 'All') && (
                  <button onClick={() => { setQ(''); setTab('All') }} className="btn-ghost text-xs">Clear filters</button>
                )}
              </div>
            )}

            {visible.map((c, i) => (
              <div key={c.id} className="rise" style={{ '--d': `${Math.min(i, 12) * 22}ms` } as React.CSSProperties}>
                <CandidateRow
                  c={c}
                  rank={sort === 'Score' ? filtered.indexOf(c) + 1 : undefined}
                  selected={sel.has(c.id)}
                  onSelect={toggleSel}
                  onOpenQs={setOpenQs}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}

            {filtered.length > visible.length && (
              <button
                onClick={() => setShowLimit('All')}
                className="w-full py-3 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] transition"
              >
                Showing {visible.length} of {filtered.length} — show all
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ── Selection action bar ───────────────────────────────────── */}
      {sel.size > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-1">
          <div className="panel flex items-center gap-2 py-2 pl-4 pr-2 shadow-[var(--shadow-elev)] backdrop-blur">
            <span className="text-xs text-[var(--color-muted)] whitespace-nowrap">
              <span className="text-[var(--color-fg)] font-semibold tabular">{sel.size}</span> selected
            </span>
            <span className="w-px h-5 bg-[var(--color-border)]"/>
            <button onClick={openCompare} className="btn-ghost text-xs"><GitCompare size={12}/>Compare</button>
            <button onClick={emailSelected} className="btn-ghost text-xs"><Mail size={12}/>Email</button>
            <button onClick={() => setSel(new Set())} className="icon-btn" aria-label="Clear selection"><X size={14}/></button>
          </div>
        </div>
      )}

      {openQs && <InterviewQsModal candidate={openQs} jd={screening.jd} onClose={() => setOpenQs(null)}/>}
      {compareOpen && (
        <CompareModal candidates={cands.filter(c => sel.has(c.id))} onClose={() => setCompareOpen(false)}/>
      )}
    </>
  )
}

function Summary({ label, value, color, suffix }: { label: string; value: number; color?: string; suffix?: string }) {
  return (
    <div>
      <div className="eyebrow flex items-center gap-1.5">
        {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>}
        {label}
      </div>
      <div className="text-2xl font-semibold tabular mt-1 tracking-[-0.03em]">
        {value}{suffix && <span className="text-sm text-[var(--color-muted)] font-normal">{suffix}</span>}
      </div>
    </div>
  )
}
