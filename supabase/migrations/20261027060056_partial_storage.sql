-- Partial storage for PREP orders: after prep, part of each SKU ships to Amazon and part stays.
-- Staff record what stays (order_items.stored_qty); the client later asks to send stored units
-- out in "storage releases", which staff mark shipped.

alter table public.order_items add column stored_qty integer not null default 0 check (stored_qty >= 0);
alter table public.orders add column stored_at timestamptz;

create table public.storage_releases (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity (start with 7001) unique,
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'shipped', 'cancelled')),
  notes text,
  tracking text,
  created_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  shipped_at timestamptz
);
create index storage_releases_order_idx on public.storage_releases (order_id, created_at);

create table public.storage_release_lines (
  id bigint generated always as identity primary key,
  release_id uuid not null references public.storage_releases (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  qty integer not null check (qty > 0),
  unique (release_id, order_item_id)
);

alter table public.storage_releases enable row level security;
alter table public.storage_release_lines enable row level security;
create policy "Read accessible" on public.storage_releases for select to authenticated
  using (public.can_access_order(order_id));
create policy "Read accessible" on public.storage_release_lines for select to authenticated
  using (exists (select 1 from storage_releases r where r.id = release_id and public.can_access_order(r.order_id)));

alter publication supabase_realtime add table public.storage_releases;

-- Units of an item still in storage and not yet promised to a release.
create or replace function public.storage_available(p_item uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select i.stored_qty - coalesce((
    select sum(l.qty) from storage_release_lines l
    join storage_releases r on r.id = l.release_id
    where l.order_item_id = i.id and r.status <> 'cancelled'
  ), 0)::int
  from order_items i where i.id = p_item;
$$;

-- Staff: how many good units of each SKU stay in storage. p_items = [{id, stored_qty}].
create or replace function public.set_storage_split(p_order uuid, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line jsonb;
  v_item order_items;
  v_qty int;
  v_released int;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;

  for v_line in select * from jsonb_array_elements(p_items) loop
    select * into v_item from order_items where id = (v_line->>'id')::uuid and order_id = p_order for update;
    if not found then raise exception 'item not on this order'; end if;
    v_qty := coalesce((v_line->>'stored_qty')::int, 0);
    if v_qty < 0 or v_qty > greatest(coalesce(v_item.received_qty, v_item.expected_qty) - v_item.damaged_qty, 0) then
      raise exception 'storage for % must be between 0 and the good units received', v_item.sku;
    end if;
    select coalesce(sum(l.qty), 0) into v_released from storage_release_lines l
      join storage_releases r on r.id = l.release_id
      where l.order_item_id = v_item.id and r.status <> 'cancelled';
    if v_qty < v_released then
      raise exception 'storage for % can''t be less than the % units already sent out', v_item.sku, v_released;
    end if;
    update order_items set stored_qty = v_qty where id = v_item.id;
  end loop;

  update orders
  set stored_at = case
    when exists (select 1 from order_items where order_id = p_order and stored_qty > 0) then coalesce(stored_at, now())
    else null end
  where id = p_order;
end;
$$;

-- Client (own order) or staff: ask to send stored units out. p_lines = [{order_item_id, qty}].
create or replace function public.request_storage_release(p_order uuid, p_lines jsonb, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_release uuid;
  v_line jsonb;
  v_qty int;
  v_item uuid;
begin
  if not public.can_access_order(p_order) then raise exception 'not allowed'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'choose at least one SKU and quantity';
  end if;

  insert into storage_releases (order_id, notes) values (p_order, nullif(trim(p_notes), ''))
  returning id into v_release;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_item := (v_line->>'order_item_id')::uuid;
    v_qty := coalesce((v_line->>'qty')::int, 0);
    if v_qty <= 0 then continue; end if;
    perform 1 from order_items where id = v_item and order_id = p_order for update;
    if not found then raise exception 'item not on this order'; end if;
    if v_qty > public.storage_available(v_item) then
      raise exception 'only % units of that SKU are left in storage', public.storage_available(v_item);
    end if;
    insert into storage_release_lines (release_id, order_item_id, qty) values (v_release, v_item, v_qty);
  end loop;

  if not exists (select 1 from storage_release_lines where release_id = v_release) then
    raise exception 'choose at least one SKU and quantity';
  end if;
  return v_release;
end;
$$;

-- Staff: a requested release ships (optionally with tracking) or is cancelled.
create or replace function public.set_storage_release_status(p_release uuid, p_status text, p_tracking text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if p_status not in ('shipped', 'cancelled') then raise exception 'invalid status'; end if;
  update storage_releases
  set status = p_status,
      shipped_at = case when p_status = 'shipped' then now() else shipped_at end,
      tracking = coalesce(nullif(trim(p_tracking), ''), tracking)
  where id = p_release and status = 'requested';
  if not found then raise exception 'this release is no longer pending'; end if;
end;
$$;

revoke execute on function public.storage_available(uuid) from public, anon;
revoke execute on function public.set_storage_split(uuid, jsonb) from public, anon;
revoke execute on function public.request_storage_release(uuid, jsonb, text) from public, anon;
revoke execute on function public.set_storage_release_status(uuid, text, text) from public, anon;
grant execute on function public.storage_available(uuid) to authenticated;
grant execute on function public.set_storage_split(uuid, jsonb) to authenticated;
grant execute on function public.request_storage_release(uuid, jsonb, text) to authenticated;
grant execute on function public.set_storage_release_status(uuid, text, text) to authenticated;

-- Emails: staff hear about new requests; the client hears when their units ship.
alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('lead_new', 'lead_welcome', 'order_stage', 'fulfillment_status', 'release_requested', 'release_shipped'));

create or replace function public.notify_storage_release()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform queue_notification('release_requested', new.id::text);
  elsif new.status = 'shipped' and old.status <> 'shipped' then
    perform queue_notification('release_shipped', new.id::text);
  end if;
  return new;
end;
$$;

-- Deferred to commit so the email sees the release lines inserted after the header row.
create constraint trigger storage_releases_notify
  after insert or update of status on public.storage_releases
  deferrable initially deferred
  for each row execute function public.notify_storage_release();

revoke execute on function public.notify_storage_release() from public, anon, authenticated;
