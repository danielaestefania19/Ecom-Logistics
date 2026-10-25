-- Amazon orders mirror (no PII — no Restricted Data Token needed)
CREATE TABLE public.amazon_orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id    uuid        NOT NULL REFERENCES public.amazon_connections(id) ON DELETE CASCADE,
  client_id        uuid        NOT NULL REFERENCES public.clients(id)            ON DELETE CASCADE,
  amazon_order_id  text        NOT NULL,
  status           text        NOT NULL,
  purchase_date    timestamptz NOT NULL,
  last_updated     timestamptz NOT NULL,
  ship_city        text,
  ship_state       text,
  is_fba           boolean     NOT NULL DEFAULT false,
  order_total      numeric(10,2),
  currency         text,
  items_count      integer,
  raw_json         jsonb,
  synced_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, amazon_order_id)
);

ALTER TABLE public.amazon_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amazon_orders_read" ON public.amazon_orders
  FOR SELECT USING (client_id = auth.uid() OR public.is_staff());

-- FBA inventory summaries mirror
CREATE TABLE public.amazon_fba_inventory (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id       uuid    NOT NULL REFERENCES public.amazon_connections(id) ON DELETE CASCADE,
  client_id           uuid    NOT NULL REFERENCES public.clients(id)            ON DELETE CASCADE,
  sku                 text    NOT NULL,
  fnsku               text,
  asin                text,
  product_name        text,
  condition           text,
  total_quantity      integer NOT NULL DEFAULT 0,
  inbound_working     integer NOT NULL DEFAULT 0,
  inbound_shipped     integer NOT NULL DEFAULT 0,
  inbound_receiving   integer NOT NULL DEFAULT 0,
  reserved_quantity   integer NOT NULL DEFAULT 0,
  synced_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, sku)
);

ALTER TABLE public.amazon_fba_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amazon_fba_inventory_read" ON public.amazon_fba_inventory
  FOR SELECT USING (client_id = auth.uid() OR public.is_staff());
