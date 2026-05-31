// Contact form submission → email notification to admin.
// POST body: { name, email, company?, message }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { notifyAdmin, fmt } from './_lib/notify'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, company, message } = (req.body ?? {}) as {
    name?: string; email?: string; company?: string; message?: string
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'name, email, and message are required' })
  }

  // Sanity: avoid open-relay spam — cap field lengths
  if (name.length > 200 || email.length > 200 || (company?.length ?? 0) > 200 || message.length > 5000) {
    return res.status(413).json({ error: 'Field too long' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const text = [
    `📨 New contact form submission`,
    '',
    fmt.kv('Name', name),
    fmt.kv('Email', email),
    fmt.kv('Company', company || '—'),
    '',
    '--- Message ---',
    message,
    '',
    fmt.divider(),
    fmt.kv('Submitted', fmt.ts()),
    fmt.kv('User-Agent', (req.headers['user-agent'] as string) ?? '—'),
  ].join('\n')

  const result = await notifyAdmin({
    subject: `[HireBest] Contact form — ${name}`,
    text,
    replyTo: email,
  })

  if (!result.ok) return res.status(502).json({ error: result.error })
  return res.status(200).json({ ok: true })
}
