-- Correcting the FNSKU check count (order_items.prepped_qty) after an over-scan: admins set it
-- directly, other staff file a request an admin approves (same queue as unit changes).

alter table public.order_change_requests
  add column kind text not null default 'units' check (kind in ('units', 'prepped'));

-- Applies [{id, prepped_qty}] and logs an internal note. Returns the summary (null if nothing changed).
create or replace function public.apply_prepped_fix(p_order uuid, p_items jsonb, p_reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line jsonb;
  v_item order_items;
  v_qty int;
  v_summary text[] := '{}';
begin
  for v_line in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    select * into v_item from order_items where id = (v_line->>'id')::uuid and order_id = p_order for update;
    if not found then raise exception 'item not on this order'; end if;
    v_qty := (v_line->>'prepped_qty')::int;
    if v_qty is null or v_qty < 0 then raise exception 'the FNSKU count must be 0 or more'; end if;
    if v_qty <> v_item.prepped_qty then
      update order_items set prepped_qty = v_qty where id = v_item.id;
      v_summary := v_summary || (v_item.sku || ': ' || v_item.prepped_qty || ' → ' || v_qty);
    end if;
  end loop;
  if coalesce(array_length(v_summary, 1), 0) = 0 then return null; end if;
  insert into order_events (order_id, note, visible_to_client)
  values (
    p_order,
    'Chequeo FNSKU corregido: ' || array_to_string(v_summary, '; ') || coalesce(' — ' || nullif(trim(p_reason), ''), ''),
    false
  );
  return array_to_string(v_summary, '; ');
end;
$$;

create or replace function public.set_prepped_qty(p_item uuid, p_qty int, p_reason text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid;
begin
  if not public.is_portal_admin() then raise exception 'only an admin can correct the FNSKU check; send a request instead'; end if;
  select order_id into v_order from order_items where id = p_item;
  if v_order is null then raise exception 'item not found'; end if;
  return public.apply_prepped_fix(v_order, jsonb_build_array(jsonb_build_object('id', p_item, 'prepped_qty', p_qty)), p_reason);
end;
$$;

create or replace function public.request_prepped_fix(p_item uuid, p_qty int, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid;
  v_id uuid;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'explain why the FNSKU count should change'; end if;
  if p_qty is null or p_qty < 0 then raise exception 'the FNSKU count must be 0 or more'; end if;
  select order_id into v_order from order_items where id = p_item;
  if v_order is null then raise exception 'item not found'; end if;
  insert into order_change_requests (order_id, items, reason, kind)
  values (v_order, jsonb_build_array(jsonb_build_object('id', p_item, 'prepped_qty', p_qty)), trim(p_reason), 'prepped')
  returning id into v_id;
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
  if p_approve then
    if v_req.kind = 'prepped' then
      perform public.apply_prepped_fix(v_req.order_id, v_req.items, v_req.reason);
    else
      perform public.apply_order_items_change(v_req.order_id, v_req.items, v_req.reason);
    end if;
  end if;
  update order_change_requests
  set status = case when p_approve then 'approved' else 'rejected' end, decided_by = auth.uid(), decided_at = now()
  where id = p_request;
end;
$$;

-- Direct API edits can't change units or the FNSKU count; scanning and the RPCs above can.
create or replace function public.order_items_guard_units()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Inside the security definer RPCs current_user is the function owner, not "authenticated".
  if current_user = 'authenticated' and new.expected_qty is distinct from old.expected_qty then
    raise exception 'only an admin can change units; send a request instead';
  end if;
  if current_user = 'authenticated' and new.prepped_qty is distinct from old.prepped_qty then
    raise exception 'only an admin can correct the FNSKU check; send a request instead';
  end if;
  return new;
end;
$$;

drop trigger order_items_guard_units on public.order_items;
create trigger order_items_guard_units
  before update of expected_qty, prepped_qty on public.order_items
  for each row execute function public.order_items_guard_units();

revoke execute on function public.apply_prepped_fix(uuid, jsonb, text) from public, anon, authenticated;
revoke execute on function public.set_prepped_qty(uuid, int, text) from public, anon;
revoke execute on function public.request_prepped_fix(uuid, int, text) from public, anon;
grant execute on function public.set_prepped_qty(uuid, int, text) to authenticated;
grant execute on function public.request_prepped_fix(uuid, int, text) to authenticated;
