import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronUp, User as UserIcon, Shield, LogOut, Package, FolderKanban, Check } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useCurrentOrg } from '../../hooks/useCurrentOrg'

export default function SidebarUserMenu() {
  const { user, profile, signOut } = useAuth()
  const { orgs, currentOrgId, setCurrentOrgId, loading: orgsLoading } = useCurrentOrg()
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
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  return (
    <div ref={ref} className="relative p-3 border-t border-[var(--color-border)]">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 card p-1.5 z-50 shadow-xl">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--color-muted)] truncate border-b border-[var(--color-border)] mb-1">{email}</div>
          {!orgsLoading && orgs.length > 0 && (
            <div className="border-b border-[var(--color-border)] pb-1 mb-1">
              <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Folders</div>
              {orgs.map(org => {
                const active = org.org_id === currentOrgId
                return (
                  <button
                    key={org.org_id}
                    onClick={() => {
                      setCurrentOrgId(org.org_id)
                      setOpen(false)
                      nav('/dashboard')
                    }}
                    className={`sidebar-item w-full text-sm ${active ? 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-fg)]' : ''}`}
                  >
                    <FolderKanban size={14}/>
                    <span className="flex-1 truncate text-left">{org.name}</span>
                    {org.role_in_org === 'org_admin' && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-primary-2)]/15 text-[var(--color-primary-2)]">Admin</span>
                    )}
                    {active && <Check size={12} className="text-[var(--color-primary-2)]"/>}
                  </button>
                )
              })}
            </div>
          )}
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
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-fg)] text-xs font-semibold overflow-hidden">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/>
            : initial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs truncate text-[var(--color-fg)]">{email}</div>
          {isAdmin && <div className="text-[10px] text-[var(--color-primary-2)]">Admin</div>}
        </div>
        <ChevronUp size={14} className={`text-[var(--color-muted)] transition ${open ? 'rotate-180' : ''}`}/>
      </button>
    </div>
  )
}
