-- Admins delete an order (test or duplicate orders) with everything hanging off it. 3PL orders whose
-- units were already posted to inventory are refused: their stock history must stay consistent.
-- Returns the storage paths of the order's files so the portal removes them from the bucket.
create or replace function public.delete_order(p_order uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paths text[];
begin
  if not public.is_portal_admin() then raise exception 'only an admin can delete orders'; end if;
  if not exists (select 1 from orders where id = p_order) then raise exception 'order not found'; end if;
  if exists (select 1 from inventory_movements where order_id = p_order) then
    raise exception 'this order already added units to inventory; adjust the inventory instead of deleting it';
  end if;
  select coalesce(array_agg(storage_path), '{}') into v_paths from order_files where order_id = p_order;
  delete from orders where id = p_order;
  return v_paths;
end;
$$;

revoke execute on function public.delete_order(uuid) from public, anon;
grant execute on function public.delete_order(uuid) to authenticated;
