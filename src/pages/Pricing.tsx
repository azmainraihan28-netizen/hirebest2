import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'
import { formatPlanLimit } from '../lib/plans'

const pricingFaqs = [
  { q: 'Is there a free trial?',                                    a: 'Yes — 14 days free on the Growth plan. No credit card required to start. Cancel anytime during the trial without being charged.' },
  { q: 'Can I switch between monthly and annual?',                  a: 'Yes. You can upgrade from monthly to annual at any time and lock in two months free. Annual plans save ~29% compared to paying monthly.' },
  { q: 'What counts as an "active job slot"?',                      a: 'Any open role you are actively screening candidates for. Closed or paused jobs free up a slot. You can archive old jobs to stay within your limit.' },
  { q: 'What happens if I exceed my monthly CV limit?',             a: 'We will notify you before you hit the cap. You can upgrade mid-cycle (prorated) or wait until next month — no overage fees, no surprise charges.' },
  { q: 'Do you offer discounts for non-profits or startups?',       a: 'Yes — 50% off the Growth plan for registered non-profits and YC/Techstars startups in their first year. Email contact@hirebest.online with proof of status.' },
  { q: 'Can I cancel anytime?',                                     a: 'Yes. Cancel from your dashboard in one click. No phone calls, no retention scripts. Monthly plans cancel at the end of the current cycle; annual plans get prorated refunds within 30 days.' },
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
  { plan: 'basic',    name: 'Starter',    subtitle: 'Solo recruiters & consultants',       best: 'Freelance recruiters, solo HR, hiring consultants',                monthly: 49,   annual: 420,  cta: 'Start free trial',   features: ['3 active job slots', `${formatPlanLimit('basic')} CVs / month`, '1 user', 'AI scoring with cited reasoning', 'Interview question generation', 'CSV export'] },
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',           best: 'Small HR teams, startups, growing SMBs (5–50 employees)',           monthly: 99,   annual: 840,  popular: true, cta: 'Start 14-day trial', features: ['10 active job slots', `${formatPlanLimit('advanced')} CVs / month`, '3 users', 'Everything in Starter', 'Bulk upload (100+ PDFs)', 'Custom branding (logo, colors)', 'Screening history per JD', 'Side-by-side candidate compare', 'Outreach email drafts', 'Priority email support'] },
  { plan: 'lifetime', name: 'Team',       subtitle: 'HR departments & staffing agencies',  best: 'HR departments, staffing agencies, 50–500 employee companies',      monthly: 199,  annual: 1680, cta: 'Start free trial',   features: ['Unlimited active job slots', `${formatPlanLimit('lifetime')} CVs / month`, '10 users', 'Everything in Growth', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Email notifications', 'Hiring analytics', 'Priority Slack support'] },
  { plan: 'retainer', name: 'Enterprise', subtitle: '500+ companies & enterprise HR',      best: '500+ employee companies, staffing firms, enterprise HR',            monthly: null, annual: null, cta: 'Talk to sales',      features: [`${formatPlanLimit('retainer')} CVs / month`, 'Unlimited users', 'Everything in Team', 'Custom ATS / database integration', 'SSO (Single Sign-On)', 'SLA guarantee', 'Dedicated CSM', 'Custom workflow per team', 'On-premise deployment', 'Quarterly business reviews'] },
]

const matrix = [
  { f: 'Active job slots',                    v: ['3', '10', 'Unlimited', 'Unlimited'] },
  { f: 'CVs per month',                        v: (['basic', 'advanced', 'lifetime', 'retainer'] as const).map(formatPlanLimit) },
  { f: 'Users',                                v: ['1', '3', '10', 'Unlimited'] },
  { f: 'AI scoring with cited reasoning',     v: [true, true, true, true] },
  { f: 'Interview question generation',        v: [true, true, true, true] },
  { f: 'CSV export',                           v: [true, true, true, true] },
  { f: 'Bulk upload (100+ PDFs)',             v: [false, true, true, true] },
  { f: 'Custom branding',                      v: [false, true, true, true] },
  { f: 'Screening history per JD',            v: [false, true, true, true] },
  { f: 'Side-by-side compare',                v: [false, true, true, true] },
  { f: 'Outreach email drafts',                v: [false, true, true, true] },
  { f: 'Analytics dashboard',                  v: [false, false, true, true] },
  { f: 'API access',                           v: [false, false, true, true] },
  { f: 'Role-based permissions',              v: [false, false, true, true] },
  { f: 'SSO (Single Sign-On)',                v: [false, false, false, true] },
  { f: 'SLA guarantee',                        v: [false, false, false, true] },
  { f: 'Dedicated CSM',                        v: [false, false, false, true] },
  { f: 'On-premise deployment',               v: [false, false, false, true] },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export default function Pricing() {
  useSeo({
    title: 'Pricing — From $49/mo. 14-day free trial. Cancel anytime.',
    description: 'Transparent pricing from $49/mo. 14-day free trial, no credit card. Starter, Growth (popular), Team, and Enterprise plans — cancel anytime.',
  })
  useSchema('pricing-faq', faqPage(pricingFaqs))

  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  const formatPrice = (t: Tier) => {
    if (t.monthly === null) return { price: 'Custom', per: '' }
    if (billing === 'monthly') return { price: `$${t.monthly}`, per: '/ mo' }
    const perMonth = Math.round((t.annual as number) / 12)
    return { price: `$${perMonth}`, per: '/ mo, billed annually' }
  }

  const ctaHref = (t: Tier) => (t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}`)

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Pricing' }]} schemaId="pricing-breadcrumb"/>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-70" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />
        <div className="max-w-7xl mx-auto px-5 pt-16 pb-10 text-center">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="chip">Pricing</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.05 }}
            className="mt-6 text-4xl md:text-6xl font-semibold tracking-[-0.035em]"
          >
            Simple pricing.<br/>
            <span className="text-[var(--color-muted)]">No per-seat tax.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 text-[var(--color-fg-dim)] max-w-2xl mx-auto"
          >
            Start with a 14-day free trial — no credit card. Switch monthly ↔ annual anytime. Save ~29% with annual billing.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-9 inline-flex items-center gap-1 p-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] relative"
          >
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition z-10 ${billing === b ? 'text-[var(--color-primary-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
              >
                {billing === b && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-primary)] -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="inline-flex items-center gap-2 capitalize">
                  {b}
                  {b === 'annual' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)]'}`}>
                      −29%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="max-w-7xl mx-auto px-5 pb-10">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(t => {
            const { price, per } = formatPrice(t)
            return (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className={`card card-lift p-6 relative flex flex-col ${t.popular ? 'border-[var(--color-primary)]/60 ring-1 ring-[var(--color-primary)]/25' : ''}`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-6 text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] uppercase tracking-widest font-semibold">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
                <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>

                <div className="mt-6 flex items-baseline gap-1 min-h-[3.5rem]">
                  <span className="text-4xl font-semibold text-[var(--color-fg)] tracking-tight font-mono tabular">{price}</span>
                  {per && <span className="text-xs text-[var(--color-muted)]">{per}</span>}
                </div>
                {t.annual !== null && billing === 'annual' && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">${t.annual}/yr billed up front</p>
                )}
                {t.annual === null && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-1">Volume-based custom quote</p>
                )}

                <Link to={ctaHref(t)} className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>
                  {t.cta}
                </Link>

                <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mt-6">Best for</p>
                <p className="text-xs text-[var(--color-fg-dim)] mt-1">{t.best}</p>

                <ul className="mt-5 space-y-2 flex-1 pt-5 border-t border-[var(--color-border)]">
                  {t.features.map(f => (
                    <li key={f} className="text-xs text-[var(--color-fg-dim)] flex gap-2">
                      <Check size={13} className="text-[var(--color-primary-2)] mt-0.5 shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </motion.div>
        <p className="text-center text-[11px] text-[var(--color-muted)] mt-6">
          Prices in USD. 14-day free trial on Starter, Growth, and Team. Cancel anytime — no questions asked.
        </p>
      </section>

      {/* ── Feature matrix ── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="mb-8">
          <span className="chip">Comparison</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Compare every feature</h2>
        </div>

        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm table-clean">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">Feature</th>
                {tiers.map(t => (
                  <th key={t.name} className="text-center p-4 font-semibold tracking-tight">
                    <div className={t.popular ? 'text-[var(--color-primary-2)]' : 'text-[var(--color-fg)]'}>{t.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-normal mt-1">
                      {t.monthly !== null ? `$${t.monthly}/mo` : 'Custom'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.f} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4 text-[var(--color-fg-dim)]">{row.f}</td>
                  {row.v.map((v, i) => (
                    <td key={i} className="text-center p-4 text-sm">
                      {typeof v === 'boolean'
                        ? (v
                          ? <Check size={16} className="inline text-[var(--color-primary-2)]"/>
                          : <Minus size={16} className="inline text-[var(--color-muted-2)]"/>)
                        : <span className="text-[var(--color-fg)] font-mono tabular text-xs">{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="mb-8">
          <span className="chip">FAQ</span>
          <h3 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Questions?</h3>
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-3"
        >
          {pricingFaqs.map(it => (
            <motion.div key={it.q} variants={fadeUp} className="card p-6">
              <div className="font-medium text-[var(--color-fg)]">{it.q}</div>
              <div className="text-sm text-[var(--color-fg-dim)] mt-2 leading-relaxed">{it.a}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  )
}
