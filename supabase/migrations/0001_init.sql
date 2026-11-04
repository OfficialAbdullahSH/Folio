-- Folio F-01: profiles, draft portfolios, published snapshots, and row-level security.
--
-- Run this file once, top to bottom, in the Supabase SQL editor on a fresh project.
-- It creates three tables (D-053), one trigger on auth.users (D-054), one
-- username-availability function (D-059), and the row-level security policies
-- that keep drafts private.
--
-- The reserved-username list is NOT enforced here. It lives in the application,
-- in the F-02 profile schema (`src/schema/profile.schema.ts`), because it is a
-- product rule that changes with the product, not a database invariant (D-006).
-- The database enforces the username *format* and its uniqueness, which are
-- invariants no application bug can be allowed to break.

-- ---------------------------------------------------------------------------
-- profiles: one private row per auth user (D-022, D-053).
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  headline text not null default '',
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
  )
);

comment on constraint profiles_username_format on public.profiles is
  '3 to 30 characters: lowercase letters, digits and hyphens, no leading or trailing hyphen (D-032).';

-- Case-insensitive uniqueness is the real guard behind the signup pre-check (AC-2).
create unique index profiles_username_lower_key on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- portfolios: the owner's private draft. One row per user (D-007).
-- ---------------------------------------------------------------------------

create table public.portfolios (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  design jsonb not null,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- published_portfolios: the public snapshot. The only table the public can read.
-- ---------------------------------------------------------------------------

create table public.published_portfolios (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  username text not null,
  display_name text not null,
  headline text not null default '',
  design jsonb not null,
  content jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index published_portfolios_username_lower_key
  on public.published_portfolios (lower(username));

-- ---------------------------------------------------------------------------
-- Profile creation (D-054)
--
-- Runs inside the same transaction as the auth insert, so a user can never exist
-- without a profile. security definer with an empty search_path: the function runs
-- as its owner and cannot be redirected to another schema by a caller.
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, headline)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name',
    coalesce(new.raw_user_meta_data ->> 'headline', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Username availability (D-059)
--
-- RLS closes profiles to anonymous, so the signup form cannot select from the
-- table to ask "is this name free?". This function answers exactly that, with a
-- boolean and nothing else. It is the pre-check; the unique index above is the
-- real guard when two people race.
-- ---------------------------------------------------------------------------

create function public.is_username_available(candidate text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1
    from public.profiles as p
    where lower(p.username) = lower(btrim(candidate))
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security (D-053)
--
-- profiles             anonymous: nothing.  owner: select, update own row.
-- portfolios           anonymous: nothing.  owner: select, insert, update, delete own row.
-- published_portfolios anonymous: select all. owner: select all, write own row only.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.published_portfolios enable row level security;

-- profiles: the owner can read and change their own row, and only that one.

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- portfolios: the draft. No policy for anon means no access at all.

create policy portfolios_select_own
  on public.portfolios
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy portfolios_insert_own
  on public.portfolios
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy portfolios_update_own
  on public.portfolios
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy portfolios_delete_own
  on public.portfolios
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- published_portfolios: the public read path (D-011). Writing is limited to the
-- owner, so user A cannot publish a row under user B's id or username.

create policy published_portfolios_select_public
  on public.published_portfolios
  for select
  to anon, authenticated
  using (true);

create policy published_portfolios_insert_own
  on public.published_portfolios
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy published_portfolios_update_own
  on public.published_portfolios
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy published_portfolios_delete_own
  on public.published_portfolios
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
