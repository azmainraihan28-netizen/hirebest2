import VsPage from '../components/VsPage'

const faqs = [
  {
    q: 'Is HireBest a replacement for Lever?',
    a: 'HireBest and Lever solve different problems. Lever is a full talent CRM covering sourcing, candidate nurturing, pipeline management, and offer workflows. HireBest is an AI resume screener: upload a JD and CVs, get back a ranked shortlist with JD-cited scores in 38 seconds. Teams with large candidate volumes often use both.',
  },
  {
    q: 'Why is HireBest so much cheaper than Lever?',
    a: 'Lever is priced for enterprise talent operations teams — the $5,000–$25,000+/year range reflects per-seat licensing, dedicated CSM, and compliance documentation. HireBest is transparent monthly SaaS pricing — Starter $49/mo, Growth $99/mo, Team $199/mo. No per-seat tax, no implementation project, no sales cycle. Save ~29% with annual billing.',
  },
  {
    q: 'How long does HireBest take to set up vs Lever?',
    a: 'HireBest is same-day: buy, deploy, start screening. Lever implementations typically run 4–12 weeks with IT involvement, data migration, and training. If your bottleneck is speed-to-shortlist rather than enterprise workflow, that 4–12 week gap matters.',
  },
]

export default function VsLever() {
  return (
    <VsPage
      competitor="Lever"
      headline="HireBest vs Lever: Which AI Resume Screener Wins in 2026?"
      intro="Lever lands between $5,000–$25,000+/year with opaque per-seat pricing. HireBest starts at $49/month. Here's the architectural difference behind the price gap."
      forCompetitor={["Enterprise talent organizations", "Dedicated operations teams managing 200+ roles yearly", "Buyers wanting full candidate relationship management"]}
      forUs={["Teams hiring 5–500 roles annually", "Prioritizing screening efficiency over CRM workflows", "Wanting AI as the foundation, not bolted on"]}
      rows={[
        { f: 'Starting price', us: '$49/month', them: '$5,000–$25,000+/year' },
        { f: 'Architecture', us: 'AI-first screening', them: 'CRM with AI bolted on' },
        { f: 'Implementation', us: 'Same-day setup', them: '4–12 weeks' },
        { f: 'Per-resume output', us: 'Score + reasoning + 3–5 interview questions', them: 'Ranking + CRM activity' },
        { f: 'Best for', us: 'Fast screening at any scale', them: 'Enterprise talent ops' },
      ]}
      cta="Run both for one hiring cycle and compare shortlist quality before you renew. HireBest from $49/month."
      faqs={faqs}
    />
  )
}
