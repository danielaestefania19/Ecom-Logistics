-- The client says whether the merchandise arrives in one shipment or several, so the warehouse
-- knows to wait for every tracking before counting the order as complete.
alter table public.orders add column inbound_shipments text not null default 'single'
  check (inbound_shipments in ('single', 'multiple'));

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
    storage_requested, eta, client_notes, estimated_cost, declaration_accepted, signer_name, inbound_shipments
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
    trim(p_order->>'signer_name'),
    case when p_order->>'inbound_shipments' = 'multiple' then 'multiple' else 'single' end
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
