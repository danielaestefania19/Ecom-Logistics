-- One carrier package can belong to several orders (a client ships two orders in one box), so
-- several inbound shipments may point at the same EasyPost tracker; the webhook updates them all.
alter table public.shipments_inbound drop constraint shipments_inbound_provider_tracker_id_key;
create index shipments_inbound_provider_tracker_idx on public.shipments_inbound (provider_tracker_id);
