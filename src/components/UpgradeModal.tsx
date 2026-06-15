import { Link } from 'react-router-dom'
import { X, Sparkles, Check, ArrowRight } from 'lucide-react'

type Props = {
  reason: 'quota-exceeded' | 'quota-warning' | 'inactive'
  used?: number
  limit?: number
  attemptedCount?: number
  onClose: () => void
}

export default function UpgradeModal({ reason, used = 0, limit = 0, attemptedCount, onClose }: Props) {
  const titles = {
    'quota-exceeded': 'You\'ve hit your free quota',
    'quota-warning': 'Heads up — close to your limit',
    'inactive': 'Your account is suspended',
  }
  const bodies = {
    'quota-exceeded': `You've used all ${limit} of your free screenings. Upgrade to keep going — all paid plans include unlimited screenings.`,
    'quota-warning': `You've used ${used} of ${limit} free screenings${attemptedCount ? `, and this batch would push you ${used + attemptedCount - limit} over the limit` : ''}. Upgrade for unlimited.`,
    'inactive': 'Your account has been suspended. Contact support to reactivate.',
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-fg)]"><X size={18}/></button>

          <div className="w-12 h-12 rounded-xl bg-[rgba(47,123,255,0.15)] flex items-center justify-center">
            <Sparkles size={22} className="text-[var(--color-primary-2)]"/>
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight">{titles[reason]}</h2>
          <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{bodies[reason]}</p>

          {reason !== 'inactive' && (
            <ul className="mt-5 space-y-2 text-sm">
              {[
                'Unlimited CV screenings, every plan',
                'Side-by-side compare, history, analytics',
                'Cancel anytime, 30-day refund',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-[var(--color-fg)]">
                  <Check size={14} className="text-[var(--color-primary)] mt-1 shrink-0"/>{f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {reason === 'inactive' ? (
              <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="btn-primary w-full">Contact support</a>
            ) : (
              <>
                <Link to="/checkout?plan=advanced" className="btn-primary w-full">Upgrade to Growth — $99/mo <ArrowRight size={14}/></Link>
                <Link to="/pricing" onClick={onClose} className="btn-ghost w-full">See all plans</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
