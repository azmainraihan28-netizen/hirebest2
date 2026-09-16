import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, LayoutGrid, BarChart3, Package, User as UserIcon, Shield,
  Sun, Moon, FileText, CornerDownLeft,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useTheme } from '../../lib/theme'
import { listScreenings, type Screening } from '../../lib/screenings'

type Item = {
  id: string
  label: string
  hint?: string
  group: 'Actions' | 'Go to' | 'Screenings'
  icon: React.ReactNode
  run: () => void
}

/**
 * ⌘K / Ctrl-K launcher. Opens from the keyboard anywhere in the dashboard, or
 * from the `hirebest:open-command` event that the sidebar button fires.
 */
export default function CommandPalette() {
  const nav = useNavigate()
  const { profile } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const [screenings, setScreenings] = useState<Screening[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('hirebest:open-command', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hirebest:open-command', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) { setQ(''); setCursor(0); return }
    listScreenings(50).then(setScreenings)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [open])

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => { setOpen(false); nav(to) }
    const base: Item[] = [
      { id: 'new', label: 'New screening', hint: 'Score a batch of CVs', group: 'Actions', icon: <Plus size={15}/>, run: go('/dashboard/new') },
      { id: 'theme', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, group: 'Actions', icon: theme === 'dark' ? <Sun size={15}/> : <Moon size={15}/>, run: () => { toggle(); setOpen(false) } },
      { id: 'overview', label: 'Overview', group: 'Go to', icon: <LayoutGrid size={15}/>, run: go('/dashboard') },
      { id: 'analytics', label: 'Analytics', group: 'Go to', icon: <BarChart3 size={15}/>, run: go('/dashboard/analytics') },
      { id: 'orders', label: 'Billing & orders', group: 'Go to', icon: <Package size={15}/>, run: go('/dashboard/orders') },
      { id: 'account', label: 'Account settings', group: 'Go to', icon: <UserIcon size={15}/>, run: go('/account') },
    ]
    if (isAdmin) base.push({ id: 'admin', label: 'Admin console', group: 'Go to', icon: <Shield size={15}/>, run: go('/admin') })

    const screeningItems: Item[] = screenings.map(s => ({
      id: s.id,
      label: s.name,
      hint: new Date(s.created_at).toLocaleDateString(),
      group: 'Screenings',
      icon: <FileText size={15}/>,
      run: go(`/dashboard/results/${s.id}`),
    }))
    return [...base, ...screeningItems]
  }, [screenings, theme, isAdmin, nav, toggle])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter(i => i.label.toLowerCase().includes(needle) || i.group.toLowerCase().includes(needle))
  }, [items, q])

  useEffect(() => { setCursor(0) }, [q])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(filtered.length - 1, c + 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(0, c - 1)) }
      if (e.key === 'Enter') { e.preventDefault(); filtered[cursor]?.run() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, cursor])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  let lastGroup = ''

  return (
    <div className="cmdk-scrim flex items-start justify-center pt-[14vh] px-4" onClick={() => setOpen(false)}>
      <div className="cmdk-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <Search size={16} className="text-[var(--color-muted)]"/>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search screenings or jump to a page…"
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted-2)]"
          />
          <kbd>ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--color-muted)]">No matches for “{q}”.</div>
          )}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            return (
              <div key={`${item.group}-${item.id}`}>
                {header && <div className="rail-group">{header}</div>}
                <div
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={item.run}
                  className="cmdk-item"
                >
                  <span className="text-[var(--color-muted)]">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="text-[11px] text-[var(--color-muted-2)] shrink-0">{item.hint}</span>}
                  {i === cursor && <CornerDownLeft size={13} className="text-[var(--color-muted)] shrink-0"/>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
