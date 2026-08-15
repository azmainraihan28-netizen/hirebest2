import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, ArrowRight, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSeo } from '../lib/seo'

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
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />

      <div className="max-w-7xl mx-auto px-5 pt-16 pb-24 grid lg:grid-cols-12 gap-10 items-start">
        {/* Left column — copy + direct channels */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <span className="chip">Contact</span>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.05]">
            We'd love to<br/>
            <span className="text-[var(--color-primary-2)]">hear from you.</span>
          </h1>
          <p className="mt-5 text-[var(--color-fg-dim)] leading-relaxed max-w-[52ch]">
            Questions about plans, custom builds, or your existing order? Drop us a note — we usually reply within a few hours.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href="https://wa.me/8801324419060"
              target="_blank"
              rel="noreferrer"
              className="card card-lift p-5 flex items-center gap-4 group"
            >
              <div className="icon-badge shrink-0"><MessageCircle size={18}/></div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--color-fg)] tracking-tight">WhatsApp</div>
                <div className="text-xs text-[var(--color-muted)] font-mono">+880 1324 419 060</div>
              </div>
              <ArrowRight size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-primary-2)] transition"/>
            </a>

            <a
              href="mailto:contact@hirebest.online"
              className="card card-lift p-5 flex items-center gap-4 group"
            >
              <div className="icon-badge shrink-0"><Mail size={18}/></div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--color-fg)] tracking-tight">Email</div>
                <div className="text-xs text-[var(--color-muted)] font-mono">contact@hirebest.online</div>
              </div>
              <ArrowRight size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-primary-2)] transition"/>
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Clock size={12}/>
            <span>Typical reply · under 4h during business hours (BDT)</span>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-7">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="card p-8 space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Send a message</h2>
              <p className="text-sm text-[var(--color-muted)] mt-1">All fields marked with * are required.</p>
            </div>

            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-lg border border-[var(--color-fit)]/40 bg-[color-mix(in_srgb,var(--color-fit)_10%,transparent)] text-[var(--color-fit)] p-4 text-sm flex items-start gap-2"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5"/>
                  <div>
                    <div className="font-semibold">Message sent</div>
                    <div className="text-xs mt-0.5 opacity-80">We'll reply to your email within a few hours.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1.5 block">Full name *</span>
                <input required placeholder="Priya Iyer" value={name} onChange={e => setName(e.target.value)} className="field" maxLength={200}/>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1.5 block">Work email *</span>
                <input required type="email" placeholder="priya@company.com" value={email} onChange={e => setEmail(e.target.value)} className="field" maxLength={200}/>
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1.5 block">Company</span>
              <input placeholder="Optional" value={company} onChange={e => setCompany(e.target.value)} className="field" maxLength={200}/>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1.5 block">How can we help? *</span>
              <textarea
                required
                placeholder="Tell us a bit about your team and what you're trying to figure out."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="field resize-y"
                maxLength={5000}
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--color-muted-2)]">
                <span>Markdown supported. No brochures — just tell us what you're actually solving.</span>
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

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={busy} className="btn-primary flex-1 sm:flex-none justify-center">
                <Send size={14}/>{busy ? 'Sending…' : 'Send message'}
              </button>
              <Link to="/pricing" className="btn-ghost">See pricing <ArrowRight size={14}/></Link>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
