import { useMemo, useState } from 'react'
import { X, Copy, Check, Mail } from 'lucide-react'
import type { Candidate } from '../../lib/screenings'

type Kind = 'invite' | 'rejection'

/** Personalised interview-invite / rejection drafts for the selected candidates (Growth plan and up). */
export default function OutreachModal({ candidates, role, company, onClose }: {
  candidates: Candidate[]
  role: string
  company: string
  onClose: () => void
}) {
  const [kind, setKind] = useState<Kind>('invite')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const drafts = useMemo(() => candidates.map(c => ({
    c,
    subject: kind === 'invite' ? `Interview: ${role}${company ? ` at ${company}` : ''}` : `Your application for ${role}`,
    body: kind === 'invite' ? inviteDraft(c, role, company) : rejectionDraft(c, role, company),
  })), [candidates, kind, role, company])

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel w-full max-w-3xl max-h-[88vh]" onClick={e => e.stopPropagation()} role="dialog" aria-label="Outreach email drafts">
        <div className="panel-head">
          <div className="min-w-0">
            <h3 className="panel-title">Outreach drafts</h3>
            <p className="panel-sub">Personalised from each CV's strengths. Edit, then copy or open in your email app.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="seg">
              <button className="seg-item" data-active={kind === 'invite'} onClick={() => { setKind('invite'); setEdits({}) }}>Invite</button>
              <button className="seg-item" data-active={kind === 'rejection'} onClick={() => { setKind('rejection'); setEdits({}) }}>Rejection</button>
            </div>
            <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={16}/></button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {drafts.map(({ c, subject, body }) => {
            const text = edits[c.id] ?? body
            const mailto = `mailto:${encodeURIComponent(c.email ?? '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
            return (
              <div key={c.id} className="panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name ?? 'Candidate'}</div>
                    <div className="text-xs text-[var(--color-muted)] truncate">{c.email ?? 'No email on CV'} · {subject}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => copy(c.id, `Subject: ${subject}\n\n${text}`)} className="btn-ghost text-xs">
                      {copied === c.id ? <Check size={12}/> : <Copy size={12}/>}{copied === c.id ? 'Copied' : 'Copy'}
                    </button>
                    {c.email && <a href={mailto} className="btn-primary text-xs"><Mail size={12}/>Open in email</a>}
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={e => setEdits(m => ({ ...m, [c.id]: e.target.value }))}
                  rows={9}
                  className="field mt-3 text-[13px] leading-relaxed"
                  aria-label={`Email draft for ${c.name ?? 'candidate'}`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const first = (c: Candidate) => (c.name ?? '').trim().split(/\s+/)[0] || 'there'
const sign = (company: string) => `Best regards,\n${company ? `The ${company} hiring team` : 'The hiring team'}`

function inviteDraft(c: Candidate, role: string, company: string): string {
  const strengths = (c.strengths ?? []).slice(0, 2).map(s => s.replace(/\.$/, '').toLowerCase())
  const why = strengths.length
    ? `Your background stood out — especially ${strengths.join(' and ')}.`
    : 'Your background stood out against what we need for this role.'
  return `Hi ${first(c)},

Thank you for applying for the ${role} role${company ? ` at ${company}` : ''}. ${why}

We'd love to invite you to a 30-minute conversation to learn more about your experience and tell you more about the role. Could you share two or three times that work for you over the next week?

Looking forward to speaking with you.

${sign(company)}`
}

function rejectionDraft(c: Candidate, role: string, company: string): string {
  return `Hi ${first(c)},

Thank you for your interest in the ${role} role${company ? ` at ${company}` : ''} and for the time you put into your application.

After careful review, we've decided to move forward with candidates whose experience more closely matches the requirements for this position. This was not an easy decision, and we appreciate you considering us.

We'll keep your details on file and may reach out if a role opens up that's a closer fit. We wish you every success in your search.

${sign(company)}`
}
