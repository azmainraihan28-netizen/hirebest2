import { supabase } from './supabase'

export const VARIANT_IDS = {
  basic: '1726500',
  advanced: '1726509',
  lifetime: '1726511',
  retainer: '1726518',
} as const

export type PlanKey = keyof typeof VARIANT_IDS

export type Subscription = {
  id: string
  user_id: string
  ls_subscription_id: string | null
  variant_id: string
  plan_name: 'basic' | 'advanced' | 'lifetime' | 'retainer'
  status: 'active' | 'on_trial' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired'
  renews_at: string | null
  ends_at: string | null
  test_mode: boolean
  card_brand: string | null
  card_last_four: string | null
  customer_portal_url: string | null
  update_payment_method_url: string | null
  created_at: string
}

export async function startCheckout(plan: PlanKey, opts: { userId?: string; email?: string; name?: string } = {}): Promise<string> {
  const res = await fetch('/api/checkout-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId: VARIANT_IDS[plan], ...opts }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Checkout failed: ${t.slice(0, 200)}`)
  }
  const { url } = await res.json()
  return url as string
}

export async function listMySubscriptions(): Promise<Subscription[]> {
  const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Subscription[]
}

export async function getActiveSubscription(): Promise<Subscription | null> {
  const { data } = await supabase.from('subscriptions')
    .select('*')
    .in('status', ['active', 'on_trial', 'cancelled']) // cancelled still active until ends_at
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as Subscription | null) ?? null
}
