import { useEffect, useState } from 'react'
import { Building2, Plus, Users } from 'lucide-react'
import { listOrgs, createOrg, listMembers, type Organization, type OrgMember } from '../../lib/orgs'

export default function OrganizationsPanel() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [screeningLimit, setScreeningLimit] = useState('50')
  const [seatLimit, setSeatLimit] = useState('5')

  const reload = async () => {
    setLoading(true)
    setOrgs(await listOrgs())
    setLoading(false)
  }
  useEffect(() => { reload() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!name.trim() || !slug.trim() || !adminEmail.trim()) {
      setErr('Name, slug and admin email are required.'); return
    }
    setCreating(true)
    try {
      await createOrg({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        admin_email: adminEmail.trim(),
        screening_limit: Number(screeningLimit) || 50,
        seat_limit: Number(seatLimit) || 5,
      })
      setName(''); setSlug(''); setAdminEmail(''); setScreeningLimit('50'); setSeatLimit('5')
      await reload()
    } catch (e: any) {
      setErr(e?.message ?? 'Create failed')
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="card p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold"><Plus size={14}/> Create organization</div>
        {err && <div className="text-xs text-red-300">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Google" className="field mt-1"/>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Slug</span>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="google" className="field mt-1"/>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs text-[var(--color-muted)]">Org admin email (must be an existing Hirebest user)</span>
            <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@google.com" className="field mt-1"/>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Screening limit</span>
            <input type="number" min={0} value={screeningLimit} onChange={e => setScreeningLimit(e.target.value)} className="field mt-1"/>
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-muted)]">Seat limit</span>
            <input type="number" min={1} value={seatLimit} onChange={e => setSeatLimit(e.target.value)} className="field mt-1"/>
          </label>
        </div>
        <button disabled={creating} className="btn-primary text-xs">{creating ? 'Creating…' : 'Create org'}</button>
      </form>

      {loading && <div className="text-sm text-[var(--color-muted)]">Loading orgs…</div>}

      <div className="space-y-2.5">
        {orgs.map(o => (
          <OrgRow key={o.id} org={o} expanded={expandedId === o.id} onToggle={() => setExpandedId(v => v === o.id ? null : o.id)}/>
        ))}
        {!loading && orgs.length === 0 && (
          <div className="text-sm text-[var(--color-muted)] py-10 text-center">No organizations yet.</div>
        )}
      </div>
    </div>
  )
}

function OrgRow({ org, expanded, onToggle }: { org: Organization; expanded: boolean; onToggle: () => void }) {
  const [members, setMembers] = useState<OrgMember[] | null>(null)
  useEffect(() => {
    if (expanded && !members) listMembers(org.id).then(setMembers)
  }, [expanded, org.id, members])

  return (
    <div className="card p-4">
      <button onClick={onToggle} className="w-full flex items-center gap-3 text-left">
        <Building2 size={16} className="text-[var(--color-primary-2)]"/>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{org.name}</div>
          <div className="text-xs text-[var(--color-muted)] truncate">/{org.slug} · plan {org.plan} · seats {org.seat_limit} · screenings {org.screening_limit}</div>
        </div>
        <Users size={14} className="text-[var(--color-muted)]"/>
      </button>
      {expanded && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3 space-y-1.5">
          {!members && <div className="text-xs text-[var(--color-muted)]">Loading members…</div>}
          {members && members.length === 0 && <div className="text-xs text-[var(--color-muted)]">No members yet.</div>}
          {members?.map(m => (
            <div key={m.user_id} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate">{m.full_name || m.email}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)]">{m.role_in_org}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
