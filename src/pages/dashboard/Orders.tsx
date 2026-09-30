import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, MessageCircle, CreditCard, ExternalLink, CheckCircle2, Settings, AlertCircle } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'
import { listMySubscriptions, openBillingPortal, type Subscription } from '../../lib/billing'
import { useAuth } from '../../lib/auth'

const PLAN_LABEL: Record<string, string> = {
  basic: 'Starter',
  advanced: 'Growth',
  lifetime: 'Team',
  retainer: 'Enterprise',
}

const STATUS_LABEL: Record<string, string> = {
  on_trial: 'trial',
  cancelled: 'cancels at period end',
  past_due: 'payment overdue',
}

const STATUS_TONE: Record<string, string> = {
  active: 'verdict-fit',
  on_trial: 'verdict-fit',
  cancelled: 'verdict-maybe',
  past_due: 'verdict-maybe',
  paused: 'verdict-maybe',
  incomplete: 'verdict-maybe',
  unpaid: 'verdict-skip',
  expired: 'verdict-skip',
}

export default function Orders() {
  const { profile, refreshProfile } = useAuth()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [portalBusy, setPortalBusy] = useState(false)
  const [portalErr, setPortalErr] = useState<string | null>(null)
  const [params, setParams] = useSearchParams()
  const justPaid = params.get('paid') === '1'

  useEffect(() => {
    listMySubscriptions().then(s => { setSubs(s); setLoading(false) })
    if (!justPaid) return
    // The Stripe webhook usually lands within a few seconds of the redirect —
    // poll briefly so the new plan shows up without a manual refresh.
    let tries = 0
    const poll = setInterval(async () => {
      tries++
      const s = await listMySubscriptions()
      setSubs(s)
      if (s.some(x => x.stripe_subscription_id) || tries >= 10) {
        clearInterval(poll)
        refreshProfile()
      }
    }, 2000)
    const t = setTimeout(() => {
      const np = new URLSearchParams(params); np.delete('paid'); np.delete('session_id'); setParams(np, { replace: true })
    }, 20000)
    return () => { clearInterval(poll); clearTimeout(t) }
  }, [])

  const manage = async () => {
    setPortalErr(null); setPortalBusy(true)
    try {
      window.location.href = await openBillingPortal()
    } catch (e: any) {
      setPortalErr(e?.message ?? 'Could not open billing portal')
      setPortalBusy(false)
    }
  }

  const active = subs.find(s => ['active', 'on_trial', 'cancelled', 'past_due'].includes(s.status))
  const hasStripe = subs.some(s => s.stripe_subscription_id)
  const planLabel = profile?.plan === 'lifetime'
    ? 'Team'
    : active ? PLAN_LABEL[active.plan_name] ?? 'Free' : 'Free'

  return (
    <>
      <DashboardTopBar title="Billing & orders" subtitle="Your plan, invoices and subscription history"/>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">

        {justPaid && (
          <div className="panel rise p-5 flex items-center gap-3" style={{ borderColor: 'color-mix(in srgb, var(--color-viz-fit) 45%, transparent)' }}>
            <CheckCircle2 size={20} className="shrink-0" style={{ color: 'var(--color-viz-fit)' }}/>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-viz-fit)' }}>Payment received</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">Your plan will activate within a few seconds. Refresh if you don't see it yet.</div>
            </div>
          </div>
        )}

        <div className="panel rise p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="eyebrow">Current plan</div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] mt-1.5">{planLabel}</h2>
              {!active && profile?.plan === 'free' && (
                <p className="text-sm text-[var(--color-muted)] mt-2">50 free screenings included. Upgrade for unlimited.</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {hasStripe && (
                <button onClick={manage} disabled={portalBusy} className={`${active ? 'btn-primary' : 'btn-ghost'} text-sm whitespace-nowrap`}><Settings size={14}/>{portalBusy ? 'Opening…' : 'Manage billing'}</button>
              )}
              {!active && (
                <Link to="/pricing" className="btn-primary text-sm whitespace-nowrap"><CreditCard size={14}/>See plans</Link>
              )}
            </div>
          </div>
          {active?.status === 'on_trial' && active.trial_ends_at && (
            <p className="text-xs text-[var(--color-muted)] mt-3">Free trial ends {new Date(active.trial_ends_at).toLocaleDateString()}. Add a payment method via “Manage billing” to keep access.</p>
          )}
          {active?.status === 'past_due' && (
            <p className="text-xs text-amber-300 mt-3 flex items-center gap-1.5"><AlertCircle size={12}/>Your last payment failed. Update your card via “Manage billing” to avoid losing access.</p>
          )}
          {portalErr && <p className="text-xs text-red-300 mt-3">{portalErr}</p>}
          <p className="text-[11px] text-[var(--color-muted)] mt-3">Update your card, switch plans, download invoices or cancel — all from the Stripe billing portal.</p>
        </div>

        {loading && <div className="panel p-5 text-sm text-[var(--color-muted)]">Loading subscriptions…</div>}

        {subs.length > 0 && (
          <div className="panel rise overflow-hidden">
            <div className="panel-head"><div className="panel-title">Billing history</div></div>
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[38rem]">
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
                    <td className="p-4">{PLAN_LABEL[s.plan_name] ?? s.plan_name}{s.billing_interval && <span className="ml-1 text-xs text-[var(--color-muted)]">· {s.billing_interval === 'year' ? 'annual' : 'monthly'}</span>}{s.test_mode && <span className="ml-2 count-pill uppercase">test</span>}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_TONE[s.status] ?? 'verdict-maybe'}`}>{STATUS_LABEL[s.status] ?? s.status}</span></td>
                    <td className="p-4 text-xs text-[var(--color-muted)]">{s.card_brand ? `${s.card_brand} ••${s.card_last_four}` : '—'}</td>
                    <td className="p-4 text-xs text-[var(--color-muted)]">
                      {s.status === 'on_trial' && s.trial_ends_at ? `Trial ends ${new Date(s.trial_ends_at).toLocaleDateString()}` :
                       (s.status === 'cancelled' || s.status === 'expired') && s.ends_at ? `${s.status === 'expired' ? 'Ended' : 'Ends'} ${new Date(s.ends_at).toLocaleDateString()}` :
                       s.renews_at ? `Renews ${new Date(s.renews_at).toLocaleDateString()}` : '—'}
                    </td>
                    <td className="p-4 text-right">
                      {s.stripe_subscription_id ? (
                        <button onClick={manage} disabled={portalBusy} className="text-xs text-[var(--color-primary-2)] inline-flex items-center gap-1">Manage <ExternalLink size={11}/></button>
                      ) : s.customer_portal_url && (
                        <a href={s.customer_portal_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary-2)] inline-flex items-center gap-1">Customer portal <ExternalLink size={11}/></a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}

        <div className="panel rise p-6 text-center">
          <span className="icon-badge mx-auto"><Package size={18}/></span>
          <h3 className="mt-3 font-semibold">Need a custom quote or invoice?</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">For Enterprise terms, custom ATS integrations, or volume pricing.</p>
          <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="btn-ghost mt-4 text-xs"><MessageCircle size={12}/>Talk to us</a>
        </div>
      </div>
    </>
  )
}
