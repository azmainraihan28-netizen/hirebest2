import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM = `You are a senior technical recruiter scoring a single candidate CV against a job description.

Return ONLY valid JSON (no markdown, no commentary) matching this schema:
{
  "score": <integer 0-100>,
  "verdict": "Fit" | "Maybe" | "Skip",
  "summary": "<2-3 sentence overall match summary, cite specific JD requirements>",
  "strengths": [<3-5 short strings>],
  "gaps": [<2-4 short strings>],
  "questions": [<5 interview questions targeting the gaps and unverified claims>]
}

Scoring guidance:
- 80-100 = Fit (strong match on most must-haves, minor gaps only)
- 50-79 = Maybe (some core matches, notable gaps worth probing)
- 0-49  = Skip (missing critical requirements)
Be conservative on ambiguous signals. Score what the CV actually demonstrates, not what it implies.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { jd, cv } = (req.body ?? {}) as { jd?: string; cv?: string }
  if (!jd || !cv) return res.status(400).json({ error: 'Missing jd or cv' })
  if (jd.length > 20000 || cv.length > 20000) return res.status(413).json({ error: 'Input too large (20k char limit per field)' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server not configured: OPENAI_API_KEY missing' })

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `JOB DESCRIPTION:\n${jd}\n\n---\n\nCANDIDATE CV:\n${cv}` },
        ],
      }),
    })

    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: `OpenAI ${r.status}: ${t.slice(0, 500)}` })
    }

    const data = await r.json() as any
    const content: string = data?.choices?.[0]?.message?.content ?? '{}'
    let parsed: any
    try { parsed = JSON.parse(content) } catch { return res.status(502).json({ error: 'Model returned invalid JSON', raw: content }) }

    return res.status(200).json({
      score: clamp(Math.round(parsed.score ?? 0), 0, 100),
      verdict: ['Fit','Maybe','Skip'].includes(parsed.verdict) ? parsed.verdict : verdictFromScore(parsed.score ?? 0),
      summary: String(parsed.summary ?? ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6).map(String) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 6).map(String) : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 6).map(String) : [],
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Unknown error' })
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const verdictFromScore = (n: number) => n >= 80 ? 'Fit' : n >= 50 ? 'Maybe' : 'Skip'
