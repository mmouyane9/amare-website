-- ============================================================================
-- National Vision — page_content field seed (non-destructive)
-- Uses INSERT ... ON CONFLICT DO UPDATE for safe idempotent execution.
-- ============================================================================

DO $$
DECLARE
    page_uuid UUID;
BEGIN

    SELECT id INTO page_uuid FROM pages WHERE slug = '/Who%20are%20we/national-vision.html' LIMIT 1;
    IF page_uuid IS NULL THEN
        RAISE EXCEPTION 'National Vision page not found.';
    END IF;

    INSERT INTO page_content (page_id, content_key, content_type, label, value, sort_order) VALUES
    -- Hero
    (page_uuid, 'nv.hero.badge',   'text', 'Hero Badge',       'الرؤية الوطنية', 1),
    (page_uuid, 'nv.hero.title',   'text', 'Hero Title',       'الرؤية الوطنية للجمعية', 2),
    (page_uuid, 'nv.hero.desc',    'text', 'Hero Description', 'تسعى الجمعية المغربية لهواة البحث والاستكشاف إلى النهوض بمجال الاستكشاف والبحث العلمي، ونشر الثقافة البيئية، والحفاظ على التراث الطبيعي والثقافي، وتعزيز التنمية المستدامة في مختلف جهات المملكة المغربية.', 3),
    (page_uuid, 'nv.hero.btn1.text','text', 'Hero Button 1 Text','اكتشف رؤيتنا', 4),
    (page_uuid, 'nv.hero.btn1.url', 'url',  'Hero Button 1 URL', '#nvVision', 5),
    (page_uuid, 'nv.hero.btn2.text','text', 'Hero Button 2 Text','أثرنا على الميدان', 6),
    (page_uuid, 'nv.hero.btn2.url', 'url',  'Hero Button 2 URL', '#nvStats', 7),

    -- Vision Statement
    (page_uuid, 'nv.vision.eyebrow',   'text', 'Vision Eyebrow',   'ماذا نطمح إليه', 10),
    (page_uuid, 'nv.vision.title',     'text', 'Vision Title',     'رؤيتنا', 11),
    (page_uuid, 'nv.vision.desc',      'text', 'Vision Description','نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.', 12),
    (page_uuid, 'nv.vision.card1.title','text', 'Vision Card 1 Title','أجيال واعية', 13),
    (page_uuid, 'nv.vision.card1.desc', 'text', 'Vision Card 1 Desc', 'نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية.', 14),
    (page_uuid, 'nv.vision.card2.title','text', 'Vision Card 2 Title','تراث مستدام', 15),
    (page_uuid, 'nv.vision.card2.desc', 'text', 'Vision Card 2 Desc', 'نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة.', 16),
    (page_uuid, 'nv.vision.card3.title','text', 'Vision Card 3 Title','استكشاف مسؤول', 17),
    (page_uuid, 'nv.vision.card3.desc', 'text', 'Vision Card 3 Desc', 'نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية.', 18),

    -- Objectives
    (page_uuid, 'nv.objectives.eyebrow', 'text', 'Objectives Eyebrow', 'أولويات العمل', 20),
    (page_uuid, 'nv.objectives.title',   'text', 'Objectives Title',   'الأهداف الاستراتيجية', 21),
    (page_uuid, 'nv.objectives.desc',    'text', 'Objectives Desc',    'حددت الجمعية ستة أهداف استراتيجية كبرى توجّه جميع برامجها وأنشطتها على المستوى الوطني.', 22),
    (page_uuid, 'nv.objectives.card1.title','text', 'Obj Card 1 Title','تعزيز البحث العلمي', 23),
    (page_uuid, 'nv.objectives.card1.desc', 'text', 'Obj Card 1 Desc', 'دعم الدراسات الميدانية والتوثيق العلمي للاكتشافات الجيولوجية والأثرية والطبيعية في مختلف جهات المملكة.', 24),
    (page_uuid, 'nv.objectives.card2.title','text', 'Obj Card 2 Title','حماية التراث الطبيعي', 25),
    (page_uuid, 'nv.objectives.card2.desc', 'text', 'Obj Card 2 Desc', 'المساهمة في الحفاظ على المواقع الطبيعية والمحميات، والتصدي لأي استغلال يهدد التوازن البيئي الوطني.', 26),
    (page_uuid, 'nv.objectives.card3.title','text', 'Obj Card 3 Title','نشر الثقافة البيئية', 27),
    (page_uuid, 'nv.objectives.card3.desc', 'text', 'Obj Card 3 Desc', 'تنظيم حملات تحسيسية وبرامج تربوية لتعزيز الوعي البيئي وترسيخ سلوكات مستدامة لدى المواطنين.', 28),
    (page_uuid, 'nv.objectives.card4.title','text', 'Obj Card 4 Title','دعم الشباب', 29),
    (page_uuid, 'nv.objectives.card4.desc', 'text', 'Obj Card 4 Desc', 'مواكبة الشباب المهتم بالاستكشاف والعلوم عبر تكوينات وورشات وإشراكهم في مشاريع ميدانية هادفة.', 30),
    (page_uuid, 'nv.objectives.card5.title','text', 'Obj Card 5 Title','تعزيز العمل التطوعي', 31),
    (page_uuid, 'nv.objectives.card5.desc', 'text', 'Obj Card 5 Desc', 'تحفيز المتطوعين وتأطيرهم ليكونوا فاعلين أساسيين في إنجاح البرامج الوطنية للجمعية.', 32),
    (page_uuid, 'nv.objectives.card6.title','text', 'Obj Card 6 Title','بناء شراكات وطنية', 33),
    (page_uuid, 'nv.objectives.card6.desc', 'text', 'Obj Card 6 Desc', 'تطوير شراكات مع الجامعات والمؤسسات والجمعيات لتبادل الخبرات وتوسيع نطاق الأثر على المستوى الوطني.', 34),

    -- Priorities
    (page_uuid, 'nv.priorities.eyebrow', 'text', 'Priorities Eyebrow', 'خريطة الطريق', 40),
    (page_uuid, 'nv.priorities.title',   'text', 'Priorities Title',   'أولوياتنا الوطنية', 41),
    (page_uuid, 'nv.priorities.desc',    'text', 'Priorities Desc',    'خطة عمل وطنية واضحة تقوم على أربع أولويات كبرى تعكس التزام الجمعية بأداء رسالتها.', 42),
    (page_uuid, 'nv.priorities.step1.heading','text', 'Step 1 Title','الاستكشاف', 43),
    (page_uuid, 'nv.priorities.step1.desc',   'text', 'Step 1 Desc', 'تنظيم خرجات وبعثات ميدانية آمنة ومسؤولة تتيح للهواة اكتشاف الثروات الطبيعية والمواقع التاريخية، مع الالتزام بميثاق الاستكشاف المسؤول.', 44),
    (page_uuid, 'nv.priorities.step2.heading','text', 'Step 2 Title','التكوين', 45),
    (page_uuid, 'nv.priorities.step2.desc',   'text', 'Step 2 Desc', 'تأهيل الأعضاء عبر برامج تكوينية متدرجة في مجالات الإسعافات الأولية وتقنيات البحث الميداني والسلامة والتوثيق العلمي.', 46),
    (page_uuid, 'nv.priorities.step3.heading','text', 'Step 3 Title','البحث العلمي', 47),
    (page_uuid, 'nv.priorities.step3.desc',   'text', 'Step 3 Desc', 'إنجاز دراسات ومسوحات ميدانية بالتعاون مع الخبراء والجامعات، ونشر النتائج في مجلة AMARE والمجلات العلمية المتخصصة.', 48),
    (page_uuid, 'nv.priorities.step4.heading','text', 'Step 4 Title','الشراكات', 49),
    (page_uuid, 'nv.priorities.step4.desc',   'text', 'Step 4 Desc', 'نسج شبكة واسعة من الشراكات مع المؤسسات الوطنية والدولية لتعزيز الموارد وتبادل المعرفة وتوسيع الأثر على الصعيدين الجهوي والوطني.', 50),

    -- Statistics
    (page_uuid, 'nv.stats.eyebrow',       'text', 'Stats Eyebrow',   'أثرنا في الأرقام', 60),
    (page_uuid, 'nv.stats.title',         'text', 'Stats Title',     'مسيرة وطنية بأرقام معبرة', 61),
    (page_uuid, 'nv.stats.stat1.value',   'text', 'Stat 1 Value',    '20', 62),
    (page_uuid, 'nv.stats.stat1.suffix',  'text', 'Stat 1 Suffix',   '+', 63),
    (page_uuid, 'nv.stats.stat1.label',   'text', 'Stat 1 Label',    'شراكة', 64),
    (page_uuid, 'nv.stats.stat2.value',   'text', 'Stat 2 Value',    '100', 65),
    (page_uuid, 'nv.stats.stat2.suffix',  'text', 'Stat 2 Suffix',   '+', 66),
    (page_uuid, 'nv.stats.stat2.label',   'text', 'Stat 2 Label',    'نشاط', 67),
    (page_uuid, 'nv.stats.stat3.value',   'text', 'Stat 3 Value',    '1000', 68),
    (page_uuid, 'nv.stats.stat3.suffix',  'text', 'Stat 3 Suffix',   '+', 69),
    (page_uuid, 'nv.stats.stat3.label',   'text', 'Stat 3 Label',    'مستفيد', 70),
    (page_uuid, 'nv.stats.stat4.value',   'text', 'Stat 4 Value',    '12', 71),
    (page_uuid, 'nv.stats.stat4.suffix',  'text', 'Stat 4 Suffix',   '+', 72),
    (page_uuid, 'nv.stats.stat4.label',   'text', 'Stat 4 Label',    'جهة مستهدفة', 73),

    -- Quote
    (page_uuid, 'nv.quote.text', 'text', 'Quote Text', 'رؤيتنا هي بناء مجتمع يقدّر المعرفة والاستكشاف ويحافظ على التراث الطبيعي والثقافي للأجيال القادمة.', 80),
    (page_uuid, 'nv.quote.attr', 'text', 'Quote Attribution', 'الجمعية المغربية لهواة البحث والاستكشاف', 81),

    -- CTA
    (page_uuid, 'nv.cta.title',       'text', 'CTA Title',       'كن جزءاً من رؤيتنا الوطنية', 90),
    (page_uuid, 'nv.cta.desc',        'text', 'CTA Description', 'انضم إلى آلاف الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.', 91),
    (page_uuid, 'nv.cta.btn1.text',   'text', 'CTA Button 1 Text','انخرط معنا', 92),
    (page_uuid, 'nv.cta.btn1.url',    'url',  'CTA Button 1 URL', '../Join us/join-us-online.html', 93),
    (page_uuid, 'nv.cta.btn2.text',   'text', 'CTA Button 2 Text','اتصل بنا', 94),
    (page_uuid, 'nv.cta.btn2.url',    'url',  'CTA Button 2 URL', '../contact.html', 95)

    ON CONFLICT (page_id, content_key) DO UPDATE
    SET value = EXCLUDED.value,
        label = EXCLUDED.label,
        updated_at = now();

END;
$$;
