// Stripe webhook receiver. Verifies the Stripe-Signature header, then syncs the
// subscription into Supabase (subscriptions row + profiles.plan) using the
// service-role key.
//
// Every subscription event re-fetches the subscription from Stripe, so events
// arriving out of order or twice always converge on Stripe's current state.
//
// Stripe dashboard → Developers → Webhooks → endpoint URL:
//   https://hirebest.online/api/stripe-webhook
// Events: checkout.session.completed, customer.subscription.created,
//   customer.subscription.updated, customer.subscription.deleted,
//   customer.subscription.paused, customer.subscription.resumed,
//   invoice.paid, invoice.payment_failed
//
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { SupabaseClient } from '@supabase/supabase-js'
import { notifyAdmin, fmt } from './_lib/notify.js'
import { stripe, verifyStripeSignature, serviceClient, readRaw, planFromLookupKey, type PaidPlan } from './_lib/stripe.js'

export const config = { api: { bodyParser: false } } // raw body needed for the signature

type Status = 'active' | 'on_trial' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired' | 'incomplete'

// Statuses that keep paid access.
const ENTITLED: Status[] = ['active', 'on_trial', 'cancelled', 'past_due']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  const raw = await readRaw(req)
  const sig = (req.headers['stripe-signature'] as string | undefined) ?? ''
  if (!sig || !verifyStripeSignature(raw, sig, secret)) return res.status(400).json({ error: 'Invalid signature' })

  let event: any
  try { event = JSON.parse(raw.toString('utf8')) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

  const supa = serviceClient()
  if (!supa) return res.status(500).json({ error: 'Supabase not configured' })

  const obj = event?.data?.object ?? {}
  const type = String(event?.type ?? '')
  let subId: string | null = null
  let userId: string | null = null

  try {
    switch (type) {
      case 'checkout.session.completed':
        if (obj.mode === 'subscription' && obj.subscription) {
          subId = String(obj.subscription)
          userId = (await syncSubscription(supa, subId, obj.client_reference_id)).userId
        }
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        subId = String(obj.id)
        const r = await syncSubscription(supa, subId)
        userId = r.userId
        await notifyForSubscriptionEvent(type, event, r)
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        subId = invoiceSubscriptionId(obj)
        if (subId) userId = (await syncSubscription(supa, subId)).userId
        if (type === 'invoice.payment_failed') {
          await notifyAdmin({
            subject: `[HireBest] ⚠️ Payment FAILED — ${obj.customer_email ?? '—'}${event.livemode ? '' : ' (TEST)'}`,
            text: [
              `❌ Subscription payment failed`,
              '',
              fmt.kv('Customer', obj.customer_email ?? '—'),
              fmt.kv('Amount due', money(obj.amount_due, obj.currency)),
              fmt.kv('Attempt', obj.attempt_count ?? '—'),
              fmt.kv('Next retry', obj.next_payment_attempt ? iso(obj.next_payment_attempt) : '—'),
              fmt.kv('Invoice', obj.hosted_invoice_url ?? obj.id),
              'Stripe will retry automatically (Smart Retries) and email the customer.',
            ].join('\n'),
            replyTo: obj.customer_email ?? undefined,
          })
        }
        break
      }
    }

    // Audit (best effort)
    try {
      await supa.from('audit_log').insert({
        actor_email: 'stripe:webhook',
        action: `stripe.${type}`,
        target_type: 'subscription',
        target_label: subId ?? String(obj.id ?? ''),
        meta: { event_id: event.id, user_id: userId, livemode: !!event.livemode },
      })
    } catch {}

    return res.status(200).json({ received: true })
  } catch (e: any) {
    console.error('[stripe-webhook]', type, e)
    // 500 → Stripe retries with backoff.
    return res.status(500).json({ error: e?.message ?? 'Unknown' })
  }
}

type SyncResult = { userId: string | null; plan: PaidPlan | null; status: Status | null; sub: any }

