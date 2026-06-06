import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  useSeo({
    title: 'Page Not Found · HireBest',
    description: 'This page does not exist. Head back to HireBest to screen CVs with AI.',
    canonical: 'https://hirebest.online/',
    noindex: true,
  })
  return (
    <section className="max-w-2xl mx-auto px-5 py-32 text-center">
      <div className="text-7xl font-extrabold gradient-text">404</div>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-[var(--color-muted)]">The link is broken or the page moved.</p>
      <Link to="/" className="btn-primary mt-7">Back home</Link>
    </section>
  )
}
