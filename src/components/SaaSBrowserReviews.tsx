import { useEffect, useState } from 'react'
import { Eyebrow, SplitHeading } from './motion/primitives'

const SCRIPT_SRC = 'https://assets.saasbrowser.com/widgets/display.min.js'
const PROFILE = '3dfba172-0f6a-44b8-9c4b-583f067ac147'
const REVIEWS_API = `https://saasbrowser.com/api/reviews/${PROFILE}`

/**
 * Real customer reviews from SaaS Browser. Renders nothing until the profile
 * has at least one review, so the page never shows an empty "reviews" block
 * (and the prerendered HTML never claims reviews that aren't there).
 */
export default function SaaSBrowserReviews() {
  const [hasReviews, setHasReviews] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(REVIEWS_API)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && (d?.aggregate?.count ?? d?.reviews?.length ?? 0) > 0) setHasReviews(true) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!hasReviews) return
    // Re-inject script on every mount so SPA navigation re-renders the widget
    document.querySelectorAll('script[data-saasbrowser-display]').forEach(el => el.remove())

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.setAttribute('data-profile', PROFILE)
    script.setAttribute('data-layout', 'grid')
    script.setAttribute('data-mode', 'light')
    script.setAttribute('data-saasbrowser-display', 'true')
    document.body.appendChild(script)

    return () => { script.remove() }
  }, [hasReviews])

  if (!hasReviews) return null

  return (
    <section className="max-w-7xl mx-auto px-5 py-24">
      <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
        <div className="lg:col-span-8">
          <Eyebrow>Reviews</Eyebrow>
          <SplitHeading text={'What hiring teams\n*are saying.*'} className="display-lg mt-6 text-[var(--color-fg)]" />
        </div>
        <p className="lg:col-span-4 text-[var(--color-fg-dim)] leading-relaxed">
          Reviews from HireBest users, collected by SaaS Browser.{' '}
          <a href="https://saasbrowser.com/en/saas/1519084/hirebest" target="_blank" rel="noreferrer" className="u-link text-[var(--color-primary-2)]">
            See our SaaS Browser profile ↗
          </a>
        </p>
      </div>

      <div id="saas-browser-reviews" />
    </section>
  )
}
