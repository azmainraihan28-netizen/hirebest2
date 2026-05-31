import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage, breadcrumb } from '../lib/schema'

const pricingFaqs = [
  { q: 'Are these prices final?', a: 'Each tier shows a range. The exact quote depends on scope, integrations, and branding requirements.' },
  { q: 'Can I upgrade later?', a: 'Yes. Start with Basic or Advanced and upgrade to Custom Integrated whenever you\'re ready.' },
  { q: 'Do you offer ongoing support?', a: 'Yes — the Monthly Retainer covers maintenance, new features, and priority support after launch.' },
  { q: 'Need something custom?', a: 'Reach out — we tailor scope, integrations, and timelines for larger teams.' },
]

const tiers = [
  { plan: 'basic',    name: 'Basic',              subtitle: 'Lean, self-hosted screener',     price: '$400',   per: '/ year',     billing: 'Billed yearly — standalone HTML build',     cta: 'Get Basic',     features: ['HTML app with PDF upload', 'Smart AI scoring', 'CSV export of results', 'Runs locally on the client\'s laptop'] },
  { plan: 'advanced', name: 'Advanced', popular: true, subtitle: 'Multi-user, branded workspace', price: '$900', per: '/ year', billing: 'Billed yearly — includes everything in Basic', cta: 'Get Advanced', features: ['Everything in Basic', 'Save multiple Job Descriptions', 'Screening history per JD', 'Login system (multi-user)', 'Custom company branding (logo, colors)', 'Bulk upload — 50+ PDFs at once'] },
  { plan: 'lifetime', name: 'Custom Integrated', subtitle: 'Full ATS + database integration', price: '$1,500', per: ' one-time', billing: 'One-time payment — build time: 1–2 weeks', cta: 'Get Custom', features: ['Everything in Advanced', 'API integration', 'Role-based dashboard (Admin, Recruiter, Viewer)', 'Database storage (PostgreSQL or MongoDB)', 'Email notification when shortlist is ready', 'Custom workflow per client'] },
  { plan: 'retainer', name: 'Monthly Retainer',  subtitle: 'Ongoing care for live deployments', price: '$200', per: '/ month', billing: 'Best for Advanced & Custom clients post-launch', cta: 'Start Retainer', features: ['Maintenance and bug fixes', '1–2 new feature additions per month', 'Priority Slack & email support', 'Quarterly client review calls'] },
]

const matrix = [
  { f: 'AI scoring (0–100)', v: [true, true, true, false] },
  { f: 'PDF upload', v: [true, true, true, false] },
  { f: 'CSV export', v: [true, true, true, false] },
  { f: 'Multi-user login', v: [false, true, true, false] },
  { f: 'Custom branding', v: [false, true, true, false] },
  { f: 'Bulk 50+ PDFs', v: [false, true, true, false] },
  { f: 'Screening history', v: [false, true, true, false] },
  { f: 'API integration', v: [false, false, true, false] },
  { f: 'Role-based dashboard', v: [false, false, true, false] },
  { f: 'Database storage', v: [false, false, true, false] },
  { f: 'Maintenance & updates', v: [false, false, false, true] },
  { f: 'Priority support', v: [false, false, false, true] },
]

export default function Pricing() {
  useSeo({
    title: 'Pricing — From $400/yr to fully integrated ATS',
    description: 'Transparent plans from a $400/year standalone screener to a $1,500 one-time custom ATS build. No per-seat tax, no procurement cycle.',
  })
  useSchema('pricing-faq', faqPage(pricingFaqs))
  useSchema('pricing-breadcrumb', breadcrumb([
    { name: 'Home', url: 'https://hirebest.online/' },
    { name: 'Pricing', url: 'https://hirebest.online/pricing' },
  ]))
  return (
    <>
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 text-center">
        <span className="chip">Pricing</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">From a quick screener to a<br/><span className="gradient-text">fully integrated ATS</span></h1>
        <p className="mt-4 text-[var(--color-muted)]">Pick a yearly plan, then optionally add a monthly retainer for ongoing support.</p>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map(t => (
            <div key={t.name} className={`card p-6 relative ${t.popular ? 'border-[var(--color-primary)]' : ''}`}>
              {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-[var(--color-primary)] text-white uppercase tracking-wider">Most popular</span>}
              <h3 className="text-lg font-bold">{t.name}</h3>
              <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold gradient-text">{t.price}</span>
                <span className="text-sm text-[var(--color-muted)]">{t.per}</span>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">{t.billing}</p>
              <Link to={`/checkout?plan=${t.plan}`} className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>
              <ul className="mt-5 space-y-2">
                {t.features.map(f => (
                  <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[var(--color-muted)] mt-6">Prices in USD; starting points — final quote depends on scope.</p>
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
                    <td key={i} className="text-center p-4">
                      {v ? <Check size={16} className="inline text-[var(--color-primary)]"/> : <X size={16} className="inline text-[var(--color-border)]"/>}
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
          {[
            { q: 'Are these prices final?', a: 'Each tier shows a range. The exact quote depends on scope, integrations, and branding requirements.' },
            { q: 'Can I upgrade later?', a: 'Yes. Start with Basic or Advanced and upgrade to Custom Integrated whenever you\'re ready.' },
            { q: 'Do you offer ongoing support?', a: 'Yes — the Monthly Retainer covers maintenance, new features, and priority support after launch.' },
            { q: 'Need something custom?', a: 'Reach out — we tailor scope, integrations, and timelines for larger teams.' },
          ].map(it => (
            <div key={it.q} className="card p-5">
              <div className="font-medium text-white">{it.q}</div>
              <div className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{it.a}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
