-- Fix: the original admin SELECT/UPDATE policies cause infinite recursion
-- (they read from profiles inside a profiles policy). Replace them with a
-- SECURITY DEFINER helper function that bypasses RLS.
-- Run this in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- 1. Helper: is_admin(uid) — bypasses RLS via SECURITY DEFINER
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

-- 2. Drop the recursive policies
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- 3. Recreate using the helper
-- Admin can read all
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- Admin can update all (including role)
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin(auth.uid()))
  with check (true);

-- Regular user can update own profile but NOT change own role
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id and not public.is_admin(auth.uid()))
  with check (auth.uid() = id and role = 'user');
