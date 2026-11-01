-- Order changes and quotes.
-- 1. Only admins change an order's SKUs/units; staff file a change request an admin approves.
-- 2. Admins can accept what was received when a count doesn't match (expected := received).
-- 3. Editable quote in the portal; the client accepts it there and its prices drive the invoice.

-- ── 1. Unit changes ─────────────────────────────────────────────────────────

-- Applies [{id, expected_qty, remove} | {sku, fnsku, product_name, prep_type, expected_qty}] and logs
-- a client-visible summary in the client's language. Returns the summary (null if nothing changed).
create or replace function public.apply_order_items_change(p_order uuid, p_items jsonb, p_reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
  v_lang text;
  v_line jsonb;
  v_item order_items;
  v_qty int;
  v_pos smallint;
  v_summary text[] := '{}';
begin
  select * into v_order from orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;
  if v_order.stage not in ('quote', 'awaiting_inventory', 'received', 'discrepancy', 'scheduled') then
    raise exception 'units can only change before the order is prepped';
  end if;
  select coalesce(max(position), 0) + 1 into v_pos from order_items where order_id = p_order;

  for v_line in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    if nullif(v_line->>'id', '') is not null then
      select * into v_item from order_items where id = (v_line->>'id')::uuid and order_id = p_order for update;
      if not found then raise exception 'item not on this order'; end if;
      if coalesce((v_line->>'remove')::boolean, false) then
        if coalesce(v_item.received_qty, 0) > 0 then
          raise exception '% already has units received; change its units instead of removing it', v_item.sku;
        end if;
        delete from order_items where id = v_item.id;
        v_summary := v_summary || ('− ' || v_item.sku);
      else
        v_qty := (v_line->>'expected_qty')::int;
        if v_qty is null or v_qty <= 0 then raise exception 'units must be greater than 0'; end if;
        if v_qty <> v_item.expected_qty then
          update order_items set expected_qty = v_qty where id = v_item.id;
          v_summary := v_summary || (v_item.sku || ': ' || v_item.expected_qty || ' → ' || v_qty);
        end if;
      end if;
    else
      v_qty := (v_line->>'expected_qty')::int;
      if nullif(trim(v_line->>'sku'), '') is null or v_qty is null or v_qty <= 0 then
        raise exception 'new SKUs need a SKU and units';
      end if;
      insert into order_items (order_id, sku, fnsku, product_name, prep_type, expected_qty, position)
      values (
        p_order,
        trim(v_line->>'sku'),
        nullif(upper(trim(v_line->>'fnsku')), ''),
        nullif(trim(v_line->>'product_name'), ''),
        case when v_order.type = 'prep' then coalesce(nullif(v_line->>'prep_type', ''), 'standard') else 'standard' end,
        v_qty,
        v_pos
      );
      v_pos := v_pos + 1;
      v_summary := v_summary || ('+ ' || trim(v_line->>'sku') || ' × ' || v_qty);
    end if;
  end loop;

  if coalesce(array_length(v_summary, 1), 0) = 0 then return null; end if;
  if not exists (select 1 from order_items where order_id = p_order) then
    raise exception 'an order needs at least one SKU';
  end if;

  select language into v_lang from clients where id = v_order.client_id;
  insert into order_events (order_id, note, visible_to_client)
  values (
    p_order,
    case when v_lang = 'es' then 'Unidades actualizadas: ' else 'Units updated: ' end
      || array_to_string(v_summary, '; ')
      || coalesce(' — ' || nullif(trim(p_reason), ''), ''),
    true
  );
  return array_to_string(v_summary, '; ');
end;
$$;

-- Admins change units directly.
create or replace function public.update_order_items(p_order uuid, p_items jsonb, p_reason text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_portal_admin() then raise exception 'only an admin can change units; send a request instead'; end if;
  return public.apply_order_items_change(p_order, p_items, p_reason);
end;
$$;

create table public.order_change_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  items jsonb not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid default auth.uid() references auth.users (id),
  decided_by uuid references auth.users (id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index order_change_requests_order_idx on public.order_change_requests (order_id, created_at);

alter table public.order_change_requests enable row level security;
create policy "Staff read" on public.order_change_requests for select to authenticated using (public.is_staff());

-- Staff ask an admin to change units.
create or replace function public.request_order_change(p_order uuid, p_items jsonb, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'explain why the units should change'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'nothing to change'; end if;
  insert into order_change_requests (order_id, items, reason) values (p_order, p_items, trim(p_reason)) returning id into v_id;
  perform queue_notification('change_requested', v_id::text);
  return v_id;
end;
$$;

create or replace function public.decide_order_change(p_request uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req order_change_requests;
begin
  if not public.is_portal_admin() then raise exception 'only an admin can approve changes'; end if;
  select * into v_req from order_change_requests where id = p_request and status = 'pending' for update;
  if not found then raise exception 'this request is no longer pending'; end if;
  if p_approve then perform public.apply_order_items_change(v_req.order_id, v_req.items, v_req.reason); end if;
  update order_change_requests
  set status = case when p_approve then 'approved' else 'rejected' end, decided_by = auth.uid(), decided_at = now()
  where id = p_request;
end;
$$;

-- ── 2. Accept what was received ─────────────────────────────────────────────

create or replace function public.accept_received_counts(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
begin
  if not public.is_portal_admin() then raise exception 'only an admin can accept the received count'; end if;
  if not exists (select 1 from orders where id = p_order and stage = 'discrepancy') then
    raise exception 'the order is not in discrepancy';
  end if;
  select jsonb_agg(jsonb_build_object('id', id, 'expected_qty', received_qty)) into v_items
  from order_items where order_id = p_order and received_qty is not null and received_qty > 0;
  perform public.apply_order_items_change(p_order, coalesce(v_items, '[]'::jsonb), null);
  perform set_config('app.stage_note', 'received_counts_accepted', true);
  update orders set stage = 'received' where id = p_order;
end;
$$;

-- Accepting the count moves the order back to "received": no repeat "your shipment arrived" email.
drop trigger order_events_notify on public.order_events;
create trigger order_events_notify
  after insert on public.order_events
  for each row
  when (new.visible_to_client and coalesce(new.note, '') not in ('stage_reverted', 'received_counts_accepted') and (
    new.note = 'order_submitted'
    or new.to_stage in ('received', 'discrepancy', 'prepped', 'in_storage', 'shipped', 'cancelled')
  ))
  execute function public.notify_order_event();

-- ── 3. Quotes ───────────────────────────────────────────────────────────────

alter table public.orders
  add column quote_status text check (quote_status in ('draft', 'sent', 'accepted', 'changes_requested')),
  add column quote_sent_at timestamptz,
  add column quote_accepted_at timestamptz,
  add column quote_response text;

-- key: the pricing line (prep_standard, case_receiving…) so the invoice can reuse the quoted price;
-- null for custom lines. unit_amount is in cents.
create table public.order_quote_lines (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  key text,
  description text not null check (length(trim(description)) > 0),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_amount numeric(12, 2) not null check (unit_amount >= 0),
  position smallint not null default 0
);
create index order_quote_lines_order_idx on public.order_quote_lines (order_id, position);

alter table public.order_quote_lines enable row level security;
-- Clients see the quote once it has been sent to them.
create policy "Read sent or staff" on public.order_quote_lines for select to authenticated
  using (public.is_staff() or exists (
    select 1 from orders o where o.id = order_id and o.client_id = auth.uid() and o.quote_status in ('sent', 'accepted', 'changes_requested')
  ));

create or replace function public.save_quote(p_order uuid, p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line jsonb;
  v_pos smallint := 0;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if exists (select 1 from orders where id = p_order and quote_status = 'accepted') then
    raise exception 'the client already accepted this quote';
  end if;
  delete from order_quote_lines where order_id = p_order;
  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop
    insert into order_quote_lines (order_id, key, description, quantity, unit_amount, position)
    values (
      p_order,
      nullif(v_line->>'key', ''),
      trim(v_line->>'description'),
      (v_line->>'quantity')::numeric,
      (v_line->>'unit_amount')::numeric,
      v_pos
    );
    v_pos := v_pos + 1;
  end loop;
  update orders set quote_status = coalesce(quote_status, 'draft') where id = p_order;
end;
$$;

create or replace function public.send_quote(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if not exists (select 1 from order_quote_lines where order_id = p_order) then raise exception 'the quote has no lines'; end if;
  update orders set quote_status = 'sent', quote_sent_at = v_now, quote_response = null
  where id = p_order and quote_status is distinct from 'accepted';
  if not found then raise exception 'the client already accepted this quote'; end if;
  perform queue_notification('quote_sent', p_order::text || '@' || extract(epoch from v_now)::bigint::text);
end;
$$;

-- Client: accept the quote (the order then waits for the merchandise) or ask for changes.
create or replace function public.respond_quote(p_order uuid, p_accept boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
  v_now timestamptz := now();
begin
  select * into v_order from orders where id = p_order and client_id = auth.uid() for update;
  if not found then raise exception 'order not found'; end if;
  if v_order.quote_status <> 'sent' then raise exception 'there is no quote waiting for your answer'; end if;
  if not p_accept and nullif(trim(p_note), '') is null then raise exception 'tell us what to change'; end if;

  update orders
  set quote_status = case when p_accept then 'accepted' else 'changes_requested' end,
      quote_accepted_at = case when p_accept then v_now else null end,
      quote_response = nullif(trim(p_note), '')
  where id = p_order;
  if p_accept and v_order.stage = 'quote' then
    perform set_config('app.stage_note', 'quote_accepted', true);
    update orders set stage = 'awaiting_inventory' where id = p_order;
  end if;
  perform queue_notification('quote_response', p_order::text || '@' || extract(epoch from v_now)::bigint::text);
end;
$$;

revoke execute on function public.apply_order_items_change(uuid, jsonb, text) from public, anon, authenticated;
do $$
declare f text;
begin
  foreach f in array array[
    'update_order_items(uuid, jsonb, text)', 'request_order_change(uuid, jsonb, text)', 'decide_order_change(uuid, boolean)',
    'accept_received_counts(uuid)', 'save_quote(uuid, jsonb)', 'send_quote(uuid)', 'respond_quote(uuid, boolean, text)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('lead_new', 'lead_welcome', 'order_stage', 'fulfillment_status', 'release_requested',
                  'release_shipped', 'client_cancelled', 'packing_list', 'labels_uploaded',
                  'change_requested', 'quote_sent', 'quote_response'));
