import { X, Sparkles, RefreshCw, Copy, FileText } from 'lucide-react'
import { useState } from 'react'
import type { Candidate, InterviewQuestion } from '../../lib/screenings'
import { regenerateQuestions } from '../../lib/screenings'

const TAG_COLOR: Record<string, string> = {
  'Strength Validation': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Skill Gap': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Experience Probe': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Culture Fit': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Behavioral': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export default function InterviewQsModal({ candidate, jd, onClose }: { candidate: Candidate; jd: string; onClose: () => void }) {
  const [qs, setQs] = useState<InterviewQuestion[]>(candidate.questions ?? [])
  const [busy, setBusy] = useState(false)

  const copyAll = async () => {
    const text = qs.map((q, i) => `${i+1}. ${q.q}\n[${q.tag}] ${q.why}`).join('\n\n')
    await navigator.clipboard.writeText(text)
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(47,123,255,0.15)] flex items-center justify-center"><Sparkles size={16} className="text-[var(--color-primary-2)]"/></div>
            <div>
              <h3 className="font-semibold text-[var(--color-fg)]">Interview Questions — {(candidate.name ?? 'Candidate').toUpperCase()}</h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Tailored to JD requirements and this candidate's gaps.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={regen} disabled={busy} className="btn-ghost text-xs"><RefreshCw size={12} className={busy ? 'animate-spin' : ''}/>{busy ? 'Regenerating…' : 'Regenerate'}</button>
            <button onClick={copyAll} className="btn-primary text-xs"><Copy size={12}/>Copy all</button>
            <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-fg)] ml-1"><X size={18}/></button>
          </div>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {qs.length === 0 && <div className="text-sm text-[var(--color-muted)] italic">No questions yet — click Regenerate.</div>}
          {qs.map((q, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[rgba(47,123,255,0.15)] text-[var(--color-primary-2)] text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-fg)] leading-relaxed">{q.q}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded border ${TAG_COLOR[q.tag] ?? TAG_COLOR.Behavioral}`}>{q.tag}</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-2 leading-relaxed">{q.why}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(q.q)} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]" title="Copy question"><FileText size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
