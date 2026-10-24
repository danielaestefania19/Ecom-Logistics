-- Baseline: objects created from the Supabase dashboard before migrations were tracked.
-- Reconstructed from the live database on 2026-10-24.

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.clients (
  id uuid primary key references auth.users (id),
  full_name text,
  company text,
  asana_project_id text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.update_updated_at();

alter table public.clients enable row level security;

create policy "Users can view own profile"
  on public.clients for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.clients for update
  using (auth.uid() = id);

-- Key/value cache used by edge functions (service role only).
create table if not exists public.portal_config (
  key text primary key,
  value text
);
