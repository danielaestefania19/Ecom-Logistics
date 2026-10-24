-- Clients must not edit their own row: it holds is_admin plus the Stripe/Asana IDs
-- that edge functions trust to scope each client's data.
drop policy if exists "Users can update own profile" on public.clients;

alter table public.clients add column if not exists email text;
alter table public.clients add column if not exists role text not null default 'client'
  check (role in ('client', 'staff', 'admin'));

update public.clients c set email = u.email
  from auth.users u
  where u.id = c.id and c.email is null;

update public.clients set role = 'admin' where is_admin;

-- role is the source of truth; is_admin is kept in sync because edge functions still read it.
create or replace function public.sync_is_admin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.is_admin := (new.role = 'admin');
  return new;
end;
$$;

create trigger clients_sync_is_admin
  before insert or update of role, is_admin on public.clients
  for each row execute function public.sync_is_admin();

create or replace function public.is_portal_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from clients where id = auth.uid()), false);
$$;

alter function public.update_updated_at() set search_path = public;

drop policy if exists "Users can view own profile" on public.clients;
drop policy if exists "Admins can read all clients" on public.clients;
drop policy if exists "Admins can update all clients" on public.clients;

create policy "Users can view own profile"
  on public.clients for select to authenticated
  using (auth.uid() = id);

create policy "Admins can read all clients"
  on public.clients for select to authenticated
  using (public.is_portal_admin());

create policy "Admins can update all clients"
  on public.clients for update to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

-- portal_config is only used by edge functions (service role bypasses RLS).
alter table public.portal_config enable row level security;
revoke all on public.portal_config from anon, authenticated;
