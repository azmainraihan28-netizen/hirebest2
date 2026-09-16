import { ChevronDown, Sparkles, Mail, UserCheck, UserX, FileDown, Briefcase, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import ScoreGauge from './ScoreGauge'
import VerdictPill from './VerdictPill'
import { setCandidateStatus, type Candidate } from '../../lib/screenings'
import { CandidateFeedbackDocument } from '../../lib/feedbackPdf'

type Props = {
  c: Candidate
  selected: boolean
  /** Position in the current sort — shown only when sorted by score. */
  rank?: number
  onSelect: (id: string, val: boolean) => void
  onOpenQs: (c: Candidate) => void
  onStatusChange?: (id: string, status: Candidate['status']) => void
}

export default function CandidateRow({ c, selected, rank, onSelect, onOpenQs, onStatusChange }: Props) {
  const [open, setOpen] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [feedbackBusy, setFeedbackBusy] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const initial = (c.name ?? c.file_name ?? '?').slice(0, 1).toUpperCase()

  const decide = async (status: 'shortlisted' | 'rejected') => {
    if (statusBusy || c.status === status) return
    setStatusBusy(true)
    const result = await setCandidateStatus(c, status)
    setStatusBusy(false)
    if (!result.ok) { alert(result.error ?? 'Failed to update status'); return }
    onStatusChange?.(c.id, status)
  }

  const copyEmail = async () => {
    if (!c.email) return
    try {
      await navigator.clipboard.writeText(c.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard blocked — the mailto link is still there */ }
  }

  const sendFeedback = async () => {
    if (feedbackBusy || !c.email) return
    setFeedbackBusy(true)
    try {
      let pdfBase64: string
      try {
        const blob = await pdf(<CandidateFeedbackDocument candidate={c} />).toBlob()
        pdfBase64 = await blobToBase64(blob)
      } catch (e: any) {
        console.error('Feedback PDF generation failed', e)
        alert(`Failed to build feedback PDF: ${e?.message ?? 'unknown error'}`)
        return
      }
      const res = await fetch('/api/send-candidate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: c.email, name: c.name, pdfBase64 }),
      })
      if (!res.ok) {
        const t = await res.text()
        alert(`Failed to send feedback: ${t.slice(0, 150)}`)
        return
      }
      setFeedbackSent(true)
    } finally {
      setFeedbackBusy(false)
    }
  }

  return (
    <div className={`rounded-xl border transition-colors ${
      selected
        ? 'border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]'
        : 'border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-card)_75%,transparent)] hover:border-[var(--color-border-strong)]'
    }`}>
      {/* ── Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 md:px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(c.id, e.target.checked)}
          aria-label={`Select ${c.name ?? 'candidate'}`}
          className="accent-[var(--color-primary)] shrink-0"
        />

        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary-2)] text-xs font-semibold flex items-center justify-center">
            {initial}
          </div>
          {rank != null && rank <= 3 && (
            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[var(--color-card)] border border-[var(--color-border-strong)] text-[9px] font-bold flex items-center justify-center tabular">
              {rank}
            </span>
          )}
        </div>

        <button onClick={() => setOpen(o => !o)} className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-[var(--color-fg)] truncate">{c.name ?? c.file_name ?? 'Unknown candidate'}</div>
          <div className="text-[11px] text-[var(--color-muted)] truncate flex items-center gap-1.5">
            <span className="truncate">{c.email ?? 'No email found'}</span>
            {c.experience_years != null && (
              <span className="inline-flex items-center gap-1 shrink-0"><Briefcase size={10}/>{c.experience_years} yrs</span>
            )}
          </div>
        </button>

        <div className="hidden lg:flex w-56 gap-1.5 flex-nowrap justify-end shrink-0 overflow-hidden">
          {(c.skills ?? []).slice(0, 2).map(s => <span key={s} className="skill-chip whitespace-nowrap">{s}</span>)}
          {(c.skills ?? []).length > 2 && (
            <span className="skill-chip text-[var(--color-muted)] whitespace-nowrap">+{(c.skills ?? []).length - 2}</span>
          )}
        </div>

        <div className="w-14 flex justify-center shrink-0"><ScoreGauge score={c.score} size={40}/></div>
        <div className="hidden sm:flex w-16 justify-center shrink-0"><VerdictPill verdict={c.verdict} compact/></div>

        <div className="hidden md:flex w-[8.5rem] justify-end items-center gap-1 shrink-0">
          {c.status === 'pending' && (
            <>
              <button disabled={statusBusy} onClick={() => decide('shortlisted')} className="icon-btn tt" data-tip="Shortlist & email">
                <UserCheck size={15} className="text-[var(--color-viz-fit)]"/>
              </button>
              <button disabled={statusBusy} onClick={() => decide('rejected')} className="icon-btn tt" data-tip="Reject & email">
                <UserX size={15} className="text-[var(--color-skip)]"/>
              </button>
            </>
          )}
          {c.status === 'shortlisted' && (
            <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--color-viz-fit)' }}><UserCheck size={12}/>Shortlisted</span>
          )}
          {c.status === 'rejected' && (
            <span className="text-[11px] font-medium flex items-center gap-1 text-[var(--color-skip)]"><UserX size={12}/>Rejected</span>
          )}
          <button onClick={() => onOpenQs(c)} className="icon-btn tt" data-tip="Interview questions"><Sparkles size={15}/></button>
          <button onClick={() => setOpen(o => !o)} className="icon-btn" aria-label={open ? 'Collapse' : 'Expand'} aria-expanded={open}>
            <ChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`}/>
          </button>
        </div>

        {/* Compact controls for small screens */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden icon-btn shrink-0" aria-label={open ? 'Collapse' : 'Expand'}>
          <ChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`}/>
        </button>
      </div>

      {/* ── Detail ──────────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_45%,transparent)] p-4 md:p-5 space-y-5">
          <div>
            <div className="eyebrow mb-1.5">Why this score</div>
            <p className="text-sm text-[var(--color-fg-dim)] leading-relaxed">{c.summary || 'No summary available.'}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <DetailList title="Strengths" color="var(--color-viz-fit)" items={c.strengths ?? []}/>
            <DetailList title="Gaps" color="var(--color-viz-maybe)" items={c.gaps ?? []}/>
            <div>
              <div className="eyebrow mb-2">All skills</div>
              <div className="flex gap-1.5 flex-wrap">
                {(c.skills ?? []).length === 0
                  ? <span className="text-xs text-[var(--color-muted)]">None detected.</span>
                  : (c.skills ?? []).map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {c.status === 'pending' && (
              <>
                <button disabled={statusBusy} onClick={() => decide('shortlisted')} className="btn-ghost text-xs md:hidden"><UserCheck size={12}/>Shortlist</button>
                <button disabled={statusBusy} onClick={() => decide('rejected')} className="btn-ghost text-xs md:hidden"><UserX size={12}/>Reject</button>
              </>
            )}
            <button onClick={() => onOpenQs(c)} className="btn-ghost text-xs"><Sparkles size={12}/>Interview questions</button>
            {c.email && (
              <>
                <a href={`mailto:${c.email}`} className="btn-ghost text-xs"><Mail size={12}/>Email</a>
                <button onClick={copyEmail} className="btn-ghost text-xs">
                  {copied ? <Check size={12}/> : <Copy size={12}/>}{copied ? 'Copied' : 'Copy address'}
                </button>
                <button onClick={sendFeedback} disabled={feedbackBusy || feedbackSent} className="btn-ghost text-xs">
                  <FileDown size={12}/>{feedbackSent ? 'Feedback sent' : feedbackBusy ? 'Sending…' : 'Send feedback PDF'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailList({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <div className="eyebrow mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>{title}
      </div>
      {items.length === 0
        ? <p className="text-xs text-[var(--color-muted)]">None listed.</p>
        : (
          <ul className="space-y-1.5">
            {items.map((s, i) => (
              <li key={i} className="text-xs text-[var(--color-fg-dim)] leading-relaxed flex gap-2">
                <span style={{ color }} aria-hidden>—</span><span className="wrap-anywhere">{s}</span>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
