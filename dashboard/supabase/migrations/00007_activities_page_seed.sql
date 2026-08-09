-- ============================================================================
-- أنشطتنا — Fix page_sections with real content from Our activities/index.html
--
-- NON-DESTRUCTIVE: UPDATE existing rows + INSERT missing row.
-- No DELETE, TRUNCATE, or DROP. Safe to run multiple times.
-- ============================================================================

DO $$
DECLARE
  v_page_id UUID;
BEGIN
  SELECT id INTO v_page_id FROM pages WHERE slug = '/activities' LIMIT 1;
  IF v_page_id IS NULL THEN
    RAISE EXCEPTION 'Page with slug /activities not found.';
  END IF;

  RAISE NOTICE 'Target page_id: %', v_page_id;

  -- Section 1 — Hero
  UPDATE page_sections
     SET section_type = 'hero',
         content      = '{
           "heading": "أنشطة الجمعية",
           "subheading": "أنشطتنا",
           "description": "نظمت الجمعية المغربية لهواة البحث والاستكشاف مجموعة متنوعة من الأنشطة والمبادرات التي تجمع بين الاستكشاف والتكوين والعمل البيئي والتواصل المجتمعي.",
           "backgroundImage": "",
           "buttons": []
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 1;

  -- Section 2 — Activities Grid (6 cards)
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "activitiesGrid",
           "heading": "أنشطتنا",
           "description": "",
           "cards": [
             {"title":"الخرجات","description":"خرجات ميدانية للاستكشاف والتعرف على المواقع والمجالات الطبيعية."},
             {"title":"مسابقات وراليات","description":"تنظيم مسابقات وراليات تجمع بين روح التحدي والاستكشاف."},
             {"title":"تكوينات","description":"تكوينات وورشات لتطوير مهارات الأعضاء والمهتمين بمجال الاستكشاف."},
             {"title":"معارض","description":"المشاركة وتنظيم معارض للتعريف بأنشطة الجمعية وإنجازاتها."},
             {"title":"لقاءات","description":"لقاءات وفعاليات تجمع الأعضاء والشركاء والمهتمين."},
             {"title":"حملات بيئية","description":"مبادرات وحملات تهدف إلى حماية البيئة والتحسيس بأهمية المحافظة عليها."}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 2;

  -- Section 3 — CTA (INSERT if missing)
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_page_id AND sort_order = 3) THEN
    INSERT INTO page_sections (id, page_id, section_type, section_key, visible, sort_order, content, settings, styles)
    VALUES (
      gen_random_uuid(),
      v_page_id,
      'custom',
      NULL,
      TRUE,
      3,
      '{
        "_renderer": "activitiesCta",
        "heading": "اكتشف أنشطتنا",
        "description": "تابع آخر أنشطة الجمعية ومبادراتها.",
        "buttons": [
          {"id":"btn-act-news","label":"آخر الأخبار","url":"../News/news.html","variant":"primary"},
          {"id":"btn-act-contact","label":"تواصل معنا","url":"../contact.html","variant":"secondary"}
        ]
      }'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    );
  END IF;

  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Updates complete. Verify manually:';
  RAISE NOTICE '  SELECT sort_order, section_type, content->>''heading'' AS heading';
  RAISE NOTICE '  FROM page_sections WHERE page_id = ''%'' ORDER BY sort_order;', v_page_id;
  RAISE NOTICE '=========================================';

END $$;
