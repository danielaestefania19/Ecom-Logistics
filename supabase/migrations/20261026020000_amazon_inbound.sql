-- Allow shipment_creator = 'ecom_api' for FBA inbound plans created via the API
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_shipment_creator_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_shipment_creator_check
  CHECK (shipment_creator IN ('customer', 'ecom_seller_central', 'ecom_scanpower', 'ecom_api'));

-- FBA inbound plan state machine
-- current_step values: create → await_create → packing_options → await_packing →
--   set_packing → placement_options → await_placement → confirm_placement →
--   transport_options → await_transport → confirm_transport → done
CREATE TABLE public.amazon_inbound_plans (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        NOT NULL REFERENCES public.clients(id)            ON DELETE CASCADE,
  connection_id   uuid        NOT NULL REFERENCES public.amazon_connections(id) ON DELETE CASCADE,
  order_id        uuid        REFERENCES public.orders(id)                      ON DELETE SET NULL,
  inbound_plan_id text,
  current_step    text        NOT NULL DEFAULT 'create',
  status          text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'error')),
  operation_id    text,
  payload         jsonb       NOT NULL DEFAULT '{}',
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.amazon_inbound_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "amazon_inbound_plans_staff" ON public.amazon_inbound_plans
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "amazon_inbound_plans_client_read" ON public.amazon_inbound_plans
  FOR SELECT USING (client_id = auth.uid());

CREATE TRIGGER amazon_inbound_plans_updated_at
  BEFORE UPDATE ON public.amazon_inbound_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
