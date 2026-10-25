-- Temporary: the deployed frontend still calls create_prep_order until the phase 2 build ships.
create or replace function public.create_prep_order(p_order jsonb, p_items jsonb, p_tracking text[] default '{}')
returns uuid
language sql
security invoker
set search_path = public
as $$
  select public.create_order(p_order - 'type' || '{"type":"prep"}'::jsonb, p_items, p_tracking);
$$;
revoke execute on function public.create_prep_order(jsonb, jsonb, text[]) from public, anon;
grant execute on function public.create_prep_order(jsonb, jsonb, text[]) to authenticated;
