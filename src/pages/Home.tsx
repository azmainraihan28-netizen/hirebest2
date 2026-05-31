import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, BarChart3, Mail, Lock, FileStack, Check, MessageCircle } from 'lucide-react'
import FAQ from '../components/FAQ'
import { useState } from 'react'
import { useSeo } from '../lib/seo'

const features = [
  { icon: Sparkles, title: 'AI scoring you can trust', desc: 'Each candidate gets a 0–100 match score with written reasoning citing the JD.' },
  { icon: Layers, title: 'Side-by-side compare', desc: 'Pin shortlisted candidates and compare strengths, gaps, and experience instantly.' },
  { icon: BarChart3, title: 'Hiring analytics', desc: 'Track screenings over time, average fit ratio, and most common missing skills.' },
  { icon: Mail, title: 'Outreach drafts', desc: 'Generate personalised interview invites and rejection emails in one click.' },
  { icon: Lock, title: 'Private & yours', desc: 'Your CVs stay in your workspace. Auth, RLS, and per-user data isolation by default.' },
  { icon: FileStack, title: 'Bulk by design', desc: 'Drop 200 CVs at once. PDF, DOCX, PNG, even SVG — we OCR and parse them all.' },
]

const steps = [
  { n: '01', title: 'Drop the JD & CVs', desc: 'Paste any job description, then drag in a folder of resumes — PDF, DOCX, PNG, SVG.' },
  { n: '02', title: 'Let AI read every line', desc: 'HireBest extracts skills, experience, and matches them to your role with reasoning.' },
  { n: '03', title: 'Hire with confidence', desc: 'Filter to Fit candidates, compare your shortlist, and send the first interview invite.' },
]

const stats = [
  { n: '38s', label: 'to screen 100 CVs' },
  { n: '94%', label: 'agreement with recruiters' },
  { n: '10,000+', label: 'resumes processed weekly' },
  { n: '1', label: 'tab you need open' },
]

const faqs = [
  { q: 'How fast does HireBest score CVs?', a: '100 CVs in 38 seconds on average.' },
  { q: 'How accurate is HireBest\'s AI scoring?', a: '94% agreement with senior recruiters in internal testing.' },
  { q: 'What file formats does HireBest support?', a: 'PDF, DOCX, PNG, and SVG with OCR for image-based CVs.' },
  { q: 'Does HireBest integrate with my ATS?', a: 'The Custom Integrated tier connects to LinkedIn Recruiter or Workday APIs.' },
  { q: 'Is HireBest GDPR compliant?', a: 'Yes — your CVs stay in your workspace with auth and row-level security by default.' },
]

const tiers = [
  { name: 'Basic', subtitle: 'Lean, self-hosted screener', price: '$400', per: '/ year', billing: 'Billed yearly — standalone HTML build', cta: 'Get Basic', features: ['HTML app with PDF upload', 'Smart AI scoring', 'CSV export of results', 'Runs locally on the client\'s laptop'], best: 'Independent recruiters, small consultancies, freelance HR pros' },
  { name: 'Advanced', subtitle: 'Multi-user, branded workspace', price: '$900', per: '/ year', billing: 'Billed yearly — includes everything in Basic', cta: 'Get Advanced', features: ['Everything in Basic', 'Save multiple Job Descriptions', 'Screening history per JD', 'Login system (multi-user)', 'Custom company branding (logo, colors)', 'Bulk upload — 50+ PDFs at once'], popular: true },
  { name: 'Custom Integrated', subtitle: 'Full ATS + database integration', price: '$1,500', per: ' one-time', billing: 'One-time payment — build time: 1–2 weeks', cta: 'Talk to us', features: ['Everything in Advanced', 'API integration', 'Role-based dashboard (Admin, Recruiter, Viewer)', 'Database storage (PostgreSQL or MongoDB)', 'Email notification when shortlist is ready', 'Custom workflow per client'] },
  { name: 'Monthly Retainer', subtitle: 'Ongoing care for live deployments', price: '$200', per: '/ month', billing: 'Best for Advanced & Custom clients post-launch', cta: 'Start Retainer', features: ['Maintenance and bug fixes', '1–2 new feature additions per month', 'Priority Slack & email support', 'Quarterly client review calls'] },
]

