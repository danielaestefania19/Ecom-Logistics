-- Phase 2: 3PL — per-SKU inventory, inbound stock receipts and outbound fulfillment orders.
-- Stock is a ledger (inventory_movements); on-hand is always the sum, never a mutable counter.

-- ── Clients: which services they use + storage currently occupied (billed monthly) ──

alter table public.clients add column services text[] not null default '{prep}'
  check (services <@ array['prep', '3pl']);
alter table public.clients add column storage_bins integer not null default 0 check (storage_bins >= 0);
alter table public.clients add column storage_shelves integer not null default 0 check (storage_shelves >= 0);
alter table public.clients add column storage_pallets integer not null default 0 check (storage_pallets >= 0);

-- ── Orders: 3PL inbound shipments reuse orders (type = '3pl') ───────────────

alter table public.orders alter column shipment_creator drop not null;
alter table public.orders alter column ship_method drop not null;
alter table public.orders add constraint orders_prep_outbound_required
  check (type <> 'prep' or (shipment_creator is not null and ship_method is not null));
-- Set once the counted units are posted to stock, so a receipt can never be posted twice.
alter table public.orders add column stocked_at timestamptz;

-- ── Catalog ─────────────────────────────────────────────────────────────────

create table public.products (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  sku text not null check (length(trim(sku)) > 0),
  name text,
  barcode text,
  location text,
  packaging text not null default 'small_medium_box'
    check (packaging in ('small_medium_box', 'large_box', 'bubble_mailer', 'poly_mailer')),
  fragile boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, sku)
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

alter table public.order_items add column product_id uuid references public.products (id);

-- ── Fulfillment (pick, pack & ship) ─────────────────────────────────────────

create type public.fulfillment_status as enum ('pending', 'on_hold', 'picking', 'packed', 'shipped', 'cancelled');

