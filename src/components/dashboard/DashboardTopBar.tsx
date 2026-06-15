import { Link } from 'react-router-dom'
import { Package, Sun, Moon, Shield, Menu, Sparkles } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import { useAuth } from '../../lib/auth'
import { useSidebar } from './DashboardLayout'
import { isUnlimited } from '../../lib/quota'

type Props = {
  title: string
  used?: number
  limit?: number
  unlimited?: boolean
}

export default function DashboardTopBar({ title, used = 0, limit = 50, unlimited: unlimitedProp }: Props) {
  const { theme, toggle } = useTheme()
  const { profile } = useAuth()
  const { setOpen } = useSidebar()

  const unlimited = unlimitedProp ?? isUnlimited(profile?.plan)
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const danger = pct >= 90
  const warn = pct >= 70 && !danger
  const planLabel = profile?.plan === 'lifetime' ? 'Team'
    : profile?.plan === 'advanced' ? 'Growth'
    : profile?.plan === 'basic' ? 'Starter'
    : profile?.plan === 'retainer' ? 'Enterprise'
    : 'Free'

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[color-mix(in_srgb,var(--color-bg)_85%,transparent)] border-b border-[var(--color-border)]">
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setOpen(true)} className="md:hidden text-[var(--color-muted)] hover:text-[var(--color-fg)] p-1 -ml-1" aria-label="Menu">
            <Menu size={20}/>
          </button>
          <h1 className="text-base md:text-lg font-semibold text-[var(--color-fg)] truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {unlimited ? (
            <span className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full bg-[rgba(47,123,255,0.1)] border border-[rgba(47,123,255,0.3)] text-[var(--color-primary-2)] items-center gap-1.5">
              <Sparkles size={11}/>{planLabel} · Unlimited
            </span>
          ) : (
            <Link to="/checkout?plan=advanced" className={`hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full border items-center gap-2 transition ${
              danger ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
              : warn ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20'
              : 'bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'
            }`}>
              {planLabel} · <span className={danger || warn ? '' : 'text-[var(--color-fg)] font-medium'}>{used}/{limit}</span> used
              {(danger || warn) && <span className="underline">Upgrade</span>}
            </Link>
          )}
          <Link to="/dashboard/orders" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] flex items-center gap-1.5">
            <Package size={15}/><span className="hidden md:inline">Orders</span>
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-sm text-[var(--color-primary-2)] hover:text-[var(--color-primary)] flex items-center gap-1.5">
              <Shield size={15}/><span className="hidden md:inline">Admin</span>
            </Link>
          )}
          <button onClick={toggle} className="w-9 h-9 rounded-full hover:bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center text-[var(--color-muted)]" title="Toggle theme">
            {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
          </button>
        </div>
      </div>
    </header>
  )
}
