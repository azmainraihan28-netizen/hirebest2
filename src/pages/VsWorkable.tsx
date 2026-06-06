import VsPage from '../components/VsPage'

const faqs = [
  {
    q: 'How does HireBest differ from Workable for resume screening?',
    a: 'HireBest is purpose-built for AI resume screening — every CV gets a 0–100 score with JD-cited reasoning explaining why. Workable is a full ATS with semantic matching bolted on; the AI reasoning depth is limited. If your bottleneck is reading 100 CVs fast, HireBest solves it directly.',
  },
  {
    q: 'Is HireBest cheaper than Workable?',
    a: 'Yes. Workable starts at $299/month (~$3,588/year) with per-job posting limits on lower tiers. HireBest Advanced is $900/year flat with unlimited screenings. The Custom Integrated tier ($1,500 one-time) has no annual renewal at all.',
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
      intro="Workable runs around $299/month (~$3,588/year). HireBest starts at $400/year. Here's how the two products actually differ."
      forCompetitor={["Mid-market HR teams valuing month-to-month flexibility", "UK/AU markets needing job-board syndication", "Teams wanting an all-in-one careers page + ATS"]}
      forUs={["Teams whose actual blocker is a CV pile they can't read fast enough", "Smaller orgs (10–500) prioritizing AI depth over full ATS features", "Buyers who want a yearly price, not a monthly meter"]}
      rows={[
        { f: 'Starting price', us: '$400/year', them: '$299/month (~$3,588/year)' },
        { f: 'AI scoring', us: '0–100 with JD-cited reasoning', them: 'Semantic match, limited reasoning' },
        { f: 'Ownership option', us: 'Yes (Custom Integrated tier)', them: 'No' },
        { f: 'Per-job limits', us: 'Unlimited across tiers', them: 'Yes on Starter tier' },
        { f: 'Setup time', us: '1–14 days', them: '1–7 days' },
      ]}
      cta="Skip the monthly meter. Start screening with HireBest today."
      faqs={faqs}
    />
  )
}
