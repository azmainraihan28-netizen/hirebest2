import { Link } from 'react-router-dom'
import { posts } from '../lib/posts'
import { useSeo } from '../lib/seo'

export default function Blog() {
  useSeo({
    title: 'Blog — Hiring, screening, and the AI shift',
    description: 'Stories, benchmarks, and opinions from the HireBest team on CV screening, ATS pricing, and AI in hiring.',
  })
  return (
    <>
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-10 text-center">
        <span className="chip">Blog</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Notes on hiring,<br/><span className="gradient-text">screening, and the AI shift</span></h1>
        <p className="mt-4 text-[var(--color-muted)]">Stories, benchmarks, and opinions from the HireBest team.</p>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="card p-7 hover:border-[var(--color-primary)] transition">
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span className="chip">{p.category}</span>
                <span>{p.date}</span>
                <span>·</span>
                <span>{p.readTime}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-[var(--color-fg)]">{p.title}</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{p.excerpt}</p>
              <div className="mt-5 text-sm text-[var(--color-primary-2)]">Read →</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
