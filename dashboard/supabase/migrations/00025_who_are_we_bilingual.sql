-- ============================================================================
-- Who Are We — Full Bilingual Conversion (_ar/_fr)
--
-- Converts ALL remaining sections. Central Office already done in 00024.
-- Idempotent. Arabic sourced from 00006_about_page_seed.sql.
-- French sourced from existing project translations.
-- ============================================================================

DO $$
DECLARE
  v_page_id   uuid;
BEGIN
  SELECT id INTO v_page_id
  FROM pages
  WHERE slug = '/about' AND status = 'published'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE NOTICE 'Page /about not found — nothing to migrate.';
    RETURN;
  END IF;

  -- ==========================================================================
  -- 1. HERO (sort_order 1)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "heading_ar": "تعرف على الجمعية",
    "heading_fr": "Découvrez l''association",
    "subheading_ar": "من نحن",
    "subheading_fr": "Qui sommes-nous",
    "description_ar": "اكتشف رؤية الجمعية الوطنية ورسالتها وقيمها، وتعرف على مكتبها المركزي وخارطة توسعها في مختلف جهات المملكة المغربية.",
    "description_fr": "Découvrez la vision nationale de l''association, sa mission, ses valeurs, son bureau central et sa carte d''expansion dans les différentes régions du Royaume du Maroc.",
    "backgroundImage": "",
    "buttons": [
      {"id":"btn-about-nav-vision","label_ar":"الرؤية الوطنية","label_fr":"Vision nationale","url":"#national-vision","variant":"primary"},
      {"id":"btn-about-nav-mission","label_ar":"الرسالة","label_fr":"Mission","url":"#mission","variant":"primary"},
      {"id":"btn-about-nav-values","label_ar":"القيم","label_fr":"Valeurs","url":"#values","variant":"primary"},
      {"id":"btn-about-nav-co","label_ar":"المكتب المركزي","label_fr":"Bureau central","url":"#central-office","variant":"primary"},
      {"id":"btn-about-nav-em","label_ar":"خارطة التوسع","label_fr":"Carte d''expansion","url":"#expansion-map","variant":"primary"}
    ]
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 1;

  -- ==========================================================================
  -- 2. NATIONAL VISION (sort_order 2)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "_renderer": "nationalVision",
    "eyebrow_ar": "ماذا نطمح إليه",
    "eyebrow_fr": "Ce à quoi nous aspirons",
    "heading_ar": "الرؤية الوطنية",
    "heading_fr": "La vision nationale",
    "description_ar": "نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.",
    "description_fr": "Nous aspirons à devenir l''association nationale de référence dans l''unification des amateurs de recherche et d''exploration autour d''une vision commune fondée sur la science, la connaissance, la conscience environnementale et l''appartenance nationale. Nous croyons que le citoyen marocain conscient, lorsqu''il reçoit l''opportunité et le savoir, est capable de protéger les richesses naturelles et culturelles de son pays et d''assurer leur durabilité pour les générations futures, à travers une exploration responsable alliant la passion de l''aventure et l''engagement envers l''éthique et les meilleures pratiques.",
    "cards": [
      {"title_ar":"أجيال واعية","title_fr":"Générations conscientes","description_ar":"نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية.","description_fr":"Nous œuvrons à former des générations de jeunes conscients de l''importance de la science et de la recherche, capables de comprendre leur patrimoine national et de contribuer à son développement et à sa protection de manière responsable."},
      {"title_ar":"تراث مستدام","title_fr":"Patrimoine durable","description_ar":"نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة.","description_fr":"Nous préservons et valorisons le patrimoine naturel et culturel marocain, afin d''assurer sa transmission dans toute sa valeur aux générations futures."},
      {"title_ar":"استكشاف مسؤول","title_fr":"Exploration responsable","description_ar":"نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية.","description_fr":"Nous nous engageons à respecter un code éthique strict qui fait de chaque sortie sur le terrain une opportunité d''exploration scientifique sûre et respectueuse de l''environnement et des communautés locales."}
    ]
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 2;

  -- ==========================================================================
  -- 3. MISSION (sort_order 3)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "_renderer": "mission",
    "eyebrow_ar": "غايتنا",
    "eyebrow_fr": "Notre raison d''être",
    "heading_ar": "رسالتنا",
    "heading_fr": "Notre mission",
    "description_ar": "تتمثل رسالتنا في نشر ثقافة البحث والاستكشاف وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي المغربي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي. نعمل على تجسيد هذه الرسالة عبر برامج ميدانية وأنشطة توثيقية وتكوينية ترافق الهواة من مختلف الفئات والأعمار، وتكرّس القيم العلمية والأخلاقية في كل خطوة نقوم بها.",
    "description_fr": "Notre mission est de diffuser la culture de la recherche et de l''exploration, d''encourager les jeunes à participer aux initiatives scientifiques et environnementales, de contribuer à la protection du patrimoine naturel et culturel marocain, et de bâtir une communauté consciente fondée sur la connaissance et le bénévolat. Nous concrétisons cette mission à travers des programmes de terrain et des activités de documentation et de formation qui accompagnent les amateurs de tous âges et de tous horizons, en consacrant les valeurs scientifiques et éthiques dans chaque étape que nous entreprenons."
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 3;

  -- ==========================================================================
  -- 4. VALUES (sort_order 4)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "_renderer": "values",
    "eyebrow_ar": "ماذا نؤمن به",
    "eyebrow_fr": "Ce en quoi nous croyons",
    "heading_ar": "قيمنا",
    "heading_fr": "Nos valeurs",
    "description_ar": "ثماني قيم جوهرية تترجم مبادئنا إلى سلوك يومي ملموس في كل ما نقوم به.",
    "description_fr": "Huit valeurs fondamentales qui traduisent nos principes en comportements quotidiens concrets dans tout ce que nous entreprenons.",
    "cards": [
      {"title_ar":"النزاهة","title_fr":"Intégrité","description_ar":"الالتزام بالشفافية والصدق في جميع أعمال الجمعية.","description_fr":"Engagement envers la transparence et l''honnêteté dans toutes les activités de l''association."},
      {"title_ar":"العمل الجماعي","title_fr":"Travail d''équipe","description_ar":"نؤمن بأن النجاح يتحقق من خلال التعاون وروح الفريق.","description_fr":"Nous croyons que le succès s''obtient par la collaboration et l''esprit d''équipe."},
      {"title_ar":"الابتكار","title_fr":"Innovation","description_ar":"تشجيع الأفكار الجديدة والحلول الإبداعية في البحث والاستكشاف.","description_fr":"Encourager les idées nouvelles et les solutions créatives dans la recherche et l''exploration."},
      {"title_ar":"المسؤولية","title_fr":"Responsabilité","description_ar":"تحمل المسؤولية تجاه المجتمع والبيئة والتراث الوطني.","description_fr":"Assumer la responsabilité envers la société, l''environnement et le patrimoine national."},
      {"title_ar":"الاحترام","title_fr":"Respect","description_ar":"احترام الجميع وتعزيز ثقافة الحوار والتعاون.","description_fr":"Respecter chacun et promouvoir la culture du dialogue et de la coopération."},
      {"title_ar":"التطوع","title_fr":"Bénévolat","description_ar":"غرس روح المبادرة وخدمة المجتمع دون مقابل.","description_fr":"Inculquer l''esprit d''initiative et le service à la communauté sans contrepartie."},
      {"title_ar":"الاستدامة","title_fr":"Durabilité","description_ar":"المحافظة على الموارد الطبيعية للأجيال القادمة.","description_fr":"Préserver les ressources naturelles pour les générations futures."},
      {"title_ar":"التميز","title_fr":"Excellence","description_ar":"السعي المستمر نحو الجودة والاحترافية في جميع المبادرات.","description_fr":"La recherche continue de la qualité et du professionnalisme dans toutes les initiatives."}
    ]
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 4;

  -- ==========================================================================
  -- 5. CENTRAL OFFICE (sort_order 5) — ALREADY DONE in 00024. SKIP.
  -- ==========================================================================

  -- ==========================================================================
  -- 6. EXPANSION MAP (sort_order 6)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "_renderer": "expansionMap",
    "eyebrow_ar": "رؤيتنا للتوسع",
    "eyebrow_fr": "Notre vision de l''expansion",
    "heading_ar": "خارطة التوسع الوطني",
    "heading_fr": "Carte de l''expansion nationale",
    "description_ar": "تنبني استراتيجية التوسع لدى الجمعية على مبدأ التقريب: تقريب الهيكل التنظيمي من الهواة أينما كانوا، وتمكينهم من الانخراط في العمل الجمعوي دون عناء التنقل، مع الحرص على توحيد معايير العمل وجودة البرامج عبر جميع الفروع، وتعزيز الشراكات المحلية والجهوية، والاستثمار في قيادات محلية مؤهلة قادرة على ترجمة رسالة الجمعية داخل جهاتها.",
    "description_fr": "La stratégie d''expansion de l''association repose sur le principe de proximité : rapprocher la structure organisationnelle des amateurs où qu''ils soient, leur permettre de s''engager dans le travail associatif sans la contrainte du déplacement, tout en veillant à l''uniformisation des normes de travail et de la qualité des programmes dans toutes les branches, au renforcement des partenariats locaux et régionaux, et à l''investissement dans des leaders locaux qualifiés capables de concrétiser la mission de l''association dans leurs régions.",
    "mapEyebrow_ar": "الخريطة التفاعلية",
    "mapEyebrow_fr": "La carte interactive",
    "mapHeading_ar": "خريطة جهات المملكة",
    "mapHeading_fr": "Carte des régions du Royaume",
    "mapDescription_ar": "انقر على أي جهة لاستكشاف حالة التوسع، وعدد الفروع النشطة أو المرتقبة في كل جهة.",
    "mapDescription_fr": "Cliquez sur n''importe quelle région pour explorer l''état de l''expansion et le nombre de branches actives ou prévues dans chaque région.",
    "legendTitle_ar": "دليل الألوان",
    "legendTitle_fr": "Légende",
    "legendSub_ar": "حالة التوسع في جهات المملكة",
    "legendSub_fr": "État de l''expansion dans les régions du Royaume",
    "legendActive_ar": "فروع نشطة",
    "legendActive_fr": "Branches actives",
    "legendUpcoming_ar": "فروع مرتقبة",
    "legendUpcoming_fr": "Branches à venir",
    "legendFuture_ar": "توسع مستقبلي",
    "legendFuture_fr": "Expansion future",
    "emptyDetail_ar": "انقر على أي جهة في الخريطة لعرض تفاصيل التوسع بها.",
    "emptyDetail_fr": "Cliquez sur une région de la carte pour afficher les détails de son expansion.",
    "regions": [
      {"id":"MA09","name_ar":"سوس - ماسة","name_fr":"Souss-Massa","status":"active","branches":4},
      {"id":"MA01","name_ar":"طنجة - تطوان - الحسيمة","name_fr":"Tanger-Tétouan-Al Hoceïma","status":"active","branches":1},
      {"id":"MA03","name_ar":"فاس - مكناس","name_fr":"Fès-Meknès","status":"active","branches":2},
      {"id":"MA04","name_ar":"الرباط - سلا - القنيطرة","name_fr":"Rabat-Salé-Kénitra","status":"active","branches":2},
      {"id":"MA06","name_ar":"الدار البيضاء - سطات","name_fr":"Casablanca-Settat","status":"active","branches":3},
      {"id":"MA02","name_ar":"الشرق","name_fr":"Oriental","status":"upcoming","branches":0},
      {"id":"MA05","name_ar":"بني ملال - خنيفرة","name_fr":"Béni Mellal-Khénifra","status":"upcoming","branches":1},
      {"id":"MA07","name_ar":"مراكش - آسفي","name_fr":"Marrakech-Safi","status":"upcoming","branches":1},
      {"id":"MA08","name_ar":"درعة - تافيلالت","name_fr":"Drâa-Tafilalet","status":"upcoming","branches":0},
      {"id":"MA10","name_ar":"كلميم - واد نون","name_fr":"Guelmim-Oued Noun","status":"future","branches":0},
      {"id":"MA11","name_ar":"العيون - الساقية الحمراء","name_fr":"Laâyoune-Sakia El Hamra","status":"future","branches":0},
      {"id":"MA12","name_ar":"الداخلة - وادي الذهب","name_fr":"Dakhla-Oued Eddahab","status":"future","branches":0}
    ]
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 6;

  -- ==========================================================================
  -- 7. CTA (sort_order 7)
  -- ==========================================================================
  UPDATE page_sections
  SET content = '{
    "heading_ar": "كن جزءاً من مسيرتنا",
    "heading_fr": "Faites partie de notre parcours",
    "description_ar": "انضم إلى شبكة الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.",
    "description_fr": "Rejoignez le réseau d''amateurs, de chercheurs et de bénévoles qui partagent avec nous la passion de l''exploration et l''engagement envers la protection du patrimoine marocain, et contribuez avec nous à construire un avenir plus durable.",
    "buttonLabel_ar": "انخرط معنا",
    "buttonLabel_fr": "Rejoignez-nous",
    "buttonUrl": "../Join us/join-us-online.html",
    "backgroundImage": ""
  }'::jsonb
  WHERE page_id = v_page_id AND sort_order = 7;

  -- ==========================================================================
  -- VERIFICATION
  -- ==========================================================================
  RAISE NOTICE '=========================================';
  RAISE NOTICE '  Who Are We page — all sections migrated to bilingual _ar/_fr.';
  RAISE NOTICE '  Page id: %', v_page_id;
  RAISE NOTICE '=========================================';
END $$;
