import { ChevronRight, Sparkles, Mail } from 'lucide-react'
import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import VerdictPill from './VerdictPill'
import type { Candidate } from '../../lib/screenings'

type Props = {
  c: Candidate
  selected: boolean
  onSelect: (id: string, val: boolean) => void
  onOpenQs: (c: Candidate) => void
}

export default function CandidateRow({ c, selected, onSelect, onOpenQs }: Props) {
  const [open, setOpen] = useState(false)
  const initial = (c.name ?? c.file_name ?? '?').slice(0, 1).toUpperCase()
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
            <div className="md:col-span-3">
              <a href={`mailto:${c.email}`} className="text-xs text-[var(--color-primary-2)] flex items-center gap-1"><Mail size={12}/>{c.email}</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
