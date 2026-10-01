import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { loadQuota, type QuotaState } from '../lib/quota'
import { FEATURE_PLAN, PLAN_NAMES, planAtLeast, type Feature } from '../lib/plans'

/** The signed-in user's effective plan & usage (null while loading). */
export function useQuota(): QuotaState | null {
  const { profile } = useAuth()
  const [q, setQ] = useState<QuotaState | null>(null)
  useEffect(() => { if (profile) loadQuota(profile).then(setQ) }, [profile])
  return q
}

/** Renders `children` only when the user's plan includes `feature`; otherwise an upgrade card. */
export default function PlanGate({ feature, title, children, compact = false }: {
  feature: Feature
  title: string
  children: ReactNode
  compact?: boolean
}) {
  const q = useQuota()
  if (!q) return compact ? null : <div className="p-10 text-sm text-[var(--color-muted)]">Loading…</div>
  if (planAtLeast(q.plan, FEATURE_PLAN[feature])) return <>{children}</>
  return <LockedCard feature={feature} title={title} compact={compact} />
}

export function LockedCard({ feature, title, compact = false }: { feature: Feature; title: string; compact?: boolean }) {
  const need = FEATURE_PLAN[feature]
  const cta = need === 'retainer'
    ? <Link to="/contact" className="btn-primary text-xs">Talk to sales <ArrowRight size={12}/></Link>
    : <Link to={`/checkout?plan=${need}`} className="btn-primary text-xs">Upgrade to {PLAN_NAMES[need]} <ArrowRight size={12}/></Link>
  return (
    <div className={compact ? 'flex items-center justify-between gap-3 flex-wrap' : 'panel empty max-w-xl mx-auto my-10 p-8 text-center'}>
      <div className={compact ? 'flex items-center gap-2 text-sm text-[var(--color-muted)]' : ''}>
        {!compact && <span className="empty-icon mx-auto"><Lock size={18}/></span>}
        {compact && <Lock size={14}/>}
        <span className={compact ? '' : 'block mt-3 text-base font-semibold text-[var(--color-fg)]'}>{title} is included in the {PLAN_NAMES[need]} plan{need === 'retainer' ? '' : ' and above'}.</span>
      </div>
      <div className={compact ? '' : 'mt-5'}>{cta}</div>
    </div>
  )
}
