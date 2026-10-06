import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { ArrowRight, Mail, MessageCircle, Zap, Users, Shield } from 'lucide-react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, organization } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'
import { Reveal, SplitHeading, ScrollWords, Eyebrow, CountUp, Spotlight } from '../components/motion/primitives'

const founderSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Azmain Raihan',
  jobTitle: 'Founder & CEO',
  worksFor: {
    '@type': 'Organization',
    name: 'HireBest',
    url: 'https://hirebest.online',
  },
  description: 'Founder of HireBest — AI resume screener that scores 100 CVs in 38 seconds. Azmain builds tools that give small hiring teams the speed of a 10-person talent operations function.',
  email: 'contact@hirebest.online',
  url: 'https://hirebest.online/about',
}

const values = [
  { icon: Zap,    title: 'Speed is a feature',   desc: 'Recruiters should not spend 3.5 minutes per CV. We built HireBest so 100 CVs take 38 seconds — giving teams back hours every week.' },
  { icon: Users,  title: 'Honesty over hype',    desc: 'HireBest is an AI screener, not a magic oracle. Every score comes with cited reasoning so you can agree, override, or push back.' },
  { icon: Shield, title: 'Yours stays yours',    desc: 'CVs you upload stay in your workspace. Row-level security, no training on your data, no retention beyond your session.' },
]

const timeline = [
  { year: '2024',    event: 'Problem identified — a founder spending 4 hours screening 200 CVs for one backend role.' },
  { year: '2025 Q1', event: 'First working prototype: PDF parsing + GPT-4o scoring against a pasted JD.' },
  { year: '2025 Q3', event: 'Beta launch — 50 teams onboarded, median screening time 38 seconds confirmed.' },
  { year: '2026',    event: 'SaaS pricing relaunch — Starter, Growth, Team, Enterprise tiers; 10,000+ resumes processed weekly.' },
]

