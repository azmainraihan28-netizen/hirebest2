import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eyebrow } from './motion/primitives'

export type FAQItem = { q: string; a: string }

export default function FAQ({ items, title = 'Frequently asked questions' }: { items: FAQItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="max-w-4xl mx-auto px-5 py-24">
      <Eyebrow>FAQ</Eyebrow>
      <h2 className="display-md mt-5 mb-10">{title}</h2>
      <div className="border-t border-[var(--color-border)]">
        {items.map((it, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="border-b border-[var(--color-border)]">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-6 py-5 text-left group"
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[var(--color-muted-2)] tabular">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-[-0.03em] text-[var(--color-fg)] group-hover:text-[var(--color-primary-2)] transition">{it.q}</span>
                </span>
                <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition ${isOpen ? 'bg-[var(--color-primary)] border-transparent text-white rotate-45' : 'border-[var(--color-border-strong)] text-[var(--color-muted)]'}`}>
                  <Plus size={15}/>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5 pl-9 pr-10 text-[var(--color-fg-dim)] text-sm leading-relaxed">{it.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
