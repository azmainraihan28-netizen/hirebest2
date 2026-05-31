import { supabase } from './supabase'

export type Screening = {
  id: string
  user_id: string
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

export async function createScreening(name: string, jd: string): Promise<Screening | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('screenings').insert({
    user_id: user.id, name, jd,
  }).select('*').single()
  if (error) { console.error(error); return null }
  return data as Screening
}

export async function listCandidates(screeningId: string): Promise<Candidate[]> {
  const { data } = await supabase.from('candidates')
    .select('*').eq('screening_id', screeningId).order('score', { ascending: false })
  return (data ?? []) as Candidate[]
}

export async function insertCandidate(c: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate | null> {
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

export async function deleteScreening(id: string) {
  await supabase.from('screenings').delete().eq('id', id)
}
