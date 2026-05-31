import { supabase } from './supabase'

export type ExtProfile = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  plan: 'free' | 'lifetime'
  screening_limit: number | null
  active: boolean
  created_at: string
  screenings_used: number
}

export type AccessCode = {
  id: string
  code: string
  plan: 'free' | 'lifetime'
  bonus_screenings: number
  uses_remaining: number
  total_uses: number
  expires_at: string | null
  created_at: string
}

export type AuditEntry = {
  id: number
  actor_email: string | null
  action: string
  target_type: string | null
  target_label: string | null
  meta: any
  created_at: string
}

// ---- Settings ----
export async function getDefaultFreeLimit(): Promise<number> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'default_free_limit').maybeSingle()
  const v = (data as any)?.value
  return typeof v === 'number' ? v : 50
}

export async function setDefaultFreeLimit(n: number): Promise<void> {
  await supabase.from('app_settings').upsert({ key: 'default_free_limit', value: n, updated_at: new Date().toISOString() })
  await logAudit('settings.update_default_limit', null, 'app_settings', `default_free_limit=${n}`)
}

// ---- Profiles + usage ----
export async function listProfilesWithUsage(): Promise<ExtProfile[]> {
  const [{ data: profiles }, { data: usage }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.rpc('admin_user_usage'),
  ])
  const map = new Map<string, number>()
  if (Array.isArray(usage)) usage.forEach((u: any) => map.set(u.user_id, Number(u.candidates_count) || 0))
  return ((profiles ?? []) as any[]).map(p => ({ ...p, screenings_used: map.get(p.id) ?? 0 }))
}

export async function updateProfileFields(id: string, fields: Partial<Pick<ExtProfile, 'plan' | 'screening_limit' | 'active'>>, targetLabel: string) {
  const { error } = await supabase.from('profiles').update(fields).eq('id', id)
  if (error) throw error
  await logAudit('profile.update', id, 'profile', targetLabel, fields)
}

// ---- Access codes ----
export async function listAccessCodes(): Promise<AccessCode[]> {
  const { data } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false }).limit(100)
  return (data ?? []) as AccessCode[]
}

export async function createAccessCode(input: { plan: 'free' | 'lifetime'; bonus_screenings: number; uses: number; expires_at: string | null }) {
  const code = generateCode()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('access_codes').insert({
    code,
    plan: input.plan,
    bonus_screenings: input.bonus_screenings,
    uses_remaining: input.uses,
    total_uses: input.uses,
    expires_at: input.expires_at,
    created_by: user?.id ?? null,
  }).select('*').single()
  if (error) throw error
  await logAudit('access_code.create', (data as any).id, 'access_code', code, { plan: input.plan, uses: input.uses })
  return data as AccessCode
}

export async function deleteAccessCode(id: string, code: string) {
  await supabase.from('access_codes').delete().eq('id', id)
  await logAudit('access_code.delete', id, 'access_code', code)
}

// ---- Role management ----
export async function setRoleByEmail(email: string, role: 'user' | 'admin') {
  const { error } = await supabase.rpc('admin_set_role', { target_email: email, new_role: role })
  if (error) throw error
  await logAudit('role.set', email, 'profile', `${email} → ${role}`, { role })
}

// ---- Audit log ----
export async function listAudit(limit = 100): Promise<AuditEntry[]> {
  const { data } = await supabase.from('audit_log').select('id, actor_email, action, target_type, target_label, meta, created_at')
    .order('created_at', { ascending: false }).limit(limit)
  return (data ?? []) as AuditEntry[]
}

export async function logAudit(action: string, target_id: string | null, target_type: string, target_label: string, meta: any = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_log').insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action,
      target_id,
      target_type,
      target_label,
      meta,
    })
  } catch (e) { console.warn('audit log failed', e) }
}

// ---- Helpers ----
function generateCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = 'HB-'
  for (let i = 0; i < 8; i++) out += charset[Math.floor(Math.random() * charset.length)]
  return out
}
