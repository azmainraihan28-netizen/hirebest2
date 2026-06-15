import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'

const pricingFaqs = [
  { q: 'Is there a free trial?', a: 'Yes — 14 days free on the Growth plan. No credit card required to start. Cancel anytime during the trial without being charged.' },
  { q: 'Can I switch between monthly and annual?', a: 'Yes. You can upgrade from monthly to annual at any time and lock in two months free. Annual plans save ~29% compared to paying monthly.' },
  { q: 'What counts as an "active job slot"?', a: 'Any open role you are actively screening candidates for. Closed or paused jobs free up a slot. You can archive old jobs to stay within your limit.' },
  { q: 'What happens if I exceed my monthly CV limit?', a: 'We will notify you before you hit the cap. You can upgrade mid-cycle (prorated) or wait until next month — no overage fees, no surprise charges.' },
  { q: 'Do you offer discounts for non-profits or startups?', a: 'Yes — 50% off the Growth plan for registered non-profits and YC/Techstars startups in their first year. Email contact@hirebest.online with proof of status.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard in one click. No phone calls, no retention scripts. Monthly plans cancel at the end of the current cycle; annual plans get prorated refunds within 30 days.' },
]

type Tier = {
  plan: 'basic' | 'advanced' | 'lifetime' | 'retainer'
  name: string
  subtitle: string
  best: string
  monthly: number | null
  annual: number | null
  popular?: boolean
  cta: string
  features: string[]
}

const tiers: Tier[] = [
  {
    plan: 'basic',
    name: 'Starter',
    subtitle: 'For solo recruiters & consultants',
    best: 'Freelance recruiters, solo HR people, hiring consultants',
    monthly: 49,
    annual: 420,
    cta: 'Start free trial',
    features: [
      '3 active job slots',
      '150 CVs / month',
      '1 user',
      'AI scoring with JD-cited reasoning',
      'Interview question generation',
      'CSV export',
    ],
  },
  {
    plan: 'advanced',
    name: 'Growth',
    subtitle: 'For small HR teams & startups',
    best: 'Small HR teams, startups, growing SMBs (5–50 employees)',
    monthly: 99,
    annual: 840,
    popular: true,
    cta: 'Start 14-day free trial',
    features: [
      '10 active job slots',
      '500 CVs / month',
      '3 users',
      'Everything in Starter',
      'Bulk upload (100+ PDFs)',
      'Custom branding (logo, colors)',
      'Screening history per JD',
      'Side-by-side candidate compare',
      'Outreach email drafts',
      'Priority email support',
    ],
  },
  {
    plan: 'lifetime',
    name: 'Team',
    subtitle: 'For HR departments & staffing agencies',
    best: 'HR departments, staffing agencies, 50–500 employee companies',
    monthly: 199,
    annual: 1680,
    cta: 'Start free trial',
    features: [
      'Unlimited active job slots',
      '2,000 CVs / month',
      '10 users',
      'Everything in Growth',
      'Analytics dashboard',
      'API access',
      'Role-based permissions (Admin / Recruiter / Viewer)',
      'Email notifications when shortlist is ready',
      'Hiring analytics (trends, skill gaps)',
      'Priority Slack support',
    ],
  },
  {
    plan: 'retainer',
    name: 'Enterprise',
    subtitle: 'For 500+ companies & enterprise HR',
    best: '500+ employee companies, staffing firms, enterprise HR',
    monthly: null,
    annual: null,
    cta: 'Talk to sales',
    features: [
      'Unlimited CVs per month',
      'Unlimited users',
      'Everything in Team',
      'Custom ATS / database integration',
      'SSO (Single Sign-On)',
      'SLA guarantee',
      'Dedicated Customer Success Manager',
      'Custom workflow per team',
      'On-premise deployment option',
      'Quarterly business reviews',
    ],
  },
]

