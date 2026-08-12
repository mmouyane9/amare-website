-- ============================================================================
-- Footer Links — connect every link to its correct existing page
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Quick Links (روابط سريعة) — replace anchor/placeholder URLs with real pages
-- ----------------------------------------------------------------------------

-- الرئيسية / Accueil → index.html (was #home — anchor broke on nested pages)
UPDATE public.footer_items
SET url = 'index.html'
WHERE title_ar = 'الرئيسية' AND url = '#home';

-- من نحن / À propos de nous → Who are we/index.html (was #about)
UPDATE public.footer_items
SET url = 'Who%20are%20we/index.html'
WHERE title_ar = 'من نحن' AND url = '#about';

-- أنشطتنا / Nos activités → Our activities/index.html (was # placeholder)
UPDATE public.footer_items
SET url = 'Our%20activities/index.html'
WHERE title_ar = 'أنشطتنا' AND url = '#';

-- شركاؤنا / Nos partenaires → first partner page (was # placeholder)
UPDATE public.footer_items
SET url = 'Our%20partners/lefouilleurma.html'
WHERE title_ar = 'شركاؤنا' AND url = '#';

-- خدماتنا / Nos services → first service page (was #services anchor)
UPDATE public.footer_items
SET url = 'Our%20services/sos-amare.html'
WHERE title_ar = 'خدماتنا' AND url = '#services';

-- انخرط معنا / Rejoignez-nous → Join us/join-us-online.html (was Join%20us/index.html — 404)
UPDATE public.footer_items
SET url = 'Join%20us/join-us-online.html'
WHERE title_ar = 'انخرط معنا' AND url = 'Join%20us/index.html';
