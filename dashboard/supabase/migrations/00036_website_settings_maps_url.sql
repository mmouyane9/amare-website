-- ============================================================================
-- Website Settings — Update Google Maps URL
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

-- The footer "Open in Google Maps" button must use this exact share URL.
UPDATE public.website_settings
SET google_maps_url = 'https://maps.app.goo.gl/VCXL3tC7vZWpzS5UA'
WHERE id = '00000000-0000-0000-0000-000000000001';
