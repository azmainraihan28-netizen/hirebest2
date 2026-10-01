-- 013 · Plan entitlements: make every plan deliver exactly what /pricing sells.
--
--   • CV quota is per calendar month (UTC), counted from usage_events — it used to
--     count every candidate ever screened, so it never reset.
--   • Usage is recorded server-side by /api/score (app + API), so it can't be
--     bypassed by calling the API directly.
--   • Team plans share one monthly pool across the team's members.
--   • Active job slots, bulk-upload cap and seats come from the plan.
--   • Self-serve teams for Growth / Team / Enterprise owners.
--   • Custom branding, email notifications and API keys.
--
-- Safe to run more than once.

-- ── Plan table (single source of truth, mirrors /pricing) ────────────────────
-- cv_limit / job_slots / seats: null = unlimited.
create or replace function public.plan_rank(p text) returns int
language sql immutable as $$
  select case p when 'basic' then 1 when 'advanced' then 2 when 'lifetime' then 3 when 'retainer' then 4 else 0 end;
$$;

create or replace function public.plan_entitlements(p text)
returns table (cv_limit int, job_slots int, seats int, batch_cap int)
language sql stable security definer set search_path = public as $$
  select t.cv_limit, t.job_slots, t.seats, t.batch_cap from (values
    -- free: monthly CVs come from app_settings.default_free_limit
    ('free',     coalesce((select (value)::text::int from public.app_settings where key = 'default_free_limit'), 50), 1, 1, 50),
    ('basic',    150,  3,    1,    50),
    ('advanced', 500,  10,   3,    200),
    ('lifetime', 2000, null, 10,   200),
    ('retainer', null, null, null, 500)
  ) as t(plan, cv_limit, job_slots, seats, batch_cap)
  where t.plan = case when p in ('basic','advanced','lifetime','retainer') then p else 'free' end;
$$;

-- ── Usage ledger ─────────────────────────────────────────────────────────────
create table if not exists public.usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  kind text not null default 'cv_score',
  source text not null default 'app' check (source in ('app','api','backfill')),
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user_idx on public.usage_events(user_id, created_at desc);
create index if not exists usage_events_org_idx on public.usage_events(org_id, created_at desc) where org_id is not null;

alter table public.usage_events enable row level security;
-- Read-only for clients; only the service role (api/score) writes.
drop policy if exists "usage_select" on public.usage_events;
create policy "usage_select" on public.usage_events
  for select using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_member(auth.uid(), org_id))
  );

-- Count this month's CVs that were screened before the ledger existed.
insert into public.usage_events (user_id, org_id, kind, source, created_at)
select s.user_id, s.org_id, 'cv_score', 'backfill', c.created_at
from public.candidates c
join public.screenings s on s.id = c.screening_id
where c.created_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc'
  and not exists (select 1 from public.usage_events where source = 'backfill');

-- ── Jobs (screenings) can be archived to free a slot ────────────────────────
alter table public.screenings add column if not exists archived_at timestamptz;

-- ── Self-serve teams ────────────────────────────────────────────────────────
alter table public.organizations add column if not exists self_serve boolean not null default false;

-- ── Branding, notifications ─────────────────────────────────────────────────
alter table public.profiles
  add column if not exists brand_name text,
  add column if not exists brand_logo_url text,
  add column if not exists brand_color text,
  add column if not exists notify_screening_complete boolean not null default true;

-- ── API keys (Team+) ────────────────────────────────────────────────────────
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'API key',
  prefix text not null,              -- first chars, shown in the UI
  key_hash text not null unique,     -- sha256 hex of the full key; the key itself is never stored
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists api_keys_user_idx on public.api_keys(user_id);
alter table public.api_keys enable row level security;

-- ── Effective plan & quota ──────────────────────────────────────────────────
-- A user's effective plan is the best of their own plan and the plan of any
-- team they belong to. When a team plan wins, CVs come out of the team's pool.
create or replace function public.quota_for(uid uuid)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  prof record;
  best_org record;
  eff_plan text;
  scope_org uuid;
  ent record;
  lim int;
  used int;
  active_jobs int;
  period_start timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
begin
  select plan, screening_limit, active into prof from public.profiles where id = uid;
  if not found then return null; end if;

  select o.id, o.plan, o.screening_limit into best_org
  from public.org_members m join public.organizations o on o.id = m.org_id
  where m.user_id = uid
  order by public.plan_rank(o.plan) desc, o.created_at asc
  limit 1;

  if best_org.id is not null and public.plan_rank(best_org.plan) > public.plan_rank(prof.plan) then
    eff_plan := best_org.plan;
    scope_org := best_org.id;
  else
    eff_plan := coalesce(prof.plan, 'free');
    scope_org := null;
  end if;

  select * into ent from public.plan_entitlements(eff_plan);

  if scope_org is null then
    -- A per-user admin override always wins over the plan default.
    lim := coalesce(prof.screening_limit, ent.cv_limit);
    select count(*) into used from public.usage_events
      where user_id = uid and org_id is null and created_at >= period_start;
    select count(*) into active_jobs from public.screenings
      where user_id = uid and org_id is null and archived_at is null;
  else
    lim := case when ent.cv_limit is null then null
                else greatest(ent.cv_limit, coalesce(best_org.screening_limit, 0)) end;
    select count(*) into used from public.usage_events
      where org_id = scope_org and created_at >= period_start;
    select count(*) into active_jobs from public.screenings
      where org_id = scope_org and archived_at is null;
  end if;

  return json_build_object(
    'plan', eff_plan,
    'own_plan', coalesce(prof.plan, 'free'),
    'org_id', scope_org,
    'active', coalesce(prof.active, true),
    'cv_limit', lim,
    'used', used,
    'period_start', period_start,
    'period_end', period_start + interval '1 month',
    'job_slots', ent.job_slots,
    'active_jobs', active_jobs,
    'seats', ent.seats,
    'batch_cap', ent.batch_cap
  );
