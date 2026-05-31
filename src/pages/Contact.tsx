import { Link } from 'react-router-dom'
import { MessageCircle, Mail, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'

export default function Contact() {
  useSeo({
    title: 'Contact HireBest — WhatsApp or email us',
    description: 'Questions about plans, custom builds, or your existing order? Reach out — we usually reply within a few hours.',
  })
  return (
    <section className="max-w-3xl mx-auto px-5 py-20 text-center">
      <span className="chip">Contact</span>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">We'd love to <span className="gradient-text">hear from you</span></h1>
      <p className="mt-4 text-[var(--color-muted)]">Questions about plans, custom builds, or your existing order? Reach out — we usually reply within a few hours.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-10">
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
