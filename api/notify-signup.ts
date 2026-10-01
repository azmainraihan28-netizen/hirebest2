// Receives Supabase Database Webhook for new profile inserts and sends admin notification.
// Configure in Supabase → Database → Webhooks → Create:
//   Table:    profiles
//   Events:   Insert
//   Type:     HTTP Request
//   URL:      https://hirebest.online/api/notify-signup
//   Method:   POST
//   Headers:  { "x-signup-secret": <NOTIFY_WEBHOOK_SECRET value> }

//
// Also sends customer "screening finished" notifications (Team plan and up):
//   POST /api/notify-signup  { kind: "screening-complete", screeningId }  + Authorization: Bearer <session>
// (Kept in this function because the project is at Vercel's 12-function limit.)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { notifyAdmin, sendEmail, fmt } from './_lib/notify.js'
import { serviceClient, authUser, BASE_URL } from './_lib/stripe.js'
import { getQuota, planAtLeast } from './_lib/entitlements.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if ((req.body as any)?.kind === 'screening-complete') return screeningComplete(req, res)

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

/** Email the screening's owner — and, for team screenings, teammates — a Fit/Maybe/Skip summary. */
async function screeningComplete(req: VercelRequest, res: VercelResponse) {
  const supa = serviceClient()
  if (!supa) return res.status(500).json({ error: 'Server not configured' })
  const user = await authUser(req, supa)
  if (!user) return res.status(401).json({ error: 'Not signed in' })
  const screeningId = String((req.body as any)?.screeningId ?? '')
  if (!screeningId) return res.status(400).json({ error: 'Missing screeningId' })

  const { data: s } = await supa.from('screenings').select('id, name, user_id, org_id').eq('id', screeningId).maybeSingle()
  if (!s) return res.status(404).json({ error: 'Screening not found' })
  // Only someone who can see the screening can trigger its notification.
  let allowed = s.user_id === user.id
  if (!allowed && s.org_id) {
    const { data: m } = await supa.from('org_members').select('user_id').eq('org_id', s.org_id).eq('user_id', user.id).maybeSingle()
    allowed = !!m
  }
  if (!allowed) return res.status(403).json({ error: 'Not your screening' })

  const { data: cands } = await supa.from('candidates').select('name, score, verdict').eq('screening_id', screeningId).order('score', { ascending: false })
  const list = cands ?? []
  const count = (v: string) => list.filter(c => c.verdict === v).length

  // Recipients: the owner, plus team members for team screenings.
  let recipientIds = [s.user_id as string]
  if (s.org_id) {
    const { data: members } = await supa.from('org_members').select('user_id').eq('org_id', s.org_id)
    recipientIds = Array.from(new Set([...recipientIds, ...(members ?? []).map(m => m.user_id as string)]))
  }
  const { data: profiles } = await supa.from('profiles').select('id, email, notify_screening_complete').in('id', recipientIds)

  const top = list.slice(0, 5).map(c => `  • ${c.name ?? 'Candidate'} — ${c.score}/100 (${c.verdict})`).join('\n')
  const link = `${BASE_URL}/dashboard/results/${screeningId}`
  const text = [
    `Your screening "${s.name}" has finished.`,
    '',
    `${list.length} CVs scored: ${count('Fit')} Fit · ${count('Maybe')} Maybe · ${count('Skip')} Skip`,
    '',
    top ? `Top candidates:\n${top}` : '',
    '',
    `See the full ranked list: ${link}`,
    '',
    'You can turn these emails off under Account → Email notifications.',
  ].join('\n')

  let sent = 0
  for (const p of profiles ?? []) {
    if (!p.email || p.notify_screening_complete === false) continue
    const q = await getQuota(supa, p.id as string)
    if (q && !planAtLeast(q.plan, 'lifetime')) continue // Team plan feature
    const r = await sendEmail({ to: p.email as string, subject: `Screening finished: ${s.name} — ${count('Fit')} Fit`, text })
    if (r.ok) sent++
  }
  return res.status(200).json({ ok: true, sent })
}
