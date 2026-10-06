import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Sparkles, Layers, BarChart3, Mail, Lock, FileStack, Check,
  Shield, Globe, Plus, Minus, FileText, Wand2, ListChecks,
} from 'lucide-react'
import { useRef, useState, memo, useEffect } from 'react'
import {
  motion, AnimatePresence, useScroll, useTransform, useMotionValue, useAnimationFrame,
  useReducedMotion, useSpring, useInView, type MotionValue,
} from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, organization, softwareApplication, faqPage, websiteSchema } from '../lib/schema'
import { formatPlanLimit } from '../lib/plans'
import SaaSBrowserReviews from '../components/SaaSBrowserReviews'
import {
  Reveal, SplitHeading, StaticLines, ScrollWords, Magnetic, CountUp, VelocityMarquee, Eyebrow, Spotlight, useLiteMotion, isPrerendering,
} from '../components/motion/primitives'

// ─────────────────────────────────────────────────────────────────────
// Content (unchanged from the previous site — design-only redesign)
// ─────────────────────────────────────────────────────────────────────
const stats = [
  { n: '38s',     label: 'to screen 100 CVs' },
  { n: '94%',     label: 'agreement with recruiters' },
  { n: '10,000+', label: 'resumes processed weekly' },
  { n: '1',       label: 'tab you need open' },
]

const faqs = [
  { q: 'How fast does HireBest score CVs?',        a: '100 CVs in 38 seconds on average.' },
  { q: "How accurate is HireBest's AI scoring?",   a: '94% agreement with senior recruiters in internal testing.' },
  { q: 'What file formats does HireBest support?', a: 'PDF, DOCX, PNG, and JPG with OCR for image-based CVs.' },
  { q: 'Does HireBest integrate with my ATS?',     a: 'The Team plan ($199/mo) includes API access and the Enterprise plan adds custom ATS integration (Greenhouse, Lever, Workday).' },
  { q: 'Is HireBest GDPR compliant?',              a: 'Yes — your CVs stay in your workspace with auth and row-level security by default.' },
]

const pricingFaqs = [
  { q: 'Is there a free trial?',         a: 'Yes — 14 days free on every paid plan (Starter, Growth and Team). No credit card required to start. There is also a free plan with 50 CVs a month.' },
  { q: 'Can I switch monthly ↔ annual?', a: 'Yes. Upgrade to annual anytime and save ~29% compared to monthly billing.' },
  { q: 'What if I exceed my CV limit?',  a: 'We notify you before you hit the cap. Upgrade mid-cycle (prorated) — no surprise overage fees.' },
  { q: 'Can I cancel anytime?',          a: 'Yes — one-click cancel from your dashboard. Monthly plans end at cycle close; annual gets prorated refunds within 30 days.' },
]

const tiers = [
  { plan: 'basic',    name: 'Starter',    subtitle: 'Solo recruiters & consultants',  price: '$49',    per: '/mo', billing: '14-day free trial. Annual $420/yr — save 29%.',   cta: 'Start free trial',   features: ['3 active job slots', `${formatPlanLimit('basic')} CVs / month`, '1 user', 'AI scoring with cited reasoning', 'Interview question generation', 'CSV export'] },
  { plan: 'advanced', name: 'Growth',     subtitle: 'Small HR teams & startups',      price: '$99',    per: '/mo', billing: '14-day free trial. Annual $840/yr — save 29%.',   cta: 'Start 14-day trial', features: ['10 active job slots', `${formatPlanLimit('advanced')} CVs / month`, '3 users', 'Everything in Starter', 'Bulk upload, 200 CVs per batch', 'Custom branding', 'Side-by-side compare', 'Priority email support'], popular: true },
  { plan: 'lifetime', name: 'Team',       subtitle: 'HR departments & agencies',      price: '$199',   per: '/mo', billing: '14-day free trial. Annual $1,680/yr — save 30%.', cta: 'Start free trial',   features: ['Unlimited job slots', `${formatPlanLimit('lifetime')} CVs / month`, '10 users', 'Everything in Growth', 'Analytics dashboard', 'API access', 'Role-based permissions', 'Priority Slack support'] },
  { plan: 'retainer', name: 'Enterprise', subtitle: '500+ companies & enterprise HR', price: 'Custom', per: '',    billing: 'Volume-based custom quote',                       cta: 'Talk to sales',      features: [`${formatPlanLimit('retainer')} CVs / users`, 'Everything in Team', 'Custom ATS integration', 'SSO', 'SLA guarantee', 'Dedicated CSM', 'On-premise option', 'Quarterly reviews'] },
] as const

const articles = [
  { slug: 'software-engineer-interview-questions', title: '50 Software Engineer Interview Questions',  read: '12 min read', tag: 'Hiring guide' },
  { slug: 'marketing-manager-interview-questions', title: '40 Marketing Manager Interview Questions',  read: '10 min read', tag: 'Hiring guide' },
  { slug: 'workable-pricing-2026',                 title: 'Workable Pricing in 2026: What You Actually Pay', read: '8 min read', tag: 'Pricing' },
  { slug: 'screen-100-cvs-in-38-seconds',          title: 'How to Screen 100 CVs in 38 Seconds',     read: '6 min read', tag: 'Playbook' },
]

