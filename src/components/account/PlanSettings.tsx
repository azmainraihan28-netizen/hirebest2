import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Palette, Bell, KeyRound, Gauge, Copy, Check, Trash2, Loader2, ArrowRight, Plus } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { loadQuota, type QuotaState } from '../../lib/quota'
import { FEATURE_PLAN, PLAN_NAMES, planAtLeast } from '../../lib/plans'
import { getMyOrgs, createMyTeam, getOrgSeatUsage, type MyOrg, type OrgSeatUsage } from '../../lib/orgs'
import { listApiKeys, createApiKey, revokeApiKey, type ApiKey } from '../../lib/apiKeys'
import { LockedCard } from '../PlanGate'

const fmt = (n: number) => (isFinite(n) ? n.toLocaleString() : 'Unlimited')

/** Plan, usage and the plan-gated settings on the Account page. */
export default function PlanSettings() {
  const { profile } = useAuth()
  const [q, setQ] = useState<QuotaState | null>(null)
  useEffect(() => { if (profile) loadQuota(profile).then(setQ) }, [profile])
  if (!q) return null
  return (
    <>
      <PlanCard q={q} />
      <TeamCard q={q} />
      <BrandingCard q={q} />
      <NotificationsCard q={q} />
      <ApiKeysCard q={q} />
    </>
  )
}

