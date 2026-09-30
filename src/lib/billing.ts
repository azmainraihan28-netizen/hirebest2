import { supabase } from './supabase'

export type PlanKey = 'basic' | 'advanced' | 'lifetime' | 'retainer'
export type PaidPlanKey = Exclude<PlanKey, 'retainer'>
export type BillingInterval = 'monthly' | 'annual'

export type Subscription = {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  ls_subscription_id: string | null
  plan_name: PlanKey
  status: 'active' | 'on_trial' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired' | 'incomplete'
  billing_interval: 'month' | 'year' | null
  cancel_at_period_end: boolean
  renews_at: string | null
  ends_at: string | null
  trial_ends_at: string | null
  test_mode: boolean
  card_brand: string | null
  card_last_four: string | null
  customer_portal_url: string | null
  created_at: string
}

async function authedPost(path: string, body: unknown = {}): Promise<{ url: string }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in first.')
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json?.url) throw new Error(json?.error ?? `Request failed (${res.status})`)
  return json
}

/** Returns the Stripe Checkout URL (or the billing portal if already subscribed). */
export async function startCheckout(plan: PaidPlanKey, interval: BillingInterval): Promise<string> {
  return (await authedPost('/api/billing', { action: 'checkout', plan, interval })).url
}

/** Returns a Stripe customer-portal URL: card, plan switch, cancel, invoices. */
export async function openBillingPortal(): Promise<string> {
  return (await authedPost('/api/billing', { action: 'portal' })).url
}

export async function listMySubscriptions(): Promise<Subscription[]> {
  const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Subscription[]
}

export async function getActiveSubscription(): Promise<Subscription | null> {
  const { data } = await supabase.from('subscriptions')
    .select('*')
    .in('status', ['active', 'on_trial', 'cancelled', 'past_due']) // cancelled still active until ends_at
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as Subscription | null) ?? null
}
