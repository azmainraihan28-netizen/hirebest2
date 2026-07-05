import { supabase } from './supabase'
import { logAudit } from './admin'

export type Organization = {
  id: string
  name: string
  slug: string
  plan: string
  seat_limit: number
  screening_limit: number
  created_by: string | null
  created_at: string
}

export type OrgMember = {
  org_id: string
  user_id: string
  role_in_org: 'org_admin' | 'member'
  joined_at: string
  email?: string | null
  full_name?: string | null
}

export type OrgInvite = {
  id: string
  org_id: string
  email: string
  role_in_org: 'org_admin' | 'member'
  token: string
  invited_by: string | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export type MyOrg = {
  org_id: string
  name: string
  slug: string
  role_in_org: 'org_admin' | 'member'
}

export async function listOrgs(): Promise<Organization[]> {
  const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Organization[]
}

export async function getMyOrgs(): Promise<MyOrg[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('org_members')
    .select('org_id, role_in_org, organizations!inner(name, slug)')
    .eq('user_id', user.id)
  if (!Array.isArray(data)) return []
  return data.map((row: any) => ({
    org_id: row.org_id,
    name: row.organizations?.name ?? '',
    slug: row.organizations?.slug ?? '',
    role_in_org: row.role_in_org,
  }))
}

export async function createOrg(input: {
  name: string
  slug: string
  admin_email: string
  plan?: string
  seat_limit?: number
  screening_limit?: number
}): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_org', {
    org_name: input.name,
    org_slug: input.slug,
    admin_email: input.admin_email,
    plan_key: input.plan ?? 'free',
    seat_limit: input.seat_limit ?? 5,
    screening_limit: input.screening_limit ?? 50,
  })
  if (error) throw error
  await logAudit('org.create', data as string, 'organization', input.name, {
    slug: input.slug, admin_email: input.admin_email, plan: input.plan,
  })
  return data as string
}

export async function listMembers(orgId: string): Promise<OrgMember[]> {
  const { data } = await supabase
    .from('org_members')
    .select('org_id, user_id, role_in_org, joined_at, profiles!inner(email, full_name)')
    .eq('org_id', orgId)
  if (!Array.isArray(data)) return []
  return data.map((row: any) => ({
    org_id: row.org_id,
    user_id: row.user_id,
    role_in_org: row.role_in_org,
    joined_at: row.joined_at,
    email: row.profiles?.email ?? null,
    full_name: row.profiles?.full_name ?? null,
  }))
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('org_members').delete().eq('org_id', orgId).eq('user_id', userId)
  if (error) throw error
  await logAudit('org.remove_member', userId, 'org_member', `${orgId}:${userId}`, { org_id: orgId })
}

export async function inviteMember(orgId: string, email: string, role: 'org_admin' | 'member' = 'member'): Promise<OrgInvite> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  const res = await fetch('/api/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ org_id: orgId, email, role_in_org: role }),
  })
  if (!res.ok) {
    let msg = 'Invite failed'
    try { msg = (await res.json()).error || msg } catch { /* ignore */ }
    throw new Error(msg)
  }
  return (await res.json()) as OrgInvite
}

export async function listPendingInvites(orgId: string): Promise<OrgInvite[]> {
  const { data } = await supabase
    .from('org_invites')
    .select('*')
    .eq('org_id', orgId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })
  return (data ?? []) as OrgInvite[]
}

export async function revokeInvite(id: string): Promise<void> {
  const { error } = await supabase.from('org_invites').delete().eq('id', id)
  if (error) throw error
}

export async function acceptInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_org_invite', { invite_token: token })
  if (error) throw error
  return data as string
}
