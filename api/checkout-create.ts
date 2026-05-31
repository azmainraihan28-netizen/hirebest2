// Create a Lemon Squeezy checkout session.
// POST body: { variantId: string, userId?: string, email?: string, name?: string }
// Returns:   { url: string }

import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_VARIANTS = new Set(['1726500', '1726509', '1726511', '1726518'])
const BASE_URL = 'https://hirebest.online'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { variantId, userId, email, name } = (req.body ?? {}) as {
    variantId?: string; userId?: string; email?: string; name?: string
  }

  if (!variantId || !ALLOWED_VARIANTS.has(String(variantId))) {
    return res.status(400).json({ error: 'Invalid variantId' })
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!apiKey || !storeId) return res.status(500).json({ error: 'Server not configured' })

  const payload = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: email || undefined,
          name: name || undefined,
          custom: userId ? { user_id: userId } : undefined,
        },
        product_options: {
          redirect_url: `${BASE_URL}/dashboard/orders?paid=1`,
          receipt_button_text: 'Open dashboard',
          receipt_thank_you_note: 'Thanks for picking HireBest. Your access is being provisioned.',
        },
        checkout_options: {
          embed: false,
          dark: true,
          logo: true,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: String(storeId) } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  }

  try {
    const r = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: `Lemon Squeezy ${r.status}: ${t.slice(0, 500)}` })
    }
    const data = await r.json() as any
    const url = data?.data?.attributes?.url
    if (!url) return res.status(502).json({ error: 'No checkout URL returned' })
    return res.status(200).json({ url })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Unknown error' })
  }
}
