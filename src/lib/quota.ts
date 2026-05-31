import { supabase } from './supabase'
import type { Profile } from './supabase'

const UNLIMITED_PLANS: Profile['plan'][] = ['basic', 'advanced', 'lifetime', 'retainer']

/** Plans with unlimited screenings. */
export function isUnlimited(plan: Profile['plan'] | undefined | null): boolean {
  return !!plan && UNLIMITED_PLANS.includes(plan)
}

/** Effective limit for this user. Returns Infinity for unlimited plans. */
export async function getEffectiveLimit(profile: Profile | null): Promise<number> {
  if (!profile) return 0
  if (isUnlimited(profile.plan)) return Infinity
  if (profile.screening_limit != null) return profile.screening_limit
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'default_free_limit').maybeSingle()
  const v = (data as any)?.value
  return typeof v === 'number' ? v : 50
}

export type QuotaState = {
  used: number
  limit: number
  remaining: number
  pct: number
  unlimited: boolean
}

export async function loadQuota(profile: Profile | null): Promise<QuotaState> {
  const limit = await getEffectiveLimit(profile)
  const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true })
  const used = count ?? 0
  if (!isFinite(limit)) {
    return { used, limit: Infinity, remaining: Infinity, pct: 0, unlimited: true }
  }
  const remaining = Math.max(0, limit - used)
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  return { used, limit, remaining, pct, unlimited: false }
}
