import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MessageCircle, Mail, Check, ArrowRight } from 'lucide-react'

const PLANS = {
  basic: { name: 'Basic', price: '$400/yr', features: ['HTML app with PDF upload', 'Smart AI scoring', 'CSV export', 'Runs locally'] },
  advanced: { name: 'Advanced', price: '$900/yr', features: ['Everything in Basic', 'Save multiple JDs', 'Screening history', 'Multi-user login', 'Custom branding', 'Bulk 50+ PDFs'] },
  custom: { name: 'Custom Integrated', price: '$1,500 one-time', features: ['Everything in Advanced', 'API integration', 'Role-based dashboard', 'DB storage', 'Email notifications', 'Custom workflow'] },
  retainer: { name: 'Monthly Retainer', price: '$200/mo', features: ['Maintenance & bug fixes', '1–2 new features/mo', 'Priority support', 'Quarterly reviews'] },
} as const

type PlanKey = keyof typeof PLANS

export default function Checkout() {
  const [params] = useSearchParams()
  const initial = (params.get('plan') as PlanKey) || 'advanced'
  const [selected, setSelected] = useState<PlanKey>(PLANS[initial] ? initial : 'advanced')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')

  const plan = PLANS[selected]

  const whatsappMsg = encodeURIComponent(
    `Hi HireBest, I'd like to start with the ${plan.name} plan (${plan.price}).\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\nNotes: ${notes || '—'}`
  )
  const waLink = `https://wa.me/8801324419060?text=${whatsappMsg}`
  const mailLink = `mailto:contact@hirebest.online?subject=${encodeURIComponent(`Checkout: ${plan.name}`)}&body=${whatsappMsg}`

  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <span className="chip">Checkout</span>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Talk to us — start your <span className="gradient-text">{plan.name}</span> plan</h1>
      <p className="mt-3 text-[var(--color-muted)]">Pick your plan, drop your details, and we'll confirm via WhatsApp or email within a few hours.</p>

      <div className="grid lg:grid-cols-3 gap-5 mt-10">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">1. Choose your plan</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(PLANS) as PlanKey[]).map(k => (
                <button key={k} onClick={() => setSelected(k)} className={`text-left p-4 rounded-lg border transition ${selected === k ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-white/30'}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{PLANS[k].name}</span>
                    <span className="text-sm text-[var(--color-primary-2)]">{PLANS[k].price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">2. Your details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="field"/>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="field"/>
              <input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} className="field sm:col-span-2"/>
              <textarea placeholder="Anything we should know? (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="field sm:col-span-2"/>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">3. Send via</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary justify-center">
                <MessageCircle size={16}/> WhatsApp us
              </a>
              <a href={mailLink} className="btn-ghost justify-center">
                <Mail size={16}/> Send by email
              </a>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-4">No payment is processed here — we confirm scope and send an invoice/payment link based on your plan.</p>
          </div>
        </div>

        <aside className="card p-6 h-fit sticky top-24">
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Order summary</p>
          <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
          <div className="text-3xl font-extrabold gradient-text mt-3">{plan.price}</div>
          <ul className="mt-5 space-y-2">
            {plan.features.map(f => <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>)}
          </ul>
          <Link to="/pricing" className="mt-6 text-xs text-[var(--color-primary-2)] flex items-center gap-1">Compare all plans <ArrowRight size={12}/></Link>
        </aside>
      </div>
    </section>
  )
}
