import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, BarChart3, Mail, Lock, FileStack, Check, Zap, Clock, Users } from 'lucide-react'
import FAQ from '../components/FAQ'
import SaaSBrowserReviews from '../components/SaaSBrowserReviews'
import { useState, useEffect, useRef, memo } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, organization, softwareApplication, faqPage, websiteSchema } from '../lib/schema'
import { useInView } from '../lib/useInView'
import TrustBar from '../components/TrustBar'
import { formatPlanLimit } from '../lib/plans'

// ─────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: Sparkles,  title: 'AI scoring you can trust', desc: 'Each candidate gets a 0–100 match score with written reasoning citing the JD.' },
  { icon: Layers,    title: 'Side-by-side compare',     desc: 'Pin shortlisted candidates and compare strengths, gaps, and experience instantly.' },
  { icon: BarChart3, title: 'Hiring analytics',         desc: 'Track screenings over time, average fit ratio, and most common missing skills.' },
  { icon: Mail,      title: 'Outreach drafts',          desc: 'Generate personalised interview invites and rejection emails in one click.' },
  { icon: Lock,      title: 'Private & yours',          desc: 'Your CVs stay in your workspace. Auth, RLS, and per-user data isolation by default.' },
  { icon: FileStack, title: 'Bulk by design',           desc: 'Drop 200 CVs at once. PDF, DOCX, PNG, JPG — we OCR and parse them all.' },
]

const steps = [
  { n: '01', title: 'Drop the JD & CVs',      desc: 'Paste any job description, then drag in a folder of resumes — PDF, DOCX, PNG, JPG.' },
  { n: '02', title: 'Let AI read every line', desc: 'HireBest extracts skills, experience, and matches them to your role with reasoning.' },
  { n: '03', title: 'Hire with confidence',   desc: 'Filter to Fit candidates, compare your shortlist, and send the first interview invite.' },
]

const stats = [
  { n: '38s',      label: 'to screen 100 CVs' },
  { n: '94%',      label: 'agreement with recruiters' },
  { n: '10,000+',  label: 'resumes processed weekly' },
  { n: '1',        label: 'tab you need open' },
]

const faqs = [
  { q: 'How fast does HireBest score CVs?',        a: '100 CVs in 38 seconds on average.' },
  { q: "How accurate is HireBest's AI scoring?",   a: '94% agreement with senior recruiters in internal testing.' },
  { q: 'What file formats does HireBest support?', a: 'PDF, DOCX, PNG, and JPG with OCR for image-based CVs.' },
  { q: 'Does HireBest integrate with my ATS?',     a: 'The Team plan ($199/mo) includes API access and the Enterprise plan adds custom ATS integration (Greenhouse, Lever, Workday).' },
  { q: 'Is HireBest GDPR compliant?',              a: 'Yes — your CVs stay in your workspace with auth and row-level security by default.' },
]

