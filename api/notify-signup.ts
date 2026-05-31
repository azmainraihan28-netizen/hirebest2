// Receives Supabase Database Webhook for new profile inserts and sends admin notification.
// Configure in Supabase → Database → Webhooks → Create:
//   Table:    profiles
//   Events:   Insert
//   Type:     HTTP Request
//   URL:      https://hirebest.online/api/notify-signup
//   Method:   POST
//   Headers:  { "x-signup-secret": <NOTIFY_WEBHOOK_SECRET value> }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { notifyAdmin, fmt } from './_lib/notify'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const expected = process.env.NOTIFY_WEBHOOK_SECRET
  if (expected) {
    const provided = (req.headers['x-signup-secret'] as string) ?? ''
    if (provided !== expected) return res.status(401).json({ error: 'bad secret' })
  }

  const body = req.body as any
  const record = body?.record ?? body?.new ?? body
  if (!record) return res.status(400).json({ error: 'no record' })

  const email = record.email ?? 'unknown'
  const name = record.full_name ?? '—'
  const plan = record.plan ?? 'free'
  const id = record.id ?? '—'

  const text = [
    `🎉 New signup on HireBest`,
    '',
    fmt.kv('Name', name),
    fmt.kv('Email', email),
    fmt.kv('Plan', plan),
    fmt.kv('User ID', id),
    fmt.kv('Created', record.created_at ?? fmt.ts()),
  ].join('\n')

  await notifyAdmin({
    subject: `[HireBest] New signup — ${email}`,
    text,
    replyTo: email,
  })

  return res.status(200).json({ ok: true })
}
