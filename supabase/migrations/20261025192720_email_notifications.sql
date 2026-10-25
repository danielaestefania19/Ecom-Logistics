-- Email notifications: database events call the `notify` edge function through pg_net, so mail
-- goes out no matter who made the change (staff UI, carrier webhook, website form). pg_net only
-- sends after the transaction commits, so rolled-back changes never email anyone.

create extension if not exists pg_net with schema extensions;

alter table public.clients add column notify_orders boolean not null default true;

-- One row per message; the unique key makes retries and duplicate calls send at most once.
create table public.notifications (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('lead_new', 'order_stage', 'fulfillment_status')),
  ref_id text not null,
  to_email text,
  subject text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'failed')),
  error text,
  provider_id text,
  created_at timestamptz not null default now(),
  unique (kind, ref_id)
);

alter table public.notifications enable row level security;
create policy "Staff read" on public.notifications for select to authenticated using (public.is_staff());

-- Shared secret so only this database can trigger sends. Generated here, never stored in git;
-- portal_config is service-role only.
insert into public.portal_config (key, value)
values ('notify_hook_secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

create or replace function public.queue_notification(p_kind text, p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select value into v_secret from portal_config where key = 'notify_hook_secret';
  if v_secret is null then return; end if;
  perform net.http_post(
    url := 'https://sootmcdjtrjrkmrasjhe.supabase.co/functions/v1/notify',
    body := jsonb_build_object('kind', p_kind, 'id', p_id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', v_secret)
  );
end;
$$;

create or replace function public.notify_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform queue_notification('order_stage', new.id::text);
  return new;
end;
$$;

-- Only the moments a client cares about; scheduling and invoicing stay quiet (Stripe emails invoices).
create trigger order_events_notify
  after insert on public.order_events
  for each row
  when (new.visible_to_client and (
    new.note = 'order_submitted'
    or new.to_stage in ('received', 'discrepancy', 'prepped', 'in_storage', 'shipped', 'cancelled')
  ))
  execute function public.notify_order_event();

create or replace function public.notify_fulfillment_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform queue_notification('fulfillment_status', new.id::text);
  return new;
end;
$$;

create trigger fulfillment_events_notify
  after insert on public.fulfillment_events
  for each row when (new.to_status in ('shipped', 'on_hold'))
  execute function public.notify_fulfillment_event();

create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform queue_notification('lead_new', new.id::text);
  return new;
end;
$$;

create trigger leads_notify
  after insert on public.leads
  for each row when (new.source = 'website')
  execute function public.notify_new_lead();

revoke execute on function public.queue_notification(text, text) from public, anon, authenticated;
revoke execute on function public.notify_order_event() from public, anon, authenticated;
revoke execute on function public.notify_fulfillment_event() from public, anon, authenticated;
revoke execute on function public.notify_new_lead() from public, anon, authenticated;
