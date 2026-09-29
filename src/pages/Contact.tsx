import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, ArrowRight, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSeo } from '../lib/seo'
import { Reveal, SplitHeading, Eyebrow, Magnetic } from '../components/motion/primitives'

export default function Contact() {
  useSeo({
    title: 'Contact HireBest — WhatsApp or email us',
    description: 'Questions about plans, custom builds, or your existing order? Reach out — we usually reply within a few hours.',
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      const r = await fetch('/api/contact-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      })
      if (!r.ok) { const t = await r.text(); throw new Error(t.slice(0, 200)) }
      setSent(true); setName(''); setEmail(''); setCompany(''); setMessage('')
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send. Try WhatsApp or email below.')
    } finally { setBusy(false) }
  }

  return (
    <section className="relative overflow-hidden -mt-[76px] pt-[76px]">
      <div className="aurora" aria-hidden><span/><span/><span/></div>
      <div className="hairlines" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left — copy + direct channels */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <Eyebrow n="@">Contact</Eyebrow>
          <SplitHeading as="h1" text={'We\'d love to\n*hear from you.*'} className="display-xl mt-7 text-[var(--color-fg)]" />
          <Reveal delay={0.3} className="mt-7 text-[var(--color-fg-dim)] leading-relaxed max-w-[46ch] text-lg">
            Questions about plans, custom builds, or your existing order? Drop us a note — we usually reply within a few hours.
          </Reveal>

          <div className="mt-10 space-y-3">
            {[
              { href: 'https://wa.me/8801324419060', icon: MessageCircle, label: 'WhatsApp', sub: '+880 1324 419 060', ext: true },
              { href: 'mailto:contact@hirebest.online', icon: Mail, label: 'Email', sub: 'contact@hirebest.online', ext: false },
            ].map((c, i) => (
              <Reveal key={c.label} delay={0.4 + i * 0.08}>
                <a
                  href={c.href}
                  {...(c.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-card)_70%,transparent)] backdrop-blur p-5 hover:border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] transition"
                >
                  <span className="icon-badge shrink-0"><c.icon size={18}/></span>
                  <span className="flex-1">
                    <span className="block font-[family-name:var(--font-heading)] text-lg font-semibold tracking-[-0.03em] text-[var(--color-fg)]">{c.label}</span>
                    <span className="block text-xs text-[var(--color-muted)] font-mono">{c.sub}</span>
                  </span>
                  <span className="w-10 h-10 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-muted)] group-hover:bg-[var(--color-primary)] group-hover:border-transparent group-hover:text-white transition">
                    <ArrowRight size={16} className="group-hover:-rotate-45 transition-transform duration-300"/>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-muted)] font-mono">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-fit)] opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--color-fit)]" />
            </span>
            <Clock size={12}/> Typical reply · under 4h during business hours (BDT)
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-7">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="tile p-8 md:p-10 space-y-5"
          >
            <div>
              <h2 className="display-md">Send a message</h2>
              <p className="text-sm text-[var(--color-muted)] mt-2">All fields marked with * are required.</p>
            </div>

            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-[var(--color-fit)]/40 bg-[color-mix(in_srgb,var(--color-fit)_10%,transparent)] text-[var(--color-fit)] p-4 text-sm flex items-start gap-2"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5"/>
                  <div>
                    <div className="font-semibold">Message sent</div>
                    <div className="text-xs mt-0.5 opacity-80">We'll reply to your email within a few hours.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mb-2 block">Full name *</span>
                <input required placeholder="Priya Iyer" value={name} onChange={e => setName(e.target.value)} className="field" maxLength={200}/>
              </label>
              <label className="block">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mb-2 block">Work email *</span>
                <input required type="email" placeholder="priya@company.com" value={email} onChange={e => setEmail(e.target.value)} className="field" maxLength={200}/>
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mb-2 block">Company</span>
              <input placeholder="Optional" value={company} onChange={e => setCompany(e.target.value)} className="field" maxLength={200}/>
            </label>

            <label className="block">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-muted)] mb-2 block">How can we help? *</span>
              <textarea
                required
                placeholder="Tell us a bit about your team and what you're trying to figure out."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="field resize-y"
                maxLength={5000}
              />
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--color-muted-2)]">
                <span>No brochures — just tell us what you're actually solving.</span>
                <span className="font-mono tabular">{message.length}/5000</span>
              </div>
            </label>

            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-[var(--color-skip)] flex items-start gap-2"
                >
                  <AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Magnetic strength={0.2}>
                <button type="submit" disabled={busy} className="btn-primary btn-lg justify-center">
                  <Send size={15}/>{busy ? 'Sending…' : 'Send message'}
                </button>
              </Magnetic>
              <Link to="/pricing" className="btn-ghost btn-lg">See pricing <ArrowRight size={15}/></Link>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
