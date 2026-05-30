import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="max-w-2xl mx-auto px-5 py-32 text-center">
      <div className="text-7xl font-extrabold gradient-text">404</div>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-[var(--color-muted)]">The link is broken or the page moved.</p>
      <Link to="/" className="btn-primary mt-7">Back home</Link>
    </section>
  )
}
