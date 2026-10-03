create table if not exists public.mail_review_decisions (
  user_id uuid not null references auth.users(id) on delete cascade,
  uid_validity text not null,
  uid bigint not null,
  status text not null check (status in ('applied', 'ignored')),
  job_id text,
  target_stage text,
  updated_at timestamptz not null default now(),
  primary key (user_id, uid_validity, uid)
);

alter table public.mail_review_decisions enable row level security;
revoke all on public.mail_review_decisions from anon, authenticated;
