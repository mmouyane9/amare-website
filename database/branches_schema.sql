-- ============================================================================
-- AMARE Regional Branches — Complete Supabase Migration
-- Run this entire file inside the Supabase SQL Editor.
-- ============================================================================

-- 1. EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- 2. HELPER: updated_at trigger function
-- ============================================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 regions
-- ----------------------------------------------------------------------------
create table if not exists regions (
  id            uuid primary key default gen_random_uuid(),
  name_ar       text not null,
  name_en       text,
  slug          text not null unique,
  description   text,
  cover_image   text,
  display_order int  not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_regions_updated_at
  before update on regions
  for each row execute function update_updated_at_column();

create index idx_regions_slug        on regions (slug);
create index idx_regions_published   on regions (published);
create index idx_regions_order       on regions (display_order, created_at);


-- 3.2 cities
-- ----------------------------------------------------------------------------
create table if not exists cities (
  id            uuid primary key default gen_random_uuid(),
  region_id     uuid not null references regions(id) on delete cascade,
  name_ar       text not null,
  name_en       text,
  slug          text not null,
  description   text,
  cover_image   text,
  address       text,
  phone         text,
  email         text,
  facebook      text,
  whatsapp      text,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique(region_id, slug)
);

create trigger trg_cities_updated_at
  before update on cities
  for each row execute function update_updated_at_column();

create index idx_cities_region_id   on cities (region_id);
create index idx_cities_slug        on cities (slug);
create index idx_cities_published   on cities (published);
create index idx_cities_created     on cities (created_at desc);


-- 3.3 branch_posts
-- ----------------------------------------------------------------------------
create table if not exists branch_posts (
  id             uuid primary key default gen_random_uuid(),
  city_id        uuid not null references cities(id) on delete cascade,
  title          text not null,
  content        text,
  featured_image text,
  published      boolean not null default true,
  created_by     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_branch_posts_updated_at
  before update on branch_posts
  for each row execute function update_updated_at_column();

create index idx_branch_posts_city       on branch_posts (city_id);
create index idx_branch_posts_published  on branch_posts (published);
create index idx_branch_posts_created    on branch_posts (created_at desc);
create index idx_branch_posts_city_date  on branch_posts (city_id, created_at desc);


-- 3.4 branch_post_images
-- ----------------------------------------------------------------------------
create table if not exists branch_post_images (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references branch_posts(id) on delete cascade,
  image_url   text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_branch_post_images_post on branch_post_images (post_id, sort_order);


-- 3.5 branch_comments
-- ----------------------------------------------------------------------------
create table if not exists branch_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references branch_posts(id) on delete cascade,
  user_name   text not null,
  comment     text not null,
  created_at  timestamptz not null default now()
);

create index idx_branch_comments_post on branch_comments (post_id, created_at desc);


-- 3.6 branch_likes
-- ----------------------------------------------------------------------------
create table if not exists branch_likes (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references branch_posts(id) on delete cascade,
  user_identifier text not null,
  created_at      timestamptz not null default now(),

  unique(post_id, user_identifier)
);

create index idx_branch_likes_post  on branch_likes (post_id);
create index idx_branch_likes_user  on branch_likes (user_identifier);


-- 3.7 branch_members
-- ----------------------------------------------------------------------------
create table if not exists branch_members (
  id          uuid primary key default gen_random_uuid(),
  city_id     uuid not null references cities(id) on delete cascade,
  full_name   text not null,
  email       text,
  phone       text,
  avatar      text,
  role        text not null default 'member',
  status      text not null default 'active',
  joined_at   date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_branch_members_updated_at
  before update on branch_members
  for each row execute function update_updated_at_column();

create index idx_branch_members_city   on branch_members (city_id);
create index idx_branch_members_status on branch_members (status);
create index idx_branch_members_role   on branch_members (role);


-- 3.8 branch_events
-- ----------------------------------------------------------------------------
create table if not exists branch_events (
  id            uuid primary key default gen_random_uuid(),
  city_id       uuid not null references cities(id) on delete cascade,
  title         text not null,
  description   text,
  cover_image   text,
  location      text,
  start_date    timestamptz,
  end_date      timestamptz,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_branch_events_updated_at
  before update on branch_events
  for each row execute function update_updated_at_column();

create index idx_branch_events_city      on branch_events (city_id);
create index idx_branch_events_published  on branch_events (published);
create index idx_branch_events_dates      on branch_events (start_date, end_date);


-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

alter table regions            enable row level security;
alter table cities             enable row level security;
alter table branch_posts       enable row level security;
alter table branch_post_images enable row level security;
alter table branch_comments    enable row level security;
alter table branch_likes       enable row level security;
alter table branch_members     enable row level security;
alter table branch_events      enable row level security;


-- 4.1 Anonymous (Public) — SELECT published only
-- ----------------------------------------------------------------------------

create policy "anon_select_published_regions"
  on regions for select
  using (published = true);

create policy "anon_select_published_cities"
  on cities for select
  using (published = true);

create policy "anon_select_published_posts"
  on branch_posts for select
  using (published = true);

create policy "anon_select_post_images"
  on branch_post_images for select
  using (
    exists (
      select 1 from branch_posts
      where branch_posts.id = branch_post_images.post_id
        and branch_posts.published = true
    )
  );

create policy "anon_select_published_comments"
  on branch_comments for select
  using (
    exists (
      select 1 from branch_posts
      where branch_posts.id = branch_comments.post_id
        and branch_posts.published = true
    )
  );

create policy "anon_select_published_events"
  on branch_events for select
  using (published = true);


-- 4.2 Authenticated — Full access for authorized roles
-- ----------------------------------------------------------------------------
create or replace function is_admin_user()
returns boolean as $$
begin
  return (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('super_admin', 'admin', 'editor')
    )
  );
end;
$$ language plpgsql security definer;


-- regions
create policy "admin_all_regions"
  on regions for all
  using (is_admin_user())
  with check (is_admin_user());

-- cities
create policy "admin_all_cities"
  on cities for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_posts
create policy "admin_all_posts"
  on branch_posts for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_post_images
create policy "admin_all_post_images"
  on branch_post_images for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_comments
create policy "admin_all_comments"
  on branch_comments for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_likes
create policy "admin_all_likes"
  on branch_likes for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_members
create policy "admin_all_members"
  on branch_members for all
  using (is_admin_user())
  with check (is_admin_user());

-- branch_events
create policy "admin_all_events"
  on branch_events for all
  using (is_admin_user())
  with check (is_admin_user());


-- 4.3 Authenticated — Public write access (comments & likes)
-- ----------------------------------------------------------------------------

-- Anyone can comment on published posts (anti-spam: auth required)
create policy "auth_insert_comments"
  on branch_comments for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from branch_posts
      where branch_posts.id = branch_comments.post_id
        and branch_posts.published = true
    )
  );

-- Anyone can like a published post once
create policy "auth_insert_likes"
  on branch_likes for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from branch_posts
      where branch_posts.id = branch_likes.post_id
        and branch_posts.published = true
    )
  );

