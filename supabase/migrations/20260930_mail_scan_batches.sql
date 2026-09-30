create table if not exists public.mail_scan_batches (
  user_id uuid not null references auth.users(id) on delete cascade,
  uid_validity text not null,
  uid_start bigint not null,
  uid_next bigint not null,
  processed integer not null,
  oversized integer not null,
  categories jsonb not null,
  observations jsonb not null,
  scanned_at timestamptz not null default now(),
  primary key (user_id, uid_validity, uid_start)
);

alter table public.mail_scan_batches enable row level security;
revoke all on public.mail_scan_batches from anon, authenticated;
