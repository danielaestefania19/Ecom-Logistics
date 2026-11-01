-- Units on an order change only through update_order_items / decide_order_change /
-- accept_received_counts (admins). Staff can still fix SKU, name, FNSKU, prep type and counts
-- directly, but not the expected units.
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
  return new;
end;
$$;

create trigger order_items_guard_units
  before update of expected_qty on public.order_items
  for each row execute function public.order_items_guard_units();

-- Custom quote lines may be negative (a discount); priced lines can't.
alter table public.order_quote_lines drop constraint order_quote_lines_unit_amount_check;
alter table public.order_quote_lines add constraint order_quote_lines_unit_amount_check
  check (unit_amount >= 0 or key is null);