const tiers = [
  { plan: 'basic',    name: 'Starter',    subtitle: 'Solo recruiters & consultants',   price: '$49',    per: '/ month', billing: '14-day free trial. Annual $420/yr — save 29%.',   cta: 'Start free trial',       features: ['3 active job slots', `${formatPlanLimit('basic')} CVs / month`, '1 user', 'AI scoring with cited reasoning', 'Interview question generation', 'CSV export'], best: 'Freelance recruiters, solo HR, consultants' },
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',       price: '$99',    per: '/ month', billing: '14-day free trial. Annual $840/yr — save 29%.',   cta: 'Start 14-day trial',      features: ['10 active job slots', `${formatPlanLimit('advanced')} CVs / month`, '3 users', 'Everything in Starter', 'Bulk upload (100+ PDFs)', 'Custom branding', 'Side-by-side compare', 'Priority email support'], popular: true },
  { plan: 'lifetime', name: 'Team',       subtitle: 'HR departments & agencies',       price: '$199',   per: '/ month', billing: '14-day free trial. Annual $1,680/yr — save 30%.', cta: 'Start free trial',       features: ['Unlimited job slots', `${formatPlanLimit('lifetime')} CVs / month`, '10 users', 'Everything in Growth', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Priority Slack support'] },
  { plan: 'retainer', name: 'Enterprise', subtitle: '500+ companies & enterprise HR',  price: 'Custom', per: '',        billing: 'Volume-based custom quote',                       cta: 'Talk to sales',           features: [`${formatPlanLimit('retainer')} CVs / users`, 'Everything in Team', 'Custom ATS integration', 'SSO', 'SLA guarantee', 'Dedicated CSM', 'On-premise option', 'Quarterly reviews'] },
]

const articles = [
  { slug: 'screen-100-cvs-in-38-seconds', title: 'How to Screen 100 CVs in 38 Seconds',                   read: '6 min read' },
  { slug: 'greenhouse-pricing-2026',      title: "Greenhouse Pricing in 2026: What's Really Going On",   read: '8 min read' },
  { slug: 'ai-ats-wrong-way-to-think',    title: "Why 'AI ATS' is the Wrong Way to Think About Hiring",   read: '5 min read' },
]

const marqueeWords = ['38 SECONDS','100 CVS','AI POWERED','HIRE SMARTER','NO CREDIT CARD','BULK SCREENING']

// ─────────────────────────────────────────────────────────────────────
// Motion primitives
// ─────────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 } },
}
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
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

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useSeo({
    title: 'HireBest — AI Resume Screener · Score 100 CVs in 38 Seconds',
    description: 'AI resume screener for hiring teams. Score 100 CVs in 38 seconds with JD-cited reasoning, missing-skill detection, and auto-generated interview questions.',
  })
  useSchema('home-org',     organization())
  useSchema('home-app',     softwareApplication())
  useSchema('home-faq',     faqPage(faqs))
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

// ─────────────────────────────────────────────────────────────────────
// HERO — split, editorial, restrained. Mock candidate card on the right.
// ─────────────────────────────────────────────────────────────────────
function Hero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden">
      {/* mesh + grid background */}
      <div aria-hidden className="absolute inset-0 -z-10 mesh-bg" />
      <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-40" />

      <div className="max-w-7xl mx-auto px-5 pt-20 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left — copy */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.span variants={fadeUp} className="chip chip-dot">
            AI resume screener · Live
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-[2.75rem] leading-[1.02] md:text-6xl lg:text-[4.5rem] font-semibold tracking-[-0.035em] text-[var(--color-fg)]"
          >
            Score 100 CVs
            <br />
            in <span className="text-[var(--color-primary-2)]">38 seconds</span>.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-[52ch] text-[var(--color-fg-dim)] text-base md:text-lg leading-relaxed">
            HireBest reads every CV against your job description, scores fit, surfaces missing skills, and drafts interview questions — while your coffee is still brewing.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-primary">
              Start screening free <ArrowRight size={14}/>
            </Link>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[var(--color-primary-2)]"/>No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[var(--color-primary-2)]"/>PDF · DOCX · PNG · JPG</span>
            <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[var(--color-primary-2)]"/>Bulk 200+ resumes</span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4 opacity-90">
            <a
              href="https://www.producthunt.com/products/hirebest-online?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hirebest-online"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="Hirebest.online — Score 100 CVs in 38 Seconds | Product Hunt"
                width={220}
                height={48}
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
                height={48}
              />
            </a>
          </motion.div>
        </motion.div>

        {/* Right — live-candidate mock card, memoized */}
        <div className="lg:col-span-5">
          <CandidateMock reduce={!!reduce} />
        </div>
      </div>
    </section>
  )
}

