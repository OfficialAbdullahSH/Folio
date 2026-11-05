# RLS checklist (F-01)

Run these in the Supabase SQL editor after `supabase/migrations/0001_init.sql`, with two real
accounts that were created through `/signup`. They prove the four cases AC-9 requires, plus the
availability function added by D-059.

The SQL editor connects as `postgres`, which bypasses row-level security. Every check below
therefore switches to the role being tested and sets the JWT claims that `auth.uid()` reads.
Without that switch, everything would appear to pass.

## Setup

1. Sign up twice through the app, as **user A** and **user B**.
2. In **Authentication → Users**, copy both user UUIDs.
3. Replace `<A_UUID>` and `<B_UUID>` below, and `<A_USERNAME>` / `<B_USERNAME>` with the
   usernames you chose.

Run this once, as `postgres`, to give the checks something to look at. It bypasses RLS, which is
the point: the rows have to exist before the checks can prove they are invisible.

```sql
-- Draft rows for both users (the dashboard normally creates these).
insert into public.portfolios (user_id, design, content)
values
  ('<A_UUID>', '{"seed": "a"}'::jsonb, '{"seed": "a"}'::jsonb),
  ('<B_UUID>', '{"seed": "b"}'::jsonb, '{"seed": "b"}'::jsonb)
on conflict (user_id) do nothing;

-- One published row, owned by user B.
insert into public.published_portfolios (user_id, username, display_name, design, content)
values ('<B_UUID>', '<B_USERNAME>', 'User B', '{"seed": "b"}'::jsonb, '{"seed": "b"}'::jsonb)
on conflict (user_id) do nothing;
```

## How to impersonate

Every check uses this shape. `set local` needs a transaction, hence `begin` / `rollback`.

```sql
begin;
set local request.jwt.claims = '{"sub": "<A_UUID>", "role": "authenticated"}';
set local role authenticated;          -- or: set local role anon;
-- ... the statement being checked ...
rollback;
```

For an anonymous check, omit the claims and use `set local role anon;`.

## Checks

