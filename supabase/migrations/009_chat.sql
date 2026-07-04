-- Support chatbot: rate limits + conversation logs.
-- Run in Supabase Dashboard → SQL Editor → New Query → paste → Run

create table if not exists public.chat_rate_limits (
  id bigserial primary key,
  ip text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists chat_rate_limits_ip_time
  on public.chat_rate_limits (ip, created_at desc);

create table if not exists public.chat_logs (
  id bigserial primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  ip text,
  user_msg text not null,
  assistant_msg text not null,
  latency_ms int,
  created_at timestamptz not null default now()
);

create index if not exists chat_logs_session
  on public.chat_logs (session_id, created_at);

alter table public.chat_rate_limits enable row level security;
alter table public.chat_logs enable row level security;

-- No client-side policies: service role (used by /api/chat) bypasses RLS.
-- Add admin-read policies later if you expose logs in the Admin panel.
