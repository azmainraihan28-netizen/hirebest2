import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, ArrowRight, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
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
    <section className="max-w-3xl mx-auto px-5 py-20">
      <div className="text-center">
        <span className="chip">Contact</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">We'd love to <span className="gradient-text">hear from you</span></h1>
        <p className="mt-4 text-[var(--color-muted)]">Questions about plans, custom builds, or your existing order? Drop us a note — we usually reply within a few hours.</p>
      </div>

      <form onSubmit={submit} className="card p-7 mt-10 space-y-3">
        {sent && (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 text-green-300 p-4 text-sm flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5"/>
            <div>
              <div className="font-semibold">Message sent</div>
              <div className="text-xs mt-0.5 opacity-80">We'll reply to your email within a few hours.</div>
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="Full name *" value={name} onChange={e => setName(e.target.value)} className="field" maxLength={200}/>
          <input required type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="field" maxLength={200}/>
        </div>
        <input placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} className="field" maxLength={200}/>
        <textarea required placeholder="How can we help? *" value={message} onChange={e => setMessage(e.target.value)} rows={5} className="field" maxLength={5000}/>
        {err && (
          <div className="text-sm text-red-300 flex items-start gap-2"><AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}</div>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
          <Send size={14}/>{busy ? 'Sending…' : 'Send message'}
        </button>
      </form>

      <div className="text-center text-xs text-[var(--color-muted)] my-8 uppercase tracking-wider">Or reach us directly</div>

      <div className="grid md:grid-cols-2 gap-4">
        <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="card p-7 hover:border-[var(--color-primary)] transition text-left">
          <MessageCircle size={22} className="text-[var(--color-primary-2)]"/>
          <h3 className="mt-4 text-lg font-semibold">WhatsApp</h3>
          <p className="text-sm text-[var(--color-muted)] mt-1">+880 1324 419 060</p>
          <div className="mt-5 text-sm text-[var(--color-primary-2)]">Open chat →</div>
        </a>
        <a href="mailto:contact@hirebest.online" className="card p-7 hover:border-[var(--color-primary)] transition text-left">
          <Mail size={22} className="text-[var(--color-primary-2)]"/>
          <h3 className="mt-4 text-lg font-semibold">Email</h3>
          <p className="text-sm text-[var(--color-muted)] mt-1">contact@hirebest.online</p>
          <div className="mt-5 text-sm text-[var(--color-primary-2)]">Send email →</div>
        </a>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 justify-center">
        <Link to="/pricing" className="btn-primary">See pricing <ArrowRight size={16}/></Link>
        <Link to="/" className="btn-ghost">Back home</Link>
      </div>
    </section>
  )
}
