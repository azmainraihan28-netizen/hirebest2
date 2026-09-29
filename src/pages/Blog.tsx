import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import { posts } from '../lib/posts'
import { useSeo } from '../lib/seo'
import Breadcrumbs from '../components/Breadcrumbs'
import { Reveal, SplitHeading, Eyebrow, Spotlight } from '../components/motion/primitives'


export default function Blog() {
  useSeo({
    title: 'Blog — Hiring, screening, and the AI shift',
    description: 'Stories, benchmarks, and opinions from the HireBest team on CV screening, ATS pricing, and AI in hiring.',
  })

  const [feature, ...rest] = posts

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden -mt-[76px] pt-[76px]">
        <div className="aurora" aria-hidden><span/><span/><span/></div>
        <div className="hairlines" aria-hidden />
        <Breadcrumbs trail={[{ name: 'Blog' }]} schemaId="blog-breadcrumb"/>
        <div className="relative max-w-7xl mx-auto px-5 pt-14 pb-16 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-9">
            <Eyebrow n={String(posts.length).padStart(2, '0')}>Journal</Eyebrow>
            <SplitHeading as="h1" text={'Notes on hiring,\nscreening, and the\n*AI shift.*'} className="display-xl mt-7 text-[var(--color-fg)]" />
          </div>
          <Reveal delay={0.35} className="lg:col-span-3">
            <p className="text-[var(--color-fg-dim)] leading-relaxed border-l border-[var(--color-primary)] pl-5">
              Field-tested opinions and benchmarks from a team that ships an AI screener every week.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Featured post ── */}
      {feature && (
        <section className="max-w-7xl mx-auto px-5 py-8">
          <Reveal>
            <Link to={`/blog/${feature.slug}`} className="group tile grid md:grid-cols-12 overflow-hidden">
              {feature.coverImage && (
                <div className="md:col-span-7 overflow-hidden md:border-r border-[var(--color-border)] bg-[var(--color-bg-2)] aspect-[16/10] md:aspect-auto">
                  <img src={feature.coverImage} alt={feature.title} loading="eager" className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"/>
                </div>
              )}
              <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)] font-mono">
                  <span className="chip">Featured</span>
                  <span>{feature.category}</span>
                  <span>·</span>
                  <span>{feature.readTime}</span>
                </div>
                <h2 className="mt-6 display-md text-[var(--color-fg)]">{feature.title}</h2>
                <p className="mt-5 text-[var(--color-fg-dim)] leading-relaxed">{feature.excerpt}</p>
                <div className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-[var(--color-fg)]">
                  <span className="w-11 h-11 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                    <ArrowUpRight size={18}/>
                  </span>
                  Read the article
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ── Grid ── */}
      <section className="max-w-7xl mx-auto px-5 pt-16 pb-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="display-md">All posts</h2>
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-muted)]">{posts.length} articles</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.07}>
              <Link to={`/blog/${p.slug}`} className="group block h-full">
                <Spotlight className="tile h-full flex flex-col">
                  {p.coverImage && (
                    <div className="overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-2)] aspect-[16/9]">
                      <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"/>
                    </div>
                  )}
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)] font-mono">
                      <span className="text-[var(--color-primary-2)]">{p.category}</span>
                      <span>·</span>
                      <span>{p.readTime}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--color-fg)] leading-snug tracking-[-0.03em] group-hover:text-[var(--color-primary-2)] transition">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm text-[var(--color-fg-dim)] leading-relaxed line-clamp-3 flex-1">{p.excerpt}</p>
                    <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-primary-2)]">
                      Read <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </div>
                  </div>
                </Spotlight>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
