-- Staff undoing a mistaken stage move ("stage_reverted") must not email the client again.
drop trigger order_events_notify on public.order_events;

create trigger order_events_notify
  after insert on public.order_events
  for each row
  when (new.visible_to_client and coalesce(new.note, '') <> 'stage_reverted' and (
    new.note = 'order_submitted'
    or new.to_stage in ('received', 'discrepancy', 'prepped', 'in_storage', 'shipped', 'cancelled')
  ))
  execute function public.notify_order_event();
