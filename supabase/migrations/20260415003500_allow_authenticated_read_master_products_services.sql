/*
  # Allow authenticated users to read master_products_services

  ## Why
  - Work Order form needs to load master products/services for all logged-in users.
  - Keep write operations restricted to admin only.
*/

DROP POLICY IF EXISTS "Admin can select master_products_services" ON master_products_services;

CREATE POLICY "Authenticated can select master_products_services"
  ON master_products_services
  FOR SELECT
  TO authenticated
  USING (true);
