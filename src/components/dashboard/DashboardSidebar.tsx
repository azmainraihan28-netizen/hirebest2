import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, BarChart3, History, LogOut } from 'lucide-react'
import Logo from '../Logo'
import { useAuth } from '../../lib/auth'
import { listScreenings, type Screening } from '../../lib/screenings'

export default function DashboardSidebar() {
  const { user, signOut } = useAuth()
  const loc = useLocation()
  const [recent, setRecent] = useState<Screening[]>([])

  useEffect(() => {
    if (!user) return
    listScreenings().then(setRecent)
  }, [user, loc.pathname])

  const email = user?.email ?? ''
  const initial = email.slice(0, 1).toUpperCase()

  return (
    <aside className="sidebar w-60 shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--color-border)]">
        <Logo />
      </div>

      <div className="p-3 space-y-1">
        <NavLink to="/dashboard/new" className="btn-primary w-full"><Plus size={16}/>New Screening</NavLink>
        <NavLink to="/dashboard/analytics" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={16}/>Analytics
        </NavLink>
      </div>

      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-2 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          <History size={12}/>Recent
        </div>
        <div className="space-y-0.5">
          {recent.length === 0 && <div className="px-2 py-1 text-xs text-[var(--color-muted)] italic">No screenings yet</div>}
          {recent.map(s => (
            <NavLink key={s.id} to={`/dashboard/results/${s.id}`}
              className={({ isActive }) => `sidebar-item text-xs ${isActive ? 'active' : ''}`}
              title={s.name}>
              <span className="truncate">{s.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-[var(--color-border)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold">{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs truncate text-[var(--color-fg)]">{email}</div>
        </div>
        <button onClick={signOut} className="text-[var(--color-muted)] hover:text-white" title="Sign out">
          <LogOut size={16}/>
        </button>
      </div>
    </aside>
  )
}
