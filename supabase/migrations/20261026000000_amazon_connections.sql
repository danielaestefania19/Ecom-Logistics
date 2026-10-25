-- Amazon SP-API: per-client seller connections. Refresh tokens live in Supabase Vault and are
-- only reachable through service-role-only functions; no authenticated role can read them.

create extension if not exists supabase_vault;

create table public.amazon_connections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  selling_partner_id text not null,
  marketplace_ids text[] not null default '{ATVPDKIKX0DER}',
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (client_id, selling_partner_id)
);

create index amazon_connections_client_idx on public.amazon_connections (client_id);

alter table public.amazon_connections enable row level security;

create policy "Read own or staff"
  on public.amazon_connections for select to authenticated
  using (client_id = auth.uid() or public.is_staff());

create table public.amazon_credentials (
  connection_id uuid primary key references public.amazon_connections(id) on delete cascade,
  refresh_token_secret_id uuid not null,
  updated_at timestamptz not null default now()
);

alter table public.amazon_credentials enable row level security;
revoke all on public.amazon_credentials from anon, authenticated;

create table public.amazon_oauth_states (
  nonce text primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by uuid not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.amazon_oauth_states enable row level security;
revoke all on public.amazon_oauth_states from anon, authenticated;

-- One-shot consume: returns the client_id only if the nonce exists, is unused and not expired.
create or replace function public.amazon_consume_oauth_state(p_nonce text)
returns uuid
language sql
security definer
set search_path = public
as $$
  update amazon_oauth_states
     set used_at = now()
   where nonce = p_nonce and used_at is null and expires_at > now()
  returning client_id;
$$;

create or replace function public.amazon_store_refresh_token(p_connection uuid, p_token text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret uuid;
begin
  select refresh_token_secret_id into v_secret from amazon_credentials where connection_id = p_connection;
  if v_secret is null then
    v_secret := vault.create_secret(p_token, 'amazon_rt_' || p_connection::text);
    insert into amazon_credentials (connection_id, refresh_token_secret_id) values (p_connection, v_secret);
  else
    perform vault.update_secret(v_secret, p_token);
    update amazon_credentials set updated_at = now() where connection_id = p_connection;
  end if;
end;
$$;

create or replace function public.amazon_get_refresh_token(p_connection uuid)
returns text
language sql
security definer
set search_path = public, vault
as $$
  select ds.decrypted_secret
    from amazon_credentials c
    join vault.decrypted_secrets ds on ds.id = c.refresh_token_secret_id
   where c.connection_id = p_connection;
$$;

create or replace function public.amazon_delete_refresh_token(p_connection uuid)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret uuid;
begin
  select refresh_token_secret_id into v_secret from amazon_credentials where connection_id = p_connection;
  if v_secret is not null then
    delete from amazon_credentials where connection_id = p_connection;
    delete from vault.secrets where id = v_secret;
  end if;
end;
$$;

revoke execute on function public.amazon_consume_oauth_state(text) from public, anon, authenticated;
revoke execute on function public.amazon_store_refresh_token(uuid, text) from public, anon, authenticated;
revoke execute on function public.amazon_get_refresh_token(uuid) from public, anon, authenticated;
revoke execute on function public.amazon_delete_refresh_token(uuid) from public, anon, authenticated;
grant execute on function public.amazon_consume_oauth_state(text) to service_role;
grant execute on function public.amazon_store_refresh_token(uuid, text) to service_role;
grant execute on function public.amazon_get_refresh_token(uuid) to service_role;
grant execute on function public.amazon_delete_refresh_token(uuid) to service_role;
