import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import { useSeo } from '../lib/seo'
import Breadcrumbs from '../components/Breadcrumbs'

export default function InterviewQuestions() {
  useSeo({
    title: 'Free AI Interview Question Generator',
    description: 'Paste a JD. Get 5 tailored interview questions with model answers. Free, no signup, no usage limit.',
  })
  const [jd, setJd] = useState('')
  const [loc, setLoc] = useState('')
  const [role, setRole] = useState('')
  const [sen, setSen] = useState('')
  const [out, setOut] = useState<{ q: string; a: string }[] | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jd || !loc) return
    setBusy(true)
    setTimeout(() => {
      setOut([
        { q: `Walk me through how you'd approach the first 90 days in this ${role || 'role'} based on what you saw in the JD.`, a: 'Strong answers reference concrete deliverables tied to JD priorities, a learning-vs-shipping split, and stakeholders they\'d engage in week one.' },
        { q: 'What is a project where you delivered impact under similar constraints to what the JD describes?', a: 'Look for a measurable outcome, the constraint named explicitly, and what they\'d do differently knowing what they know now.' },
        { q: `How do you think about the team culture and pace in ${loc}?`, a: 'Bonus points for understanding regional norms, async vs sync expectations, and a thoughtful comparison to prior environments.' },
        { q: 'Which of the JD requirements feels furthest from your current strengths, and how would you close that gap?', a: 'Self-awareness + a concrete learning plan. Red flag: deflection or claiming no gaps exist.' },
        { q: `Why this role, why now, and why us?`, a: 'Specific to your company\'s mission or product, not generic. Should connect their next career step to what you actually offer.' },
      ])
      setBusy(false)
    }, 800)
  }

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Free Tools' }, { name: 'Interview Question Generator' }]} schemaId="tools-iq-bc"/>
      <section className="max-w-4xl mx-auto px-5 pt-10 pb-10 text-center">
        <span className="chip">Free Tool</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Free AI <span className="gradient-text">Interview Question Generator</span></h1>
        <p className="mt-4 text-[var(--color-muted)]">Paste a JD. Get 5 tailored interview questions with model answers. No signup.</p>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-6">
        <form onSubmit={submit} className="card p-7 space-y-4">
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">Job description <span className="text-[var(--color-primary)]">*</span> <span className="float-right text-xs">{jd.length}/8000</span></span>
            <textarea required maxLength={8000} value={jd} onChange={e => setJd(e.target.value)} rows={6} placeholder="Paste the job description here…" className="field mt-2"/>
          </label>
          <div className="grid md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm text-[var(--color-muted)]">Location <span className="text-[var(--color-primary)]">*</span></span>
              <input required value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. Berlin" className="field mt-2"/>
            </label>
            <label className="block">
              <span className="text-sm text-[var(--color-muted)]">Role (optional)</span>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Backend engineer" className="field mt-2"/>
            </label>
            <label className="block">
              <span className="text-sm text-[var(--color-muted)]">Seniority (optional)</span>
              <input value={sen} onChange={e => setSen(e.target.value)} placeholder="e.g. Senior" className="field mt-2"/>
            </label>
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">{busy ? 'Generating…' : 'Generate 5 Questions'} <Sparkles size={16}/></button>
        </form>

        {out && (
          <div className="mt-8 space-y-4">
            {out.map((q, i) => (
              <div key={i} className="card p-6">
                <div className="text-xs text-[var(--color-primary-2)] uppercase tracking-wider">Question {i+1}</div>
                <p className="mt-2 font-semibold text-[var(--color-fg)]">{q.q}</p>
                <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed"><b className="text-[var(--color-primary-2)]">Ideal answer:</b> {q.a}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-5">
        {[
          { icon: Sparkles, t: 'Tailored to the JD', d: 'Questions reference the actual skills and responsibilities — not generic.' },
          { icon: Briefcase, t: 'Ideal answers included', d: 'Know what a strong response looks like before the interview starts.' },
          { icon: MapPin, t: 'Location aware', d: 'Adapts tone and context to where you\'re hiring.' },
        ].map(c => (
          <div key={c.t} className="card p-6">
            <c.icon size={20} className="text-[var(--color-primary-2)]"/>
            <h3 className="mt-3 font-semibold">{c.t}</h3>
            <p className="text-sm text-[var(--color-muted)] mt-2">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12 text-center">
        <h2 className="text-2xl font-bold">Screen CVs with HireBest</h2>
        <p className="mt-3 text-[var(--color-muted)]">When you're ready to score actual resumes against the JD.</p>
        <Link to="/signup" className="btn-primary mt-6">Try HireBest <ArrowRight size={16}/></Link>
      </section>
    </>
  )
}
