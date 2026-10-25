-- Phase 4: Add label and shipment tracking columns to amazon_inbound_plans

ALTER TABLE public.amazon_inbound_plans
  ADD COLUMN IF NOT EXISTS labels_fetched_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipments_json    jsonb;

COMMENT ON COLUMN public.amazon_inbound_plans.labels_fetched_at IS 'Set when labels were successfully downloaded from SP-API and stored in order_files';
COMMENT ON COLUMN public.amazon_inbound_plans.shipments_json    IS 'Snapshot of GET /inboundPlans/{id}/shipments — avoids re-calling SP-API for shipment IDs';
