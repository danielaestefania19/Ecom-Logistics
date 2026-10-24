-- Phase 1: in-house PREP orders with inbound tracking.
-- Writes that need validation or audit (order creation, stage changes) go through
-- SECURITY DEFINER functions; everything else is plain RLS.

alter table public.clients add column if not exists language text not null default 'en'
  check (language in ('en', 'es'));
alter table public.clients add column if not exists phone text;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role in ('staff', 'admin') from clients where id = auth.uid()), false);
$$;

create policy "Staff can read clients"
  on public.clients for select to authenticated
  using (public.is_staff());

create type public.order_stage as enum (
  'quote',
  'awaiting_inventory',
  'received',
  'discrepancy',
  'scheduled',
  'prepped',
  'in_storage',
  'shipped',
  'invoiced',
  'paid',
  'cancelled'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer generated always as identity (start with 1001) unique,
  client_id uuid not null references public.clients (id),
  type text not null default 'prep' check (type in ('prep', '3pl')),
  stage public.order_stage not null default 'awaiting_inventory',
  shipment_creator text not null
    check (shipment_creator in ('customer', 'ecom_seller_central', 'ecom_scanpower')),
  ship_method text not null check (ship_method in ('spd', 'ltl')),
  total_cases integer not null default 0 check (total_cases >= 0),
  pallets integer not null default 0 check (pallets >= 0),
  extras text[] not null default '{}'
    check (extras <@ array['coupon_insert', 'filler', 'pallet', 'pallet_wrap']),
  storage_requested text not null default 'none'
    check (storage_requested in ('none', '1m', '2m', '3m_plus')),
  eta date,
  -- Internal notes live in order_events (visible_to_client = false): RLS here is row-level only.
  client_notes text,
  -- Informational only (computed client-side from pricingData.js); invoices stay manual.
  estimated_cost numeric(10, 2),
  quote_url text,
  prep_day date,
  received_at timestamptz,
  shipped_at timestamptz,
  stripe_invoice_id text,
  invoice_number text,
  asana_task_gid text,
  declaration_accepted boolean not null check (declaration_accepted),
  signer_name text not null,
  created_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_client_idx on public.orders (client_id, created_at desc);
create index orders_stage_idx on public.orders (stage);
create index orders_prep_day_idx on public.orders (prep_day) where prep_day is not null;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  sku text not null check (length(trim(sku)) > 0),
  fnsku text,
  product_name text,
  prep_type text not null default 'standard'
    check (prep_type in ('standard', 'oversize', 'polybag', 'bubble', 'bundle')),
  expected_qty integer not null check (expected_qty > 0),
  received_qty integer check (received_qty >= 0),
  damaged_qty integer not null default 0 check (damaged_qty >= 0),
  position smallint not null default 0
);

create index order_items_order_idx on public.order_items (order_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_stage public.order_stage,
  to_stage public.order_stage,
  note text,
  visible_to_client boolean not null default true,
  actor_id uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);

create table public.order_checklist (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  stage public.order_stage not null,
  item_key text not null,
  done boolean not null default false,
  done_by uuid references auth.users (id),
  done_at timestamptz,
  position smallint not null default 0,
  unique (order_id, item_key)
);

create table public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('labels', 'photo', 'other')),
  storage_path text not null unique,
  file_name text not null,
  uploaded_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index order_files_order_idx on public.order_files (order_id);

-- Status values mirror EasyPost tracker statuses.
create table public.shipments_inbound (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  tracking_number text not null check (length(trim(tracking_number)) > 0),
  carrier text,
  status text not null default 'unknown' check (status in (
    'unknown', 'pre_transit', 'in_transit', 'out_for_delivery', 'delivered',
    'available_for_pickup', 'return_to_sender', 'failure', 'cancelled', 'error'
  )),
  eta date,
  delivered_at timestamptz,
  last_event text,
  provider text,
  provider_tracker_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, tracking_number)
);

create index shipments_inbound_status_idx on public.shipments_inbound (status, eta);

create trigger shipments_inbound_updated_at
  before update on public.shipments_inbound
  for each row execute function public.update_updated_at();

create table public.tracking_events (
  id bigint generated always as identity primary key,
  shipment_id uuid not null references public.shipments_inbound (id) on delete cascade,
  status text,
  message text,
  location text,
  occurred_at timestamptz not null,
  unique (shipment_id, occurred_at, message)
);

-- ── Access helpers ──────────────────────────────────────────────────────────

