import { Link, useLocation } from 'react-router-dom'
import { useRef } from 'react'
import { Star, ArrowUpRight, ArrowRight, Mail, MessageCircle } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Logo from './Logo'
import { Magnetic } from './motion/primitives'

const columns = [
  { title: 'Product', links: [
    { href: '/#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/tools/interview-questions', label: 'Free tools' },
    { href: '/about', label: 'About' },
  ] },
  { title: 'Compare', links: [
    { href: '/vs-greenhouse', label: 'vs Greenhouse' },
    { href: '/vs-workable', label: 'vs Workable' },
    { href: '/vs-lever', label: 'vs Lever' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ] },
]

export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  // Home ends on its own full-bleed CTA; don't stack a second invitation under it.
  const showInvite = useLocation().pathname !== '/'
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const wordY = useTransform(scrollYProgress, [0, 1], ['45%', '0%'])

  const requestReview = () => {
    if (window.SaaSBrowser?.requestReview) window.SaaSBrowser.requestReview()
    else console.warn('SaaSBrowser widget not loaded yet')
  }

  return (
    <footer ref={ref} className="relative mt-16 border-t border-[var(--color-border)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-5 pt-20 pb-10">
        {/* Top band: big invitation + direct lines */}
        {showInvite && (
        <div className="grid lg:grid-cols-12 gap-10 pb-16 mb-14 border-b border-[var(--color-border)]">
          <div className="lg:col-span-7">
            <h2 className="display-lg text-[var(--color-fg)]">
              Your next hire is<br/>in <span className="accent-serif text-[var(--color-primary-2)]">that pile</span> somewhere.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic><Link to="/signup" className="btn-primary btn-lg">Start free <ArrowRight size={16}/></Link></Magnetic>
              <Link to="/contact" className="btn-ghost btn-lg">Talk to us</Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:pl-10 flex flex-col justify-end gap-3">
            <a href="mailto:contact@hirebest.online" className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-5 py-4 hover:border-[var(--color-border-strong)] transition">
              <span className="flex items-center gap-3"><Mail size={16} className="text-[var(--color-primary-2)]"/><span className="text-sm">contact@hirebest.online</span></span>
              <ArrowUpRight size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-fg)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition"/>
            </a>
            <a href="https://wa.me/8801324419060" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-5 py-4 hover:border-[var(--color-border-strong)] transition">
              <span className="flex items-center gap-3"><MessageCircle size={16} className="text-[var(--color-primary-2)]"/><span className="text-sm">WhatsApp · +880 1324 419 060</span></span>
              <ArrowUpRight size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-fg)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition"/>
            </a>
          </div>
        </div>
        )}

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-5">
            <Logo />
            <p className="mt-4 text-sm text-[var(--color-fg-dim)] max-w-sm leading-relaxed">
              AI resume screener for hiring teams. Score 100 CVs in 38 seconds — with JD-cited reasoning.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-fit)] opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--color-fit)]" />
              </span>
              All systems operational
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="https://www.producthunt.com/products/hirebest-online?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hirebest-online" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
                <img alt="Hirebest.online — Score 100 CVs in 38 Seconds | Product Hunt" width={180} height={39} src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1175830&theme=light&t=1781854290026"/>
              </a>
              <a href="https://www.shipit.buzz/products/hirebest?ref=badge" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
                <img src="https://www.shipit.buzz/api/products/hirebest/badge?theme=light" alt="Featured on Shipit" height={39} style={{ height: 39 }}/>
              </a>
            </div>
          </div>

          {columns.map(col => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-muted)] mb-5">{col.title}</h4>
              <ul className="space-y-3 text-sm">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link to={l.href} className="u-link text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-3">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-muted)] mb-5">Reviews</h4>
            <p className="text-sm text-[var(--color-fg-dim)] leading-relaxed">Using HireBest? A short review helps other hiring teams find us.</p>
            <button onClick={requestReview} className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-primary-2)] u-link">
              <Star size={14} className="fill-current"/> Leave a review
            </button>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-[var(--color-muted)]">
          <div>© 2026 HireBest. All rights reserved.</div>
          <div className="flex flex-wrap gap-6">
            <Link to="/privacy-policy" className="u-link hover:text-[var(--color-fg)] transition">Privacy</Link>
            <Link to="/terms-and-conditions" className="u-link hover:text-[var(--color-fg)] transition">Terms</Link>
            <Link to="/refund-policy" className="u-link hover:text-[var(--color-fg)] transition">Refunds</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="u-link hover:text-[var(--color-fg)] transition">Back to top ↑</button>
          </div>
        </div>
      </div>

      {/* Mega wordmark rising out of the floor */}
      <div className="relative h-[clamp(4rem,17vw,18rem)] overflow-hidden" aria-hidden>
        <motion.div style={reduce ? undefined : { y: wordY }} className="mega-word text-center whitespace-nowrap">
          HireBest
        </motion.div>
      </div>
    </footer>
  )
}
