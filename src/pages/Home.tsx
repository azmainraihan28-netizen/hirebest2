import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, BarChart3, Mail, Lock, FileStack, Check } from 'lucide-react'
import FAQ from '../components/FAQ'
import SaaSBrowserReviews from '../components/SaaSBrowserReviews'
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion, type Variants } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, organization, softwareApplication, faqPage, websiteSchema } from '../lib/schema'
import { useInView } from '../lib/useInView'
import TrustBar from '../components/TrustBar'
import { formatPlanLimit } from '../lib/plans'

const features = [
  { icon: Sparkles, title: 'AI scoring you can trust', desc: 'Each candidate gets a 0–100 match score with written reasoning citing the JD.' },
  { icon: Layers, title: 'Side-by-side compare', desc: 'Pin shortlisted candidates and compare strengths, gaps, and experience instantly.' },
  { icon: BarChart3, title: 'Hiring analytics', desc: 'Track screenings over time, average fit ratio, and most common missing skills.' },
  { icon: Mail, title: 'Outreach drafts', desc: 'Generate personalised interview invites and rejection emails in one click.' },
  { icon: Lock, title: 'Private & yours', desc: 'Your CVs stay in your workspace. Auth, RLS, and per-user data isolation by default.' },
  { icon: FileStack, title: 'Bulk by design', desc: 'Drop 200 CVs at once. PDF, DOCX, PNG, JPG — we OCR and parse them all.' },
]

const steps = [
  { n: '01', title: 'Drop the JD & CVs', desc: 'Paste any job description, then drag in a folder of resumes — PDF, DOCX, PNG, JPG.' },
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
  { q: 'What file formats does HireBest support?', a: 'PDF, DOCX, PNG, and JPG with OCR for image-based CVs.' },
  { q: 'Does HireBest integrate with my ATS?', a: 'The Team plan ($199/mo) includes API access and the Enterprise plan adds custom ATS integration (Greenhouse, Lever, Workday).' },
  { q: 'Is HireBest GDPR compliant?', a: 'Yes — your CVs stay in your workspace with auth and row-level security by default.' },
]