function Card({ icon: Icon, title, sub, children }: { icon: typeof Users; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 mt-5">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary-2)] shrink-0"><Icon size={16}/></span>
        <div className="min-w-0">
          <h2 className="font-semibold text-[var(--color-fg)]">{title}</h2>
          {sub && <p className="text-xs text-[var(--color-muted)] mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function PlanCard({ q }: { q: QuotaState }) {
  const rows: [string, string][] = [
    ['CVs this month', `${q.used.toLocaleString()} / ${fmt(q.limit)}`],
    ['Resets on', q.resetsOn ? new Date(q.resetsOn).toLocaleDateString() : '—'],
    ['Active job slots', `${q.activeJobs} / ${fmt(q.jobSlots)}`],
    ['CVs per batch', `Up to ${q.batchCap}`],
    ['Users', fmt(q.seats)],
  ]
  return (
    <Card icon={Gauge} title={`${PLAN_NAMES[q.plan]} plan`} sub={q.orgId ? 'Shared with your team' : undefined}>
      <div className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm border-b border-[var(--color-border)] last:border-0 pb-2 last:pb-0">
            <span className="text-[var(--color-muted)]">{k}</span><span className="text-[var(--color-fg)] tabular">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/pricing" className="btn-ghost text-xs">Compare plans</Link>
        {q.plan !== 'free' && <Link to="/dashboard/orders" className="btn-ghost text-xs">Billing</Link>}
      </div>
    </Card>
  )
}

function TeamCard({ q }: { q: QuotaState }) {
  const [orgs, setOrgs] = useState<MyOrg[] | null>(null)
  const [seats, setSeats] = useState<OrgSeatUsage | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const reload = () => getMyOrgs().then(async list => {
    setOrgs(list)
    const admin = list.find(o => o.role_in_org === 'org_admin')
    if (admin) setSeats(await getOrgSeatUsage(admin.org_id))
  })
  useEffect(() => { reload() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setBusy(true)
    try { await createMyTeam(name); await reload() } catch (er: any) { setErr(er.message) } finally { setBusy(false) }
  }

  const adminOf = orgs?.find(o => o.role_in_org === 'org_admin')
  return (
    <Card icon={Users} title="Team" sub={`Your plan includes ${fmt(q.seats)} user${q.seats === 1 ? '' : 's'}.`}>
      {orgs === null ? null : orgs.length > 0 ? (
        <div className="space-y-2 text-sm">
          {orgs.map(o => (
            <div key={o.org_id} className="flex justify-between">
              <span className="text-[var(--color-fg)]">{o.name}</span>
              <span className="text-[var(--color-muted)]">{o.role_in_org === 'org_admin' ? 'Admin' : 'Member'}</span>
            </div>
          ))}
          {adminOf && (
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              {seats && <span className="text-xs text-[var(--color-muted)]">{seats.used} of {seats.seatLimit >= 1000000 ? 'unlimited' : seats.seatLimit} seats used</span>}
              <Link to="/admin" className="btn-primary text-xs">Invite & manage members <ArrowRight size={12}/></Link>
            </div>
          )}
        </div>
      ) : planAtLeast(q.plan, FEATURE_PLAN.team) ? (
        <form onSubmit={create} className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name, e.g. Acme Hiring" className="field flex-1 min-w-[12rem]" />
          <button disabled={busy} className="btn-primary text-xs">{busy ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12}/>}Create team</button>
          {err && <p className="w-full text-sm text-red-400">{err}</p>}
          <p className="w-full text-xs text-[var(--color-muted)]">Teammates share your plan and its monthly CV allowance, and see the team's screenings.</p>
        </form>
      ) : (
        <LockedCard feature="team" title="Teams with more users" compact />
      )}
    </Card>
  )
}

function BrandingCard({ q }: { q: QuotaState }) {
  const { user, profile, refreshProfile } = useAuth()
  const [brandName, setBrandName] = useState(profile?.brand_name ?? '')
  const [color, setColor] = useState(profile?.brand_color ?? '#2f7bff')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const allowed = planAtLeast(q.plan, FEATURE_PLAN.branding)

  const save = async (patch: Record<string, string | null>) => {
    if (!user) return
    setBusy(true); setMsg(null)
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
    setBusy(false)
    if (error) return setMsg(error.message)
    await refreshProfile(); setMsg('Saved')
  }

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file || !user) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) return setMsg('Use a PNG or JPG logo.')
    if (file.size > 1024 * 1024) return setMsg('Logo must be 1 MB or smaller.')
    setBusy(true)
    const path = `${user.id}/brand-logo-${Date.now()}.${file.type === 'image/png' ? 'png' : 'jpg'}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    setBusy(false)
    if (error) return setMsg(error.message)
    await save({ brand_logo_url: supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl })
  }

  return (
    <Card icon={Palette} title="Custom branding" sub="Your company name, logo and colour on PDF reports and candidate email drafts.">
      {!allowed ? <LockedCard feature="branding" title="Custom branding" compact /> : (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Company name" className="field flex-1 min-w-[12rem]" aria-label="Company name"/>
            <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              Colour <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-[var(--color-border)]" aria-label="Brand colour"/>
            </label>
            <button disabled={busy} onClick={() => save({ brand_name: brandName.trim() || null, brand_color: color })} className="btn-primary text-xs">Save</button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {profile?.brand_logo_url
              ? <img src={profile.brand_logo_url} alt="Brand logo" className="h-10 max-w-[10rem] object-contain rounded bg-white p-1"/>
              : <span className="text-xs text-[var(--color-muted)]">No logo yet</span>}
            <button disabled={busy} onClick={() => fileRef.current?.click()} className="btn-ghost text-xs">{profile?.brand_logo_url ? 'Replace logo' : 'Upload logo'}</button>
            {profile?.brand_logo_url && <button disabled={busy} onClick={() => save({ brand_logo_url: null })} className="btn-ghost text-xs"><Trash2 size={12}/>Remove</button>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={uploadLogo} className="hidden"/>
          </div>
          {msg && <p className="text-xs text-[var(--color-muted)]">{msg}</p>}
        </div>
      )}
    </Card>
  )
}

function NotificationsCard({ q }: { q: QuotaState }) {
  const { user, profile, refreshProfile } = useAuth()
  const on = profile?.notify_screening_complete !== false
  const toggle = async () => {
    if (!user) return
    await supabase.from('profiles').update({ notify_screening_complete: !on }).eq('id', user.id)
    await refreshProfile()
  }
  return (
    <Card icon={Bell} title="Email notifications" sub="Get an email summary (Fit / Maybe / Skip) when a screening finishes — useful when a teammate runs one.">
      {!planAtLeast(q.plan, FEATURE_PLAN.emailNotifications) ? <LockedCard feature="emailNotifications" title="Email notifications" compact /> : (
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={on} onChange={toggle} className="accent-[var(--color-primary)] w-4 h-4"/>
          Email me when a screening in my account or team finishes
        </label>
      )}
    </Card>
  )
}

function ApiKeysCard({ q }: { q: QuotaState }) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [name, setName] = useState('')
  const [fresh, setFresh] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const allowed = planAtLeast(q.plan, FEATURE_PLAN.apiAccess)
  useEffect(() => { if (allowed) listApiKeys().then(setKeys) }, [allowed])

  const create = async () => {
    setErr(null)
    try { setFresh(await createApiKey(name)); setName(''); setKeys(await listApiKeys()) } catch (e: any) { setErr(e.message) }
  }
  const revoke = async (id: string) => { await revokeApiKey(id); setKeys(await listApiKeys()) }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hirebest.online'

  return (
    <Card icon={KeyRound} title="API access" sub="Score CVs from your own systems. API calls count toward your monthly CV allowance.">
      {!allowed ? <LockedCard feature="apiAccess" title="API access" compact /> : (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Key name, e.g. ATS sync" className="field flex-1 min-w-[12rem]" aria-label="API key name"/>
            <button onClick={create} className="btn-primary text-xs"><Plus size={12}/>Create key</button>
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          {fresh && (
            <div className="rounded-xl border border-[var(--color-border-strong)] p-3">
              <p className="text-xs text-[var(--color-muted)]">Copy this key now — it won't be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 text-xs break-all">{fresh}</code>
                <button onClick={async () => { await navigator.clipboard.writeText(fresh); setCopied(true); setTimeout(() => setCopied(false), 1400) }} className="icon-btn" aria-label="Copy key">{copied ? <Check size={14}/> : <Copy size={14}/>}</button>
              </div>
            </div>
          )}
          {keys.length > 0 && (
            <div className="space-y-1.5">
              {keys.map(k => (
                <div key={k.id} className="flex items-center justify-between text-sm gap-3">
                  <span className={k.revoked_at ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-fg)]'}>{k.name} <code className="text-xs text-[var(--color-muted)]">{k.prefix}…</code></span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-2">
                    {k.revoked_at ? 'Revoked' : k.last_used_at ? `Used ${new Date(k.last_used_at).toLocaleDateString()}` : 'Never used'}
                    {!k.revoked_at && <button onClick={() => revoke(k.id)} className="btn-ghost text-xs">Revoke</button>}
                  </span>
                </div>
              ))}
            </div>
          )}
          <details className="text-xs">
            <summary className="cursor-pointer text-[var(--color-muted)]">How to call the API</summary>
            <pre className="mt-2 p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] overflow-x-auto whitespace-pre text-[11px] leading-relaxed">{`curl -X POST ${origin}/api/score \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{"jd": "Job description text…", "cv": {"text": "CV text…"}}'

# Response: { name, email, score (0-100), verdict (Fit|Maybe|Skip),
#   summary, strengths[], gaps[], skills[], questions[] }
# 402 = monthly CV limit reached · 401 = invalid key`}</pre>
          </details>
        </div>
      )}
    </Card>
  )
}