// Isolated + memoized so perpetual motion doesn't re-render the hero.
const CandidateMock = memo(function CandidateMock({ reduce }: { reduce: boolean }) {
  const items = [
    { name: 'Priya Iyer',      role: 'Senior Backend Engineer', score: 94, verdict: 'fit'   as const, tag: 'Python · AWS · gRPC' },
    { name: 'Marcus Adekunle', role: 'Senior Backend Engineer', score: 87, verdict: 'fit'   as const, tag: 'Go · K8s · Postgres' },
    { name: 'Elena Voss',      role: 'Senior Backend Engineer', score: 72, verdict: 'maybe' as const, tag: 'Node · Redis · GCP' },
    { name: 'Jordan Rivera',   role: 'Senior Backend Engineer', score: 61, verdict: 'maybe' as const, tag: 'Rails · MySQL' },
    { name: 'Tomás Câmara',    role: 'Senior Backend Engineer', score: 42, verdict: 'skip'  as const, tag: 'Java · Oracle' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.15 }}
      className="card p-5 relative overflow-hidden"
      aria-label="Sample HireBest shortlist"
    >
      {/* subtle top gradient */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/60 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] flex items-center justify-center text-[var(--color-primary-2)]">
            <Zap size={15}/>
          </div>
          <div>
            <div className="text-xs font-mono text-[var(--color-muted)]">shortlist-042</div>
            <div className="text-sm font-medium">Backend Engineer · 100 CVs</div>
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-fit)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-fit)] animate-pulse"/>
          Live
        </div>
      </div>

      <ul className="space-y-1.5">
        {items.map((c, i) => (
          <motion.li
            key={c.name}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 220, damping: 22 }}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 bg-[color-mix(in_srgb,var(--color-fg)_2.5%,transparent)] border border-[var(--color-border)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={c.name} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-[11px] text-[var(--color-muted)] font-mono truncate">{c.tag}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold verdict-${c.verdict}`}>
                {c.verdict}
              </span>
              <div className="w-12 text-right font-mono text-sm tabular text-[var(--color-fg)]">{c.score}</div>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* footer with countdown-ish progress */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--color-muted)] font-mono">
        <span className="inline-flex items-center gap-1.5"><Clock size={11}/>Processed in 38.2s</span>
        <span className="inline-flex items-center gap-1.5"><Users size={11}/>100 / 100</span>
      </div>

      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute -inset-24 -z-10 opacity-40"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, color-mix(in srgb, var(--color-primary) 22%, transparent) 25%, transparent 40%)',
            filter: 'blur(60px)',
          }}
        />
      )}
    </motion.div>
  )
})

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const hue = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % 360
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 55% 35%))` }}
    >
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Marquee
// ─────────────────────────────────────────────────────────────────────
function Marquee() {
  const words = [...marqueeWords, ...marqueeWords, ...marqueeWords]
  return (
    <div className="marquee">
      <div className="marquee-track">
        {words.map((w, i) => (
          <span key={i} className="text-[11px] tracking-[0.32em] font-semibold text-[var(--color-muted)]">
            {w} <span className="text-[var(--color-primary-2)]/60">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Features — asymmetric 2-column zig-zag bento
// ─────────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 py-24">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.div variants={fadeUp} className="max-w-3xl mb-14">
          <span className="chip">Features</span>
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">
            Everything a recruiter <span className="text-[var(--color-muted)]">wishes an ATS did.</span>
          </h2>
          <p className="mt-4 text-[var(--color-fg-dim)] max-w-[60ch]">
            Built for the moment between "send me CVs" and "schedule the interview."
          </p>
        </motion.div>

        {/* Bento — non-uniform grid */}
        <div className="grid md:grid-cols-6 gap-4">
          {features.map((f, i) => {
            const span = i === 0 ? 'md:col-span-3' : i === 1 ? 'md:col-span-3' : 'md:col-span-2'
            return <FeatureCard key={f.title} feature={f} className={span} />
          })}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureCard({ feature: f, className = '' }: { feature: typeof features[number]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const smx = useSpring(mx, { stiffness: 180, damping: 22 })
  const smy = useSpring(my, { stiffness: 180, damping: 22 })
  const reduce = useReducedMotion()

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      onPointerMove={onMove}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      className={`card card-lift p-7 relative overflow-hidden group ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(400px circle at var(--x) var(--y), color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 55%)',
          // @ts-ignore
          '--x': smx.get() * 100 + '%',
          '--y': smy.get() * 100 + '%',
        }}
      />
      <div className="icon-badge mb-5">
        <f.icon size={18}/>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] tracking-tight">{f.title}</h3>
      <p className="mt-2 text-sm text-[var(--color-fg-dim)] leading-relaxed max-w-[52ch]">{f.desc}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// How it works — vertical rail with numbered steps
