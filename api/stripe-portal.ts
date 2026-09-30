// Open the Stripe customer portal (update card, switch plan, cancel, invoices).
// Auth:    Authorization: Bearer <supabase access token>
// Returns: { url: string }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripe, serviceClient, authUser, BASE_URL } from './_lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supa = serviceClient()
  if (!supa) return res.status(500).json({ error: 'Server not configured' })
  const user = await authUser(req, supa)
  if (!user) return res.status(401).json({ error: 'Please sign in' })

  const { data } = await supa.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
  if (!data?.stripe_customer_id) return res.status(404).json({ error: 'No billing account yet — pick a plan first.' })

  try {
    const portal = await stripe('POST', '/billing_portal/sessions', {
      customer: data.stripe_customer_id,
      return_url: `${BASE_URL}/dashboard/orders`,
    })
    return res.status(200).json({ url: portal.url })
  } catch (e: any) {
    console.error('[stripe-portal]', e)
    return res.status(500).json({ error: e?.message ?? 'Could not open billing portal' })
  }
}
