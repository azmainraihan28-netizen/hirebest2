import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, Plus, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'
import { formatPlanLimit } from '../lib/plans'
import { Reveal, SplitHeading, Eyebrow, Spotlight, Magnetic } from '../components/motion/primitives'

const pricingFaqs = [
  { q: 'Is there a free trial?',                                    a: 'Yes — 14 days free on every paid plan (Starter, Growth and Team). No credit card required to start. Cancel anytime during the trial without being charged.' },
  { q: 'Is there a free plan?',                                     a: 'Yes. The free plan screens 50 CVs a month on 1 active job, with no credit card. Upgrade when you need more CVs, jobs or users.' },
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
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',           best: 'Small HR teams, startups, growing SMBs (5–50 employees)',           monthly: 99,   annual: 840,  popular: true, cta: 'Start 14-day trial', features: ['10 active job slots', `${formatPlanLimit('advanced')} CVs / month`, '3 users', 'Everything in Starter', 'Bulk upload, 200 CVs per batch', 'Custom branding (logo, colors)', 'Screening history per JD', 'Side-by-side candidate compare', 'Outreach email drafts', 'Priority email support'] },
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
  { f: 'CVs per upload batch',                v: ['50', '200', '200', '500'] },
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


export default function Pricing() {
  useSeo({
    title: 'Pricing — From $49/mo. 14-day free trial. Cancel anytime.',
    description: 'Transparent pricing from $49/mo. 14-day free trial, no credit card. Starter, Growth (popular), Team, and Enterprise plans — cancel anytime.',
  })
  useSchema('pricing-faq', faqPage(pricingFaqs))

  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const [open, setOpen] = useState<number | null>(0)

  const formatPrice = (t: Tier) => {
    if (t.monthly === null) return { price: 'Custom', per: '' }
    if (billing === 'monthly') return { price: `$${t.monthly}`, per: '/ mo' }
    const perMonth = Math.round((t.annual as number) / 12)
    return { price: `$${perMonth}`, per: '/ mo, billed annually' }
  }

  const ctaHref = (t: Tier) => (t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}&interval=${billing}`)

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden -mt-[76px] pt-[76px]">
        <div className="aurora" aria-hidden><span/><span/><span/></div>
        <div className="hairlines" aria-hidden />
        <Breadcrumbs trail={[{ name: 'Pricing' }]} schemaId="pricing-breadcrumb"/>
        <div className="relative max-w-7xl mx-auto px-5 pt-14 pb-14 text-center">
          <Eyebrow n="$">Pricing</Eyebrow>
          <SplitHeading as="h1" text={'Simple pricing.\n*No* per-seat tax.'} className="display-xl mt-7 text-[var(--color-fg)]" />
          <Reveal delay={0.35} className="mt-7 text-[var(--color-fg-dim)] max-w-2xl mx-auto text-lg">
            Start with a 14-day free trial — no credit card. Switch monthly ↔ annual anytime. Save ~29% with annual billing.
          </Reveal>

          <Reveal delay={0.5} className="mt-10 inline-flex items-center gap-1 p-1.5 rounded-full border border-[var(--color-border-strong)] bg-[color-mix(in_srgb,var(--color-card)_70%,transparent)] backdrop-blur">
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition ${billing === b ? 'text-[var(--color-primary-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
              >
                {billing === b && (
                  <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-[var(--color-primary)]" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
                )}
                <span className="relative inline-flex items-center gap-2 capitalize">
                  {b}
                  {b === 'annual' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-[var(--color-chip-bg)] text-[var(--color-chip-fg)]'}`}>−29%</span>
                  )}
                </span>
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="max-w-7xl mx-auto px-5 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t, i) => {
            const { price, per } = formatPrice(t)
            return (
              <Reveal key={t.name} delay={i * 0.07}>
                <Spotlight className={`tile h-full p-7 flex flex-col ${t.popular ? 'ring-glow border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-[-0.03em]">{t.name}</h3>
                    {t.popular && <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] uppercase tracking-widest font-semibold">Popular</span>}
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>

                  <div className="mt-8 min-h-[4.25rem]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={price}
                        initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35 }}
                        className="flex items-baseline gap-1.5"
                      >
                        <span className="price-digits text-5xl text-[var(--color-fg)] tabular">{price}</span>
                        {per && <span className="text-xs text-[var(--color-muted)]">{per}</span>}
                      </motion.div>
                    </AnimatePresence>
                    {t.annual !== null && billing === 'annual' && (
                      <p className="text-[11px] text-[var(--color-muted)] mt-2 font-mono">${t.annual}/yr billed up front</p>
                    )}
                    {t.annual === null && <p className="text-[11px] text-[var(--color-muted)] mt-2">Volume-based custom quote</p>}
                  </div>

                  <Link to={ctaHref(t)} className={`mt-6 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>

                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mt-7">Best for</p>
                  <p className="text-xs text-[var(--color-fg-dim)] mt-1.5">{t.best}</p>

                  <ul className="mt-6 space-y-2.5 flex-1 pt-6 border-t border-[var(--color-border)]">
                    {t.features.map(f => (
                      <li key={f} className="text-[13px] text-[var(--color-fg-dim)] flex gap-2.5">
                        <Check size={14} className="text-[var(--color-primary-2)] mt-0.5 shrink-0"/>{f}
                      </li>
                    ))}
                  </ul>
                </Spotlight>
              </Reveal>
            )
          })}
        </div>
        <p className="text-center text-[11px] text-[var(--color-muted)] mt-6">
          Prices in USD. 14-day free trial on Starter, Growth, and Team. Cancel anytime — no questions asked.
        </p>
      </section>

      {/* ── Feature matrix ── */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <div className="mb-10">
          <Eyebrow n="01">Comparison</Eyebrow>
          <SplitHeading text={'Compare *every* feature.'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>

        <p className="md:hidden -mt-4 mb-4 text-xs text-[var(--color-muted)]">Swipe sideways to compare all four plans →</p>
        <Reveal>
          <div className="tile overflow-x-auto">
            <table className="w-full text-sm min-w-[40rem]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="sticky left-0 z-10 bg-[var(--color-bg-2)] md:bg-transparent md:static text-left p-3 md:p-5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] font-medium">Feature</th>
                  {tiers.map(t => (
                    <th key={t.name} className={`text-center p-3 md:p-5 ${t.popular ? 'bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]' : ''}`}>
                      <div className={`font-[family-name:var(--font-heading)] text-base font-semibold tracking-[-0.03em] ${t.popular ? 'text-[var(--color-primary-2)]' : 'text-[var(--color-fg)]'}`}>{t.name}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] font-normal mt-1">
                        {t.monthly !== null ? `$${t.monthly}/mo` : 'Custom'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(row => (
                  <tr key={row.f} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[color-mix(in_srgb,var(--color-fg)_2.5%,transparent)] transition">
                    <td className="sticky left-0 z-10 bg-[var(--color-bg-2)] md:bg-transparent md:static px-3 md:px-5 py-3 md:py-4 text-[var(--color-fg-dim)] max-w-[9.5rem] md:max-w-none">{row.f}</td>
                    {row.v.map((v, i) => (
                      <td key={i} className={`text-center px-3 md:px-5 py-3 md:py-4 ${tiers[i].popular ? 'bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]' : ''}`}>
                        {typeof v === 'boolean'
                          ? (v
                            ? <span className="inline-flex w-6 h-6 rounded-full items-center justify-center bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-[var(--color-primary-2)]"><Check size={13}/></span>
                            : <Minus size={15} className="inline text-[var(--color-muted-2)]"/>)
                          : <span className="text-[var(--color-fg)] font-mono tabular text-xs">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Eyebrow n="02">FAQ</Eyebrow>
            <SplitHeading text={'Billing,\n*demystified.*'} className="display-lg mt-6 text-[var(--color-fg)]" />
            <div className="mt-8">
              <Magnetic><Link to="/contact" className="btn-ghost">Still unsure? Talk to us <ArrowRight size={14}/></Link></Magnetic>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 border-t border-[var(--color-border)]">
          {pricingFaqs.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={it.q} className="border-b border-[var(--color-border)]">
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-center justify-between gap-6 py-6 text-left group">
                  <span className="flex items-baseline gap-5">
                    <span className="font-mono text-xs text-[var(--color-muted-2)] tabular">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-semibold tracking-[-0.03em] text-[var(--color-fg)] group-hover:text-[var(--color-primary-2)] transition">{it.q}</span>
                  </span>
                  <span className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition ${isOpen ? 'bg-[var(--color-primary)] border-transparent text-white rotate-45' : 'border-[var(--color-border-strong)] text-[var(--color-muted)]'}`}>
                    <Plus size={16}/>
                  </span>
                </button>
                {/* Always in the DOM (and the prerendered HTML) so every answer is crawlable; collapsed with CSS. */}
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!isOpen}>
                  <div className="overflow-hidden">
                    <p className="pb-6 pl-10 pr-12 text-[var(--color-fg-dim)] leading-relaxed">{it.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
