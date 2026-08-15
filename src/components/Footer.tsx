import { Link } from 'react-router-dom'
import { Star, ArrowUpRight } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  const requestReview = () => {
    if (window.SaaSBrowser?.requestReview) {
      window.SaaSBrowser.requestReview()
    } else {
      console.warn('SaaSBrowser widget not loaded yet')
    }
  }

  return (
    <footer className="relative mt-24 border-t border-[var(--color-border)]">
      {/* Subtle ambient glow strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 pt-16 pb-8">
        <div className="grid md:grid-cols-12 gap-10 mb-14">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 text-sm text-[var(--color-fg-dim)] max-w-sm leading-relaxed">
              AI resume screener for hiring teams. Score 100 CVs in 38 seconds — with JD-cited reasoning.
            </p>

            <button
              onClick={requestReview}
              className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--color-primary-2)] hover:text-[var(--color-primary)] transition"
            >
              <Star size={14} className="fill-current"/>
              Leave a review
            </button>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://www.producthunt.com/products/hirebest-online?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-hirebest-online"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition"
              >
                <img
                  alt="Hirebest.online — Score 100 CVs in 38 Seconds | Product Hunt"
                  width={220}
                  height={48}
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1175830&theme=light&t=1781854290026"
                />
              </a>
              <a
                href="https://www.shipit.buzz/products/hirebest?ref=badge"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition"
              >
                <img
                  src="https://www.shipit.buzz/api/products/hirebest/badge?theme=light"
                  alt="Featured on Shipit"
                  height={48}
                />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-[var(--color-fg-dim)]">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/analytics">Analytics</FooterLink>
              <FooterLink href="/tools/interview-questions">Free tools</FooterLink>
              <FooterLink href="/about">About</FooterLink>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-4">Compare</h4>
            <ul className="space-y-3 text-sm text-[var(--color-fg-dim)]">
              <FooterLink href="/vs-greenhouse">vs Greenhouse</FooterLink>
              <FooterLink href="/vs-workable">vs Workable</FooterLink>
              <FooterLink href="/vs-lever">vs Lever</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-4">Get started</h4>
            <p className="text-sm text-[var(--color-fg-dim)] leading-relaxed">
              14-day free trial. No credit card. Cancel anytime.
            </p>
            <Link to="/signup" className="btn-primary mt-4">Start free</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
          <div>© 2026 HireBest. All rights reserved.</div>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy-policy" className="hover:text-[var(--color-fg)] transition">Privacy</Link>
            <Link to="/terms-and-conditions" className="hover:text-[var(--color-fg)] transition">Terms</Link>
            <Link to="/refund-policy" className="hover:text-[var(--color-fg)] transition">Refunds</Link>
            <button onClick={requestReview} className="hover:text-[var(--color-fg)] transition">Review</button>
          </div>
        </div>

        {/* Wordmark — outline, restrained */}
        <div className="mt-14 select-none overflow-hidden">
          <div
            className="text-[clamp(3rem,14vw,10rem)] font-extrabold tracking-[-0.06em] leading-none text-transparent"
            style={{
              WebkitTextStroke: '1px color-mix(in srgb, var(--color-fg) 12%, transparent)',
            }}
          >
            HIREBEST
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http')
  const Cmp: any = external ? 'a' : Link
  const props = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { to: href }
  return (
    <li>
      <Cmp
        {...props}
        className="inline-flex items-center gap-1 hover:text-[var(--color-fg)] transition group"
      >
        {children}
        {external && <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition"/>}
      </Cmp>
    </li>
  )
}
