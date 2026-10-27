-- Admins can remove spam/bot/test leads. Converted leads stay as the record of how a client arrived.
create policy "Admin delete" on public.leads for delete to authenticated
  using (public.is_portal_admin() and converted_client_id is null);
