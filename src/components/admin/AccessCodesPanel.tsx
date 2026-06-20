import { useEffect, useState } from 'react'
import { Plus, Copy, Trash2 } from 'lucide-react'
import { listAccessCodes, createAccessCode, deleteAccessCode, PLAN_LABELS, PLAN_OPTIONS, type AccessCode, type PlanKey } from '../../lib/admin'

export default function AccessCodesPanel() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [plan, setPlan] = useState<PlanKey>('lifetime')
  const [bonus, setBonus] = useState('0')
  const [uses, setUses] = useState('1')
  const [exp, setExp] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { reload() }, [])
  const reload = async () => { setLoading(true); setCodes(await listAccessCodes()); setLoading(false) }

  const create = async () => {
    setBusy(true)
    try {
      await createAccessCode({
        plan,
        bonus_screenings: parseInt(bonus, 10) || 0,
        uses: Math.max(1, parseInt(uses, 10) || 1),
        expires_at: exp ? new Date(exp).toISOString() : null,
      })
      setShowForm(false)
      setPlan('lifetime'); setBonus('0'); setUses('1'); setExp('')
      await reload()
    } catch (e: any) { alert(e?.message ?? 'Failed') }
    finally { setBusy(false) }
  }

  const remove = async (c: AccessCode) => {
    if (!confirm(`Delete code ${c.code}?`)) return
    await deleteAccessCode(c.id, c.code)
    await reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">Access Codes</div>
          <div className="text-xs text-[var(--color-muted)] mt-1">Generate redeemable codes that grant a paid plan or bonus screenings.</div>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary text-xs"><Plus size={12}/>{showForm ? 'Cancel' : 'New code'}</button>
      </div>

      {showForm && (
        <div className="card p-5 grid sm:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Plan</span>
            <select value={plan} onChange={e => setPlan(e.target.value as PlanKey)} className="field mt-1 text-sm">
              {PLAN_OPTIONS.map(p => (
                <option key={p} value={p}>{p === 'free' ? 'Free + bonus' : PLAN_LABELS[p]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Bonus screenings</span>
            <input type="number" min={0} value={bonus} onChange={e => setBonus(e.target.value)} className="field mt-1 text-sm"/>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Max uses</span>
            <input type="number" min={1} value={uses} onChange={e => setUses(e.target.value)} className="field mt-1 text-sm"/>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Expires (optional)</span>
            <input type="date" value={exp} onChange={e => setExp(e.target.value)} className="field mt-1 text-sm"/>
          </label>
          <div className="sm:col-span-4">
            <button onClick={create} disabled={busy} className="btn-primary text-xs">{busy ? 'Generating…' : 'Generate code'}</button>
          </div>
        </div>
      )}

      {loading && <div className="text-[var(--color-muted)] text-sm">Loading…</div>}
      {!loading && codes.length === 0 && <div className="text-sm text-[var(--color-muted)] py-10 text-center">No codes yet.</div>}

      <div className="space-y-2">
        {codes.map(c => {
          const expired = c.expires_at && new Date(c.expires_at) < new Date()
          const exhausted = c.uses_remaining === 0
          const status = expired ? 'Expired' : exhausted ? 'Used' : 'Active'
          const tone = status === 'Active' ? 'verdict-fit' : status === 'Used' ? 'verdict-skip' : 'verdict-maybe'
          return (
            <div key={c.id} className="card p-4 flex flex-wrap items-center gap-3">
              <code className="text-sm font-mono font-semibold text-[var(--color-primary-2)]">{c.code}</code>
              <span className={`text-xs px-2 py-0.5 rounded ${tone}`}>{status}</span>
              <span className="text-xs text-[var(--color-muted)]">{c.plan === 'free' ? `+${c.bonus_screenings} screenings` : PLAN_LABELS[c.plan]}</span>
              <span className="text-xs text-[var(--color-muted)]">{c.uses_remaining}/{c.total_uses} uses left</span>
              {c.expires_at && <span className="text-xs text-[var(--color-muted)]">expires {new Date(c.expires_at).toLocaleDateString()}</span>}
              <div className="ml-auto flex gap-1">
                <button onClick={() => navigator.clipboard.writeText(c.code)} title="Copy" className="text-[var(--color-muted)] hover:text-[var(--color-fg)] p-2"><Copy size={14}/></button>
                <button onClick={() => remove(c)} title="Delete" className="text-[var(--color-muted)] hover:text-red-400 p-2"><Trash2 size={14}/></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