const tiers = [
  { plan: 'basic',    name: 'Starter',    subtitle: 'Solo recruiters & consultants',     price: '$49',  per: '/ month', billing: '14-day free trial. Annual: $420/yr (save 29%)', cta: 'Start free trial',           features: ['3 active job slots', `${formatPlanLimit('basic')} CVs / month`, '1 user', 'AI scoring with JD-cited reasoning', 'Interview question generation', 'CSV export'], best: 'Freelance recruiters, solo HR people, consultants' },
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',         price: '$99',  per: '/ month', billing: '14-day free trial. Annual: $840/yr (save 29%)', cta: 'Start 14-day free trial',     features: ['10 active job slots', `${formatPlanLimit('advanced')} CVs / month`, '3 users', 'Everything in Starter', 'Bulk upload (100+ PDFs)', 'Custom branding', 'Side-by-side compare', 'Priority email support'], popular: true },
  { plan: 'lifetime', name: 'Team',       subtitle: 'HR departments & agencies',         price: '$199', per: '/ month', billing: '14-day free trial. Annual: $1,680/yr (save 30%)', cta: 'Start free trial',          features: ['Unlimited job slots', `${formatPlanLimit('lifetime')} CVs / month`, '10 users', 'Everything in Growth', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Priority Slack support'] },
  { plan: 'retainer', name: 'Enterprise', subtitle: '500+ companies & enterprise HR',    price: 'Custom', per: '',      billing: 'Volume-based custom quote',                       cta: 'Talk to sales',             features: [`${formatPlanLimit('retainer')} CVs / users`, 'Everything in Team', 'Custom ATS integration', 'SSO (Single Sign-On)', 'SLA guarantee', 'Dedicated CSM', 'On-premise option', 'Quarterly business reviews'] },
]

const articles = [
  { slug: 'screen-100-cvs-in-38-seconds', title: 'How to Screen 100 CVs in 38 Seconds', read: '6 min read' },
  { slug: 'greenhouse-pricing-2026', title: 'Greenhouse Pricing in 2026: What\'s Really Going On', read: '8 min read' },
  { slug: 'ai-ats-wrong-way-to-think', title: 'Why \'AI ATS\' is the Wrong Way to Think About Hiring', read: '5 min read' },
]

const marqueeWords = ['38 SECONDS','100 CVS','AI POWERED','HIRE SMARTER','NO CREDIT CARD','BULK SCREENING']

// ---------- shared variants ----------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const cardHover = {
  y: -6,
  scale: 1.015,
  transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
}

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
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  // pointer-following glow
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.2)
  const smx = useSpring(mx, { stiffness: 80, damping: 20 })
  const smy = useSpring(my, { stiffness: 80, damping: 20 })
  const bgX = useTransform(smx, v => `${v * 100}%`)
  const bgY = useTransform(smy, v => `${v * 100}%`)
  const heroBg = useMotionTemplate`radial-gradient(60% 50% at ${bgX} ${bgY}, var(--color-glow), transparent 70%)`

  useEffect(() => {
    if (reduce) return
    const el = sectionRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width)
      my.set((e.clientY - r.top) / r.height)
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [mx, my, reduce])

  const headlineWords = ['AI', 'Resume', 'Screener', 'for', 'Hiring', 'Teams']

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 -z-10" style={{ background: heroBg }} />
      <motion.div
        className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.span
          className="chip inline-block"
          variants={fadeUp}
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          HireBest — AI Resume Screener
        </motion.span>

        <motion.h1
          className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]"
          variants={staggerContainer}
        >
          <span className="block">
            {headlineWords.map((w, i) => (
              <motion.span
                key={i}
                className="inline-block mr-3"
                variants={{
                  hidden: { opacity: 0, y: 30, rotateX: -40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { type: 'spring', stiffness: 200, damping: 18 },
                  },
                }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <motion.span
            variants={fadeUp}
            className="gradient-text inline-block"
            style={{ backgroundSize: '200% 100%' }}
            animate={reduce ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            Score 100 CVs in 38 Seconds
          </motion.span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-2xl mx-auto text-[var(--color-muted)] text-base md:text-lg">
          HireBest reads every CV against your job description, scores fit, surfaces missing skills, and writes interview questions — in the time it takes to brew coffee.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/signup" className="btn-primary">Start Screening Free <ArrowRight size={16}/></Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/contact" className="btn-ghost">Contact Now</Link>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-5 justify-center text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>No credit card</span>
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>PDF, DOCX, PNG, JPG</span>
          <span className="flex items-center gap-1"><Check size={14} className="text-[var(--color-primary)]"/>Bulk batch screening</span>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.producthunt.com/products/hirebest-online?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hirebest-online"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Hirebest.online - Score 100 CVs in 38 Seconds | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1175830&theme=light&t=1781854290026"
            />
          </a>
          <a
            href="https://www.shipit.buzz/products/hirebest?ref=badge"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://www.shipit.buzz/api/products/hirebest/badge?theme=light"
              alt="Featured on Shipit"
              height={54}
            />
          </a>
        </motion.div>
      </motion.div>
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold">
            Everything a recruiter wishes ATS did.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[var(--color-muted)]">
            Built for the moment between "send me CVs" and "schedule the interview".
          </motion.p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureCard({ feature: f }: { feature: typeof features[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 18 })
  const sry = useSpring(ry, { stiffness: 200, damping: 18 })
  const reduce = useReducedMotion()

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 10)
    rx.set(-py * 10)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      whileHover={cardHover}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      className="card p-6 relative overflow-hidden group"
    >
      <motion.div
        className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'radial-gradient(400px circle at 50% 0%, rgba(92,155,255,0.18), transparent 60%)',
        }}
      />
      <motion.div
        className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.15)] flex items-center justify-center mb-4 card-icon"
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <f.icon size={20} className="text-[var(--color-primary-2)]"/>
      </motion.div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">{f.title}</h3>
      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.desc}</p>
    </motion.div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="text-center mb-12">
          <motion.span variants={fadeUp} className="chip inline-block">How it works</motion.span>
          <motion.h2 variants={fadeUp} className="mt-4 text-3xl md:text-4xl font-bold">
            From inbox chaos to shortlist in 3 steps.
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connecting line */}
          <motion.div
            className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent origin-left"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          />
          {steps.map((s) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              whileHover={cardHover}
              className="card p-7 relative bg-[var(--color-card)]"
            >
              <motion.div
                className="text-5xl font-extrabold gradient-text mb-3"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
              >
                {s.n}
              </motion.div>
              <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 200, damping: 16 },
              },
            }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="card p-6 text-center"
          >
            <div className="text-3xl md:text-4xl font-extrabold gradient-text">
              <CountUp value={s.n} />
            </div>
            <div className="text-xs text-[var(--color-muted)] mt-2 uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function SavingsCalculator() {
  const [roles, setRoles] = useState(20)
  const [cvs, setCvs] = useState(100)
  const [tool, setTool] = useState('Greenhouse')
  const competitorCost: Record<string, number> = { Greenhouse: 7000, Workable: 3588, Lever: 12000, None: 0 }
  const ourCost = 840
  const saved = Math.max(0, competitorCost[tool] - ourCost)
  const hours = Math.round((roles * cvs * 3.5) / 60)
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={fadeUp} className="text-center mb-6">
          <span className="chip">Pricing</span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-2">
          Simple pricing.<br/><span className="gradient-text">No per-seat tax.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-center text-[var(--color-muted)] mb-10">
          14-day free trial — no credit card required. Save ~29% with annual billing.
        </motion.p>
        <motion.div variants={fadeUp} className="card p-7 grid md:grid-cols-2 gap-8">
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
                <motion.button
                  key={t}
                  onClick={() => setTool(t)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors relative ${tool === t ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-fg)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary-2)]'}`}
                >
                  {tool === t && (
                    <motion.span
                      layoutId="tool-pill"
                      className="absolute inset-0 rounded-md bg-[var(--color-primary)] -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    />
                  )}
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="bg-[rgba(47,123,255,0.06)] border border-[rgba(47,123,255,0.25)] rounded-xl p-6">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Saved per year vs {tool}</div>
            <motion.div
              key={saved}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="text-5xl font-extrabold gradient-text mt-2"
            >
              ${saved.toLocaleString()}
            </motion.div>
            <div className="text-xs text-[var(--color-muted)] mt-2">${competitorCost[tool].toLocaleString()}/yr {tool} − $840/yr HireBest Growth (annual)</div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><div className="text-2xl font-bold text-[var(--color-fg)]">{hours}h</div><div className="text-xs text-[var(--color-muted)]">Hours saved</div></div>
              <div><div className="text-2xl font-bold text-[var(--color-fg)]">{(roles*cvs).toLocaleString()}</div><div className="text-xs text-[var(--color-muted)]">Total CVs/yr</div></div>
            </div>
            <p className="text-sm mt-5 text-[var(--color-muted)]">We recommend the <b className="text-[var(--color-fg)]">Growth</b> plan.</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/pricing" className="btn-primary mt-4 w-full justify-center">Start free trial</Link>
            </motion.div>
            <p className="text-[10px] text-[var(--color-muted)] mt-3 text-center">Estimates based on industry benchmarks. No data collected.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function PricingTiers() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {tiers.map((t) => (
          <motion.div
            key={t.name}
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
            className={`card p-6 relative ${t.popular ? 'border-[var(--color-primary)]' : ''}`}
          >
            {t.popular && (
              <motion.span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-fg)] uppercase tracking-wider"
                animate={{ boxShadow: [
                  '0 0 0 0 rgba(47,123,255,0.5)',
                  '0 0 0 10px rgba(47,123,255,0)',
                ] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              >
                Most popular
              </motion.span>
            )}
            <h3 className="text-lg font-bold">{t.name}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold gradient-text">{t.price}</span>
              <span className="text-sm text-[var(--color-muted)]">{t.per}</span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-2">{t.billing}</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to={t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}`} className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}>{t.cta}</Link>
            </motion.div>
            {t.best && <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mt-4">Best for</p>}
            {t.best && <p className="text-xs text-[var(--color-muted)] mt-1">{t.best}</p>}
            <ul className="mt-5 space-y-2">
              {t.features.map(f => (
                <li key={f} className="text-xs text-[var(--color-muted)] flex gap-2"><Check size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{f}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
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
  return (
    <section className="max-w-5xl mx-auto px-5 py-16">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="text-center text-2xl font-bold mb-8"
      >
        Questions?
      </motion.h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {items.map((it) => (
          <motion.div key={it.q} variants={fadeUp} whileHover={cardHover} className="card p-5">
            <div className="font-medium text-[var(--color-fg)]">{it.q}</div>
            <div className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{it.a}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        className="card p-10 md:p-14 text-center relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              'radial-gradient(60% 50% at 50% 0%, var(--color-glow), transparent 70%)',
              'radial-gradient(60% 50% at 30% 20%, var(--color-glow), transparent 70%)',
              'radial-gradient(60% 50% at 70% 0%, var(--color-glow), transparent 70%)',
              'radial-gradient(60% 50% at 50% 0%, var(--color-glow), transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Stop reading CVs.<br/>Start meeting people.</h2>
        <p className="mt-4 text-[var(--color-muted)] max-w-xl mx-auto">Spin up your first screening in under a minute. No setup, no integrations, no nonsense.</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/signup" className="btn-primary">Start Screening Free <ArrowRight size={16}/></Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/login" className="btn-ghost">I have an account</Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function BlogStrip() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="text-center text-2xl font-bold mb-8"
      >
        From the Blog
      </motion.h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {articles.map((a) => (
          <motion.div key={a.slug} variants={fadeUp} whileHover={{ y: -6, transition: { type: 'spring', stiffness: 320, damping: 22 } }} className="group">
            <Link to={`/blog/${a.slug}`} className="card p-6 block hover:border-[var(--color-primary)]">
              <div className="text-xs text-[var(--color-muted)]">{a.read}</div>
              <h4 className="mt-2 font-semibold text-[var(--color-fg)]">{a.title}</h4>
              <div className="mt-4 text-sm text-[var(--color-primary-2)] flex items-center gap-1">
                Read
                <motion.span
                  className="inline-flex"
                  initial={{ x: 0 }}
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  <ArrowRight size={14}/>
                </motion.span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
