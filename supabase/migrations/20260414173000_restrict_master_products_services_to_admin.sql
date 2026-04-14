/*
  # Restrict master_products_services access to admin

  ## Changes
  - Remove legacy anon CRUD policies on master_products_services
  - Allow authenticated admin to read/write master_products_services
*/

DROP POLICY IF EXISTS "Anon can select master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can insert master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can update master_products_services" ON master_products_services;
DROP POLICY IF EXISTS "Anon can delete master_products_services" ON master_products_services;

CREATE POLICY "Admin can select master_products_services"
  ON master_products_services
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admin can insert master_products_services"
  ON master_products_services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can update master_products_services"
  ON master_products_services
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can delete master_products_services"
  ON master_products_services
  FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');
