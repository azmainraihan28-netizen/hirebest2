import { useEffect, useState } from 'react'
import { Plus, Shield, X } from 'lucide-react'
import { listProfilesWithUsage, setRoleByEmail, type ExtProfile } from '../../lib/admin'

export default function AdminsPanel() {
  const [users, setUsers] = useState<ExtProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { reload() }, [])
  const reload = async () => { setLoading(true); setUsers(await listProfilesWithUsage()); setLoading(false) }

  const promote = async () => {
    if (!email.trim()) return
    setBusy(true)
    try { await setRoleByEmail(email.trim(), 'super_admin'); setEmail(''); await reload() }
    catch (e: any) { alert(e?.message ?? 'Failed') }
    finally { setBusy(false) }
  }

  const demote = async (u: ExtProfile) => {
    if (!confirm(`Remove admin role from ${u.email}?`)) return
    await setRoleByEmail(u.email, 'user')
    await reload()
  }

  const admins = users.filter(u => u.role === 'super_admin' || u.role === 'admin')

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="font-semibold mb-1">Promote a user to admin</div>
        <div className="text-xs text-[var(--color-muted)] mb-4">User must already have signed up.</div>
        <div className="flex gap-2">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="field text-sm"/>
          <button onClick={promote} disabled={busy || !email.trim()} className="btn-primary text-xs whitespace-nowrap"><Plus size={12}/>Promote</button>
        </div>
      </div>

      {loading && <div className="text-[var(--color-muted)] text-sm">Loading…</div>}

      <div className="space-y-2">
        {admins.length === 0 && !loading && <div className="text-sm text-[var(--color-muted)] py-10 text-center">No admins yet.</div>}
        {admins.map(u => (
          <div key={u.id} className="card p-4 flex items-center gap-3">
            <Shield size={16} className="text-[var(--color-primary-2)]"/>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{u.full_name || u.email}</div>
              <div className="text-xs text-[var(--color-muted)] truncate">{u.email}</div>
            </div>
            <span className="text-xs text-[var(--color-muted)]">Since {new Date(u.created_at).toLocaleDateString()}</span>
            <button onClick={() => demote(u)} className="btn-ghost text-xs"><X size={12}/>Demote</button>
          </div>
        ))}
      </div>
    </div>
  )
}