const trust = [
  { icon: Shield, label: 'GDPR compliant',            sub: 'EU data protection standards' },
  { icon: Lock,   label: 'Never used for training',   sub: 'Your CVs stay private' },
  { icon: Globe,  label: 'Row-level security',        sub: 'Every workspace isolated' },
]

const EASE = [0.22, 1, 0.36, 1] as const

function useMediaQuery(q: string) {
  // false on the first render so it matches the prerendered HTML; real value after mount.
  const [match, setMatch] = useState(false)
  useEffect(() => {
    if (isPrerendering()) return
    const m = window.matchMedia(q)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [q])
  return match
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
      <WordBand />
      <Manifesto />
      <Features />
      <HowItWorks />
      <Stats />
      <SaaSBrowserReviews />
      <SavingsCalculator />
      <PricingTiers />
      <FAQBlock />
      <BlogStrip />
      <FinalCTA />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 01 · HERO — giant editorial type + the scanner device.
// Scrolling away pushes the copy back and tilts the device.
// ─────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const deviceY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const deviceRotate = useTransform(scrollYProgress, [0, 1], [0, -6])
  const deviceScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  // Parallax only where copy and device sit side by side; stacked on mobile it would collide.
  const wide = useMediaQuery('(min-width: 1024px)')
  const parallax = wide && !reduce

  return (
    <section ref={ref} className="relative overflow-hidden -mt-[76px] pt-[76px]">
      <div className="aurora" aria-hidden><span/><span/><span/></div>
      <div className="hairlines" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 pt-14 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100svh-76px)]">
        <motion.div style={parallax ? { y: copyY, opacity: copyOpacity } : undefined} className="lg:col-span-7 relative z-10">
          {/* Above the fold: static on purpose (no entrance animation), so the
              prerendered hero is the final hero and paints immediately. */}
          <div
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-border-strong)] bg-[color-mix(in_srgb,var(--color-card)_70%,transparent)] backdrop-blur pl-1.5 pr-4 py-1.5 text-xs text-[var(--color-fg-dim)]"
          >
            <span className="rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] px-2 py-0.5 text-[10px] font-semibold tracking-wide">AI</span>
            <h1 className="font-normal">AI resume screener: score 100 CVs in 38 seconds</h1>
          </div>

          <StaticLines
            as="p"
            text={'Read 100 CVs\n*before* your\ncoffee cools.'}
            className="display-hero mt-7 text-[var(--color-fg)]"
          />

          <div className="mt-8 max-w-[46ch] text-[var(--color-fg-dim)] text-base md:text-lg leading-relaxed">
            HireBest scores every CV against your job description in <b className="text-[var(--color-fg)] font-semibold">38 seconds</b>,
            flags the missing skills, and drafts the interview questions — with reasoning you can check.
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link to="/signup" className="btn-primary btn-lg">Start screening free <ArrowRight size={16}/></Link>
            </Magnetic>
            <a href="#how-it-works" className="btn-ghost btn-lg">See how it works</a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-muted)] font-mono uppercase tracking-[0.12em]">
            {['No credit card', 'PDF · DOCX · PNG · JPG', 'Up to 200 CVs per batch'].map(t => (
              <span key={t} className="inline-flex items-center gap-2"><Check size={12} className="text-[var(--color-primary-2)]"/>{t}</span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted-2)]">Featured on</span>
            <a href="https://www.producthunt.com/products/hirebest-online?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hirebest-online" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
              <img alt="Hirebest.online — Score 100 CVs in 38 Seconds | Product Hunt" width={180} height={39} src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1175830&theme=light&t=1781854290026"/>
            </a>
            <a href="https://www.shipit.buzz/products/hirebest?ref=badge" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
              <span className="inline-flex items-center h-[39px] px-3 rounded-lg border border-[var(--color-border-strong)] text-xs font-medium text-[var(--color-fg-dim)]">Featured on Shipit</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          style={parallax ? { y: deviceY, rotate: deviceRotate, scale: deviceScale } : undefined}
          className="lg:col-span-5 relative"
        >
          <ScannerDevice />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--color-muted-2)]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
      >
        Scroll
        <span className="w-px h-10 bg-gradient-to-b from-[var(--color-muted-2)] to-transparent relative overflow-hidden">
          <motion.span
            className="absolute left-0 top-0 w-px h-4 bg-[var(--color-primary-2)]"
            animate={reduce ? undefined : { y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  )
}

/**
 * The signature: a CV being read. One clock drives the beam, the matched
 * lines lighting up, the score counting and the chips popping in — so it all
 * stays in sync without re-rendering React every frame.
 */
