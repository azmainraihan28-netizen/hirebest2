import { supabase } from './supabase'

export type Screening = {
  id: string
  user_id: string
  org_id: string | null
  name: string
  jd: string
  created_at: string
}

export type InterviewQuestion = {
  q: string
  why: string
  tag: 'Strength Validation' | 'Skill Gap' | 'Experience Probe' | 'Culture Fit' | 'Behavioral'
}

export type Candidate = {
  id: string
  screening_id: string
  file_name: string | null
  name: string | null
  email: string | null
  experience_years: number | null
  skills: string[] | null
  score: number
  verdict: 'Fit' | 'Maybe' | 'Skip'
  summary: string | null
  strengths: string[] | null
  gaps: string[] | null
  questions: InterviewQuestion[] | null
  status: 'pending' | 'shortlisted' | 'rejected'
  status_email_sent: boolean
  created_at: string
}

export async function listScreenings(limit = 30): Promise<Screening[]> {
  const { data } = await supabase.from('screenings')
    .select('*').order('created_at', { ascending: false }).limit(limit)
  return (data ?? []) as Screening[]
}

export async function getScreening(id: string): Promise<Screening | null> {
  const { data } = await supabase.from('screenings').select('*').eq('id', id).maybeSingle()
  return (data as Screening | null) ?? null
}

export async function createScreening(name: string, jd: string, orgId?: string | null): Promise<Screening | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('screenings').insert({
    user_id: user.id, name, jd, org_id: orgId ?? null,
  }).select('*').single()
  if (error) { console.error(error); return null }
  return data as Screening
}

export async function inferScreeningName(jd: string, timeoutMs = 6000): Promise<string> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch('/api/infer-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd }),
      signal: controller.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json().catch(() => ({})) as { name?: string }
    return typeof data.name === 'string' ? data.name.trim() : ''
  } catch {
    return ''
  }
}

export async function listCandidates(screeningId: string): Promise<Candidate[]> {
  const { data } = await supabase.from('candidates')
    .select('*').eq('screening_id', screeningId).order('score', { ascending: false })
  return (data ?? []) as Candidate[]
}

export async function insertCandidate(c: Omit<Candidate, 'id' | 'created_at' | 'status' | 'status_email_sent'>): Promise<Candidate | null> {
  const { data, error } = await supabase.from('candidates').insert(c).select('*').single()
  if (error) { console.error(error); return null }
  return data as Candidate
}

export async function countMyCandidates(): Promise<number> {
  const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function regenerateQuestions(candidateId: string, questions: InterviewQuestion[]) {
  await supabase.from('candidates').update({ questions }).eq('id', candidateId)
}

/**
 * Sets a candidate's manual decision status and, the first time a decision is made,
 * sends the corresponding interview-invite/rejection email (status_email_sent guards against resends).
 */
export async function setCandidateStatus(candidate: Candidate, status: 'shortlisted' | 'rejected'): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('candidates').update({ status }).eq('id', candidate.id)
  if (error) return { ok: false, error: error.message }
  if (candidate.status_email_sent || !candidate.email) return { ok: true }

  const res = await fetch('/api/send-decision-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: candidate.id, email: candidate.email, name: candidate.name, status }),
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: `Email failed: ${t.slice(0, 150)}` }
  }
  return { ok: true }
}

export async function deleteScreening(id: string) {
  await supabase.from('screenings').delete().eq('id', id)
}
