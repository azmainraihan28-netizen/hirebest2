// Stripe billing actions for the signed-in user. One route (not two) to stay
// under the Vercel Hobby plan's 12-serverless-function limit.
// Auth: Authorization: Bearer <supabase access token>
//
// POST { action: 'checkout', plan: 'basic' | 'advanced' | 'lifetime', interval: 'monthly' | 'annual' }
//   → { url }  Stripe-hosted checkout page, or the billing portal if the user
//              already has a live subscription (plan changes go through the
//              portal so we never create a second subscription).
// POST { action: 'portal' }
//   → { url }  Stripe customer portal: card, plan switch, invoices, cancel.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import {
  stripe, StripeError, serviceClient, authUser, getOrCreateCustomer,
  lookupKey, PAID_PLANS, TRIAL_DAYS, BASE_URL, type PaidPlan, type Interval,
} from './_lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supa = serviceClient()
  if (!supa) return res.status(500).json({ error: 'Server not configured' })
  const user = await authUser(req, supa)
  if (!user) return res.status(401).json({ error: 'Please sign in first' })

  const { action } = (req.body ?? {}) as { action?: string }
  if (action === 'checkout') return checkout(req, res, supa, user)
  if (action === 'portal') return portal(res, supa, user)
  return res.status(400).json({ error: 'Invalid action' })
}

async function portal(res: VercelResponse, supa: SupabaseClient, user: User) {
  const { data } = await supa.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
  if (!data?.stripe_customer_id) return res.status(404).json({ error: 'No billing account yet — pick a plan first.' })

  try {
    const session = await stripe('POST', '/billing_portal/sessions', {
      customer: data.stripe_customer_id,
      return_url: `${BASE_URL}/dashboard/orders`,
    })
    return res.status(200).json({ url: session.url })
  } catch (e: any) {
    console.error('[billing:portal]', e)
    return res.status(500).json({ error: e?.message ?? 'Could not open billing portal' })
  }
}

async function checkout(req: VercelRequest, res: VercelResponse, supa: SupabaseClient, user: User) {
  const { plan, interval } = (req.body ?? {}) as { plan?: string; interval?: string }
  if (!plan || !PAID_PLANS.includes(plan as PaidPlan)) return res.status(400).json({ error: 'Invalid plan' })
  const iv: Interval = interval === 'monthly' ? 'monthly' : 'annual'

  try {
    const customer = await getOrCreateCustomer(supa, user)

    // Already subscribed → send to the portal to switch plans instead.
    const live = await stripe('GET', '/subscriptions', { customer, status: 'all', limit: 10 })
    const hasLive = (live.data as any[]).some(s => ['active', 'trialing', 'past_due', 'unpaid', 'paused'].includes(s.status))
    if (hasLive) {
      const portal = await stripe('POST', '/billing_portal/sessions', { customer, return_url: `${BASE_URL}/dashboard/orders` })
      return res.status(200).json({ url: portal.url, portal: true })
    }

    const prices = await stripe('GET', '/prices', { lookup_keys: [lookupKey(plan as PaidPlan, iv)], active: true, limit: 1 })
    const price = prices.data?.[0]
    if (!price) return res.status(500).json({ error: `Price ${lookupKey(plan as PaidPlan, iv)} not found in Stripe` })

    // One free trial per customer: skip it if they've ever subscribed before.
    const trialEligible = (live.data as any[]).length === 0

    const session = await stripe('POST', '/checkout/sessions', {
      mode: 'subscription',
      customer,
      client_reference_id: user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto', name: 'auto' },
      subscription_data: {
        metadata: { user_id: user.id, plan },
        ...(trialEligible ? {
          trial_period_days: TRIAL_DAYS,
          // No card needed to start the trial; the subscription cancels itself
          // at trial end if the customer never adds a payment method.
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        } : {}),
      },
      ...(trialEligible ? { payment_method_collection: 'if_required' } : {}),
      metadata: { user_id: user.id, plan },
      success_url: `${BASE_URL}/dashboard/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout?plan=${plan}&interval=${iv}&canceled=1`,
    })

    return res.status(200).json({ url: session.url })
  } catch (e: any) {
    console.error('[billing:checkout]', e)
    const status = e instanceof StripeError && e.status < 500 ? 502 : 500
    return res.status(status).json({ error: e?.message ?? 'Checkout failed' })
  }
}
