import { useState } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { Send, MessageCircle, Check, ArrowRight, AlertCircle, CheckCircle2, Lock, CreditCard } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { startCheckout, type PlanKey, type PaidPlanKey, type BillingInterval } from '../lib/billing'

const PLANS: Record<PlanKey, { name: string; monthly: number | null; annual: number | null; features: string[] }> = {
  basic:     { name: 'Starter',    monthly: 49,   annual: 420,  features: ['3 active job slots', '150 CVs / month', '1 user', 'AI scoring with JD-cited reasoning', 'Interview question generation', 'CSV export'] },
  advanced:  { name: 'Growth',     monthly: 99,   annual: 840,  features: ['10 active job slots', '500 CVs / month', '3 users', 'Bulk upload (100+ PDFs)', 'Custom branding', 'Side-by-side compare', 'Priority email support'] },
  lifetime:  { name: 'Team',       monthly: 199,  annual: 1680, features: ['Unlimited job slots', '2,000 CVs / month', '10 users', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Priority Slack support'] },
  retainer:  { name: 'Enterprise', monthly: null, annual: null, features: ['Unlimited CVs / users', 'Custom ATS integration', 'SSO', 'SLA guarantee', 'Dedicated CSM', 'On-premise option'] },
}

const priceLabel = (k: PlanKey, iv: BillingInterval) => {
  const p = PLANS[k]
  if (p.monthly === null || p.annual === null) return { price: 'Custom', period: '' }
  return iv === 'monthly'
    ? { price: `$${p.monthly}`, period: '/month' }
    : { price: `$${Math.round(p.annual / 12)}`, period: '/mo, billed annually' }
}

export default function Checkout() {
  const { user } = useAuth()
  const loc = useLocation()
  const [params] = useSearchParams()
  const initial = (params.get('plan') as PlanKey) || 'advanced'
  const canceled = params.get('canceled') === '1'
  const [selected, setSelected] = useState<PlanKey>(PLANS[initial] ? initial : 'advanced')
  const [interval, setBillingInterval] = useState<BillingInterval>(params.get('interval') === 'monthly' ? 'monthly' : 'annual')
  const [name, setName] = useState(user?.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const plan = PLANS[selected]
  const isEnterprise = selected === 'retainer'
  const { price, period } = priceLabel(selected, interval)

  const pay = async () => {
    setErr(null); setBusy(true)
    try {
      window.location.href = await startCheckout(selected as PaidPlanKey, interval)
    } catch (e: any) {
      setErr(e?.message ?? 'Could not start checkout. Please try again.')
      setBusy(false)
    }
  }

  const submitInquiry = async () => {
    setErr(null); setBusy(true)
    try {
      const res = await fetch('/api/order-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), company: company.trim(), notes: notes.trim(), plan: plan.name, planPrice: `${price}${period}` }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Submission failed')
      setDone(true)
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const waLink = `https://wa.me/8801324419060?text=${encodeURIComponent(`Hi HireBest, I'd like to discuss the ${plan.name} plan (${price}${period}).`)}`

  if (done) {
    return (
      <section className="max-w-xl mx-auto px-5 py-24 text-center">
        <CheckCircle2 size={56} className="mx-auto text-[var(--color-primary)]"/>
        <h1 className="mt-6 text-3xl font-extrabold">Inquiry received!</h1>
        <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
          Thank you, <strong>{name}</strong>. We've sent a confirmation to <strong>{email}</strong> and will get back to you within 24 hours.
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Questions? Email us at <a href="mailto:contact@hirebest.online" className="text-[var(--color-primary-2)]">contact@hirebest.online</a>
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">Back to home</Link>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <span className="chip">Get Started</span>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Start your <span className="gradient-text">{plan.name}</span> plan</h1>
      <p className="mt-3 text-[var(--color-muted)]">
        {isEnterprise ? "Fill in your details and we'll get back to you within 24 hours." : '14-day free trial on your first subscription. Secure payment by Stripe — cancel anytime.'}
      </p>

      {canceled && !isEnterprise && (
        <div className="mt-6 card p-4 text-sm flex items-center gap-2 text-[var(--color-muted)]"><AlertCircle size={14} className="shrink-0"/>Checkout was cancelled — you haven't been charged. Pick up where you left off below.</div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-10">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="font-semibold">1. Choose your plan</h3>
              <div className="inline-flex rounded-full border border-[var(--color-border)] p-0.5 text-xs">
                {(['monthly', 'annual'] as const).map(iv => (
                  <button key={iv} onClick={() => setBillingInterval(iv)} className={`px-3 py-1 rounded-full capitalize transition ${interval === iv ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]' : 'text-[var(--color-muted)]'}`}>
                    {iv}{iv === 'annual' && ' (−29%)'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(PLANS) as PlanKey[]).map(k => (
                <button key={k} onClick={() => setSelected(k)} className={`text-left p-4 rounded-lg border transition ${selected === k ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-white/30'}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{PLANS[k].name}</span>
                    <span className="text-sm text-[var(--color-primary-2)]">{priceLabel(k, interval).price}<span className="text-[10px] text-[var(--color-muted)]">{PLANS[k].monthly === null ? '' : '/mo'}</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isEnterprise ? (
            <>
            <div className="card p-6">
              <h3 className="font-semibold mb-4">2. Your details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Full name *" value={name} onChange={e => setName(e.target.value)} className="field"/>
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="field"/>
                <input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} className="field sm:col-span-2"/>
                <textarea placeholder="Anything we should know? (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="field sm:col-span-2"/>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4">3. Send inquiry</h3>
              <button
                onClick={submitInquiry}
                disabled={busy || !name.trim() || !email.trim()}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                <Send size={16}/>{busy ? 'Sending…' : `Send inquiry for ${plan.name}`}
              </button>
              <p className="text-[10px] text-[var(--color-muted)] mt-3 text-center">We'll confirm by email and get back to you within 24 hours.</p>

              {err && (
                <div className="mt-4 text-sm text-red-300 flex items-start gap-2"><AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}</div>
              )}

              <div className="my-5 flex items-center gap-3 text-[10px] text-[var(--color-muted)]">
                <div className="flex-1 h-px bg-[var(--color-border)]"/>OR TALK TO US<div className="flex-1 h-px bg-[var(--color-border)]"/>
              </div>

              <a href={waLink} target="_blank" rel="noreferrer" className="btn-ghost w-full justify-center">
                <MessageCircle size={14}/> Chat on WhatsApp
              </a>
            </div>
            </>
          ) : (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">2. Payment</h3>
              {user ? (
                <>
                  <p className="text-sm text-[var(--color-muted)] mb-4">Subscribing as <strong className="text-[var(--color-fg)]">{user.email}</strong>. You'll enter card details on Stripe's secure checkout page.</p>
                  <button onClick={pay} disabled={busy} className="btn-primary w-full justify-center py-3 text-base">
                    <CreditCard size={16}/>{busy ? 'Redirecting to Stripe…' : `Continue to payment — ${plan.name}`}
                  </button>
                  <p className="text-[10px] text-[var(--color-muted)] mt-3 text-center flex items-center justify-center gap-1"><Lock size={10}/>Payments processed securely by Stripe. We never see your card number.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-muted)] mb-4">Sign in or create a free account so we can attach the subscription to it.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Link to="/login" state={{ from: loc.pathname + loc.search }} className="btn-primary justify-center">Sign in to continue</Link>
                    <Link to="/signup" className="btn-ghost justify-center">Create account</Link>
                  </div>
                </>
              )}
              {err && (
                <div className="mt-4 text-sm text-red-300 flex items-start gap-2"><AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}</div>
              )}
            </div>
          )}
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Order summary</p>
          <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold gradient-text">{price}</span>
            <span className="text-sm text-[var(--color-muted)]">{period}</span>
          </div>
          <div className="text-[11px] text-[var(--color-muted)] mt-2">
            {isEnterprise ? 'Custom contract and invoicing.' : `${interval === 'annual' ? `$${plan.annual?.toLocaleString()} billed yearly` : 'Billed monthly'}. First-time subscribers get a 14-day free trial. Renews automatically; cancel anytime.`}
          </div>
          <ul className="mt-5 space-y-2">
            {plan.features.map(f => <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>)}
          </ul>
          <Link to="/pricing" className="mt-6 text-xs text-[var(--color-primary-2)] flex items-center gap-1">Compare all plans <ArrowRight size={12}/></Link>
        </aside>
      </div>
    </section>
  )
}
