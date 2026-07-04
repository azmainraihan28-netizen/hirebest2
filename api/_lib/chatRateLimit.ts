import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient | null {
  if (cached) return cached
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

const ANON_LIMIT_PER_HOUR = 20
const AUTHED_LIMIT_PER_HOUR = 100

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; used: number; limit: number }

export async function checkAndRecord(
  ip: string,
  userId: string | null,
): Promise<RateLimitResult> {
  const supabase = getServiceClient()
  if (!supabase) return { ok: true }

  const limit = userId ? AUTHED_LIMIT_PER_HOUR : ANON_LIMIT_PER_HOUR
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('chat_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since)

  if (error) return { ok: true }

  const used = count ?? 0
  if (used >= limit) {
    return { ok: false, retryAfterSec: 3600, used, limit }
  }

  await supabase.from('chat_rate_limits').insert({ ip, user_id: userId })
  return { ok: true }
}

export async function logConversation(entry: {
  sessionId: string
  userId: string | null
  ip: string | null
  userMsg: string
  assistantMsg: string
  latencyMs: number
}) {
  const supabase = getServiceClient()
  if (!supabase) return
  await supabase.from('chat_logs').insert({
    session_id: entry.sessionId,
    user_id: entry.userId,
    ip: entry.ip,
    user_msg: entry.userMsg,
    assistant_msg: entry.assistantMsg,
    latency_ms: entry.latencyMs,
  })
}
