import { Link } from 'react-router-dom'
import { X, Sparkles, Check, ArrowRight } from 'lucide-react'
import type { QuotaState } from '../lib/quota'
import { PLAN_ENTITLEMENTS, PLAN_NAMES, PLAN_RANK, FEATURE_PLAN, type Feature, type PlanTier } from '../lib/plans'

export type UpgradeReason = 'quota-exceeded' | 'quota-warning' | 'inactive' | 'job-slots' | 'batch-cap' | 'feature'

type Props = {
  reason: UpgradeReason
  quota?: QuotaState | null
  attemptedCount?: number
  /** For reason="feature": which feature was blocked. */
  feature?: Feature
  featureLabel?: string
  onClose: () => void
}

const NEXT: Record<PlanTier, PlanTier> = { free: 'basic', basic: 'advanced', advanced: 'lifetime', lifetime: 'retainer', retainer: 'retainer' }
const fmt = (n: number) => (isFinite(n) ? n.toLocaleString() : 'Unlimited')
const resetDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'the 1st')

export default function UpgradeModal({ reason, quota, attemptedCount, feature, featureLabel, onClose }: Props) {
  const plan: PlanTier = quota?.plan ?? 'free'
  const used = quota?.used ?? 0
  const limit = quota?.limit ?? 0

  // Smallest plan that solves the problem.
  let target: PlanTier = NEXT[plan]
  if (reason === 'feature' && feature) target = FEATURE_PLAN[feature]
  if (reason === 'batch-cap') target = (['advanced', 'retainer'] as PlanTier[]).find(p => PLAN_RANK[p] > PLAN_RANK[plan]) ?? 'retainer'
  if (reason === 'job-slots') target = (['basic', 'advanced', 'lifetime'] as PlanTier[]).find(p => PLAN_RANK[p] > PLAN_RANK[plan] && PLAN_ENTITLEMENTS[p].jobSlots > (quota?.jobSlots ?? 0)) ?? 'lifetime'
  const t = PLAN_ENTITLEMENTS[target]

  const titles: Record<UpgradeReason, string> = {
    'quota-exceeded': 'Monthly CV limit reached',
    'quota-warning': 'This batch is over your monthly limit',
    'inactive': 'Your account is suspended',
    'job-slots': 'All your active job slots are in use',
    'batch-cap': 'That’s more CVs than one batch allows',
    'feature': `${featureLabel ?? 'This feature'} is on the ${PLAN_NAMES[target]} plan`,
  }
  const bodies: Record<UpgradeReason, string> = {
    'quota-exceeded': `You've screened ${used} of ${fmt(limit)} CVs on the ${PLAN_NAMES[plan]} plan this month. Your allowance resets on ${resetDate(quota?.resetsOn)}, or upgrade for more now.`,
    'quota-warning': `You've screened ${used} of ${fmt(limit)} CVs this month${attemptedCount ? `, and this batch of ${attemptedCount} would go ${used + attemptedCount - limit} over` : ''}. Remove some CVs or upgrade.`,
    'inactive': 'Your account has been suspended. Contact support to reactivate.',
    'job-slots': `The ${PLAN_NAMES[plan]} plan includes ${fmt(quota?.jobSlots ?? 0)} active job${quota?.jobSlots === 1 ? '' : 's'}. Archive a finished job from its results page, add these CVs to an existing job, or upgrade.`,
    'batch-cap': `The ${PLAN_NAMES[plan]} plan screens up to ${quota?.batchCap ?? 50} CVs per batch. We kept the first ${quota?.batchCap ?? 50}.`,
    'feature': `Upgrade to ${PLAN_NAMES[target]} to unlock it.`,
  }
  const perks = [
    `${fmt(t.cvLimit)} CVs / month`,
    `${fmt(t.jobSlots)} active job slots`,
    `Up to ${t.batchCap} CVs per batch`,
    `${fmt(t.seats)} user${t.seats === 1 ? '' : 's'}`,
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()} role="dialog" aria-label={titles[reason]}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-fg)]" aria-label="Close"><X size={18}/></button>

          <div className="w-12 h-12 rounded-xl bg-[rgba(47,123,255,0.15)] flex items-center justify-center">
            <Sparkles size={22} className="text-[var(--color-primary-2)]"/>
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight">{titles[reason]}</h2>
          <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{bodies[reason]}</p>

          {reason !== 'inactive' && target !== plan && (
            <>
              <div className="mt-5 text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">{PLAN_NAMES[target]} includes</div>
              <ul className="mt-2 space-y-2 text-sm">
                {perks.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[var(--color-fg)]">
                    <Check size={14} className="text-[var(--color-primary)] mt-1 shrink-0"/>{f}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {reason === 'inactive' ? (
              <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="btn-primary w-full">Contact support</a>
            ) : target === 'retainer' ? (
              <Link to="/contact" className="btn-primary w-full">Talk to sales <ArrowRight size={14}/></Link>
            ) : target !== plan ? (
              <Link to={`/checkout?plan=${target}`} className="btn-primary w-full">Upgrade to {PLAN_NAMES[target]} <ArrowRight size={14}/></Link>
            ) : null}
            <Link to="/pricing" onClick={onClose} className="btn-ghost w-full">See all plans</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