const ScannerDevice = memo(function ScannerDevice() {
  const reduce = useReducedMotion()
  // Starts at 0 everywhere so the first render matches the prerendered HTML.
  const t = useMotionValue(0)
  useEffect(() => { if (reduce) t.set(1) }, [reduce, t])
  const H = 360 // scan travel in px
  const boxRef = useRef<HTMLDivElement>(null)
  // Pause the per-frame clock once the device scrolls out of view.
  const onScreen = useInView(boxRef)
  useAnimationFrame(time => {
    if (reduce || !onScreen || isPrerendering()) return
    t.set((time % 4200) / 4200)
  })
  const beamY = useTransform(t, [0, 0.9], [0, H])
  const beamOpacity = useTransform(t, [0, 0.05, 0.86, 0.94], [0, 1, 1, 0])
  const score = useTransform(t, [0.05, 0.85], [0, 94], { clamp: true })
  const scoreText = useTransform(score, v => Math.round(v).toString())
  const ring = useTransform(score, [0, 100], [0, 1])

  // [width%, isMatch]
  const lines: [number, boolean][] = [
    [92, false], [78, true], [85, false], [64, true], [88, false],
    [70, false], [80, true], [58, false], [90, true],
  ]

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-[440px] aspect-[5/6]" aria-label="HireBest reading a CV">
      {/* back sheets */}
      <div className="absolute inset-0 translate-x-6 translate-y-6 rotate-[5deg] rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-card)] opacity-50" />
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[2.5deg] rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-card)] opacity-75" />

      {/* front sheet */}
      <div className="ring-glow absolute inset-0 rounded-[1.6rem] border border-[var(--color-border-strong)] bg-[var(--color-card)] overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,.8)]">
        <div className="p-7">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-2)] flex items-center justify-center text-white font-semibold">PI</div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-[var(--color-fg)] font-[family-name:var(--font-heading)] tracking-tight">Priya Iyer</div>
              <div className="text-[11px] text-[var(--color-muted)] font-mono">Senior Backend Engineer · 7 yrs</div>
            </div>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" stroke="color-mix(in srgb, var(--color-fg) 10%, transparent)"/>
                <motion.circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" stroke="var(--color-fit)" strokeLinecap="round" style={{ pathLength: ring }}/>
              </svg>
              <motion.span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-fg)] tabular">{scoreText}</motion.span>
            </div>
          </div>

          <div className="mt-7 space-y-3.5 relative">
            {lines.map(([w, hit], i) => (
              <DocLine key={i} t={t} at={(i + 0.5) / lines.length * 0.9} width={w} hit={hit} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {['Python', 'AWS', 'gRPC', 'Postgres'].map((s, i) => (
              <Chip key={s} t={t} at={0.25 + i * 0.12}>{s}</Chip>
            ))}
          </div>

          <Reason t={t} />
        </div>

        {/* the beam */}
        <motion.div className="absolute left-0 right-0 top-[92px]" style={{ y: beamY, opacity: beamOpacity }}>
          <div className="scan-beam" />
        </motion.div>
      </div>

      {/* floating verdict + gap chips */}
      <FloatChip t={t} at={0.88} className="-left-6 md:-left-14 top-[30%]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-fit)]"/> Strong fit · 94
      </FloatChip>
      <FloatChip t={t} at={0.6} className="-right-3 md:-right-8 top-[46%]" tone="maybe">
        <Minus size={12}/> Missing: Kubernetes
      </FloatChip>
      <FloatChip t={t} at={0.75} className="left-6 -bottom-5">
        <Sparkles size={12} className="text-[var(--color-primary-2)]"/> 5 interview questions drafted
      </FloatChip>
    </div>
  )
})

function Reason({ t }: { t: MotionValue<number> }) {
  const o = useTransform(t, [0.8, 0.86], [0, 1])
  const y = useTransform(t, [0.8, 0.86], [8, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="mt-6 rounded-2xl border border-[color-mix(in_srgb,var(--color-fit)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-fit)_8%,transparent)] px-4 py-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fit)]">Why 94</div>
      <p className="mt-1 font-[family-name:var(--font-serif)] italic text-[15px] leading-snug text-[var(--color-fg)]">
        “7 years of Python on AWS — hits must-haves 1–3 in the JD.”
      </p>
    </motion.div>
  )
}

function DocLine({ t, at, width, hit }: { t: MotionValue<number>; at: number; width: number; hit: boolean }) {
  const lit = useTransform(t, [at - 0.01, at + 0.02], [0, 1])
  return (
    <div className="relative" style={{ width: `${width}%` }}>
      <div className="doc-line" />
      {hit && <motion.div className="doc-line hit absolute inset-0" style={{ opacity: lit }} />}
    </div>
  )
}

function Chip({ t, at, children }: { t: MotionValue<number>; at: number; children: React.ReactNode }) {
  const o = useTransform(t, [at, at + 0.05], [0.25, 1])
  const s = useTransform(t, [at, at + 0.05], [0.92, 1])
  return (
    <motion.span style={{ opacity: o, scale: s }} className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-chip-fg)]">
      {children}
    </motion.span>
  )
}

