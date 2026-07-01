import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM = `You are a senior technical recruiter writing a short executive summary for a CV screening report.
You will be given aggregate stats for a batch of screened candidates (no PII).
Write 2-4 sentences of plain-English insight a hiring manager would find useful — call out the fit rate,
the strongest recurring skills, the most common gaps, and any notable pattern in the score distribution.
Do not restate the raw numbers verbatim; interpret them. No markdown, no headers, just prose.
Return ONLY valid JSON: { "summary": "<the paragraph>" }`

type Body = {
  screeningName?: string
  total?: number
  fit?: number
  maybe?: number
  skip?: number
  avgScore?: number
  topSkills?: [string, number][]
  topGaps?: [string, number][]
  scoreBuckets?: number[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = (req.body ?? {}) as Body
  if (typeof body.total !== 'number' || body.total <= 0) {
    return res.status(400).json({ error: 'Missing or empty aggregate stats' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server not configured: OPENAI_API_KEY missing' })

  const userText = [
    `Screening: ${body.screeningName ?? 'Untitled'}`,
    `Total candidates: ${body.total}`,
    `Fit: ${body.fit ?? 0}, Maybe: ${body.maybe ?? 0}, Skip: ${body.skip ?? 0}`,
    `Average score: ${body.avgScore ?? 0}/100`,
    `Score distribution (0-19, 20-39, 40-59, 60-79, 80-100): ${(body.scoreBuckets ?? []).join(', ')}`,
    `Top skills: ${(body.topSkills ?? []).map(([s, n]) => `${s} (${n})`).join(', ') || 'none'}`,
    `Top gaps: ${(body.topGaps ?? []).map(([s, n]) => `${s} (${n})`).join(', ') || 'none'}`,
  ].join('\n')

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userText },
        ],
      }),
    })

    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: `OpenAI ${r.status}: ${t.slice(0, 600)}` })
    }

    const data = await r.json() as any
    const content: string = data?.choices?.[0]?.message?.content ?? '{}'
    let parsed: any
    try { parsed = JSON.parse(content) } catch { return res.status(502).json({ error: 'Model returned invalid JSON', raw: content }) }

    return res.status(200).json({ summary: String(parsed.summary ?? '') })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Unknown error' })
  }
}
