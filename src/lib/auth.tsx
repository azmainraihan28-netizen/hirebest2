import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from './supabase'

// Loaded on demand so the Supabase SDK (the biggest dependency) stays out of the
// bundle every marketing page downloads before it can render.
const sb = () => import('./supabase').then(m => m.supabase)

/**
 * Whether this visit may already be signed in: a stored Supabase session, or an
 * auth redirect (OAuth / magic link) in the URL. If not, marketing pages skip
 * loading the SDK at all until the visitor starts signing in.
 */
function mayHaveSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) ?? ''
      if (k.startsWith('sb-') && k.includes('auth-token')) return true
    }
  } catch { return true }
  const { pathname, hash, search } = window.location
  return pathname.startsWith('/auth/') || /access_token|refresh_token|error_description/.test(hash) || /[?&]code=/.test(search)
}

type AuthCtx = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  /** Enterprise SAML SSO, routed by the user's work-email domain. */
  signInWithSSO: (email: string) => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(mayHaveSession)
  const attached = useRef(false)
  const unsubscribe = useRef<() => void>(() => {})

  /** Load the SDK, read the session and follow auth changes (once). */
  const attach = useCallback(() => {
    if (attached.current) return
    attached.current = true
    sb().then(supabase => {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session)
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
      unsubscribe.current = () => sub.subscription.unsubscribe()
    })
  }, [])

  useEffect(() => {
    if (mayHaveSession()) attach()
    else setLoading(false)
    return () => unsubscribe.current()
  }, [attach])

  /** Supabase client for an auth action; starts following auth changes first. */
  const client = () => { attach(); return sb() }

  useEffect(() => {
    if (!session?.user) { setProfile(null); return }
    sb().then(supabase => supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle())
      .then(({ data }) => setProfile((data as Profile | null) ?? null))
  }, [session?.user?.id])

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signInWithGoogle: async () => {
      await (await client()).auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    },
    signInWithSSO: async (email) => {
      const domain = email.split('@')[1]?.trim().toLowerCase()
      if (!domain) return { error: 'Enter your work email.' }
      const { data, error } = await (await client()).auth.signInWithSSO({
        domain,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        return { error: /not found|no sso provider/i.test(error.message)
          ? `SSO isn't set up for ${domain} yet. Ask your HireBest account manager, or sign in another way.`
          : error.message }
      }
      if (data?.url) window.location.href = data.url
      return { error: null }
    },
    signInWithEmail: async (email, password) => {
      const { error } = await (await client()).auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    signUpWithEmail: async (email, password, fullName) => {
      const { error } = await (await client()).auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName ?? '' },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error: error?.message ?? null }
    },
    signOut: async () => { await (await client()).auth.signOut() },
    refreshProfile: async () => {
      if (!session?.user) return
      const { data } = await (await client()).from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      setProfile((data as Profile | null) ?? null)
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}
