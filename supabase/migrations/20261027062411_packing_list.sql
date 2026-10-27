-- Packing list: after prep, staff record each box or pallet (dimensions, weight, contents) and send
-- it to the client, who builds the Amazon shipment and uploads the 4x6 FBA + carrier labels.

create table public.packing_boxes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null default 'box' check (kind in ('box', 'pallet')),
  qty integer not null default 1 check (qty > 0),
  length_in numeric(6, 1) not null check (length_in > 0),
  width_in numeric(6, 1) not null check (width_in > 0),
  height_in numeric(6, 1) not null check (height_in > 0),
  weight_lb numeric(7, 1) not null check (weight_lb > 0),
  position smallint not null default 0,
  created_at timestamptz not null default now()
);
create index packing_boxes_order_idx on public.packing_boxes (order_id, position);

-- Units of each SKU inside ONE box of the group (the group repeats qty times).
create table public.packing_box_contents (
  id bigint generated always as identity primary key,
  box_id uuid not null references public.packing_boxes (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  units integer not null check (units > 0),
  unique (box_id, order_item_id)
);

alter table public.packing_boxes enable row level security;
alter table public.packing_box_contents enable row level security;
create policy "Read accessible" on public.packing_boxes for select to authenticated
  using (public.can_access_order(order_id));
create policy "Read accessible" on public.packing_box_contents for select to authenticated
  using (exists (select 1 from packing_boxes b where b.id = box_id and public.can_access_order(b.order_id)));

alter table public.orders add column packing_sent_at timestamptz;

-- Staff: replace the order's packing list. p_boxes = [{kind, qty, length_in, width_in, height_in,
-- weight_lb, contents: [{order_item_id, units}]}].
create or replace function public.save_packing_list(p_order uuid, p_boxes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_box jsonb;
  v_content jsonb;
  v_id uuid;
  v_pos smallint := 0;
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if not exists (select 1 from orders where id = p_order) then raise exception 'order not found'; end if;

  delete from packing_boxes where order_id = p_order;
  for v_box in select * from jsonb_array_elements(coalesce(p_boxes, '[]'::jsonb)) loop
    insert into packing_boxes (order_id, kind, qty, length_in, width_in, height_in, weight_lb, position)
    values (
      p_order,
      coalesce(v_box->>'kind', 'box'),
      coalesce((v_box->>'qty')::int, 1),
      (v_box->>'length_in')::numeric,
      (v_box->>'width_in')::numeric,
      (v_box->>'height_in')::numeric,
      (v_box->>'weight_lb')::numeric,
      v_pos
    )
    returning id into v_id;
    for v_content in select * from jsonb_array_elements(coalesce(v_box->'contents', '[]'::jsonb)) loop
      if coalesce((v_content->>'units')::int, 0) > 0 then
        insert into packing_box_contents (box_id, order_item_id, units)
        select v_id, i.id, (v_content->>'units')::int
        from order_items i where i.id = (v_content->>'order_item_id')::uuid and i.order_id = p_order;
      end if;
    end loop;
    v_pos := v_pos + 1;
  end loop;
end;
$$;

-- Staff: email the packing list to the client (can be re-sent after changes).
create or replace function public.send_packing_list(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  if not public.is_staff() then raise exception 'staff only'; end if;
  if not exists (select 1 from packing_boxes where order_id = p_order) then
    raise exception 'add at least one box or pallet first';
  end if;
  update orders set packing_sent_at = v_now where id = p_order;
  -- One email per send: the timestamp keeps each send's notification key unique.
  perform queue_notification('packing_list', p_order::text || '@' || extract(epoch from v_now)::bigint::text);
end;
$$;

revoke execute on function public.save_packing_list(uuid, jsonb) from public, anon;
revoke execute on function public.send_packing_list(uuid) from public, anon;
grant execute on function public.save_packing_list(uuid, jsonb) to authenticated;
grant execute on function public.send_packing_list(uuid) to authenticated;

-- Sales hears when the client uploads labels after receiving the packing list.
create or replace function public.notify_labels_uploaded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.kind = 'labels' and not public.is_staff()
     and exists (select 1 from orders where id = new.order_id and packing_sent_at is not null) then
    perform queue_notification('labels_uploaded', new.id::text);
  end if;
  return new;
end;
$$;

create trigger order_files_labels_notify
  after insert on public.order_files
  for each row execute function public.notify_labels_uploaded();

revoke execute on function public.notify_labels_uploaded() from public, anon, authenticated;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('lead_new', 'lead_welcome', 'order_stage', 'fulfillment_status', 'release_requested',
                  'release_shipped', 'client_cancelled', 'packing_list', 'labels_uploaded'));
