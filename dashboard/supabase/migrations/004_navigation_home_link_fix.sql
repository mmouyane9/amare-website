-- ============================================================================
-- Navigation — Home link must be an absolute root-relative URL to the homepage
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- الرئيسية / Home → /index.html
-- A relative "index.html" or a bare "#home" anchor resolves against the
-- current page, so on a subpage such as /Who%20are%20we/index.html it would
-- point to /Who%20are%20we/index.html (or append #home to the URL) instead
-- of the homepage. Store the absolute root-relative URL '/index.html'.
-- ----------------------------------------------------------------------------
UPDATE public.navigation_items
SET url = '/index.html'
WHERE (title_ar = 'الرئيسية' OR title_en = 'Home')
  AND (
    url IS NULL
    OR url = ''
    OR url = '/'
    OR url = 'index.html'
    OR url = '#home'
    OR url = 'index.html#home'
    OR url = '/index.html#home'
    OR url LIKE '%#home%'
  );
