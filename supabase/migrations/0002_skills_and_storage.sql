-- Folio F-05: the skill list (D-026, D-063) and the project image bucket (D-065).
--
-- Run this file once, top to bottom, in the Supabase SQL editor, after 0001.
-- It is written to be safe to re-run: every object is created conditionally or
-- replaced, so a second run changes nothing and raises nothing.
--
-- What is NOT here: the skill rows themselves. They live in
-- `supabase/seed/skills.sql`, which the owner runs separately (D-063).

-- ---------------------------------------------------------------------------
-- skills: one canonical row per skill, referenced by slug from content documents.
-- ---------------------------------------------------------------------------

create table if not exists public.skills (
  slug text primary key,
  name text not null,
  constraint skills_slug_format check (slug ~ '^[a-z0-9-]{1,40}$'),
  constraint skills_name_not_blank check (btrim(name) <> '')
);

comment on table public.skills is
  'Canonical skill list (D-026). Public read, no client writes. Slug matches the F-02 slug format.';

-- ---------------------------------------------------------------------------
-- skill_aliases: "ReactJS" and "react.js" both resolve to `react` (D-064).
-- ---------------------------------------------------------------------------

create table if not exists public.skill_aliases (
  alias text primary key,
  skill_slug text not null references public.skills (slug) on delete cascade,
  constraint skill_aliases_alias_format check (alias ~ '^[a-z0-9._-]{1,60}$'),
  constraint skill_aliases_alias_lowercase check (alias = lower(alias))
);

comment on table public.skill_aliases is
  'Lowercase aliases that resolve to one canonical skill slug (D-026, D-064).';

create index if not exists skill_aliases_skill_slug_idx
  on public.skill_aliases (skill_slug);

-- An alias must never equal a skill slug: otherwise a search for that word could
-- mean two different rows, and the picker could show the same skill twice.
--
-- A check constraint cannot read another table, so this is a trigger. Both
-- directions are covered: adding an alias that matches an existing slug, and
-- adding a skill whose slug matches an existing alias.
create or replace function public.reject_alias_that_is_a_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.skills where slug = new.alias) then
    raise exception 'alias "%" is also a skill slug', new.alias
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists skill_aliases_alias_not_a_slug on public.skill_aliases;

create trigger skill_aliases_alias_not_a_slug
  before insert or update on public.skill_aliases
  for each row execute function public.reject_alias_that_is_a_slug();

create or replace function public.reject_slug_that_is_an_alias()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.skill_aliases where alias = new.slug) then
    raise exception 'slug "%" is also a skill alias', new.slug
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists skills_slug_not_an_alias on public.skills;

create trigger skills_slug_not_an_alias
  before insert or update on public.skills
  for each row execute function public.reject_slug_that_is_an_alias();

-- ---------------------------------------------------------------------------
-- Row-level security for the two skill tables (D-063)
--
-- Read: everyone, signed in or not. Write: nobody through the API. There is no
-- insert, update or delete policy, so RLS refuses those verbs for every client
-- role. The seed file is run in the SQL editor as the owner, which bypasses RLS.
-- ---------------------------------------------------------------------------

alter table public.skills enable row level security;
alter table public.skill_aliases enable row level security;

drop policy if exists skills_select_public on public.skills;
create policy skills_select_public
  on public.skills
  for select
  to anon, authenticated
  using (true);

drop policy if exists skill_aliases_select_public on public.skill_aliases;
create policy skill_aliases_select_public
  on public.skill_aliases
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for project images (D-065, D-025)
--
-- Public read, 2 MB, JPEG / PNG / WebP. The bucket limits are the real guard:
-- the browser checks first only so the owner gets a fast, clear message (AC-10).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Write policies: a signed-in user may only touch objects under their own
-- `<user_id>/` folder. `storage.foldername(name)` splits the object path, so
-- element 1 is the first folder. Anonymous has no write policy at all.
--
-- There is no select policy here: the bucket is public, so the object URL works
-- without one (D-039, D-065).

drop policy if exists project_images_insert_own_folder on storage.objects;
create policy project_images_insert_own_folder
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists project_images_update_own_folder on storage.objects;
create policy project_images_update_own_folder
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists project_images_delete_own_folder on storage.objects;
create policy project_images_delete_own_folder
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
