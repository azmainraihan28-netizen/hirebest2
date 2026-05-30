import VsPage from '../components/VsPage'

export default function VsLever() {
  return (
    <VsPage
      competitor="Lever"
      headline="HireBest vs Lever: Which AI Resume Screener Wins in 2026?"
      intro="Lever lands between $5,000–$25,000+/year with opaque per-seat pricing. HireBest starts at $400/year. Here's the architectural difference behind the price gap."
      forCompetitor={["Enterprise talent organizations", "Dedicated operations teams managing 200+ roles yearly", "Buyers wanting full candidate relationship management"]}
      forUs={["Teams hiring 5–500 roles annually", "Prioritizing screening efficiency over CRM workflows", "Wanting AI as the foundation, not bolted on"]}
      rows={[
        { f: 'Starting price', us: '$400/year', them: '$5,000–$25,000+/year' },
        { f: 'Architecture', us: 'AI-first screening', them: 'CRM with AI bolted on' },
        { f: 'Implementation', us: 'Same-day setup', them: '4–12 weeks' },
        { f: 'Per-resume output', us: 'Score + reasoning + 3–5 interview questions', them: 'Ranking + CRM activity' },
        { f: 'Best for', us: 'Fast screening at any scale', them: 'Enterprise talent ops' },
      ]}
      cta="Run both for one hiring cycle and compare shortlist quality before you renew. HireBest from $400/year."
    />
  )
}
