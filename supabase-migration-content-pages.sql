-- Migration: content_pages table
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.content_pages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key        text NOT NULL UNIQUE,
  title           text NOT NULL DEFAULT '',
  slug            text NOT NULL DEFAULT '',
  content         jsonb NOT NULL DEFAULT '{"sections":[]}'::jsonb,
  seo_title       text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords    text DEFAULT '',
  og_image        text DEFAULT '',
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  is_homepage     boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  template        text DEFAULT 'default',
  is_system       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_page_key ON public.content_pages(page_key);
CREATE INDEX IF NOT EXISTS idx_content_pages_status   ON public.content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_homepage  ON public.content_pages(is_homepage) WHERE is_homepage = true;

-- Enable RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read published pages
CREATE POLICY "Public read published pages" ON public.content_pages
  FOR SELECT
  USING (status = 'published');

-- Policy: authenticated users can read all pages
CREATE POLICY "Authenticated read all pages" ON public.content_pages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: authenticated users can update
CREATE POLICY "Authenticated update pages" ON public.content_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: authenticated users can insert
CREATE POLICY "Authenticated insert pages" ON public.content_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_content_pages_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_pages_updated_at
  BEFORE UPDATE ON public.content_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_pages_updated_at();
