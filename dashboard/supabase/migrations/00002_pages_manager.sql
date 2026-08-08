-- ============================================================================
-- Amare Pages Manager — Extended CMS Schema
-- Paste after 00001_cms_schema.sql
-- ============================================================================

-- ============================================================================
-- EXTEND PAGES TABLE — Add missing columns
-- ============================================================================
alter table pages
  add column if not exists nav_title text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists canonical_url text;

create index if not exists idx_pages_featured on pages (is_featured) where is_featured = true;

-- ============================================================================
-- 1. PAGE CONTENT — Editable text/content blocks per page
-- ============================================================================
create table if not exists page_content (
  id            uuid primary key default uuid_generate_v4(),
  page_id       uuid not null references pages(id) on delete cascade,
  content_key   text not null,
  content_type  text not null default 'text'
                check (content_type in ('text', 'richtext', 'markdown', 'html', 'json')),
  label         text,
  value         text,
  json_value    jsonb,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(page_id, content_key)
);

create index if not exists idx_page_content_page_id on page_content (page_id);
create index if not exists idx_page_content_key   on page_content (page_id, content_key);
create index if not exists idx_page_content_sort  on page_content (page_id, sort_order);

drop trigger if exists trg_page_content_updated_at on page_content;
create trigger trg_page_content_updated_at
  before update on page_content
  for each row execute function set_updated_at();

-- ============================================================================
-- 2. PAGE IMAGES — Replaceable images per page
-- ============================================================================
create table if not exists page_images (
  id            uuid primary key default uuid_generate_v4(),
  page_id       uuid not null references pages(id) on delete cascade,
  image_key     text not null,
  label         text,
  url           text,
  alt_text      text,
  width         int,
  height        int,
  file_size     bigint,
  mime_type     text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(page_id, image_key)
);

create index if not exists idx_page_images_page_id on page_images (page_id);
create index if not exists idx_page_images_key    on page_images (page_id, image_key);

drop trigger if exists trg_page_images_updated_at on page_images;
create trigger trg_page_images_updated_at
  before update on page_images
  for each row execute function set_updated_at();

