-- Manual shortlist/reject decision on candidates, separate from the AI verdict.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

alter table public.candidates
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'shortlisted', 'rejected'));

alter table public.candidates
  add column if not exists status_email_sent boolean not null default false;
