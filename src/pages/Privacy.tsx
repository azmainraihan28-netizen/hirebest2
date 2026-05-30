import LegalPage from '../components/LegalPage'

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated: May 9, 2026">
      <h2>What we collect</h2>
      <p>HireBest collects account information, uploaded job descriptions and resumes, usage analytics, and billing details. We do not store full card numbers.</p>
      <h2>Our role</h2>
      <p>Recruiters control candidate data. HireBest acts as a processor on your behalf. You confirm you have lawful authorization to share CVs with the platform.</p>
      <h2>AI and third parties</h2>
      <p>Resume screening relies on external language models through data-processing agreements. We do not allow these providers to train their models on your data.</p>
      <h2>Data protection</h2>
      <p>Information is protected via encryption during transmission and storage, with restricted staff access. No system is 100% secure; we will notify you promptly of any breach.</p>
      <h2>Your rights</h2>
      <p>You can request access, correction, export, or deletion by contacting privacy@hirebest.online.</p>
      <h2>Compliance</h2>
      <p>The service respects GDPR and CCPA regulations. Data requests through the privacy email address.</p>
      <h2>Contact</h2>
      <p>For questions, email contact@hirebest.online.</p>
    </LegalPage>
  )
}
