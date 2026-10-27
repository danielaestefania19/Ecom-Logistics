-- Every cancellation records why: staff must give a reason, and clients can cancel their own
-- order (with a reason) until the merchandise arrives. Sales hears about client cancellations.

-- The reason travels in app.stage_note (set by set_order_stage / cancel_my_order) and ends up
-- as the note of the logged stage event.
create or replace function public.orders_require_cancel_reason()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.stage = 'cancelled' and old.stage is distinct from 'cancelled'
     and nullif(trim(current_setting('app.stage_note', true)), '') is null then
    raise exception 'a cancellation reason is required';
  end if;
  return new;
end;
$$;

create trigger orders_require_cancel_reason
  before update of stage on public.orders
  for each row execute function public.orders_require_cancel_reason();

create or replace function public.cancel_my_order(p_order uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
begin
  select * into v_order from orders where id = p_order and client_id = auth.uid() for update;
  if not found then raise exception 'order not found'; end if;
  if v_order.stage not in ('quote', 'awaiting_inventory') then
    raise exception 'this order can no longer be cancelled from the portal; contact us';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'a cancellation reason is required'; end if;

  perform set_config('app.stage_note', trim(p_reason), true);
  update orders set stage = 'cancelled' where id = p_order;
  perform queue_notification('client_cancelled', p_order::text);
end;
$$;

revoke execute on function public.cancel_my_order(uuid, text) from public, anon;
grant execute on function public.cancel_my_order(uuid, text) to authenticated;
revoke execute on function public.orders_require_cancel_reason() from public, anon, authenticated;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('lead_new', 'lead_welcome', 'order_stage', 'fulfillment_status', 'release_requested', 'release_shipped', 'client_cancelled'));
