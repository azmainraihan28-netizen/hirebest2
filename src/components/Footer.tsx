import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
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
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-[var(--color-muted)] max-w-sm">AI Resume Screener for Hiring Teams. Score 100 CVs in 38 seconds.</p>
            <button onClick={requestReview} className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--color-primary-2)] hover:text-[var(--color-primary)] transition">
              <Star size={14}/>Leave a Review
            </button>
          </div>
          <div>
            <h4 className="text-[var(--color-fg)] text-sm font-semibold mb-3">Product</h4>
            <ul className="text-sm text-[var(--color-muted)] space-y-2">
              <li><a href="/#features">Features</a></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
              <li><Link to="/tools/interview-questions">Free Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[var(--color-fg)] text-sm font-semibold mb-3">Compare</h4>
            <ul className="text-sm text-[var(--color-muted)] space-y-2">
              <li><Link to="/vs-greenhouse">vs Greenhouse</Link></li>
              <li><Link to="/vs-workable">vs Workable</Link></li>
              <li><Link to="/vs-lever">vs Lever</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-[var(--color-border)] text-sm text-[var(--color-muted)]">
          <div>© 2026 HireBest. All rights reserved.</div>
          <div className="flex gap-5">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms</Link>
            <Link to="/refund-policy">Refunds</Link>
            <button onClick={requestReview} className="hover:text-[var(--color-fg)] transition">Leave a Review</button>
          </div>
        </div>
        <div className="mt-10 select-none">
          <div className="text-[clamp(2.5rem,12vw,9rem)] font-extrabold tracking-tighter leading-none text-transparent" style={{ WebkitTextStroke: '1px color-mix(in srgb, var(--color-primary-2) 25%, transparent)' }}>
            HIREBEST
          </div>
        </div>
      </div>
    </footer>
  )
}
