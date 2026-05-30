import { useState } from 'react'
import { Sparkles, Briefcase, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

type ScoreResult = {
  score: number
  verdict: 'Fit' | 'Maybe' | 'Skip'
  summary: string
  strengths: string[]
  gaps: string[]
  questions: string[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const [jd, setJd] = useState('')
  const [cv, setCv] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)

  const score = async () => {
    if (!jd.trim() || !cv.trim()) return
    setBusy(true); setErr(null); setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({ jd, cv }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setErr(e.message ?? 'Failed to score')
    } finally {
      setBusy(false)
    }
  }

  const verdictColor = (v: string) =>
    v === 'Fit' ? 'text-green-400 bg-green-500/10 border-green-500/30'
    : v === 'Maybe' ? 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30'
    : 'text-red-300 bg-red-500/10 border-red-500/30'

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="chip">Dashboard</span>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}.</h1>
          <p className="mt-2 text-[var(--color-muted)]">Paste a JD and a candidate CV — get a score with reasoning in seconds.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><Briefcase size={16} className="text-[var(--color-primary-2)]"/>Job Description</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} rows={14} placeholder="Paste the full JD here…" className="field"/>
          <div className="text-xs text-[var(--color-muted)] mt-2">{jd.length} chars</div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><Sparkles size={16} className="text-[var(--color-primary-2)]"/>Candidate CV (text)</div>
          <textarea value={cv} onChange={e => setCv(e.target.value)} rows={14} placeholder="Paste the candidate's CV text here…" className="field"/>
          <div className="text-xs text-[var(--color-muted)] mt-2">{cv.length} chars · PDF upload coming soon</div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={score} disabled={busy || !jd.trim() || !cv.trim()} className="btn-primary px-8">
          {busy ? 'Scoring…' : <>Score this candidate <Sparkles size={16}/></>}
        </button>
      </div>

      {err && (
        <div className="mt-6 card p-5 border-red-500/40 text-red-300 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5"/><div>{err}</div>
        </div>
      )}

      {result && (
        <div className="mt-8 grid lg:grid-cols-3 gap-5">
          <div className="card p-7 text-center">
            <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Match Score</div>
            <div className="text-7xl font-extrabold gradient-text my-3">{result.score}</div>
            <div className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${verdictColor(result.verdict)}`}>{result.verdict}</div>
          </div>
          <div className="card p-7 lg:col-span-2">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{result.summary}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3 text-green-300">Strengths</h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">{result.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3 text-yellow-300">Gaps</h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">{result.gaps.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3 text-[var(--color-primary-2)]">Interview Questions</h3>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">{result.questions.map((s, i) => <li key={i}>{i+1}. {s}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  )
}