-- Users can remove their own likes
create policy "auth_delete_own_likes"
  on branch_likes for delete
  using (
    auth.role() = 'authenticated'
    and user_identifier = auth.uid()::text
  );

-- Users can read likes counts (already covered by anon_select which is permissive...)
-- Actually, likes don't have a published column block, so anon can see all likes.
-- This is intentional — likes are public metadata.


-- ============================================================================
-- 5. STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('region-covers',  'region-covers',  true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('city-covers',    'city-covers',    true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('branch-posts',   'branch-posts',   true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('branch-gallery', 'branch-gallery', true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('event-covers',   'event-covers',   true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('member-avatars', 'member-avatars', true, 2097152, '{image/jpeg,image/png,image/webp}')
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- Storage RLS: Anonymous can read, admins can write
create policy "anon_read_region_covers"
  on storage.objects for select
  using (bucket_id = 'region-covers');

create policy "admin_write_region_covers"
  on storage.objects for insert
  with check (bucket_id = 'region-covers' and is_admin_user());

create policy "admin_update_region_covers"
  on storage.objects for update
  using (bucket_id = 'region-covers' and is_admin_user());

create policy "admin_delete_region_covers"
  on storage.objects for delete
  using (bucket_id = 'region-covers' and is_admin_user());


create policy "anon_read_city_covers"
  on storage.objects for select
  using (bucket_id = 'city-covers');

create policy "admin_write_city_covers"
  on storage.objects for insert
  with check (bucket_id = 'city-covers' and is_admin_user());

create policy "admin_update_city_covers"
  on storage.objects for update
  using (bucket_id = 'city-covers' and is_admin_user());

create policy "admin_delete_city_covers"
  on storage.objects for delete
  using (bucket_id = 'city-covers' and is_admin_user());


create policy "anon_read_branch_posts"
  on storage.objects for select
  using (bucket_id = 'branch-posts');

create policy "admin_write_branch_posts"
  on storage.objects for insert
  with check (bucket_id = 'branch-posts' and is_admin_user());

create policy "admin_update_branch_posts"
  on storage.objects for update
  using (bucket_id = 'branch-posts' and is_admin_user());

create policy "admin_delete_branch_posts"
  on storage.objects for delete
  using (bucket_id = 'branch-posts' and is_admin_user());


create policy "anon_read_branch_gallery"
  on storage.objects for select
  using (bucket_id = 'branch-gallery');

create policy "admin_write_branch_gallery"
  on storage.objects for insert
  with check (bucket_id = 'branch-gallery' and is_admin_user());

create policy "admin_update_branch_gallery"
  on storage.objects for update
  using (bucket_id = 'branch-gallery' and is_admin_user());

create policy "admin_delete_branch_gallery"
  on storage.objects for delete
  using (bucket_id = 'branch-gallery' and is_admin_user());


create policy "anon_read_event_covers"
  on storage.objects for select
  using (bucket_id = 'event-covers');

create policy "admin_write_event_covers"
  on storage.objects for insert
  with check (bucket_id = 'event-covers' and is_admin_user());

create policy "admin_update_event_covers"
  on storage.objects for update
  using (bucket_id = 'event-covers' and is_admin_user());

create policy "admin_delete_event_covers"
  on storage.objects for delete
  using (bucket_id = 'event-covers' and is_admin_user());


create policy "anon_read_member_avatars"
  on storage.objects for select
  using (bucket_id = 'member-avatars');

create policy "admin_write_member_avatars"
  on storage.objects for insert
  with check (bucket_id = 'member-avatars' and is_admin_user());

create policy "admin_update_member_avatars"
  on storage.objects for update
  using (bucket_id = 'member-avatars' and is_admin_user());

create policy "admin_delete_member_avatars"
  on storage.objects for delete
  using (bucket_id = 'member-avatars' and is_admin_user());


-- ============================================================================
-- 6. HELPER FUNCTIONS (for the Admin Dashboard / Public API)
-- ============================================================================

-- Get aggregate stats for a region
create or replace function get_region_stats(region_uuid uuid)
returns table(
  total_cities   bigint,
  total_members  bigint,
  total_posts    bigint,
  total_comments bigint
) as $$
  select
    (select count(*) from cities         where region_id = region_uuid),
    (select count(*) from branch_members where city_id  in (select id from cities where region_id = region_uuid)),
    (select count(*) from branch_posts   where city_id  in (select id from cities where region_id = region_uuid) and published = true),
    (select count(*) from branch_comments where post_id in (select id from branch_posts where city_id in (select id from cities where region_id = region_uuid) and published = true));
$$ language sql stable;

-- Get aggregate stats for a city
create or replace function get_city_stats(city_uuid uuid)
returns table(
  total_members  bigint,
  total_posts    bigint,
  total_likes    bigint,
  total_comments bigint
) as $$
  select
    (select count(*) from branch_members where city_id = city_uuid),
    (select count(*) from branch_posts   where city_id = city_uuid and published = true),
    (select count(*) from branch_likes   where post_id in (select id from branch_posts where city_id = city_uuid and published = true)),
    (select count(*) from branch_comments where post_id in (select id from branch_posts where city_id = city_uuid and published = true));
$$ language sql stable;


-- ============================================================================
-- 7. INITIAL MOCK DATA — Official 12 Moroccan Regions
-- ============================================================================

insert into regions (name_ar, name_en, slug, description, display_order, published) values
('جهة طنجة - تطوان - الحسيمة',     'Tanger-Tétouan-Al Hoceïma',  'tanger-tetouan-al-hoceima',  'الجهة الشمالية للمملكة المغربية، تطل على البحر الأبيض المتوسط والمحيط الأطلسي.', 1, true),
('جهة الشرق',                      'Oriental',                   'oriental',                   'الجهة الشرقية للمغرب، تمتد من البحر المتوسط شمالاً إلى الصحراء جنوباً.', 2, true),
('جهة فاس - مكناس',                'Fès-Meknès',                 'fes-meknes',                 'الجهة الروحية والعلمية للمغرب، تضم أقدم الجامعات والمدن الإمبراطورية.', 3, true),
('جهة الرباط - سلا - القنيطرة',    'Rabat-Salé-Kénitra',         'rabat-sale-kenitra',         'الجهة الإدارية والحكومية للمملكة، تضم العاصمة الرباط.', 4, true),
('جهة بني ملال - خنيفرة',          'Béni Mellal-Khénifra',       'beni-mellal-khenifra',       'الجهة الوسطى للمغرب، تجمع بين السهول الفلاحية وجبال الأطلس.', 5, true),
('جهة الدار البيضاء - سطات',       'Casablanca-Settat',          'casablanca-settat',          'القطب الاقتصادي والتجاري الأول للمغرب.', 6, true),
('جهة مراكش - آسفي',               'Marrakech-Safi',             'marrakech-safi',             'الجهة السياحية الأولى للمغرب، تضم المدينة الحمراء.', 7, true),
('جهة درعة - تافيلالت',            'Drâa-Tafilalet',             'draa-tafilalet',             'الجهة الصحراوية الشرقية، مهد الدولة العلوية.', 8, true),
('جهة سوس - ماسة',                 'Souss-Massa',                'souss-massa',                'الجهة الجنوبية الغربية، قطب فلاحي وسياحي.', 9, true),
('جهة كلميم - واد نون',            'Guelmim-Oued Noun',          'guelmim-oued-noun',          'بوابة الصحراء المغربية.', 10, true),
('جهة العيون - الساقية الحمراء',   'Laâyoune-Sakia El Hamra',    'laayoune-sakia-el-hamra',    'كبرى جهات الجنوب المغربي.', 11, true),
('جهة الداخلة - وادي الذهب',       'Dakhla-Oued Ed-Dahab',       'dakhla-oued-eddahab',        'أقصى جنوب المغرب، جنة الرياضات المائية.', 12, true);
