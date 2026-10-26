-- Stripe invoice events update the linked orders (called by the stripe-webhook function).

alter table public.orders add column invoice_paid_at timestamptz;

-- Finalized invoice on a shipped order → invoiced; paid invoice on a shipped or invoiced order → paid.
-- Orders in other stages (e.g. still in storage) keep their stage and get an internal note instead.
create or replace function public.apply_stripe_invoice(p_invoice text, p_event text, p_number text, p_url text)
returns setof uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v orders;
begin
  for v in select * from orders where stripe_invoice_id = p_invoice for update loop
    update orders
    set invoice_number = coalesce(invoice_number, p_number),
        quote_url = coalesce(quote_url, p_url),
        invoice_paid_at = case when p_event = 'invoice.paid' then coalesce(invoice_paid_at, now()) else invoice_paid_at end
    where id = v.id;

    if p_event = 'invoice.finalized' and v.stage = 'shipped' then
      perform set_config('app.stage_note', 'stripe_invoiced', true);
      update orders set stage = 'invoiced' where id = v.id;
    elsif p_event = 'invoice.paid' and v.invoice_paid_at is null then
      if v.stage in ('shipped', 'invoiced') then
        perform set_config('app.stage_note', 'stripe_paid', true);
        update orders set stage = 'paid' where id = v.id;
      else
        insert into order_events (order_id, note, visible_to_client) values (v.id, 'stripe_paid', false);
      end if;
    end if;

    return next v.id;
  end loop;
end;
$$;

revoke execute on function public.apply_stripe_invoice(text, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_stripe_invoice(text, text, text, text) to service_role;