// ─────────────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-5 py-24">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid lg:grid-cols-12 gap-12">
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <span className="chip">How it works</span>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
            From inbox chaos<br/>to shortlist in <span className="text-[var(--color-primary-2)]">3 steps.</span>
          </h2>
          <p className="mt-4 text-[var(--color-fg-dim)] text-sm leading-relaxed">
            No integrations. No setup calls. Sign in, paste a JD, drop in resumes.
          </p>
        </motion.div>

        <div className="lg:col-span-8 relative">
          {/* Rail line */}
          <div aria-hidden className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[var(--color-border-strong)] to-transparent md:left-6" />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="card p-6 flex gap-5 items-start relative"
              >
                <div className="shrink-0 w-12 h-12 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] flex items-center justify-center font-mono text-sm text-[var(--color-primary-2)] tabular relative">
                  {s.n}
                  {i === 0 && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-lg ring-1 ring-[var(--color-primary)]/40"
                      animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-fg)] tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-fg-dim)] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Stats — no cards; separator-based row (density-4 rule)
// ─────────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-16">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] rounded-lg overflow-hidden"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
            }}
            className="px-6 py-8 text-left"
          >
            <div className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[var(--color-fg)] font-mono tabular">
              <CountUp value={s.n} />
            </div>
            <div className="text-[11px] text-[var(--color-muted)] mt-2 uppercase tracking-[0.14em]">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Savings calculator — split card, mono numerals
// ─────────────────────────────────────────────────────────────────────
function SavingsCalculator() {
  const [roles, setRoles] = useState(20)
  const [cvs, setCvs] = useState(100)
  const [tool, setTool] = useState('Greenhouse')
  const competitorCost: Record<string, number> = { Greenhouse: 7000, Workable: 3588, Lever: 12000, None: 0 }
  const ourCost = 840
  const saved = Math.max(0, competitorCost[tool] - ourCost)
  const hours = Math.round((roles * cvs * 3.5) / 60)

  return (
    <section className="max-w-7xl mx-auto px-5 py-20">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="max-w-3xl mb-10">
        <motion.div variants={fadeUp}><span className="chip">ROI calculator</span></motion.div>
        <motion.h2 variants={fadeUp} className="mt-5 text-3xl md:text-5xl font-semibold tracking-[-0.03em]">
          Simple pricing.<br/><span className="text-[var(--color-muted)]">No per-seat tax.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-4 text-[var(--color-fg-dim)]">
          14-day free trial — no credit card required. Save ~29% with annual billing.
        </motion.p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="card p-8 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold tracking-tight mb-6">How much do you save vs {tool}?</h3>

          <label className="block mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Roles per year</span>
              <span className="font-mono tabular text-sm text-[var(--color-fg)]">{roles}</span>
            </div>
            <input type="range" min={5} max={200} value={roles} onChange={e => setRoles(+e.target.value)} className="w-full accent-[var(--color-primary)]" />
          </label>

          <label className="block mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">CVs per role</span>
              <span className="font-mono tabular text-sm text-[var(--color-fg)]">{cvs}</span>
            </div>
            <input type="range" min={20} max={500} value={cvs} onChange={e => setCvs(+e.target.value)} className="w-full accent-[var(--color-primary)]" />
          </label>

          <div className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">Currently using</div>
          <div className="flex flex-wrap gap-1.5">
            {['Greenhouse','Workable','Lever','None'].map(t => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                  tool === t
                    ? 'border-[var(--color-primary)] text-[var(--color-primary-ink)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                {tool === t && (
                  <motion.span
                    layoutId="tool-pill"
                    className="absolute inset-0 rounded-md bg-[var(--color-primary)] -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  />
                )}
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6 bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] border border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">Saved per year vs {tool}</div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={saved}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="text-5xl font-semibold text-[var(--color-primary-2)] mt-2 tracking-tight font-mono tabular"
            >
              ${saved.toLocaleString()}
            </motion.div>
          </AnimatePresence>
          <div className="text-[11px] text-[var(--color-muted)] mt-2 font-mono">
            ${competitorCost[tool].toLocaleString()}/yr {tool} − $840/yr HireBest Growth
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]">
            <div>
              <div className="text-2xl font-semibold text-[var(--color-fg)] font-mono tabular">{hours}h</div>
              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest mt-1">Hours saved</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-[var(--color-fg)] font-mono tabular">{(roles*cvs).toLocaleString()}</div>
              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest mt-1">CVs / year</div>
            </div>
          </div>

          <p className="text-sm mt-6 text-[var(--color-fg-dim)]">
            We recommend the <b className="text-[var(--color-fg)]">Growth</b> plan.
          </p>
          <Link to="/pricing" className="btn-primary mt-3 w-full justify-center">
            Start free trial <ArrowRight size={14}/>
          </Link>
          <p className="text-[10px] text-[var(--color-muted-2)] mt-3 text-center">Estimates based on industry benchmarks. No data collected.</p>
        </div>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Pricing tiers
