-- ============================================================================
-- HOME PAGE CMS — Sections & Content
-- Run after 00002_pages_manager.sql
-- ============================================================================

-- Helper: upsert a section — returns its UUID
create or replace function upsert_section(p_slug text, p_key text, p_type text, p_ttl text, p_content jsonb, p_sort int)
returns uuid as $$
declare
  v_pid uuid;
  v_sid uuid;
begin
  select id into v_pid from pages where slug = p_slug;
  if v_pid is null then return null; end if;

  select id into v_sid from page_sections
  where page_id = v_pid and page_sections.section_key = p_key;

  if v_sid is not null then
    update page_sections
    set section_type = p_type, title = p_ttl, content = p_content,
        sort_order = p_sort, updated_at = now()
    where id = v_sid;
  else
    insert into page_sections (page_id, section_type, section_key, title, content, visible, sort_order)
    values (v_pid, p_type, p_key, p_ttl, p_content, true, p_sort)
    returning id into v_sid;
  end if;

  return v_sid;
end;
$$ language plpgsql;

-- ============================================================================
-- HOME PAGE: Hero
-- ============================================================================
select upsert_section('/', 'hero', 'hero', 'القسم الرئيسي',
  '{
    "heading": "اكتشف... شارك... وانضم إلى الجمعية المغربية لهواة البحث والاستكشاف",
    "subheading": "التسجيل في المسابقة الوطنية مفتوح الآن",
    "description": "شارك في المسابقة الوطنية، وانخرط إلكترونيا في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.",
    "primaryButtonText": "شارك في المسابقة",
    "primaryButtonUrl": "/competition.html",
    "secondaryButtonText": "الانخراط Online",
    "secondaryButtonUrl": "/Join us/join-us-online.html",
    "badge": "",
    "backgroundImage": "",
    "overlayOpacity": 50
  }'::jsonb, 1);

-- ============================================================================
-- HOME PAGE: Statistics
-- ============================================================================
select upsert_section('/', 'statistics', 'statistics', 'الإحصائيات',
  '{
    "heading": "أرقامنا",
    "description": "منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية",
    "stats": [
      {"id": "s1", "icon": "👥", "number": "500", "suffix": "+", "label": "مستفيد"},
      {"id": "s2", "icon": "🤝", "number": "120", "suffix": "+", "label": "متطوع"},
      {"id": "s3", "icon": "📅", "number": "12", "suffix": "+", "label": "سنة"}
    ]
  }'::jsonb, 2);

-- ============================================================================
-- HOME PAGE: About
-- ============================================================================
select upsert_section('/', 'about', 'text_block', 'من نحن',
  '{
    "heading": "نبني اليوم غدا أكثر إشراقا للأجيال القادمة",
    "subheading": "من نحن",
    "body": "تأسست الجمعية المغربية لهواة البحث والاستكشاف سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.\n\nنؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة.",
    "buttonText": "تعرف على برامجنا",
    "buttonUrl": "/activities",
    "image": "https://images.unsplash.com/photo-1593113630400-ea4288922497"
  }'::jsonb, 3);

-- ============================================================================
-- HOME PAGE: Features
-- ============================================================================
select upsert_section('/', 'features', 'card_group', 'المميزات',
  '{
    "heading": "ما يميز عملنا",
    "subheading": "لماذا الجمعية المغربية لهواة البحث والاستكشاف",
    "cards": [
      {"id": "f1", "icon": "📚", "title": "برامج تعليمية", "description": "دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.", "link": ""},
      {"id": "f2", "icon": "🏥", "title": "رعاية صحية", "description": "قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.", "link": ""},
      {"id": "f3", "icon": "💼", "title": "تمكين اقتصادي", "description": "تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب.", "link": ""},
      {"id": "f4", "icon": "🔍", "title": "شفافية كاملة", "description": "تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء.", "link": ""}
    ]
  }'::jsonb, 4);

-- ============================================================================
-- HOME PAGE: Activities
-- ============================================================================
select upsert_section('/', 'activities', 'card_group', 'الأنشطة',
  '{
    "heading": "أنشطتنا",
    "subheading": "اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.",
    "cards": [
      {"id": "a1", "icon": "🥾", "title": "خرجات", "description": "رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.", "link": "/trips", "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"},
      {"id": "a2", "icon": "🏆", "title": "مسابقات وراليات", "description": "تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.", "link": "/competitions-trips", "image": "https://www.kechpresse.com/wp-content/uploads/2022/01/marathon-des-sables-2022-kechpresse.jpg"},
      {"id": "a3", "icon": "📖", "title": "تكوينات", "description": "دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.", "link": "/trainings", "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655"},
      {"id": "a4", "icon": "🎨", "title": "معارض", "description": "معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.", "link": "/exhibitions", "image": ""},
      {"id": "a5", "icon": "🤝", "title": "لقاءات", "description": "لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.", "link": "/meetings", "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87"},
      {"id": "a6", "icon": "🌿", "title": "حملات بيئية", "description": "حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.", "link": "/environmental-campaigns", "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"}
    ]
  }'::jsonb, 5);

-- ============================================================================
-- HOME PAGE: Partners
-- ============================================================================
select upsert_section('/', 'partners', 'partners', 'الشركاء',
  '{
    "heading": "شركاؤنا",
    "partners": []
  }'::jsonb, 6);

-- ============================================================================
-- HOME PAGE: CTA
-- ============================================================================
select upsert_section('/', 'cta', 'cta', 'دعوة للإجراء',
  '{
    "heading": "ادعم رسالتنا بمنتجات حصرية",
    "description": "اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.",
    "buttonText": "تسوق الآن",
    "buttonUrl": "/store",
    "image": "Amare files /amare-shop.png"
  }'::jsonb, 7);

-- ============================================================================
-- HOME PAGE: News
-- ============================================================================
select upsert_section('/', 'news', 'news', 'آخر الأخبار',
  '{
    "heading": "أخبار وفعاليات الجمعية",
    "subheading": "آخر المستجدات",
    "postsCount": 3
  }'::jsonb, 8);
