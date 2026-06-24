import { Link, useParams } from 'react-router-dom'
import { getPost, posts } from '../lib/posts'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, article } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'

// Per-slug related links: contextual internal links shown after article
const relatedLinks: Record<string, { label: string; href: string; desc: string }[]> = {
  'marketing-manager-interview-questions': [
    { label: '50 Software Engineer Interview Questions', href: '/blog/software-engineer-interview-questions', desc: 'The companion guide for engineering hires.' },
    { label: 'HireBest Free Interview Question Generator', href: '/tools/interview-questions', desc: 'Paste a JD, get role-specific questions in 30 seconds.' },
    { label: 'How to Screen 100 CVs in 38 Seconds', href: '/blog/screen-100-cvs-in-38-seconds', desc: 'The screening step before the interview loop — compressed into a coffee break.' },
    { label: 'HireBest Pricing', href: '/pricing', desc: 'Transparent SaaS pricing — $400–$1,500/year with no demos.' },
  ],
  'software-engineer-interview-questions': [
    { label: 'HireBest Free Interview Question Generator', href: '/tools/interview-questions', desc: 'Paste a JD, get role-specific questions tailored to the seniority and stack.' },
    { label: 'How to Screen 100 CVs in 38 Seconds', href: '/blog/screen-100-cvs-in-38-seconds', desc: 'The screening step before the interview loop — compressed into a coffee break.' },
    { label: 'Why "AI ATS" is the Wrong Way to Think About Hiring', href: '/blog/ai-ats-wrong-way-to-think', desc: 'The category label hides the real shift — what AI actually replaces in your hiring day.' },
    { label: 'HireBest Pricing', href: '/pricing', desc: 'Transparent SaaS pricing — $400–$1,500/year with no demos.' },
  ],
  'workable-pricing-2026': [
    { label: 'HireBest vs Workable — full comparison', href: '/vs-workable', desc: 'Pricing, AI features, setup time, and who each tool is built for.' },
    { label: 'HireBest vs Greenhouse', href: '/vs-greenhouse', desc: 'How Greenhouse\'s $5,000–$14,000/year stacks up against HireBest\'s tiered pricing.' },
    { label: 'HireBest vs Lever', href: '/vs-lever', desc: 'Lever starts at $5,000–$25,000+/year. HireBest at $400/year.' },
    { label: 'Greenhouse Pricing in 2026', href: '/blog/greenhouse-pricing-2026', desc: 'The companion post on what Greenhouse really costs.' },
    { label: 'HireBest Pricing', href: '/pricing', desc: 'Transparent SaaS pricing — $400–$1,500/year with no demos.' },
  ],
  'greenhouse-pricing-2026': [
    { label: 'HireBest vs Greenhouse — full comparison', href: '/vs-greenhouse', desc: 'Pricing, AI features, setup time, and who each tool is built for.' },
    { label: 'HireBest vs Workable', href: '/vs-workable', desc: 'How Workable\'s $299/month stacks up against HireBest\'s $49–199/month tiered pricing.' },
    { label: 'HireBest vs Lever', href: '/vs-lever', desc: 'Lever starts at $5,000–$25,000+/year. HireBest at $49/month.' },
    { label: 'HireBest Pricing', href: '/pricing', desc: 'Transparent SaaS pricing — $49–199/month with 14-day free trial.' },
  ],
  'ai-ats-wrong-way-to-think': [
    { label: 'HireBest vs Greenhouse', href: '/vs-greenhouse', desc: 'AI-first screener vs full enterprise ATS — side-by-side.' },
    { label: 'HireBest vs Workable', href: '/vs-workable', desc: 'How Workable\'s $299/month stacks up against HireBest\'s $49–199/month tiered pricing.' },
    { label: 'HireBest vs Lever', href: '/vs-lever', desc: 'CRM with bolted-on AI vs purpose-built screening.' },
    { label: 'Free Interview Question Generator', href: '/tools/interview-questions', desc: 'Paste a JD, get 5 tailored questions with ideal answers.' },
  ],
  'screen-100-cvs-in-38-seconds': [
    { label: 'Pricing — start from $49/month', href: '/pricing', desc: 'SaaS pricing, no per-seat tax, 14-day free trial on every paid plan.' },
    { label: 'Free Interview Question Generator', href: '/tools/interview-questions', desc: 'After the shortlist: generate interview questions from the same JD.' },
    { label: 'HireBest vs Greenhouse', href: '/vs-greenhouse', desc: 'See how HireBest speed compares to Greenhouse\'s individual pipeline review.' },
    { label: 'HireBest vs Workable', href: '/vs-workable', desc: 'Workable vs HireBest on AI screening speed and pricing.' },
  ],
  'hirebest-vs-greenhouse-2026': [
    { label: 'HireBest vs Greenhouse — deep dive', href: '/vs-greenhouse', desc: 'Full pricing breakdown, AI scoring, and contract terms.' },
    { label: 'HireBest vs Workable', href: '/vs-workable', desc: 'Another popular ATS compared on price and AI features.' },
    { label: 'HireBest vs Lever', href: '/vs-lever', desc: 'Lever\'s CRM-first approach vs HireBest\'s screening focus.' },
    { label: 'Greenhouse Pricing in 2026', href: '/blog/greenhouse-pricing-2026', desc: 'What an annual Greenhouse contract actually costs SMEs.' },
  ],
}

function renderInline(text: string, key: string | number) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, j) => {
    if (part.startsWith('**')) return <strong key={`${key}-${j}`}>{part.slice(2, -2)}</strong>
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (m) return <Link key={`${key}-${j}`} to={m[2]} className="text-blue-500 underline underline-offset-2 hover:text-blue-400">{m[1]}</Link>
    return part
  })
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
      {post.coverImage && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <img src={post.coverImage} alt={post.title} className="w-full h-auto block" loading="eager"/>
        </div>
      )}
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
          if (para.startsWith('> ')) return <blockquote key={i}>{renderInline(para.slice(2), i)}</blockquote>
          return <p key={i}>{renderInline(para, i)}</p>
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
