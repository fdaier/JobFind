create table if not exists public.mail_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  address text not null,
  credential_ciphertext text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mail_connections enable row level security;

-- No client policies: only the service role in authenticated server routes can touch credentials.
revoke all on public.mail_connections from anon, authenticated;
