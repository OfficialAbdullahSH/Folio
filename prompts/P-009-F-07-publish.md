---
prompt_id: P-009
title: F-07 Publish, unpublish, and the public data source
type: feature
date: 2026-11-07
author: Abdullah
features: [F-07]
depends_on: [P-006, P-007, P-008]
status: ready to send
---

# P-009: F-07 Publish

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys and never write real keys into any file.** I will run any SQL myself in the Supabase SQL editor.

---

## Before you start

Read `AGENTS.md` at the repo root first. Then read `DECISIONS.md` (D-017), `docs/ARCHITECTURE.md`, and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you need a schema change, stop and tell me. Do not commit; I will review and commit myself.

If you need to test with a signed-in account, follow the same limits as last time: a throwaway account with a made-up email and a random password that is never written to any file, log, screenshot, or report. Tell me the exact email and username you created so I can delete it. Do not touch any other account.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-07. Number them consecutively after the highest existing ID, in the order given. Update `docs/ARCHITECTURE.md` and `docs/FEATURES.md` to match.

| Title | Decision |
| --- | --- |
| Snapshot publishing | Publishing copies the saved draft (design and content) plus the profile's display name and headline into the owner's row in `published_portfolios`. The server re-validates everything with the F-02 validators and re-checks skill slugs and image URLs before writing. The username is read from the owner's profile on the server, never from the client. |
| Publish states | Three states: not published, published and current, and published with unpublished changes. The state is computed by comparing the canonical form of the saved draft with the published snapshot. |
| Unpublish | Unpublishing deletes the owner's published row. The draft is untouched. The public page returns 404 and the portfolio leaves search. |
| Reset to last published | This implements D-015. It replaces the draft design and content with the published snapshot, after a confirmation. Display name and headline are not part of it. It is available only when a published snapshot exists. |
| Public data source | A Supabase-backed `PortfolioSource` reads `published_portfolios` by lowercase username with the anon key and no cookies. If no published row matches, the source falls back to the demo fixtures, so a real user always wins over a demo with the same name. This replaces the fixture-only source from D-036. |
| Freshness | Publish, republish, and unpublish revalidate the public page for that username so changes appear immediately. |
| Publish warnings | The publish dialog shows non-blocking notes (readability warnings from F-06 and a list of empty sections). Following D-009, warnings never block publishing. |

## F-07 specification

**ID:** F-07
**Name:** Publish, unpublish, and the public data source
**Goal:** Let an owner publish their saved portfolio to a personal link that anyone can open, update it later, and take it down.
**User story:** As an owner, I click Publish and my portfolio goes live at `/u/<my-username>`. I can keep editing privately, publish my changes when I am ready, or unpublish.
**Depends on:** F-01, F-02, F-03, F-05, F-06
**Blocks:** F-09

### What to build

1. **Publish action.** A server action that checks the user is signed in, loads their own profile, draft design, and draft content, and then:
   - validates the design and content with the F-02 validators,
   - validates the profile fields with the F-02 profile validator,
   - checks every skill slug against the `skills` table and every image URL against the `project-images` prefix rule from F-05,
   - upserts one row in `published_portfolios` (user id, username, display name, headline, design, content, and the published and updated times; `published_at` is set on the first publish and kept after that),
   - revalidates the public page for that username.
   Any failure writes nothing and returns clear field-level or summary errors. It uses the signed-in session, not any privileged key.
2. **Unpublish action.** Deletes the signed-in user's own published row and revalidates the public page.
3. **Reset to last published action.** Replaces the draft `design` and `content` with the published snapshot, after the snapshot passes the validators. Refuses if nothing is published.
4. **Pure helpers** with tests: build the snapshot from draft and profile, canonicalize for comparison (stable key order, so the same data always compares equal), and compute the publish state.
5. **Dashboard status card.** Replace the "not published yet" text on `/dashboard` with a card that shows the state in plain language, the published time, the public link with a copy button, and the right actions for the state:
   - Not published: **Publish**.
   - Published and current: **View public page**, **Unpublish**.
   - Published with unpublished changes: **Publish changes**, **View public page**, **Reset to last published**, **Unpublish**.
   The card states clearly that publishing uses the saved draft, not unsaved edits in an open editor or builder tab.
6. **Publish dialog.** Before publishing or republishing, show a short confirmation with the non-blocking notes (readability warnings from the F-06 checker on the saved design, and which sections are empty), and a clear confirm and cancel. Confirmations for Unpublish and Reset to last published explain exactly what will happen.
7. **Public data source.** Implement the Supabase-backed `PortfolioSource` and wire it into `/u/[username]` through the existing interface. The route keeps validating everything it reads, and invalid or missing data still gives the 404 page (D-040). Skill names come from a Supabase-backed `SkillCatalog`. Keep the demo fixtures as the fallback described in the decision above.
8. **Row-level security check list.** Extend `supabase/tests/rls-checklist.md` with: anonymous can read a published row and cannot read the draft tables; a user cannot insert, update, or delete another user's published row; unpublishing removes only the user's own row.

