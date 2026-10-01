import { supabase } from './supabase'
import type { Profile } from './supabase'
import { countMyCandidates } from './screenings'
import { PLAN_ENTITLEMENTS, PLAN_LIMITS, planAtLeast, type PlanKey, type PlanTier } from './plans'

function isPaidPlan(plan: Profile['plan'] | undefined | null): plan is PlanKey {
  return !!plan && plan in PLAN_LIMITS
}

/** Plans with unlimited screenings (currently just Enterprise/retainer). */
export function isUnlimited(plan: Profile['plan'] | undefined | null): boolean {
  return isPaidPlan(plan) && !isFinite(PLAN_LIMITS[plan])
}

export type QuotaState = {
  /** Effective plan: the better of the user's own plan and their team's. */
  plan: PlanTier
  /** Set when CVs come out of a team's shared pool. */
  orgId: string | null
  used: number
  limit: number
  remaining: number
  pct: number
  unlimited: boolean
  /** When the monthly allowance resets (ISO date). */
  resetsOn: string | null
  jobSlots: number          // Infinity = unlimited
  activeJobs: number
  batchCap: number
  seats: number             // Infinity = unlimited
}

type QuotaRow = {
  plan: string; org_id: string | null; active: boolean
  cv_limit: number | null; used: number; period_end: string
  job_slots: number | null; active_jobs: number; seats: number | null; batch_cap: number
}

const nn = (v: number | null | undefined) => (v === null || v === undefined ? Infinity : v)

function build(row: Omit<QuotaRow, 'active'>): QuotaState {
  const limit = nn(row.cv_limit)
  const used = row.used ?? 0
  const unlimited = !isFinite(limit)
  return {
    plan: (row.plan as PlanTier) ?? 'free',
    orgId: row.org_id ?? null,
    used,
    limit,
    remaining: unlimited ? Infinity : Math.max(0, limit - used),
    pct: unlimited || limit <= 0 ? 0 : Math.min(100, (used / limit) * 100),
    unlimited,
    resetsOn: row.period_end ?? null,
    jobSlots: nn(row.job_slots),
    activeJobs: row.active_jobs ?? 0,
    batchCap: row.batch_cap,
    seats: nn(row.seats),
  }
}

/**
 * The signed-in user's plan, monthly CV usage and plan limits, from the
 * `my_quota()` RPC (migration 013) — the same numbers /api/score enforces.
 */
export async function loadQuota(profile: Profile | null): Promise<QuotaState> {
  const { data, error } = await supabase.rpc('my_quota')
  if (!error && data) return build(data as QuotaRow)
  return legacyQuota(profile)
}

/** Fallback for databases that don't have migration 013 yet: this month's CVs vs the plan table. */
async function legacyQuota(profile: Profile | null): Promise<QuotaState> {
  const plan = (isPaidPlan(profile?.plan) ? profile!.plan : 'free') as PlanTier
  const ent = PLAN_ENTITLEMENTS[plan]
  let limit: number | null = profile?.screening_limit ?? (isFinite(ent.cvLimit) ? ent.cvLimit : null)
  if (plan === 'free' && profile?.screening_limit == null) {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'default_free_limit').maybeSingle()
    const v = (data as any)?.value
    limit = typeof v === 'number' ? v : 50
  }
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const used = await countMyCandidates(start.toISOString())
  return build({
    plan, org_id: null, cv_limit: limit, used, period_end: end.toISOString(),
    job_slots: isFinite(ent.jobSlots) ? ent.jobSlots : null, active_jobs: 0,
    seats: isFinite(ent.seats) ? ent.seats : null, batch_cap: ent.batchCap,
  })
}

export { planAtLeast }