const matrix = [
  { f: 'Active job slots', v: ['3', '10', 'Unlimited', 'Unlimited'] },
  { f: 'CVs per month', v: ['150', '500', '2,000', 'Unlimited'] },
  { f: 'Users', v: ['1', '3', '10', 'Unlimited'] },
  { f: 'AI scoring with JD-cited reasoning', v: [true, true, true, true] },
  { f: 'Interview question generation', v: [true, true, true, true] },
  { f: 'CSV export', v: [true, true, true, true] },
  { f: 'Bulk upload (100+ PDFs)', v: [false, true, true, true] },
  { f: 'Custom branding', v: [false, true, true, true] },
  { f: 'Screening history per JD', v: [false, true, true, true] },
  { f: 'Side-by-side compare', v: [false, true, true, true] },
  { f: 'Outreach email drafts', v: [false, true, true, true] },
  { f: 'Analytics dashboard', v: [false, false, true, true] },
  { f: 'API access', v: [false, false, true, true] },
  { f: 'Role-based permissions', v: [false, false, true, true] },
  { f: 'SSO (Single Sign-On)', v: [false, false, false, true] },
  { f: 'SLA guarantee', v: [false, false, false, true] },
  { f: 'Dedicated CSM', v: [false, false, false, true] },
  { f: 'On-premise deployment', v: [false, false, false, true] },
]

export default function Pricing() {
  useSeo({
    title: 'Pricing — From $49/mo. 14-day free trial. Cancel anytime.',
    description: 'Simple, transparent pricing for AI resume screening. Starter $49/mo, Growth $99/mo (most popular), Team $199/mo, or Enterprise custom. 14-day free trial — no credit card required.',
  })
  useSchema('pricing-faq', faqPage(pricingFaqs))

  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  const formatPrice = (t: Tier) => {
    if (t.monthly === null) return { price: 'Custom', per: '' }
    if (billing === 'monthly') return { price: `$${t.monthly}`, per: '/ month' }
    const perMonth = Math.round((t.annual as number) / 12)
    return { price: `$${perMonth}`, per: '/ month, billed annually' }
  }

  const ctaHref = (t: Tier) => {
    if (t.plan === 'retainer') return '/contact'
    return `/checkout?plan=${t.plan}`
  }

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Pricing' }]} schemaId="pricing-breadcrumb"/>
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-6 text-center">
        <span className="chip">Pricing</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Simple pricing.<br/><span className="gradient-text">No per-seat tax.</span></h1>
        <p className="mt-4 text-[var(--color-muted)] max-w-2xl mx-auto">Start with a 14-day free trial — no credit card. Switch between monthly and annual anytime. Save ~29% with annual billing.</p>

        <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${billing === 'monthly' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 ${billing === 'annual' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
          >
            Annual
            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)]'}`}>Save 29%</span>
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map(t => {
            const { price, per } = formatPrice(t)
            return (
              <div key={t.name} className={`card p-6 relative ${t.popular ? 'border-[var(--color-primary)]' : ''}`}>
                {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-[var(--color-primary)] text-white uppercase tracking-wider">Most popular</span>}
                <h3 className="text-lg font-bold">{t.name}</h3>
                <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>
                <div className="mt-5 flex items-baseline gap-1 min-h-[3rem]">
                  <span className="text-4xl font-extrabold gradient-text">{price}</span>
                  {per && <span className="text-xs text-[var(--color-muted)]">{per}</span>}
                </div>
                {t.annual !== null && billing === 'annual' && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-1">${t.annual}/year billed up front</p>
                )}
                {t.annual === null && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-1">Volume-based custom quote</p>
                )}
                <Link to={ctaHref(t)} className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mt-5">Best for</p>
                <p className="text-xs text-[var(--color-muted)] mt-1">{t.best}</p>
                <ul className="mt-5 space-y-2">
                  {t.features.map(f => (
                    <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <p className="text-center text-xs text-[var(--color-muted)] mt-6">Prices in USD. 14-day free trial on Starter, Growth, and Team. Cancel anytime, no questions asked.</p>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Compare every feature</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-muted)] font-medium">Feature</th>
                {tiers.map(t => <th key={t.name} className="text-center p-4 font-semibold">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.f} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4 text-[var(--color-fg)]">{row.f}</td>
                  {row.v.map((v, i) => (
                    <td key={i} className="text-center p-4 text-sm text-[var(--color-fg)]">
                      {typeof v === 'boolean'
                        ? (v ? <Check size={16} className="inline text-[var(--color-primary)]"/> : <X size={16} className="inline text-[var(--color-border)]"/>)
                        : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-16">
        <h3 className="text-center text-2xl font-bold mb-8">Questions?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {pricingFaqs.map(it => (
            <div key={it.q} className="card p-5">
              <div className="font-medium text-[var(--color-fg)]">{it.q}</div>
              <div className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{it.a}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
