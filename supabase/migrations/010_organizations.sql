-- Multi-tenant organizations: orgs, members, invites, org-scoped screenings.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- 1. Allow 'super_admin' on profiles.role and migrate the existing 'admin' rows.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user','admin','super_admin'));

update public.profiles set role = 'super_admin' where role = 'admin';

-- 2. Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free',
  seat_limit integer not null default 5,
  screening_limit integer not null default 50,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_in_org text not null check (role_in_org in ('org_admin','member')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on public.org_members(user_id);

create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_in_org text not null default 'member' check (role_in_org in ('org_admin','member')),
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);
create index if not exists org_invites_pending_email_idx on public.org_invites(lower(email)) where accepted_at is null;

-- 3. Scope screenings to an optional org
alter table public.screenings add column if not exists org_id uuid references public.organizations(id) on delete set null;
create index if not exists screenings_org_idx on public.screenings(org_id) where org_id is not null;

-- 4. Helper functions
create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('super_admin','admin')
  );
$$;

revoke all on function public.is_super_admin(uuid) from public;
grant execute on function public.is_super_admin(uuid) to anon, authenticated;

create or replace function public.is_org_member(uid uuid, oid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.org_members where user_id = uid and org_id = oid
  );
$$;

revoke all on function public.is_org_member(uuid, uuid) from public;
grant execute on function public.is_org_member(uuid, uuid) to authenticated;

create or replace function public.is_org_admin(uid uuid, oid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.org_members
    where user_id = uid and org_id = oid and role_in_org = 'org_admin'
  );
$$;

revoke all on function public.is_org_admin(uuid, uuid) from public;
grant execute on function public.is_org_admin(uuid, uuid) to authenticated;

-- Re-point the legacy is_admin() to super_admin so existing RLS keeps working.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_super_admin(uid);
$$;

-- 5. Screening RLS rewrite (owner OR org member OR super admin)
drop policy if exists "screenings_owner_all" on public.screenings;
drop policy if exists "screenings_admin_read" on public.screenings;

create policy "screenings_select" on public.screenings
  for select using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_member(auth.uid(), org_id))
    or public.is_super_admin(auth.uid())
  );

create policy "screenings_insert" on public.screenings
  for insert with check (
    auth.uid() = user_id
    and (org_id is null or public.is_org_member(auth.uid(), org_id))
  );

create policy "screenings_update" on public.screenings
  for update using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
    or public.is_super_admin(auth.uid())
  ) with check (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
    or public.is_super_admin(auth.uid())
  );

create policy "screenings_delete" on public.screenings
  for delete using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
    or public.is_super_admin(auth.uid())
  );

-- 6. Candidates RLS rewrite (dereference through parent screening)
drop policy if exists "candidates_owner_all" on public.candidates;
drop policy if exists "candidates_admin_read" on public.candidates;

create policy "candidates_select" on public.candidates
  for select using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_member(auth.uid(), s.org_id))
          or public.is_super_admin(auth.uid())
        )
    )
  );

create policy "candidates_insert" on public.candidates
  for insert with check (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_member(auth.uid(), s.org_id))
        )
    )
  );

create policy "candidates_modify" on public.candidates
  for update using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_admin(auth.uid(), s.org_id))
          or public.is_super_admin(auth.uid())
        )
    )
  );

create policy "candidates_delete" on public.candidates
  for delete using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_admin(auth.uid(), s.org_id))
          or public.is_super_admin(auth.uid())
        )
    )
  );

-- 7. RLS for organizations / org_members / org_invites
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_invites enable row level security;

drop policy if exists "orgs_select" on public.organizations;
create policy "orgs_select" on public.organizations
  for select using (
    public.is_super_admin(auth.uid())
    or public.is_org_member(auth.uid(), id)
  );

drop policy if exists "orgs_super_admin_write" on public.organizations;
create policy "orgs_super_admin_write" on public.organizations
  for all using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

drop policy if exists "members_select" on public.org_members;
create policy "members_select" on public.org_members
  for select using (
    public.is_super_admin(auth.uid())
    or public.is_org_member(auth.uid(), org_id)
  );

drop policy if exists "members_write" on public.org_members;
create policy "members_write" on public.org_members
  for all using (
    public.is_super_admin(auth.uid())
    or public.is_org_admin(auth.uid(), org_id)
  ) with check (
    public.is_super_admin(auth.uid())
    or public.is_org_admin(auth.uid(), org_id)
  );

drop policy if exists "invites_select" on public.org_invites;
create policy "invites_select" on public.org_invites
  for select using (
    public.is_super_admin(auth.uid())
    or public.is_org_admin(auth.uid(), org_id)
    or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

drop policy if exists "invites_write" on public.org_invites;
create policy "invites_write" on public.org_invites
  for all using (
    public.is_super_admin(auth.uid())
    or public.is_org_admin(auth.uid(), org_id)
  ) with check (
    public.is_super_admin(auth.uid())
    or public.is_org_admin(auth.uid(), org_id)
  );

-- 8. Update legacy role helper to accept 'super_admin' too.
create or replace function public.admin_set_role(target_email text, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if new_role not in ('user','admin','super_admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles set role = new_role where email = target_email;
end;
$$;

-- 9. Admin ops used from client: create org + assign org admin in one call.
create or replace function public.admin_create_org(
  org_name text,
  org_slug text,
  admin_email text,
  plan_key text default 'free',
  seat_limit integer default 5,
  screening_limit integer default 50
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  admin_user_id uuid;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select id into admin_user_id from public.profiles where lower(email) = lower(admin_email);
  if admin_user_id is null then
    raise exception 'No user found with email %', admin_email;
  end if;

  insert into public.organizations (name, slug, plan, seat_limit, screening_limit, created_by)
    values (org_name, org_slug, plan_key, seat_limit, screening_limit, auth.uid())
    returning id into new_org_id;

  insert into public.org_members (org_id, user_id, role_in_org)
    values (new_org_id, admin_user_id, 'org_admin')
    on conflict do nothing;

  return new_org_id;
end;
$$;

revoke all on function public.admin_create_org(text, text, text, text, integer, integer) from public;
grant execute on function public.admin_create_org(text, text, text, text, integer, integer) to authenticated;

-- 10. Invite acceptance: validates token + email match, adds membership, marks accepted.
create or replace function public.accept_org_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  my_email text;
begin
  select coalesce(auth.jwt()->>'email', '') into my_email;
  if my_email = '' then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into inv from public.org_invites where token = invite_token;
  if inv.id is null then
    raise exception 'Invite not found';
  end if;
  if inv.accepted_at is not null then
    raise exception 'Invite already accepted';
  end if;
  if inv.expires_at < now() then
    raise exception 'Invite expired';
  end if;
  if lower(inv.email) <> lower(my_email) then
    raise exception 'Invite email does not match your account';
  end if;

  insert into public.org_members (org_id, user_id, role_in_org)
    values (inv.org_id, auth.uid(), inv.role_in_org)
    on conflict (org_id, user_id) do nothing;

  update public.org_invites set accepted_at = now() where id = inv.id;
  return inv.org_id;
end;
$$;

revoke all on function public.accept_org_invite(text) from public;
grant execute on function public.accept_org_invite(text) to authenticated;
