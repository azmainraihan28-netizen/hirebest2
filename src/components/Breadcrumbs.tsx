import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useSchema, breadcrumb } from '../lib/schema'

export type Crumb = { name: string; href?: string }

export default function Breadcrumbs({ trail, schemaId = 'breadcrumb' }: { trail: Crumb[]; schemaId?: string }) {
  const { pathname } = useLocation()
  const full = [{ name: 'Home', href: '/' }, ...trail]
  // The last crumb is the current page (its URL is this page, not the homepage);
  // a middle crumb with no page of its own has no URL to point at, so it stays out of the schema.
  const schemaTrail = full.flatMap((c, i) => {
    const href = c.href ?? (i === full.length - 1 ? pathname : null)
    return href ? [{ name: c.name, url: `https://hirebest.online${href}` }] : []
  })
  useSchema(schemaId, breadcrumb(schemaTrail))

  return (
    <nav aria-label="Breadcrumb" className="relative z-10 max-w-7xl mx-auto px-5 pt-8">
      <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {full.map((c, i) => {
          const last = i === full.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i === 0 && <Home size={11}/>}
              {last || !c.href
                ? <span className="text-[var(--color-fg)] font-medium truncate max-w-[220px]">{c.name}</span>
                : <Link to={c.href} className="hover:text-[var(--color-fg)] transition">{c.name}</Link>
              }
              {!last && <ChevronRight size={11} className="opacity-50"/>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
