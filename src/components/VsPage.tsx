import { Link } from 'react-router-dom'
import { Check, ArrowRight, Minus } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { useSchema, faqPage } from '../lib/schema'
import Breadcrumbs from './Breadcrumbs'

type Row = { f: string; us: string; them: string }
type Props = {
  competitor: string
  headline: string
  intro: string
  forUs: string[]
  forCompetitor: string[]
  rows: Row[]
  cta: string
  faqs?: { q: string; a: string }[]
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export default function VsPage({ competitor, headline, intro, forUs, forCompetitor, rows, cta, faqs }: Props) {
  useSeo({ title: headline, description: intro })
  useSchema(`vs-${competitor.toLowerCase()}-faq`, faqs && faqs.length > 0 ? faqPage(faqs) : null)

  return (
    <>
      <Breadcrumbs
        trail={[{ name: 'Compare', href: '/pricing' }, { name: `vs ${competitor}` }]}
        schemaId={`vs-${competitor.toLowerCase()}-bc`}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />

        <div className="max-w-7xl mx-auto px-5 pt-16 pb-16 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
              <span className="chip">Comparison</span>
              <span className="text-[11px] font-mono text-[var(--color-muted)]">HireBest <span className="text-[var(--color-muted-2)]">vs</span> {competitor}</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.05 }}
              className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.03]"
            >
              {headline}
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-4 text-[var(--color-fg-dim)] leading-relaxed border-l-2 border-[var(--color-primary)]/40 pl-4"
          >
            {intro}
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto px-5 pb-10 flex flex-wrap gap-3">
          <Link to="/signup" className="btn-primary">Try HireBest free <ArrowRight size={14}/></Link>
          <Link to="/pricing" className="btn-ghost">See pricing</Link>
        </div>
      </section>

      {/* ── Pick one card — split ── */}
      <section className="max-w-7xl mx-auto px-5 py-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="card p-8 border-[var(--color-primary)]/50 ring-1 ring-[var(--color-primary)]/20 relative overflow-hidden"
          >
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent" />
            <span className="chip">Pick HireBest if</span>
            <ul className="mt-6 space-y-3">
              {forUs.map(p => (
                <li key={p} className="text-sm text-[var(--color-fg)] flex gap-2.5 leading-relaxed">
                  <Check size={15} className="text-[var(--color-primary-2)] mt-0.5 shrink-0"/>{p}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="card p-8">
            <span className="chip" style={{
              background: 'color-mix(in srgb, var(--color-fg) 6%, transparent)',
              color: 'var(--color-muted)',
              borderColor: 'var(--color-border)',
            }}>
              Pick {competitor} if
            </span>
            <ul className="mt-6 space-y-3">
              {forCompetitor.map(p => (
                <li key={p} className="text-sm text-[var(--color-fg-dim)] flex gap-2.5 leading-relaxed">
                  <Minus size={15} className="text-[var(--color-muted)] mt-0.5 shrink-0"/>{p}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Side-by-side table ── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="mb-8">
          <span className="chip">Feature by feature</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Side-by-side</h2>
        </div>

        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm table-clean">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">Feature</th>
                <th className="text-left p-4 font-semibold text-[var(--color-primary-2)] tracking-tight">HireBest</th>
                <th className="text-left p-4 font-semibold text-[var(--color-fg)] tracking-tight">{competitor}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.f} className="border-b border-[var(--color-border)] last:border-0 align-top">
                  <td className="p-4 text-[var(--color-muted)]">{r.f}</td>
                  <td className="p-4 text-[var(--color-fg)]">{r.us}</td>
                  <td className="p-4 text-[var(--color-fg-dim)]">{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      {faqs && faqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 py-16">
          <div className="mb-8">
            <span className="chip">FAQ</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Frequently asked</h2>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-3"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="card p-6">
                <h3 className="font-medium text-[var(--color-fg)]">{faq.q}</h3>
                <p className="mt-2 text-sm text-[var(--color-fg-dim)] leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="card p-12 md:p-14 text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-70" />
          <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] max-w-2xl mx-auto">
            {cta.split('.')[0]}.
          </h3>
          <p className="mt-4 text-[var(--color-fg-dim)] max-w-xl mx-auto leading-relaxed">
            {cta.split('.').slice(1).join('.').trim()}
          </p>
          <Link to="/signup" className="btn-primary mt-7">Start free <ArrowRight size={14}/></Link>
        </div>
      </section>
    </>
  )
}