function FloatChip({ t, at, className, children, tone }: { t: MotionValue<number>; at: number; className: string; children: React.ReactNode; tone?: 'maybe' }) {
  const o = useTransform(t, [at, at + 0.04, 0.97, 1], [0, 1, 1, 0])
  const y = useTransform(t, [at, at + 0.06], [10, 0])
  return (
    <motion.div
      style={{ opacity: o, y }}
      className={`absolute z-10 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium backdrop-blur-xl border shadow-[0_20px_40px_-20px_rgba(0,0,0,.7)] ${
        tone === 'maybe'
          ? 'bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] border-[color-mix(in_srgb,var(--color-maybe)_40%,transparent)] text-[var(--color-maybe)]'
          : 'bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] border-[var(--color-border-strong)] text-[var(--color-fg)]'
      } ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 02 · WORD BAND — scroll-velocity marquee
// ─────────────────────────────────────────────────────────────────────
function WordBand() {
  const words: [string, 'solid' | 'outline' | 'blue'][] = [
    ['38 seconds', 'solid'], ['100 CVs', 'outline'], ['cited reasoning', 'blue'],
    ['no credit card', 'outline'], ['bulk screening', 'solid'], ['hire smarter', 'blue'],
  ]
  return (
    <section aria-label="HireBest at a glance" className="py-10 md:py-14 border-y border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-2)_60%,transparent)]">
      <VelocityMarquee baseSpeed={55}>
        {words.map(([w, style], i) => (
          <span key={i} className="flex items-center">
            <span className={`band-word ${style === 'outline' ? '' : style}`}>{w}</span>
            <span className="text-[var(--color-primary)] text-3xl md:text-5xl px-3" aria-hidden>✦</span>
          </span>
        ))}
      </VelocityMarquee>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 03 · MANIFESTO — words light up as you read
// ─────────────────────────────────────────────────────────────────────
function Manifesto() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 md:py-40">
      <Eyebrow n="01">Why HireBest</Eyebrow>
      <ScrollWords
        className="mt-10 font-[family-name:var(--font-heading)] text-[clamp(1.9rem,4.6vw,4rem)] leading-[1.08] tracking-[-0.04em] font-semibold text-[var(--color-fg)]"
        text="Most ATS tools rank who wrote the best resume. HireBest reads every line against *your* job description, shows its *reasoning,* and hands you the people who can actually do the job."
      />
      <div className="mt-16 grid sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)]">
        {trust.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-[var(--color-bg)] p-6 flex items-start gap-4">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[color-mix(in_srgb,var(--color-fit)_12%,transparent)] text-[var(--color-fit)]">
              <s.icon size={18}/>
            </span>
            <div>
              <div className="text-sm font-semibold text-[var(--color-fg)]">{s.label}</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">{s.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 04 · FEATURES — bento where every tile demos itself
// ─────────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 py-16 md:py-32 scroll-mt-24">
      <div className="grid lg:grid-cols-12 gap-8 items-end mb-14">
        <div className="lg:col-span-8">
          <Eyebrow n="02">Product</Eyebrow>
          <SplitHeading text={'AI resume screening\n*recruiters* actually use.'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>
        <Reveal className="lg:col-span-4 text-[var(--color-fg-dim)] leading-relaxed">
          Built for the moment between “send me CVs” and “schedule the interview.”
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(0,auto)]">
        <Tile className="md:col-span-4 md:row-span-2" delay={0}
          icon={Sparkles} title="AI scoring you can trust"
          desc="Each candidate gets a 0–100 match score with written reasoning that cites the JD — agree, override, or push back.">
          <ScoringDemo />
        </Tile>
        <Tile className="md:col-span-2" delay={0.06} icon={FileStack} title="Bulk by design" desc="Drop up to 200 CVs in one batch (500 on Enterprise). PDF, DOCX, PNG, JPG — scanned ones too.">
          <BulkDemo />
        </Tile>
        <Tile className="md:col-span-2" delay={0.12} icon={Lock} title="Private & yours" desc="Auth, row-level security and per-user isolation by default.">
          <LockDemo />
        </Tile>
        <Tile className="md:col-span-2" delay={0.06} icon={Layers} title="Side-by-side compare" desc="Pin your shortlist and compare strengths, gaps and experience.">
          <CompareDemo />
        </Tile>
        <Tile className="md:col-span-2" delay={0.12} icon={BarChart3} title="Hiring analytics" desc="Screenings over time, fit ratio, and the skills your pipeline lacks.">
          <BarsDemo />
        </Tile>
        <Tile className="md:col-span-2" delay={0.18} icon={Mail} title="Outreach drafts" desc="Personalised invites and rejections, one click each.">
          <TypeDemo />
        </Tile>
      </div>
    </section>
  )
}

function Tile({ className = '', delay = 0, icon: Icon, title, desc, children }: {
  className?: string; delay?: number; icon: typeof Sparkles; title: string; desc: string; children?: React.ReactNode
}) {
  return (
    <Reveal delay={delay} className={className}>
      <Spotlight className="tile h-full flex flex-col">
        <div className="relative flex-1 min-h-[150px] flex items-center justify-center p-6 pb-0">{children}</div>
        <div className="p-6 md:p-7">
          <div className="flex items-center gap-2.5 text-[var(--color-primary-2)]">
            <Icon size={16}/>
            <h3 className="text-lg font-semibold text-[var(--color-fg)] tracking-[-0.03em]">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-[var(--color-fg-dim)] leading-relaxed max-w-[52ch]">{desc}</p>
        </div>
      </Spotlight>
    </Reveal>
  )
}

/* — tile demos — each loops quietly, pauses under reduced motion — */

function useLoop(ms: number) {
  const reduce = useReducedMotion()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (reduce || isPrerendering()) return // prerendered HTML keeps the first frame
    const id = setInterval(() => setTick(t => t + 1), ms)
    return () => clearInterval(id)
  }, [ms, reduce])
  return tick
}

function ScoringDemo() {
  const rows = [
    { n: 'Priya Iyer',      s: 94, v: 'fit',   why: '“7 yrs Python + AWS — matches must-haves 1–3”' },
    { n: 'Marcus Adekunle', s: 87, v: 'fit',   why: '“Led gRPC migration; JD asks for service design”' },
    { n: 'Elena Voss',      s: 72, v: 'maybe', why: '“Strong Node, no Postgres at scale”' },
    { n: 'Tomás Câmara',    s: 42, v: 'skip',  why: '“Java/Oracle stack; 0 of 4 core skills”' },
  ] as const
  const tick = useLoop(2600)
  const active = tick % rows.length
  return (
    <div className="w-full max-w-xl space-y-2">
      {rows.map((r, i) => (
        <motion.div
          key={r.n}
          animate={{ opacity: i === active ? 1 : 0.55, scale: i === active ? 1 : 0.985 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`rounded-xl border px-4 py-3 ${i === active ? 'border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]' : 'border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_2%,transparent)]'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium flex-1 truncate">{r.n}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold verdict-${r.v}`}>{r.v}</span>
            <span className="w-9 text-right font-mono text-sm tabular">{r.s}</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: r.v === 'fit' ? 'var(--color-fit)' : r.v === 'maybe' ? 'var(--color-maybe)' : 'var(--color-skip)' }}
              initial={{ width: 0 }} whileInView={{ width: `${r.s}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE, delay: i * 0.1 }}
            />
          </div>
          <AnimatePresence initial={false}>
            {i === active && (
              <motion.p
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="text-xs text-[var(--color-fg-dim)] font-[family-name:var(--font-serif)] italic text-[15px] overflow-hidden pt-2"
              >{r.why}</motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

function BulkDemo() {
  const tick = useLoop(1400)
  const count = 40 + ((tick * 37) % 161)
  return (
    <div className="relative w-full h-28 flex items-center justify-center">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={`${tick}-${i}`}
          initial={{ y: -40, opacity: 0, rotate: (i - 2) * 8 }}
          animate={{ y: 0, opacity: [0, 1, 0], rotate: (i - 2) * 6 }}
          transition={{ duration: 1.3, delay: i * 0.08, ease: EASE }}
          className="absolute w-10 h-12 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] flex items-center justify-center"
          style={{ left: `calc(50% + ${(i - 2) * 26}px - 20px)` }}
        >
          <FileText size={14} className="text-[var(--color-primary-2)]"/>
        </motion.div>
      ))}
      <div className="absolute bottom-0 right-0 font-mono text-xs text-[var(--color-muted)]">
        <span className="text-[var(--color-fg)] tabular">{count}</span> / 200 queued
      </div>
    </div>
  )
}

function LockDemo() {
  const reduce = useReducedMotion()
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-[color-mix(in_srgb,var(--color-fit)_45%,transparent)]"
          animate={reduce ? undefined : { scale: [0.5, 1.35], opacity: [0.9, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.85, ease: 'easeOut' }}
        />
      ))}
      <span className="relative w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-fit)_14%,transparent)] text-[var(--color-fit)] flex items-center justify-center">
        <Lock size={22}/>
      </span>
    </div>
  )
}

function CompareDemo() {
  const tick = useLoop(2200)
  const a = [82, 64, 90][tick % 3]
  const b = [70, 88, 58][tick % 3]
  return (
    <div className="w-full grid grid-cols-2 gap-3">
      {[['Priya', a], ['Marcus', b]].map(([n, v]) => (
        <div key={n as string} className="rounded-xl border border-[var(--color-border)] p-3">
          <div className="text-xs font-medium">{n}</div>
          {['Skills', 'Seniority', 'Domain'].map((k, j) => (
            <div key={k} className="mt-2">
              <div className="text-[9px] uppercase tracking-widest text-[var(--color-muted)]">{k}</div>
              <div className="mt-1 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] overflow-hidden">
                <motion.div className="h-full rounded-full bg-[var(--color-primary)]" animate={{ width: `${Math.max(20, (v as number) - j * 12)}%` }} transition={{ duration: 0.9, ease: EASE }}/>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function BarsDemo() {
  const tick = useLoop(2000)
  const base = [34, 52, 41, 68, 57, 80, 72]
  return (
    <div className="w-full h-28 flex items-end gap-2 border-b border-[var(--color-border)]">
      {base.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-md bg-[var(--color-primary)]"
          style={{ opacity: 0.45 + i * 0.08 }}
          animate={{ height: `${Math.min(100, h + ((tick + i) % 3) * 8)}%` }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      ))}
    </div>
  )
}

function TypeDemo() {
  const full = 'Hi Priya — loved your gRPC migration work. Free Thursday for a 30-min chat?'
  const tick = useLoop(55)
  const reduce = useReducedMotion()
  const n = reduce ? full.length : tick % (full.length + 40)
  return (
    <div className="w-full rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fg)_2%,transparent)] p-3.5 text-[13px] leading-relaxed min-h-[96px]">
      <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5">Draft · Interview invite</div>
      <span className="text-[var(--color-fg-dim)]">{full.slice(0, Math.min(n, full.length))}</span>
      <span className="inline-block w-[2px] h-4 align-middle bg-[var(--color-primary-2)] ml-0.5 animate-pulse" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 05 · HOW IT WORKS — sticky stacked cards; each new step slides over
// the last while the previous one sinks back.
// ─────────────────────────────────────────────────────────────────────
const steps = [
  { n: '01', title: 'Drop the JD & CVs',      desc: 'Paste any job description, then drag in a folder of resumes — PDF, DOCX, PNG, JPG.', icon: Wand2 },
  { n: '02', title: 'Let AI read every line', desc: 'HireBest extracts skills and experience and matches them to your role — with reasoning.', icon: Sparkles },
  { n: '03', title: 'Hire with confidence',   desc: 'Filter to Fit candidates, compare your shortlist, and send the first interview invite.', icon: ListChecks },
]

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const lite = useLiteMotion()
  if (lite) {
    // Sticky 82vh cards leave screens of empty space on a phone; stack them instead.
    return (
      <section id="how-it-works" className="relative scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 pt-16">
          <Eyebrow n="03">How it works</Eyebrow>
          <SplitHeading text={'How AI CV screening works:\n*three* steps.'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6 space-y-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} className="stack-card relative overflow-hidden p-6">
              <span className="numeral text-[4.5rem]">{s.n}</span>
              <h3 className="mt-2 display-md text-[var(--color-fg)]">{s.title}</h3>
              <p className="mt-3 text-[var(--color-fg-dim)] leading-relaxed">{s.desc}</p>
              <div className="mt-6 flex justify-center"><StepVisual i={i} /></div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section id="how-it-works" className="relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-5 pt-16 md:pt-32">
        <Eyebrow n="03">How it works</Eyebrow>
        <SplitHeading text={'How AI CV screening works:\n*three* steps.'} className="display-lg mt-6 text-[var(--color-fg)]" />
      </div>
      <div ref={ref} className="relative max-w-7xl mx-auto px-5 pb-10" style={{ height: `${(steps.length - 1) * 85 + 90}vh` }}>
        {steps.map((s, i) => (
          <StackCard key={s.n} step={s} i={i} total={steps.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}

function StackCard({ step, i, total, progress }: { step: typeof steps[number]; i: number; total: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const start = i / total
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i - 1) * 0.06])
  // Sink back only once the next card is sliding over this one.
  const d0 = Math.min(0.98, start + (1 / total) * 0.9)
  const d1 = Math.min(1, start + (1 / total) * 1.35)
  const dim = useTransform(progress, [d0, d1], [0, i === total - 1 ? 0 : 0.6])
  return (
    <div className="sticky" style={{ top: `calc(104px + ${i * 44}px)`, height: '82vh' }}>
      <motion.div style={reduce ? undefined : { scale }} className="stack-card relative h-[min(560px,72vh)] overflow-hidden p-7 md:p-12 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-6 flex flex-col">
          <span className="numeral text-[7rem] md:text-[11rem]">{step.n}</span>
          <h3 className="mt-auto display-md text-[var(--color-fg)]">{step.title}</h3>
          <p className="mt-4 text-[var(--color-fg-dim)] leading-relaxed max-w-[44ch]">{step.desc}</p>
        </div>
        <div className="md:col-span-6 hidden md:flex items-center justify-center">
          <StepVisual i={i} />
        </div>
        <motion.div aria-hidden className="absolute inset-0 bg-[var(--color-bg)] pointer-events-none" style={reduce ? { opacity: 0 } : { opacity: dim }} />
      </motion.div>
    </div>
  )
}

function StepVisual({ i }: { i: number }) {
  if (i === 0) {
    return (
      <div className="w-full max-w-sm space-y-3">
        <div className="rounded-2xl border border-[var(--color-border-strong)] p-4 bg-[var(--color-bg-2)]">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Job description</div>
          <div className="mt-3 space-y-2">{[90, 76, 84, 60].map((w, k) => <div key={k} className="doc-line" style={{ width: `${w}%` }}/>)}</div>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] p-6 text-center bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]">
          <FileStack className="mx-auto text-[var(--color-primary-2)]" size={22}/>
          <div className="mt-2 text-sm font-medium">128 CVs dropped</div>
          <div className="text-[11px] text-[var(--color-muted)] font-mono">pdf · docx · png · jpg</div>
        </div>
      </div>
    )
  }
  if (i === 1) {
    return (
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] p-5 overflow-hidden" style={{ ['--scan-h' as any]: '220px' }}>
        <div className="space-y-2.5">{[88, 70, 92, 64, 80, 58, 86, 72].map((w, k) => <div key={k} className={`doc-line ${k % 3 === 1 ? 'hit' : ''}`} style={{ width: `${w}%` }}/>)}</div>
        <div className="absolute left-0 right-0 top-4 scan-loop"><div className="scan-beam"/></div>
        <div className="mt-5 flex gap-1.5">{['Python', 'AWS', 'Leadership'].map(s => <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-chip-fg)]">{s}</span>)}</div>
      </div>
    )
  }
  return (
    <div className="w-full max-w-sm space-y-2">
      {[['Priya Iyer', 94, 'fit'], ['Marcus Adekunle', 87, 'fit'], ['Elena Voss', 72, 'maybe']].map(([n, s, v]) => (
        <div key={n as string} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] px-4 py-3">
          <Check size={14} className="text-[var(--color-fit)]"/>
          <span className="text-sm flex-1">{n}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold verdict-${v}`}>{v}</span>
          <span className="font-mono text-sm tabular w-7 text-right">{s}</span>
        </div>
      ))}
      <div className="pt-2"><span className="btn-primary text-xs">Send interview invites <ArrowRight size={12}/></span></div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 06 · STATS — oversized numerals