// ─────────────────────────────────────────────────────────────────────
function PricingTiers() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {tiers.map((t) => (
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
              <span className="text-4xl font-semibold tracking-tight text-[var(--color-fg)] font-mono tabular">{t.price}</span>
              <span className="text-xs text-[var(--color-muted)]">{t.per}</span>
            </div>
            <p className="text-[11px] text-[var(--color-muted)] mt-1">{t.billing}</p>

            <Link
              to={t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}`}
              className={`mt-5 w-full justify-center ${t.popular ? 'btn-primary' : 'btn-ghost'}`}
            >
              {t.cta}
            </Link>

            {t.best && <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mt-5">Best for</p>}
            {t.best && <p className="text-xs text-[var(--color-fg-dim)] mt-1">{t.best}</p>}

            <ul className="mt-5 space-y-2 flex-1">
              {t.features.map(f => (
                <li key={f} className="text-xs text-[var(--color-fg-dim)] flex gap-2">
                  <Check size={13} className="text-[var(--color-primary-2)] mt-0.5 shrink-0"/>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
      <p className="text-center text-[11px] text-[var(--color-muted)] mt-6">Prices in USD. Starting points — final quote depends on scope.</p>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Pricing FAQ
// ─────────────────────────────────────────────────────────────────────
function PricingFAQ() {
  const items = [
    { q: 'Is there a free trial?',                    a: 'Yes — 14 days free on the Growth plan. No credit card required to start.' },
    { q: 'Can I switch monthly ↔ annual?',            a: 'Yes. Upgrade to annual anytime and save ~29% compared to monthly billing.' },
    { q: 'What if I exceed my CV limit?',             a: 'We notify you before you hit the cap. Upgrade mid-cycle (prorated) — no surprise overage fees.' },
    { q: 'Can I cancel anytime?',                     a: 'Yes — one-click cancel from your dashboard. Monthly plans end at cycle close; annual gets prorated refunds within 30 days.' },
  ]
  return (
    <section className="max-w-7xl mx-auto px-5 py-20">
      <motion.h3
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-8"
      >
        Questions?
      </motion.h3>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-2 gap-3"
      >
        {items.map(it => (
          <motion.div key={it.q} variants={fadeUp} className="card p-6">
            <div className="font-medium text-[var(--color-fg)]">{it.q}</div>
            <div className="text-sm text-[var(--color-fg-dim)] mt-2 leading-relaxed">{it.a}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        className="card p-12 md:p-16 relative overflow-hidden text-center"
      >
        <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-80" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />

        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] max-w-3xl mx-auto">
          Stop reading CVs.<br/>
          <span className="text-[var(--color-muted)]">Start meeting people.</span>
        </h2>
        <p className="mt-5 text-[var(--color-fg-dim)] max-w-xl mx-auto">
          Spin up your first screening in under a minute. No setup, no integrations, no nonsense.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Start screening free <ArrowRight size={14}/></Link>
          <Link to="/login" className="btn-ghost">I have an account</Link>
        </div>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Blog strip
// ─────────────────────────────────────────────────────────────────────
function BlogStrip() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-16">
      <div className="flex items-end justify-between mb-8">
        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="text-2xl md:text-3xl font-semibold tracking-[-0.02em]"
        >
          From the blog
        </motion.h3>
        <Link to="/blog" className="btn-link">All posts <ArrowRight size={14}/></Link>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {articles.map(a => (
          <motion.div key={a.slug} variants={fadeUp} whileHover={{ y: -3, transition: { type: 'spring', stiffness: 320, damping: 22 } }}>
            <Link to={`/blog/${a.slug}`} className="card card-lift p-6 block h-full">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-muted)]">{a.read}</div>
              <h4 className="mt-3 font-semibold text-[var(--color-fg)] leading-snug tracking-tight">{a.title}</h4>
              <div className="mt-6 text-sm text-[var(--color-primary-2)] inline-flex items-center gap-1">
                Read
                <ArrowRight size={13}/>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
