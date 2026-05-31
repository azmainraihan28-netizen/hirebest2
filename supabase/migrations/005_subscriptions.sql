-- Lemon Squeezy subscriptions tracking.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- 1. Allow more plan values
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free','basic','advanced','lifetime','retainer'));

-- 2. Subscriptions table (1 active row per user typically; older rows kept for history)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ls_subscription_id text unique,
  ls_order_id text,
  variant_id text not null,
  plan_name text not null,
  status text not null default 'active'
    check (status in ('active','on_trial','paused','past_due','unpaid','cancelled','expired')),
  renews_at timestamptz,
  ends_at timestamptz,
  test_mode boolean not null default false,
  card_brand text,
  card_last_four text,
  customer_portal_url text,
  update_payment_method_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions(user_id, status);
create index if not exists subscriptions_ls_idx on public.subscriptions(ls_subscription_id);

alter table public.subscriptions enable row level security;

-- User can read own subs
drop policy if exists "subs_own_read" on public.subscriptions;
create policy "subs_own_read" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Admin can read all
drop policy if exists "subs_admin_read" on public.subscriptions;
create policy "subs_admin_read" on public.subscriptions
  for select using (public.is_admin(auth.uid()));

-- No INSERT/UPDATE/DELETE policies for normal users.
-- Webhook uses service_role key which bypasses RLS entirely.
