import { useEffect } from 'react'

// Inject one or more JSON-LD <script type="application/ld+json"> blocks into <head>.
// Each block gets a stable id so re-renders replace (not duplicate) the block.

type SchemaBlock = Record<string, any>

export function useSchema(id: string, schema: SchemaBlock | SchemaBlock[] | null) {
  useEffect(() => {
    const scriptId = `ld-${id}`
    // Remove any previous instance first to prevent duplicates
    document.head.querySelectorAll(`script[data-ld-id="${id}"]`).forEach(el => el.remove())
    if (!schema) return

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = scriptId
    el.setAttribute('data-ld-id', id)
    el.textContent = JSON.stringify(schema)
    document.head.appendChild(el)

    return () => { el.remove() }
  }, [id, JSON.stringify(schema)])
}

// ---------- Common builders ----------

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HireBest',
  url: 'https://hirebest.online',
  logo: 'https://hirebest.online/favicon-256.png',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@hirebest.online',
  },
})

export const softwareApplication = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HireBest',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AI resume screener that scores 100 CVs in 38 seconds with JD-cited reasoning.',
  url: 'https://hirebest.online',
  offers: {
    '@type': 'Offer',
    price: '400',
    priceCurrency: 'USD',
  },
})

export const faqPage = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(it => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
})

export const article = (p: { title: string; description: string; slug: string; date: string; author?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: p.title,
  description: p.description,
  datePublished: p.date,
  author: { '@type': 'Organization', name: p.author ?? 'HireBest Team' },
  publisher: {
    '@type': 'Organization',
    name: 'HireBest',
    logo: { '@type': 'ImageObject', url: 'https://hirebest.online/favicon-256.png' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `https://hirebest.online/blog/${p.slug}` },
})

export const breadcrumb = (trail: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: t.url,
  })),
})

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HireBest',
  url: 'https://hirebest.online',
  description: 'AI resume screener that scores 100 CVs in 38 seconds with JD-cited reasoning.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://hirebest.online/tools/interview-questions?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
})

export const howTo = (p: { name: string; description: string; steps: { name: string; text: string }[] }) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: p.name,
  description: p.description,
  step: p.steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
})
