-- Website leads also get a welcome email; their reply goes to sales@ for manual onboarding.

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('lead_new', 'lead_welcome', 'order_stage', 'fulfillment_status'));

create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform queue_notification('lead_new', new.id::text);
  if new.email is not null then
    perform queue_notification('lead_welcome', new.id::text);
  end if;
  return new;
end;
$$;
