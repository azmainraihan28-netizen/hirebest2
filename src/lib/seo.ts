import { useEffect } from 'react'

type Seo = {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

const DEFAULT_DESC = 'HireBest reads every CV against your job description, scores fit, surfaces missing skills, and writes interview questions — in the time it takes to brew coffee.'
const BASE = 'https://hirebest.online'

export function useSeo({ title, description = DEFAULT_DESC, canonical, ogImage = '/og-card.png', noindex = false }: Seo) {
  useEffect(() => {
    const fullTitle = title.includes('HireBest') ? title : `${title} · HireBest`
    document.title = fullTitle

    setMeta('description', description)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImage.startsWith('http') ? ogImage : `${BASE}${ogImage}`, true)
    setMeta('og:url', canonical ?? `${BASE}${location.pathname}`, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)

    setLink('canonical', canonical ?? `${BASE}${location.pathname}`)

    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow')
  }, [title, description, canonical, ogImage, noindex])
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
  el.content = content
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el) }
  el.href = href
}
