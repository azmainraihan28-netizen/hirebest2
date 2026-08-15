import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { posts } from '../lib/posts'
import { useSeo } from '../lib/seo'
import Breadcrumbs from '../components/Breadcrumbs'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export default function Blog() {
  useSeo({
    title: 'Blog — Hiring, screening, and the AI shift',
    description: 'Stories, benchmarks, and opinions from the HireBest team on CV screening, ATS pricing, and AI in hiring.',
  })

  const [feature, ...rest] = posts

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Blog' }]} schemaId="blog-breadcrumb"/>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-overlay opacity-30" />
        <div className="max-w-7xl mx-auto px-5 pt-16 pb-10 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <span className="chip">Journal</span>
            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.03]">
              Notes on hiring,<br/>
              <span className="text-[var(--color-muted)]">screening, and the</span>{' '}
              <span className="text-[var(--color-primary-2)]">AI shift.</span>
            </h1>
          </div>
          <p className="lg:col-span-4 text-[var(--color-fg-dim)] leading-relaxed border-l-2 border-[var(--color-primary)]/40 pl-4">
            Field-tested opinions and benchmarks from a team that ships an AI screener every week.
          </p>
        </div>
      </section>

      {/* ── Featured post ── */}
      {feature && (
        <section className="max-w-7xl mx-auto px-5 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            <Link
              to={`/blog/${feature.slug}`}
              className="card card-lift block overflow-hidden grid md:grid-cols-12 gap-0"
            >
              {feature.coverImage && (
                <div className="md:col-span-7 overflow-hidden md:border-r border-[var(--color-border)] bg-[var(--color-bg-2)]">
                  <img src={feature.coverImage} alt={feature.title} loading="eager" className="w-full h-full object-cover"/>
                </div>
              )}
              <div className="md:col-span-5 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono">
                  <span className="chip">Featured</span>
                  <span>{feature.category}</span>
                  <span>·</span>
                  <span>{feature.readTime}</span>
                </div>
                <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-tight text-[var(--color-fg)]">
                  {feature.title}
                </h2>
                <p className="mt-4 text-[var(--color-fg-dim)] leading-relaxed">{feature.excerpt}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-primary-2)] font-medium">
                  Read the article <ArrowRight size={14}/>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── Grid ── */}
      <section className="max-w-7xl mx-auto px-5 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">All posts</h2>
          <div className="text-xs font-mono text-[var(--color-muted)]">{posts.length} articles</div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {rest.map(p => (
            <motion.div
              key={p.slug}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
            >
              <Link to={`/blog/${p.slug}`} className="card card-lift overflow-hidden block h-full flex flex-col">
                {p.coverImage && (
                  <div className="overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-2)] aspect-[16/9]">
                    <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"/>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-mono">
                    <span className="text-[var(--color-primary-2)]">{p.category}</span>
                    <span>·</span>
                    <span>{p.readTime}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--color-fg)] leading-snug tracking-tight text-lg">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--color-fg-dim)] leading-relaxed line-clamp-3 flex-1">
                    {p.excerpt}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm text-[var(--color-primary-2)]">
                    Read <ArrowRight size={13}/>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  )
}
