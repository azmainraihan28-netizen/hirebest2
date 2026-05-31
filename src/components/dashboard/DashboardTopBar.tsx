import { Link } from 'react-router-dom'
import { Package, Sun, Moon, Shield } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import { useAuth } from '../../lib/auth'

export default function DashboardTopBar({ title, used = 0, limit = 50 }: { title: string; used?: number; limit?: number }) {
  const { theme, toggle } = useTheme()
  const { profile } = useAuth()
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[color-mix(in_srgb,var(--color-bg)_85%,transparent)] border-b border-[var(--color-border)]">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-fg)]">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] border border-[var(--color-border)] text-[var(--color-muted)]">
            Free · <span className="text-[var(--color-fg)] font-medium">{used}/{limit}</span> used
          </span>
          <Link to="/dashboard/orders" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] flex items-center gap-1.5">
            <Package size={15}/>Orders
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-sm text-[var(--color-primary-2)] hover:text-[var(--color-primary)] flex items-center gap-1.5">
              <Shield size={15}/>Admin
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