// ─────────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-14 md:py-28">
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[var(--color-border)]">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className={`pt-8 pb-4 pr-6 ${i > 0 ? 'lg:border-l lg:pl-8' : ''} ${i % 2 === 1 ? 'border-l pl-6 lg:pl-8' : ''} border-[var(--color-border)]`}>
            <div className="font-[family-name:var(--font-heading)] font-bold tracking-[-0.06em] leading-none text-[clamp(2.1rem,9vw,5rem)] text-[var(--color-fg)] tabular">
              <CountUp value={s.n} />
            </div>
            <div className="mt-4 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 07 · ROI calculator
// ─────────────────────────────────────────────────────────────────────
function SavingsCalculator() {
  const [roles, setRoles] = useState(20)
  const [cvs, setCvs] = useState(100)
  const [tool, setTool] = useState('Greenhouse')
  const competitorCost: Record<string, number> = { Greenhouse: 7000, Workable: 3588, Lever: 12000, None: 0 }
  const saved = Math.max(0, competitorCost[tool] - 840)
  const hours = Math.round((roles * cvs * 3.5) / 60)
  const savedSpring = useSpring(saved, { stiffness: 120, damping: 20 })
  useEffect(() => { savedSpring.set(saved) }, [saved, savedSpring])
  const savedText = useTransform(savedSpring, v => `$${Math.round(v).toLocaleString()}`)

  return (
    <section className="max-w-7xl mx-auto px-5 py-16 md:py-32">
      <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
        <div className="lg:col-span-7">
          <Eyebrow n="04">ROI</Eyebrow>
          <SplitHeading text={'Plans from $49/month.\n*No* per-seat tax.'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>
        <Reveal className="lg:col-span-5 text-[var(--color-fg-dim)] leading-relaxed">
          14-day free trial — no credit card required. Save ~29% with annual billing. Move the sliders to see what you'd get back.
        </Reveal>
      </div>

      <Reveal>
        <div className="tile grid lg:grid-cols-2">
          <div className="p-8 md:p-10">
            <h3 className="text-xl font-semibold tracking-[-0.03em]">How much do you save vs {tool}?</h3>
            <Slider label="Roles per year" value={roles} min={5} max={200} onChange={setRoles} />
            <Slider label="CVs per role" value={cvs} min={20} max={500} onChange={setCvs} />
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mt-8 mb-3">Currently using</div>
            <div className="flex flex-wrap gap-1.5">
              {['Greenhouse', 'Workable', 'Lever', 'None'].map(t => (
                <button
                  key={t}
                  onClick={() => setTool(t)}
                  className={`relative px-4 py-2 rounded-full text-xs font-medium border transition ${tool === t ? 'border-transparent text-[var(--color-primary-ink)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
                >
                  {tool === t && <motion.span layoutId="tool-pill" className="absolute inset-0 rounded-full bg-[var(--color-primary)]" transition={{ type: 'spring', stiffness: 320, damping: 28 }}/>}
                  <span className="relative">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] overflow-hidden flex flex-col">
            <div className="aurora opacity-50" aria-hidden><span/><span/><span/></div>
            <div className="relative">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">Saved per year vs {tool}</div>
              <motion.div className="price-digits text-[clamp(3.5rem,8vw,6.5rem)] text-[var(--color-primary-2)] mt-3 tabular">{savedText}</motion.div>
              <div className="text-[11px] text-[var(--color-muted)] mt-2 font-mono">${competitorCost[tool].toLocaleString()}/yr {tool} − $840/yr HireBest Growth</div>
              <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-[var(--color-border)]">
                <div>
                  <div className="price-digits text-4xl text-[var(--color-fg)] tabular">{hours.toLocaleString()}h</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mt-2">Hours saved</div>
                </div>
                <div>
                  <div className="price-digits text-4xl text-[var(--color-fg)] tabular">{(roles * cvs).toLocaleString()}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mt-2">CVs / year</div>
                </div>
              </div>
              <p className="text-sm mt-8 text-[var(--color-fg-dim)]">We recommend the <b className="text-[var(--color-fg)]">Growth</b> plan.</p>
              <Link to="/pricing" className="btn-primary mt-4 w-full justify-center">Start free trial <ArrowRight size={14}/></Link>
              <p className="text-[10px] text-[var(--color-muted-2)] mt-3 text-center">Estimates based on industry benchmarks. No data collected.</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="block mt-8">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">{label}</span>
        <span className="price-digits text-2xl tabular">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full accent-[var(--color-primary)] h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(90deg, var(--color-primary) ${pct}%, color-mix(in srgb, var(--color-fg) 10%, transparent) ${pct}%)` }}
      />
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 08 · PRICING
// ─────────────────────────────────────────────────────────────────────
function PricingTiers() {
  return (
    <section className="max-w-7xl mx-auto px-5 pb-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((t, i) => {
          const popular = 'popular' in t && t.popular
          return (
            <Reveal key={t.name} delay={i * 0.07}>
              <Spotlight className={`tile h-full p-7 flex flex-col ${popular ? 'ring-glow border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">{t.name}</h3>
                  {popular && <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] uppercase tracking-widest font-semibold">Popular</span>}
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">{t.subtitle}</p>
                <div className="mt-8 flex items-baseline gap-1.5">
                  <span className="price-digits text-5xl text-[var(--color-fg)] tabular">{t.price}</span>
                  <span className="text-sm text-[var(--color-muted)]">{t.per}</span>
                </div>
                <p className="text-[11px] text-[var(--color-muted)] mt-2">{t.billing}</p>
                <Link to={t.plan === 'retainer' ? '/contact' : `/checkout?plan=${t.plan}`} className={`mt-6 w-full justify-center ${popular ? 'btn-primary' : 'btn-ghost'}`}>
                  {t.cta}
                </Link>
                <ul className="mt-7 pt-6 border-t border-[var(--color-border)] space-y-2.5 flex-1">
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
      <p className="text-center text-[11px] text-[var(--color-muted)] mt-6">Prices in USD. Starting points — final quote depends on scope.</p>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 09 · FAQ — sticky title, one accordion for product + billing questions
// ─────────────────────────────────────────────────────────────────────
function FAQBlock() {
  const all = [...faqs, ...pricingFaqs]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="max-w-7xl mx-auto px-5 py-16 md:py-32 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <Eyebrow n="05">FAQ</Eyebrow>
          <SplitHeading text={'AI resume screening,\n*answered.*'} className="display-lg mt-6 text-[var(--color-fg)]" />
          <p className="mt-6 text-[var(--color-fg-dim)] max-w-sm">Something else? <Link to="/contact" className="text-[var(--color-primary-2)] u-link">Talk to us</Link> — we usually reply within a few hours.</p>
        </div>
      </div>
      <div className="lg:col-span-7 border-t border-[var(--color-border)]">
        {all.map((it, i) => {
          const isOpen = open === i
          return (
            <div key={it.q} className="border-b border-[var(--color-border)]">
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-6 py-6 text-left group" aria-expanded={isOpen}>
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
  )
}

// ─────────────────────────────────────────────────────────────────────
// 10 · BLOG — editorial index rows
// ─────────────────────────────────────────────────────────────────────
function BlogStrip() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-16">
      <div className="flex items-end justify-between mb-10 gap-6">
        <div>
          <Eyebrow n="06">Journal</Eyebrow>
          <h2 className="display-md mt-5">From the blog</h2>
        </div>
        <Link to="/blog" className="btn-ghost">All posts <ArrowRight size={14}/></Link>
      </div>
      <div className="border-t border-[var(--color-border)]">
        {articles.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.06}>
            <Link to={`/blog/${a.slug}`} className="group grid grid-cols-12 items-center gap-4 py-7 border-b border-[var(--color-border)] relative overflow-hidden">
              <span aria-hidden className="absolute inset-0 -z-0 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]" />
              <span className="relative col-span-2 md:col-span-1 font-mono text-xs text-[var(--color-muted-2)] pl-2">0{i + 1}</span>
              <span className="relative col-span-10 md:col-span-7 font-[family-name:var(--font-heading)] text-xl md:text-3xl font-semibold tracking-[-0.035em] text-[var(--color-fg)] group-hover:translate-x-2 transition-transform duration-500">{a.title}</span>
              <span className="relative hidden md:block col-span-2 text-xs font-mono uppercase tracking-[0.14em] text-[var(--color-muted)]">{a.tag}</span>
              <span className="relative hidden md:flex col-span-2 justify-end items-center gap-3 pr-2 text-xs text-[var(--color-muted)]">
                {a.read}
                <span className="w-10 h-10 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:border-transparent group-hover:text-white transition">
                  <ArrowUpRight size={16}/>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 11 · FINAL CTA
// ─────────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const beam = useTransform(scrollYProgress, [0.15, 0.75], ['0%', '100%'])
  return (
    <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
      <div ref={ref} className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-card)] px-6 py-20 md:py-32 text-center">
        <div className="aurora" aria-hidden><span/><span/><span/></div>
        <div className="hairlines" aria-hidden />
        {!reduce && (
          <motion.div aria-hidden className="absolute left-0 right-0" style={{ top: beam }}>
            <div className="scan-beam" />
          </motion.div>
        )}
        <div className="relative">
          <SplitHeading as="h2" text={'Stop reading CVs.\n*Start meeting people.*'} className="display-xl text-[var(--color-fg)] max-w-5xl mx-auto" />
          <Reveal delay={0.3} className="mt-7 text-[var(--color-fg-dim)] max-w-xl mx-auto text-lg">
            Spin up your first screening in under a minute. No setup, no integrations, no nonsense.
          </Reveal>
          <Reveal delay={0.45} className="mt-10 flex flex-wrap gap-3 justify-center">
            <Magnetic><Link to="/signup" className="btn-primary btn-lg">Start screening free <ArrowRight size={16}/></Link></Magnetic>
            <Link to="/login" className="btn-ghost btn-lg">I have an account</Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
