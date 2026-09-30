import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Briefcase, ArrowRight, Clock, FileText, Users, Shuffle } from 'lucide-react'
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
  { q: 'Is this interview question generator really free?', a: 'Yes. No signup and no credit card. Paste any job description and generate tailored interview questions — up to 20 generations per hour per person to keep the tool free for everyone.' },
  { q: 'What types of interview questions does the AI generate?', a: 'The generator produces a mix of behavioral, situational, and role-specific questions based on the skills, responsibilities, and requirements in your job description. Each question includes an ideal answer so you know what to listen for.' },
  { q: 'Can I use this for any role or industry?', a: 'Yes. The AI reads your specific job description and tailors questions accordingly — whether you are hiring a software engineer, marketing manager, product designer, data analyst, or any other role in any industry.' },
  { q: 'How is this different from a generic list of interview questions?', a: 'Generic lists give you the same 10 questions for every role. This tool reads your actual JD and generates questions that reference the specific skills, tools, and responsibilities you listed — so the interview is relevant to what the hire will actually do.' },
  { q: 'Is there a random interview question generator?', a: 'Yes — use the "Random interview question" button on this page. It pulls a question from a bank of common behavioral, situational, and role-agnostic interview questions, each with what to listen for. It is handy for practice, warm-ups, or when you do not have a job description yet.' },
  { q: 'How do I create good interview questions?', a: 'Start from the job description: list the 3–5 skills the role truly needs, then write one question that asks for past evidence of each ("Tell me about a time…") and one realistic scenario from the job. Decide in advance what a strong answer includes. The AI generator above does exactly this from your JD in seconds.' },
  { q: 'Do I need to create an account to use the interview question generator?', a: 'No. The tool works instantly with no signup. If you want to screen CVs against the same JD, HireBest offers a 14-day free trial for AI resume screening.' },
]

const faqSchema = faqPage(faqs)

const popularRoles = [
  { title: '40 Marketing Manager Interview Questions', slug: 'marketing-manager-interview-questions', desc: 'Strategy, campaigns, analytics, leadership — with what to listen for.' },
  { title: '50 Software Engineer Interview Questions', slug: 'software-engineer-interview-questions', desc: 'Technical, behavioral, system design, situational — with scoring rubric.' },
  { title: '35 Backend Developer Interview Questions', slug: 'backend-developer-interview-questions', desc: 'APIs, databases, concurrency, reliability, and system design.' },
  { title: '35 Frontend Developer Interview Questions', slug: 'frontend-developer-interview-questions', desc: 'JavaScript, React, CSS, performance, and accessibility.' },
  { title: '30 Behavioral Interview Questions for Software Engineers', slug: 'behavioral-interview-questions-for-software-engineers', desc: 'Ownership, conflict, failure — plus a scoring rubric.' },
]

// Role-agnostic bank for the random question button (no JD needed).
const randomBank: { q: string; a: string; cat: string }[] = [
  { cat: 'Behavioral', q: 'Tell me about a time you missed a deadline. What happened?', a: 'Listen for when they saw it coming and when they told people. Early warning is the skill.' },
  { cat: 'Behavioral', q: 'Describe the hardest feedback you have received and what you changed.', a: 'A specific piece of feedback and a specific behaviour change. Defensiveness is a red flag.' },
  { cat: 'Behavioral', q: 'Tell me about a time you disagreed with your manager.', a: 'Evidence over opinion, a respectful tone, and willingness to disagree and commit.' },
  { cat: 'Behavioral', q: 'Walk me through a project you are proud of. What was your part?', a: 'Their personal contribution and a real outcome — not just what the team did.' },
  { cat: 'Behavioral', q: 'Tell me about a mistake that had real consequences.', a: 'A real mistake owned plainly, plus what they do differently now.' },
  { cat: 'Behavioral', q: 'Describe a time you had to learn something new very quickly.', a: 'How they learned, who they asked, and how they checked they got it right.' },
  { cat: 'Behavioral', q: 'Tell me about a time you helped a struggling teammate.', a: 'Support that respected the teammate, rather than taking over their work.' },
  { cat: 'Behavioral', q: 'Describe a time you had to deliver bad news to a stakeholder.', a: 'Delivered early and directly, with options or a plan attached.' },
  { cat: 'Situational', q: 'You have three urgent requests from three managers and time for one. What do you do?', a: 'Clarifies real priority with the people involved instead of silently guessing.' },
  { cat: 'Situational', q: 'You notice a colleague took credit for your work in a meeting. How do you handle it?', a: 'A calm, private conversation first; focus on the work, not the grudge.' },
  { cat: 'Situational', q: 'Halfway through a project, the requirements change completely. What do you do?', a: 'Re-confirms goals, re-plans scope and timeline, and communicates the impact openly.' },
  { cat: 'Situational', q: 'A customer is angry about something that was not your fault. How do you respond?', a: 'Acknowledges the frustration, owns the next step, and avoids blaming others.' },
  { cat: 'Situational', q: 'You realise a report you already sent to leadership has an error. What now?', a: 'Corrects it quickly and transparently, with the impact explained.' },
  { cat: 'Situational', q: 'Your first week: no one has time to onboard you. How do you get productive?', a: 'Self-directed learning, finding the right people, and shipping something small early.' },
  { cat: 'Motivation', q: 'Why do you want this role, and why now?', a: 'Specific to the company and role, not a generic answer that fits any job.' },
  { cat: 'Motivation', q: 'What kind of work gives you energy, and what drains you?', a: 'An honest answer you can compare with what the job really involves.' },
  { cat: 'Motivation', q: 'Where do you want to be in three years?', a: 'Ambition that fits what this role can realistically offer.' },
  { cat: 'Motivation', q: 'Why are you leaving your current job?', a: 'Honest reasons without bitterness, which this role actually addresses.' },
  { cat: 'Motivation', q: 'What would make you leave this job in a year?', a: 'A candid answer tells you what to watch for as their manager.' },
  { cat: 'Skills', q: 'Walk me through how you would approach your first 90 days in this role.', a: 'Learning before changing, early quick wins, and the right stakeholders named.' },
  { cat: 'Skills', q: 'How do you decide what to work on first when everything feels important?', a: 'A clear method tied to impact and deadlines, not just whoever shouts loudest.' },
  { cat: 'Skills', q: 'Tell me about a decision you made with incomplete information.', a: 'How they reduced risk and how they would reverse the decision if wrong.' },
  { cat: 'Skills', q: 'How do you measure whether your work was successful?', a: 'Concrete outcomes and metrics rather than activity.' },
  { cat: 'Skills', q: 'Explain something complex from your field as if I were new to it.', a: 'Plain language, a good analogy, and checking for understanding.' },
]

