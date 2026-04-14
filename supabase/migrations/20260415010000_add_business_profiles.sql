/*
  # Add business profiles per authenticated user

  ## Changes
  - Create `business_profiles` table to store business identity for document headers.
  - Add RLS policies so each authenticated user can manage only their own business profile.
  - Update the auth user trigger function to auto-create a default business profile.
  - Backfill missing business profiles for existing users.
*/

CREATE TABLE IF NOT EXISTS public.business_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT 'WorkOrder Pro',
  email text NOT NULL DEFAULT 'support@workorder.app',
  phone text NOT NULL DEFAULT '+62 812-3456-7890',
  address text NOT NULL DEFAULT 'Jakarta, Indonesia',
  website text NOT NULL DEFAULT '',
  npwp text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own business profile" ON public.business_profiles;
CREATE POLICY "Users can read own business profile"
  ON public.business_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own business profile" ON public.business_profiles;
CREATE POLICY "Users can update own business profile"
  ON public.business_profiles
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

  INSERT INTO public.business_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.business_profiles (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.business_profiles bp ON bp.user_id = u.id
WHERE bp.user_id IS NULL;
