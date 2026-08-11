-- ============================================================================
-- Central Office Bilingual Pilot — Convert to _ar/_fr structure
--
-- NON-DESTRUCTIVE: Only modifies the Central Office page_section row.
-- Idempotent — running twice produces same result.
-- Arabic sourced from: 00006_about_page_seed.sql
-- French sourced from:  00023_translate_central_office_fr.sql
-- ============================================================================

DO $$
DECLARE
  v_page_id   uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_page_id
  FROM pages
  WHERE slug = '/about' AND status = 'published'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE NOTICE 'Page /about not found — nothing to migrate.';
    RETURN;
  END IF;

  SELECT id INTO v_section_id
  FROM page_sections
  WHERE page_id = v_page_id
    AND section_type = 'custom'
    AND content->>'_renderer' = 'centralOffice'
    AND visible = true
  LIMIT 1;

  IF v_section_id IS NULL THEN
    RAISE NOTICE 'Central Office section not found — nothing to migrate.';
    RETURN;
  END IF;

  UPDATE page_sections
  SET content = '{
    "_renderer": "centralOffice",
    "eyebrow_ar": "عن المكتب المركزي",
    "eyebrow_fr": "À propos du bureau central",
    "heading_ar": "المكتب المركزي",
    "heading_fr": "Le bureau central",
    "description_ar": "يُعد المكتب المركزي الهيئة التنفيذية العليا للجمعية المغربية لهواة البحث والاستكشاف؛ فهو المسؤول عن إدارة شؤون الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية بين الفروع، وتعزيز الشراكات مع المؤسسات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة، مع الحرص على الالتزام بالقيم والمبادئ التي تقوم عليها الجمعية.",
    "description_fr": "Le bureau central est l''organe exécutif suprême de l''Association Marocaine des Amateurs de Recherche et d''Exploration. Il est responsable de la gestion des affaires de l''association, de l''élaboration des plans stratégiques, de la coordination des activités nationales entre les branches, du renforcement des partenariats avec les institutions et de la garantie de la réalisation des objectifs et de la mission de l''association dans les différentes régions du Royaume, tout en veillant au respect des valeurs et des principes fondateurs de l''association.",
    "teamEyebrow_ar": "فريق القيادة",
    "teamEyebrow_fr": "Équipe dirigeante",
    "teamHeading_ar": "أعضاء المكتب المركزي",
    "teamHeading_fr": "Membres du bureau central",
    "teamDescription_ar": "يتكون المكتب المركزي من نخبة من الكفاءات الوطنية التي تسهر على تحقيق أهداف الجمعية وترجمة رؤيتها إلى واقع.",
    "teamDescription_fr": "Le bureau central est composé d''une élite de compétences nationales qui veillent à la réalisation des objectifs de l''association et à la concrétisation de sa vision.",
    "members": [
      {
        "name_ar": "عبد الرحيم العسري",
        "name_fr": "Abderrahim El Assri",
        "role_ar": "رئيس المكتب المركزي",
        "role_fr": "Président du bureau central",
        "bio_ar": "خبرة واسعة في تدبير الشأن الجمعوي وقيادة الفرق، يشرف على تنفيذ الرؤية الاستراتيجية للجمعية ومتابعة برامجها الوطنية.",
        "bio_fr": "Vaste expérience en gestion associative et leadership d''équipe. Il supervise la mise en œuvre de la vision stratégique de l''association et le suivi de ses programmes nationaux.",
        "color": "#123B78",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name_ar": "فاطمة الزهراء بنعلي",
        "name_fr": "Fatima Zahra Benali",
        "role_ar": "عضو المكتب المركزي",
        "role_fr": "Membre du bureau central",
        "bio_ar": "تساهم في تنسيق العمل بين اللجان والمكتب المركزي، وتدبير ملفات التكوين والتأطير لفائدة المنخرطين والمنخرطات.",
        "bio_fr": "Elle contribue à la coordination du travail entre les commissions et le bureau central, et à la gestion des dossiers de formation et d''encadrement au profit des adhérents.",
        "color": "#0F9CD1",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name_ar": "يوسف أيت لحسن",
        "name_fr": "Youssef Ait Lahcen",
        "role_ar": "عضو المكتب المركزي",
        "role_fr": "Membre du bureau central",
        "bio_ar": "يساهم في تدبير الميزانية والمحاسبة، ويحرص على الشفافية في تدبير الموارد المالية وفق مقتضيات القانون الأساسي للجمعية.",
        "bio_fr": "Il contribue à la gestion du budget et de la comptabilité, et veille à la transparence dans la gestion des ressources financières conformément aux dispositions du statut de l''association.",
        "color": "#17A44E",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name_ar": "خديجة إدريسي",
        "name_fr": "Khadija Idrissi",
        "role_ar": "عضو المكتب المركزي",
        "role_fr": "Membre du bureau central",
        "bio_ar": "تساهم في تدبير الجانب الإداري والتوثيقي، وتتبع أشغال المكتب والجمع العام، وتنسيق المراسلات مع الشركاء والمؤسسات.",
        "bio_fr": "Elle contribue à la gestion administrative et documentaire, au suivi des travaux du bureau et de l''assemblée générale, et à la coordination des correspondances avec les partenaires et les institutions.",
        "color": "#DB2777",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name_ar": "محمد الصقلي",
        "name_fr": "Mohammed Skalli",
        "role_ar": "عضو المكتب المركزي",
        "role_fr": "Membre du bureau central",
        "bio_ar": "يساهم في إعداد التقارير ومحاضر الاجتماعات، ومواكبة الملفات الإدارية والقانونية المرتبطة بتسيير الجمعية.",
        "bio_fr": "Il contribue à la préparation des rapports et des procès-verbaux de réunions, et au suivi des dossiers administratifs et juridiques liés à la gestion de l''association.",
        "color": "#2563EB",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      }
    ]
  }'::jsonb
  WHERE id = v_section_id;

  RAISE NOTICE '=========================================';
  RAISE NOTICE '  Central Office section % migrated to bilingual _ar/_fr format.', v_section_id;
  RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- Verification query
-- ============================================================================
-- SELECT content->>'eyebrow_ar' AS eyebrow_ar,
--        content->>'eyebrow_fr' AS eyebrow_fr,
--        content->>'heading_ar' AS heading_ar,
--        content->>'heading_fr' AS heading_fr,
--        jsonb_array_length(content->'members') AS member_count
--   FROM page_sections
--  WHERE page_id = (SELECT id FROM pages WHERE slug = '/about' LIMIT 1)
--    AND content->>'_renderer' = 'centralOffice';
