-- When the client creates the Amazon shipment, an order can't ship until the client's labels are
-- uploaded after the packing list was sent (the board's quick button included). Undos are exempt.
create or replace function public.orders_require_labels_to_ship()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.stage = 'shipped' and old.stage is distinct from 'shipped'
     and new.shipment_creator = 'customer' and new.packing_sent_at is not null
     and coalesce(current_setting('app.stage_note', true), '') <> 'stage_reverted'
     and not exists (
       select 1 from order_files f
       where f.order_id = new.id and f.kind = 'labels' and f.created_at >= new.packing_sent_at
     ) then
    raise exception 'waiting for the client''s labels before shipping';
  end if;
  return new;
end;
$$;

create trigger orders_require_labels_to_ship
  before update of stage on public.orders
  for each row execute function public.orders_require_labels_to_ship();

revoke execute on function public.orders_require_labels_to_ship() from public, anon, authenticated;
