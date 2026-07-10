import { useEffect, useState } from 'react'
import { Mail, X, Send, Users } from 'lucide-react'
import { getMyOrgs, listMembers, listPendingInvites, inviteMember, revokeInvite, removeMember, getOrgSeatUsage, type MyOrg, type OrgMember, type OrgInvite, type OrgSeatUsage } from '../../lib/orgs'

export default function OrgMembersPanel() {
  const [myOrgs, setMyOrgs] = useState<MyOrg[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [invites, setInvites] = useState<OrgInvite[]>([])
  const [seats, setSeats] = useState<OrgSeatUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    getMyOrgs().then(list => {
      const adminOrgs = list.filter(o => o.role_in_org === 'org_admin')
      setMyOrgs(adminOrgs)
      if (adminOrgs.length > 0) {
        const stored = localStorage.getItem('hirebest.currentOrgId')
        const preferred = stored ? adminOrgs.find(o => o.org_id === stored) : undefined
        setOrgId(preferred?.org_id ?? adminOrgs[0].org_id)
      }
      setLoading(false)
    })
  }, [])

  const reload = async (id: string) => {
    const [m, i, s] = await Promise.all([listMembers(id), listPendingInvites(id), getOrgSeatUsage(id)])
    setMembers(m); setInvites(i); setSeats(s)
  }

  useEffect(() => {
    if (orgId) reload(orgId)
  }, [orgId])

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId || !email.trim()) return
    setErr(null); setOk(null); setSending(true)
    try {
      await inviteMember(orgId, email.trim())
      setOk(`Invite sent to ${email.trim()}`)
      setEmail('')
      await reload(orgId)
    } catch (e: any) {
      setErr(e?.message ?? 'Invite failed')
    } finally { setSending(false) }
  }

  if (loading) return <div className="text-sm text-[var(--color-muted)]">Loading…</div>
  if (myOrgs.length === 0) return <div className="text-sm text-[var(--color-muted)] py-10 text-center">You don't administer any organizations.</div>

  return (
    <div className="space-y-5">
      {myOrgs.length > 1 && (
        <div className="card p-4">
          <label className="text-xs text-[var(--color-muted)]">Organization</label>
          <select value={orgId ?? ''} onChange={e => setOrgId(e.target.value)} className="field mt-1">
            {myOrgs.map(o => <option key={o.org_id} value={o.org_id}>{o.name}</option>)}
          </select>
        </div>
      )}

      <form onSubmit={invite} className="card p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold"><Mail size={14}/> Invite a member</div>
          {seats && seats.seatLimit > 0 && (
            <div className={`text-[11px] flex items-center gap-1.5 px-2 py-1 rounded-full border ${
              seats.remaining === 0
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] text-[var(--color-muted)]'
            }`}>
              <Users size={11}/>
              <span className="tabular-nums font-medium">{seats.used}/{seats.seatLimit}</span>
              <span>seats used</span>
            </div>
          )}
        </div>
        {err && <div className="text-xs text-red-300">{err}</div>}
        {ok && <div className="text-xs text-green-300">{ok}</div>}
        {seats && seats.seatLimit > 0 && seats.remaining === 0 && (
          <div className="text-xs text-amber-300">
            You've filled every seat this organization has. Ask a super admin to raise the seat limit before inviting more members.
          </div>
        )}
        <div className="flex gap-2">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="teammate@example.com" className="field flex-1"/>
          {(() => {
            const seatFull = !!seats && seats.seatLimit > 0 && seats.remaining === 0
            return (
              <button disabled={sending || seatFull} className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                <Send size={12}/>{sending ? 'Sending…' : 'Invite'}
              </button>
            )
          })()}
        </div>
      </form>

      <div className="card p-5">
        <div className="font-semibold mb-3">Members ({members.length})</div>
        <div className="space-y-1.5">
          {members.map(m => (
            <div key={m.user_id} className="flex items-center gap-2 text-sm py-1">
              <span className="flex-1 truncate">{m.full_name || m.email}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)]">{m.role_in_org}</span>
              {m.role_in_org !== 'org_admin' && (
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${m.email} from this org?`)) return
                    await removeMember(m.org_id, m.user_id)
                    if (orgId) reload(orgId)
                  }}
                  className="text-[var(--color-muted)] hover:text-red-400"
                  title="Remove"
                ><X size={14}/></button>
              )}
            </div>
          ))}
          {members.length === 0 && <div className="text-xs text-[var(--color-muted)]">No members yet.</div>}
        </div>
      </div>

      {invites.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold mb-3">Pending invites</div>
          <div className="space-y-1.5">
            {invites.map(i => (
              <div key={i.id} className="flex items-center gap-2 text-sm py-1">
                <span className="flex-1 truncate">{i.email}</span>
                <span className="text-[10px] text-[var(--color-muted)]">expires {new Date(i.expires_at).toLocaleDateString()}</span>
                <button
                  onClick={async () => { await revokeInvite(i.id); if (orgId) reload(orgId) }}
                  className="text-[var(--color-muted)] hover:text-red-400"
                  title="Revoke"
                ><X size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
