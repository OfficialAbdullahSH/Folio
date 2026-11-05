---
prompt_id: P-007
title: F-05 Content editor, skills list, and image upload
type: feature
date: 2026-11-05
author: Abdullah
features: [F-05]
depends_on: [P-003, P-004, P-006]
status: ready to send
---

# P-007: F-05 Content editor

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys and never write real keys into any file.** I will run the SQL myself in the Supabase SQL editor.

---

## Before you start

Read `DECISIONS.md` first (D-017), then `docs/ARCHITECTURE.md` and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you need a schema change, stop and tell me. Do not commit; I will review and commit myself.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-05. Number them consecutively after the highest ID that already exists, in the order given. Update `docs/ARCHITECTURE.md` and `docs/FEATURES.md` to match.

| Title | Decision |
| --- | --- |
| Editor and save model | One editor page at `/dashboard/edit`. It has an explicit Save button that validates the whole content document and replaces `portfolios.content`. The last write wins, with no conflict handling. There is no autosave in v1. |
| Draft preview | An owner-only page at `/dashboard/preview` renders the saved draft with the real renderer (F-03, F-04), using the draft content and the draft design. It reads only the signed-in user's own rows. |
| Skills tables | `skills` (slug, name) and `skill_aliases` (alias, skill slug), loaded from a seed file. Public read, no client writes. This is the data behind D-026. |
| Skills picker | The full list is loaded when the page loads and filtered in the browser by name and alias. Choosing an alias selects its canonical skill, so "ReactJS" and "react.js" both produce `react`. |
| Image storage | A public Storage bucket named `project-images`, limited to 2 MB and to JPEG, PNG, and WebP (D-025). Users can write only inside their own `<user_id>/` folder. File names are random UUIDs, never user-supplied. The stored value is the public URL. |
| Image URL rule | On save, the server rejects any project `imageUrl` that is not inside this project's `project-images` public URL prefix. The UI offers upload only. |
| Profile fields in the editor | Display name and headline (D-022) are edited in the same page and saved to `profiles` with the F-02 profile schema. They reach `published_portfolios` at publish time (F-07). |
| Editor structure | The editor is made of client components, which is allowed because D-047 only restricts world components. All state changes go through a pure reducer so they can be tested without a browser. |
| Reordering | Items are reordered with up and down buttons. Drag and drop is deferred. |
| Orphaned images | Deleting a project does not delete its image in v1. This is a known limit. |

## F-05 specification

**ID:** F-05
**Name:** Content editor, skills list, and image upload
**Goal:** Let a signed-in owner enter and edit all the content of their portfolio, save it as a draft, and see it rendered.
**User story:** As an owner, I fill in my about text, projects, skills, experience, and contact links, upload project images, save, and preview my portfolio.
**Depends on:** F-01, F-02, F-03
**Blocks:** F-06, F-07, F-09

### Database changes

Write `supabase/migrations/0002_skills_and_storage.sql`. I will run it in the SQL editor after 0001.

| Object | Rules |
| --- | --- |
| `skills` | `slug` (primary key, matches the F-02 slug format), `name` (not empty). Row-level security on. Select for `anon` and `authenticated`. No insert, update, or delete policy. |
| `skill_aliases` | `alias` (stored lowercase, unique), `skill_slug` (references `skills` on delete cascade). Same row-level security. An alias must not equal any skill's slug. |
| Storage bucket `project-images` | Public, 2 MB file size limit, allowed types `image/jpeg`, `image/png`, `image/webp`. |
| Storage policies | `authenticated` can insert, update, and delete objects only where the bucket is `project-images` and the first folder of the path equals their user id. Nothing else is writable. Anonymous users cannot write. |

Also write `supabase/seed/skills.sql`: at least 80 skills with aliases, covering programming languages, frontend, backend, databases, tools and platforms, design, and common professional skills. Slugs follow the F-02 format. It must include these cases: `react` with aliases `reactjs` and `react.js`, `javascript` with `js`, `typescript` with `ts`, `nodejs` with `node` and `node.js`, `postgresql` with `postgres`. It must be safe to run on a fresh table, and re-running it must not create duplicates (use conflict handling).

Extend `supabase/tests/rls-checklist.md` with new checks and expected results: anonymous can read `skills` and `skill_aliases`; no client role can insert, update, or delete in them; an authenticated user can upload into their own folder in the bucket; an authenticated user cannot upload into another user's folder; an anonymous user cannot upload; an upload over 2 MB or with a wrong type is refused.

### Application

1. **Routes.** `/dashboard/edit` and `/dashboard/preview`, both protected on the server like `/dashboard`. Update `/dashboard` to link to both and to show the draft's last saved time.
2. **Editor form.** One page with these blocks, each with clear labels, character counters where there is a limit, and error messages tied to the field they belong to.
   - Profile: display name and headline.
   - About: one text area (limit from F-02).
   - Projects: a list. Each item has title, description, image (upload, preview, remove), and link. Add, remove, move up, move down. Maximum from F-02.
   - Skills: a picker that searches by name and alias, shows chips for the chosen skills, lets the user remove one, and enforces the F-02 maximum and no duplicates.
   - Experience and education: a list. Each item has a kind, title, organization, start month and year, either an end month and year or a "current" toggle, and a description. Use month and year selects, not a native month input, so it behaves the same in every browser.
   - Contact: a list of kind, label, and value, with the value's expected format hinted by the kind.
