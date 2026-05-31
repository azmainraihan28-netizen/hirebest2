import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useSchema, breadcrumb } from '../lib/schema'

export type Crumb = { name: string; href?: string }

export default function Breadcrumbs({ trail, schemaId = 'breadcrumb' }: { trail: Crumb[]; schemaId?: string }) {
  const full = [{ name: 'Home', href: '/' }, ...trail]
  useSchema(schemaId, breadcrumb(full.map(c => ({ name: c.name, url: `https://hirebest.online${c.href ?? ''}` }))))

  return (
    <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-5 pt-6">
      <ol className="flex items-center flex-wrap gap-1 text-xs text-[var(--color-muted)]">
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
