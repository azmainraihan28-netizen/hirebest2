export type PlanKey = 'basic' | 'advanced' | 'lifetime' | 'retainer'

/** Monthly CV screening limit per paid plan, matching the numbers shown on /pricing. */
export const PLAN_LIMITS: Record<PlanKey, number> = {
  basic: 150,
  advanced: 500,
  lifetime: 2000,
  retainer: Infinity,
}

export function formatPlanLimit(plan: PlanKey): string {
  const limit = PLAN_LIMITS[plan]
  return isFinite(limit) ? limit.toLocaleString() : 'Unlimited'
}
