-- Screening privacy: a super admin must NOT see (or change) customers' screenings,
-- candidates and CVs through the normal app queries. Before this migration the
-- RLS policies from 010 carried an `is_super_admin(auth.uid())` escape hatch on
-- select/update/delete, so an admin account's own dashboard listed every
-- customer's screenings and its quota counter summed every candidate row in the
-- database (e.g. "122/50 used").
--
-- Access is now strictly: the owner of the screening, or a member of the org the
-- screening belongs to. Admin dashboards keep working because they read
-- aggregates through the security-definer RPCs (admin_user_usage etc.), which
-- expose counts only — never JD text, candidate names, emails or CV content.
--
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run

-- 1. Screenings: owner or org member only
drop policy if exists "screenings_select" on public.screenings;
create policy "screenings_select" on public.screenings
  for select using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_member(auth.uid(), org_id))
  );

drop policy if exists "screenings_update" on public.screenings;
create policy "screenings_update" on public.screenings
  for update using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
  ) with check (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
  );

drop policy if exists "screenings_delete" on public.screenings;
create policy "screenings_delete" on public.screenings
  for delete using (
    auth.uid() = user_id
    or (org_id is not null and public.is_org_admin(auth.uid(), org_id))
  );

-- 2. Candidates: dereference through the parent screening, same rule
drop policy if exists "candidates_select" on public.candidates;
create policy "candidates_select" on public.candidates
  for select using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_member(auth.uid(), s.org_id))
        )
    )
  );

drop policy if exists "candidates_modify" on public.candidates;
create policy "candidates_modify" on public.candidates
  for update using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_admin(auth.uid(), s.org_id))
        )
    )
  );

drop policy if exists "candidates_delete" on public.candidates;
create policy "candidates_delete" on public.candidates
  for delete using (
    exists (
      select 1 from public.screenings s
      where s.id = candidates.screening_id
        and (
          s.user_id = auth.uid()
          or (s.org_id is not null and public.is_org_admin(auth.uid(), s.org_id))
        )
    )
  );

-- 3. Legacy policies from 003 that may still exist on older projects
drop policy if exists "screenings_admin_read" on public.screenings;
drop policy if exists "candidates_admin_read" on public.candidates;
