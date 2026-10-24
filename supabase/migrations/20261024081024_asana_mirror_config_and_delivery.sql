insert into public.portal_config (key, value) values (
  'asana_mirror',
  '{"project_gid":"1219834199447653","sections":{"quote":"1219834199362680","awaiting_inventory":"1219834593534827","received":"1219834677219151","discrepancy":"1219859292868306","scheduled":"1219834593544401","prepped":"1219834593525180","in_storage":"1219834512061049","shipped":"1219834534741254","invoiced":"1219834677214134","paid":"1219834512061146","cancelled":"1219834512060985"}}'
) on conflict (key) do update set value = excluded.value;

-- Called by the tracking webhook (service role) once every inbound shipment is delivered.
create or replace function public.mark_order_delivered(p_order uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from shipments_inbound where order_id = p_order and status <> 'delivered') then
    return false;
  end if;
  perform set_config('app.stage_note', 'carrier_delivered', true);
  update orders set stage = 'received' where id = p_order and stage = 'awaiting_inventory';
  return found;
end;
$$;

revoke execute on function public.mark_order_delivered(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_delivered(uuid) to service_role;
