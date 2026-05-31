import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, BarChart3, History, X } from 'lucide-react'
import Logo from '../Logo'
import SidebarUserMenu from './SidebarUserMenu'
import { useAuth } from '../../lib/auth'
import { listScreenings, type Screening } from '../../lib/screenings'
import { useSidebar } from './DashboardLayout'

export default function DashboardSidebar() {
  const { user } = useAuth()
  const loc = useLocation()
  const { open, setOpen } = useSidebar()
  const [recent, setRecent] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    listScreenings().then(r => { setRecent(r); setLoading(false) })
  }, [user, loc.pathname])

  // Close mobile drawer on route change
  useEffect(() => { setOpen(false) }, [loc.pathname])

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      <aside className={`
        sidebar w-60 shrink-0 flex flex-col h-screen z-50
        fixed md:sticky top-0 left-0
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <Logo />
          <button onClick={() => setOpen(false)} className="md:hidden text-[var(--color-muted)] hover:text-[var(--color-fg)]"><X size={18}/></button>
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
            {loading && (
              <div className="space-y-1.5 px-2 py-1">
                {[1,2,3].map(i => <div key={i} className="h-5 rounded bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] animate-pulse"/>)}
              </div>
            )}
            {!loading && recent.length === 0 && <div className="px-2 py-1 text-xs text-[var(--color-muted)] italic">No screenings yet</div>}
            {!loading && recent.map(s => (
              <NavLink key={s.id} to={`/dashboard/results/${s.id}`}
                className={({ isActive }) => `sidebar-item text-xs ${isActive ? 'active' : ''}`}
                title={s.name}>
                <span className="truncate">{s.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <SidebarUserMenu />
      </aside>
    </>
  )
}
