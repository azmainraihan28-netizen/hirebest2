import { supabase } from './supabase'

/**
 * Ids that scope every screening/candidate read to the signed-in user:
 * their own user id plus the orgs they are a member of. Screenings are never
 * queried unscoped — an admin account must not see customers' screenings in
 * its own dashboard, and RLS alone used to allow exactly that.
 */
async function myScope(): Promise<{ userId: string; orgIds: string[] } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('org_members').select('org_id').eq('user_id', user.id)
  const orgIds = Array.isArray(data) ? data.map((r: any) => r.org_id as string).filter(Boolean) : []
  return { userId: user.id, orgIds }
}

/** PostgREST `or=` filter matching screening rows this user may see. */
function scopeFilter(scope: { userId: string; orgIds: string[] }, column = 'org_id'): string {
  const parts = [`user_id.eq.${scope.userId}`]
  if (scope.orgIds.length) parts.push(`${column}.in.(${scope.orgIds.join(',')})`)
  return parts.join(',')
}

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
  const scope = await myScope()
  if (!scope) return []
  const { data } = await supabase.from('screenings')
    .select('*')
    .or(scopeFilter(scope))
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as Screening[]
}

export async function getScreening(id: string): Promise<Screening | null> {
  const scope = await myScope()
  if (!scope) return null
  const { data } = await supabase.from('screenings')
    .select('*')
    .eq('id', id)
    .or(scopeFilter(scope))
    .maybeSingle()
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
  // Only return candidates once the parent screening is confirmed in scope, so
  // a screening id belonging to somebody else yields nothing.
  const screening = await getScreening(screeningId)
  if (!screening) return []
  const { data } = await supabase.from('candidates')
    .select('*').eq('screening_id', screeningId).order('score', { ascending: false })
  return (data ?? []) as Candidate[]
}

export async function insertCandidate(c: Omit<Candidate, 'id' | 'created_at' | 'status' | 'status_email_sent'>): Promise<Candidate | null> {
  const { data, error } = await supabase.from('candidates').insert(c).select('*').single()
  if (error) { console.error(error); return null }
  return data as Candidate
}

/** Candidates the signed-in user screened (their own screenings only) — this is the quota meter. */
export async function countMyCandidates(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const { count } = await supabase.from('candidates')
    .select('screenings!inner(user_id)', { count: 'exact', head: true })
    .eq('screenings.user_id', user.id)
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, error: 'Not authenticated' }

  const res = await fetch('/api/send-decision-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ candidateId: candidate.id, email: candidate.email, name: candidate.name, status }),
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: `Email failed: ${t.slice(0, 150)}` }
  }
  return { ok: true }
}

export async function deleteScreening(id: string) {
  const scope = await myScope()
  if (!scope) return
  await supabase.from('screenings').delete().eq('id', id).or(scopeFilter(scope))
}
