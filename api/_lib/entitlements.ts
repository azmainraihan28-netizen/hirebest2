// Plan entitlements on the server: who is calling, what their plan allows, and
// recording usage. The numbers live in SQL (plan_entitlements / quota_for in
// supabase/migrations/013_plan_entitlements.sql) so the app and API agree.

import crypto from 'crypto'
import type { VercelRequest } from '@vercel/node'
import type { SupabaseClient } from '@supabase/supabase-js'
import { authUser, BASE_URL } from './stripe.js'
import { sendEmail } from './notify.js'

export type Quota = {
  plan: string
  own_plan: string
  org_id: string | null
  active: boolean
  cv_limit: number | null // null = unlimited
  used: number
  period_start: string
  period_end: string
  job_slots: number | null
  active_jobs: number
  seats: number | null
  batch_cap: number
}

export const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, advanced: 2, lifetime: 3, retainer: 4 }
export const planAtLeast = (plan: string | null | undefined, min: keyof typeof PLAN_RANK) =>
  (PLAN_RANK[plan ?? 'free'] ?? 0) >= PLAN_RANK[min]

export const hashApiKey = (key: string) => crypto.createHash('sha256').update(key).digest('hex')

export type Caller = { userId: string; email: string | null; via: 'session' | 'api_key'; apiKeyId?: string }

/** Resolve the caller from `x-api-key` (Team+ API access) or a Supabase session bearer token. */
export async function resolveCaller(req: VercelRequest, supa: SupabaseClient): Promise<Caller | null> {
  const apiKey = (req.headers['x-api-key'] as string | undefined)?.trim()
  if (apiKey) {
    const { data } = await supa.from('api_keys')
      .select('id, user_id, revoked_at').eq('key_hash', hashApiKey(apiKey)).maybeSingle()
    if (!data || data.revoked_at) return null
    await supa.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
    return { userId: data.user_id as string, email: null, via: 'api_key', apiKeyId: data.id as string }
  }
  const user = await authUser(req, supa)
  return user ? { userId: user.id, email: user.email ?? null, via: 'session' } : null
}

/**
 * The caller's plan and monthly usage. Returns null when the entitlements
 * migration hasn't been applied yet, so a deploy that lands before the
 * migration keeps working instead of blocking every screening.
 */
export async function getQuota(supa: SupabaseClient, userId: string): Promise<Quota | null> {
  const { data, error } = await supa.rpc('quota_for', { uid: userId })
  if (error) {
    console.error('[entitlements] quota_for failed — is migration 013 applied?', error.message)
    return null
  }
  return (data as Quota | null) ?? null
}

export const overQuota = (q: Quota | null, adding = 1) =>
  !!q && q.cv_limit !== null && q.used + adding > q.cv_limit

/** Record CV screenings against the caller's (or their team's) monthly pool. */
export async function recordUsage(supa: SupabaseClient, userId: string, q: Quota | null, source: 'app' | 'api', count = 1) {
  const rows = Array.from({ length: count }, () => ({ user_id: userId, org_id: q?.org_id ?? null, kind: 'cv_score', source }))
  const { error } = await supa.from('usage_events').insert(rows)
  if (error) console.error('[entitlements] usage insert failed', error.message)
}

/**
 * Email the account once when this CV takes it to 80% of the monthly allowance
 * (/pricing promises a heads-up before the cap). `q.used` is the count before this CV.
 */
export async function warnNearLimit(supa: SupabaseClient, caller: Caller, q: Quota | null) {
  if (!q || q.cv_limit === null || q.cv_limit <= 0) return
  const threshold = Math.ceil(q.cv_limit * 0.8)
  if (q.used + 1 !== threshold) return
  let email = caller.email
  if (!email) {
    const { data } = await supa.from('profiles').select('email').eq('id', caller.userId).maybeSingle()
    email = (data?.email as string | undefined) ?? null
  }
  if (!email) return
  const resets = new Date(q.period_end).toDateString()
  await sendEmail({
    to: email,
    subject: `You've used 80% of this month's CV screenings`,
    text: `Hi,\n\nYour HireBest account${q.org_id ? ' (team pool)' : ''} has screened ${threshold} of ${q.cv_limit} CVs this month. The allowance resets on ${resets}.\n\nNeed more before then? Upgrade any time: ${BASE_URL}/pricing\n\nThe HireBest team`,
  }).catch(() => {})
}
