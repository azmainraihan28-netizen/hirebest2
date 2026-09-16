import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Plus, BarChart3, X, Search, LayoutGrid, Package, Trash2, Command } from 'lucide-react'
import Logo from '../Logo'
import SidebarUserMenu from './SidebarUserMenu'
import { useAuth } from '../../lib/auth'
import { listScreeningsWithStats, deleteScreening, type ScreeningStats } from '../../lib/screenings'
import { useSidebar } from './DashboardLayout'

/** Buckets the screening list into time groups so a long list stays scannable. */
function bucketOf(iso: string): 'Today' | 'This week' | 'Earlier' {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (d >= startOfToday) return 'Today'
  const weekAgo = new Date(startOfToday)
  weekAgo.setDate(weekAgo.getDate() - 7)
  return d >= weekAgo ? 'This week' : 'Earlier'
}

const GROUP_ORDER = ['Today', 'This week', 'Earlier'] as const

export default function DashboardSidebar() {
  const { user } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const { open, setOpen } = useSidebar()
  const [recent, setRecent] = useState<ScreeningStats[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    listScreeningsWithStats(50).then(r => { setRecent(r); setLoading(false) })
  }, [user, loc.pathname])

  // Close mobile drawer on route change
  useEffect(() => { setOpen(false) }, [loc.pathname])

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = needle ? recent.filter(s => s.name.toLowerCase().includes(needle)) : recent
    const map = new Map<string, ScreeningStats[]>()
    for (const s of list) {
      const key = bucketOf(s.created_at)
      const arr = map.get(key)
      if (arr) arr.push(s)
      else map.set(key, [s])
    }
    return GROUP_ORDER.filter(g => map.has(g)).map(g => [g, map.get(g)!] as const)
  }, [recent, q])

  const remove = async (s: ScreeningStats) => {
    if (!window.confirm(`Delete "${s.name}" and its ${s.total} candidate${s.total === 1 ? '' : 's'}? This cannot be undone.`)) return
    setRecent(list => list.filter(x => x.id !== s.id))
    await deleteScreening(s.id)
    if (loc.pathname.includes(s.id)) nav('/dashboard')
  }

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      <aside className={`
        rail w-64 shrink-0 flex flex-col h-screen z-50
        fixed md:sticky top-0 left-0
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-4 py-4 flex items-center justify-between">
          <Logo />
          <button onClick={() => setOpen(false)} className="md:hidden icon-btn" aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="px-3 pb-3 space-y-1.5">
          <NavLink to="/dashboard/new" className="btn-primary w-full"><Plus size={16}/>New Screening</NavLink>

          <NavLink end to="/dashboard" className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}>
            <LayoutGrid size={15}/>Overview
          </NavLink>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={15}/>Analytics
          </NavLink>
          <NavLink to="/dashboard/orders" className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}>
            <Package size={15}/>Billing
          </NavLink>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"/>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Filter screenings"
              aria-label="Filter screenings"
              className="field pl-8 pr-2 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="px-3 pb-3 flex-1 overflow-y-auto">
          {loading && (
            <div className="space-y-1.5 px-1 py-2">
              {[1,2,3,4].map(i => <div key={i} className="h-7 rounded-md shimmer"/>)}
            </div>
          )}

          {!loading && groups.length === 0 && (
            <div className="px-2 py-6 text-center">
              <div className="text-xs text-[var(--color-muted)]">
                {q ? 'Nothing matches that filter.' : 'No screenings yet.'}
              </div>
              {!q && (
                <button onClick={() => nav('/dashboard/new')} className="btn-link text-xs mt-2 mx-auto">
                  Run your first one
                </button>
              )}
            </div>
          )}

          {!loading && groups.map(([label, items]) => (
            <div key={label}>
              <div className="rail-group">{label}</div>
              <div className="space-y-0.5">
                {items.map(s => (
                  <div key={s.id} className="group relative">
                    <NavLink
                      to={`/dashboard/results/${s.id}`}
                      className={({ isActive }) => `rail-item pr-8 ${isActive ? 'active' : ''}`}
                      title={`${s.name} — ${s.total} CVs, ${s.fit} fit`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: s.fit > 0 ? 'var(--color-viz-fit)' : 'var(--color-muted-2)' }}
                        aria-hidden
                      />
                      <span className="truncate flex-1">{s.name}</span>
                      {s.total > 0 && <span className="count-pill">{s.total}</span>}
                    </NavLink>
                    <button
                      onClick={() => remove(s)}
                      aria-label={`Delete ${s.name}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 icon-btn w-6 h-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--color-skip)]"
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('hirebest:open-command'))}
          className="mx-3 mb-2 flex items-center gap-2 px-2.5 py-2 rounded-lg border border-[var(--color-border)] text-[11px] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition"
        >
          <Command size={12}/>
          <span className="flex-1 text-left">Quick search</span>
          <kbd>⌘</kbd><kbd>K</kbd>
        </button>

        <SidebarUserMenu />
      </aside>
    </>
  )
}