async function syncSubscription(supa: SupabaseClient, subId: string, hintUserId?: string | null): Promise<SyncResult> {
  const sub = await stripe('GET', `/subscriptions/${subId}`, {
    expand: ['default_payment_method', 'items.data.price', 'customer'],
  })
  const item = sub.items?.data?.[0]
  const price = item?.price ?? {}
  const plan = planFromLookupKey(price.lookup_key) ?? (sub.metadata?.plan as PaidPlan | undefined) ?? null
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id

  const userId = sub.metadata?.user_id || hintUserId || await userForCustomer(supa, customerId)
  if (!userId || !plan) {
    console.warn('[stripe-webhook] cannot map subscription', subId, { userId, plan })
    return { userId, plan, status: null, sub }
  }

  const status = mapStatus(sub)
  // Newer API versions moved the billing period onto the subscription item.
  const periodEnd = sub.current_period_end ?? item?.current_period_end ?? null
  const endsAt = sub.ended_at ?? sub.cancel_at ?? (sub.cancel_at_period_end ? periodEnd : null)
  const card = sub.default_payment_method?.card

  const { error } = await supa.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    stripe_price_id: price.id ?? null,
    billing_interval: price.recurring?.interval ?? null,
    plan_name: plan,
    status,
    renews_at: status === 'active' || status === 'on_trial' ? iso(periodEnd) : null,
    ends_at: iso(endsAt),
    trial_ends_at: iso(sub.trial_end),
    cancel_at_period_end: !!sub.cancel_at_period_end,
    test_mode: !sub.livemode,
    card_brand: card?.brand ?? null,
    card_last_four: card?.last4 ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' })
  if (error) throw new Error(`subscriptions upsert: ${error.message}`)

  // Keep the customer link even if the subscription was created outside our checkout.
  if (customerId) {
    await supa.from('billing_customers').upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id', ignoreDuplicates: true })
  }

  if (ENTITLED.includes(status)) {
    await supa.from('profiles').update({ plan }).eq('id', userId)
  } else {
    // Downgrade only if this subscription is what granted the current plan and
    // no other subscription still entitles the user (don't clobber plans an
    // admin granted by hand or via an access code).
    const { data: other } = await supa.from('subscriptions').select('plan_name')
      .eq('user_id', userId).neq('stripe_subscription_id', sub.id).in('status', ENTITLED).limit(1)
    const { data: prof } = await supa.from('profiles').select('plan').eq('id', userId).maybeSingle()
    if (!other?.length && prof?.plan === plan) {
      await supa.from('profiles').update({ plan: 'free' }).eq('id', userId)
    }
  }

  return { userId, plan, status, sub }
}

function mapStatus(sub: any): Status {
  switch (sub.status) {
    case 'trialing': return 'on_trial'
    case 'active': return sub.cancel_at_period_end || sub.cancel_at ? 'cancelled' : 'active'
    case 'past_due': return 'past_due'
    case 'unpaid': return 'unpaid'
    case 'paused': return 'paused'
    case 'incomplete': return 'incomplete'
    default: return 'expired' // canceled, incomplete_expired
  }
}

async function userForCustomer(supa: SupabaseClient, customerId?: string): Promise<string | null> {
  if (!customerId) return null
  const { data } = await supa.from('billing_customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle()
  return (data?.user_id as string | undefined) ?? null
}

function invoiceSubscriptionId(inv: any): string | null {
  const s = inv.subscription ?? inv.parent?.subscription_details?.subscription
  return s ? String(typeof s === 'string' ? s : s.id) : null
}

async function notifyForSubscriptionEvent(type: string, event: any, r: SyncResult) {
  const sub = r.sub
  const email = sub?.customer?.email ?? '—'
  const name = sub?.customer?.name ?? email
  const price = sub?.items?.data?.[0]?.price
  const amount = price ? `${money(price.unit_amount, price.currency)}/${price.recurring?.interval ?? '—'}` : '—'
  const test = event.livemode ? '' : ' (TEST)'
  const prev = event.data?.previous_attributes ?? {}

  if (type === 'customer.subscription.created') {
    await notifyAdmin({
      subject: `[HireBest] 🎉 New ${r.plan ?? '?'} subscription — ${amount}${test}`,
      text: [
        `🎉 New subscription`,
        '',
        fmt.kv('Customer', `${name} <${email}>`),
        fmt.kv('Plan', `${r.plan ?? '—'} (${amount})`),
        fmt.kv('Status', sub?.status ?? '—'),
        fmt.kv('Trial ends', sub?.trial_end ? iso(sub.trial_end) : '—'),
        fmt.kv('Stripe subscription', sub?.id),
        fmt.kv('User ID', r.userId ?? '—'),
      ].join('\n'),
      replyTo: email !== '—' ? email : undefined,
    })
  } else if (type === 'customer.subscription.deleted') {
    await notifyAdmin({
      subject: `[HireBest] Subscription ended — ${email}${test}`,
      text: [
        `🔚 Subscription ended${r.userId ? ' and user downgraded to free (unless another plan applies)' : ''}.`,
        '',
        fmt.kv('Customer', email),
        fmt.kv('Plan', r.plan ?? '—'),
        fmt.kv('Stripe subscription', sub?.id),
      ].join('\n'),
    })
  } else if (type === 'customer.subscription.updated' && prev.cancel_at_period_end === false && sub?.cancel_at_period_end) {
    await notifyAdmin({
      subject: `[HireBest] Subscription cancelled — ${email}${test}`,
      text: [
        `⚠️ Customer cancelled; access continues until the period ends.`,
        '',
        fmt.kv('Customer', email),
        fmt.kv('Plan', r.plan ?? '—'),
        fmt.kv('Cancellation reason', sub?.cancellation_details?.feedback ?? sub?.cancellation_details?.comment ?? '—'),
        fmt.kv('Stripe subscription', sub?.id),
      ].join('\n'),
    })
  }
}

function iso(unix: number | null | undefined): string | null {
  return unix ? new Date(unix * 1000).toISOString() : null
}

function money(amount: number | null | undefined, currency: string | undefined): string {
  if (amount == null) return '—'
  return `${(amount / 100).toFixed(2)} ${(currency ?? 'usd').toUpperCase()}`
}
