-- ============================================================================
-- Migration: Add social media columns to website_settings
-- Phase 3 - Social Media
-- ============================================================================

ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS facebook      text,
  ADD COLUMN IF NOT EXISTS instagram     text,
  ADD COLUMN IF NOT EXISTS linkedin      text,
  ADD COLUMN IF NOT EXISTS youtube       text,
  ADD COLUMN IF NOT EXISTS tiktok        text,
  ADD COLUMN IF NOT EXISTS twitter       text,
  ADD COLUMN IF NOT EXISTS whatsapp_url  text,
  ADD COLUMN IF NOT EXISTS telegram      text;