No SQL migration should be needed, because the table and policies exist from 0001. If you find one is needed, stop and tell me.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | Publish validates the design, content, and profile with the F-02 validators, and re-checks skills and image URLs. If anything is invalid, nothing is written and the errors are reported. |
| AC-2 | Publish writes exactly the owner's row, with the username taken from the owner's profile on the server. No user id or username comes from the client. An unauthenticated call is refused. |
| AC-3 | The first publish sets `published_at`. Republishing updates the content and `updated_at` and keeps `published_at`. |
| AC-4 | The snapshot builder and the canonical comparison are pure and tested: identical data in a different key order compares equal, and any change to design, content, display name, or headline produces the "unpublished changes" state. |
| AC-5 | The dashboard card shows the correct state and actions for the three states, the published time, and the public link with a working copy button. |
| AC-6 | The publish dialog lists the readability warnings and the empty sections as notes, and never blocks publishing. |
| AC-7 | Unpublish deletes only the owner's published row, leaves the draft intact, and the public URL then returns 404. |
| AC-8 | Reset to last published replaces the draft design and content with the snapshot after a confirmation, is refused when nothing is published, and leaves display name and headline alone. |
| AC-9 | `/u/<username>` serves the published snapshot through the Supabase-backed source, using the anon key and no cookies. Lookup is case-insensitive. Invalid or missing data gives the 404 page. |
| AC-10 | The demo fixtures still work at `/u/demo-*` when no published row has that username. A published row with the same username wins. |
| AC-11 | After publish, republish, or unpublish, the public page reflects the change immediately (the page is revalidated). Draft edits do not appear on the public page until republished. |
| AC-12 | No privileged key is used anywhere. Anonymous users can read only `published_portfolios`, and the checklist covers the new cases. |
| AC-13 | The UI meets the bar in `AGENTS.md` section 5 (labelled controls, keyboard operation, focus, 44 px targets, designed loading, success, and error states, responsive at 375, 768, and 1280 px without horizontal scrolling, reduced motion respected). |
| AC-14 | `src/schema/` is unchanged. Existing features still work. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-15 | `docs/FEATURES.md` has the F-07 table with honest statuses, including which rows came from a live run, and `docs/ARCHITECTURE.md` describes publishing, the snapshot, and the public source. |

### Edge cases the tests must cover

- Publishing an empty portfolio (default design, empty content): allowed, with the empty sections listed as notes.
- A saved draft that fails validation: publish refuses and writes nothing.
- A skill that was deleted from the skills table after the draft was saved.
- An image URL outside the allowed prefix.
- Republishing with no changes (state stays "current", `updated_at` may change, `published_at` does not).
- Same data with keys in a different order.
- A published row that fails validation when read publicly: the page returns 404, and the error is logged server-side only.
- Username lookup with uppercase letters.
- Unpublishing when nothing is published.
- Reset to last published when the snapshot fails validation: refuse and change nothing.
- A published row and a demo fixture with the same username.
- Two quick Publish clicks (the second must not create a second row or an error).

### Live checks for me (report what you could run)

With a throwaway account, run this with Playwright and report each result and whether it came from the live run:

1. Publish from the dashboard and open the public URL in a separate context that is not signed in. The portfolio renders.
2. Edit a draft value and save. The dashboard shows "unpublished changes" and the public page is unchanged.
3. Publish changes. The public page updates.
4. Reset to last published after another edit. The draft returns to the snapshot.
5. Unpublish. The public URL returns 404.
6. Check the public page at 375 and 1280 px for horizontal overflow.

### Out of scope

Search (F-09) and the AI (F-08). Custom domains, analytics, versions or history of published snapshots, scheduled publishing, and social preview images. Any schema change or SQL migration.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets, and never use a privileged key.
3. Do not claim database behavior was tested if it was not. State what came from the live run and what did not.
4. Record anything new in `DECISIONS.md` and `docs/`.
5. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. The pure helpers, with tests.
3. The three actions, with tests using a fake client.
4. The Supabase-backed source and catalog, with tests.
5. The dashboard card and dialogs.
6. The live checks with the throwaway account.
7. Run all four commands until they pass.
8. Documentation updates.

## Definition of done

- Every acceptance criterion passes, with the limits of the testing stated honestly.
- The new decisions are in `DECISIONS.md`.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. A table of acceptance criteria and results, marking which came from the live run.
2. The files created or changed.
3. The exact email and username of any account you created.
4. What I must verify by eye or in the live app.
5. The skills and tools you used.
6. Anything you could not implement as written, any deviation, and any ambiguity.
