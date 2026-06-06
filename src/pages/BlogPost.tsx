import { Link, useParams } from 'react-router-dom'
import { getPost, posts } from '../lib/posts'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, article } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'

// Per-slug related links: contextual internal links shown after article
const relatedLinks: Record<string, { label: string; href: string; desc: string }[]> = {
  'greenhouse-pricing-2026': [
    { label: 'HireBest vs Greenhouse — full comparison', href: '/vs-greenhouse', desc: 'Pricing, AI features, setup time, and who each tool is built for.' },
    { label: 'HireBest vs Workable', href: '/vs-workable', desc: 'How Workable\'s $299/month stacks up against HireBest\'s flat yearly pricing.' },
  ],
  'ai-ats-wrong-way-to-think': [
    { label: 'HireBest vs Greenhouse', href: '/vs-greenhouse', desc: 'AI-first screener vs full enterprise ATS — side-by-side.' },
    { label: 'HireBest vs Lever', href: '/vs-lever', desc: 'CRM with bolted-on AI vs purpose-built screening.' },
    { label: 'Free Interview Question Generator', href: '/tools/interview-questions', desc: 'Paste a JD, get 5 tailored questions with ideal answers.' },
  ],
  'screen-100-cvs-in-38-seconds': [
    { label: 'Pricing — start from $400/year', href: '/pricing', desc: 'Flat-rate plans, no per-seat tax, one-time option available.' },
    { label: 'Free Interview Question Generator', href: '/tools/interview-questions', desc: 'After the shortlist: generate interview questions from the same JD.' },
  ],
  'hirebest-vs-greenhouse-2026': [
    { label: 'Full feature comparison', href: '/vs-greenhouse', desc: 'Deep-dive: pricing breakdown, AI scoring, contract terms.' },
    { label: 'Greenhouse Pricing in 2026', href: '/blog/greenhouse-pricing-2026', desc: 'What an annual Greenhouse contract actually costs SMEs.' },
  ],
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug || '')
  useSeo({
    title: post?.title ?? 'Article not found',
    description: post?.excerpt ?? 'HireBest blog',
    canonical: post ? `https://hirebest.online/blog/${post.slug}` : undefined,
  })
  useSchema('post-article', post ? article({ title: post.title, description: post.excerpt, slug: post.slug, date: post.date, author: post.author }) : null)
  if (!post) return <div className="max-w-3xl mx-auto px-5 py-20"><h1 className="text-3xl font-bold">Not found</h1><Link to="/blog" className="btn-ghost mt-4">← Back to blog</Link></div>

  const related = relatedLinks[post.slug] ?? []
  const morePosts = posts.filter(p => p.slug !== post.slug).slice(0, 2)

  return (
    <>
    <Breadcrumbs trail={[{ name: 'Blog', href: '/blog' }, { name: post.title }]} schemaId="post-breadcrumb"/>
    <article className="max-w-3xl mx-auto px-5 pt-6 pb-16">
      <Link to="/blog" className="text-sm text-[var(--color-muted)] flex items-center gap-1 hover:text-[var(--color-fg)]"><ArrowLeft size={14}/>Back to blog</Link>
      <div className="mt-6 flex items-center gap-3 text-xs text-[var(--color-muted)]">
        <span className="chip">{post.category}</span>
        <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
      </div>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">{post.excerpt}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-2)] flex items-center justify-center text-xs font-bold text-white">AR</div>
        <div>
          <div className="text-sm font-medium text-[var(--color-fg)]">{post.author}</div>
          <div className="text-xs text-[var(--color-muted)]">Founder, HireBest</div>
        </div>
      </div>
      <div className="prose-blog mt-10">
        {post.body.map((para, i) => {
          if (para.startsWith('## ')) return <h2 key={i}>{para.slice(3)}</h2>
          if (para.startsWith('### ')) return <h3 key={i}>{para.slice(4)}</h3>
          if (para.startsWith('> ')) return <blockquote key={i}>{para.slice(2)}</blockquote>
          const parts = para.split(/(\*\*[^*]+\*\*)/g)
          return <p key={i}>{parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}</p>
        })}
      </div>

      {/* Related internal links */}
      {related.length > 0 && (
        <div className="mt-10 border-t border-[var(--color-border)] pt-8">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] uppercase tracking-wider mb-4">Related</h3>
          <div className="space-y-3">
            {related.map(r => (
              <Link key={r.href} to={r.href} className="block card p-4 hover:border-[var(--color-primary)] transition">
                <div className="font-medium text-[var(--color-fg)] text-sm">{r.label} <ArrowRight size={12} className="inline"/></div>
                <div className="text-xs text-[var(--color-muted)] mt-1">{r.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-10 p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary-2)]">Try it</p>
        <h3 className="mt-2 text-xl font-bold">Start screening for free</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">HireBest scores every CV against your JD with written reasoning — free to try.</p>
        <Link to="/signup" className="btn-primary mt-5">Try HireBest free <ArrowRight size={16}/></Link>
      </div>
    </article>

    {/* More from blog */}
    {morePosts.length > 0 && (
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-4">More from the blog</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {morePosts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="card p-5 hover:border-[var(--color-primary)] transition">
              <div className="text-xs text-[var(--color-muted)]">{p.readTime} · {p.category}</div>
              <div className="mt-2 font-semibold text-sm text-[var(--color-fg)]">{p.title}</div>
              <div className="mt-3 text-xs text-[var(--color-primary-2)]">Read →</div>
            </Link>
          ))}
        </div>
      </section>
    )}
    </>
  )
}
