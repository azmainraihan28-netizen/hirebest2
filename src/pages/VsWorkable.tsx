import VsPage from '../components/VsPage'

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
    />
  )
}
