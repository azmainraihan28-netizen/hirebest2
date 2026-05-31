import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Upload, FileText, X, AlertCircle } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import UpgradeModal from '../../components/UpgradeModal'
import { parseFile, pAll, type ParsedCV } from '../../lib/parsers'
import { createScreening, insertCandidate } from '../../lib/screenings'
import { loadQuota, type QuotaState } from '../../lib/quota'
import { useAuth } from '../../lib/auth'

const ACCEPT = '.pdf,.docx,.txt,.png,.jpg,.jpeg,.svg,.webp'
const HARD_BATCH_CAP = 50

export default function NewScreening() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [jd, setJd] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0, label: '' })
  const [err, setErr] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [upgradeReason, setUpgradeReason] = useState<'quota-exceeded' | 'quota-warning' | 'inactive' | null>(null)
  const fileInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (profile) loadQuota(profile).then(setQuota)
  }, [profile])

  // Block suspended accounts immediately
  useEffect(() => {
    if (profile && profile.active === false) setUpgradeReason('inactive')
  }, [profile])

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    setFiles(f => [...f, ...arr].slice(0, HARD_BATCH_CAP))
  }
  const removeFile = (i: number) => setFiles(f => f.filter((_, idx) => idx !== i))

  const uploadJD = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseFile(file)
      if (parsed.kind === 'text') setJd(parsed.text)
      else setErr('JD upload supports PDF, DOCX, TXT only.')
    } catch (er: any) { setErr(er.message ?? 'Failed to read file') }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyze() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const analyze = async () => {
    setErr(null)
    if (profile?.active === false) return setUpgradeReason('inactive')
    if (!jd.trim()) return setErr('Add a job description.')
    if (files.length === 0) return setErr('Add at least one CV.')

    // Quota check (defense in client; webhook + RLS already protect data)
    if (quota && !quota.unlimited) {
      if (quota.remaining === 0) return setUpgradeReason('quota-exceeded')
      if (files.length > quota.remaining) return setUpgradeReason('quota-warning')
    }

    const screeningName = name.trim() || `Screening ${new Date().toLocaleString()}`
    setBusy(true)
    setProgress({ done: 0, total: files.length, label: 'Parsing files…' })
    try {
      const screening = await createScreening(screeningName, jd)
      if (!screening) throw new Error('Could not create screening (check auth).')

      const parsed: ParsedCV[] = []
      for (let i = 0; i < files.length; i++) {
        setProgress({ done: i, total: files.length, label: `Parsing ${files[i].name}…` })
        parsed.push(await parseFile(files[i]))
      }

      setProgress({ done: 0, total: files.length, label: 'Scoring with AI…' })
      let done = 0
      await pAll(parsed, 4, async (p) => {
        const cv = p.kind === 'text' ? { text: p.text } : { imageBase64: p.imageBase64, mimeType: p.mimeType }
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd, fileName: p.fileName, cv }),
        })
        if (!res.ok) {
          const t = await res.text()
          throw new Error(`Score failed for ${p.fileName}: ${t.slice(0, 150)}`)
        }
        const data = await res.json()
        await insertCandidate({
          screening_id: screening.id,
          file_name: p.fileName,
          name: data.name,
          email: data.email,
          experience_years: data.experience_years,
          skills: data.skills,
          score: data.score,
          verdict: data.verdict,
          summary: data.summary,
          strengths: data.strengths,
          gaps: data.gaps,
          questions: data.questions,
        })
        done++
        setProgress(p => ({ ...p, done }))
      })

      nav(`/dashboard/results/${screening.id}`)
    } catch (e: any) {
      setErr(e.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
      if (profile) loadQuota(profile).then(setQuota)
    }
  }

  const used = quota?.used ?? 0
  const limit = quota?.unlimited ? Infinity : (quota?.limit ?? 50)
  const remaining = quota?.unlimited ? Infinity : (quota?.remaining ?? 0)
  const isUnlim = !!quota?.unlimited

  return (
    <>
      <DashboardTopBar title="New Screening" used={used} limit={isUnlim ? 0 : limit as number} unlimited={isUnlim}/>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        <div className="card p-5 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Screening name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Frontend Engineer — Q2" className="field mt-2"/>
          </div>
          <div className="md:w-64">
            <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
              <span>Screenings used</span>
              {isUnlim ? <span className="text-[var(--color-primary-2)]">Unlimited</span> : <span>{used} / {limit as number}</span>}
            </div>
            {!isUnlim && (
              <>
                <div className="h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] overflow-hidden">
                  <div className="h-full transition-all" style={{
                    width: `${Math.min(100, (used/(limit as number))*100)}%`,
                    background: (used / (limit as number)) >= 0.9 ? '#ef4444' : (used / (limit as number)) >= 0.7 ? '#f59e0b' : 'var(--color-primary)',
                  }}/>
                </div>
                <div className="text-[10px] text-[var(--color-muted)] mt-1">{remaining as number} screenings left</div>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">Job Description</h3>
                <p className="text-xs text-[var(--color-muted)]">Paste or upload the JD you're hiring for</p>
              </div>
              <label className="btn-ghost text-xs cursor-pointer">
                <Upload size={12}/>Upload
                <input type="file" accept=".pdf,.docx,.txt" onChange={uploadJD} className="hidden"/>
              </label>
            </div>
            <textarea value={jd} onChange={e => setJd(e.target.value)} rows={14} placeholder="Paste the full job description here…" className="field font-mono text-sm"/>
            <div className="flex justify-between text-[10px] text-[var(--color-muted)] mt-2">
              <span>{jd.length} characters</span>
              <span>{jd.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">Candidate CVs</h3>
                <p className="text-xs text-[var(--color-muted)]">Drop up to {HARD_BATCH_CAP} files per batch</p>
              </div>
              <span className="text-xs text-[var(--color-muted)]">{files.length} / {HARD_BATCH_CAP}</span>
            </div>

            <div
              className={`dropzone ${drag ? 'drag' : ''}`}
              onClick={() => fileInput.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
            >
              <Upload size={20} className="mx-auto text-[var(--color-muted)]"/>
              <div className="mt-3 text-sm font-medium">Drag CVs here or click to browse</div>
              <div className="text-[11px] text-[var(--color-muted)] mt-1">PDF, DOCX, PNG, JPG, SVG · max 10MB each</div>
              <input ref={fileInput} type="file" multiple accept={ACCEPT} className="hidden" onChange={e => e.target.files && addFiles(e.target.files)}/>
            </div>

            {files.length > 0 && (
              <ul className="mt-4 space-y-1.5 max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] text-xs">
                    <FileText size={12} className="text-[var(--color-primary-2)]"/>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-[var(--color-muted)]">{(f.size/1024).toFixed(0)}KB</span>
                    <button onClick={() => removeFile(i)} className="text-[var(--color-muted)] hover:text-red-400"><X size={12}/></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {err && (
          <div className="card p-4 border-red-500/40 text-red-300 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5"/><div>{err}</div>
          </div>
        )}

        {busy && (
          <div className="card p-4">
            <div className="flex justify-between text-xs text-[var(--color-muted)] mb-2">
              <span>{progress.label}</span>
              <span>{progress.done} / {progress.total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] overflow-hidden">
              <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${progress.total ? (progress.done/progress.total)*100 : 0}%` }}/>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pt-4 pb-10">
          <button onClick={analyze} disabled={busy} className="btn-primary px-10 py-3 text-base">
            <Sparkles size={16}/>{busy ? 'Analyzing…' : 'Analyze'}
          </button>
          <p className="text-[11px] text-[var(--color-muted)]">Press ⌘/Ctrl + Enter</p>
        </div>

      </div>

      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          used={quota?.used}
          limit={quota?.limit === Infinity ? 0 : (quota?.limit ?? 0)}
          attemptedCount={files.length}
          onClose={() => setUpgradeReason(null)}
        />
      )}
    </>
  )
}
