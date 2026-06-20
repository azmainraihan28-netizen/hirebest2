-- Expand access_codes.plan to support all paid tiers (matches profiles_plan_check).
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

alter table public.access_codes drop constraint if exists access_codes_plan_check;
alter table public.access_codes add constraint access_codes_plan_check
  check (plan in ('free','basic','advanced','lifetime','retainer'));