create table public.fulfillment_orders (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity (start with 5001) unique,
  client_id uuid not null references public.clients (id),
  channel text not null default 'shopify' check (channel in ('shopify', 'tiktok', 'amazon', 'other')),
  external_ref text,
  recipient_name text not null check (length(trim(recipient_name)) > 0),
  ship_to text,
  packaging text not null default 'small_medium_box'
    check (packaging in ('small_medium_box', 'large_box', 'bubble_mailer', 'poly_mailer')),
  status public.fulfillment_status not null default 'pending',
  carrier text,
  tracking_number text,
  notes text,
  shipped_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index fulfillment_orders_external_ref_key
  on public.fulfillment_orders (client_id, channel, external_ref)
  where external_ref is not null and status <> 'cancelled';
create index fulfillment_orders_status_idx on public.fulfillment_orders (status, created_at);
create index fulfillment_orders_client_idx on public.fulfillment_orders (client_id, created_at desc);

create trigger fulfillment_orders_updated_at
  before update on public.fulfillment_orders
  for each row execute function public.update_updated_at();

create table public.fulfillment_lines (
  id uuid primary key default gen_random_uuid(),
  fulfillment_id uuid not null references public.fulfillment_orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty integer not null check (qty > 0)
);

create index fulfillment_lines_fulfillment_idx on public.fulfillment_lines (fulfillment_id);
create index fulfillment_lines_product_idx on public.fulfillment_lines (product_id);

create table public.fulfillment_events (
  id bigint generated always as identity primary key,
  fulfillment_id uuid not null references public.fulfillment_orders (id) on delete cascade,
  from_status public.fulfillment_status,
  to_status public.fulfillment_status,
  note text,
  actor_id uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index fulfillment_events_idx on public.fulfillment_events (fulfillment_id, created_at);

create table public.fulfillment_files (
  id uuid primary key default gen_random_uuid(),
  fulfillment_id uuid not null references public.fulfillment_orders (id) on delete cascade,
  kind text not null default 'label' check (kind in ('label', 'other')),
  storage_path text not null unique,
  file_name text not null,
  uploaded_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index fulfillment_files_idx on public.fulfillment_files (fulfillment_id);

-- ── Stock ledger ────────────────────────────────────────────────────────────

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id),
  client_id uuid not null references public.clients (id),
  qty integer not null check (qty <> 0),
  kind text not null check (kind in ('receipt', 'fulfillment', 'adjustment', 'damage', 'return')),
  order_id uuid references public.orders (id),
  fulfillment_id uuid references public.fulfillment_orders (id),
  note text,
  actor_id uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_client_idx on public.inventory_movements (client_id, created_at desc);

-- Reserved = units on fulfillment orders that are queued but not shipped yet (on_hold reserves nothing).
create view public.inventory_levels with (security_invoker = true) as
select
  p.id as product_id,
  p.client_id,
  p.sku,
  p.name,
  p.barcode,
  p.location,
  p.packaging,
  p.fragile,
  p.active,
  coalesce((select sum(m.qty) from public.inventory_movements m where m.product_id = p.id), 0)::integer as on_hand,
  coalesce((
    select sum(l.qty)
    from public.fulfillment_lines l
    join public.fulfillment_orders f on f.id = l.fulfillment_id
    where l.product_id = p.id and f.status in ('pending', 'picking', 'packed')
  ), 0)::integer as reserved
from public.products p;

-- ── Access helpers ──────────────────────────────────────────────────────────

create or replace function public.can_access_fulfillment(p_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_staff()
    or exists (select 1 from fulfillment_orders where id = p_id and client_id = auth.uid());
$$;

-- Storage object names are "<order or fulfillment id>/<file>".
create or replace function public.can_access_object(p_name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.can_access_order(public.order_id_from_path(p_name))
    or public.can_access_fulfillment(public.order_id_from_path(p_name));
$$;

-- Units free to promise; caller must hold row locks on the products to avoid overselling.
create or replace function public.available_units(p_product uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select on_hand - reserved from inventory_levels where product_id = p_product;
$$;

-- ── Checklist: 3PL inbounds get a put-away step instead of prep/ship steps ──

create or replace function public.orders_seed_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into order_checklist (order_id, stage, item_key, position)
  select new.id, s.stage::order_stage, s.item_key, s.position
  from (values
    ('prep', 'received',   'docs_verified',      1),
    ('prep', 'received',   'visual_inspection',  2),
    ('prep', 'received',   'units_counted',      3),
    ('prep', 'received',   'receiving_recorded', 4),
    ('prep', 'prepped',    'fnsku_labels',       5),
    ('prep', 'prepped',    'prep_materials',     6),
    ('prep', 'prepped',    'master_boxes',       7),
    ('prep', 'shipped',    'box_labels',         8),
    ('prep', 'shipped',    'create_shipment',    9),
    ('prep', 'shipped',    'book_pickup',       10),
    ('prep', 'invoiced',   'stripe_invoice',    11),
    ('3pl',  'received',   'docs_verified',      1),
    ('3pl',  'received',   'visual_inspection',  2),
    ('3pl',  'received',   'units_counted',      3),
    ('3pl',  'received',   'receiving_recorded', 4),
    ('3pl',  'in_storage', 'putaway',            5),
    ('3pl',  'invoiced',   'stripe_invoice',     6)
  ) as s(type, stage, item_key, position)
  where s.type = new.type
    and (s.item_key <> 'create_shipment' or new.shipment_creator <> 'customer');
  return new;
end;
$$;

-- ── RPCs ────────────────────────────────────────────────────────────────────

-- Replaces create_prep_order: one entry point for PREP orders and 3PL inbound shipments.
create or replace function public.create_order(
  p_order jsonb,
  p_items jsonb,
  p_tracking text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
  v_type text := coalesce(p_order->>'type', 'prep');
  v_order uuid;
  v_item jsonb;
  v_pos smallint := 0;
  v_product uuid;
  v_tracking text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  v_client := coalesce(nullif(p_order->>'client_id', '')::uuid, auth.uid());
  if v_client <> auth.uid() and not public.is_staff() then
    raise exception 'cannot create orders for another client';
  end if;
  if not exists (select 1 from clients where id = v_client) then
    raise exception 'client profile not found';
  end if;
  if v_type = '3pl' and not exists (select 1 from clients where id = v_client and '3pl' = any(services)) then
    raise exception 'this client is not set up for 3PL';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'at least one SKU line is required';
  end if;
  if jsonb_array_length(p_items) > 200 then
    raise exception 'too many SKU lines';
  end if;

  insert into orders (
    client_id, type, shipment_creator, ship_method, total_cases, pallets, extras,
    storage_requested, eta, client_notes, estimated_cost, declaration_accepted, signer_name
  ) values (
    v_client,
    v_type,
    case when v_type = 'prep' then p_order->>'shipment_creator' end,
    case when v_type = 'prep' then p_order->>'ship_method' end,
    coalesce((p_order->>'total_cases')::int, 0),
    coalesce((p_order->>'pallets')::int, 0),
    case when v_type = 'prep' then coalesce(array(select jsonb_array_elements_text(p_order->'extras')), '{}') else '{}' end,
    case when v_type = 'prep' then coalesce(p_order->>'storage_requested', 'none') else 'none' end,
    nullif(p_order->>'eta', '')::date,
    nullif(trim(p_order->>'client_notes'), ''),
    nullif(p_order->>'estimated_cost', '')::numeric,
    coalesce((p_order->>'declaration_accepted')::boolean, false),
    trim(p_order->>'signer_name')
  )
  returning id into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product := null;
    if v_type = '3pl' then
      insert into products (client_id, sku, name)
      values (v_client, trim(v_item->>'sku'), nullif(trim(v_item->>'product_name'), ''))
      on conflict (client_id, sku) do update set name = coalesce(products.name, excluded.name)
      returning id into v_product;
    end if;

    insert into order_items (order_id, product_id, sku, fnsku, product_name, prep_type, expected_qty, position)
    values (
      v_order,
      v_product,
      trim(v_item->>'sku'),
      nullif(trim(v_item->>'fnsku'), ''),
      nullif(trim(v_item->>'product_name'), ''),
      case when v_type = 'prep' then coalesce(v_item->>'prep_type', 'standard') else 'standard' end,
      (v_item->>'expected_qty')::int,
      v_pos
    );
    v_pos := v_pos + 1;
  end loop;

  foreach v_tracking in array coalesce(p_tracking, '{}') loop
    if length(trim(v_tracking)) > 0 then
      insert into shipments_inbound (order_id, tracking_number)
      values (v_order, upper(trim(v_tracking)))
      on conflict (order_id, tracking_number) do nothing;
    end if;
  end loop;

  return v_order;
end;
$$;

drop function public.create_prep_order(jsonb, jsonb, text[]);

-- Moving a 3PL inbound to in_storage posts the counted good units to stock exactly once.
create or replace function public.set_order_stage(
  p_order uuid,
  p_stage public.order_stage,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;

  select * into v_order from orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;

  if v_order.type = '3pl' and p_stage = 'in_storage' and v_order.stocked_at is null then
    if exists (select 1 from order_items where order_id = p_order and received_qty is null) then
      raise exception 'count every SKU before adding it to inventory';
    end if;

    insert into products (client_id, sku, name)
    select v_order.client_id, i.sku, i.product_name
    from order_items i where i.order_id = p_order and i.product_id is null
    on conflict (client_id, sku) do nothing;

    update order_items i set product_id = p.id
    from products p
    where i.order_id = p_order and i.product_id is null
      and p.client_id = v_order.client_id and p.sku = i.sku;

    insert into inventory_movements (product_id, client_id, qty, kind, order_id)
    select i.product_id, v_order.client_id, i.received_qty - i.damaged_qty, 'receipt', p_order
    from order_items i
    where i.order_id = p_order and i.received_qty - i.damaged_qty > 0;

    update orders set stocked_at = now() where id = p_order;
  end if;

  perform set_config('app.stage_note', coalesce(p_note, ''), true);
  update orders set stage = p_stage where id = p_order;
end;
$$;

create or replace function public.create_fulfillment_order(p_order jsonb, p_lines jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid := nullif(p_order->>'client_id', '')::uuid;
  v_id uuid;
  v_line jsonb;
  v_product uuid;
  v_short boolean := false;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if v_client is null or not exists (select 1 from clients where id = v_client and '3pl' = any(services)) then
    raise exception 'choose a 3PL client';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'at least one product line is required';
  end if;

  insert into fulfillment_orders (client_id, channel, external_ref, recipient_name, ship_to, packaging, carrier, tracking_number, notes)
  values (
    v_client,
    coalesce(p_order->>'channel', 'shopify'),
    nullif(trim(p_order->>'external_ref'), ''),
    trim(p_order->>'recipient_name'),
    nullif(trim(p_order->>'ship_to'), ''),
    coalesce(p_order->>'packaging', 'small_medium_box'),
    nullif(trim(p_order->>'carrier'), ''),
    nullif(upper(trim(p_order->>'tracking_number')), ''),
    nullif(trim(p_order->>'notes'), '')
  )
  returning id into v_id;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_product := (v_line->>'product_id')::uuid;
    -- Lock the product so concurrent orders can't both claim the last units.
    perform 1 from products where id = v_product and client_id = v_client for update;
    if not found then raise exception 'product does not belong to this client'; end if;
    insert into fulfillment_lines (fulfillment_id, product_id, qty) values (v_id, v_product, (v_line->>'qty')::int);
  end loop;

  -- Lines are already counted as reserved, so availability below zero means we're short.
  select exists (
    select 1 from fulfillment_lines l
    where l.fulfillment_id = v_id and public.available_units(l.product_id) < 0
  ) into v_short;

  if v_short then
    update fulfillment_orders set status = 'on_hold' where id = v_id;
  end if;

  insert into fulfillment_events (fulfillment_id, to_status, note)
  values (v_id, case when v_short then 'on_hold'::fulfillment_status else 'pending' end,
          case when v_short then 'insufficient_stock' else 'order_created' end);

  return v_id;
end;
$$;

create or replace function public.set_fulfillment_status(
  p_id uuid,
  p_status public.fulfillment_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_f fulfillment_orders;
  v_allowed public.fulfillment_status[];
begin
  if not public.is_staff() then raise exception 'staff only'; end if;

  select * into v_f from fulfillment_orders where id = p_id for update;
  if not found then raise exception 'fulfillment order not found'; end if;

  v_allowed := case v_f.status
    when 'pending' then array['picking', 'on_hold', 'cancelled']::fulfillment_status[]
    when 'on_hold' then array['pending', 'cancelled']::fulfillment_status[]
    when 'picking' then array['packed', 'pending', 'cancelled']::fulfillment_status[]
    when 'packed'  then array['shipped', 'picking', 'cancelled']::fulfillment_status[]
    else array[]::fulfillment_status[]
  end;
  if not p_status = any(v_allowed) then
    raise exception 'cannot move from % to %', v_f.status, p_status;
  end if;

  if v_f.status = 'on_hold' and p_status = 'pending' then
    perform 1 from products p join fulfillment_lines l on l.product_id = p.id where l.fulfillment_id = p_id for update of p;
    if exists (
      select 1 from fulfillment_lines l
      where l.fulfillment_id = p_id and public.available_units(l.product_id) < l.qty
    ) then
      raise exception 'not enough stock to release this order';
    end if;
  end if;

  if p_status = 'shipped' then
    if v_f.tracking_number is null and not exists (select 1 from fulfillment_files where fulfillment_id = p_id and kind = 'label') then
      raise exception 'add the shipping label or a tracking number before shipping';
    end if;
    insert into inventory_movements (product_id, client_id, qty, kind, fulfillment_id)
    select l.product_id, v_f.client_id, -l.qty, 'fulfillment', p_id
    from fulfillment_lines l where l.fulfillment_id = p_id;
  end if;

  update fulfillment_orders
  set status = p_status, shipped_at = case when p_status = 'shipped' then now() else shipped_at end
  where id = p_id;

  insert into fulfillment_events (fulfillment_id, from_status, to_status, note)
  values (p_id, v_f.status, p_status, nullif(trim(p_note), ''));
end;
$$;

create or replace function public.adjust_inventory(
  p_product uuid,
  p_qty integer,
  p_kind text,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client uuid;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if p_kind not in ('adjustment', 'damage', 'return') then raise exception 'invalid adjustment type'; end if;
  if p_qty = 0 then raise exception 'quantity cannot be zero'; end if;
  if nullif(trim(p_note), '') is null then raise exception 'a reason is required'; end if;

  select client_id into v_client from products where id = p_product for update;
  if not found then raise exception 'product not found'; end if;
  if (select on_hand from inventory_levels where product_id = p_product) + p_qty < 0 then
    raise exception 'stock cannot go below zero';
  end if;

  insert into inventory_movements (product_id, client_id, qty, kind, note)
  values (p_product, v_client, p_qty, p_kind, trim(p_note));
end;
$$;

create or replace function public.set_client_storage(
  p_client uuid,
  p_bins integer,
  p_shelves integer,
  p_pallets integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  update clients
  set storage_bins = p_bins, storage_shelves = p_shelves, storage_pallets = p_pallets
  where id = p_client;
  if not found then raise exception 'client not found'; end if;
end;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.products enable row level security;
alter table public.fulfillment_orders enable row level security;
alter table public.fulfillment_lines enable row level security;
alter table public.fulfillment_events enable row level security;
alter table public.fulfillment_files enable row level security;
alter table public.inventory_movements enable row level security;

create policy "Read own or staff" on public.products for select to authenticated
  using (client_id = auth.uid() or public.is_staff());
create policy "Staff insert" on public.products for insert to authenticated
  with check (public.is_staff());
create policy "Staff update" on public.products for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Read own or staff" on public.inventory_movements for select to authenticated
  using (client_id = auth.uid() or public.is_staff());

create policy "Read own or staff" on public.fulfillment_orders for select to authenticated
  using (client_id = auth.uid() or public.is_staff());
create policy "Staff update" on public.fulfillment_orders for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Status and stock-affecting columns only change through set_fulfillment_status.
revoke update on public.fulfillment_orders from authenticated;
grant update (channel, external_ref, recipient_name, ship_to, packaging, carrier, tracking_number, notes)
  on public.fulfillment_orders to authenticated;

create policy "Read accessible" on public.fulfillment_lines for select to authenticated
  using (public.can_access_fulfillment(fulfillment_id));

create policy "Read accessible" on public.fulfillment_events for select to authenticated
  using (public.can_access_fulfillment(fulfillment_id));
create policy "Staff add notes" on public.fulfillment_events for insert to authenticated
  with check (public.is_staff() and from_status is null and to_status is null);

create policy "Read accessible" on public.fulfillment_files for select to authenticated
  using (public.can_access_fulfillment(fulfillment_id));
create policy "Upload to accessible" on public.fulfillment_files for insert to authenticated
  with check (
    public.can_access_fulfillment(fulfillment_id)
    and public.order_id_from_path(storage_path) = fulfillment_id
    and (public.is_staff() or kind = 'label')
  );
create policy "Staff delete" on public.fulfillment_files for delete to authenticated
  using (public.is_staff());

drop policy "Order files read" on storage.objects;
drop policy "Order files upload" on storage.objects;
create policy "Order files read" on storage.objects for select to authenticated
  using (bucket_id = 'order-files' and public.can_access_object(name));
create policy "Order files upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'order-files' and public.can_access_object(name));

-- ── Function privileges ─────────────────────────────────────────────────────

revoke execute on function public.can_access_fulfillment(uuid) from public, anon;
revoke execute on function public.can_access_object(text) from public, anon;
revoke execute on function public.available_units(uuid) from public, anon;
revoke execute on function public.create_order(jsonb, jsonb, text[]) from public, anon;
revoke execute on function public.create_fulfillment_order(jsonb, jsonb) from public, anon;
revoke execute on function public.set_fulfillment_status(uuid, public.fulfillment_status, text) from public, anon;
revoke execute on function public.adjust_inventory(uuid, integer, text, text) from public, anon;
revoke execute on function public.set_client_storage(uuid, integer, integer, integer) from public, anon;
grant execute on function public.can_access_fulfillment(uuid) to authenticated;
grant execute on function public.can_access_object(text) to authenticated;
grant execute on function public.available_units(uuid) to authenticated;
grant execute on function public.create_order(jsonb, jsonb, text[]) to authenticated;
grant execute on function public.create_fulfillment_order(jsonb, jsonb) to authenticated;
grant execute on function public.set_fulfillment_status(uuid, public.fulfillment_status, text) to authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text, text) to authenticated;
grant execute on function public.set_client_storage(uuid, integer, integer, integer) to authenticated;

alter publication supabase_realtime add table public.fulfillment_orders, public.inventory_movements;
