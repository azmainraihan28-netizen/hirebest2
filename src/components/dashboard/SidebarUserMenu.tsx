import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronUp, User as UserIcon, Shield, LogOut, Package } from 'lucide-react'
import { useAuth } from '../../lib/auth'

export default function SidebarUserMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!user) return null
  const email = user.email ?? ''
  const initial = email.slice(0, 1).toUpperCase()
  const isAdmin = profile?.role === 'admin'

  return (
    <div ref={ref} className="relative p-3 border-t border-[var(--color-border)]">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 card p-1.5 z-50 shadow-xl">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--color-muted)] truncate border-b border-[var(--color-border)] mb-1">{email}</div>
          <Link to="/account" onClick={() => setOpen(false)} className="sidebar-item w-full text-sm">
            <UserIcon size={14}/>Account
          </Link>
          <Link to="/dashboard/orders" onClick={() => setOpen(false)} className="sidebar-item w-full text-sm">
            <Package size={14}/>Orders
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="sidebar-item w-full text-sm text-[var(--color-primary-2)]">
              <Shield size={14}/>Admin
            </Link>
          )}
          <button
            onClick={async () => { setOpen(false); await signOut(); nav('/') }}
            className="sidebar-item w-full text-sm text-red-300 hover:text-red-200"
          >
            <LogOut size={14}/>Sign out
          </button>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 hover:bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] rounded-md p-1 -m-1 transition">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-fg)] text-xs font-semibold">{initial}</div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs truncate text-[var(--color-fg)]">{email}</div>
          {isAdmin && <div className="text-[10px] text-[var(--color-primary-2)]">Admin</div>}
        </div>
        <ChevronUp size={14} className={`text-[var(--color-muted)] transition ${open ? 'rotate-180' : ''}`}/>
      </button>
    </div>
  )
}