| # | Case | SQL (inside the `begin` / `set local` block) | Expected |
| --- | --- | --- | --- |
| 1 | Anonymous cannot read `profiles` | `select count(*) from public.profiles;` | `0` |
| 2 | Anonymous cannot read `portfolios` | `select count(*) from public.portfolios;` | `0` |
| 3 | Anonymous can read `published_portfolios` | `select count(*) from public.published_portfolios;` | `1` (user B's row) |
| 4 | User A reads only their own profile | `select username from public.profiles;` | exactly one row, `<A_USERNAME>` |
| 5 | User A cannot read user B's profile | `select count(*) from public.profiles where id = '<B_UUID>';` | `0` |
| 6 | User A cannot update user B's profile | `update public.profiles set display_name = 'hacked' where id = '<B_UUID>';` | `UPDATE 0` (no error) |
| 7 | User A cannot delete user B's profile | `delete from public.profiles where id = '<B_UUID>';` | `DELETE 0` |
| 8 | User A reads only their own draft | `select user_id from public.portfolios;` | exactly one row, `<A_UUID>` |
| 9 | User A cannot update user B's draft | `update public.portfolios set design = '{"x":1}'::jsonb where user_id = '<B_UUID>';` | `UPDATE 0` |
| 10 | User A cannot delete user B's draft | `delete from public.portfolios where user_id = '<B_UUID>';` | `DELETE 0` |
| 11 | User A cannot insert a published row owned by user B | `insert into public.published_portfolios (user_id, username, display_name, design, content) values ('<B_UUID>', 'stolen-name', 'Stolen', '{}'::jsonb, '{}'::jsonb);` | `ERROR 42501: new row violates row-level security policy for table "published_portfolios"` |
| 12 | User A cannot update user B's published row | `update public.published_portfolios set display_name = 'hacked' where user_id = '<B_UUID>';` | `UPDATE 0` |
| 13 | User A cannot delete user B's published row | `delete from public.published_portfolios where user_id = '<B_UUID>';` | `DELETE 0` |
| 14 | Anonymous can call the availability function | `select public.is_username_available('<B_USERNAME>');` | `false` (the name is taken) |
| 15 | Anonymous can call it for a free name | `select public.is_username_available('free-name-for-check');` | `true` |
| 16 | It returns a boolean and nothing else | `select pg_get_function_result('public.is_username_available(text)');` | `boolean` |
| 17 | Anonymous still cannot read `profiles` after calling it | `select count(*) from public.profiles;` | `0` (same as check 1) |
| 18 | Execute is granted to `anon` and `authenticated`, not to `PUBLIC` | `select proacl from pg_proc where proname = 'is_username_available' and pronamespace = 'public'::regnamespace;` (run as `postgres`) | an ACL containing `anon=X/...` and `authenticated=X/...`, and **no** `=X/...` entry for `PUBLIC` |

## Cleanup

```sql
delete from public.published_portfolios where user_id in ('<A_UUID>', '<B_UUID>');
delete from public.portfolios where user_id in ('<A_UUID>', '<B_UUID>');
```

## What each check proves

- Checks 1–3: the draft tables are invisible to the public, and the published snapshot is the only
  public read path (D-053, D-011).
- Checks 4–13: a signed-in user can reach their own rows and cannot read, change or remove another
  user's rows in any of the three tables.
- Check 11: a user cannot publish under another user's identity, which is what stops someone
  taking over a personal link.
- Checks 14–18: the signup pre-check works for an anonymous visitor without opening `profiles` to
  anonymous reads (D-059).

---

# RLS checklist (F-05): skills and project images

Run these after `supabase/migrations/0002_skills_and_storage.sql` and
`supabase/seed/skills.sql`. Checks 19 to 26 are SQL and run in the SQL editor. Checks 27 to 30
are done through the app, because the bucket's size and type limits are enforced by the Storage
API, not by a database policy — a direct `insert into storage.objects` would not prove them.

Same impersonation block as above:

```sql
begin;
set local request.jwt.claims = '{"sub": "<A_UUID>", "role": "authenticated"}';
set local role authenticated;          -- or: set local role anon;
-- ... the statement being checked ...
rollback;
```

## Checks

| # | Case | How | Expected |
| --- | --- | --- | --- |
| 19 | Anonymous can read `skills` | `begin; set local role anon; select count(*) from public.skills; rollback;` | at least `80` |
| 20 | Anonymous can read `skill_aliases` | `begin; set local role anon; select count(*) from public.skill_aliases; rollback;` | more than `0`, and `select * from public.skill_aliases where alias = 'reactjs';` returns `react` |
| 21 | Anonymous cannot insert a skill | `begin; set local role anon; insert into public.skills (slug, name) values ('test-skill', 'Test'); rollback;` | `ERROR 42501: new row violates row-level security policy for table "skills"` |
| 22 | An authenticated user cannot insert, update or delete a skill | same three statements under `set local role authenticated` with A's claims: `insert`, `update public.skills set name = 'x' where slug = 'react';`, `delete from public.skills where slug = 'react';` | all three: `ERROR 42501` (no policy grants the verb) |
| 23 | Neither role can write an alias | same three statements against `public.skill_aliases` under both `anon` and `authenticated` | all six: `ERROR 42501` |
| 24 | An alias cannot equal a skill slug | run as `postgres` (bypasses RLS): `insert into public.skill_aliases (alias, skill_slug) values ('react', 'react');` | `ERROR 23514: alias "react" is also a skill slug` |
| 25 | A skill slug cannot equal an alias | run as `postgres`: `insert into public.skills (slug, name) values ('reactjs', 'ReactJS');` | `ERROR 23514: slug "reactjs" is also a skill alias` |
| 26 | The bucket exists with the D-025 limits | `select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'project-images';` | one row: `public = true`, `file_size_limit = 2097152`, types `image/jpeg, image/png, image/webp` |
| 27 | A signed-in user can upload into their own folder | In the app, open `/dashboard/edit`, add a project, and upload a JPEG under 2 MB | the upload succeeds, the preview shows the image, and `select name from storage.objects where bucket_id = 'project-images' and name like '<A_UUID>/%';` returns the object |
| 28 | A signed-in user cannot write into another user's folder | `begin; set local request.jwt.claims = '{"sub": "<A_UUID>", "role": "authenticated"}'; set local role authenticated; insert into storage.objects (bucket_id, name, owner) values ('project-images', '<B_UUID>/stolen.png', '<A_UUID>'); rollback;` | `ERROR 42501: new row violates row-level security policy for table "objects"` |
| 29 | A signed-in user can write into their own folder | same block with `<A_UUID>/own.png` | `INSERT 0 1`; `rollback` removes the row again |
| 30 | An anonymous user cannot write at all | `begin; set local role anon; insert into storage.objects (bucket_id, name) values ('project-images', '<A_UUID>/anon.png'); rollback;` | `ERROR 42501: new row violates row-level security policy for table "objects"` |
| 31 | An upload over 2 MB, or of the wrong type, is refused | In the app, try a 3 MB JPEG and then a GIF | both refused with a clear message; a direct Storage API upload returns `Payload too large` / `mime type ... is not supported` |

## What each check proves

- Checks 19–20: the picker and the F-09 search can read the list without an account, which is the
  only reason the tables are public (D-063).
- Checks 21–23: the list is data, not a workspace. No client role can change it, so one user cannot
  rename a skill for everybody.
- Checks 24–25: an alias and a slug can never collide, so one word never resolves to two skills.
- Check 26: the bucket limits from D-025 are real, not only checked in the browser.
- Checks 27–30: a user writes only inside their own folder and anonymous cannot write at all.
- Check 31: the size and type limits hold at the Storage API, which is the guard the browser
  check only duplicates.
