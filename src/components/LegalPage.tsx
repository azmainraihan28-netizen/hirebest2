import { ReactNode } from 'react'

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <span className="chip">Legal</span>
      <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-[var(--color-muted)]">{updated}</p>
      <div className="prose-blog mt-10">{children}</div>
    </section>
  )
}