const articles = [
  { slug: 'screen-100-cvs-in-38-seconds', title: 'How to Screen 100 CVs in 38 Seconds', read: '6 min read' },
  { slug: 'greenhouse-pricing-2026', title: 'Greenhouse Pricing in 2026: What\'s Really Going On', read: '8 min read' },
  { slug: 'ai-ats-wrong-way-to-think', title: 'Why \'AI ATS\' is the Wrong Way to Think About Hiring', read: '5 min read' },
]

const marqueeWords = ['38 SECONDS','100 CVS','AI POWERED','HIRE SMARTER','NO CREDIT CARD','BULK SCREENING']

export default function Home() {
  useSeo({
    title: 'HireBest — AI Resume Screener · Score 100 CVs in 38 Seconds',
    description: 'AI resume screener for hiring teams. Score 100 CVs in 38 seconds with JD-cited reasoning, missing-skill detection, and auto-generated interview questions.',
  })
  return (
    <>
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonial />
      <SavingsCalculator />
      <PricingTiers />
      <PricingFAQ />
      <CTA />
      <BlogStrip />
      <FAQ items={faqs} />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="glow absolute inset-0 -z-10" />
      <div className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
        <span className="chip">HireBest — AI Resume Screener</span>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          AI Resume Screener<br/>for Hiring Teams —<br/>
          <span className="gradient-text">Score 100 CVs in 38 Seconds</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[var(--color-muted)] text-base md:text-lg">
          HireBest reads every CV against your job description, scores fit, surfaces missing skills, and writes interview questions — in the time it takes to brew coffee.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Start Screening Free <ArrowRight size={16}/></Link>
          <a href="#how-it-works" className="btn-ghost">See how it works</a>
          <Link to="/contact" className="btn-ghost">Contact Now</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-5 justify-center text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>No credit card</span>
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>PDF, DOCX, PNG, SVG</span>
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>Bulk batch screening</span>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const words = [...marqueeWords, ...marqueeWords, ...marqueeWords]
  return (
    <div className="marquee">
      <div className="marquee-track">
        {words.map((w, i) => (
          <span key={i} className="text-xs tracking-[0.3em] font-semibold text-[var(--color-muted)]">{w} ·</span>
        ))}
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Everything a recruiter wishes ATS did.</h2>
        <p className="mt-3 text-[var(--color-muted)]">Built for the moment between "send me CVs" and "schedule the interview".</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div key={i} className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center mb-4">
              <f.icon size={20} className="text-[var(--color-primary-2)]"/>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-20">
      <div className="text-center mb-12">
        <span className="chip">How it works</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold">From inbox chaos to shortlist in 3 steps.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map(s => (
          <div key={s.n} className="card p-7">
            <div className="text-5xl font-extrabold gradient-text mb-3">{s.n}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-6 text-center">
            <div className="text-3xl md:text-4xl font-extrabold gradient-text">{s.n}</div>
            <div className="text-xs text-[var(--color-muted)] mt-2 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonial() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-8 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Trusted by hiring teams</div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="card p-6 md:col-span-1">
          <p className="text-sm leading-relaxed text-[var(--color-fg)]">"HireBest cut our screening time from 6 hours to 12 minutes per role. Our recruiters get their evenings back."</p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">— Head of Talent</p>
        </div>
        <div className="card p-6 flex flex-col justify-center">
          <div className="text-3xl font-bold gradient-text">38s</div>
          <p className="text-xs text-[var(--color-muted)] mt-1">to screen 100 CVs</p>
          <div className="text-3xl font-bold gradient-text mt-4">94%</div>
          <p className="text-xs text-[var(--color-muted)] mt-1">agreement with senior recruiters</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3">Coming soon</p>
          <ul className="text-sm space-y-2 text-[var(--color-fg)]">
            <li>G2 Verified</li>
            <li>Capterra Listed</li>
            <li>Product Hunt</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function SavingsCalculator() {
  const [roles, setRoles] = useState(20)
  const [cvs, setCvs] = useState(100)
  const [tool, setTool] = useState('Greenhouse')
  const competitorCost: Record<string, number> = { Greenhouse: 7000, Workable: 3588, Lever: 12000, None: 0 }
  const ourCost = 900
  const saved = Math.max(0, competitorCost[tool] - ourCost)
  const hours = Math.round((roles * cvs * 3.5) / 60)
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-6"><span className="chip">Pricing</span></div>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">From a quick screener to a<br/><span className="gradient-text">fully integrated ATS</span></h2>
      <p className="text-center text-[var(--color-muted)] mb-10">Pick a yearly plan, then optionally add a monthly retainer for ongoing support.</p>
      <div className="card p-7 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-5">💰 How much will you save vs {tool}?</h3>
          <label className="block mb-4">
            <span className="text-sm text-[var(--color-muted)]">How many roles do you hire per year? <b className="text-white">{roles}</b></span>
            <input type="range" min={5} max={200} value={roles} onChange={e => setRoles(+e.target.value)} className="w-full mt-2" />
          </label>
          <label className="block mb-4">
            <span className="text-sm text-[var(--color-muted)]">Average CVs you screen per role? <b className="text-white">{cvs}</b></span>
            <input type="range" min={20} max={500} value={cvs} onChange={e => setCvs(+e.target.value)} className="w-full mt-2" />
          </label>
          <div className="text-sm text-[var(--color-muted)] mb-2">Currently using</div>
          <div className="flex flex-wrap gap-2">
            {['Greenhouse','Workable','Lever','None'].map(t => (
              <button key={t} onClick={() => setTool(t)} className={`px-3 py-1.5 rounded-md text-sm border ${tool === t ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-[var(--color-muted)]'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="bg-[rgba(47,123,255,0.06)] border border-[rgba(47,123,255,0.25)] rounded-xl p-6">
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Saved per year vs {tool}</div>
          <div className="text-5xl font-extrabold gradient-text mt-2">${saved.toLocaleString()}</div>
          <div className="text-xs text-[var(--color-muted)] mt-2">${competitorCost[tool].toLocaleString()}/yr {tool} − $900/yr HireBest Advanced</div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div><div className="text-2xl font-bold text-white">{hours}h</div><div className="text-xs text-[var(--color-muted)]">Hours saved</div></div>
            <div><div className="text-2xl font-bold text-white">{(roles*cvs).toLocaleString()}</div><div className="text-xs text-[var(--color-muted)]">Total CVs/yr</div></div>
          </div>
          <p className="text-sm mt-5 text-[var(--color-muted)]">We recommend the <b className="text-white">Advanced</b> plan.</p>
          <Link to="/pricing" className="btn-primary mt-4 w-full justify-center">Get Advanced</Link>
          <p className="text-[10px] text-[var(--color-muted)] mt-3 text-center">Estimates based on industry benchmarks. No data collected.</p>
        </div>
      </div>
    </section>
  )
}

function PricingTiers() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
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
            <Link to="/contact" className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>
            {t.best && <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mt-4">Best for</p>}
            {t.best && <p className="text-xs text-[var(--color-muted)] mt-1">{t.best}</p>}
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
  )
}

function PricingFAQ() {
  const items = [
    { q: 'Are these prices final?', a: 'Each tier shows a range. The exact quote depends on scope, integrations, and branding requirements.' },
    { q: 'Can I upgrade later?', a: 'Yes. Start with Basic or Advanced and upgrade to Custom Integrated whenever you\'re ready.' },
    { q: 'Do you offer ongoing support?', a: 'Yes — the Monthly Retainer covers maintenance, new features, and priority support after launch.' },
    { q: 'Need something custom?', a: 'Reach out — we tailor scope, integrations, and timelines for larger teams.' },
  ]
  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <h3 className="text-center text-2xl font-bold mb-8">Questions?</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(it => (
          <div key={it.q} className="card p-5">
            <div className="font-medium text-white">{it.q}</div>
            <div className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="card p-10 md:p-14 text-center relative overflow-hidden">
        <div className="glow absolute inset-0 -z-10"/>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Stop reading CVs.<br/>Start meeting people.</h2>
        <p className="mt-4 text-[var(--color-muted)] max-w-xl mx-auto">Spin up your first screening in under a minute. No setup, no integrations, no nonsense.</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Start Screening Free <ArrowRight size={16}/></Link>
          <Link to="/login" className="btn-ghost">I have an account</Link>
        </div>
      </div>
    </section>
  )
}

function BlogStrip() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <h3 className="text-center text-2xl font-bold mb-8">From the Blog</h3>
      <div className="grid md:grid-cols-3 gap-5">
        {articles.map(a => (
          <Link key={a.slug} to={`/blog/${a.slug}`} className="card p-6 hover:border-[var(--color-primary)] transition">
            <div className="text-xs text-[var(--color-muted)]">{a.read}</div>
            <h4 className="mt-2 font-semibold text-white">{a.title}</h4>
            <div className="mt-4 text-sm text-[var(--color-primary-2)] flex items-center gap-1">Read <ArrowRight size={14}/></div>
          </Link>
        ))}
      </div>
    </section>
  )
}
