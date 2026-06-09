import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Send, MessageCircle, Check, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { PlanKey } from '../lib/billing'

const PLANS: Record<PlanKey, { name: string; price: string; period: string; features: string[]; type: 'sub' | 'one-time' }> = {
  basic:     { name: 'Basic',              price: '$400',   period: '/year',     type: 'sub',      features: ['HTML app with PDF upload', 'Smart AI scoring', 'CSV export', 'Runs locally'] },
  advanced:  { name: 'Advanced',           price: '$900',   period: '/year',     type: 'sub',      features: ['Everything in Basic', 'Save multiple JDs', 'Screening history', 'Multi-user login', 'Custom branding', 'Bulk 50+ PDFs'] },
  lifetime:  { name: 'Custom Integrated',  price: '$1,500', period: ' one-time', type: 'one-time', features: ['Everything in Advanced', 'API integration', 'Role-based dashboard', 'DB storage', 'Email notifications', 'Custom workflow'] },
  retainer:  { name: 'Monthly Retainer',   price: '$200',   period: '/month',    type: 'sub',      features: ['Maintenance & bug fixes', '1–2 new features/mo', 'Priority support', 'Quarterly reviews'] },
}

export default function Checkout() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const initial = (params.get('plan') as PlanKey) || 'advanced'
  const [selected, setSelected] = useState<PlanKey>(PLANS[initial] ? initial : 'advanced')
  const [name, setName] = useState(user?.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const plan = PLANS[selected]

  const submitInquiry = async () => {
    setErr(null); setBusy(true)
    try {
      const res = await fetch('/api/order-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), company: company.trim(), notes: notes.trim(), plan: plan.name, planPrice: `${plan.price}${plan.period}` }),
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

  const waLink = `https://wa.me/8801324419060?text=${encodeURIComponent(`Hi HireBest, I'd like to discuss the ${plan.name} plan (${plan.price}${plan.period}).`)}`

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
      <p className="mt-3 text-[var(--color-muted)]">Fill in your details and we'll get back to you within 24 hours.</p>

      <div className="grid lg:grid-cols-3 gap-5 mt-10">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">1. Choose your plan</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(PLANS) as PlanKey[]).map(k => (
                <button key={k} onClick={() => setSelected(k)} className={`text-left p-4 rounded-lg border transition ${selected === k ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-white/30'}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{PLANS[k].name}</span>
                    <span className="text-sm text-[var(--color-primary-2)]">{PLANS[k].price}<span className="text-[10px] text-[var(--color-muted)]">{PLANS[k].period}</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Order summary</p>
          <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold gradient-text">{plan.price}</span>
            <span className="text-sm text-[var(--color-muted)]">{plan.period}</span>
          </div>
          <div className="text-[11px] text-[var(--color-muted)] mt-2">{plan.type === 'sub' ? 'Renews automatically; cancel anytime.' : 'Single payment. No subscription.'}</div>
          <ul className="mt-5 space-y-2">
            {plan.features.map(f => <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>)}
          </ul>
          <Link to="/pricing" className="mt-6 text-xs text-[var(--color-primary-2)] flex items-center gap-1">Compare all plans <ArrowRight size={12}/></Link>
        </aside>
      </div>
    </section>
  )
}
