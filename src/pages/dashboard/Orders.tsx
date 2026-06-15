import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, MessageCircle, CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import { listMySubscriptions, type Subscription } from '../../lib/billing'
import { useAuth } from '../../lib/auth'

const PLAN_LABEL: Record<string, string> = {
  basic: 'Starter',
  advanced: 'Growth',
  lifetime: 'Team',
  retainer: 'Enterprise',
}

const STATUS_TONE: Record<string, string> = {
  active: 'verdict-fit',
  on_trial: 'verdict-fit',
  cancelled: 'verdict-maybe',
  past_due: 'verdict-maybe',
  paused: 'verdict-maybe',
  unpaid: 'verdict-skip',
  expired: 'verdict-skip',
}

export default function Orders() {
  const { profile } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const justPaid = params.get('paid') === '1'

  useEffect(() => {
    listMySubscriptions().then(s => { setSubs(s); setLoading(false) })
    if (justPaid) {
      const t = setTimeout(() => {
        const np = new URLSearchParams(params); np.delete('paid'); setParams(np, { replace: true })
      }, 8000)
      return () => clearTimeout(t)
    }
  }, [])

  const active = subs.find(s => ['active', 'on_trial', 'cancelled'].includes(s.status))
  const planLabel = profile?.plan === 'lifetime'
    ? 'Team'
    : active ? PLAN_LABEL[active.plan_name] ?? 'Free' : 'Free'

  return (
    <>
      <DashboardTopBar title="Orders"/>
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        {justPaid && (
          <div className="card p-5 border-green-500/40 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-400 shrink-0"/>
            <div>
              <div className="font-semibold text-green-400">Payment received</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">Your plan will activate within a few seconds. Refresh if you don't see it yet.</div>
            </div>
          </div>
        )}

        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Current plan</div>
              <h2 className="text-2xl font-bold mt-1">{planLabel}</h2>
              {!active && profile?.plan === 'free' && (
                <p className="text-sm text-[var(--color-muted)] mt-2">50 free screenings included. Upgrade for unlimited.</p>
              )}
            </div>
            {!active && (
              <Link to="/pricing" className="btn-primary text-sm whitespace-nowrap"><CreditCard size={14}/>See plans</Link>
            )}
          </div>
        </div>

        {loading && <div className="text-sm text-[var(--color-muted)]">Loading subscriptions…</div>}

        {subs.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] font-semibold text-sm">Billing history</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                  <th className="text-left p-4">Plan</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Card</th>
                  <th className="text-left p-4">Renews / Ends</th>
                  <th className="text-right p-4">Manage</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="p-4">{PLAN_LABEL[s.plan_name] ?? s.plan_name}{s.test_mode && <span className="ml-2 text-[9px] uppercase text-yellow-400">test</span>}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_TONE[s.status] ?? 'verdict-maybe'}`}>{s.status}</span></td>
                    <td className="p-4 text-xs text-[var(--color-muted)]">{s.card_brand ? `${s.card_brand} ••${s.card_last_four}` : '—'}</td>
                    <td className="p-4 text-xs text-[var(--color-muted)]">
                      {s.status === 'cancelled' && s.ends_at ? `Ends ${new Date(s.ends_at).toLocaleDateString()}` :
                       s.renews_at ? `Renews ${new Date(s.renews_at).toLocaleDateString()}` : '—'}
                    </td>
                    <td className="p-4 text-right">
                      {s.customer_portal_url && (
                        <a href={s.customer_portal_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary-2)] inline-flex items-center gap-1">Customer portal <ExternalLink size={11}/></a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card p-6 text-center">
          <Package size={22} className="mx-auto text-[var(--color-primary-2)]"/>
          <h3 className="mt-3 font-semibold">Need a custom quote or invoice?</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">For Enterprise terms, custom ATS integrations, or volume pricing.</p>
          <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="btn-ghost mt-4 text-xs"><MessageCircle size={12}/>Talk to us</a>
        </div>
      </div>
    </>
  )
}
