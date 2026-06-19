import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type FAQItem = { q: string; a: string }

export default function FAQ({ items, title = 'Frequently asked questions' }: { items: FAQItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="text-3xl md:text-4xl font-bold text-center mb-10"
      >
        {title}
      </motion.h2>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-3"
      >
        {items.map((it, i) => {
          const isOpen = open === i
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
              }}
              className="card overflow-hidden"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-[var(--color-fg)]">{it.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { type: 'spring', stiffness: 220, damping: 28 }, opacity: { duration: 0.2 } }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-[var(--color-muted)] text-sm leading-relaxed">{it.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
