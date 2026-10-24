ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Admins can read all clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients AS me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  );

CREATE POLICY "Admins can update all clients"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients AS me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  );
