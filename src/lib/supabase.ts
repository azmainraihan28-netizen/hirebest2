import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | 'super_admin'
  plan: 'free' | 'basic' | 'advanced' | 'lifetime' | 'retainer'
  screening_limit: number | null
  active: boolean
  avatar_url: string | null
  created_at: string
}
