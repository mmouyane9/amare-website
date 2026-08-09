-- Add image fields to existing LeFouilleurma about + gallery sections
DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/partners/lefouilleurma' LIMIT 1;

  -- Update about section (sort_order=2) — add "image" field
  UPDATE page_sections
     SET content = content || '{"image":""}'::jsonb
   WHERE page_id = v_pid
     AND sort_order = 2
     AND (content ->> 'image') IS NULL;

  -- Update gallery section (sort_order=5) — add "images" array if missing
  UPDATE page_sections
     SET content = content || '{"images":[{"id":"gimg-0","url":"","alt":""},{"id":"gimg-1","url":"","alt":""},{"id":"gimg-2","url":"","alt":""},{"id":"gimg-3","url":"","alt":""},{"id":"gimg-4","url":"","alt":""},{"id":"gimg-5","url":"","alt":""}]}'::jsonb
   WHERE page_id = v_pid
     AND sort_order = 5
     AND (content ->> 'images') IS NULL;

  RAISE NOTICE 'Image fields added to LeFouilleurma sections';
END $$;