3. **Pure reducer.** All edits (add, remove, move, set a field, toggle current, add a skill, remove a skill) are functions of a pure reducer that enforces the F-02 limits. New items get a fresh UUID.
4. **Loading.** The page loads the saved content (or the empty content if none), the profile, and the skills list on the server and passes them to the editor.
5. **Save action.** A server action that: checks the user is signed in; validates the content with the F-02 content validator; checks that every skill slug exists in `skills`; checks every project image URL against the rule above; validates the profile fields with the F-02 profile validator; then writes `portfolios.content` and `profiles` for the signed-in user only. It returns field-level errors with their paths, or success with the saved time. It never accepts a user id from the client.
6. **Image upload.** The browser checks size and type first, then uploads to `<user_id>/<random-uuid>.<ext>` in the bucket and puts the public URL into the project. The bucket limits are the real guard.
7. **Preview.** `/dashboard/preview` loads the user's own draft design (create the default if missing, as in F-01), draft content, and profile, resolves skill names through a Supabase-backed `SkillCatalog`, validates everything with the F-02 validators, and renders the real `<Portfolio>`. If validation fails, show a clear message for the owner (this is an owner page, so showing a readable error is fine) and never crash.
8. **Unsaved changes.** Warn before leaving the page with unsaved edits.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | The migration creates the tables, the bucket, and the policies as specified and runs cleanly after 0001. The seed file loads at least 80 skills with aliases, includes the required alias cases, and can be re-run without duplicates. |
| AC-2 | `/dashboard/edit` and `/dashboard/preview` are protected on the server. Anonymous visitors are redirected to `/login`. |
| AC-3 | The reducer implements add, remove, move up and down, set field, current toggle, and skill add and remove. It enforces every F-02 limit (12 projects, 30 skills, 10 experience items, 8 contact items, and string lengths where the UI can break them) and ignores impossible moves (such as moving the first item up). |
| AC-4 | The skills picker finds skills by name and by alias, ignores case, shows each skill once, resolves an alias to its canonical skill, and prevents duplicates and going over the maximum. |
| AC-5 | Saving validates the whole content document with the F-02 validator. Invalid content is not written. Errors come back with field paths and are displayed next to the right fields. |
| AC-6 | Saving rejects a skill slug that is not in the `skills` table (D-033). |
| AC-7 | Saving rejects a project `imageUrl` outside the `project-images` public URL prefix, including look-alike hosts and URLs that merely contain the prefix elsewhere. |
| AC-8 | The save action only ever writes the signed-in user's own `portfolios` and `profiles` rows. No user id is taken from the client. An unauthenticated call is refused. |
| AC-9 | Profile fields are validated with the F-02 profile schema and saved. The username cannot be changed in the editor. |
| AC-10 | Image upload checks type and size in the browser, uploads to the user's own folder with a random UUID name, and the resulting URL passes AC-7. Files over 2 MB or of other types are refused with a clear message. |
| AC-11 | Month and year selects round-trip to the `YYYY-MM` format. "Current" removes the end date. An end before the start is refused with a message. |
| AC-12 | `/dashboard/preview` renders the saved draft with the real renderer and the real skill names. A draft that fails validation shows a readable message instead of crashing. |
| AC-13 | Text inputs carry `dir="auto"`, and Arabic text can be entered, saved, and previewed. |
| AC-14 | The editor has labelled fields, errors associated with their fields, keyboard-operable buttons, and visible focus styles. |
| AC-15 | The user is warned before leaving with unsaved changes. |
| AC-16 | `src/schema/` is unchanged. The existing demo pages still render. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-17 | `rls-checklist.md` has the new checks with expected results, and the README explains how to run migration 0002 and the seed. |

### Edge cases the tests must cover

- Moving the first item up and the last item down.
- Adding a thirteenth project, thirty-first skill, eleventh experience item, and ninth contact item.
- A skill added twice, once by name and once by alias.
- Removing a project that has an image.
- A save with a mix of valid and invalid fields: nothing is written, and every invalid field is reported.
- An image URL such as `https://evil.example/project-images/x.png` and one with the right prefix followed by `@evil.example`.
- A save where the profile is valid but the content is not (and the reverse): nothing is written in either case.
- Experience with `current` on and an end date set in the form state.
- Arabic text in every text field.
- A very long unbroken word in a project title.

### Out of scope

The design editor and colors (F-06). Publishing and the public data source (F-07). Search (F-09). The AI. Drag and drop, autosave, undo, and deleting images from storage. Changing the username. Any change to the schemas or the renderer.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets.
3. You cannot reach my Supabase project. Do not claim the SQL, the policies, or the storage rules were tested against a real database. State what was tested with mocks and what I must verify by hand.
4. Do not add a dependency without asking me first, except the ones pre-approved in `AGENTS.md` for the app UI (shadcn/ui with its Radix dependencies, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`). Read `AGENTS.md` at the repo root before you start, especially the UI and UX section.
5. Record anything new in `DECISIONS.md` and `docs/`, not only in code comments.
6. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. Migration 0002, the seed file, and the checklist additions.
3. The reducer, then its tests.
4. The server action and its validation, then its tests.
5. The editor components and the upload.
6. The preview page and the Supabase-backed skill catalog.
7. Run all four commands until they pass.
8. README and architecture updates.

## Definition of done

- Every acceptance criterion passes, with the limits of mock-based testing stated.
- The new decisions are in `DECISIONS.md`.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. A table of acceptance criteria and test results. Include every row, even the ones that could not be tested here.
2. The files created or changed.
3. The exact steps I must do in Supabase (the migration, the seed, any settings), and the exact commands for anything else.
4. A list of what I must verify by hand.
5. Anything you could not implement as written, or any rule that was ambiguous.
