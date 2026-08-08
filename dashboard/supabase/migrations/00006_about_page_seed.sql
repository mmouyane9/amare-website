-- ============================================================================
-- من نحن — Fix stale page_sections by updating section_type + content in-place
--
-- NON-DESTRUCTIVE: UPDATE only. No DELETE, TRUNCATE, or DROP.
-- Idempotent — running twice produces same result.
-- Only targets the "من نحن" page. No other page is affected.
-- ============================================================================

DO $$
DECLARE
  v_page_id UUID;
  v_count   INT;
  r         RECORD;
BEGIN
  ----------------------------------------------------------------------------
  -- 1. Locate the "من نحن" page
  ----------------------------------------------------------------------------
  SELECT id INTO v_page_id
    FROM pages
   WHERE slug = '/about'
   LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE EXCEPTION 'Page with slug /about not found.';
  END IF;

  RAISE NOTICE 'Target page_id: %', v_page_id;

  ----------------------------------------------------------------------------
  -- 2. Update sort_order 1 → Hero
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'hero',
         content      = '{
           "heading": "تعرف على الجمعية",
           "subheading": "من نحن",
           "description": "اكتشف رؤية الجمعية الوطنية ورسالتها وقيمها، وتعرف على مكتبها المركزي وخارطة توسعها في مختلف جهات المملكة المغربية.",
           "backgroundImage": "",
           "buttons": [
             {"id":"btn-about-nav-vision","label":"الرؤية الوطنية","url":"#national-vision","variant":"primary"},
             {"id":"btn-about-nav-mission","label":"الرسالة","url":"#mission","variant":"primary"},
             {"id":"btn-about-nav-values","label":"القيم","url":"#values","variant":"primary"},
             {"id":"btn-about-nav-co","label":"المكتب المركزي","url":"#central-office","variant":"primary"},
             {"id":"btn-about-nav-em","label":"خارطة التوسع","url":"#expansion-map","variant":"primary"}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 1;

  ----------------------------------------------------------------------------
  -- 3. Update sort_order 2 → الرؤية الوطنية
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "nationalVision",
           "eyebrow": "ماذا نطمح إليه",
           "heading": "الرؤية الوطنية",
           "description": "نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.",
           "cards": [
             {"title":"أجيال واعية","description":"نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية."},
             {"title":"تراث مستدام","description":"نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة."},
             {"title":"استكشاف مسؤول","description":"نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية."}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 2;

  ----------------------------------------------------------------------------
  -- 4. Update sort_order 3 → الرسالة
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "mission",
           "eyebrow": "غايتنا",
           "heading": "رسالتنا",
           "description": "تتمثل رسالتنا في نشر ثقافة البحث والاستكشاف وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي المغربي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي. نعمل على تجسيد هذه الرسالة عبر برامج ميدانية وأنشطة توثيقية وتكوينية ترافق الهواة من مختلف الفئات والأعمار، وتكرّس القيم العلمية والأخلاقية في كل خطوة نقوم بها."
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 3;

  ----------------------------------------------------------------------------
  -- 5. Update sort_order 4 → القيم
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "values",
           "eyebrow": "ماذا نؤمن به",
           "heading": "قيمنا",
           "description": "ثماني قيم جوهرية تترجم مبادئنا إلى سلوك يومي ملموس في كل ما نقوم به.",
           "cards": [
             {"title":"النزاهة","description":"الالتزام بالشفافية والصدق في جميع أعمال الجمعية."},
             {"title":"العمل الجماعي","description":"نؤمن بأن النجاح يتحقق من خلال التعاون وروح الفريق."},
             {"title":"الابتكار","description":"تشجيع الأفكار الجديدة والحلول الإبداعية في البحث والاستكشاف."},
             {"title":"المسؤولية","description":"تحمل المسؤولية تجاه المجتمع والبيئة والتراث الوطني."},
             {"title":"الاحترام","description":"احترام الجميع وتعزيز ثقافة الحوار والتعاون."},
             {"title":"التطوع","description":"غرس روح المبادرة وخدمة المجتمع دون مقابل."},
             {"title":"الاستدامة","description":"المحافظة على الموارد الطبيعية للأجيال القادمة."},
             {"title":"التميز","description":"السعي المستمر نحو الجودة والاحترافية في جميع المبادرات."}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 4;

  ----------------------------------------------------------------------------
  -- 6. Update sort_order 5 → المكتب المركزي
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "centralOffice",
           "eyebrow": "عن المكتب المركزي",
           "heading": "المكتب المركزي",
           "description": "يُعد المكتب المركزي الهيئة التنفيذية العليا للجمعية المغربية لهواة البحث والاستكشاف؛ فهو المسؤول عن إدارة شؤون الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية بين الفروع، وتعزيز الشراكات مع المؤسسات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة، مع الحرص على الالتزام بالقيم والمبادئ التي تقوم عليها الجمعية.",
           "teamEyebrow": "فريق القيادة",
           "teamHeading": "أعضاء المكتب المركزي",
           "teamDescription": "يتكون المكتب المركزي من نخبة من الكفاءات الوطنية التي تسهر على تحقيق أهداف الجمعية وترجمة رؤيتها إلى واقع.",
           "members": [
             {"name":"عبد الرحيم العسري","role":"رئيس المكتب المركزي","bio":"خبرة واسعة في تدبير الشأن الجمعوي وقيادة الفرق، يشرف على تنفيذ الرؤية الاستراتيجية للجمعية ومتابعة برامجها الوطنية.","color":"#123B78","facebook":"#","instagram":"#","linkedin":"#","profileUrl":"#"},
             {"name":"فاطمة الزهراء بنعلي","role":"عضو المكتب المركزي","bio":"تساهم في تنسيق العمل بين اللجان والمكتب المركزي، وتدبير ملفات التكوين والتأطير لفائدة المنخرطين والمنخرطات.","color":"#0F9CD1","facebook":"#","instagram":"#","linkedin":"#","profileUrl":"#"},
             {"name":"يوسف أيت لحسن","role":"عضو المكتب المركزي","bio":"يساهم في تدبير الميزانية والمحاسبة، ويحرص على الشفافية في تدبير الموارد المالية وفق مقتضيات القانون الأساسي للجمعية.","color":"#17A44E","facebook":"#","instagram":"#","linkedin":"#","profileUrl":"#"},
             {"name":"خديجة إدريسي","role":"عضو المكتب المركزي","bio":"تساهم في تدبير الجانب الإداري والتوثيقي، وتتبع أشغال المكتب والجمع العام، وتنسيق المراسلات مع الشركاء والمؤسسات.","color":"#DB2777","facebook":"#","instagram":"#","linkedin":"#","profileUrl":"#"},
             {"name":"محمد الصقلي","role":"عضو المكتب المركزي","bio":"يساهم في إعداد التقارير ومحاضر الاجتماعات، ومواكبة الملفات الإدارية والقانونية المرتبطة بتسيير الجمعية.","color":"#2563EB","facebook":"#","instagram":"#","linkedin":"#","profileUrl":"#"}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 5;

  ----------------------------------------------------------------------------
  -- 7. Update sort_order 6 → خارطة التوسع
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'custom',
         content      = '{
           "_renderer": "expansionMap",
           "eyebrow": "رؤيتنا للتوسع",
           "heading": "خارطة التوسع الوطني",
           "description": "تنبني استراتيجية التوسع لدى الجمعية على مبدأ التقريب: تقريب الهيكل التنظيمي من الهواة أينما كانوا، وتمكينهم من الانخراط في العمل الجمعوي دون عناء التنقل، مع الحرص على توحيد معايير العمل وجودة البرامج عبر جميع الفروع، وتعزيز الشراكات المحلية والجهوية، والاستثمار في قيادات محلية مؤهلة قادرة على ترجمة رسالة الجمعية داخل جهاتها.",
           "mapEyebrow": "الخريطة التفاعلية",
           "mapHeading": "خريطة جهات المملكة",
           "mapDescription": "انقر على أي جهة لاستكشاف حالة التوسع، وعدد الفروع النشطة أو المرتقبة في كل جهة.",
           "legendTitle": "دليل الألوان",
           "legendSub": "حالة التوسع في جهات المملكة",
           "legendActive": "فروع نشطة",
           "legendUpcoming": "فروع مرتقبة",
           "legendFuture": "توسع مستقبلي",
           "emptyDetail": "انقر على أي جهة في الخريطة لعرض تفاصيل التوسع بها.",
           "regions": [
             {"id":"MA09","name":"سوس - ماسة","status":"active","branches":4},
             {"id":"MA01","name":"طنجة - تطوان - الحسيمة","status":"active","branches":1},
             {"id":"MA03","name":"فاس - مكناس","status":"active","branches":2},
             {"id":"MA04","name":"الرباط - سلا - القنيطرة","status":"active","branches":2},
             {"id":"MA06","name":"الدار البيضاء - سطات","status":"active","branches":3},
             {"id":"MA02","name":"الشرق","status":"upcoming","branches":0},
             {"id":"MA05","name":"بني ملال - خنيفرة","status":"upcoming","branches":1},
             {"id":"MA07","name":"مراكش - آسفي","status":"upcoming","branches":1},
             {"id":"MA08","name":"درعة - تافيلالت","status":"upcoming","branches":0},
             {"id":"MA10","name":"كلميم - واد نون","status":"future","branches":0},
             {"id":"MA11","name":"العيون - الساقية الحمراء","status":"future","branches":0},
             {"id":"MA12","name":"الداخلة - وادي الذهب","status":"future","branches":0}
           ]
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 6;

  ----------------------------------------------------------------------------
  -- 8. Update sort_order 7 → CTA
  ----------------------------------------------------------------------------
  UPDATE page_sections
     SET section_type = 'cta',
         content      = '{
           "heading": "كن جزءاً من مسيرتنا",
           "description": "انضم إلى شبكة الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.",
           "buttonLabel": "انخرط معنا",
           "buttonUrl": "../Join us/join-us-online.html",
           "backgroundImage": ""
         }'::jsonb,
         settings = '{}'::jsonb,
         styles   = '{}'::jsonb
   WHERE page_id = v_page_id AND sort_order = 7;

  ----------------------------------------------------------------------------
  -- 9. Verify
  ----------------------------------------------------------------------------
  RAISE NOTICE 'Updates complete. Verifying...';

  SELECT COUNT(*) INTO v_count
    FROM page_sections
   WHERE page_id = v_page_id;

  RAISE NOTICE '=========================================';
  RAISE NOTICE '  Page id:   %', v_page_id;
  RAISE NOTICE '  Sections:  % (expected 7)', v_count;
  RAISE NOTICE '=========================================';

  FOR r IN
    SELECT ps.sort_order, ps.section_type,
           (ps.content ->> '_renderer') AS renderer,
           length(ps.content::text)     AS content_size
      FROM page_sections ps
     WHERE ps.page_id = v_page_id
     ORDER BY ps.sort_order
  LOOP
    RAISE NOTICE '  [%] % : % | % bytes',
      r.sort_order, r.section_type, COALESCE(r.renderer, '-'), r.content_size;
  END LOOP;

END $$;

-- ============================================================================
-- Manual verification query
-- ============================================================================
-- SELECT ps.sort_order, ps.section_type,
--        (ps.content ->> '_renderer') AS renderer,
--        ps.content ->> 'heading'     AS heading
--   FROM page_sections ps
--  WHERE ps.page_id = (SELECT id FROM pages WHERE slug = '/about')
--  ORDER BY ps.sort_order;
