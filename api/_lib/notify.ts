// Send admin-notification emails via Resend.
// Env vars:
//   RESEND_API_KEY  — API key from resend.com
//   NOTIFY_TO       — comma-separated recipient list (default: contact@hirebest.online)
//   NOTIFY_FROM     — verified sender (default: "HireBest Alerts <alerts@hirebest.online>")

const API = 'https://api.resend.com/emails'

type Attachment = {
  filename: string
  /** Base64-encoded file content (no data: prefix). */
  content: string
}

type Payload = {
  subject: string
  text: string
  html?: string
  replyTo?: string
  attachments?: Attachment[]
}

async function resendSend(p: Payload & { to: string[]; from: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[notify] RESEND_API_KEY not set — skipping')
    return { ok: false, error: 'No API key' }
  }
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: p.from,
        to: p.to,
        subject: p.subject,
        text: p.text,
        html: p.html ?? wrapHtml(p.text),
        reply_to: p.replyTo,
        attachments: p.attachments,
      }),
    })
    if (!r.ok) {
      const t = await r.text()
      console.error('[notify] Resend error', r.status, t)
      return { ok: false, error: `Resend ${r.status}: ${t.slice(0, 300)}` }
    }
    return { ok: true }
  } catch (e: any) {
    console.error('[notify] send failed', e)
    return { ok: false, error: e?.message ?? 'send failed' }
  }
}

export async function notifyAdmin(p: Payload): Promise<{ ok: boolean; error?: string }> {
  const to = (process.env.NOTIFY_TO || 'contact@hirebest.online').split(',').map(s => s.trim()).filter(Boolean)
  const from = process.env.NOTIFY_FROM || 'HireBest Alerts <alerts@hirebest.online>'
  return resendSend({ ...p, to, from })
}

export async function sendEmail(p: Payload & { to: string }): Promise<{ ok: boolean; error?: string }> {
  const from = process.env.NOTIFY_FROM || 'HireBest <alerts@hirebest.online>'
  return resendSend({ ...p, to: [p.to], from })
}

function wrapHtml(text: string): string {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7fb;padding:24px;color:#0d1130;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e6f0;border-radius:12px;padding:24px;">
      <div style="font-size:13px;color:#5b6385;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">HireBest · Admin alert</div>
      <div style="margin-top:14px;line-height:1.6;font-size:15px;">${safe}</div>
      <hr style="border:0;border-top:1px solid #e3e6f0;margin:24px 0;">
      <div style="font-size:12px;color:#5b6385;">Sent automatically from hirebest.online · <a href="https://hirebest.online/admin" style="color:#2f7bff;">Open admin panel</a></div>
    </div>
  </body></html>`
}

/** Helpers for common notification formats */
export const fmt = {
  divider: () => '---',
  kv: (label: string, value: any) => `${label}: ${value ?? '—'}`,
  ts: () => new Date().toISOString(),
}
