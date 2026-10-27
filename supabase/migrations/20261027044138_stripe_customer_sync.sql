-- Profile changes (company name, phone, business address) are copied to the client's Stripe customer,
-- so invoices always carry the current details. Uses the same pg_net + shared-secret path as emails.

create or replace function public.queue_hook(p_function text, p_body jsonb)
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
    url := 'https://sootmcdjtrjrkmrasjhe.supabase.co/functions/v1/' || p_function,
    body := p_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', v_secret)
  );
end;
$$;

create or replace function public.clients_sync_stripe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform queue_hook('stripe-customer-sync', jsonb_build_object('client_id', new.id));
  return new;
end;
$$;

create trigger clients_sync_stripe
  after update on public.clients
  for each row
  when (
    coalesce(new.stripe_customer_id, '') <> ''
    and (
      new.stripe_customer_id is distinct from old.stripe_customer_id
      or (new.legal_name, new.company, new.full_name, new.phone, new.language, new.address_line1, new.address_line2,
          new.address_city, new.address_state, new.address_zip, new.address_country)
         is distinct from
         (old.legal_name, old.company, old.full_name, old.phone, old.language, old.address_line1, old.address_line2,
          old.address_city, old.address_state, old.address_zip, old.address_country)
    )
  )
  execute function public.clients_sync_stripe();

revoke execute on function public.queue_hook(text, jsonb) from public, anon, authenticated;
revoke execute on function public.clients_sync_stripe() from public, anon, authenticated;
