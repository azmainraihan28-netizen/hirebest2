import { Link, useParams } from 'react-router-dom'
import { getPost } from '../lib/posts'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug || '')
  if (!post) return <div className="max-w-3xl mx-auto px-5 py-20"><h1 className="text-3xl font-bold">Not found</h1><Link to="/blog" className="btn-ghost mt-4">← Back to blog</Link></div>
  return (
    <article className="max-w-3xl mx-auto px-5 py-16">
      <Link to="/blog" className="text-sm text-[var(--color-muted)] flex items-center gap-1 hover:text-white"><ArrowLeft size={14}/>Back to blog</Link>
      <div className="mt-6 flex items-center gap-3 text-xs text-[var(--color-muted)]">
        <span className="chip">{post.category}</span>
        <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
      </div>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">{post.excerpt}</p>
      <div className="prose-blog mt-10">
        {post.body.map((para, i) => {
          if (para.startsWith('## ')) return <h2 key={i}>{para.slice(3)}</h2>
          if (para.startsWith('### ')) return <h3 key={i}>{para.slice(4)}</h3>
          if (para.startsWith('> ')) return <blockquote key={i}>{para.slice(2)}</blockquote>
          const parts = para.split(/(\*\*[^*]+\*\*)/g)
          return <p key={i}>{parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}</p>
        })}
      </div>
      <div className="card mt-12 p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary-2)]">Try it</p>
        <h3 className="mt-2 text-xl font-bold">Start screening for free</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">HireBest scores every CV against your JD with written reasoning — free to try.</p>
        <Link to="/signup" className="btn-primary mt-5">Try HireBest free <ArrowRight size={16}/></Link>
      </div>
    </article>
  )
}
