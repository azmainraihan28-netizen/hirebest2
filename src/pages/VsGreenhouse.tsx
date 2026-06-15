import { Link } from 'react-router-dom'
import { Check, X, ArrowRight, AlertCircle } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage, breadcrumb } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'

const TITLE = 'HireBest vs Greenhouse (2026): Which is Right for Your Team?'
const DESC =
  'A direct comparison of HireBest and Greenhouse on pricing, AI features, setup time, and which type of team belongs on each platform.'

const comparisonRows = [
  { feature: 'Starting price',             hirebest: '$49 / month',                     greenhouse: '~$7,000 / year (Essential tier)' },
  { feature: 'Pricing model',              hirebest: 'Monthly or annual SaaS',          greenhouse: 'Per-seat, annual contract' },
  { feature: 'Free trial',                 hirebest: '14 days, no credit card',         greenhouse: 'Sales-led demo only' },
  { feature: 'AI resume scoring',          hirebest: '0–100 with JD-cited reasoning',   greenhouse: 'Basic ranking / keyword match' },
  { feature: 'Setup time',                 hirebest: 'Same day',                        greenhouse: '30–90 days' },
  { feature: 'Screen 100 CVs',             hirebest: '38 seconds',                      greenhouse: 'Manual review + basic filters' },
  { feature: 'Contract required',          hirebest: 'No (cancel anytime)',             greenhouse: 'Annual contract (standard)' },
  { feature: 'Renewal price hikes',        hirebest: 'None',                            greenhouse: '8–15% per year (PE-backed)' },
  { feature: 'Multi-user access',          hirebest: 'Up to 10 users on Team plan',     greenhouse: 'Per-seat (~$300–$500/seat/yr)' },
  { feature: 'Native integrations',        hirebest: 'API access on Team plan ($199/mo)',greenhouse: '400+ marketplace partners' },
]

const vsGhFaqs = [
  {
    q: 'Is HireBest a full ATS like Greenhouse?',
    a: 'No — and that is intentional. HireBest is an AI resume screener focused on one problem: getting from a pile of CVs to a ranked shortlist in seconds. Greenhouse is a full applicant tracking system covering sourcing, structured interviews, offers, and onboarding. If your actual bottleneck is triage speed, you do not need the full ATS stack. If you need structured scorecards, offer management, and 400 integrations, Greenhouse earns its price.',
  },
  {
    q: 'How does HireBest handle multi-user access without per-seat pricing?',
    a: 'Each plan includes a fixed number of users at a flat rate — Starter ($49/mo) is for solo recruiters, Growth ($99/mo) covers 3 users, and Team ($199/mo) supports 10 users. Adding a sixth recruiter to the Growth plan costs nothing extra until you exceed the plan limit, at which point you upgrade tiers. The Team plan also adds role-based permissions (Admin, Recruiter, Viewer) for organisations that need controls.',
  },
  {
    q: 'What actually happens when Greenhouse renews my contract?',
    a: 'Greenhouse is owned by Permira, a private equity firm. Standard multi-year contracts include 8–15% annual escalators baked into the renewal terms. A team that negotiated a $6,000 deal in 2022 is renewing at $7,800–$9,000 today without any change in usage or headcount. Year-one price is not the real cost — year three after two compounding hikes is.',
  },
]

