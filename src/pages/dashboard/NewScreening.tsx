import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Upload, FileText, X, AlertCircle, FolderKanban, Trash2,
  CheckCircle2, Image as ImageIcon, Clock,
} from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import UpgradeModal from '../../components/UpgradeModal'
import { parseFile, pAll, type ParsedCV } from '../../lib/parsers'
import { createScreening, insertCandidate, inferScreeningName, listScreenings, scoreCv, notifyScreeningComplete, type Screening } from '../../lib/screenings'
import { FEATURE_PLAN, planAtLeast } from '../../lib/plans'
import { loadQuota, type QuotaState } from '../../lib/quota'
import { useAuth } from '../../lib/auth'
import { useCurrentOrg } from '../../hooks/useCurrentOrg'

const ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg'
const ACCEPT_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
])
const ACCEPT_EXT = /\.(pdf|docx|png|jpe?g)$/i
/** Used until the plan's own cap has loaded (Starter/Free = 50, Growth/Team = 200, Enterprise = 500). */
const DEFAULT_BATCH_CAP = 50
/** Rough wall-clock per CV with 4 parallel scoring calls — used for the ETA hint. */
const SECONDS_PER_CV = 3

function isAllowedResumeFile(file: File): boolean {
  if (file.type && ACCEPT_MIME.has(file.type)) return true
  return ACCEPT_EXT.test(file.name)
}