export default function About() {
  useSeo({
    title: 'About HireBest — Founder Story, Mission, and Team',
    description: 'HireBest was built by a founder who spent 4 hours screening 200 CVs for one role. Now 100 CVs take 38 seconds. Meet the founder behind the AI resume screener.',
    canonical: 'https://hirebest.online/about',
  })
  useSchema('about-org', organization())
  useSchema('about-founder', founderSchema)

  return (
    <>
      {/* ── Hero ───────────────────────────── */}
      <section className="relative overflow-hidden -mt-[76px] pt-[76px]">
        <div className="aurora" aria-hidden><span/><span/><span/></div>
        <div className="hairlines" aria-hidden />
        <Breadcrumbs trail={[{ name: 'About' }]} schemaId="about-bc" />
        <div className="relative max-w-7xl mx-auto px-5 pt-14 pb-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-9">
            <Eyebrow n="HB">Our story</Eyebrow>
            <SplitHeading
              as="h1"
              text={'Built by someone who\nspent *4 hours reading*\nthe wrong CVs.'}
              className="display-xl mt-7 text-[var(--color-fg)]"
            />
          </div>
          <Reveal delay={0.4} className="lg:col-span-3">
            <p className="text-[var(--color-fg-dim)] leading-relaxed border-l border-[var(--color-primary)] pl-5">
              A founder screening 200 applicants for a backend role — 3.5 minutes per CV, 700 minutes later — with a
              shortlist that could have taken under an hour. So we fixed it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-12 gap-10">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="relative w-full max-w-[18rem] aspect-square rounded-[2rem] overflow-hidden border border-[var(--color-border-strong)] bg-gradient-to-br from-[var(--color-primary)] to-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-bg))] flex items-end p-6">
              <span className="absolute -right-4 -top-10 font-[family-name:var(--font-heading)] font-bold text-[12rem] leading-none text-white/10 select-none" aria-hidden>AR</span>
              <div className="relative">
                <div className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-[-0.03em] text-white">Azmain Raihan</div>
                <div className="text-xs font-mono uppercase tracking-[0.16em] text-white/70 mt-1">Founder · CEO</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 text-sm max-w-[18rem]">
              <a href="mailto:contact@hirebest.online" className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3 text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition">
                <span className="flex items-center gap-2.5"><Mail size={14} className="text-[var(--color-primary-2)]"/>Email</span><ArrowRight size={14}/>
              </a>
              <a href="https://wa.me/8801324419060" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3 text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)] transition">
                <span className="flex items-center gap-2.5"><MessageCircle size={14} className="text-[var(--color-primary-2)]"/>WhatsApp</span><ArrowRight size={14}/>
              </a>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-8">
          <Reveal>
            <p className="accent-serif text-[clamp(1.8rem,3.4vw,2.9rem)] leading-[1.12] text-[var(--color-fg)]">
              “Most ATS platforms rank candidates by keyword overlap. That tells you who wrote a good resume —
              <span className="text-[var(--color-primary-2)]"> not who can do the job.</span>”
            </p>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-2 gap-8 text-[var(--color-fg-dim)] leading-relaxed">
            <Reveal delay={0.05}>
              I built HireBest because I watched hiring teams drown in CVs while the people who could have done
              the job well were buried in the pile. The problem was not the volume — it was the tooling.
            </Reveal>
            <Reveal delay={0.12}>
              The idea is simple: give every CV a structured read against the actual job description, surface what
              matches and what is missing, and explain the reasoning in plain English so a human can verify it.
              Not a black box — a cited, auditable shortlist.
            </Reveal>
            <Reveal delay={0.18} className="md:col-span-2">
              I keep the team lean on purpose. Every feature has to earn its place by making the actual recruiting
              decision faster, fairer, or more defensible. We are not building a platform — we are building a
              better screener.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-6xl mx-auto px-5 py-28">
        <Eyebrow n="01">Mission</Eyebrow>
        <ScrollWords
          className="mt-10 font-[family-name:var(--font-heading)] text-[clamp(1.9rem,4.4vw,3.75rem)] leading-[1.08] tracking-[-0.04em] font-semibold text-[var(--color-fg)]"
          text="Give every hiring team — from a 5-person startup to a 500-person scale-up — the screening speed and reasoning depth that only a *$7,000/year* enterprise ATS used to offer."
        />
      </section>

      {/* ── Values ── */}
      <section className="max-w-7xl mx-auto px-5 pb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-7">
            <Eyebrow n="02">How we build</Eyebrow>
            <SplitHeading text={'Three *principles.*'} className="display-lg mt-6 text-[var(--color-fg)]" />
          </div>
          <Reveal className="lg:col-span-5 text-[var(--color-fg-dim)] leading-relaxed">
            Everything we ship gets held against these. If a feature can't clear all three, it doesn't ship.
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <Spotlight className="tile h-full p-8 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="icon-badge"><v.icon size={18}/></span>
                  <span className="numeral text-6xl">0{i + 1}</span>
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em] text-[var(--color-fg)]">{v.title}</h3>
                <p className="mt-3 text-sm text-[var(--color-fg-dim)] leading-relaxed">{v.desc}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Timeline — the rail draws itself as you scroll ── */}
      <Timeline />

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[var(--color-border)]">
          {[
            { n: '38s',  label: 'to screen 100 CVs' },
            { n: '94%',  label: 'recruiter agreement' },
            { n: '10K+', label: 'resumes / week' },
            { n: '2024', label: 'founded' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className={`pt-8 pb-4 pr-6 ${i > 0 ? 'lg:border-l lg:pl-8' : ''} ${i % 2 === 1 ? 'border-l pl-6 lg:pl-8' : ''} border-[var(--color-border)]`}>
              <div className="font-[family-name:var(--font-heading)] font-bold tracking-[-0.06em] leading-none text-[clamp(2.75rem,5.4vw,5rem)] text-[var(--color-fg)] tabular">
                {s.n === '2024' ? s.n : <CountUp value={s.n} />}
              </div>
              <div className="mt-4 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

    </>
  )
}

function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.5'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <section className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <Eyebrow n="03">Timeline</Eyebrow>
          <SplitHeading text={'How we\n*got here.*'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>
      </div>
      <div ref={ref} className="lg:col-span-8 relative pl-10">
        <div aria-hidden className="absolute left-3 top-2 bottom-2 w-px bg-[var(--color-border)]" />
        <motion.div aria-hidden className="absolute left-3 top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[var(--color-primary-2)] to-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]" style={reduce ? undefined : { scaleY }} />
        <ul className="space-y-14">
          {timeline.map((t, i) => (
            <Reveal as="li" key={i} delay={0.05} className="relative">
              <span className="absolute -left-[2.05rem] top-2 w-3 h-3 rounded-full bg-[var(--color-bg)] border-2 border-[var(--color-primary)]" />
              <div className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold tracking-[-0.05em] text-[var(--color-fg)]">{t.year}</div>
              <p className="mt-3 text-[var(--color-fg-dim)] leading-relaxed max-w-[56ch] text-lg">{t.event}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