end;
$$;
revoke all on function public.quota_for(uuid) from public, anon, authenticated;
grant execute on function public.quota_for(uuid) to service_role;

create or replace function public.my_quota()
returns json language sql stable security definer set search_path = public as $$
  select public.quota_for(auth.uid());
$$;
revoke all on function public.my_quota() from public, anon;
grant execute on function public.my_quota() to authenticated;

create or replace function public.effective_plan(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(public.quota_for(uid)->>'plan', 'free');
$$;
revoke all on function public.effective_plan(uuid) from public, anon, authenticated;
grant execute on function public.effective_plan(uuid) to service_role;

-- API keys: Team plan and above may create keys; owners can list / revoke their own.
drop policy if exists "api_keys_select" on public.api_keys;
create policy "api_keys_select" on public.api_keys for select using (auth.uid() = user_id);
drop policy if exists "api_keys_insert" on public.api_keys;
create policy "api_keys_insert" on public.api_keys for insert
  with check (auth.uid() = user_id and public.plan_rank(public.my_quota()->>'plan') >= 3);
drop policy if exists "api_keys_update" on public.api_keys;
create policy "api_keys_update" on public.api_keys for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Job slots: block new active jobs past the plan's limit ───────────────────
create or replace function public.enforce_job_slots()
returns trigger language plpgsql security definer set search_path = public as $$
declare q json; slots int; v_active int;
begin
  if new.archived_at is not null then return new; end if;
  if tg_op = 'UPDATE' and old.archived_at is null then return new; end if; -- not a new activation
  q := public.quota_for(new.user_id);
  if q is null then return new; end if;
  slots := (q->>'job_slots')::int;
  if slots is null then return new; end if;
  -- quota_for counts the user's personal or team jobs depending on scope; use the scope of this row.
  if new.org_id is null then
    select count(*) into v_active from public.screenings
      where user_id = new.user_id and org_id is null and archived_at is null and id <> new.id;
  else
    select count(*) into v_active from public.screenings
      where org_id = new.org_id and archived_at is null and id <> new.id;
  end if;
  if v_active >= slots then
    raise exception 'JOB_SLOTS_FULL: your plan includes % active job slot(s). Archive a job or upgrade.', slots
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists screenings_job_slots on public.screenings;
create trigger screenings_job_slots
  before insert or update of archived_at on public.screenings
  for each row execute function public.enforce_job_slots();

-- ── Self-serve team creation + seat sync ────────────────────────────────────
create or replace function public.create_my_team(team_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  my_plan text;
  ent record;
  new_id uuid;
  base_slug text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '42501'; end if;
  select plan into my_plan from public.profiles where id = uid;
  if public.plan_rank(my_plan) < 2 then
    raise exception 'Teams are included in the Growth plan and above.' using errcode = '42501';
  end if;
  if exists (select 1 from public.organizations where created_by = uid and self_serve) then
    raise exception 'You already have a team.';
  end if;
  select * into ent from public.plan_entitlements(my_plan);
  base_slug := trim(both '-' from regexp_replace(lower(coalesce(nullif(trim(team_name), ''), 'team')), '[^a-z0-9]+', '-', 'g'));
  insert into public.organizations (name, slug, plan, seat_limit, screening_limit, created_by, self_serve)
    values (coalesce(nullif(trim(team_name), ''), 'My team'),
            base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
            my_plan, coalesce(ent.seats, 1000000), 0, uid, true)
    returning id into new_id;
  insert into public.org_members (org_id, user_id, role_in_org) values (new_id, uid, 'org_admin');
  return new_id;
end;
$$;
revoke all on function public.create_my_team(text) from public, anon;
grant execute on function public.create_my_team(text) to authenticated;

-- When the owner's plan changes (Stripe webhook), the team follows it.
create or replace function public.sync_team_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare ent record;
begin
  if new.plan is distinct from old.plan then
    select * into ent from public.plan_entitlements(new.plan);
    update public.organizations
       set plan = new.plan, seat_limit = coalesce(ent.seats, 1000000)
     where created_by = new.id and self_serve;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_sync_team_plan on public.profiles;
create trigger profiles_sync_team_plan
  after update of plan on public.profiles
  for each row execute function public.sync_team_plan();

-- Accepting an invite must respect the team's seats (invites are also checked in /api/invite).
create or replace function public.accept_org_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  my_email text;
  v_seat_limit int;
  v_members int;
begin
  select coalesce(auth.jwt()->>'email', '') into my_email;
  if my_email = '' then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  select * into inv from public.org_invites where token = invite_token;
  if inv.id is null then raise exception 'Invite not found'; end if;
  if inv.accepted_at is not null then raise exception 'Invite already accepted'; end if;
  if inv.expires_at < now() then raise exception 'Invite expired'; end if;
  if lower(inv.email) <> lower(my_email) then
    raise exception 'Invite email does not match your account';
  end if;
  select o.seat_limit into v_seat_limit from public.organizations o where o.id = inv.org_id;
  select count(*) into v_members from public.org_members m where m.org_id = inv.org_id;
  if v_seat_limit > 0 and v_members >= v_seat_limit
     and not exists (select 1 from public.org_members where org_id = inv.org_id and user_id = auth.uid()) then
    raise exception 'This team has no free seats left. Ask the team owner to upgrade.';
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
