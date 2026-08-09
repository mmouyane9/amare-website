-- ============================================================================
-- وثائق الانخراط (انخرط معنا) — Full CMS seed
-- Page slug '/documents' — the public page at /Join us/documents.html
-- resolves this slug via supabase/documents-content.js (dedicated loader).
-- NON-DESTRUCTIVE: UPDATE existing + INSERT missing. Safe to re-run.
-- Content extracted verbatim from /Join us/documents.html (real content).
-- The page has NO content images (only the shared navbar/footer logo) so the
-- hero background image field is seeded EMPTY (''). Every document download
-- link is a '#' placeholder in the source — preserved as-is, no invented URLs.
-- ONLY touches this page.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/documents' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('وثائق الانخراط', '/documents', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- 1. HERO  (#hero)
  UPDATE page_sections SET section_type = 'hero',
    content = '{"heading":"وثائق الانخراط","headingEm":"الانخراط","subheading":"وثائق الانخراط","description":"يمكنك من خلال هذه الصفحة تحميل جميع الوثائق الضرورية الخاصة بالانخراط في الجمعية المغربية لهواة البحث والاستكشاف.","backgroundImage":"","buttons":[{"id":"btn-doc-hero-download","label":"تحميل الوثائق","url":"#doc-grid","variant":"primary"},{"id":"btn-doc-hero-req","label":"متطلبات العضوية","url":"#doc-requirements","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"وثائق الانخراط","headingEm":"الانخراط","subheading":"وثائق الانخراط","description":"يمكنك من خلال هذه الصفحة تحميل جميع الوثائق الضرورية الخاصة بالانخراط في الجمعية المغربية لهواة البحث والاستكشاف.","backgroundImage":"","buttons":[{"id":"btn-doc-hero-download","label":"تحميل الوثائق","url":"#doc-grid","variant":"primary"},{"id":"btn-doc-hero-req","label":"متطلبات العضوية","url":"#doc-requirements","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 2. DOCUMENTS GRID  (#doc-grid)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"docGrid","eyebrow":"الوثائق المطلوبة","heading":"جميع وثائق الانخراط","description":"قم بتحميل الوثائق اللازمة لعملية الانخراط في الجمعية","documents":[{"title":"استمارة الانخراط","description":"استمارة رسمية لطلب الانضمام إلى الجمعية، تتضمن المعلومات الشخصية والبيانات الأساسية.","format":"PDF","size":"1.2 MB","date":"15 يونيو 2026","buttonLabel":"تحميل الاستمارة","url":"#"},{"title":"القانون الداخلي","description":"جميع حقوق وواجبات أعضاء الجمعية، والضوابط التنظيمية التي تحكم سير العمل بالجمعية.","format":"PDF","size":"980 KB","date":"15 يونيو 2026","buttonLabel":"تحميل القانون","url":"#"},{"title":"ميثاق العضوية","description":"القيم والمبادئ التي يلتزم بها جميع الأعضاء، ويشمل حقوق ومسؤوليات كل عضو في الجمعية.","format":"DOCX","size":"750 KB","date":"15 يونيو 2026","buttonLabel":"تحميل الميثاق","url":"#"},{"title":"التزام العضو","description":"وثيقة الالتزام بشروط وقوانين الجمعية التي يجب على كل عضو التوقيع عليها والإلتزام ببنودها.","format":"PDF","size":"620 KB","date":"15 يونيو 2026","buttonLabel":"تحميل الوثيقة","url":"#"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"docGrid","eyebrow":"الوثائق المطلوبة","heading":"جميع وثائق الانخراط","description":"قم بتحميل الوثائق اللازمة لعملية الانخراط في الجمعية","documents":[{"title":"استمارة الانخراط","description":"استمارة رسمية لطلب الانضمام إلى الجمعية، تتضمن المعلومات الشخصية والبيانات الأساسية.","format":"PDF","size":"1.2 MB","date":"15 يونيو 2026","buttonLabel":"تحميل الاستمارة","url":"#"},{"title":"القانون الداخلي","description":"جميع حقوق وواجبات أعضاء الجمعية، والضوابط التنظيمية التي تحكم سير العمل بالجمعية.","format":"PDF","size":"980 KB","date":"15 يونيو 2026","buttonLabel":"تحميل القانون","url":"#"},{"title":"ميثاق العضوية","description":"القيم والمبادئ التي يلتزم بها جميع الأعضاء، ويشمل حقوق ومسؤوليات كل عضو في الجمعية.","format":"DOCX","size":"750 KB","date":"15 يونيو 2026","buttonLabel":"تحميل الميثاق","url":"#"},{"title":"التزام العضو","description":"وثيقة الالتزام بشروط وقوانين الجمعية التي يجب على كل عضو التوقيع عليها والإلتزام ببنودها.","format":"PDF","size":"620 KB","date":"15 يونيو 2026","buttonLabel":"تحميل الوثيقة","url":"#"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 3. DOWNLOAD ALL  (#doc-download)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"docDownload","heading":"تحميل جميع الوثائق","description":"يمكنك تحميل جميع وثائق الانخراط في ملف واحد مضغوط لتسهيل عملية التسجيل والاطلاع على كل الوثائق دفعة واحدة.","buttonLabel":"تحميل جميع الوثائق","url":"#"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"docDownload","heading":"تحميل جميع الوثائق","description":"يمكنك تحميل جميع وثائق الانخراط في ملف واحد مضغوط لتسهيل عملية التسجيل والاطلاع على كل الوثائق دفعة واحدة.","buttonLabel":"تحميل جميع الوثائق","url":"#"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 4. MEMBERSHIP REQUIREMENTS  (#doc-requirements)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"docRequirements","eyebrow":"متطلبات العضوية","heading":"شروط الانخراط في الجمعية","description":"للتأكد من استكمال جميع المتطلبات، يرجى مراجعة القائمة التالية","items":["تعبئة استمارة الانخراط.","إرفاق نسخة من البطاقة الوطنية.","صورة شخصية.","الموافقة على القانون الداخلي.","إرسال الطلب عبر المنصة."]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"docRequirements","eyebrow":"متطلبات العضوية","heading":"شروط الانخراط في الجمعية","description":"للتأكد من استكمال جميع المتطلبات، يرجى مراجعة القائمة التالية","items":["تعبئة استمارة الانخراط.","إرفاق نسخة من البطاقة الوطنية.","صورة شخصية.","الموافقة على القانون الداخلي.","إرسال الطلب عبر المنصة."]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 5. FAQ  (#doc-faq)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"docFaq","eyebrow":"الأسئلة الشائعة","heading":"استفسارات حول الوثائق","description":"أجوبة على أكثر الأسئلة شيوعًا بخصوص وثائق الانخراط","items":[{"question":"ما هي الوثائق المطلوبة للانخراط؟","answer":"الوثائق المطلوبة للانخراط في الجمعية هي: استمارة الانخراط معبأة، نسخة من البطاقة الوطنية، صورة شخصية حديثة، بالإضافة إلى الموافقة على القانون الداخلي والتوقيع على وثيقة التزام العضو. يمكنك تحميل جميع هذه الوثائق من هذه الصفحة."},{"question":"هل يمكن تعبئة الاستمارة إلكترونياً؟","answer":"نعم، يمكنك تعبئة استمارة الانخراط إلكترونياً من خلال صفحة الانخراط الإلكتروني. بعد تعبئة الاستمارة وإرفاق الوثائق المطلوبة، سيتم إنشاء ملف PDF يحتوي على جميع البيانات ويمكنك طباعته وتوقيعه."},{"question":"هل يمكن تحميل الوثائق أكثر من مرة؟","answer":"بالتأكيد، جميع الوثائق المتاحة للتحميل في هذه الصفحة يمكن تحميلها وتنزيلها عدد غير محدود من المرات. الوثائق متاحة بشكل دائم لجميع الزوار والأعضاء."},{"question":"كيف أرسل الوثائق بعد تعبئتها؟","answer":"بعد تحميل الوثائق وتعبئتها، يمكنك إما إرسالها عبر البريد الإلكتروني للجمعية، أو التوجه إلى مقر الجمعية لتسليمها شخصياً. كما يمكنك استخدام منصة الانخراط الإلكتروني لرفع الوثائق مباشرة وإرسال طلبك إلكترونياً."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 5;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 5, '{"_renderer":"docFaq","eyebrow":"الأسئلة الشائعة","heading":"استفسارات حول الوثائق","description":"أجوبة على أكثر الأسئلة شيوعًا بخصوص وثائق الانخراط","items":[{"question":"ما هي الوثائق المطلوبة للانخراط؟","answer":"الوثائق المطلوبة للانخراط في الجمعية هي: استمارة الانخراط معبأة، نسخة من البطاقة الوطنية، صورة شخصية حديثة، بالإضافة إلى الموافقة على القانون الداخلي والتوقيع على وثيقة التزام العضو. يمكنك تحميل جميع هذه الوثائق من هذه الصفحة."},{"question":"هل يمكن تعبئة الاستمارة إلكترونياً؟","answer":"نعم، يمكنك تعبئة استمارة الانخراط إلكترونياً من خلال صفحة الانخراط الإلكتروني. بعد تعبئة الاستمارة وإرفاق الوثائق المطلوبة، سيتم إنشاء ملف PDF يحتوي على جميع البيانات ويمكنك طباعته وتوقيعه."},{"question":"هل يمكن تحميل الوثائق أكثر من مرة؟","answer":"بالتأكيد، جميع الوثائق المتاحة للتحميل في هذه الصفحة يمكن تحميلها وتنزيلها عدد غير محدود من المرات. الوثائق متاحة بشكل دائم لجميع الزوار والأعضاء."},{"question":"كيف أرسل الوثائق بعد تعبئتها؟","answer":"بعد تحميل الوثائق وتعبئتها، يمكنك إما إرسالها عبر البريد الإلكتروني للجمعية، أو التوجه إلى مقر الجمعية لتسليمها شخصياً. كما يمكنك استخدام منصة الانخراط الإلكتروني لرفع الوثائق مباشرة وإرسال طلبك إلكترونياً."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 6. FINAL CTA  (#doc-cta)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"docCta","heading":"جاهز لإرسال طلب الانخراط؟","headingEm":"طلب الانخراط؟","description":"بعد تحميل الوثائق وتعبئتها يمكنك الانتقال مباشرة إلى صفحة الانخراط الإلكتروني وإرسال طلبك. يمكنك أيضاً الاطلاع على وثيقة الالتزام والقانون الأساسي.","buttons":[{"id":"btn-doc-cta-commitment","label":"وثيقة الالتزام","url":"commitment.html","variant":"secondary"},{"id":"btn-doc-cta-bylaws","label":"القانون الأساسي","url":"bylaws.html","variant":"secondary"},{"id":"btn-doc-cta-join","label":"الانخراط الإلكتروني","url":"index.html#join-form","variant":"primary"},{"id":"btn-doc-cta-application","label":"استمارة الانخراط","url":"application.html","variant":"secondary"},{"id":"btn-doc-cta-regulations","label":"النظام الداخلي","url":"internal-regulations.html","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"docCta","heading":"جاهز لإرسال طلب الانخراط؟","headingEm":"طلب الانخراط؟","description":"بعد تحميل الوثائق وتعبئتها يمكنك الانتقال مباشرة إلى صفحة الانخراط الإلكتروني وإرسال طلبك. يمكنك أيضاً الاطلاع على وثيقة الالتزام والقانون الأساسي.","buttons":[{"id":"btn-doc-cta-commitment","label":"وثيقة الالتزام","url":"commitment.html","variant":"secondary"},{"id":"btn-doc-cta-bylaws","label":"القانون الأساسي","url":"bylaws.html","variant":"secondary"},{"id":"btn-doc-cta-join","label":"الانخراط الإلكتروني","url":"index.html#join-form","variant":"primary"},{"id":"btn-doc-cta-application","label":"استمارة الانخراط","url":"application.html","variant":"secondary"},{"id":"btn-doc-cta-regulations","label":"النظام الداخلي","url":"internal-regulations.html","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  RAISE NOTICE 'DOCUMENTS: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
