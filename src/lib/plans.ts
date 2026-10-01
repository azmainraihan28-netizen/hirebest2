export type PlanKey = 'basic' | 'advanced' | 'lifetime' | 'retainer'
export type PlanTier = 'free' | PlanKey

/** Monthly CV screening limit per paid plan, matching the numbers shown on /pricing. */
export const PLAN_LIMITS: Record<PlanKey, number> = {
  basic: 150,
  advanced: 500,
  lifetime: 2000,
  retainer: Infinity,
}

/**
 * What each plan includes. Mirrors /pricing and `plan_entitlements()` in
 * supabase/migrations/013_plan_entitlements.sql — change all three together.
 * Infinity = unlimited.
 */
export const PLAN_ENTITLEMENTS: Record<PlanTier, { cvLimit: number; jobSlots: number; seats: number; batchCap: number }> = {
  free:     { cvLimit: 50,       jobSlots: 1,        seats: 1,        batchCap: 50 },
  basic:    { cvLimit: 150,      jobSlots: 3,        seats: 1,        batchCap: 50 },
  advanced: { cvLimit: 500,      jobSlots: 10,       seats: 3,        batchCap: 200 },
  lifetime: { cvLimit: 2000,     jobSlots: Infinity, seats: 10,       batchCap: 200 },
  retainer: { cvLimit: Infinity, jobSlots: Infinity, seats: Infinity, batchCap: 500 },
}

export const PLAN_RANK: Record<PlanTier, number> = { free: 0, basic: 1, advanced: 2, lifetime: 3, retainer: 4 }
export const PLAN_NAMES: Record<PlanTier, string> = { free: 'Free', basic: 'Starter', advanced: 'Growth', lifetime: 'Team', retainer: 'Enterprise' }

export function planAtLeast(plan: string | null | undefined, min: PlanTier): boolean {
  return (PLAN_RANK[(plan ?? 'free') as PlanTier] ?? 0) >= PLAN_RANK[min]
}

/** Feature → the lowest plan that includes it (per /pricing). */
export const FEATURE_PLAN = {
  bulkUpload: 'advanced',
  branding: 'advanced',
  compare: 'advanced',
  outreachDrafts: 'advanced',
  team: 'advanced',
  analytics: 'lifetime',
  apiAccess: 'lifetime',
  emailNotifications: 'lifetime',
  sso: 'retainer',
} as const satisfies Record<string, PlanTier>

export type Feature = keyof typeof FEATURE_PLAN

export function formatPlanLimit(plan: PlanKey): string {
  const limit = PLAN_LIMITS[plan]
  return isFinite(limit) ? limit.toLocaleString() : 'Unlimited'
}
