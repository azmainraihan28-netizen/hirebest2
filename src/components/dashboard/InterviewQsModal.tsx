import { X, Sparkles, RefreshCw, Copy, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Candidate, InterviewQuestion } from '../../lib/screenings'
import { regenerateQuestions } from '../../lib/screenings'

/** Tags that probe a weakness get the accent treatment; the rest stay neutral. */
const ACCENT_TAGS = new Set(['Skill Gap', 'Strength Validation'])

export default function InterviewQsModal({ candidate, jd, onClose }: { candidate: Candidate; jd: string; onClose: () => void }) {
  const [qs, setQs] = useState<InterviewQuestion[]>(candidate.questions ?? [])
  const [busy, setBusy] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const copyAll = async () => {
    const text = qs.map((q, i) => `${i + 1}. ${q.q}\n[${q.tag}] ${q.why}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1800)
  }

  const copyOne = async (q: InterviewQuestion, i: number) => {
    await navigator.clipboard.writeText(q.q)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 1400)
  }

  const regen = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, fileName: candidate.file_name, cv: { text: `${candidate.name ?? ''}\n${candidate.email ?? ''}\nSkills: ${(candidate.skills ?? []).join(', ')}\nExperience: ${candidate.experience_years ?? '?'} years\n\nStrengths: ${(candidate.strengths ?? []).join('; ')}\nGaps: ${(candidate.gaps ?? []).join('; ')}` } }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.questions)) {
          setQs(data.questions)
          await regenerateQuestions(candidate.id, data.questions)
        }
      }
    } finally { setBusy(false) }
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel w-full max-w-3xl max-h-[88vh]" onClick={e => e.stopPropagation()} role="dialog" aria-label="Interview questions">
        <div className="panel-head">
          <div className="flex items-start gap-3 min-w-0">
            <span className="icon-badge shrink-0"><Sparkles size={16}/></span>
            <div className="min-w-0">
              <h3 className="panel-title truncate">Interview questions — {candidate.name ?? 'Candidate'}</h3>
              <p className="panel-sub">Written against this JD and this candidate's gaps.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={regen} disabled={busy} className="btn-ghost text-xs">
              <RefreshCw size={12} className={busy ? 'animate-spin' : ''}/>{busy ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button onClick={copyAll} className="btn-primary text-xs">
              {copiedAll ? <Check size={12}/> : <Copy size={12}/>}{copiedAll ? 'Copied' : 'Copy all'}
            </button>
            <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={16}/></button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2.5">
          {qs.length === 0 && (
            <div className="empty">
              <span className="empty-icon"><Sparkles size={18}/></span>
              <p className="text-sm text-[var(--color-muted)]">No questions yet — hit Regenerate.</p>
            </div>
          )}
          {qs.map((q, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_3%,transparent)] p-4 flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-md bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary-2)] text-[11px] font-semibold flex items-center justify-center tabular mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-fg)] leading-relaxed">{q.q}</p>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="tag-chip" data-accent={ACCENT_TAGS.has(q.tag)}>{q.tag}</span>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed flex-1 min-w-[12rem]">{q.why}</p>
                </div>
              </div>
              <button onClick={() => copyOne(q, i)} className="icon-btn tt shrink-0" data-tip="Copy question">
                {copiedIdx === i ? <Check size={14} style={{ color: 'var(--color-viz-fit)' }}/> : <Copy size={14}/>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
