-- The order summary (what the client asked for) is edited by admins only. Other staff keep editing
-- the operational fields: prep day, receiving date, invoice and quote links.
create or replace function public.orders_guard_summary()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Inside security definer RPCs current_user is the function owner, not "authenticated".
  if current_user = 'authenticated' and not public.is_portal_admin() and (
    new.type is distinct from old.type
    or new.eta is distinct from old.eta
    or new.ship_method is distinct from old.ship_method
    or new.shipment_creator is distinct from old.shipment_creator
    or new.inbound_shipments is distinct from old.inbound_shipments
    or new.total_cases is distinct from old.total_cases
    or new.pallets is distinct from old.pallets
    or new.storage_requested is distinct from old.storage_requested
    or new.extras is distinct from old.extras
    or new.client_notes is distinct from old.client_notes
    or new.estimated_cost is distinct from old.estimated_cost
  ) then
    raise exception 'only an admin can edit the order summary';
  end if;
  return new;
end;
$$;

create trigger orders_guard_summary
  before update on public.orders
  for each row execute function public.orders_guard_summary();
