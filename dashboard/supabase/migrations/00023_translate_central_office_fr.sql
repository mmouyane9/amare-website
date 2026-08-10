-- Translate Central Office Members section to French
-- Updates the existing page_sections row for the من نحن page

DO $$
DECLARE
  v_page_id   uuid;
  v_section_id uuid;
BEGIN
  -- Find the page
  SELECT id INTO v_page_id
  FROM pages
  WHERE slug = '/about' AND status = 'published'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE EXCEPTION 'Page /about not found';
  END IF;

  -- Find the central office section
  SELECT id INTO v_section_id
  FROM page_sections
  WHERE page_id = v_page_id
    AND section_type = 'custom'
    AND content->>'_renderer' = 'centralOffice'
    AND visible = true
  LIMIT 1;

  IF v_section_id IS NULL THEN
    RAISE EXCEPTION 'Central office section not found';
  END IF;

  -- Update with French translations
  UPDATE page_sections
  SET content = '{
    "_renderer": "centralOffice",
    "eyebrow": "À propos du bureau central",
    "heading": "Le bureau central",
    "description": "Le bureau central est l''organe exécutif suprême de l''Association Marocaine des Amateurs de Recherche et d''Exploration. Il est responsable de la gestion des affaires de l''association, de l''élaboration des plans stratégiques, de la coordination des activités nationales entre les branches, du renforcement des partenariats avec les institutions et de la garantie de la réalisation des objectifs et de la mission de l''association dans les différentes régions du Royaume, tout en veillant au respect des valeurs et des principes fondateurs de l''association.",
    "teamEyebrow": "Équipe dirigeante",
    "teamHeading": "Membres du bureau central",
    "teamDescription": "Le bureau central est composé d''une élite de compétences nationales qui veillent à la réalisation des objectifs de l''association et à la concrétisation de sa vision.",
    "members": [
      {
        "name": "Abderrahim El Assri",
        "role": "Président du bureau central",
        "bio": "Vaste expérience en gestion associative et leadership d''équipe. Il supervise la mise en œuvre de la vision stratégique de l''association et le suivi de ses programmes nationaux.",
        "color": "#123B78",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name": "Fatima Zahra Benali",
        "role": "Membre du bureau central",
        "bio": "Elle contribue à la coordination du travail entre les commissions et le bureau central, et à la gestion des dossiers de formation et d''encadrement au profit des adhérents.",
        "color": "#0F9CD1",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name": "Youssef Ait Lahcen",
        "role": "Membre du bureau central",
        "bio": "Il contribue à la gestion du budget et de la comptabilité, et veille à la transparence dans la gestion des ressources financières conformément aux dispositions du statut de l''association.",
        "color": "#17A44E",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name": "Khadija Idrissi",
        "role": "Membre du bureau central",
        "bio": "Elle contribue à la gestion administrative et documentaire, au suivi des travaux du bureau et de l''assemblée générale, et à la coordination des correspondances avec les partenaires et les institutions.",
        "color": "#DB2777",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      },
      {
        "name": "Mohammed Skalli",
        "role": "Membre du bureau central",
        "bio": "Il contribue à la préparation des rapports et des procès-verbaux de réunions, et au suivi des dossiers administratifs et juridiques liés à la gestion de l''association.",
        "color": "#2563EB",
        "facebook": "#",
        "instagram": "#",
        "linkedin": "#",
        "profileUrl": "#"
      }
    ]
  }'::jsonb
  WHERE id = v_section_id;

  RAISE NOTICE 'Successfully updated central office section % to French', v_section_id;
END $$;
