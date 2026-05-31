import { X, Crown, GitCompare } from 'lucide-react'
import ScoreGauge from './ScoreGauge'
import VerdictPill from './VerdictPill'
import type { Candidate } from '../../lib/screenings'

export default function CompareModal({ candidates, onClose }: { candidates: Candidate[]; onClose: () => void }) {
  if (candidates.length === 0) return null
  const winner = [...candidates].sort((a, b) => b.score - a.score)[0]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(47,123,255,0.15)] flex items-center justify-center"><GitCompare size={16} className="text-[var(--color-primary-2)]"/></div>
            <div>
              <h3 className="font-semibold text-[var(--color-fg)]">Compare candidates</h3>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Side-by-side view of {candidates.length} shortlisted candidates.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]"><X size={18}/></button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(0, 1fr))` }}>
            {candidates.map(c => {
              const isWinner = c.id === winner.id && candidates.length > 1
              return (
                <div key={c.id} className={`card p-5 relative ${isWinner ? 'border-[var(--color-primary)]' : ''}`}>
                  {isWinner && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white uppercase tracking-wider flex items-center gap-1">
                      <Crown size={10}/>Top score
                    </span>
                  )}
                  <div className="flex flex-col items-center text-center">
                    <ScoreGauge score={c.score} size={72}/>
                    <div className="mt-3 text-sm font-semibold uppercase tracking-wide truncate w-full">{c.name ?? c.file_name ?? 'Unknown'}</div>
                    <div className="text-[11px] text-[var(--color-muted)] truncate w-full">{c.email ?? '—'}</div>
                    <div className="mt-3"><VerdictPill verdict={c.verdict}/></div>
                  </div>

                  <Section label="Experience">
                    <div className="text-sm">{c.experience_years != null ? `${c.experience_years} yrs` : '—'}</div>
                  </Section>

                  <Section label="Skills">
                    <div className="flex gap-1 flex-wrap">
                      {(c.skills ?? []).slice(0, 6).map(s => <span key={s} className="skill-chip">{s}</span>)}
                    </div>
                  </Section>

                  <Section label="Summary">
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">{c.summary || '—'}</p>
                  </Section>

                  <Section label="Strengths" tone="green">
                    <ul className="text-xs text-[var(--color-muted)] space-y-1">
                      {(c.strengths ?? []).slice(0, 4).map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </Section>

                  <Section label="Gaps" tone="yellow">
                    <ul className="text-xs text-[var(--color-muted)] space-y-1">
                      {(c.gaps ?? []).slice(0, 4).map((s, i) => <li key={i}>• {s}</li>)}
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

function Section({ label, tone, children }: { label: string; tone?: 'green' | 'yellow'; children: React.ReactNode }) {
  const color = tone === 'green' ? 'text-green-400' : tone === 'yellow' ? 'text-yellow-300' : 'text-[var(--color-muted)]'
  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
      <div className={`text-[10px] uppercase tracking-wider mb-2 ${color}`}>{label}</div>
      {children}
    </div>
  )
}
