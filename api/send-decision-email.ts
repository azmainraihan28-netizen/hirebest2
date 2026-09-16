// Sends the interview-invite / rejection email when a recruiter manually
// shortlists or rejects a candidate, then marks status_email_sent so it's
// never sent twice for the same decision.
//
// Env vars required:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — to flip status_email_sent
//   RESEND_API_KEY, NOTIFY_FROM             — used by sendEmail (see _lib/notify.ts)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './_lib/notify.js'

type Body = {
  candidateId?: string
  email?: string
  name?: string | null
  status?: 'shortlisted' | 'rejected'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { candidateId, email, name, status } = (req.body ?? {}) as Body
  if (!candidateId) return res.status(400).json({ error: 'Missing candidateId' })
  if (!email) return res.status(400).json({ error: 'Missing email' })
  if (status !== 'shortlisted' && status !== 'rejected') return res.status(400).json({ error: 'status must be shortlisted or rejected' })

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured: Supabase service role missing' })
  const supa = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // The caller must be signed in and own (or share the org of) the candidate's
  // screening — this route runs with the service role, so without this check
  // anyone could act on another account's candidates.
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing bearer token' })
  const { data: userData, error: userErr } = await supa.auth.getUser(token)
  if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session' })
  const caller = userData.user

  const { data: candidate, error: fetchError } = await supa
    .from('candidates')
    .select('status_email_sent, screenings!inner(user_id, org_id)')
    .eq('id', candidateId)
    .maybeSingle()
  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' })

  const screening = (candidate as any).screenings as { user_id: string; org_id: string | null } | null
  let allowed = screening?.user_id === caller.id
  if (!allowed && screening?.org_id) {
    const { data: member } = await supa.from('org_members')
      .select('user_id').eq('org_id', screening.org_id).eq('user_id', caller.id).maybeSingle()
    allowed = !!member
  }
  if (!allowed) return res.status(403).json({ error: 'Not authorized for this candidate' })

  if (candidate.status_email_sent) return res.status(200).json({ ok: true, skipped: 'already sent' })

  const greeting = name ? name.split(' ')[0] : 'there'
  const { subject, text } = status === 'shortlisted'
    ? {
        subject: 'You have been shortlisted — next steps',
        text: `Hi ${greeting},\n\nGreat news — you've been shortlisted for the next stage of our hiring process. Our team will be in touch shortly to schedule an interview.\n\nThanks for your interest!`,
      }
    : {
        subject: 'Update on your application',
        text: `Hi ${greeting},\n\nThank you for taking the time to apply. After careful review, we've decided to move forward with other candidates for this role.\n\nWe appreciate your interest and wish you the best in your search.`,
      }

  const result = await sendEmail({ to: email, subject, text })
  if (!result.ok) return res.status(502).json({ error: result.error ?? 'Failed to send email' })

  await supa.from('candidates').update({ status_email_sent: true }).eq('id', candidateId)
  return res.status(200).json({ ok: true })
}
