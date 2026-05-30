export type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  author: string
  body: string[]
}

export const posts: Post[] = [
  {
    slug: 'ai-ats-wrong-way-to-think',
    title: "Why 'AI ATS' is the Wrong Way to Think About Hiring",
    excerpt: "The category label hides the real shift. AI doesn't replace your ATS — it replaces the part of your day spent reading the wrong resumes.",
    category: 'Opinion',
    date: 'Feb 15, 2026',
    readTime: '5 min read',
    author: 'HireBest Team',
    body: [
      "Everyone is calling their product an \"AI ATS\" now. The category label has become a sales pitch, and like most sales pitches, it obscures more than it explains.",
      "Here's what's actually going on — and why the framing matters more than you'd expect.",
      "## What an ATS does",
      "An Applicant Tracking System is, at its core, a database with a workflow on top. It stores candidate records, routes applications to the right people, tracks where each candidate is in the hiring process, and keeps records for compliance.",
      "Greenhouse, Workable, Lever — these are all doing versions of the same thing. The workflow varies. The integrations vary. The price varies considerably. But the underlying job is identical: keep track of who applied, where they are, and what happened.",
      "## What AI actually does in hiring",
      "When companies say \"AI ATS,\" they usually mean one of two things. The first is AI features added to an existing ATS — a ranking layer, a summary blurb, a smart filter. The second is a genuinely different product category: AI-first screening tools that don't replace your ATS but handle the job that ATS software was never designed for — actually evaluating whether a candidate is right for the role.",
      "> The ATS solved the storage and tracking problem. AI screening solves the evaluation problem. These are different problems, and conflating them leads to buying the wrong tool.",
      "## The question that cuts through it",
      "The question isn't \"is this AI?\" — everything is AI now, including the autocomplete on your phone. The question is: what specific step in the hiring process does this help with, and is that the step where I'm losing time?",
      "For most teams under 200 people, the painful step isn't candidate tracking. The painful step is the 4 hours a recruiter spends reading CVs before they ever pick up the phone. That's the evaluation problem. AI screening tools solve it.",
    ],
  },
  {
    slug: 'greenhouse-pricing-2026',
    title: "Greenhouse Pricing in 2026: What's Really Going On",
    excerpt: "Public benchmarks, leaked quotes, and procurement reports — what an annual Greenhouse contract actually costs SMEs in 2026.",
    category: 'Industry',
    date: 'Feb 8, 2026',
    readTime: '8 min read',
    author: 'HireBest Team',
    body: [
      "## The short version",
      "Greenhouse does not publish its prices. Every quote is custom, which means two companies hiring at the same volume can pay very different amounts. What procurement data, Vendr reports, and G2 reviewer comments consistently show is this: Essential tier starts around $5,000–$6,500 per year for teams under 100 employees. By the time you add hiring manager seats and interviewer access, that number often lands at $9,000–$14,000 in year one.",
      "## The three tiers Greenhouse actually sells",
      "Greenhouse sells Essential, Advanced, and Expert. Only Enterprise deals get Expert quotes. Most SMEs land on Essential or Advanced.",
      "**Essential** covers the core ATS: job postings, pipeline stages, scorecards, basic reporting. Real-world spend for a 50-person company with 3–5 active roles lands around $5,500–$7,000 per year.",
      "**Advanced** adds sourcing automations, deeper reporting, and DEI dashboards. Teams that need these features typically pay $9,000–$15,000 per year once seat counts go above 10.",
      "**Expert** is custom-quoted and designed for 500+ employee orgs running structured hiring programs at scale. Expect $20,000+ annually.",
      "## The per-seat problem",
      "Greenhouse's pricing model is not per-job — it is per-seat. Every recruiter, hiring manager, and interviewer who needs access counts as a seat. A 50-person company with 2 dedicated recruiters might think they need 2 seats. In practice, once you add 5 hiring managers and 10 interviewers who need to leave scorecards, you are looking at 17 seats.",
      "## The alternative math",
      "HireBest's Advanced plan costs $900 per year. It covers unlimited screening, multi-user access, bulk CV uploads, custom branding, and AI scoring with JD-cited reasoning. That is a $6,100 per year difference against Greenhouse Essential — before the renewal hikes kick in.",
    ],
  },
  {
    slug: 'screen-100-cvs-in-38-seconds',
    title: 'How to Screen 100 CVs in 38 Seconds',
    excerpt: 'A walkthrough of how AI scoring compresses a full afternoon of resume review into a single coffee break — without losing nuance.',
    category: 'Tutorials',
    date: 'Feb 1, 2026',
    readTime: '6 min read',
    author: 'HireBest Team',
    body: [
      "## Where the 38 seconds comes from",
      "38 seconds is the median time for a 100-CV batch on HireBest's scoring engine, measured across batches submitted in January and February 2026. The range is 28–54 seconds depending on file size and OCR complexity. 100 CVs in under a minute is not a marketing number — it is what the system logs show.",
      "## What actually happens in those 38 seconds",
      "When you drop 100 CVs and a job description into HireBest, three things run in parallel for each candidate: extraction, matching, and output generation.",
      "**Extraction.** The parser reads the raw file and pulls structured data: current title, company history, years of experience, education, skills listed.",
      "**Matching.** The scoring model reads the extracted candidate data against your job description, looking for explicit matches, implicit matches, and gaps.",
      "**Output generation.** For each candidate, the model writes a 0–100 fit score, a brief rationale, and 3–5 interview questions targeting the specific gaps.",
      "## The actual time saving",
      "If a hiring manager was previously spending 4 hours screening 50 CVs per role and hiring for 20 roles per year, that is 80 hours of resume reading annually. At a fully-loaded cost of $60/hour, that is $4,800 of management time on a task that takes the AI 8 minutes total. HireBest Advanced costs $900/year. The arithmetic is not complicated.",
    ],
  },
]

export const getPost = (slug: string) => posts.find(p => p.slug === slug)
