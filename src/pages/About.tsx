import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MessageCircle, Zap, Users, Shield } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, organization } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'

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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

export default function About() {
  useSeo({
    title: 'About HireBest — Founder Story, Mission, and Team',
    description: 'HireBest was built by a founder who spent 4 hours screening 200 CVs for one role. Now 100 CVs take 38 seconds. Meet the team behind the AI resume screener.',
    canonical: 'https://hirebest.online/about',
  })
  useSchema('about-org', organization())
  useSchema('about-founder', founderSchema)

  return (
    <>
      <Breadcrumbs trail={[{ name: 'About' }]} schemaId="about-bc" />

      {/* ── Hero — asymmetric, editorial ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-70" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-5 pt-16 pb-20 grid lg:grid-cols-12 gap-10 items-end"
        >
          <div className="lg:col-span-8">
            <motion.span variants={fadeUp} className="chip">Our story</motion.span>
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.03]"
            >
              Built by someone who spent<br/>
              <span className="text-[var(--color-muted)]">4 hours reading</span>{' '}
              <span className="text-[var(--color-primary-2)]">the wrong CVs.</span>
            </motion.h1>
          </div>
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <p className="text-[var(--color-fg-dim)] leading-relaxed border-l-2 border-[var(--color-primary)]/40 pl-4">
              HireBest started as a personal frustration. A founder screening 200 applicants for a backend role,
              3.5 minutes per CV, 700 minutes later — with a shortlist that could have taken under an hour
              if the signal-to-noise ratio had been any better. So we fixed it.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Founder card ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="card p-8 md:p-12 grid md:grid-cols-12 gap-10 items-start"
        >
          <div className="md:col-span-4 flex flex-col gap-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-2)] flex items-center justify-center text-4xl font-semibold text-white shadow-lg">
              AR
            </div>
            <div>
              <div className="font-semibold text-[var(--color-fg)] text-lg tracking-tight">Azmain Raihan</div>
              <div className="text-sm text-[var(--color-muted)] font-mono">Founder · CEO</div>
            </div>
            <div className="flex flex-col gap-2.5 text-sm pt-2 border-t border-[var(--color-border)]">
              <a href="mailto:contact@hirebest.online" className="flex items-center gap-2.5 text-[var(--color-fg-dim)] hover:text-[var(--color-primary-2)] transition">
                <Mail size={14}/> contact@hirebest.online
              </a>
              <a href="https://wa.me/8801324419060" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--color-fg-dim)] hover:text-[var(--color-primary-2)] transition">
                <MessageCircle size={14}/> WhatsApp
              </a>
            </div>
          </div>

          <div className="md:col-span-8 space-y-5 text-[var(--color-fg-dim)] leading-relaxed">
            <p>
              I built HireBest because I watched hiring teams drown in CVs while the people who could have done
              the job well were buried in the pile. The problem was not the volume — it was the tooling. Most ATS
              platforms rank candidates by keyword overlap. That tells you who wrote a good resume, not who can
              do the job.
            </p>
            <p>
              The core idea behind HireBest is simple: give every CV a structured read against the actual job
              description, surface what matches and what is missing, and explain the reasoning in plain English
              so a human can verify it. Not a black box. Not a confidence score with no explanation. A cited,
              auditable shortlist.
            </p>
            <p>
              I keep the team lean on purpose. Every feature has to earn its place by making the actual
              recruiting decision faster, fairer, or more defensible. We are not building a platform — we are
              building a better screener.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-7xl mx-auto px-5 pb-20 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <span className="chip">Mission</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">The mission</h2>
        </div>
        <p className="lg:col-span-8 text-[var(--color-fg-dim)] leading-relaxed text-lg max-w-[70ch]">
          Give every hiring team — from a 5-person startup to a 500-person scale-up — the screening speed
          and reasoning depth that only enterprise ATS platforms with a $7,000/year price tag used to offer.
        </p>
      </section>

      {/* ── Values ── */}
      <section className="max-w-7xl mx-auto px-5 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-4">
            <span className="chip">How we build</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Three principles.</h2>
          </div>
          <p className="lg:col-span-8 text-[var(--color-fg-dim)] leading-relaxed max-w-[60ch] self-end">
            Everything we ship gets held against these. If a feature can't clear all three, it doesn't ship.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {values.map(v => (
            <motion.div
              key={v.title}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
              className="card card-lift p-7"
            >
              <div className="icon-badge mb-5"><v.icon size={18}/></div>
              <h3 className="font-semibold text-[var(--color-fg)] tracking-tight">{v.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-fg-dim)] leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Timeline — cleaner rail ── */}
      <section className="max-w-7xl mx-auto px-5 pb-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="chip">Timeline</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">How we got here.</h2>
          </div>
          <div className="lg:col-span-8">
            <div className="relative">
              <div aria-hidden className="absolute left-[5.5rem] top-2 bottom-2 w-px bg-[var(--color-border)]" />
              <ul className="space-y-6">
                {timeline.map((t, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-20 shrink-0 text-right pt-0.5">
                      <span className="text-[11px] font-mono font-semibold text-[var(--color-primary-2)] uppercase tracking-widest">{t.year}</span>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-bg)]" />
                      <p className="text-[var(--color-fg-dim)] leading-relaxed">{t.event}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — no cards, borders only ── */}
      <section className="max-w-7xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] rounded-lg overflow-hidden">
          {[
            { n: '38s',   label: 'to screen 100 CVs' },
            { n: '94%',   label: 'recruiter agreement' },
            { n: '10K+',  label: 'resumes / week' },
            { n: '2024',  label: 'founded' },
          ].map(s => (
            <div key={s.label} className="px-6 py-8">
              <div className="text-3xl md:text-4xl font-semibold text-[var(--color-fg)] tracking-tight font-mono tabular">{s.n}</div>
              <div className="text-[11px] text-[var(--color-muted)] mt-2 uppercase tracking-[0.14em]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="max-w-7xl mx-auto px-5 pb-24">
        <div className="card p-12 md:p-14 text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-80" />
          <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Get in touch</h3>
          <p className="mt-4 text-[var(--color-fg-dim)] leading-relaxed max-w-md mx-auto">
            Questions about HireBest, custom builds, or partnership? We respond fast.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Link to="/contact" className="btn-primary">Contact us <ArrowRight size={14}/></Link>
            <Link to="/pricing" className="btn-ghost">See pricing</Link>
          </div>
        </div>
      </section>
    </>
  )
}
