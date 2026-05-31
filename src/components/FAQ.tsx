import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type FAQItem = { q: string; a: string }

export default function FAQ({ items, title = 'Frequently asked questions' }: { items: FAQItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{title}</h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-medium text-[var(--color-fg)]">{it.q}</span>
              <ChevronDown className={`transition ${open === i ? 'rotate-180' : ''}`} size={18} />
            </button>
            {open === i && <div className="px-5 pb-5 text-[var(--color-muted)] text-sm leading-relaxed">{it.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
