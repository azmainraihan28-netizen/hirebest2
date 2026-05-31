import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM = `You are a senior technical recruiter scoring a single candidate CV against a job description.

You will be given the JD and a candidate CV (text or image of a resume).
Extract the candidate's information AND score them.

Return ONLY valid JSON (no markdown, no commentary) matching this schema:
{
  "name": "<candidate full name, or null if unreadable>",
  "email": "<candidate email, or null>",
  "experience_years": <number or null — total years of relevant work>,
  "skills": [<5-8 top skills as short strings — prefer JD-relevant ones>],
  "score": <integer 0-100>,
  "verdict": "Fit" | "Maybe" | "Skip",
  "summary": "<2-3 sentence overall match, cite specific JD requirements>",
  "strengths": [<3-5 short strings>],
  "gaps": [<2-4 short strings>],
  "questions": [
    { "q": "<question text>", "tag": "Strength Validation" | "Skill Gap" | "Experience Probe" | "Culture Fit" | "Behavioral", "why": "<1-2 sentence explanation of what the question probes>" },
    ... (exactly 5 questions, tags should vary)
  ]
}

Scoring guidance:
- 80-100 = Fit (strong match on most must-haves, minor gaps only)
- 50-79 = Maybe (some core matches, notable gaps worth probing)
- 0-49  = Skip (missing critical requirements)
Be conservative on ambiguous signals.`

type Body = {
  jd?: string
  fileName?: string
  cv?: { text?: string; imageBase64?: string; mimeType?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { jd, fileName, cv } = (req.body ?? {}) as Body
  if (!jd) return res.status(400).json({ error: 'Missing jd' })
  if (!cv || (!cv.text && !cv.imageBase64)) return res.status(400).json({ error: 'Missing cv.text or cv.imageBase64' })
  if (jd.length > 30000) return res.status(413).json({ error: 'JD too large (30k char limit)' })
  if (cv.text && cv.text.length > 30000) return res.status(413).json({ error: 'CV text too large (30k char limit)' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server not configured: OPENAI_API_KEY missing' })

  // Build user message content (text or vision)
  const userText = `JOB DESCRIPTION:\n${jd}\n\n---\n\n${cv.text ? `CANDIDATE CV (text):\n${cv.text}` : `CANDIDATE CV is in the attached image. Filename: ${fileName ?? 'cv.png'}`}`
  const userContent: any[] = [{ type: 'text', text: userText }]
  if (cv.imageBase64) {
    const mime = cv.mimeType || 'image/png'
    userContent.push({ type: 'image_url', image_url: { url: `data:${mime};base64,${cv.imageBase64}` } })
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userContent },
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

    const score = clamp(Math.round(Number(parsed.score) || 0), 0, 100)
    return res.status(200).json({
      name: nonEmpty(parsed.name) ?? null,
      email: nonEmpty(parsed.email) ?? null,
      experience_years: typeof parsed.experience_years === 'number' ? parsed.experience_years : null,
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 8).map(String) : [],
      score,
      verdict: ['Fit','Maybe','Skip'].includes(parsed.verdict) ? parsed.verdict : verdictFromScore(score),
      summary: String(parsed.summary ?? ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6).map(String) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 6).map(String) : [],
      questions: normalizeQuestions(parsed.questions),
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Unknown error' })
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const verdictFromScore = (n: number) => n >= 80 ? 'Fit' : n >= 50 ? 'Maybe' : 'Skip'
const nonEmpty = (v: any) => typeof v === 'string' && v.trim() ? v.trim() : null

const VALID_TAGS = ['Strength Validation','Skill Gap','Experience Probe','Culture Fit','Behavioral']
function normalizeQuestions(qs: any): any[] {
  if (!Array.isArray(qs)) return []
  return qs.slice(0, 6).map((x: any) => ({
    q: String(x?.q ?? ''),
    tag: VALID_TAGS.includes(x?.tag) ? x.tag : 'Behavioral',
    why: String(x?.why ?? ''),
  })).filter(x => x.q)
}
