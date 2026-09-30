// Minimal Stripe REST client + shared billing helpers for the /api routes.
// Uses fetch directly (no SDK), same approach as the rest of /api.
//
// Env vars:
//   STRIPE_SECRET_KEY          — sk_live_... / sk_test_... (or a restricted rk_ key)
//   STRIPE_WEBHOOK_SECRET      — whsec_... from the webhook endpoint
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import crypto from 'crypto'
import type { VercelRequest } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://hirebest.online'

export type PaidPlan = 'basic' | 'advanced' | 'lifetime'
export type Interval = 'monthly' | 'annual'

export const PAID_PLANS: PaidPlan[] = ['basic', 'advanced', 'lifetime']
export const TRIAL_DAYS = 14

/** Stripe price lookup keys, created in the Stripe dashboard / via API. */
export const lookupKey = (plan: PaidPlan, interval: Interval) => `hirebest_${plan}_${interval}`

export function planFromLookupKey(key: string | null | undefined): PaidPlan | null {
  const m = /^hirebest_(basic|advanced|lifetime)_(monthly|annual)$/.exec(key ?? '')
  return m ? (m[1] as PaidPlan) : null
}

export class StripeError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

/** Call the Stripe API. `params` is form-encoded (Stripe's bracket syntax). */
export async function stripe<T = any>(method: 'GET' | 'POST' | 'DELETE', path: string, params: Record<string, any> = {}, idempotencyKey?: string): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new StripeError(500, 'STRIPE_SECRET_KEY not configured')

  const body = encodeForm(params)
  const url = `https://api.stripe.com/v1${path}${method === 'GET' && body ? `?${body}` : ''}`
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` }
  if (method !== 'GET') headers['Content-Type'] = 'application/x-www-form-urlencoded'
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  const r = await fetch(url, { method, headers, body: method === 'GET' ? undefined : body })
  const json = await r.json().catch(() => ({})) as any
  if (!r.ok) throw new StripeError(r.status, json?.error?.message ?? `Stripe ${r.status}`)
  return json as T
}

function encodeForm(obj: Record<string, any>, prefix = ''): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === 'object') parts.push(encodeForm(item, `${key}[${i}]`))
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`)
      })
    } else if (typeof v === 'object') {
      parts.push(encodeForm(v, key))
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.filter(Boolean).join('&')
}

/**
 * Verify a Stripe-Signature header (t=...,v1=...) against the raw body.
 * Rejects events older than `toleranceSec` to block replays.
 */
export function verifyStripeSignature(raw: Buffer, header: string, secret: string, toleranceSec = 300): boolean {
  const items = header.split(',').map(s => s.trim().split('='))
  const t = items.find(([k]) => k === 't')?.[1]
  const sigs = items.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!t || sigs.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false

  const expected = crypto.createHmac('sha256', secret).update(`${t}.`).update(raw).digest('hex')
  return sigs.some(s => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s, 'hex'), Buffer.from(expected, 'hex')))
}

export function serviceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Resolve the calling user from the `Authorization: Bearer <supabase access token>` header. */
export async function authUser(req: VercelRequest, supa: SupabaseClient) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return null
  const { data, error } = await supa.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

/** Get the user's Stripe customer id, creating the customer on first use. */
export async function getOrCreateCustomer(supa: SupabaseClient, user: { id: string; email?: string | null; user_metadata?: any }): Promise<string> {
  const { data: existing } = await supa.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
  if (existing?.stripe_customer_id) return existing.stripe_customer_id as string

  const customer = await stripe('POST', '/customers', {
    email: user.email ?? undefined,
    name: user.user_metadata?.full_name || undefined,
    metadata: { user_id: user.id },
  }, `customer-${user.id}`)

  const { error } = await supa.from('billing_customers').insert({ user_id: user.id, stripe_customer_id: customer.id })
  if (error) {
    // Lost a race with a parallel request — use whichever row won.
    const { data: again } = await supa.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
    if (again?.stripe_customer_id) return again.stripe_customer_id as string
    throw new Error(`Could not save Stripe customer: ${error.message}`)
  }
  return customer.id
}

export function readRaw(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
