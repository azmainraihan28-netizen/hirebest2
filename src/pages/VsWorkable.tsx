import VsPage from '../components/VsPage'

const faqs = [
  {
    q: 'What is the best Workable alternative?',
    a: 'It depends on what you need. If you need a full ATS, Greenhouse and Lever are the usual alternatives (see our Greenhouse vs Workable comparison). If your real bottleneck is reading and shortlisting CVs, HireBest is a lower-cost Workable alternative focused on AI resume screening: every CV is scored 0–100 against your JD with written reasoning, from $49/month.',
  },
  {
    q: 'How much does Workable cost?',
    a: 'For the smallest company-size band (1–20 employees), Workable lists Standard at $299/month (about $3,588/year), Premier at $599/month and Enterprise at $719/month. Prices rise with headcount, and add-ons like video interviews and SMS are extra — a typical Standard setup costs about $5,800 in year one.',
  },
  {
    q: 'How does HireBest differ from Workable for resume screening?',
    a: 'HireBest is purpose-built for AI resume screening — every CV gets a 0–100 score with JD-cited reasoning explaining why. Workable is a full ATS with semantic matching bolted on; the AI reasoning depth is limited. If your bottleneck is reading 100 CVs fast, HireBest solves it directly.',
  },
  {
    q: 'Is HireBest cheaper than Workable?',
    a: 'Yes. Workable Standard is $299/month (~$3,588/year) before add-ons. HireBest plans start at $49/month (Starter) with the popular Growth tier at $99/month ($840/year billed annually). No per-job-posting fees, no annual lock-in — cancel anytime.',
  },
  {
    q: 'Does HireBest replace Workable entirely?',
    a: 'No — and we say so honestly. Workable handles job posting, careers pages, candidate pipelines, and scheduling. HireBest handles one thing: getting from a pile of CVs to a ranked shortlist in seconds. Many teams use both: Workable for pipeline management, HireBest for triage.',
  },
]

export default function VsWorkable() {
  return (
    <VsPage
      competitor="Workable"
      headline="HireBest vs Workable: Which AI Resume Screener Wins in 2026?"
      seoTitle="Workable Alternative for AI Resume Screening — HireBest vs Workable"
      intro="Looking for a Workable alternative? Workable costs $299–$719/month for its smallest company-size band (Standard is $299/month, about $3,588/year before add-ons). HireBest starts at $49/month with a 14-day free trial. Here's how the two actually differ."
      forCompetitor={["Mid-market HR teams wanting a full ATS + careers page", "UK/AU markets needing job-board syndication", "Teams that already use pipeline management daily"]}
      forUs={["Teams whose actual blocker is a CV pile they can't read fast enough", "Smaller orgs (10–500) prioritizing AI depth over full ATS features", "Buyers who want transparent SaaS pricing without per-job-posting fees"]}
      rows={[
        { f: 'Starting price', us: '$49/month', them: '$299/month Standard (1–20 employees)' },
        { f: 'Free trial', us: '14 days, no credit card', them: '15 days, no credit card required' },
        { f: 'AI scoring', us: '0–100 with JD-cited reasoning', them: 'Semantic match, limited reasoning' },
        { f: 'Per-job limits', us: 'Unlimited active jobs on Team plan', them: 'Yes on lower tiers' },
        { f: 'Setup time', us: 'Same day', them: '1–7 days' },
      ]}
      cta="Skip the per-job meter. Start your 14-day free trial today."
      faqs={faqs}
    />
  )
}
