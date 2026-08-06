-- ============================================================================
-- website_settings table — Single source of truth for General Settings
-- Replaces the old "settings" table and provides Realtime support.
-- ============================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.website_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_name text,
  short_name       text,
  contact_email    text,
  phone            text,
  whatsapp         text,
  address          text,
  google_maps_url  text,
  working_hours    text,
  logo_url         text,
  footer_logo_url  text,
  favicon_url      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Realtime (needed for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.website_settings;

-- 3. Row-Level Security — only super_admin can insert/update/delete
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (the public website needs this)
CREATE POLICY "Allow read for everyone"
  ON public.website_settings
  FOR SELECT
  USING (true);

-- Only authenticated users with super_admin role can modify
CREATE POLICY "Allow write for super_admin"
  ON public.website_settings
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- 4. Auto-update the updated_at column
CREATE OR REPLACE FUNCTION public.update_website_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_website_settings_updated_at
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_website_settings_updated_at();

-- 5. Seed the first row with default values
INSERT INTO public.website_settings (id, association_name, short_name, contact_email, phone, whatsapp, address, google_maps_url, working_hours, logo_url, footer_logo_url, favicon_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'الجمعية المغربية لهواة البحث والاستكشاف',
  'AMARE',
  'association.amare.agadir@gmail.com',
  '+212 684869996',
  '+212684869996',
  'ص.ب 749 أيت ملول 86150',
  'https://www.google.com/maps?q=30.385528,-9.448611',
  'الإثنين - الجمعة | 09:00 - 18:00',
  'Amare%20files%20/logo.png',
  'Amare%20files%20/logo.png',
  'Amare%20files%20/logo.png'
) ON CONFLICT (id) DO NOTHING;
