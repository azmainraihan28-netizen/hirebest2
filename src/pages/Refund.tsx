import LegalPage from '../components/LegalPage'
import { useSeo } from '../lib/seo'

export default function Refund() {
  useSeo({
    title: 'Refund Policy · HireBest',
    description: '14-day free trial on all paid plans. Monthly plans cancellable anytime. Annual plans get prorated refunds within 30 days. Submit requests to contact@hirebest.online.',
    canonical: 'https://hirebest.online/refund-policy',
    noindex: true,
  })
  return (
    <LegalPage title="Refund Policy" updated="Last updated: May 9, 2026">
      <h2>Free trial</h2>
      <p>Every paid plan (Starter, Growth, Team) includes a 14-day free trial — no credit card required to start. Cancel anytime during the trial and you will not be charged.</p>
      <h2>Monthly plans</h2>
      <p>You may cancel anytime from your dashboard, with service continuing through the end of the current billing month. We do not prorate partial months but offer credits or refunds if service failures occur due to our fault.</p>
      <h2>Annual plans</h2>
      <p>Annual subscriptions are eligible for a prorated refund within 30 days of payment, based on unused months remaining. After 30 days, the subscription is non-refundable but can be cancelled to prevent renewal.</p>
      <h2>Enterprise plans</h2>
      <p>Refund terms for Enterprise contracts are defined in the signed Master Services Agreement and may differ from this policy.</p>
      <h2>Non-refundable items</h2>
      <p>Third-party expenses (domains, API access, hosting), delivered custom work, and requests made beyond 30 days post-payment cannot be refunded.</p>
      <h2>Request process</h2>
      <p>Submit refund requests to contact@hirebest.online with your order reference, reason, and preferred refund method. We respond within 3 business days, with approvals processed in 7–10 business days.</p>
      <h2>Chargebacks</h2>
      <p>Please contact us directly before initiating chargebacks. Fraudulent ones may result in account suspension.</p>
      <h2>Policy updates</h2>
      <p>The refund policy version active at purchase governs your transaction.</p>
    </LegalPage>
  )
}
