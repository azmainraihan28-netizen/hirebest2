import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Download, Mail, Plus, GitCompare, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import CandidateRow from '../../components/dashboard/CandidateRow'
import InterviewQsModal from '../../components/dashboard/InterviewQsModal'
import { getScreening, listCandidates, countMyCandidates, type Candidate, type Screening } from '../../lib/screenings'

type Tab = 'All' | 'Fit' | 'Maybe' | 'Skip'
type Sort = 'Score' | 'Name' | 'Date'

export default function Results() {
  const { id } = useParams()
  const nav = useNavigate()
  const [screening, setScreening] = useState<Screening | null>(null)
  const [cands, setCands] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('Score')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [openQs, setOpenQs] = useState<Candidate | null>(null)
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

  const toggleSel = (id: string, val: boolean) => {
    setSel(s => { const n = new Set(s); val ? n.add(id) : n.delete(id); return n })
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

  if (loading) return <><DashboardTopBar title="Loading…"/><div className="p-10 text-[var(--color-muted)]">Loading screening…</div></>
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
                <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded ${tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}>
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
            <button onClick={() => alert('Coming soon — Compare modal')} className="btn-ghost text-xs"><GitCompare size={12}/>Compare</button>
            <button onClick={exportCsv} className="btn-ghost text-xs"><Download size={12}/>CSV</button>
            <button onClick={emailSelected} className="btn-ghost text-xs"><Mail size={12}/>Email</button>
            <button onClick={() => nav('/dashboard/new')} className="btn-primary text-xs"><Plus size={12}/>New</button>
          </div>

          <div className="mt-5 space-y-2.5">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-[var(--color-muted)] text-sm">No candidates match this filter.</div>
            )}
            {filtered.map(c => (
              <CandidateRow key={c.id} c={c} selected={sel.has(c.id)} onSelect={toggleSel} onOpenQs={setOpenQs}/>
            ))}
          </div>
        </div>
      </div>

      {openQs && <InterviewQsModal candidate={openQs} jd={screening.jd} onClose={() => setOpenQs(null)}/>}
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
