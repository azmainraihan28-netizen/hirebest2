import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM = `You read a job description and return only a short, clean job-role name suitable as a screening label.
Rules:
- Max 60 characters.
- No company names, no punctuation like quotes/emojis, no trailing period.
- Prefer the role title as written (e.g. "Senior Backend Engineer"). Add a level/qualifier only if it's obvious in the JD.
- Output the plain role name only, nothing else.`

type Body = { jd?: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { jd } = (req.body ?? {}) as Body
  if (!jd || !jd.trim()) return res.status(400).json({ error: 'Missing jd' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server not configured: OPENAI_API_KEY missing' })

  const trimmed = jd.slice(0, 4000)

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 30,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: trimmed },
        ],
      }),
    })

    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: `OpenAI ${r.status}: ${t.slice(0, 300)}` })
    }

    const data = await r.json() as any
    const raw: string = data?.choices?.[0]?.message?.content ?? ''
    const name = cleanName(raw)
    if (!name) return res.status(200).json({ name: '' })
    return res.status(200).json({ name })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Unknown error' })
  }
}

function cleanName(raw: string): string {
  let s = raw.trim()
  // strip surrounding quotes/backticks/markdown
  s = s.replace(/^["'`*_\s]+|["'`*_\s]+$/g, '')
  // drop a trailing period
  s = s.replace(/\.$/, '')
  // collapse whitespace
  s = s.replace(/\s+/g, ' ')
  // hard cap at 60 chars
  if (s.length > 60) s = s.slice(0, 60).trim()
  return s
}
