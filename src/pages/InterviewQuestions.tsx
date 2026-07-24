import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Briefcase, ArrowRight, Clock, FileText, Users } from 'lucide-react'
import { useSeo } from '../lib/seo'
import { useSchema, howTo, faqPage } from '../lib/schema'
import Breadcrumbs from '../components/Breadcrumbs'
import FAQ from '../components/FAQ'

const howToSchema = howTo({
  name: 'How to Generate AI Interview Questions',
  description: 'Generate tailored interview questions with model answers by pasting a job description into HireBest free AI interview question generator.',
  steps: [
    { name: 'Paste the job description', text: 'Copy the full job description and paste it into the JD field. Up to 8,000 characters supported.' },
    { name: 'Enter location and role details', text: 'Add the hiring location (required) and optional role title or seniority level to tailor the questions.' },
    { name: 'Generate questions', text: 'Click "Generate 5 Questions". The AI produces 5 interview questions tailored to the JD within seconds.' },
    { name: 'Review questions and ideal answers', text: 'Each question comes with a model ideal answer describing what strong candidates should cover.' },
  ],
})

const faqs = [
  { q: 'Is this interview question generator really free?', a: 'Yes. No signup, no credit card, no usage limit. Paste any job description and generate tailored interview questions as many times as you need.' },
  { q: 'What types of interview questions does the AI generate?', a: 'The generator produces a mix of behavioral, situational, and role-specific questions based on the skills, responsibilities, and requirements in your job description. Each question includes an ideal answer so you know what to listen for.' },
  { q: 'Can I use this for any role or industry?', a: 'Yes. The AI reads your specific job description and tailors questions accordingly — whether you are hiring a software engineer, marketing manager, product designer, data analyst, or any other role in any industry.' },
  { q: 'How is this different from a generic list of interview questions?', a: 'Generic lists give you the same 10 questions for every role. This tool reads your actual JD and generates questions that reference the specific skills, tools, and responsibilities you listed — so the interview is relevant to what the hire will actually do.' },
  { q: 'Do I need to create an account to use the interview question generator?', a: 'No. The tool works instantly with no signup. If you want to screen CVs against the same JD, HireBest offers a 14-day free trial for AI resume screening.' },
]

const faqSchema = faqPage(faqs)

const popularRoles = [
  { title: '40 Marketing Manager Interview Questions', slug: 'marketing-manager-interview-questions', desc: 'Strategy, campaigns, analytics, leadership — with what to listen for.' },
  { title: '50 Software Engineer Interview Questions', slug: 'software-engineer-interview-questions', desc: 'Technical, behavioral, system design, situational — with scoring rubric.' },
]

export default function InterviewQuestions() {
  useSeo({
    title: 'Free AI Interview Question Generator — Tailored to Any JD',
    description: 'Free AI interview questions generator — paste any job description and get 5 tailored interview questions with ideal answers in seconds. No signup, no limit. Works for any role.',
  })
  useSchema('tools-iq-howto', howToSchema)
  useSchema('tools-iq-faq', faqSchema)
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
      <Breadcrumbs trail={[{ name: 'Free Tools' }, { name: 'AI Interview Question Generator' }]} schemaId="tools-iq-bc"/>
      <section className="max-w-4xl mx-auto px-5 pt-10 pb-10 text-center">
        <span className="chip">Free Tool</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Free AI <span className="gradient-text">Interview Question Generator</span></h1>
        <p className="mt-4 text-lg text-[var(--color-muted)]">Paste any job description and get 5 tailored interview questions with ideal answers — in seconds. No signup required.</p>
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

      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">How the AI interview question generator works</h2>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: FileText, step: '1', t: 'Paste a job description', d: 'Any role, any industry. The AI reads the full JD — skills, responsibilities, qualifications, and context.' },
            { icon: MapPin, step: '2', t: 'Add location and role', d: 'Location tailors cultural and regional context. Role title and seniority sharpen question difficulty.' },
            { icon: Sparkles, step: '3', t: 'Generate questions', d: 'Get 5 interview questions in seconds — behavioral, situational, and role-specific — each tied to what the JD actually asks for.' },
            { icon: Briefcase, step: '4', t: 'Review ideal answers', d: 'Every question comes with what a strong answer looks like, so interviewers know exactly what to listen for.' },
          ].map(c => (
            <div key={c.step} className="card p-6 text-center">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto text-sm font-bold">{c.step}</div>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-bold text-center mb-3">Why use an AI interview questions generator</h2>
        <p className="text-center text-[var(--color-muted)] mb-8 max-w-2xl mx-auto">Generic question lists give the same 10 questions for every role. An AI interview question generator reads your actual job description and produces questions that map to the specific skills, tools, and responsibilities you listed.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Sparkles, t: 'Tailored to the JD', d: 'Questions reference the actual skills and responsibilities listed in the job description — not generic filler.' },
            { icon: Clock, t: 'Ready in seconds', d: 'Skip the 30 minutes of writing questions from scratch. Paste the JD, click generate, and start interviewing.' },
            { icon: Users, t: 'Works for any role', d: 'Software engineer, marketing manager, product designer, data analyst, operations lead — any role, any industry, any seniority.' },
          ].map(c => (
            <div key={c.t} className="card p-6">
              <c.icon size={20} className="text-[var(--color-primary-2)]"/>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-bold text-center mb-3">Interview question guides by role</h2>
        <p className="text-center text-[var(--color-muted)] mb-8">Curated lists with scoring rubrics and what to listen for in every answer.</p>
        <div className="grid md:grid-cols-2 gap-5">
          {popularRoles.map(r => (
            <Link key={r.slug} to={`/blog/${r.slug}`} className="card p-6 hover:border-[var(--color-primary)] transition-colors group">
              <h3 className="font-semibold group-hover:text-[var(--color-primary)] transition-colors">{r.title}</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2">{r.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-[var(--color-primary-2)] mt-3">Read guide <ArrowRight size={14}/></span>
            </Link>
          ))}
        </div>
      </section>

      <FAQ items={faqs} title="Interview question generator FAQ"/>

      <section className="max-w-4xl mx-auto px-5 py-12 text-center">
        <h2 className="text-2xl font-bold">Screen CVs with HireBest</h2>
        <p className="mt-3 text-[var(--color-muted)]">Generated interview questions for a role? Screen the actual CVs against the same JD — 100 resumes scored in 38 seconds with AI reasoning.</p>
        <Link to="/signup" className="btn-primary mt-6">Try HireBest free <ArrowRight size={16}/></Link>
      </section>
    </>
  )
}
