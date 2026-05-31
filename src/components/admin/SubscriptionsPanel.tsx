import { useEffect, useMemo, useState } from 'react'
import { Search, Save } from 'lucide-react'
import { listProfilesWithUsage, getDefaultFreeLimit, setDefaultFreeLimit, updateProfileFields, type ExtProfile } from '../../lib/admin'

export default function SubscriptionsPanel() {
  const [users, setUsers] = useState<ExtProfile[]>([])
  const [defaultLimit, setDefLimit] = useState(50)
  const [defaultDraft, setDefaultDraft] = useState('50')
  const [defaultSaving, setDefaultSaving] = useState(false)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { reload() }, [])

  const reload = async () => {
    setLoading(true)
    const [u, d] = await Promise.all([listProfilesWithUsage(), getDefaultFreeLimit()])
    setUsers(u); setDefLimit(d); setDefaultDraft(String(d)); setLoading(false)
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return users
    const n = q.toLowerCase()
    return users.filter(u =>
      (u.email ?? '').toLowerCase().includes(n) ||
      (u.full_name ?? '').toLowerCase().includes(n)
    )
  }, [users, q])

  const saveDefault = async () => {
    const n = parseInt(defaultDraft, 10)
    if (Number.isNaN(n) || n < 0) return
    setDefaultSaving(true)
    await setDefaultFreeLimit(n)
    setDefLimit(n); setDefaultSaving(false)
  }

  return (
    <div className="space-y-5">

      <div className="card p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold">Default free screening limit</div>
          <div className="text-xs text-[var(--color-muted)] mt-1">Applied to free users without a per-user override.</div>
        </div>
        <div className="flex gap-2">
          <input type="number" min={0} value={defaultDraft} onChange={e => setDefaultDraft(e.target.value)} className="field w-24"/>
          <button onClick={saveDefault} disabled={defaultSaving || parseInt(defaultDraft, 10) === defaultLimit} className="btn-primary text-xs"><Save size={12}/>Save</button>
        </div>
      </div>

      <div className="card p-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email or name…" className="field pl-9"/>
        </div>
      </div>

      {loading && <div className="text-[var(--color-muted)] text-sm">Loading users…</div>}

      <div className="space-y-2.5">
        {filtered.map(u => (
          <UserRow key={u.id} u={u} defaultLimit={defaultLimit} onChange={reload}/>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-[var(--color-muted)] py-10 text-center">No users match.</div>
        )}
      </div>
    </div>
  )
}

function UserRow({ u, defaultLimit, onChange }: { u: ExtProfile; defaultLimit: number; onChange: () => void }) {
  const [limit, setLimit] = useState(String(u.screening_limit ?? defaultLimit))
  const [plan, setPlan] = useState(u.plan)
  const [active, setActive] = useState(u.active)
  const [busy, setBusy] = useState(false)

  const limitChanged = parseInt(limit, 10) !== (u.screening_limit ?? defaultLimit)
  const planChanged = plan !== u.plan
  const activeChanged = active !== u.active

  const dirty = limitChanged || planChanged || activeChanged

  const save = async () => {
    setBusy(true)
    try {
      const n = parseInt(limit, 10)
      const fields: any = {}
      if (limitChanged) fields.screening_limit = Number.isNaN(n) ? null : n
      if (planChanged) fields.plan = plan
      if (activeChanged) fields.active = active
      await updateProfileFields(u.id, fields, u.email)
      onChange()
    } catch (e: any) {
      alert(e?.message ?? 'Update failed')
    } finally { setBusy(false) }
  }

  const planBadge = plan === 'lifetime'
    ? 'bg-[var(--color-primary)] text-white'
    : 'bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] text-[var(--color-muted)] border border-[var(--color-border)]'
  const effectiveLimit = u.screening_limit ?? defaultLimit
  const limitDisplay = plan === 'lifetime' ? '∞' : `${u.screenings_used}/${effectiveLimit}`

  return (
    <div className="card p-4 flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-fg)] truncate">{u.full_name || u.email.split('@')[0]}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider ${planBadge}`}>{plan === 'lifetime' ? 'Lifetime' : 'Free'}</span>
        </div>
        <div className="text-xs text-[var(--color-muted)] mt-1 truncate">
          {u.email} · {limitDisplay === '∞' ? '0 screenings used' : `${limitDisplay} screenings used`}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input type="number" min={0} value={limit} onChange={e => setLimit(e.target.value)} className="field w-20 text-sm"/>
        <button onClick={save} disabled={busy || !dirty} className="btn-primary text-xs"><Save size={12}/>{busy ? '…' : 'Save'}</button>
        <select value={plan} onChange={e => setPlan(e.target.value as any)} className="field w-28 text-sm">
          <option value="free">Free</option>
          <option value="lifetime">Lifetime</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className={`text-xs ${active ? 'text-green-400' : 'text-[var(--color-muted)]'}`}>{active ? 'Active' : 'Suspended'}</span>
          <button
            onClick={() => setActive(a => !a)}
            className={`relative inline-block w-9 h-5 rounded-full transition ${active ? 'bg-[var(--color-primary)]' : 'bg-[color-mix(in_srgb,var(--color-fg)_15%,transparent)]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${active ? 'left-[18px]' : 'left-0.5'}`}/>
          </button>
        </label>
      </div>
    </div>
  )
}
