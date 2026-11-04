---
prompt_id: P-006
title: F-01 Authentication, database tables, and row-level security
type: feature
date: 2026-11-03
author: Abdullah
features: [F-01]
depends_on: [P-003, P-004]
status: ready to send
---

# P-006: F-01 Authentication and data layer

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys, and never put real keys in any file you create.** Use placeholders. I will add the real values to `.env.local` myself.

---

## Before you start

Read `DECISIONS.md` first (D-017), then `docs/ARCHITECTURE.md` and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you need a schema change, stop and tell me. Do not commit; I will review and commit myself.

## Step 1: Documentation updates

Amend **D-004** to say the build order is now F-02, F-03, F-04, F-01, F-05, F-06, F-07, F-08, F-09, because editing (F-05) needs a real place to save. Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-03. Amend `docs/ARCHITECTURE.md` and `docs/FEATURES.md` to match.

| ID | Title | Decision |
| --- | --- | --- |
| D-052 | Build order | F-01 comes before F-05 (amends D-004). |
| D-053 | Draft and published split | Three tables: `profiles` (private), `portfolios` (the owner's draft, private), and `published_portfolios` (a snapshot of what is public). Only `published_portfolios` has a public read policy. A draft can therefore never leak, because no policy exposes the tables that hold drafts. This satisfies D-011. |
| D-054 | Profile and portfolio creation | A database trigger creates the `profiles` row when an auth user is created, from the signup metadata. The draft `portfolios` row is created by the app the first time the user opens the dashboard, with default content, and creating it twice must be harmless. |
| D-055 | Secrets | Only the Supabase URL and the anon key are used, and the anon key is safe to expose. The service-role key is not used anywhere until a later decision records the need. `.env.local` is never committed. |
| D-056 | Auth messages | Login failures show one generic message and never reveal whether an email exists. Signup shows a clear message for a taken username, and a generic message for any other failure. |
| D-057 | Defaults | The default design and the empty content live in `src/portfolio/defaults.ts`, outside the frozen schemas, and are validated by the F-02 validators in tests. |
| D-058 | Auth screens | Signup, login, and dashboard are app pages, not portfolios. They get plain, clean styling. A design pass can come later if time allows. |

## F-01 specification

**ID:** F-01
**Name:** Authentication, database tables, and row-level security
**Goal:** Let a person create an account with a unique username, log in and out, and reach a protected dashboard, with the database tables and security rules in place that every later feature will use.
**User story:** As a portfolio owner, I sign up with an email, a password, a username, and a display name, and I land on my dashboard. Nobody else can read or change my data.
**Depends on:** F-02
**Blocks:** F-05, F-06, F-07, F-08, F-09

### Dependencies you may add

`@supabase/supabase-js` and `@supabase/ssr`. Use the approach that the current official docs recommend for Next.js 16 App Router with cookie-based sessions. Record the versions in `docs/ARCHITECTURE.md`. Add no other dependency without asking.

### Database

Write the SQL in `supabase/migrations/0001_init.sql`. I will run it in the Supabase SQL editor, so it must run cleanly on a fresh project and be safe to read top to bottom.

| Table | Columns | Rules |
| --- | --- | --- |
| `profiles` | `id` (uuid, primary key, references `auth.users` on delete cascade), `username`, `display_name`, `headline` (default empty), `created_at` | Unique index on `lower(username)`. Check constraint on the username format: 3 to 30 characters, lowercase letters, digits, and hyphens, not starting or ending with a hyphen. |
| `portfolios` | `user_id` (uuid, primary key, references `profiles`), `design` (jsonb, not null), `content` (jsonb, not null), `updated_at` | One row per user (D-007). |
| `published_portfolios` | `user_id` (uuid, primary key, references `profiles`), `username`, `display_name`, `headline`, `design` (jsonb), `content` (jsonb), `published_at`, `updated_at` | Unique index on `lower(username)`. This is the only table the public can read. |

The reserved-username list is enforced in the application through the F-02 profile schema, not in SQL. Say so in a comment in the migration.

**Trigger:** a function that runs after insert on `auth.users` and inserts the `profiles` row using `username`, `display_name`, and optional `headline` from `raw_user_meta_data`. Make it `security definer` with an empty `search_path`, and use fully qualified names.

**Row-level security** (enabled on all three tables):

| Table | Anonymous | Signed-in user |
| --- | --- | --- |
| `profiles` | no access | select and update own row only |
| `portfolios` | no access | select, insert, update, and delete own row only |
| `published_portfolios` | select all rows | select all rows. Insert, update, and delete own row only. |

Also write `supabase/tests/rls-checklist.md`: a short list of SQL statements I can run in the SQL editor while impersonating each role, with the expected result of each. It must cover: anonymous cannot read `profiles` or `portfolios`; user A cannot read, update, or delete user B's rows in any table; anonymous can read `published_portfolios`; user A cannot write a row into `published_portfolios` with user B's `user_id`.

### Application

1. **Supabase clients.** A server client and a browser client that use only the URL and the anon key. A `.env.example` listing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with placeholder values. Confirm that `.env.local` is gitignored.
2. **Session refresh.** Keep the session fresh on requests, using the method the current Next.js and Supabase docs recommend.
3. **Pages.**
   - `/signup`: email, password, username, display name.
   - `/login`: email and password.
   - `/dashboard`: shows the display name and username, a link to `/u/<username>` labelled as "not published yet", and a logout button. It is a stub: no editing yet.
   - `/`: replace the generator's default page with a short landing page that links to signup and login.
4. **Server actions** for signup, login, and logout, using Zod. Validation:
   - Email: valid format.
   - Password: 8 to 72 characters.
   - Username and display name: the F-02 profile schema, including the reserved list.
5. **Username availability.** Check before creating the account, case-insensitively, and show a friendly message. The database unique index is the real guard, so if two people race for a name, the loser gets the same friendly message instead of a raw error.
6. **Signup flow.** Create the auth user with `username` and `display_name` in the metadata. Email confirmation is disabled (D-005), so the user is signed in immediately and redirected to `/dashboard`.
7. **Default portfolio.** The first time `/dashboard` loads for a user with no `portfolios` row, create it from `src/portfolio/defaults.ts`: world `editorial`, a default theme, the six sections in a default order with visible set to true and sensible display styles, and an empty content document. Two simultaneous loads must produce one row (use an upsert that does nothing on conflict).
8. **Route protection** on the server. An anonymous visitor to `/dashboard` is redirected to `/login`. A signed-in user who opens `/login` or `/signup` is redirected to `/dashboard`.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | Signup validates every field with Zod and shows an error next to each invalid field. The password must be 8 to 72 characters. The username and display name follow the F-02 profile schema. |
| AC-2 | A taken username (compared case-insensitively) is refused with a friendly message, both through the pre-check and when the database unique index rejects a race. |
| AC-3 | Successful signup creates the auth user and the `profiles` row (through the trigger), signs the user in, and redirects to `/dashboard`. |
| AC-4 | Login works with the correct credentials. Wrong credentials give one generic message, identical for an unknown email and a wrong password. |
| AC-5 | Logout ends the session, and `/dashboard` then redirects to `/login`. |
| AC-6 | Route protection happens on the server. Anonymous users cannot reach `/dashboard`, and signed-in users are redirected away from `/login` and `/signup`. |
| AC-7 | The first dashboard visit creates exactly one draft `portfolios` row from the defaults. Repeat and simultaneous visits do not create a second one. The defaults pass the F-02 design and content validators. |
| AC-8 | `0001_init.sql` creates the three tables with the constraints above, and runs cleanly on a fresh project. |
| AC-9 | Row-level security is enabled on all three tables with the policies in the table above, and `rls-checklist.md` covers the four required cases with expected results. |
| AC-10 | No secret appears in any file. `.env.example` has placeholders only. `.env.local` is gitignored. The service-role key is not used. Passwords and tokens are never logged. |
| AC-11 | The existing demo pages (`/u/demo-*`) still render from fixtures. The public route does not read from the database in F-01. |
| AC-12 | Tests: validation rules; the signup, login, and logout actions against a mocked Supabase client (success, duplicate username, wrong password, validation errors); the redirect rules as pure functions; the default portfolio. All pass with no network access. |
| AC-13 | `src/schema/` is unchanged. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-14 | `README.md` has step-by-step setup: create the Supabase project, turn off email confirmation, run the migration, set `.env.local`, run the RLS checklist. `docs/ARCHITECTURE.md` documents the tables, the auth flow, and the policies. |

### Edge cases the tests must cover

- Username with uppercase letters (normalized or rejected, as the F-02 profile schema says), reserved names, 2 and 31 characters.
- Password of 7, 8, 72, and 73 characters.
- Whitespace-only display name.
- Email with surrounding whitespace.
- A signup that fails after the auth user is created (the user must not be left half-set-up without a clear failure message).
- An expired or missing session on `/dashboard`.
- Two simultaneous first dashboard loads.

### Out of scope

Editing content or design (F-05, F-06). Publishing, and reading the public route from the database (F-07). Skills and search tables (F-09). Password reset, email confirmation, OAuth, profile editing, and account deletion. Any change to the schemas or the renderer.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets. Use placeholders.
3. You cannot reach my Supabase project. Do not claim the SQL or the policies were tested against a real database. Say what was tested with mocks and what I must verify with the checklist.
4. Record anything new in `DECISIONS.md` and `docs/`, not only in code comments.
5. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. The migration and the RLS checklist.
3. Defaults, then the Supabase clients and session handling.
4. Validation, server actions, and the pages.
5. Route protection.
6. Tests, then run all four commands until they pass.
7. README and architecture updates.

## Definition of done

- Every acceptance criterion passes, with the limits of mock-based testing stated.
- `DECISIONS.md` contains D-052 to D-058, and D-004 is amended.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. A table of acceptance criteria and test results.
2. The files created or changed.
3. The exact steps I need to do in Supabase (project settings, migration, environment file).
4. A list of what I must verify by hand because it could not be tested here.
5. Anything you could not implement as written, or any rule that was ambiguous.

## Result

Implemented in the working tree. Nothing was committed. `typecheck`, `lint`, `test` (199 passing, up from 153) and `build` are clean; `/dashboard`, `/login` and `/signup` are dynamic routes.

**Where the work landed**

- `supabase/migrations/0001_init.sql`: `profiles`, `portfolios` and `published_portfolios` with the stated constraints, the `auth.users` trigger (`security definer`, empty `search_path`, fully qualified names), the `is_username_available` function, and every RLS policy. `supabase/tests/rls-checklist.md` has 18 checks with expected results, covering the four required cases.
- `src/lib/supabase/`: server and browser clients, plus `src/proxy.ts` for session refresh (`getClaims`) and route protection. The pages re-check the user server-side.
- `src/lib/auth/`: F-02-backed validation, signup/login/logout logic behind an `AuthPorts` port, the server actions, and the redirect rules as pure functions.
- `src/app/(auth)/`, `src/app/dashboard/`, a new landing page, and `src/portfolio/defaults.ts` with the draft-creation upsert.
- `DECISIONS.md` D-052 to D-059 (D-004 amended), `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `README.md` setup steps, `prompts/INDEX.md`, `.env.example` with `!.env.example` in `.gitignore`.

**Not verified**

- AC-8 and AC-9: no migration was run and no Supabase project was reached, so the SQL is unexecuted and the RLS checklist is written but not run.
- AC-2, AC-3, AC-4, AC-5 and AC-7: proven against a mocked client only. The live signup path, the trigger and the first-dashboard-visit upsert need a real project.
- `prompts/P-006-F-01-auth.md` did not exist when the work was reported, so only the index row was updated at the time. This file was saved afterwards from the prompt text the owner supplied.
