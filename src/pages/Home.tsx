import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, BarChart3, Mail, Lock, FileStack, Check } from 'lucide-react'
import FAQ from '../components/FAQ'
import SaaSBrowserReviews from '../components/SaaSBrowserReviews'
import { useState, useEffect } from 'react'
import { useSeo } from '../lib/seo'
import { useSchema, organization, softwareApplication, faqPage, websiteSchema } from '../lib/schema'
import { useInView } from '../lib/useInView'
import TrustBar from '../components/TrustBar'

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
  { q: 'Does HireBest integrate with my ATS?', a: 'The Team plan ($199/mo) includes API access and the Enterprise plan adds custom ATS integration (Greenhouse, Lever, Workday).' },
  { q: 'Is HireBest GDPR compliant?', a: 'Yes — your CVs stay in your workspace with auth and row-level security by default.' },
]

const tiers = [
  { plan: 'basic',    name: 'Starter',    subtitle: 'Solo recruiters & consultants',     price: '$49',  per: '/ month', billing: '14-day free trial. Annual: $420/yr (save 29%)', cta: 'Start free trial',           features: ['3 active job slots', '150 CVs / month', '1 user', 'AI scoring with JD-cited reasoning', 'Interview question generation', 'CSV export'], best: 'Freelance recruiters, solo HR people, consultants' },
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',         price: '$99',  per: '/ month', billing: '14-day free trial. Annual: $840/yr (save 29%)', cta: 'Start 14-day free trial',     features: ['10 active job slots', '500 CVs / month', '3 users', 'Everything in Starter', 'Bulk upload (100+ PDFs)', 'Custom branding', 'Side-by-side compare', 'Priority email support'], popular: true },
  { plan: 'lifetime', name: 'Team',       subtitle: 'HR departments & agencies',         price: '$199', per: '/ month', billing: '14-day free trial. Annual: $1,680/yr (save 30%)', cta: 'Start free trial',          features: ['Unlimited job slots', '2,000 CVs / month', '10 users', 'Everything in Growth', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Priority Slack support'] },
  { plan: 'retainer', name: 'Enterprise', subtitle: '500+ companies & enterprise HR',    price: 'Custom', per: '',      billing: 'Volume-based custom quote',                       cta: 'Talk to sales',             features: ['Unlimited CVs / users', 'Everything in Team', 'Custom ATS integration', 'SSO (Single Sign-On)', 'SLA guarantee', 'Dedicated CSM', 'On-premise option', 'Quarterly business reviews'] },
]

const articles = [
  { slug: 'screen-100-cvs-in-38-seconds', title: 'How to Screen 100 CVs in 38 Seconds', read: '6 min read' },
  { slug: 'greenhouse-pricing-2026', title: 'Greenhouse Pricing in 2026: What\'s Really Going On', read: '8 min read' },
  { slug: 'ai-ats-wrong-way-to-think', title: 'Why \'AI ATS\' is the Wrong Way to Think About Hiring', read: '5 min read' },
]

const marqueeWords = ['38 SECONDS','100 CVS','AI POWERED','HIRE SMARTER','NO CREDIT CARD','BULK SCREENING']

function CountUp({ value }: { value: string }) {
  const clean = value.replace(/,/g, '')
  const match = clean.match(/^(\d+)(.*)$/)
  const target = match ? parseInt(match[1]) : 0
  const suffix = match ? match[2] : value
  const { ref, inView } = useInView<HTMLSpanElement>(0.5)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (target <= 1) { setCount(target); return }
    const duration = target > 1000 ? 2200 : 1600
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setCount(Math.round((1 - (1 - t) ** 3) * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  if (!match) return <>{value}</>
  return <span ref={ref}>{target >= 1000 ? count.toLocaleString() : count}{suffix}</span>
}

export default function Home() {
  useSeo({
    title: 'HireBest — AI Resume Screener · Score 100 CVs in 38 Seconds',
    description: 'AI resume screener for hiring teams. Score 100 CVs in 38 seconds with JD-cited reasoning, missing-skill detection, and auto-generated interview questions.',
  })
  useSchema('home-org', organization())
  useSchema('home-app', softwareApplication())
  useSchema('home-faq', faqPage(faqs))
  useSchema('home-website', websiteSchema())
  return (
    <>
      <Hero />
      <TrustBar />
      <Marquee />
      <Features />
      <HowItWorks />
      <Stats />
      <SaaSBrowserReviews />
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
        <span className="chip hero-anim hero-d1">HireBest — AI Resume Screener</span>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] hero-anim hero-d2">
          AI Resume Screener<br/>for Hiring Teams —<br/>
          <span className="gradient-text">Score 100 CVs in 38 Seconds</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[var(--color-muted)] text-base md:text-lg hero-anim hero-d3">
          HireBest reads every CV against your job description, scores fit, surfaces missing skills, and writes interview questions — in the time it takes to brew coffee.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center hero-anim hero-d4">
          <Link to="/signup" className="btn-primary">Start Screening Free <ArrowRight size={16}/></Link>
          <a href="#how-it-works" className="btn-ghost">See how it works</a>
          <Link to="/contact" className="btn-ghost">Contact Now</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-5 justify-center text-xs text-[var(--color-muted)] hero-anim hero-d5">
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
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.09}s` : '0s' })
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 py-20">
      <div ref={ref}>
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold fade-up${inView ? ' in-view' : ''}`}>
            Everything a recruiter wishes ATS did.
          </h2>
          <p className={`mt-3 text-[var(--color-muted)] fade-up${inView ? ' in-view' : ''}`} style={d(1)}>
            Built for the moment between "send me CVs" and "schedule the interview".
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className={`card p-6 fade-up${inView ? ' in-view' : ''}`} style={d(i + 2)}>
              <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center mb-4 card-icon">
                <f.icon size={20} className="text-[var(--color-primary-2)]"/>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.12}s` : '0s' })
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-20">
      <div ref={ref}>
        <div className="text-center mb-12">
          <span className={`chip fade-up${inView ? ' in-view' : ''}`}>How it works</span>
          <h2 className={`mt-4 text-3xl md:text-4xl font-bold fade-up${inView ? ' in-view' : ''}`} style={d(1)}>
            From inbox chaos to shortlist in 3 steps.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.n} className={`card p-7 fade-up${inView ? ' in-view' : ''}`} style={d(i + 2)}>
              <div className="text-5xl font-extrabold gradient-text mb-3">{s.n}</div>
              <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.1}s` : '0s' })
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card p-6 text-center fade-up${inView ? ' in-view' : ''}`} style={d(i)}>
            <div className="text-3xl md:text-4xl font-extrabold gradient-text">
              <CountUp value={s.n} />
            </div>
            <div className="text-xs text-[var(--color-muted)] mt-2 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SavingsCalculator() {
  const [roles, setRoles] = useState(20)
  const [cvs, setCvs] = useState(100)
  const [tool, setTool] = useState('Greenhouse')
  const { ref, inView } = useInView()
  const competitorCost: Record<string, number> = { Greenhouse: 7000, Workable: 3588, Lever: 12000, None: 0 }
  const ourCost = 840
  const saved = Math.max(0, competitorCost[tool] - ourCost)
  const hours = Math.round((roles * cvs * 3.5) / 60)
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div ref={ref}>
        <div className={`text-center mb-6 fade-up${inView ? ' in-view' : ''}`}>
          <span className="chip">Pricing</span>
        </div>
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-2 fade-up${inView ? ' in-view' : ''}`} style={{ transitionDelay: inView ? '0.1s' : '0s' }}>
          Simple pricing.<br/><span className="gradient-text">No per-seat tax.</span>
        </h2>
        <p className={`text-center text-[var(--color-muted)] mb-10 fade-up${inView ? ' in-view' : ''}`} style={{ transitionDelay: inView ? '0.2s' : '0s' }}>
          14-day free trial — no credit card required. Save ~29% with annual billing.
        </p>
        <div className={`card p-7 grid md:grid-cols-2 gap-8 fade-up${inView ? ' in-view' : ''}`} style={{ transitionDelay: inView ? '0.3s' : '0s' }}>
          <div>
            <h3 className="text-xl font-semibold mb-5">💰 How much will you save vs {tool}?</h3>
            <label className="block mb-4">
              <span className="text-sm text-[var(--color-muted)]">How many roles do you hire per year? <b className="text-[var(--color-fg)]">{roles}</b></span>
              <input type="range" min={5} max={200} value={roles} onChange={e => setRoles(+e.target.value)} className="w-full mt-2" />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-[var(--color-muted)]">Average CVs you screen per role? <b className="text-[var(--color-fg)]">{cvs}</b></span>
              <input type="range" min={20} max={500} value={cvs} onChange={e => setCvs(+e.target.value)} className="w-full mt-2" />
            </label>
            <div className="text-sm text-[var(--color-muted)] mb-2">Currently using</div>
            <div className="flex flex-wrap gap-2">
              {['Greenhouse','Workable','Lever','None'].map(t => (
                <button key={t} onClick={() => setTool(t)} className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${tool === t ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-fg)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary-2)]'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="bg-[rgba(47,123,255,0.06)] border border-[rgba(47,123,255,0.25)] rounded-xl p-6">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Saved per year vs {tool}</div>
            <div className="text-5xl font-extrabold gradient-text mt-2">${saved.toLocaleString()}</div>
            <div className="text-xs text-[var(--color-muted)] mt-2">${competitorCost[tool].toLocaleString()}/yr {tool} − $840/yr HireBest Growth (annual)</div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><div className="text-2xl font-bold text-[var(--color-fg)]">{hours}h</div><div className="text-xs text-[var(--color-muted)]">Hours saved</div></div>
              <div><div className="text-2xl font-bold text-[var(--color-fg)]">{(roles*cvs).toLocaleString()}</div><div className="text-xs text-[var(--color-muted)]">Total CVs/yr</div></div>
            </div>
            <p className="text-sm mt-5 text-[var(--color-muted)]">We recommend the <b className="text-[var(--color-fg)]">Growth</b> plan.</p>
            <Link to="/pricing" className="btn-primary mt-4 w-full justify-center">Start free trial</Link>
            <p className="text-[10px] text-[var(--color-muted)] mt-3 text-center">Estimates based on industry benchmarks. No data collected.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingTiers() {
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.1}s` : '0s' })
  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((t, i) => (
          <div key={t.name} className={`card p-6 relative fade-up${inView ? ' in-view' : ''} ${t.popular ? 'border-[var(--color-primary)]' : ''}`} style={d(i)}>
            {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-fg)] uppercase tracking-wider">Most popular</span>}
            <h3 className="text-lg font-bold">{t.name}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold gradient-text">{t.price}</span>
              <span className="text-sm text-[var(--color-muted)]">{t.per}</span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-2">{t.billing}</p>
            <Link to={t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}`} className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>
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
    { q: 'Is there a free trial?', a: 'Yes — 14 days free on the Growth plan. No credit card required to start.' },
    { q: 'Can I switch between monthly and annual?', a: 'Yes. Upgrade to annual anytime and save ~29% compared to monthly billing.' },
    { q: 'What if I exceed my CV limit?', a: 'We notify you before you hit the cap. Upgrade mid-cycle (prorated) — no surprise overage fees.' },
    { q: 'Can I cancel anytime?', a: 'Yes — one-click cancel from your dashboard. Monthly plans end at cycle close; annual gets prorated refunds within 30 days.' },
  ]
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.09}s` : '0s' })
  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <h3 className={`text-center text-2xl font-bold mb-8 fade-up${inView ? ' in-view' : ''}`}>Questions?</h3>
      <div ref={ref} className="grid md:grid-cols-2 gap-4">
        {items.map((it, i) => (
          <div key={it.q} className={`card p-5 fade-up${inView ? ' in-view' : ''}`} style={d(i)}>
            <div className="font-medium text-[var(--color-fg)]">{it.q}</div>
            <div className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  const { ref, inView } = useInView()
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div
        ref={ref}
        className={`card p-10 md:p-14 text-center relative overflow-hidden fade-up${inView ? ' in-view' : ''}`}
      >
        <div
          className="glow-pulse absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(60% 50% at 50% 0%, var(--color-glow), transparent 70%)' }}
        />
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
  const { ref, inView } = useInView()
  const d = (i: number) => ({ transitionDelay: inView ? `${i * 0.12}s` : '0s' })
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <h3 className={`text-center text-2xl font-bold mb-8 fade-up${inView ? ' in-view' : ''}`}>From the Blog</h3>
      <div ref={ref} className="grid md:grid-cols-3 gap-5">
        {articles.map((a, i) => (
          <Link key={a.slug} to={`/blog/${a.slug}`} className={`card p-6 hover:border-[var(--color-primary)] fade-up${inView ? ' in-view' : ''}`} style={d(i)}>
            <div className="text-xs text-[var(--color-muted)]">{a.read}</div>
            <h4 className="mt-2 font-semibold text-[var(--color-fg)]">{a.title}</h4>
            <div className="mt-4 text-sm text-[var(--color-primary-2)] flex items-center gap-1">Read <ArrowRight size={14}/></div>
          </Link>
        ))}
      </div>
    </section>
  )
}
