/*
  # Add auth roles and admin-only quotation/invoice mutations

  ## Changes
  - Create user_profiles table with `admin` and `mekanik` roles
  - Auto-create profile row for new auth users (default role: mekanik)
  - Restrict quotation and invoice create/update/delete to admin role
  - Require authenticated users for reading quotation/invoice data
*/

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'mekanik' CHECK (role IN ('admin', 'mekanik')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'mekanik')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()),
    'mekanik'
  );
$$;

DROP POLICY IF EXISTS "Anon can select quotations" ON quotations;
DROP POLICY IF EXISTS "Anon can insert quotations" ON quotations;
DROP POLICY IF EXISTS "Anon can update quotations" ON quotations;
DROP POLICY IF EXISTS "Anon can delete quotations" ON quotations;

DROP POLICY IF EXISTS "Anon can select invoices" ON invoices;
DROP POLICY IF EXISTS "Anon can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Anon can update invoices" ON invoices;
DROP POLICY IF EXISTS "Anon can delete invoices" ON invoices;

CREATE POLICY "Authenticated can select quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert quotations"
  ON quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can update quotations"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can delete quotations"
  ON quotations
  FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Authenticated can select invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Admin can delete invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');
