-- anon never needs this; authenticated does because RLS policies call it.
revoke execute on function public.is_portal_admin() from public, anon;
grant execute on function public.is_portal_admin() to authenticated;
