import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MessageCircle, Zap, Users, Shield } from 'lucide-react'
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
  {
    icon: Zap,
    title: 'Speed is a feature',
    desc: 'Recruiters should not spend 3.5 minutes per CV. We built HireBest so 100 CVs take 38 seconds — giving teams back hours every week.',
  },
  {
    icon: Users,
    title: 'Honesty over hype',
    desc: 'HireBest is an AI screener, not a magic oracle. Every score comes with cited reasoning so you can agree, override, or push back.',
  },
  {
    icon: Shield,
    title: 'Yours stays yours',
    desc: 'CVs you upload stay in your workspace. Row-level security, no training on your data, no retention beyond your session.',
  },
]

const timeline = [
  { year: '2024', event: 'Problem identified — a founder spending 4 hours screening 200 CVs for one backend role.' },
  { year: '2025 Q1', event: 'First working prototype: PDF parsing + GPT-4o scoring against a pasted JD.' },
  { year: '2025 Q3', event: 'Beta launch — 50 teams onboarded, median screening time 38 seconds confirmed.' },
  { year: '2026', event: 'SaaS pricing relaunch — Starter, Growth, Team, and Enterprise tiers with monthly billing and 14-day free trial; 10,000+ resumes processed weekly.' },
]

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

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-5 pt-10 pb-16 text-center">
        <span className="chip">About HireBest</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Built by someone who spent<br />
          <span className="gradient-text">4 hours reading the wrong CVs.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[var(--color-muted)] text-lg leading-relaxed">
          HireBest started as a personal frustration. A founder screening 200 applicants for a backend role,
          3.5 minutes per CV, 700 minutes later — with a shortlist that could have been done in under an hour
          if the signal-to-noise ratio had been any better. So we fixed it.
        </p>
      </section>

      {/* ── Founder ── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="card p-8 md:p-10 grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 flex flex-col items-center md:items-start gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-2)] flex items-center justify-center text-4xl font-extrabold text-white">
              AR
            </div>
            <div>
              <div className="font-bold text-[var(--color-fg)] text-lg">Azmain Raihan</div>
              <div className="text-sm text-[var(--color-muted)]">Founder & CEO</div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:contact@hirebest.online" className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-fg)] transition">
                <Mail size={14} /> contact@hirebest.online
              </a>
              <a href="https://wa.me/8801324419060" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-fg)] transition">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4 text-[var(--color-muted)] leading-relaxed text-sm">
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
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">The mission</h2>
        <p className="text-[var(--color-muted)] leading-relaxed text-lg max-w-3xl">
          Give every hiring team — from a 5-person startup to a 500-person scale-up — the screening speed
          and reasoning depth that only enterprise ATS platforms with a $7,000/year price tag used to offer.
        </p>
      </section>

      {/* ── Values ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">How we build</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {values.map(v => (
            <div key={v.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.12)] flex items-center justify-center mb-4">
                <v.icon size={20} className="text-[var(--color-primary-2)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-fg)] mb-2">{v.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">How we got here</h2>
        <div className="space-y-4">
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-5">
              <div className="shrink-0 w-20 text-right">
                <span className="text-xs font-bold text-[var(--color-primary-2)] uppercase tracking-wider">{t.year}</span>
              </div>
              <div className="relative pl-5 border-l border-[var(--color-border)]">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: '38s', label: 'to screen 100 CVs' },
            { n: '94%', label: 'recruiter agreement' },
            { n: '10K+', label: 'resumes / week' },
            { n: '2024', label: 'founded' },
          ].map(s => (
            <div key={s.label} className="card p-6 text-center">
              <div className="text-3xl font-extrabold gradient-text">{s.n}</div>
              <div className="text-xs text-[var(--color-muted)] mt-2 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="card p-10">
          <h3 className="text-2xl font-bold">Get in touch</h3>
          <p className="mt-3 text-[var(--color-muted)] leading-relaxed max-w-md mx-auto">
            Questions about HireBest, custom builds, or partnership? We respond fast.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/contact" className="btn-primary">Contact us <ArrowRight size={16} /></Link>
            <Link to="/pricing" className="btn-ghost">See pricing</Link>
          </div>
        </div>
      </section>
    </>
  )
}