create or replace function public.can_access_order(p_order uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_staff()
    or exists (select 1 from orders where id = p_order and client_id = auth.uid());
$$;

-- Storage object names are "<order_id>/<file>"; non-uuid prefixes must not raise.
create or replace function public.order_id_from_path(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return split_part(p_name, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

-- ── Stage bookkeeping ───────────────────────────────────────────────────────

create or replace function public.orders_stamp_stage()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.stage is distinct from old.stage then
    if new.stage = 'received' then new.received_at := coalesce(new.received_at, now()); end if;
    if new.stage = 'shipped' then new.shipped_at := coalesce(new.shipped_at, now()); end if;
  end if;
  return new;
end;
$$;

create trigger orders_stamp_stage
  before update of stage on public.orders
  for each row execute function public.orders_stamp_stage();

-- Every stage change is logged, whoever makes it (staff RPC or the tracking webhook).
-- An optional note travels in the transaction-local setting app.stage_note.
create or replace function public.orders_log_stage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into order_events (order_id, to_stage, note, actor_id)
    values (new.id, new.stage, 'order_submitted', auth.uid());
  elsif new.stage is distinct from old.stage then
    insert into order_events (order_id, from_stage, to_stage, note, actor_id)
    values (new.id, old.stage, new.stage, nullif(current_setting('app.stage_note', true), ''), auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_log_stage
  after insert or update of stage on public.orders
  for each row execute function public.orders_log_stage();

-- Replaces the 9 subtasks copied by hand onto every Asana order.
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
    ('received',  'docs_verified',      1),
    ('received',  'visual_inspection',  2),
    ('received',  'units_counted',      3),
    ('received',  'receiving_recorded', 4),
    ('prepped',   'fnsku_labels',       5),
    ('prepped',   'prep_materials',     6),
    ('prepped',   'master_boxes',       7),
    ('shipped',   'box_labels',         8),
    ('shipped',   'create_shipment',    9),
    ('shipped',   'book_pickup',       10),
    ('invoiced',  'stripe_invoice',    11)
  ) as s(stage, item_key, position)
  where s.item_key <> 'create_shipment' or new.shipment_creator <> 'customer';
  return new;
end;
$$;

create trigger orders_seed_checklist
  after insert on public.orders
  for each row execute function public.orders_seed_checklist();

-- ── RPCs ────────────────────────────────────────────────────────────────────

create or replace function public.create_prep_order(
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
  v_order uuid;
  v_item jsonb;
  v_pos smallint := 0;
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
    'prep',
    p_order->>'shipment_creator',
    p_order->>'ship_method',
    coalesce((p_order->>'total_cases')::int, 0),
    coalesce((p_order->>'pallets')::int, 0),
    coalesce(array(select jsonb_array_elements_text(p_order->'extras')), '{}'),
    coalesce(p_order->>'storage_requested', 'none'),
    nullif(p_order->>'eta', '')::date,
    nullif(trim(p_order->>'client_notes'), ''),
    nullif(p_order->>'estimated_cost', '')::numeric,
    coalesce((p_order->>'declaration_accepted')::boolean, false),
    trim(p_order->>'signer_name')
  )
  returning id into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into order_items (order_id, sku, fnsku, product_name, prep_type, expected_qty, position)
    values (
      v_order,
      trim(v_item->>'sku'),
      nullif(trim(v_item->>'fnsku'), ''),
      nullif(trim(v_item->>'product_name'), ''),
      coalesce(v_item->>'prep_type', 'standard'),
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
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  perform set_config('app.stage_note', coalesce(p_note, ''), true);
  update orders set stage = p_stage where id = p_order;
  if not found then raise exception 'order not found'; end if;
end;
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.order_checklist enable row level security;
alter table public.order_files enable row level security;
alter table public.shipments_inbound enable row level security;
alter table public.tracking_events enable row level security;

-- orders: clients read their own; only staff edit. Inserts go through create_prep_order.
create policy "Read own or staff" on public.orders for select to authenticated
  using (client_id = auth.uid() or public.is_staff());
create policy "Staff update" on public.orders for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Read accessible" on public.order_items for select to authenticated
  using (public.can_access_order(order_id));
create policy "Staff update" on public.order_items for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Read visible" on public.order_events for select to authenticated
  using (public.is_staff() or (visible_to_client and public.can_access_order(order_id)));
create policy "Staff add notes" on public.order_events for insert to authenticated
  with check (public.is_staff() and to_stage is null and from_stage is null);

create policy "Staff read" on public.order_checklist for select to authenticated
  using (public.is_staff());
create policy "Staff update" on public.order_checklist for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Read accessible" on public.order_files for select to authenticated
  using (public.can_access_order(order_id));
create policy "Upload to accessible" on public.order_files for insert to authenticated
  with check (
    public.can_access_order(order_id)
    and public.order_id_from_path(storage_path) = order_id
    and (public.is_staff() or kind = 'labels')
  );
create policy "Staff delete" on public.order_files for delete to authenticated
  using (public.is_staff());

create policy "Read accessible" on public.shipments_inbound for select to authenticated
  using (public.can_access_order(order_id));
-- Clients may add tracking numbers later, but never set carrier-reported fields.
create policy "Add to accessible" on public.shipments_inbound for insert to authenticated
  with check (
    public.can_access_order(order_id)
    and (public.is_staff() or (
      status = 'unknown' and provider_tracker_id is null and delivered_at is null and eta is null
    ))
  );
create policy "Staff update" on public.shipments_inbound for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff delete" on public.shipments_inbound for delete to authenticated
  using (public.is_staff());

create policy "Read accessible" on public.tracking_events for select to authenticated
  using (exists (
    select 1 from shipments_inbound s
    where s.id = shipment_id and public.can_access_order(s.order_id)
  ));

-- ── Function privileges ─────────────────────────────────────────────────────

revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.can_access_order(uuid) from public, anon;
revoke execute on function public.create_prep_order(jsonb, jsonb, text[]) from public, anon;
revoke execute on function public.set_order_stage(uuid, public.order_stage, text) from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.can_access_order(uuid) to authenticated;
grant execute on function public.create_prep_order(jsonb, jsonb, text[]) to authenticated;
grant execute on function public.set_order_stage(uuid, public.order_stage, text) to authenticated;

revoke execute on function public.orders_log_stage() from public, anon, authenticated;
revoke execute on function public.orders_seed_checklist() from public, anon, authenticated;

-- ── Storage: labels PDFs and inspection photos ──────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-files', 'order-files', false, 20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy "Order files read" on storage.objects for select to authenticated
  using (bucket_id = 'order-files' and public.can_access_order(public.order_id_from_path(name)));
create policy "Order files upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'order-files' and public.can_access_order(public.order_id_from_path(name)));
create policy "Order files delete" on storage.objects for delete to authenticated
  using (bucket_id = 'order-files' and public.is_staff());

-- ── Realtime (postgres_changes respects RLS) ────────────────────────────────

alter publication supabase_realtime add table public.orders, public.order_events, public.shipments_inbound;
