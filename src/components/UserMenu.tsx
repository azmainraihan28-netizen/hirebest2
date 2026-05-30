import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, LayoutDashboard, Shield, User as UserIcon } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  if (!user) return null
  const initial = (user.email ?? '?').slice(0, 1).toUpperCase()
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm flex items-center justify-center">
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 card p-2 z-40">
            <div className="px-3 py-2 text-xs text-[var(--color-muted)] truncate">{user.email}</div>
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm"><LayoutDashboard size={14}/>Dashboard</Link>
            <Link to="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm"><UserIcon size={14}/>Account</Link>
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm text-[var(--color-primary-2)]"><Shield size={14}/>Admin</Link>}
            <button onClick={async () => { await signOut(); setOpen(false); nav('/') }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 text-sm text-red-300"><LogOut size={14}/>Sign out</button>
          </div>
        </>
      )}
    </div>
  )
}
