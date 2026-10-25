-- Barcode scanning: UPCs learned per client SKU, FNSKU verification counts during prep,
-- and an atomic increment so fast consecutive scans never overwrite each other.

alter table public.order_items
  add column prepped_qty integer not null default 0 check (prepped_qty >= 0);

-- A code the warehouse taught the system once ("this UPC is SKU X for this client").
create table public.sku_barcodes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  code text not null check (code = upper(trim(code)) and length(code) > 0),
  sku text not null,
  kind text not null default 'upc' check (kind in ('upc', 'fnsku', 'other')),
  created_by uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  unique (client_id, code)
);

alter table public.sku_barcodes enable row level security;
create policy "Staff read" on public.sku_barcodes for select to authenticated using (public.is_staff());
create policy "Staff insert" on public.sku_barcodes for insert to authenticated with check (public.is_staff());
create policy "Staff update" on public.sku_barcodes for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff delete" on public.sku_barcodes for delete to authenticated using (public.is_staff());

create or replace function public.scan_increment(p_item uuid, p_field text, p_delta integer)
returns table (received_qty integer, prepped_qty integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if p_field not in ('received', 'prepped') then raise exception 'invalid field'; end if;

  if p_field = 'received' then
    update order_items i set received_qty = greatest(coalesce(i.received_qty, 0) + p_delta, 0) where i.id = p_item;
  else
    update order_items i set prepped_qty = greatest(i.prepped_qty + p_delta, 0) where i.id = p_item;
  end if;
  if not found then raise exception 'item not found'; end if;

  return query select i.received_qty, i.prepped_qty from order_items i where i.id = p_item;
end;
$$;

revoke execute on function public.scan_increment(uuid, text, integer) from public, anon;
grant execute on function public.scan_increment(uuid, text, integer) to authenticated;
