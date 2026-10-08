// Bridge to the HireBest Android app (mobile/, a Capacitor shell around this
// site). Capacitor injects window.Capacitor into pages it loads, so the site
// reaches its native plugins without bundling any Capacitor code.

type Listener = { remove: () => Promise<void> }
type CapacitorBridge = {
  isNativePlatform?: () => boolean
  Plugins?: {
    Browser?: { open: (o: { url: string }) => Promise<void>; close: () => Promise<void> }
    App?: { addListener: (event: 'appUrlOpen', cb: (e: { url: string }) => void) => Promise<Listener> }
  }
}

const cap = (): CapacitorBridge | undefined =>
  typeof window === 'undefined' ? undefined : (window as { Capacitor?: CapacitorBridge }).Capacitor

/** True when the site is running inside the HireBest Android app. */
export const isNativeApp = (): boolean => !!cap()?.isNativePlatform?.()

/**
 * Where OAuth / SSO return to inside the app. Google refuses sign-in from an
 * embedded WebView, so those flows run in the system browser and come back
 * through this deep link (registered in mobile/android AndroidManifest.xml and
 * in Supabase → Authentication → URL Configuration → Redirect URLs).
 */
export const NATIVE_AUTH_REDIRECT = 'online.hirebest.app://auth/callback'

/** Opens a sign-in URL in the system browser (Custom Tab) from the app. */
export async function openExternal(url: string) {
  const browser = cap()?.Plugins?.Browser
  if (browser) await browser.open({ url })
  else window.location.href = url
}

/**
 * In the app, hand deep-linked sign-in results to /auth/callback so Supabase
 * picks up the session from the URL exactly as it does on the web.
 */
export function initNativeApp() {
  if (!isNativeApp()) return
  const plugins = cap()?.Plugins
  plugins?.App?.addListener('appUrlOpen', ({ url }) => {
    if (!url.startsWith(NATIVE_AUTH_REDIRECT)) return
    const u = new URL(url)
    plugins.Browser?.close().catch(() => {})
    window.location.replace(`${window.location.origin}/auth/callback${u.search}${u.hash}`)
  })
}