export default function InterviewQuestions() {
  useSeo({
    title: 'AI Interview Questions Generator — Free, From Any Job Description',
    description: 'Free AI interview question generator: paste a job description and get 5 tailored interview questions with ideal answers in seconds. Plus a random interview question generator. No signup.',
  })
  useSchema('tools-iq-howto', howToSchema)
  useSchema('tools-iq-faq', faqSchema)
  const [jd, setJd] = useState('')
  const [loc, setLoc] = useState('')
  const [role, setRole] = useState('')
  const [sen, setSen] = useState('')
  const [out, setOut] = useState<{ q: string; a: string }[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rand, setRand] = useState<(typeof randomBank)[number] | null>(null)

  const nextRandom = () => {
    let pick = randomBank[Math.floor(Math.random() * randomBank.length)]
    if (rand && pick.q === rand.q) pick = randomBank[(randomBank.indexOf(pick) + 1) % randomBank.length]
    setRand(pick)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jd || !loc) return
    setBusy(true)
    setErr('')
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'interview-questions', jd, location: loc, role, seniority: sen }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || !Array.isArray(data.questions)) throw new Error(data.error || 'Something went wrong. Please try again.')
      setOut(data.questions)
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Breadcrumbs trail={[{ name: 'Free Tools' }, { name: 'AI Interview Question Generator' }]} schemaId="tools-iq-bc"/>
      <section className="max-w-4xl mx-auto px-5 pt-10 pb-10 text-center">
        <span className="chip">Free Tool</span>
        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Free AI <span className="gradient-text">Interview Questions Generator</span></h1>
        <p className="mt-4 text-lg text-[var(--color-muted)]">Paste any job description and the AI writes 5 interview questions for that exact role — each with what a strong answer sounds like. No signup required.</p>
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

        {err && <p role="alert" className="mt-4 text-sm text-red-500">{err}</p>}

        {out && (
          <div className="mt-8 space-y-4" aria-live="polite">
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

      <section className="max-w-3xl mx-auto px-5 py-10">
        <div className="card p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Random interview question generator</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">No job description yet? Pull a random behavioral, situational, or motivation question — for practice or warm-ups.</p>
            </div>
            <button type="button" onClick={nextRandom} className="btn-ghost">{rand ? 'Another one' : 'Random question'} <Shuffle size={16}/></button>
          </div>
          {rand && (
            <div className="mt-5 border-t border-[var(--color-border)] pt-5" aria-live="polite">
              <div className="text-xs text-[var(--color-primary-2)] uppercase tracking-wider">{rand.cat}</div>
              <p className="mt-2 font-semibold text-[var(--color-fg)]">{rand.q}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]"><b className="text-[var(--color-primary-2)]">Listen for:</b> {rand.a}</p>
            </div>
          )}
        </div>
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

      <section className="max-w-3xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-bold mb-4">Interview question creation: how to write good questions yourself</h2>
        <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
          <p>The generator follows the same method a good interviewer uses. If you want to create interview questions by hand, work through these steps:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><b className="text-[var(--color-fg)]">Pick 3–5 must-have skills</b> from the job description — the things the person truly cannot do the job without.</li>
            <li><b className="text-[var(--color-fg)]">Ask for past evidence of each one.</b> "Tell me about a time you…" beats "How would you…" because it asks what they did, not what they know to say.</li>
            <li><b className="text-[var(--color-fg)]">Add one realistic scenario</b> from the actual job, so you see how they think on something you care about.</li>
            <li><b className="text-[var(--color-fg)]">Write down what a strong answer includes</b> before the interview, so every interviewer scores the same way.</li>
            <li><b className="text-[var(--color-fg)]">Plan one follow-up per question</b> — "What did you personally do?" or "What would you change now?" is where the real signal is.</li>
          </ol>
          <p>Ask every candidate for the role the same core questions, and score answers on a simple 1–4 scale. Consistency is what makes interviews fair and predictive.</p>
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
