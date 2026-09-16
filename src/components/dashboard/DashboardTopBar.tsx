import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sun, Moon, Shield, Menu, Sparkles, Search } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import { useAuth } from '../../lib/auth'
import { useSidebar } from './DashboardLayout'
import { isUnlimited, loadQuota, type QuotaState } from '../../lib/quota'

type Props = {
  title: string
  /** Optional line under the title — context for the page you're on. */
  subtitle?: string
  /** Page-level actions, rendered left of the utility cluster. */
  actions?: React.ReactNode
  /** Quota overrides. Omit them and the bar loads the signed-in user's quota itself. */
  used?: number
  limit?: number
  unlimited?: boolean
}

const PLAN_LABELS: Record<string, string> = {
  lifetime: 'Team',
  advanced: 'Growth',
  basic: 'Starter',
  retainer: 'Enterprise',
}

export default function DashboardTopBar({ title, subtitle, actions, used, limit, unlimited: unlimitedProp }: Props) {
  const { theme, toggle } = useTheme()
  const { profile } = useAuth()
  const { setOpen } = useSidebar()
  const [quota, setQuota] = useState<QuotaState | null>(null)

  // Self-load quota so every page shows the same, correct meter even when the
  // page itself doesn't track usage.
  useEffect(() => {
    if (used != null && limit != null) return
    if (profile) loadQuota(profile).then(setQuota)
  }, [profile, used, limit])

  const unlimited = unlimitedProp ?? quota?.unlimited ?? isUnlimited(profile?.plan)
  const usedN = used ?? quota?.used ?? 0
  const limitN = limit ?? (quota && isFinite(quota.limit) ? quota.limit : 50)
  const pct = limitN > 0 ? Math.min(100, (usedN / limitN) * 100) : 0
  const danger = pct >= 90
  const warn = pct >= 70 && !danger
  const planLabel = PLAN_LABELS[profile?.plan ?? ''] ?? 'Free'
  const ringColor = danger ? 'var(--color-skip)' : warn ? 'var(--color-viz-maybe)' : 'var(--color-primary)'

  return (
    <header className="topbar sticky top-0 z-30">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setOpen(true)} className="md:hidden icon-btn -ml-1" aria-label="Open menu">
            <Menu size={18}/>
          </button>
          <div className="min-w-0">
            <h1 className="text-[0.95rem] md:text-base font-semibold text-[var(--color-fg)] truncate leading-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-[var(--color-muted)] truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {actions}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('hirebest:open-command'))}
            className="hidden lg:flex items-center gap-2 h-8 pl-2.5 pr-2 rounded-lg border border-[var(--color-border)] text-[11px] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition"
            aria-label="Open quick search"
          >
            <Search size={12}/><span>Search</span><kbd>⌘</kbd><kbd>K</kbd>
          </button>

          {unlimited ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] text-[var(--color-primary-2)]">
              <Sparkles size={11}/>{planLabel} · Unlimited
            </span>
          ) : (
            <Link
              to="/checkout?plan=advanced"
              title={`${usedN} of ${limitN} CVs used on the ${planLabel} plan`}
              className="hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition"
            >
              <QuotaRing pct={pct} color={ringColor}/>
              <span className="text-[11px] text-[var(--color-muted)]">
                <span className="text-[var(--color-fg)] font-medium tabular">{usedN}</span>
                <span className="text-[var(--color-muted-2)]">/{limitN}</span>
              </span>
              {(danger || warn) && (
                <span className="text-[11px] font-medium" style={{ color: ringColor }}>Upgrade</span>
              )}
            </Link>
          )}

          {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
            <Link to="/admin" className="icon-btn tt text-[var(--color-primary-2)]" data-tip="Admin console">
              <Shield size={15}/>
            </Link>
          )}

          <button onClick={toggle} className="icon-btn tt" data-tip={theme === 'dark' ? 'Light theme' : 'Dark theme'} aria-label="Toggle theme">
            {theme === 'dark' ? <Moon size={15}/> : <Sun size={15}/>}
          </button>
        </div>
      </div>
    </header>
  )
}

/** Tiny usage ring — the meter reads at a glance without taking bar space. */
function QuotaRing({ pct, color }: { pct: number; color: string }) {
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90 shrink-0" aria-hidden>
      <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" stroke="color-mix(in srgb, var(--color-fg) 12%, transparent)"/>
      <circle
        cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" stroke={color} strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
      />
    </svg>
  )
}
