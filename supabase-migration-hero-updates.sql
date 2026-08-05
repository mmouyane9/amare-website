-- ====================================================================
-- Migration: hero_updates table
-- Matches the AMARE Admin Dashboard Hero Updates management exactly.
--
-- Table:       hero_updates
-- Bucket:      hero-images  (create via Supabase Dashboard > Storage)
-- Auth:        Authenticated users (admin) for write; anon for read
-- ====================================================================

-- 1. Drop existing table (idempotent)
DROP TABLE IF EXISTS hero_updates CASCADE;

-- 2. Create table with every column used by the application
CREATE TABLE hero_updates (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  title         TEXT          NOT NULL DEFAULT '',
  banner_text   TEXT          NOT NULL DEFAULT '',
  description   TEXT          NOT NULL DEFAULT '',
  image_url     TEXT          NOT NULL DEFAULT '',

  button1_text  TEXT          NOT NULL DEFAULT '',
  button1_url   TEXT          NOT NULL DEFAULT '',
  button2_text  TEXT          NOT NULL DEFAULT '',
  button2_url   TEXT          NOT NULL DEFAULT '',
  button3_text  TEXT          NOT NULL DEFAULT '',
  button3_url   TEXT          NOT NULL DEFAULT '',

  status        TEXT          NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('live', 'draft')),

  display_order INTEGER       NOT NULL DEFAULT 0,
  created_by    UUID          REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 3. Indexes for query patterns
CREATE INDEX idx_hero_updates_status        ON hero_updates (status);
CREATE INDEX idx_hero_updates_display_order ON hero_updates (display_order);
CREATE INDEX idx_hero_updates_created_at    ON hero_updates (created_at);
CREATE INDEX idx_hero_updates_created_by    ON hero_updates (created_by);

-- 4. Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION fn_hero_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hero_updates_updated_at ON hero_updates;
CREATE TRIGGER trg_hero_updates_updated_at
  BEFORE UPDATE ON hero_updates
  FOR EACH ROW
  EXECUTE FUNCTION fn_hero_updates_updated_at();

-- 5. Auto-set created_by from authenticated user on insert
CREATE OR REPLACE FUNCTION fn_hero_updates_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_hero_updates_created_by ON hero_updates;
CREATE TRIGGER trg_hero_updates_created_by
  BEFORE INSERT ON hero_updates
  FOR EACH ROW
  EXECUTE FUNCTION fn_hero_updates_created_by();

-- 6. Row Level Security
ALTER TABLE hero_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read hero_updates" ON hero_updates;
CREATE POLICY "Anyone can read hero_updates"
  ON hero_updates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert hero_updates" ON hero_updates;
CREATE POLICY "Authenticated users can insert hero_updates"
  ON hero_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update hero_updates" ON hero_updates;
CREATE POLICY "Authenticated users can update hero_updates"
  ON hero_updates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete hero_updates" ON hero_updates;
CREATE POLICY "Authenticated users can delete hero_updates"
  ON hero_updates
  FOR DELETE
  TO authenticated
  USING (true);
