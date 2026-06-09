// Order inquiry form → thank-you email to customer + full details to admin.
// POST body: { name, email, company?, notes?, plan, planPrice }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { notifyAdmin, sendEmail, fmt } from './_lib/notify.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, company, notes, plan, planPrice } = (req.body ?? {}) as {
    name?: string; email?: string; company?: string; notes?: string
    plan?: string; planPrice?: string
  }

  if (!name?.trim() || !email?.trim() || !plan?.trim()) {
    return res.status(400).json({ error: 'name, email, and plan are required' })
  }
  if (name.length > 200 || email.length > 200 || (company?.length ?? 0) > 200 || (notes?.length ?? 0) > 5000) {
    return res.status(413).json({ error: 'Field too long' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  // Email to admin
  const adminText = [
    `🛒 New order inquiry`,
    '',
    fmt.kv('Plan', `${plan} — ${planPrice}`),
    fmt.kv('Name', name),
    fmt.kv('Email', email),
    fmt.kv('Company', company || '—'),
    '',
    '--- Notes ---',
    notes || '(none)',
    '',
    fmt.divider(),
    fmt.kv('Submitted', fmt.ts()),
    fmt.kv('User-Agent', (req.headers['user-agent'] as string) ?? '—'),
  ].join('\n')

  const adminHtml = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7fb;padding:24px;color:#0d1130;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e6f0;border-radius:12px;padding:28px;">
    <div style="font-size:13px;color:#5b6385;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">HireBest · New Order Inquiry</div>
    <h2 style="margin:16px 0 4px;font-size:20px;">🛒 ${name} wants <span style="color:#2f7bff;">${plan}</span></h2>
    <p style="margin:0 0 20px;color:#5b6385;font-size:14px;">${planPrice}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#5b6385;width:110px;">Name</td><td style="padding:6px 0;font-weight:500;">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6385;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#2f7bff;">${email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#5b6385;">Company</td><td style="padding:6px 0;">${company || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#5b6385;vertical-align:top;">Notes</td><td style="padding:6px 0;">${notes ? notes.replace(/\n/g, '<br>') : '—'}</td></tr>
    </table>
    <hr style="border:0;border-top:1px solid #e3e6f0;margin:20px 0;">
    <div style="font-size:12px;color:#5b6385;">Submitted ${fmt.ts()}</div>
  </div>
</body></html>`

  // Thank-you email to customer
  const customerHtml = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7fb;padding:24px;color:#0d1130;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e6f0;border-radius:12px;padding:28px;">
    <div style="font-size:13px;color:#5b6385;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">HireBest</div>
    <h2 style="margin:16px 0 8px;font-size:22px;">Thank you, ${name}! 🎉</h2>
    <p style="font-size:15px;line-height:1.6;color:#2d3250;">We've received your inquiry for the <strong>${plan}</strong> plan (${planPrice}) and we'll get back to you within <strong>24 hours</strong>.</p>
    <div style="background:#f6f7fb;border-radius:8px;padding:16px;margin:20px 0;font-size:14px;">
      <div style="font-weight:600;margin-bottom:8px;">Your inquiry summary</div>
      <div style="color:#5b6385;line-height:1.8;">
        Plan: <strong style="color:#0d1130;">${plan} — ${planPrice}</strong><br>
        ${company ? `Company: <strong style="color:#0d1130;">${company}</strong><br>` : ''}
        ${notes ? `Notes: <em style="color:#0d1130;">${notes.replace(/\n/g, '<br>')}</em>` : ''}
      </div>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#5b6385;">In the meantime, feel free to reply to this email or reach us at <a href="mailto:contact@hirebest.online" style="color:#2f7bff;">contact@hirebest.online</a>.</p>
    <hr style="border:0;border-top:1px solid #e3e6f0;margin:24px 0;">
    <div style="font-size:12px;color:#5b6385;">HireBest · AI-powered candidate screening · <a href="https://hirebest.online" style="color:#2f7bff;">hirebest.online</a></div>
  </div>
</body></html>`

  const [adminResult, customerResult] = await Promise.all([
    notifyAdmin({ subject: `[HireBest] Order Inquiry — ${name} (${plan})`, text: adminText, html: adminHtml, replyTo: email }),
    sendEmail({ to: email, subject: `We received your HireBest inquiry — ${plan}`, text: `Hi ${name},\n\nThank you for your interest in HireBest ${plan} (${planPrice}).\n\nWe'll get back to you within 24 hours.\n\n— HireBest Team\ncontact@hirebest.online`, html: customerHtml }),
  ])

  if (!adminResult.ok) return res.status(502).json({ error: adminResult.error })
  // customer email failure is non-blocking — log but don't fail the request
  if (!customerResult.ok) console.error('[order-inquiry] customer email failed:', customerResult.error)

  return res.status(200).json({ ok: true })
}
