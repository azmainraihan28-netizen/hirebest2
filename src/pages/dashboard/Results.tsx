import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Download, Mail, Plus, GitCompare, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import CandidateRow from '../../components/dashboard/CandidateRow'
import InterviewQsModal from '../../components/dashboard/InterviewQsModal'
import CompareModal from '../../components/dashboard/CompareModal'
import { SkeletonRow, SkeletonStats } from '../../components/Skeleton'
import { getScreening, listCandidates, countMyCandidates, type Candidate, type Screening } from '../../lib/screenings'

type Tab = 'All' | 'Fit' | 'Maybe' | 'Skip'
type Sort = 'Score' | 'Name' | 'Date'
type ShowLimit = 10 | 25 | 50 | 100 | 'All'

export default function Results() {
  const { id } = useParams()
  const nav = useNavigate()
  const [screening, setScreening] = useState<Screening | null>(null)
  const [cands, setCands] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('Score')
  const [showLimit, setShowLimit] = useState<ShowLimit>('All')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [openQs, setOpenQs] = useState<Candidate | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [used, setUsed] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getScreening(id), listCandidates(id), countMyCandidates()]).then(([s, c, u]) => {
      setScreening(s); setCands(c); setUsed(u); setLoading(false)
    })
  }, [id])

  const counts = useMemo(() => ({
    All: cands.length,
    Fit: cands.filter(c => c.verdict === 'Fit').length,
    Maybe: cands.filter(c => c.verdict === 'Maybe').length,
    Skip: cands.filter(c => c.verdict === 'Skip').length,
  }), [cands])

  const filtered = useMemo(() => {
    let r = tab === 'All' ? cands : cands.filter(c => c.verdict === tab)
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
    return sorted
  }, [cands, tab, q, sort])

  const visible = useMemo(() => (
    showLimit === 'All' ? filtered : filtered.slice(0, showLimit)
  ), [filtered, showLimit])

  const toggleSel = (id: string, val: boolean) => {
    setSel(s => { const n = new Set(s); val ? n.add(id) : n.delete(id); return n })
  }

  const handleStatusChange = (id: string, status: Candidate['status']) => {
    setCands(cs => cs.map(c => c.id === id ? { ...c, status, status_email_sent: true } : c))
  }

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Score', 'Verdict', 'Experience', 'Skills', 'Summary'],
      ...filtered.map(c => [c.name ?? '', c.email ?? '', String(c.score), c.verdict, String(c.experience_years ?? ''), (c.skills ?? []).join('; '), (c.summary ?? '').replace(/\n/g, ' ')]),
    ]
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${screening?.name ?? 'screening'}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const emailSelected = () => {
    const emails = filtered.filter(c => sel.has(c.id)).map(c => c.email).filter(Boolean).join(',')
    if (!emails) return alert('Select candidates with emails first.')
    window.location.href = `mailto:?bcc=${emails}&subject=Interview opportunity`
  }

  if (loading) return (
    <>
      <DashboardTopBar title="Loading…"/>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <SkeletonStats count={4}/>
        <div className="card p-5 space-y-3">
          <SkeletonRow/><SkeletonRow/><SkeletonRow/>
        </div>
      </div>
    </>
  )
  if (!screening) return <><DashboardTopBar title="Not found"/><div className="p-10 text-[var(--color-muted)]">Screening not found.</div></>

  return (
    <>
      <DashboardTopBar title={`Screening Results · ${screening.name}`} used={used} />
      <div className="p-6 max-w-7xl mx-auto space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={counts.All} icon={<FileText size={18}/>} color="text-[var(--color-primary-2)]"/>
          <StatCard label="Fit" value={counts.Fit} icon={<CheckCircle2 size={18}/>} color="text-green-400"/>
          <StatCard label="Maybe" value={counts.Maybe} icon={<AlertCircle size={18}/>} color="text-yellow-300"/>
          <StatCard label="Skip" value={counts.Skip} icon={<XCircle size={18}/>} color="text-red-400"/>
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] rounded-md p-1">
              {(['All','Fit','Maybe','Skip'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded ${tab === t ? 'bg-[var(--color-primary)] text-[var(--color-fg)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}>
                  {t} ({counts[t]})
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or skill" className="field pl-9 text-sm"/>
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="field text-sm w-auto">
              <option value="Score">Sort: Score</option>
              <option value="Name">Sort: Name</option>
              <option value="Date">Sort: Date</option>
            </select>
            <select
              value={String(showLimit)}
              onChange={e => setShowLimit(e.target.value === 'All' ? 'All' : (Number(e.target.value) as ShowLimit))}
              className="field text-sm w-auto"
            >
              <option value="10">Show: Top 10</option>
              <option value="25">Show: Top 25</option>
              <option value="50">Show: Top 50</option>
              <option value="100">Show: Top 100</option>
              <option value="All">Show: All</option>
            </select>
            <button
              onClick={() => {
                if (sel.size < 2) return alert('Select at least 2 candidates to compare.')
                if (sel.size > 4) return alert('Compare up to 4 candidates at a time.')
                setCompareOpen(true)
              }}
              className="btn-ghost text-xs">
              <GitCompare size={12}/>Compare{sel.size > 0 ? ` (${sel.size})` : ''}
            </button>
            <button onClick={exportCsv} className="btn-ghost text-xs"><Download size={12}/>CSV</button>
            <button onClick={emailSelected} className="btn-ghost text-xs"><Mail size={12}/>Email</button>
            <button onClick={() => nav('/dashboard/new')} className="btn-primary text-xs"><Plus size={12}/>New</button>
          </div>

          <div className="mt-5 space-y-2.5">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-[var(--color-muted)] text-sm">No candidates match this filter.</div>
            )}
            {visible.map(c => (
              <CandidateRow key={c.id} c={c} selected={sel.has(c.id)} onSelect={toggleSel} onOpenQs={setOpenQs} onStatusChange={handleStatusChange}/>
            ))}
            {filtered.length > visible.length && (
              <div className="pt-2 text-center text-[11px] text-[var(--color-muted)]">
                Showing {visible.length} of {filtered.length} — change "Show" above to see more.
              </div>
            )}
          </div>
        </div>
      </div>

      {openQs && <InterviewQsModal candidate={openQs} jd={screening.jd} onClose={() => setOpenQs(null)}/>}
      {compareOpen && (
        <CompareModal
          candidates={cands.filter(c => sel.has(c.id))}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
          <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
        <div className={`w-9 h-9 rounded-lg bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </div>
  )
}
