-- Admin panel: subscriptions, access codes, audit log, global settings.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- 1. Extend profiles with subscription/quota fields
alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free','lifetime')),
  add column if not exists screening_limit integer,
  add column if not exists active boolean not null default true;

-- 2. App-wide settings (single source of truth for things like default free limit)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values ('default_free_limit', '50')
  on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "settings_read_authed" on public.app_settings;
create policy "settings_read_authed" on public.app_settings
  for select using (auth.uid() is not null);

drop policy if exists "settings_write_admin" on public.app_settings;
create policy "settings_write_admin" on public.app_settings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 3. Access codes (admin issues, user redeems on /account)
create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan text not null default 'lifetime' check (plan in ('free','lifetime')),
  bonus_screenings integer not null default 0,
  uses_remaining integer not null default 1,
  total_uses integer not null default 1,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.access_codes enable row level security;

drop policy if exists "codes_admin_all" on public.access_codes;
create policy "codes_admin_all" on public.access_codes
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 4. Audit log (every admin write logs an entry)
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  target_label text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "audit_admin_read" on public.audit_log;
create policy "audit_admin_read" on public.audit_log
  for select using (public.is_admin(auth.uid()));

drop policy if exists "audit_authed_insert" on public.audit_log;
create policy "audit_authed_insert" on public.audit_log
  for insert with check (auth.uid() is not null);

-- 5. Admin-only aggregation: usage per user (screenings + candidates)
create or replace function public.admin_user_usage()
returns table (user_id uuid, screenings_count bigint, candidates_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  return query
    select s.user_id,
           count(distinct s.id)::bigint,
           count(c.id)::bigint
    from public.screenings s
    left join public.candidates c on c.screening_id = s.id
    group by s.user_id;
end;
$$;

revoke all on function public.admin_user_usage() from public;
grant execute on function public.admin_user_usage() to authenticated;

-- 6. Promote/demote helper (so RLS doesn't get in the way for legitimate admin ops)
create or replace function public.admin_set_role(target_email text, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if new_role not in ('user','admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles set role = new_role where email = target_email;
end;
$$;

revoke all on function public.admin_set_role(text, text) from public;
grant execute on function public.admin_set_role(text, text) to authenticated;
