import VsPage from '../components/VsPage'

export default function VsGreenhouse() {
  return (
    <VsPage
      competitor="Greenhouse"
      headline="HireBest vs Greenhouse: Which AI Resume Screener Wins in 2026?"
      intro="Greenhouse costs around $7,000 per year. HireBest starts at $400/year. Here's how the two compare on features, pricing, and what they're actually built for."
      forCompetitor={["200+ employee organizations", "Six-figure recruiting budgets", "Deep integrations across 50+ HR tools"]}
      forUs={["Teams of 10–500 employees", "Wanting AI screening without subscription fatigue", "Preferring data ownership and a self-hosted path"]}
      rows={[
        { f: 'Starting price', us: '$400/year', them: '~$7,000/year' },
        { f: 'Lifetime / ownership option', us: 'Yes (Custom Integrated tier)', them: 'No' },
        { f: 'AI scoring', us: '0–100 with JD-cited reasoning', them: 'Basic ranking' },
        { f: 'Implementation time', us: '1–14 days', them: '30–90 days' },
        { f: 'Integrations', us: 'LinkedIn, Workday APIs', them: '400+ marketplace partners' },
        { f: 'Best for', us: 'AI-first screening', them: 'Enterprise ATS workflows' },
      ]}
      cta="Start screening with HireBest today. No sales call, no procurement cycle, no per-seat tax — yearly plans from $400."
    />
  )
}