-- ============================================================================
-- 3. PAGE VERSIONS — Rollback support
-- ============================================================================
create table if not exists page_versions (
  id            uuid primary key default uuid_generate_v4(),
  page_id       uuid not null references pages(id) on delete cascade,
  version       int not null,
  snapshot      jsonb not null,
  message       text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_versions_page_id      on page_versions (page_id);
create index if not exists idx_versions_page_version  on page_versions (page_id, version desc);
create index if not exists idx_versions_snapshot_gin  on page_versions using gin (snapshot jsonb_path_ops);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Get next version number for a page
create or replace function get_next_version(page_uuid uuid)
returns int as $$
declare
  v int;
begin
  select coalesce(max(version), 0) + 1
  into v
  from page_versions
  where page_id = page_uuid;
  return v;
end;
$$ language plpgsql stable;

-- Gather full page snapshot
create or replace function gather_page_snapshot(page_uuid uuid)
returns jsonb as $$
declare
  p_data jsonb;
  s_data jsonb;
  c_data jsonb;
  i_data jsonb;
begin
  select row_to_json(p.*)::jsonb into p_data
  from pages p where p.id = page_uuid;

  select coalesce(jsonb_agg(row_to_json(s.*) order by s.sort_order), '[]'::jsonb)
  into s_data
  from page_sections s where s.page_id = page_uuid;

  select coalesce(jsonb_agg(row_to_json(c.*) order by c.sort_order), '[]'::jsonb)
  into c_data
  from page_content c where c.page_id = page_uuid;

  select coalesce(jsonb_agg(row_to_json(i.*) order by i.sort_order), '[]'::jsonb)
  into i_data
  from page_images i where i.page_id = page_uuid;

  return jsonb_build_object(
    'page',     p_data,
    'sections', s_data,
    'content',  c_data,
    'images',   i_data,
    'snapshot_at', now()
  );
end;
$$ language plpgsql stable;

-- Auto-create version on page update
create or replace function auto_create_page_version()
returns trigger as $$
declare
  v_user_id uuid;
  v_snap jsonb;
begin
  v_user_id := auth.uid();
  v_snap := gather_page_snapshot(new.id);

  insert into page_versions (page_id, version, snapshot, message, created_by)
  values (
    new.id,
    get_next_version(new.id),
    v_snap,
    'تحديث تلقائي — ' || coalesce(new.title, old.title),
    v_user_id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_pages_auto_version on pages;
create trigger trg_pages_auto_version
  after update on pages
  for each row execute function auto_create_page_version();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table page_content  enable row level security;
alter table page_images   enable row level security;
alter table page_versions enable row level security;

-- ── PAGE CONTENT RLS ─────────────────────────────────────────────────────────

drop policy if exists "Admins full access on page_content" on page_content;
drop policy if exists "Editors can manage page_content" on page_content;
drop policy if exists "Public can read page_content" on page_content;

create policy "Admins full access on page_content"
  on page_content for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can manage page_content"
  on page_content for all
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Public can read page_content"
  on page_content for select
  using (
    exists (
      select 1 from pages
      where pages.id = page_content.page_id
      and pages.status = 'published'
    )
  );

drop policy if exists "Admins full access on page_images" on page_images;
drop policy if exists "Editors can manage page_images" on page_images;
drop policy if exists "Public can read page_images" on page_images;

create policy "Admins full access on page_images"
  on page_images for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can manage page_images"
  on page_images for all
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Public can read page_images"
  on page_images for select
  using (
    exists (
      select 1 from pages
      where pages.id = page_images.page_id
      and pages.status = 'published'
    )
  );

drop policy if exists "Admins full access on page_versions" on page_versions;
drop policy if exists "Editors can read page_versions" on page_versions;
drop policy if exists "Editors can insert page_versions" on page_versions;

create policy "Admins full access on page_versions"
  on page_versions for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can read page_versions"
  on page_versions for select
  to authenticated
  using (user_has_role('editor'));

create policy "Editors can insert page_versions"
  on page_versions for insert
  to authenticated
  with check (user_has_role('editor'));

-- ============================================================================
-- REALTIME (requires supabase_realtime publication)
-- ============================================================================
do $$
begin
  alter publication supabase_realtime add table pages;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table page_sections;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table page_content;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table page_images;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table page_versions;
exception when others then null;
end $$;

-- ============================================================================
-- SEED DATA — Seed ALL website pages from the static site
-- ============================================================================
insert into pages (title, slug, template, status, sort_order, nav_title) values
  ('الرئيسية',                  '/',                      'home',       'published', 1,  'الرئيسية'),
  ('من نحن',                    '/about',                 'page',       'published', 2,  'من نحن'),
  ('الرؤية الوطنية',           '/national-vision',       'page',       'published', 3,  'الرؤية الوطنية'),
  ('الرسالة',                   '/mission',               'page',       'published', 4,  'الرسالة'),
  ('القيم',                     '/values',                'page',       'published', 5,  'القيم'),
  ('المكتب المركزي',           '/central-office',        'page',       'published', 6,  'المكتب المركزي'),
  ('خارطة التوسع',             '/expansion-map',         'page',       'published', 7,  'خارطة التوسع'),
  ('خدماتنا',                   '/services',              'services',   'published', 8,  'خدماتنا'),
  ('أنشطتنا',                   '/activities',            'activities', 'published', 9,  'أنشطتنا'),
  ('خرجات',                     '/trips',                 'page',       'published', 10, 'خرجات'),
  ('مسابقات ورحلات',           '/competitions-trips',    'page',       'published', 11, 'مسابقات ورحلات'),
  ('تكوينات',                   '/trainings',             'page',       'published', 12, 'تكوينات'),
  ('معارض',                     '/exhibitions',           'page',       'published', 13, 'معارض'),
  ('لقاءات',                    '/meetings',              'page',       'published', 14, 'لقاءات'),
  ('حملات بيئية',              '/environmental-campaigns','page',       'published', 15, 'حملات بيئية'),
  ('شركاؤنا',                   '/partners',              'page',       'published', 16, 'شركاؤنا'),
  ('الفروع الجهوية',           '/regional-branches',     'branches',   'published', 17, 'الفروع الجهوية'),
  ('الجهات الإثنا عشر',        '/twelve-regions',        'page',       'published', 18, 'الجهات الإثنا عشر'),
  ('الأخبار',                   '/news',                  'news',       'published', 19, 'الأخبار'),
  ('الأرشيف',                   '/archive',               'archive',    'published', 20, 'الأرشيف'),
  ('المستجدات',                 '/updates',               'updates',    'published', 21, 'المستجدات'),
  ('متجر الجمعية',             '/store',                 'store',      'published', 22, 'متجر الجمعية'),
  ('SOS AMARE',                 '/sos',                   'page',       'published', 23, 'SOS AMARE'),
  ('بيت المستكشف',             '/explorer-house',        'page',       'published', 24, 'بيت المستكشف'),
  ('أكاديمية AMARE',           '/amare-academy',         'page',       'published', 25, 'أكاديمية AMARE'),
  ('مجلة AMARE',               '/amare-magazine',        'page',       'published', 26, 'مجلة AMARE'),
  ('النوادي',                   '/clubs',                 'page',       'published', 27, 'النوادي'),
  ('المستشار القانوني',        '/legal-advisor',         'page',       'published', 28, 'المستشار القانوني'),
  ('عقد التأمين',              '/insurance',             'page',       'published', 29, 'عقد التأمين'),
  ('اتصل بنا',                  '/contact',               'contact',    'published', 30, 'اتصل بنا'),
  ('التسجيل',                   '/register',              'auth',       'published', 31, 'التسجيل'),
  ('تسجيل الدخول',             '/login',                 'auth',       'published', 32, 'تسجيل الدخول')
on conflict (slug) do update
  set title = excluded.title,
      template = excluded.template,
      sort_order = excluded.sort_order,
      nav_title = excluded.nav_title;

-- Create default hero sections for all seeded pages
do $$
declare
  p record;
begin
  for p in select id, title from pages where not exists (select 1 from page_sections where page_id = pages.id) loop
    insert into page_sections (page_id, section_type, section_key, title, visible, sort_order)
    values (p.id, 'hero', 'hero', p.title, true, 1);
  end loop;
end;
$$;