export default function NewScreening() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const { orgs, currentOrgId, setCurrentOrgId } = useCurrentOrg()
  const [name, setName] = useState('')
  const [jd, setJd] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0, label: '' })
  const [err, setErr] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [upgradeReason, setUpgradeReason] = useState<'quota-exceeded' | 'quota-warning' | 'inactive' | 'job-slots' | 'batch-cap' | null>(null)
  const [jobs, setJobs] = useState<Screening[]>([])
  const [jobId, setJobId] = useState('') // '' = new job
  const fileInput = useRef<HTMLInputElement | null>(null)
  const batchCap = quota?.batchCap ?? DEFAULT_BATCH_CAP

  useEffect(() => {
    if (profile) loadQuota(profile).then(setQuota)
  }, [profile])

  // Active jobs this user can add CVs to (adding to a job doesn't use a new job slot).
  useEffect(() => {
    listScreenings(100).then(list => setJobs(list.filter(j => !j.archived_at && (j.org_id ?? null) === (currentOrgId ?? null))))
  }, [currentOrgId])

  const pickJob = (id: string) => {
    setJobId(id)
    const job = jobs.find(j => j.id === id)
    if (job) { setJd(job.jd); setName(job.name) }
  }

  // Block suspended accounts immediately
  useEffect(() => {
    if (profile && profile.active === false) setUpgradeReason('inactive')
  }, [profile])

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    const allowed = arr.filter(isAllowedResumeFile)
    const rejected = arr.filter(f => !isAllowedResumeFile(f))
    if (rejected.length > 0) {
      setErr(`Unsupported file type${rejected.length > 1 ? 's' : ''}: ${rejected.map(f => f.name).join(', ')}. Only PDF, DOCX, PNG, and JPG are allowed.`)
    } else {
      setErr(null)
    }
    if (allowed.length > 0) {
      setFiles(f => {
        const next = [...f, ...allowed]
        if (next.length > batchCap) setUpgradeReason('batch-cap')
        return next.slice(0, batchCap)
      })
    }
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

    // Friendly early checks — /api/score and the database enforce the same limits.
    if (quota && !quota.unlimited) {
      if (quota.remaining === 0) return setUpgradeReason('quota-exceeded')
      if (files.length > quota.remaining) return setUpgradeReason('quota-warning')
    }
    if (!jobId && quota && quota.activeJobs >= quota.jobSlots) return setUpgradeReason('job-slots')

    setBusy(true)
    setProgress({ done: 0, total: files.length, label: name.trim() ? 'Parsing files…' : 'Naming screening…' })
    let screeningName = name.trim()
    if (!screeningName && !jobId) {
      const inferred = await inferScreeningName(jd)
      screeningName = inferred || `Screening ${new Date().toLocaleString()}`
    }
    setProgress({ done: 0, total: files.length, label: 'Parsing files…' })
    try {
      const screening = jobId
        ? jobs.find(j => j.id === jobId)!
        : await createScreening(screeningName, jd, currentOrgId)
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
        let data: any
        try {
          data = await scoreCv({ jd: screening.jd, fileName: p.fileName, cv })
        } catch (e: any) {
          if (e?.code === 'QUOTA_EXCEEDED') throw e
          throw new Error(`Score failed for ${p.fileName}: ${String(e?.message ?? '').slice(0, 150)}`)
        }
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

      // Team plan: email a Fit/Maybe/Skip summary to the owner and teammates (fire and forget).
      if (quota && planAtLeast(quota.plan, FEATURE_PLAN.emailNotifications)) notifyScreeningComplete(screening.id)
      nav(`/dashboard/results/${screening.id}`)
    } catch (e: any) {
      if (e?.code === 'QUOTA_EXCEEDED') setUpgradeReason('quota-exceeded')
      else if (e?.code === 'JOB_SLOTS_FULL') setUpgradeReason('job-slots')
      else setErr(e.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
      if (profile) loadQuota(profile).then(setQuota)
    }
  }

  const words = useMemo(() => jd.trim().split(/\s+/).filter(Boolean).length, [jd])
  const jdReady = words >= 40
  const totalKb = useMemo(() => files.reduce((s, f) => s + f.size, 0) / 1024, [files])
  const eta = files.length ? Math.max(5, Math.round((files.length * SECONDS_PER_CV) / 4) * 4) : 0
  const blockers = [
    !jd.trim() && 'a job description',
    files.length === 0 && 'at least one CV',
  ].filter(Boolean) as string[]

  return (
    <>
      <DashboardTopBar
        title="New screening"
        subtitle="Paste a JD, drop in CVs, get a ranked shortlist"
        used={quota?.used}
        limit={quota && isFinite(quota.limit) ? quota.limit : undefined}
        unlimited={quota?.unlimited}
      />

      <div className="flex flex-col min-h-[calc(100vh-3.55rem)]">
      <div className="p-4 md:p-6 max-w-[80rem] w-full mx-auto space-y-4 flex-1">

        {/* ── Setup row ────────────────────────────────────────────── */}
        <section className="panel rise p-4 md:p-5 flex flex-col md:flex-row md:items-end gap-4" style={{ '--d': '0ms' } as React.CSSProperties}>
          <div className="flex-1">
            <label htmlFor="screening-name" className="eyebrow">Screening name</label>
            <input
              id="screening-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Leave blank — AI names it from the JD"
              className="field mt-2"
            />
          </div>
          {jobs.length > 0 && (
            <div className="md:w-64">
              <label htmlFor="screening-job" className="eyebrow">Job</label>
              <select id="screening-job" value={jobId} onChange={e => pickJob(e.target.value)} className="field mt-2">
                <option value="">New job{quota && isFinite(quota.jobSlots) ? ` (${quota.activeJobs}/${quota.jobSlots} slots used)` : ''}</option>
                {jobs.map(j => <option key={j.id} value={j.id}>Add CVs to: {j.name}</option>)}
              </select>
            </div>
          )}
          {orgs.length > 0 && (
            <div className="md:w-56">
              <label htmlFor="screening-folder" className="eyebrow flex items-center gap-1.5"><FolderKanban size={11}/>Workspace</label>
              <select
                id="screening-folder"
                value={currentOrgId ?? ''}
                onChange={e => setCurrentOrgId(e.target.value || null)}
                className="field mt-2"
              >
                <option value="">Personal</option>
                {orgs.map(o => <option key={o.org_id} value={o.org_id}>{o.name}</option>)}
              </select>
            </div>
          )}
        </section>

        {/* ── JD + CVs ─────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-4">
          <div className="panel rise flex flex-col" style={{ '--d': '60ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title flex items-center gap-2">
                  Job description
                  {jdReady && <CheckCircle2 size={13} style={{ color: 'var(--color-viz-fit)' }}/>}
                </div>
                <div className="panel-sub">The role you're hiring for — the richer, the sharper the scoring</div>
              </div>
              <div className="flex items-center gap-1">
                {jd && <button onClick={() => setJd('')} className="icon-btn tt" data-tip="Clear"><Trash2 size={14}/></button>}
                <label className="btn-ghost text-xs cursor-pointer">
                  <Upload size={12}/>Upload
                  <input type="file" accept=".pdf,.docx,.txt" onChange={uploadJD} className="hidden"/>
                </label>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <textarea
                value={jd}
                readOnly={!!jobId}
                onChange={e => setJd(e.target.value)}
                rows={15}
                placeholder="Paste the full job description here — responsibilities, must-have skills, seniority, tools…"
                className="field font-mono text-[13px] leading-relaxed flex-1 resize-none"
              />
              <div className="flex items-center justify-between text-[11px] mt-2.5">
                <span className={jd.length === 0 || jdReady ? 'text-[var(--color-muted)]' : 'text-[var(--color-viz-maybe)]'}>
                  {jd.length === 0
                    ? 'Tip: include must-have skills and years of experience'
                    : jdReady ? 'Good length for accurate scoring' : 'Add more detail — under 40 words scores loosely'}
                </span>
                <span className="text-[var(--color-muted-2)] tabular">{words} words</span>
              </div>
            </div>
          </div>

          <div className="panel rise flex flex-col" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="panel-head">
              <div>
                <div className="panel-title">Candidate CVs</div>
                <div className="panel-sub">Up to {batchCap} files per batch · PDF, DOCX, PNG, JPG</div>
              </div>
              <div className="flex items-center gap-2">
                {files.length > 0 && (
                  <button onClick={() => setFiles([])} className="icon-btn tt" data-tip="Remove all"><Trash2 size={14}/></button>
                )}
                <span className="text-xs text-[var(--color-muted)] tabular">{files.length}/{batchCap}</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div
                className={`dropzone ${drag ? 'drag' : ''}`}
                onClick={() => fileInput.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              >
                <span className="empty-icon mx-auto"><Upload size={18}/></span>
                <div className="mt-3 text-sm font-medium">{drag ? 'Drop to add' : 'Drag CVs here, or click to browse'}</div>
                <div className="text-[11px] text-[var(--color-muted)] mt-1">Scanned resumes are read with vision · max 10MB each</div>
                <input ref={fileInput} type="file" multiple accept={ACCEPT} className="hidden" onChange={e => e.target.files && addFiles(e.target.files)}/>
              </div>

              {files.length > 0 && (
                <>
                  <ul className="mt-3 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {files.map((f, i) => {
                      const isImg = /\.(png|jpe?g)$/i.test(f.name)
                      return (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_3%,transparent)] text-xs">
                          {isImg
                            ? <ImageIcon size={13} className="text-[var(--color-primary-2)] shrink-0"/>
                            : <FileText size={13} className="text-[var(--color-primary-2)] shrink-0"/>}
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-[var(--color-muted-2)] tabular shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                          <button onClick={() => removeFile(i)} className="icon-btn w-6 h-6 hover:text-[var(--color-skip)]" aria-label={`Remove ${f.name}`}>
                            <X size={12}/>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-2)] mt-2.5">
                    <span className="tabular">{(totalKb / 1024).toFixed(1)} MB queued</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={11}/>≈ {eta}s to score</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {err && (
          <div className="panel p-4 border-[color-mix(in_srgb,var(--color-skip)_45%,transparent)] text-sm flex items-start gap-2.5" style={{ color: 'var(--color-skip)' }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5"/><div className="wrap-anywhere">{err}</div>
          </div>
        )}

        {busy && (
          <div className="panel p-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--color-fg)] flex items-center gap-2">
                <Sparkles size={13} className="text-[var(--color-primary-2)] animate-pulse"/>{progress.label}
              </span>
              <span className="text-[var(--color-muted)] tabular">{progress.done} / {progress.total}</span>
            </div>
            <div className="meter">
              <span style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}/>
            </div>
            <p className="text-[11px] text-[var(--color-muted-2)] mt-2">Keep this tab open — results save as each CV finishes.</p>
          </div>
        )}
      </div>

      {/* ── Sticky action bar ──────────────────────────────────────── */}
      <div className="sticky bottom-0 z-20 topbar border-t border-b-0">
        <div className="max-w-[80rem] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="text-[11px] text-[var(--color-muted)] min-w-0 truncate">
            {blockers.length > 0
              ? <>Add {blockers.join(' and ')} to start.</>
              : <>Ready — <span className="text-[var(--color-fg)] font-medium tabular">{files.length}</span> CV{files.length === 1 ? '' : 's'} against this JD.</>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-[11px] text-[var(--color-muted-2)]"><kbd>⌘</kbd> <kbd>↵</kbd></span>
            <button onClick={analyze} disabled={busy} className="btn-primary px-6">
              <Sparkles size={15}/>{busy ? 'Analyzing…' : 'Analyze CVs'}
            </button>
          </div>
        </div>
      </div>
      </div>

      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          quota={quota}
          attemptedCount={files.length}
          onClose={() => setUpgradeReason(null)}
        />
      )}
    </>
  )
}
