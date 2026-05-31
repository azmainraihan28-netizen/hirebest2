import { useEffect } from 'react'

type Seo = {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  ogImageAlt?: string
  ogType?: 'website' | 'article' | 'product'
  noindex?: boolean
}

const DEFAULT_DESC = 'HireBest reads every CV against your job description, scores fit, surfaces missing skills, and writes interview questions — in the time it takes to brew coffee.'
const DEFAULT_ALT = 'HireBest — AI Resume Screener'
const BASE = 'https://hirebest.online'
const TWITTER_HANDLE = '@hirebest'

export function useSeo({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = '/og-card.png',
  ogImageAlt = DEFAULT_ALT,
  ogType = 'website',
  noindex = false,
}: Seo) {
  useEffect(() => {
    const fullTitle = title.includes('HireBest') ? title : `${title} · HireBest`
    const url = canonical ?? `${BASE}${location.pathname}`
    const imgUrl = ogImage.startsWith('http') ? ogImage : `${BASE}${ogImage}`

    document.title = fullTitle

    // Standard meta
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow')

    // Open Graph
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:image', imgUrl, true)
    setMeta('og:image:width', '1200', true)
    setMeta('og:image:height', '630', true)
    setMeta('og:image:alt', ogImageAlt, true)
    setMeta('og:url', url, true)
    setMeta('og:type', ogType, true)
    setMeta('og:site_name', 'HireBest', true)
    setMeta('og:locale', 'en_US', true)

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', imgUrl)
    setMeta('twitter:image:alt', ogImageAlt)
    setMeta('twitter:site', TWITTER_HANDLE)

    // Canonical
    setLink('canonical', url)
  }, [title, description, canonical, ogImage, ogImageAlt, ogType, noindex])
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
