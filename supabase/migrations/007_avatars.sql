-- Profile avatars: column + public storage bucket + RLS.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- 1. Add avatar_url column to profiles
alter table public.profiles
  add column if not exists avatar_url text;

-- 2. Create a public "avatars" storage bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 3. RLS policies on storage.objects for the avatars bucket.
--    Files are stored under `<user-id>/<filename>` so the first path segment
--    must match auth.uid() for write/delete operations.

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
