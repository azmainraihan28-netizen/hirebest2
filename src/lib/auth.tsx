import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile } from './supabase'

type AuthCtx = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setProfile((data as Profile | null) ?? null))
  }, [session?.user?.id])

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    },
    signInWithEmail: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    signUpWithEmail: async (email, password, fullName) => {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName ?? '' },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error: error?.message ?? null }
    },
    signOut: async () => { await supabase.auth.signOut() },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}
