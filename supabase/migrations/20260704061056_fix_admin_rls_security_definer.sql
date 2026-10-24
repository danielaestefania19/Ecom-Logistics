DROP POLICY IF EXISTS "Admins can read all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON clients;

-- SECURITY DEFINER avoids the recursive RLS lookup on clients.
CREATE OR REPLACE FUNCTION public.is_portal_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM clients WHERE id = auth.uid()),
    false
  );
$$;

CREATE POLICY "Admins can read all clients"
  ON clients FOR SELECT
  USING (public.is_portal_admin());

CREATE POLICY "Admins can update all clients"
  ON clients FOR UPDATE
  USING (public.is_portal_admin());
