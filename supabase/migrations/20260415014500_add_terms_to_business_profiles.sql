/*
  # Add editable document terms to business_profiles

  ## Changes
  - Add `terms` column so each business can customize quotation/invoice terms.
  - Backfill empty terms with default value.
*/

ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS terms text NOT NULL DEFAULT 'Semua pekerjaan dijamin hingga 30 hari. Hubungi kami jika ada pertanyaan terkait layanan ini.';

UPDATE public.business_profiles
SET terms = 'Semua pekerjaan dijamin hingga 30 hari. Hubungi kami jika ada pertanyaan terkait layanan ini.'
WHERE COALESCE(TRIM(terms), '') = '';
