-- ============================================================================
-- VERIFICATION: Homepage Bilingual Migration (00033) — Run AFTER the migration
-- ============================================================================

-- Confirm page exists with expected status
SELECT id, slug, title, status, template, is_homepage
FROM pages
WHERE slug = '/';

-- Verify all 8 sections with bilingual content
SELECT
    ps.sort_order,
    ps.section_type,
    ps.content->>'_renderer' AS renderer,
    CASE
        WHEN jsonb_typeof(ps.content->'buttons') = 'array'
        THEN jsonb_array_length(ps.content->'buttons')
        ELSE NULL
    END AS button_count,
    CASE
        WHEN jsonb_typeof(ps.content->'cards') = 'array'
        THEN jsonb_array_length(ps.content->'cards')
        ELSE NULL
    END AS card_count,
    ps.content ? 'heading_ar' AS has_heading_ar,
    ps.content ? 'heading_fr' AS has_heading_fr
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/'
ORDER BY ps.sort_order;

-- Quick count — should return 8
SELECT COUNT(*) AS section_count
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/';
