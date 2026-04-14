/*
  # Add payment info fields and restrict business profile edits to admin

  ## Changes
  - Add bank payment fields to business_profiles.
  - Restrict INSERT/UPDATE business_profiles to admin users only.
  - Keep SELECT accessible to each authenticated user for own profile.
*/

ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_number text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_holder text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update own business profile" ON public.business_profiles;

CREATE POLICY "Admin can insert own business profile"
  ON public.business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.current_user_role() = 'admin');

CREATE POLICY "Admin can update own business profile"
  ON public.business_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.current_user_role() = 'admin')
  WITH CHECK (auth.uid() = user_id AND public.current_user_role() = 'admin');
