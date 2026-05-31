// Lemon Squeezy webhook receiver. Verifies HMAC-SHA256 signature, then upserts
// the user's subscription / profile plan in Supabase using the service-role key.
//
// Env vars required:
//   LEMONSQUEEZY_WEBHOOK_SECRET — signing secret from LS dashboard
//   SUPABASE_URL                — your project URL
//   SUPABASE_SERVICE_ROLE_KEY   — service_role secret (NEVER expose to client)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { notifyAdmin, fmt } from './_lib/notify'

export const config = { api: { bodyParser: false } } // raw body needed for HMAC

const VARIANT_TO_PLAN: Record<string, 'basic' | 'advanced' | 'lifetime' | 'retainer'> = {
  '1726500': 'basic',
  '1726509': 'advanced',
  '1726511': 'lifetime',
  '1726518': 'retainer',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const raw = await readRaw(req)
  const signature = (req.headers['x-signature'] as string | undefined) ?? ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  if (!signature || !timingSafeEqualHex(signature, computed)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let body: any
  try { body = JSON.parse(raw.toString('utf8')) } catch { return res.status(400).json({ error: 'Bad JSON' }) }

  const eventName = body?.meta?.event_name as string | undefined
  const custom = body?.meta?.custom_data ?? {}
  const attrs = body?.data?.attributes ?? {}
  const dataId = String(body?.data?.id ?? '')

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Supabase not configured' })

  const supa = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Resolve user_id either from custom_data or by email lookup
  let userId: string | null = custom?.user_id ?? null
  if (!userId) {
    const email = attrs?.user_email ?? attrs?.email
    if (email) {
      const { data } = await supa.from('profiles').select('id').eq('email', email).maybeSingle()
      userId = (data as any)?.id ?? null
    }
  }

  try {
    if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'subscription_resumed') {
      const variantId = String(attrs.variant_id ?? attrs?.first_subscription_item?.variant_id ?? '')
      const plan = VARIANT_TO_PLAN[variantId] ?? 'free'
      const status = String(attrs.status ?? 'active')

      if (!userId) {
        await logSkipped(supa, eventName, dataId, 'no user_id')
        return res.status(200).json({ ok: true, warning: 'no user_id' })
      }

      await supa.from('subscriptions').upsert({
        user_id: userId,
        ls_subscription_id: dataId,
        ls_order_id: String(attrs.order_id ?? ''),
        variant_id: variantId,
        plan_name: plan,
        status,
        renews_at: attrs.renews_at ?? null,
        ends_at: attrs.ends_at ?? null,
        test_mode: !!attrs.test_mode,
        card_brand: attrs.card_brand ?? null,
        card_last_four: attrs.card_last_four ?? null,
        customer_portal_url: attrs?.urls?.customer_portal ?? null,
        update_payment_method_url: attrs?.urls?.update_payment_method ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'ls_subscription_id' })

      if (['active', 'on_trial'].includes(status)) {
        await supa.from('profiles').update({ plan }).eq('id', userId)
      }

      // Notify admin only on initial creation, not every update
      if (eventName === 'subscription_created') {
        const userEmail = attrs.user_email ?? attrs.email ?? '—'
        const price = priceLabel(plan)
        await notifyAdmin({
          subject: `[HireBest] New ${plan} subscription — ${price}${attrs.test_mode ? ' (TEST)' : ''}`,
          text: [
            `🎉 New paid subscription`,
            '',
            fmt.kv('Customer', `${attrs.user_name ?? userEmail} <${userEmail}>`),
            fmt.kv('Plan', `${plan} (${price})`),
            fmt.kv('Status', status),
            fmt.kv('Renews at', attrs.renews_at ?? '—'),
            fmt.kv('Card', attrs.card_brand ? `${attrs.card_brand} ••${attrs.card_last_four}` : '—'),
            fmt.kv('Test mode', !!attrs.test_mode),
            fmt.kv('LS subscription ID', dataId),
            fmt.kv('User ID', userId),
          ].join('\n'),
          replyTo: userEmail !== '—' ? userEmail : undefined,
        })
      }
    }

    else if (eventName === 'subscription_cancelled' || eventName === 'subscription_paused') {
      // Cancelled but still has access until ends_at
      await supa.from('subscriptions').update({
        status: eventName === 'subscription_paused' ? 'paused' : 'cancelled',
        ends_at: attrs.ends_at ?? null,
        updated_at: new Date().toISOString(),
      }).eq('ls_subscription_id', dataId)

      await notifyAdmin({
        subject: `[HireBest] Subscription ${eventName === 'subscription_paused' ? 'paused' : 'cancelled'} — ${attrs.user_email ?? '—'}`,
        text: [
          `⚠️ ${eventName === 'subscription_paused' ? 'Subscription paused' : 'Subscription cancelled'}`,
          '',
          fmt.kv('Customer', attrs.user_email ?? '—'),
          fmt.kv('Ends at', attrs.ends_at ?? '—'),
          fmt.kv('LS subscription ID', dataId),
        ].join('\n'),
      })
    }

    else if (eventName === 'subscription_payment_failed') {
      await notifyAdmin({
        subject: `[HireBest] ⚠️ Payment FAILED — ${attrs.user_email ?? '—'}`,
        text: [
          `❌ Subscription payment failed`,
          '',
          fmt.kv('Customer', attrs.user_email ?? '—'),
          fmt.kv('LS subscription ID', dataId),
          'Action: check Lemon Squeezy dashboard for retry status.',
        ].join('\n'),
      })
    }

    else if (eventName === 'subscription_expired') {
      await supa.from('subscriptions').update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      }).eq('ls_subscription_id', dataId)
      if (userId) await supa.from('profiles').update({ plan: 'free' }).eq('id', userId)
      await notifyAdmin({
        subject: `[HireBest] Subscription EXPIRED — downgraded to free`,
        text: [
          `🔚 Subscription expired and user downgraded to free.`,
          '',
          fmt.kv('LS subscription ID', dataId),
          fmt.kv('User ID', userId ?? '—'),
        ].join('\n'),
      })
    }

    else if (eventName === 'order_created') {
      // One-time orders — for the Custom Integrated variant, grant lifetime
      const item = attrs?.first_order_item
      const variantId = String(item?.variant_id ?? '')
      const plan = VARIANT_TO_PLAN[variantId]
      if (plan === 'lifetime' && userId) {
        await supa.from('profiles').update({ plan: 'lifetime' }).eq('id', userId)
        await notifyAdmin({
          subject: `[HireBest] 💎 Lifetime purchase — $1,500${attrs.test_mode ? ' (TEST)' : ''}`,
          text: [
            `💎 New lifetime customer (Custom Integrated)`,
            '',
            fmt.kv('Customer', attrs.user_email ?? '—'),
            fmt.kv('Order total', `$${(attrs.total ?? 150000) / 100}`),
            fmt.kv('Test mode', !!attrs.test_mode),
            fmt.kv('Order ID', dataId),
            'Action: schedule kickoff call within 24h.',
          ].join('\n'),
          replyTo: attrs.user_email,
        })
      }
    }

    // Audit (best effort)
    try {
      await supa.from('audit_log').insert({
        actor_email: 'lemonsqueezy:webhook',
        action: `lemonsqueezy.${eventName}`,
        target_type: 'subscription',
        target_label: dataId,
        meta: { user_id: userId, attrs_status: attrs?.status, test_mode: !!attrs.test_mode },
      })
    } catch {}

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    console.error('webhook err', e)
    return res.status(500).json({ error: e?.message ?? 'Unknown' })
  }
}

function readRaw(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function priceLabel(plan: string): string {
  switch (plan) {
    case 'basic':    return '$400/yr'
    case 'advanced': return '$900/yr'
    case 'lifetime': return '$1,500 one-time'
    case 'retainer': return '$200/mo'
    default:         return plan
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try { return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')) } catch { return false }
}

async function logSkipped(supa: any, event: string, dataId: string, reason: string) {
  try {
    await supa.from('audit_log').insert({
      actor_email: 'lemonsqueezy:webhook',
      action: `lemonsqueezy.${event}.skipped`,
      target_type: 'subscription',
      target_label: dataId,
      meta: { reason },
    })
  } catch {}
}
