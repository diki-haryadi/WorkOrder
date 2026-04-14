/*
  # Allow authenticated CRUD on master_products_services

  ## Changes
  - Remove admin-only and legacy read policies on master_products_services.
  - Allow all authenticated users (admin & mekanik) to SELECT/INSERT/UPDATE/DELETE.
*/

DROP POLICY IF EXISTS "Anon can select master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can insert master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can update master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can delete master_products_services" ON master_products_services;

DROP POLICY IF EXISTS "Admin can select master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Admin can insert master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Admin can update master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Admin can delete master_products_services" ON master_products_services;

DROP POLICY IF EXISTS "Authenticated can select master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Authenticated can insert master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Authenticated can update master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Authenticated can delete master_products_services" ON master_products_services;

CREATE POLICY "Authenticated can select master_products_services"
  ON master_products_services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert master_products_services"
  ON master_products_services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update master_products_services"
  ON master_products_services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete master_products_services"
  ON master_products_services
  FOR DELETE
  TO authenticated
  USING (true);
