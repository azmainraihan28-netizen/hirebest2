-- Screenings + Candidates tables for multi-CV scoring history.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  jd text not null,
  created_at timestamptz not null default now()
);

create index if not exists screenings_user_idx on public.screenings(user_id, created_at desc);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid not null references public.screenings(id) on delete cascade,
  file_name text,
  name text,
  email text,
  experience_years numeric,
  skills text[],
  score integer not null,
  verdict text not null check (verdict in ('Fit','Maybe','Skip')),
  summary text,
  strengths text[],
  gaps text[],
  questions jsonb,
  created_at timestamptz not null default now()
);

create index if not exists candidates_screening_idx on public.candidates(screening_id, score desc);

-- RLS
alter table public.screenings enable row level security;
alter table public.candidates enable row level security;

-- Screenings: owner can do anything; admin can read all
drop policy if exists "screenings_owner_all" on public.screenings;
create policy "screenings_owner_all" on public.screenings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "screenings_admin_read" on public.screenings;
create policy "screenings_admin_read" on public.screenings
  for select using (public.is_admin(auth.uid()));

-- Candidates: owner of parent screening can do anything; admin can read all
drop policy if exists "candidates_owner_all" on public.candidates;
create policy "candidates_owner_all" on public.candidates
  for all using (
    exists (select 1 from public.screenings s where s.id = screening_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.screenings s where s.id = screening_id and s.user_id = auth.uid())
  );

drop policy if exists "candidates_admin_read" on public.candidates;
create policy "candidates_admin_read" on public.candidates
  for select using (public.is_admin(auth.uid()));
