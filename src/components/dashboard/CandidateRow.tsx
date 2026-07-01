import { ChevronRight, Sparkles, Mail, UserCheck, UserX, FileDown } from 'lucide-react'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import ScoreGauge from './ScoreGauge'
import VerdictPill from './VerdictPill'
import { setCandidateStatus, type Candidate } from '../../lib/screenings'
import { CandidateFeedbackDocument } from '../../lib/feedbackPdf'

type Props = {
  c: Candidate
  selected: boolean
  onSelect: (id: string, val: boolean) => void
  onOpenQs: (c: Candidate) => void
  onStatusChange?: (id: string, status: Candidate['status']) => void
}

export default function CandidateRow({ c, selected, onSelect, onOpenQs, onStatusChange }: Props) {
  const [open, setOpen] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [feedbackBusy, setFeedbackBusy] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const initial = (c.name ?? c.file_name ?? '?').slice(0, 1).toUpperCase()

  const decide = async (status: 'shortlisted' | 'rejected') => {
    if (statusBusy || c.status === status) return
    setStatusBusy(true)
    const result = await setCandidateStatus(c, status)
    setStatusBusy(false)
    if (!result.ok) { alert(result.error ?? 'Failed to update status'); return }
    onStatusChange?.(c.id, status)
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
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)] overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <input type="checkbox" checked={selected} onChange={e => onSelect(c.id, e.target.checked)} className="accent-[var(--color-primary)]"/>
        <div className="w-10 h-10 rounded-full bg-[rgba(47,123,255,0.15)] text-[var(--color-primary-2)] text-xs font-semibold flex items-center justify-center">{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[var(--color-fg)] uppercase tracking-wide text-sm truncate">{c.name ?? c.file_name ?? 'Unknown'}</div>
          <div className="text-xs text-[var(--color-muted)] truncate">
            {c.email ?? '—'}{c.experience_years != null ? ` · ${c.experience_years} yrs` : ''}
          </div>
        </div>
        <div className="hidden md:flex gap-1.5 flex-wrap max-w-xs justify-end">
          {(c.skills ?? []).slice(0, 3).map(s => <span key={s} className="skill-chip">{s}</span>)}
        </div>
        <ScoreGauge score={c.score} />
        <VerdictPill verdict={c.verdict} />
        {c.status === 'pending' && (
          <>
            <button disabled={statusBusy} onClick={() => decide('shortlisted')} className="btn-ghost text-xs whitespace-nowrap text-green-400"><UserCheck size={12}/>Shortlist</button>
            <button disabled={statusBusy} onClick={() => decide('rejected')} className="btn-ghost text-xs whitespace-nowrap text-red-400"><UserX size={12}/>Reject</button>
          </>
        )}
        {c.status === 'shortlisted' && <span className="text-xs text-green-400 flex items-center gap-1 whitespace-nowrap"><UserCheck size={12}/>Shortlisted</span>}
        {c.status === 'rejected' && <span className="text-xs text-red-400 flex items-center gap-1 whitespace-nowrap"><UserX size={12}/>Rejected</span>}
        <button onClick={() => onOpenQs(c)} className="btn-ghost text-xs whitespace-nowrap"><Sparkles size={12}/>Interview Qs</button>
        <button onClick={() => setOpen(!open)} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]">
          <ChevronRight size={18} className={`transition ${open ? 'rotate-90' : ''}`}/>
        </button>
      </div>
      {open && (
        <div className="border-t border-[var(--color-border)] p-5 grid md:grid-cols-3 gap-5 bg-[color-mix(in_srgb,var(--color-bg)_50%,transparent)]">
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-1">Summary</div>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">{c.summary || '—'}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-green-400 mb-2">Strengths</div>
            <ul className="text-xs text-[var(--color-muted)] space-y-1">{(c.strengths ?? []).map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-yellow-300 mb-2">Gaps</div>
            <ul className="text-xs text-[var(--color-muted)] space-y-1">{(c.gaps ?? []).map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary-2)] mb-2">All skills</div>
            <div className="flex gap-1.5 flex-wrap">{(c.skills ?? []).map(s => <span key={s} className="skill-chip">{s}</span>)}</div>
          </div>
          {c.email && (
            <div className="md:col-span-3 flex items-center justify-between gap-3">
              <a href={`mailto:${c.email}`} className="text-xs text-[var(--color-primary-2)] flex items-center gap-1"><Mail size={12}/>{c.email}</a>
              <button onClick={sendFeedback} disabled={feedbackBusy || feedbackSent} className="btn-ghost text-xs whitespace-nowrap">
                <FileDown size={12}/>{feedbackSent ? 'Feedback sent' : feedbackBusy ? 'Sending…' : 'Send Feedback PDF'}
              </button>
            </div>
          )}
        </div>
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
