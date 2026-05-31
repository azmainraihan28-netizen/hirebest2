import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'

type Row = { f: string; us: string; them: string }
type Props = {
  competitor: string
  headline: string
  intro: string
  forUs: string[]
  forCompetitor: string[]
  rows: Row[]
  cta: string
}

export default function VsPage({ competitor, headline, intro, forUs, forCompetitor, rows, cta }: Props) {
  useSeo({ title: headline, description: intro })
  return (
    <>
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-10 text-center">
        <span className="chip">Comparison</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">{headline}</h1>
        <p className="mt-5 text-[var(--color-muted)]">{intro}</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Try HireBest Free <ArrowRight size={16}/></Link>
          <Link to="/pricing" className="btn-ghost">See pricing</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-7 border-[var(--color-primary)]">
            <p className="chip">Pick HireBest if</p>
            <ul className="mt-5 space-y-3">
              {forUs.map(p => <li key={p} className="text-sm text-[var(--color-fg)] flex gap-2"><Check size={16} className="text-[var(--color-primary)] mt-0.5 shrink-0"/>{p}</li>)}
            </ul>
          </div>
          <div className="card p-7">
            <p className="chip">Pick {competitor} if</p>
            <ul className="mt-5 space-y-3">
              {forCompetitor.map(p => <li key={p} className="text-sm text-[var(--color-fg)] flex gap-2"><Check size={16} className="text-[var(--color-muted)] mt-0.5 shrink-0"/>{p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Side-by-side</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-muted)] font-medium">Feature</th>
                <th className="text-left p-4 font-semibold text-[var(--color-primary-2)]">HireBest</th>
                <th className="text-left p-4 font-semibold">{competitor}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.f} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4 text-[var(--color-muted)]">{r.f}</td>
                  <td className="p-4 text-white">{r.us}</td>
                  <td className="p-4 text-[var(--color-muted)]">{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="card p-10">
          <h3 className="text-2xl md:text-3xl font-bold">{cta.split('.')[0]}.</h3>
          <p className="mt-3 text-[var(--color-muted)]">{cta.split('.').slice(1).join('.').trim()}</p>
          <Link to="/signup" className="btn-primary mt-6">Start Free <ArrowRight size={16}/></Link>
        </div>
      </section>
    </>
  )
}
