// Creates an org invite row and emails the invitee with a signup/accept link.
// Caller must be a super_admin OR the org_admin of the target org (RLS-enforced via the caller's JWT).
//
// Env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — for authoritative queries & inserts
//   RESEND_API_KEY, NOTIFY_FROM             — email delivery via _lib/notify

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './_lib/notify.js'

type Body = {
  org_id?: string
  email?: string
  role_in_org?: 'org_admin' | 'member'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured' })

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing bearer token' })

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session' })
  const caller = userData.user

  const { org_id, email, role_in_org } = (req.body ?? {}) as Body
  if (!org_id) return res.status(400).json({ error: 'Missing org_id' })
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Missing valid email' })
  const role = role_in_org === 'org_admin' ? 'org_admin' : 'member'

  // Authorization: super_admin OR org_admin of this org
  const { data: profile } = await admin.from('profiles').select('role').eq('id', caller.id).maybeSingle()

  // Sanity check the service-role key. A real user always has a profiles row
  // (created by the auth trigger). If we couldn't read one despite a valid
  // access token, the "service" client is almost certainly the anon key —
  // RLS then blocks every lookup and the caller sees a confusing 403.
  if (!profile) {
    return res.status(500).json({
      error: 'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is missing or set to the anon key. Set it to the service_role secret from Supabase → Project Settings → API.',
    })
  }

  const isSuper = profile.role === 'super_admin' || profile.role === 'admin'
  let authorized = isSuper
  if (!authorized) {
    const { data: member } = await admin.from('org_members')
      .select('role_in_org').eq('org_id', org_id).eq('user_id', caller.id).maybeSingle()
    authorized = member?.role_in_org === 'org_admin'
  }
  if (!authorized) return res.status(403).json({ error: 'Not authorized to invite for this org' })

  const { data: org } = await admin.from('organizations').select('name, seat_limit').eq('id', org_id).maybeSingle()
  if (!org) return res.status(404).json({ error: 'Organization not found' })

  // Reuse a pending invite for this email+org if one exists; otherwise create.
  const { data: existing } = await admin.from('org_invites')
    .select('*').eq('org_id', org_id).is('accepted_at', null)
    .ilike('email', email).maybeSingle()

  let invite = existing
  if (!invite) {
    // Seat-limit enforcement: block if members + pending invites already fill the seats
    // super_admin set for this org. Reusing an existing pending invite (branch above)
    // doesn't consume a new seat, so it skips this check.
    const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
      admin.from('org_members').select('user_id', { count: 'exact', head: true }).eq('org_id', org_id),
      admin.from('org_invites').select('id', { count: 'exact', head: true })
        .eq('org_id', org_id).is('accepted_at', null).gt('expires_at', new Date().toISOString()),
    ])
    const seatLimit = Number(org.seat_limit ?? 0)
    const used = (memberCount ?? 0) + (inviteCount ?? 0)
    if (seatLimit > 0 && used >= seatLimit) {
      return res.status(403).json({
        error: `Seat limit reached (${used}/${seatLimit}). Ask a super admin to raise this organization's seat limit before inviting more members.`,
      })
    }

    const { data: inserted, error: insertErr } = await admin.from('org_invites').insert({
      org_id, email: email.toLowerCase(), role_in_org: role, invited_by: caller.id,
    }).select('*').single()
    if (insertErr) return res.status(500).json({ error: insertErr.message })
    invite = inserted
  }

  const origin = req.headers.origin || `https://${req.headers.host}`
  const link = `${origin}/invite/${invite!.token}`
  const subject = `You've been invited to join ${org.name} on HireBest`
  const text = `Hi,\n\nYou've been invited to join the "${org.name}" workspace on HireBest.\n\nAccept your invite here:\n${link}\n\nThis link expires on ${new Date(invite!.expires_at).toDateString()}.\n\nIf you didn't expect this email, you can safely ignore it.`

  const result = await sendEmail({ to: email, subject, text })
  if (!result.ok) return res.status(502).json({ error: result.error ?? 'Failed to send email', invite })

  return res.status(200).json(invite)
}
