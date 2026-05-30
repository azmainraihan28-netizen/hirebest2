import LegalPage from '../components/LegalPage'

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions" updated="Last updated: May 9, 2026">
      <h2>Service overview</h2>
      <p>HireBest offers AI-powered resume screening. Outputs (scores, categories, reasoning) are decision-support, not final hiring decisions. Human review is mandatory for all shortlists.</p>
      <h2>Your responsibilities</h2>
      <ul>
        <li>Maintain accurate account information and secure passwords</li>
        <li>Minimum age requirement: 18 years</li>
        <li>Prohibited activities include unlawful discrimination, data processing without legal basis, and service tampering</li>
      </ul>
      <h2>Content & ownership</h2>
      <p>You retain ownership of uploaded materials. HireBest receives a limited license to host, process, and display Customer Content solely to operate the Service for you.</p>
      <h2>AI limitations</h2>
      <p>AI outputs may be inaccurate, biased, or incomplete. You bear sole responsibility for hiring decisions and must comply with employment and data-protection laws.</p>
      <h2>Liability</h2>
      <p>HireBest provides the service "as is" with no warranties. Liability is capped at fees paid during the preceding 12 months, excluding indirect or consequential damages.</p>
      <h2>Billing</h2>
      <p>One-time plans charge upon confirmation; monthly plans renew automatically until cancelled. Taxes apply unless excluded.</p>
      <h2>Governance</h2>
      <p>Delaware law governs these terms. Contact: contact@hirebest.online</p>
    </LegalPage>
  )
}
