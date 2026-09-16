import { useEffect } from 'react'
import { X, Crown, GitCompare } from 'lucide-react'
import ScoreGauge from './ScoreGauge'
import VerdictPill from './VerdictPill'
import type { Candidate } from '../../lib/screenings'

export default function CompareModal({ candidates, onClose }: { candidates: Candidate[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (candidates.length === 0) return null
  const winner = [...candidates].sort((a, b) => b.score - a.score)[0]
  const mostExperienced = [...candidates].sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0))[0]

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel w-full max-w-6xl max-h-[90vh]" onClick={e => e.stopPropagation()} role="dialog" aria-label="Compare candidates">
        <div className="panel-head">
          <div className="flex items-start gap-3">
            <span className="icon-badge shrink-0"><GitCompare size={16}/></span>
            <div>
              <h3 className="panel-title">Compare candidates</h3>
              <p className="panel-sub">Side by side · {candidates.length} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={16}/></button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(0, 1fr))` }}>
            {candidates.map(c => {
              const isWinner = c.id === winner.id && candidates.length > 1
              const isSenior = c.id === mostExperienced.id && candidates.length > 1 && (c.experience_years ?? 0) > 0
              return (
                <div
                  key={c.id}
                  className={`panel p-5 relative ${isWinner ? 'border-[color-mix(in_srgb,var(--color-primary)_55%,transparent)]' : ''}`}
                >
                  {isWinner && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] uppercase tracking-[0.12em] font-semibold flex items-center gap-1 whitespace-nowrap">
                      <Crown size={10}/>Top score
                    </span>
                  )}
                  <div className="flex flex-col items-center text-center">
                    <ScoreGauge score={c.score} size={72}/>
                    <div className="mt-3 text-sm font-semibold truncate w-full">{c.name ?? c.file_name ?? 'Unknown'}</div>
                    <div className="text-[11px] text-[var(--color-muted)] truncate w-full">{c.email ?? 'No email found'}</div>
                    <div className="mt-3"><VerdictPill verdict={c.verdict}/></div>
                  </div>

                  <Section label="Experience">
                    <div className="text-sm flex items-center gap-2">
                      {c.experience_years != null ? `${c.experience_years} yrs` : '—'}
                      {isSenior && <span className="count-pill">most</span>}
                    </div>
                  </Section>

                  <Section label="Skills">
                    <div className="flex gap-1 flex-wrap">
                      {(c.skills ?? []).slice(0, 6).map(s => <span key={s} className="skill-chip">{s}</span>)}
                      {(c.skills ?? []).length === 0 && <span className="text-xs text-[var(--color-muted)]">None detected.</span>}
                    </div>
                  </Section>

                  <Section label="Summary">
                    <p className="text-xs text-[var(--color-fg-dim)] leading-relaxed">{c.summary || '—'}</p>
                  </Section>

                  <Section label="Strengths" color="var(--color-viz-fit)">
                    <ul className="text-xs text-[var(--color-fg-dim)] space-y-1.5">
                      {(c.strengths ?? []).slice(0, 4).map((s, i) => <li key={i} className="wrap-anywhere">— {s}</li>)}
                    </ul>
                  </Section>

                  <Section label="Gaps" color="var(--color-viz-maybe)">
                    <ul className="text-xs text-[var(--color-fg-dim)] space-y-1.5">
                      {(c.gaps ?? []).slice(0, 4).map((s, i) => <li key={i} className="wrap-anywhere">— {s}</li>)}
                    </ul>
                  </Section>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ label, color, children }: { label: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
      <div className="eyebrow mb-2 flex items-center gap-1.5">
        {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>}
        {label}
      </div>
      {children}
    </div>
  )
}
