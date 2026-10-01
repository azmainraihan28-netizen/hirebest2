import { supabase } from './supabase'

export type ApiKey = {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

export async function listApiKeys(): Promise<ApiKey[]> {
  const { data } = await supabase.from('api_keys')
    .select('id, name, prefix, created_at, last_used_at, revoked_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as ApiKey[]
}

/**
 * Create a key. Only its SHA-256 hash is stored, so the full key is returned
 * once, here, and can't be shown again. The database only allows this on the
 * Team plan and above.
 */
export async function createApiKey(name: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  const key = `hb_live_${toHex(bytes.buffer)}`
  const hash = toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))
  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id, name: name.trim() || 'API key', prefix: key.slice(0, 12), key_hash: hash,
  })
  if (error) throw new Error(/row-level security/i.test(error.message) ? 'API access is included in the Team plan and above.' : error.message)
  return key
}

export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
}