export default function VsGreenhouse() {
  useSeo({ title: TITLE, description: DESC })
  useSchema('vs-gh-faq', faqPage(vsGhFaqs))
  useSchema('vs-gh-bc', breadcrumb([
    { name: 'Home', url: 'https://hirebest.online' },
    { name: 'Compare', url: 'https://hirebest.online/pricing' },
    { name: 'HireBest vs Greenhouse', url: 'https://hirebest.online/vs-greenhouse' },
  ]))

  return (
    <>
      <Breadcrumbs
        trail={[{ name: 'Compare', href: '/pricing' }, { name: 'vs Greenhouse' }]}
        schemaId="vs-gh-bc-visible"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pt-10 pb-12 text-center">
        <span className="chip">Comparison · Updated June 2026</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          HireBest vs Greenhouse (2026):<br className="hidden md:block" /> Which is Right for Your Team?
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-[var(--color-muted)] text-lg leading-relaxed">
          Greenhouse is powerful — but is it right for your team size and budget? If you are hiring 5–50 roles
          a year with 1–3 recruiters, you may be paying for a platform built for a 10-person talent operations team.
          This comparison looks at both tools honestly: what Greenhouse does well, where HireBest wins on speed and
          price, and which type of team belongs on which platform.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Try HireBest Free <ArrowRight size={16} /></Link>
          <Link to="/pricing" className="btn-ghost">See pricing</Link>
        </div>
      </section>

      {/* ── Quick verdict ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-12">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-7 border-[var(--color-primary)]">
            <p className="chip">Choose HireBest if</p>
            <ul className="mt-5 space-y-3">
              {[
                'You are hiring 5–50 roles per year with 1–3 recruiters',
                'You want AI scoring without a multi-year contract',
                'You need results in days, not a 60-day implementation project',
                'Per-seat pricing sounds expensive when you factor in 10 hiring managers',
                'A one-time ownership option (no annual renewals) appeals to you',
              ].map(p => (
                <li key={p} className="text-sm text-[var(--color-fg)] flex gap-2">
                  <Check size={16} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <p className="chip">Choose Greenhouse if</p>
            <ul className="mt-5 space-y-3">
              {[
                'You have 200+ employees and a dedicated talent operations function',
                'You need 400+ integrations: Workday, BambooHR, DocuSign, Zoom',
                'Structured interview scorecards and DEI dashboards are non-negotiable',
                'SOC 2 / GDPR compliance documentation is required for procurement sign-off',
                'Your company is Series B+ and hiring is a core team competency',
              ].map(p => (
                <li key={p} className="text-sm text-[var(--color-fg)] flex gap-2">
                  <Check size={16} className="text-[var(--color-muted)] mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Feature comparison table ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Side-by-side feature comparison</h2>
        <p className="text-center text-[var(--color-muted)] mb-8 text-sm">
          10 features that determine which tool fits your workflow.
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-muted)] font-medium w-1/3">Feature</th>
                <th className="text-left p-4 font-semibold text-[var(--color-primary-2)] w-1/3">HireBest</th>
                <th className="text-left p-4 font-semibold w-1/3">Greenhouse</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(r => (
                <tr key={r.feature} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4 text-[var(--color-muted)]">{r.feature}</td>
                  <td className="p-4 text-[var(--color-fg)] font-medium">{r.hirebest}</td>
                  <td className="p-4 text-[var(--color-muted)]">{r.greenhouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-3 text-center">
          Greenhouse pricing based on Vendr benchmarks and G2 reviewer data, June 2026. See our{' '}
          <Link to="/blog/greenhouse-pricing-2026" className="underline underline-offset-2">
            Greenhouse pricing breakdown
          </Link>{' '}
          for full sourcing.
        </p>
      </section>

      {/* ── Pricing breakdown ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Pricing breakdown</h2>
        <p className="text-center text-[var(--color-muted)] mb-10 max-w-2xl mx-auto text-sm leading-relaxed">
          Greenhouse does not publish prices — every quote is custom. What procurement data consistently shows
          is that the year-one number is never the real cost once seat counts and renewal hikes are applied.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* HireBest pricing */}
          <div className="card p-7 border-[var(--color-primary)]">
            <p className="chip mb-4">HireBest — transparent, flat pricing</p>
            <div className="space-y-4">
              {[
                { name: 'Starter', price: '$49 / month', desc: 'Solo recruiters and consultants. 3 active jobs, 150 CVs/mo, 1 user. AI scoring, interview questions, CSV export.' },
                { name: 'Growth', price: '$99 / month', desc: 'Small HR teams and startups. 10 active jobs, 500 CVs/mo, 3 users. Bulk upload, custom branding, priority email support. Most teams start here.' },
                { name: 'Team', price: '$199 / month', desc: 'HR departments and staffing agencies. Unlimited jobs, 2,000 CVs/mo, 10 users. Analytics, API access, role-based permissions.' },
                { name: 'Enterprise', price: 'Custom', desc: '500+ companies. Unlimited everything, custom ATS integration, SSO, SLA, dedicated CSM, on-premise option.' },
              ].map(t => (
                <div key={t.name} className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[var(--color-fg)]">{t.name}</span>
                    <span className="text-[var(--color-primary-2)] font-bold whitespace-nowrap">{t.price}</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Greenhouse pricing */}
          <div className="card p-7">
            <p className="chip mb-4">Greenhouse — estimated real-world spend</p>
            <div className="space-y-4">
              {[
                { name: 'Essential', price: '$5,500–$7,000 / year', desc: 'Core ATS for a 50-person company with 3–5 active roles and ~17 seats (recruiters + hiring managers + interviewers).' },
                { name: 'Advanced', price: '$9,000–$15,000 / year', desc: 'Adds sourcing automations, deeper reporting, and DEI dashboards. Typical for 100+ person teams above 10 seats.' },
                { name: 'Expert', price: '$20,000+ / year', desc: 'Custom-quoted for 500+ employee organizations running structured hiring programs at scale.' },
              ].map(t => (
                <div key={t.name} className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[var(--color-fg)]">{t.name}</span>
                    <span className="font-bold text-[var(--color-muted)] whitespace-nowrap">{t.price}</span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                <strong className="text-[var(--color-fg)]">The renewal problem:</strong> Greenhouse is owned by
                Permira (private equity). Standard contracts include 8–15% annual escalators. A $6,000 deal
                from 2022 renews at $7,800–$9,000 today — without any change in usage.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 card p-5 border-[var(--color-primary)]/40">
          <p className="text-sm text-[var(--color-muted)] leading-relaxed text-center">
            <strong className="text-[var(--color-fg)]">The math:</strong> HireBest Growth at $840/year (billed annually) vs
            Greenhouse Essential at ~$7,000/year = <strong className="text-[var(--color-primary-2)]">$6,160 saved annually</strong> — before
            Greenhouse's renewal hikes compound. Over three years that gap typically widens to $22,000+.
          </p>
        </div>
      </section>

      {/* ── When to choose Greenhouse ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">When Greenhouse is worth the price</h2>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          This is not a page that tells you Greenhouse is bad. It is a market leader for a reason, and there
          are specific conditions where its price tag is completely justified.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          Greenhouse earns its cost when your organization has a dedicated talent operations function — meaning
          recruiters, coordinators, sourcing specialists, and hiring managers who all need to collaborate inside
          one system simultaneously. At that scale, the 400+ integration marketplace (Workday, BambooHR,
          DocuSign, LinkedIn Recruiter, Zoom, background check vendors) becomes a genuine productivity
          multiplier rather than a spec-sheet item you never use.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          Structured interview scorecards are the other real differentiator. If your hiring process requires
          panel interviews with quantitative scoring rubrics, calibration sessions, and documented feedback
          trails for compliance or DEI reporting, Greenhouse's structured interview kit is purpose-built for
          that workflow. HireBest does not do that. The two tools solve different problems.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed">
          The profile that belongs on Greenhouse: Series B+ tech company, 500+ employees, 5-person talent team,
          active compliance documentation requirements, and a hiring volume above 100 roles per year. At that
          scale, the overhead is justified. Below it, you are often paying for a system that was not designed
          for your workflow.
        </p>
      </section>

      {/* ── When to choose HireBest ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">When HireBest is the smarter call</h2>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          Most hiring teams are not enterprise talent functions. They are a founder who screens 40 CVs on a
          Tuesday evening, a recruiter at a 50-person agency managing six client mandates, or an HR lead at a
          mid-size company who needs to shortlist 120 applicants before Friday. For these workflows, a $7,000
          annual contract with a 60-day implementation project and per-seat pricing is not a solution. It is
          an obstacle.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          HireBest solves the triage bottleneck specifically. Upload a job description, upload up to 50+ PDFs
          at once, and get back a ranked list with 0–100 scores and JD-cited reasoning — explaining exactly
          why each candidate ranked where they did — in 38 seconds. No implementation project. No seat count
          negotiation. No sales call.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed mb-6">
          The no-lock-in model matters more than most people admit. Greenhouse's standard terms lock you into
          annual commitments with compounding renewal hikes. With HireBest, the Growth plan is $99/month flat
          (or $840/year if you prefer annual billing) — and if your hiring slows down, you cancel from your
          dashboard with one click. No retention call, no contract negotiation.
        </p>
        <p className="text-[var(--color-muted)] leading-relaxed">
          The honest trade-off: HireBest is a screening tool, not a full ATS. If you need offer management,
          sourcing automation, or structured interview scorecards, HireBest does not replace Greenhouse. But
          if your actual problem is a pile of CVs you need to triage fast — and you need a result today, not
          in 90 days — it almost certainly does.
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {vsGhFaqs.map(item => (
            <div key={item.q} className="card p-6">
              <h3 className="font-semibold text-[var(--color-fg)] text-base">{item.q}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="card p-10">
          <span className="chip">No contract needed</span>
          <h3 className="mt-4 text-2xl md:text-3xl font-bold">Try HireBest free — no contract needed.</h3>
          <p className="mt-3 text-[var(--color-muted)] leading-relaxed max-w-md mx-auto">
            No sales call. No procurement cycle. No per-seat tax. Plans from $49/month — or start free
            and upgrade when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/signup" className="btn-primary">Start Free <ArrowRight size={16} /></Link>
            <Link to="/pricing" className="btn-ghost">Compare plans</Link>
          </div>
        </div>
      </section>
    </>
  )
}
