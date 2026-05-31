import { useEffect } from 'react'

const SCRIPT_SRC = 'https://assets.saasbrowser.com/widgets/display.min.js'
const PROFILE = '3dfba172-0f6a-44b8-9c4b-583f067ac147'

export default function SaaSBrowserReviews() {
  useEffect(() => {
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
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-10">
        <span className="chip">Reviews</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold">What people are saying</h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">Verified reviews from real HireBest users.</p>
      </div>

      <div id="saas-browser-reviews" />

      <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
        <a
          href="https://saasbrowser.com/en/saas/1519084/hirebest"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-fg)] transition inline-flex items-center gap-1"
        >
          We're verified on SaaS Browser ↗
        </a>
      </p>
    </section>
  )
}
