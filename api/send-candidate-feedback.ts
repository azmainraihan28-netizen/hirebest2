// Emails a candidate-specific feedback PDF (scores, strengths, gaps, reasoning)
// generated client-side, attached via Resend.
//
// Env vars required: RESEND_API_KEY, NOTIFY_FROM (see _lib/notify.ts)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendEmail } from './_lib/notify.js'

type Body = {
  email?: string
  name?: string | null
  pdfBase64?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, pdfBase64 } = (req.body ?? {}) as Body
  if (!email) return res.status(400).json({ error: 'Missing email' })
  if (!pdfBase64) return res.status(400).json({ error: 'Missing pdfBase64' })
  if (pdfBase64.length > 8_000_000) return res.status(413).json({ error: 'PDF too large' })

  const greeting = name ? name.split(' ')[0] : 'there'
  const result = await sendEmail({
    to: email,
    subject: 'Your interview feedback',
    text: `Hi ${greeting},\n\nThanks for going through our screening process. We've attached a short feedback summary covering your match score, strengths, and areas for growth — we hope it's useful.\n\nBest of luck!`,
    attachments: [{ filename: 'feedback.pdf', content: pdfBase64 }],
  })
  if (!result.ok) return res.status(502).json({ error: result.error ?? 'Failed to send email' })

  return res.status(200).json({ ok: true })
}
