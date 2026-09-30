import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from './supabase'

// Loaded on demand so the Supabase SDK (the biggest dependency) stays out of the
// bundle every marketing page downloads before it can render.
const sb = () => import('./supabase').then(m => m.supabase)

type AuthCtx = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}
    sb().then(supabase => {
      if (cancelled) return
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        setSession(data.session)
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s)
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    })
    return () => { cancelled = true; unsubscribe() }
  }, [])

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
      await (await sb()).auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    },
    signInWithEmail: async (email, password) => {
      const { error } = await (await sb()).auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    signUpWithEmail: async (email, password, fullName) => {
      const { error } = await (await sb()).auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName ?? '' },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error: error?.message ?? null }
    },
    signOut: async () => { await (await sb()).auth.signOut() },
    refreshProfile: async () => {
      if (!session?.user) return
      const { data } = await (await sb()).from('profiles').select('*').eq('id', session.user.id).maybeSingle()
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
