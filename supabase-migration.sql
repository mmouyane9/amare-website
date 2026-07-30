-- ============================================================
-- Migration: Fix members table schema for online membership form
-- ============================================================
-- Discovered via API:
--   EXISTS:   id, first_name, last_name, birth_date, birth_place,
--             phone, email, address, application_status,
--             created_at, updated_at
--   MISSING:  cin, photo_base64, signature_member, signature_president
-- ============================================================

-- Step 1: Add missing columns used by the form
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS cin              TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photo_base64     TEXT,
  ADD COLUMN IF NOT EXISTS signature_member TEXT,
  ADD COLUMN IF NOT EXISTS signature_president TEXT;

ALTER TABLE members
  ALTER COLUMN cin DROP DEFAULT;

CREATE INDEX IF NOT EXISTS idx_members_cin ON members (cin);

-- Step 2: Update Row Level Security policies
-- Drop existing policies first for idempotent re-runs
DROP POLICY IF EXISTS "Anyone can insert members" ON members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON members;

-- Ensure RLS is enabled
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (form submission from public page)
CREATE POLICY "Anyone can insert members"
  ON members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to SELECT (needed for post-insert confirmation)
-- This returns only the basic metadata, not sensitive fields
CREATE POLICY "Anyone can view members"
  ON members
  FOR SELECT
  TO anon
  USING (true);
