-- 014 · Hardening for 013 (from the Supabase security advisor).
--   • plan_rank: pin search_path.
--   • Trigger functions and the internal plan table aren't meant to be called
--     over /rest/v1/rpc — revoke EXECUTE from API roles. Triggers still fire.

alter function public.plan_rank(text) set search_path = public;

revoke all on function public.enforce_job_slots() from public, anon, authenticated;
revoke all on function public.sync_team_plan() from public, anon, authenticated;
revoke all on function public.plan_entitlements(text) from public, anon, authenticated;
grant execute on function public.plan_entitlements(text) to service_role;
