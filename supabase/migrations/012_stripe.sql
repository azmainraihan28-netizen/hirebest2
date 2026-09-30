-- Stripe billing. Replaces Lemon Squeezy as the payment provider.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run
--
-- Old ls_* columns are kept so historical Lemon Squeezy rows still render.

-- 1. Stripe customer per user. Separate table (not a profiles column) because
--    users can update their own profile row; a user-writable customer id would
--    let someone open another customer's billing portal.
create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

drop policy if exists "billing_customers_own_read" on public.billing_customers;
create policy "billing_customers_own_read" on public.billing_customers
  for select using (auth.uid() = user_id);
-- No write policies: only the service-role key (API routes) writes here.

-- 2. Stripe columns on subscriptions
alter table public.subscriptions alter column variant_id drop not null;
alter table public.subscriptions add column if not exists stripe_subscription_id text unique;
alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_price_id text;
alter table public.subscriptions add column if not exists billing_interval text;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;

create index if not exists subscriptions_stripe_idx on public.subscriptions(stripe_subscription_id);

alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('active','on_trial','paused','past_due','unpaid','cancelled','expired','incomplete'));

-- 3. Stop users from granting themselves a paid plan. profiles_update_own lets a
--    user update their own row, which previously included plan / screening_limit
--    / active. Only admins (via RLS) and the service role (webhook, auth.uid() is
--    null) may change those now.
create or replace function public.protect_profile_billing_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not public.is_admin(auth.uid())
     and (new.plan is distinct from old.plan
          or new.screening_limit is distinct from old.screening_limit
          or new.active is distinct from old.active) then
    raise exception 'Not allowed to change plan, screening_limit or active';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing
  before update on public.profiles
  for each row execute function public.protect_profile_billing_fields();
