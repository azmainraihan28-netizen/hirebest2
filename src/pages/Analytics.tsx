import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, Clock, Users, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Analytics() {
  useSeo({
    title: 'Hiring Analytics — Track screenings, fit ratio, missing skills',
    description: 'Track screening velocity, average fit ratio, and the most common missing skills across your hiring pipeline.',
  })
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Analytics' }]} schemaId="analytics-bc"/>
      <section className="max-w-5xl mx-auto px-5 pt-10 pb-10 text-center">
        <span className="chip">Analytics</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Hiring analytics that<br/><span className="gradient-text">actually move the needle</span></h1>
        <p className="mt-4 text-[var(--color-muted)] max-w-2xl mx-auto">Track screenings over time, average fit ratio, and most common missing skills — so you know which roles are bottlenecking your pipeline.</p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link to="/signup" className="btn-primary">Start Free <ArrowRight size={16}/></Link>
          <Link to="/pricing" className="btn-ghost">See plans</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Clock, n: '38s', l: 'avg batch time' },
            { icon: Users, n: '10k+', l: 'CVs / week' },
            { icon: BarChart3, n: '94%', l: 'recruiter agreement' },
            { icon: TrendingUp, n: '6×', l: 'faster shortlists' },
          ].map(s => (
            <div key={s.l} className="card p-6 text-center">
              <s.icon size={20} className="mx-auto text-[var(--color-primary-2)]"/>
              <div className="text-3xl font-extrabold gradient-text mt-3">{s.n}</div>
              <div className="text-xs text-[var(--color-muted)] mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Screening velocity', desc: 'See how many CVs your team is processing each week, broken down by role and recruiter.' },
            { title: 'Average fit ratio', desc: 'Know what percentage of incoming CVs actually match your JDs. High = good sourcing. Low = rework needed.' },
            { title: 'Missing skills heatmap', desc: 'Discover which skills keep showing up as gaps across candidates — a signal to either rewrite the JD or rebuild your sourcing channels.' },
            { title: 'Time-to-shortlist', desc: 'Track the median hours between JD posting and first shortlist — the metric most ATSes refuse to surface.' },
          ].map(c => (
            <div key={c.title} className="card p-7">
              <h3 className="text-lg font-semibold text-[var(--color-fg)]">{c.title}</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{c.desc}</p>
              <div className="mt-5 h-32 bg-[rgba(47,123,255,0.06)] rounded-lg border border-[var(--color-border)] flex items-end gap-1 p-3">
                {[40, 65, 50, 80, 60, 95, 70, 88, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-2)]" style={{ height: `${h}%` }}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-16 text-center">
        <h2 className="text-3xl font-bold">Available on Advanced & Custom plans</h2>
        <p className="mt-3 text-[var(--color-muted)]">Analytics ships with multi-user workspaces — see <Link to="/pricing" className="text-[var(--color-primary-2)] underline">Pricing</Link> for details.</p>
      </section>
    </>
  )
}
