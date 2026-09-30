// Create a Stripe Checkout Session for a subscription.
// Auth:     Authorization: Bearer <supabase access token>
// POST body: { plan: 'basic' | 'advanced' | 'lifetime', interval: 'monthly' | 'annual' }
// Returns:   { url: string }  — Stripe-hosted checkout page, or the billing
//            portal if the user already has a live subscription (plan changes
//            go through the portal so we never create a second subscription).

import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  stripe, StripeError, serviceClient, authUser, getOrCreateCustomer,
  lookupKey, PAID_PLANS, TRIAL_DAYS, BASE_URL, type PaidPlan, type Interval,
} from './_lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { plan, interval } = (req.body ?? {}) as { plan?: string; interval?: string }
  if (!plan || !PAID_PLANS.includes(plan as PaidPlan)) return res.status(400).json({ error: 'Invalid plan' })
  const iv: Interval = interval === 'monthly' ? 'monthly' : 'annual'

  const supa = serviceClient()
  if (!supa) return res.status(500).json({ error: 'Server not configured' })
  const user = await authUser(req, supa)
  if (!user) return res.status(401).json({ error: 'Please sign in to subscribe' })

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
    console.error('[stripe-checkout]', e)
    const status = e instanceof StripeError && e.status < 500 ? 502 : 500
    return res.status(status).json({ error: e?.message ?? 'Checkout failed' })
  }
}
