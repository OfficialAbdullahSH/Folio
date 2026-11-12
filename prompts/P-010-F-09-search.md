---
prompt_id: P-010
title: F-09 Search by name and skill, with a demo seed
type: feature
date: 2026-11-12
author: Abdullah
features: [F-09]
depends_on: [P-007, P-009]
status: ready to send
---

# P-010: F-09 Search

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys and never write real keys into any file.** I run all SQL myself in the Supabase SQL editor.

---

## Before you start

Read `AGENTS.md` at the repo root first. Then read `DECISIONS.md` (D-017), `docs/ARCHITECTURE.md`, and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. Do not change the publish logic from F-07 unless a decision below says so. Do not commit; I will review and commit myself.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-12. Number them consecutively after the highest existing ID, in the order given. Update `docs/ARCHITECTURE.md` and `docs/FEATURES.md` to match.

| Title | Decision |
| --- | --- |
| Build order | F-09 comes before F-08 (amends D-004). F-08, the AI assistant, is built last and is a stretch feature. |
| Search page | A public page at `/search`, with no login needed. One search box, results as portfolio cards, and skill chips that link to a skill search. It reads published portfolios only (D-010, D-053). |
| Skill lookup | Search by skill uses JSON containment on the published content (`content` contains the skill slug in `skills.skillIds`), backed by a GIN index. This replaces the "skills join table" wording in D-010. The skills list is closed (D-033) and small, so a separate table is not needed. |
| Name lookup | Name search uses Postgres full-text search with the `simple` configuration (language-neutral, so Arabic names work) over display name, username, and headline, with prefix matching per word. |
| Search functions | Search runs through SQL functions that are security invoker, with an empty search path, executable by `anon` and `authenticated` only, and returning public columns only. Limits are enforced inside the functions. User input is never concatenated into SQL or into text-search syntax. |
| Alias resolution | A typed term is resolved to skill slugs in the app, through the public `skills` and `skill_aliases` tables, using the same resolver as the F-05 picker. |
| Demo seed | About 10 fictional demo portfolios are generated from validated TypeScript definitions into a SQL file. They are inserted as demo users that cannot log in, with the email domain `demo.folio.invalid` and fixed ids, so the seed is repeatable and a removal script can delete exactly them. |

## F-09 specification

**ID:** F-09
**Name:** Search by name and skill, with a demo seed
**Goal:** Let anyone find published portfolios by a person's name or by a skill, without an account.
**User story:** As an employer or classmate, I type "react" or a name, and I see the people who match, then open their portfolios.
**Depends on:** F-05 (skills), F-07 (published data)
**Blocks:** nothing

### Database

Write `supabase/migrations/0003_search.sql`. I will run it after 0002. It must run cleanly on the current project, and it must not change any existing table or policy.

1. A GIN index for full-text search on `published_portfolios` over display name, username, and headline, using the `simple` configuration.
2. A GIN index (`jsonb_path_ops`) supporting skill containment on the published `content`.
3. SQL function `search_portfolios(p_terms text[], p_skill_slugs text[], p_limit int, p_offset int)`:
   - `p_terms`: already-cleaned words; each is matched as a prefix, and all must match (name, username, or headline). Null or empty means no name filter.
   - `p_skill_slugs`: if given, a portfolio matches when it lists any one of these slugs. Null or empty means no skill filter.
   - Returns, per row: username, display name, headline, up to 6 skill slugs, the world, the accent color, `published_at`, and the total number of matches (a window count).
   - Ranking: exact and prefix name matches first, then newer publish time. Without any filter, return the newest portfolios.
   - Enforces `p_limit` between 1 and 24 and `p_offset` at 0 or more, whatever the caller sends.
4. SQL function `popular_skills(p_limit int)`: skill slug and the number of published portfolios that list it, most popular first, capped at 24.
5. Both functions: security invoker, empty search path with fully qualified names, `revoke` execute from public and `grant` it to `anon` and `authenticated` only. They must never return anything that the published-read policy would not allow.

### Application

1. **Route.** `/search` with the query parameters `q` (text), `skill` (a skill slug), and `page`. All are validated with Zod: `q` at most 100 characters, `skill` in the slug format from F-02, `page` a positive integer. Invalid values are ignored safely, never causing an error page.
2. **Search box with autocomplete.** The page loads the skills list and aliases once and offers suggestions as the user types, using the same matching as the F-05 picker (name, alias, and slug, case-insensitive, one suggestion per skill). It follows the accessible combobox pattern with full keyboard support. Choosing a suggestion opens the skill search (`?skill=<slug>`). Pressing Enter with free text runs a name search, and also a skill search if the text resolves to skills.
3. **Query handling.** A pure function cleans the free text into words (Unicode-aware, so Arabic works, dropping punctuation and any characters that mean something in text-search syntax) and passes them as an array. The skill terms are resolved to slugs by the alias resolver. The functions are called through the Supabase client's `rpc`, using the anon key, with no cookies and no privileged key.
4. **Results.**
   - When the text resolves to one or more skills, show a "People with this skill" section. When it also matches names, show a "People matching the name" section. A `?skill=` search shows the skill section only.
   - Each result is a card: display name, headline, up to 6 skills shown by their display names, an accent color swatch, and a link to `/u/<username>`. Each skill on a card is a link that opens that skill's search.
   - Show the total count ("12 people"), and paginate at 12 per page with previous and next links and a page indicator.
5. **States.** Designed states for: no query yet (the newest portfolios plus the most popular skills as chips), no results (a friendly message and the popular skills), loading, and an error (a clear message, never a stack trace or SQL text).
6. **Freshness.** Search results must never be stale after a publish or unpublish. Render the page dynamically.
7. **Metadata.** Title "Search | Folio". When a query or skill is present, the page is `noindex`.
8. **Navigation.** Add a link and a small search form to the landing page `/`, and a link to `/search` on the dashboard. Do not change the portfolio renderer.
9. **Demo seed.** Write `scripts/generate-demo-seed.ts` (run with a script entry in `package.json`) that holds about 10 fictional people as TypeScript data, validates every design, content, and profile with the F-02 validators, and writes `supabase/seed/demo_portfolios.sql`.
   - The people are invented. Use no real names, photos, or personal data. Two have Arabic display names and some Arabic about text.
   - They use both worlds and at least 6 different looks from F-06 (reuse the looks as data), varied section order and styles, and no images.
   - Skills come from the existing seeded skills table. Choose them so that at least 4 skills each match 3 or more people, and that searching `react`, `reactjs`, and `js` give sensible results.
   - The SQL inserts one `auth.users` row per demo person (fixed UUID, email at `demo.folio.invalid`, no password, email confirmed, user metadata with `username`, `display_name`, and `headline` so the existing trigger creates the profile), then inserts the published rows. It must be safe to run twice without duplicates. If the current `auth.users` structure needs extra required columns, add them and explain.
   - Also write `supabase/seed/demo_portfolios_remove.sql`, which removes exactly those demo users and their rows, in dependency order.
   - Demo users can never sign in. State that in the file header.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `0003_search.sql` creates the two indexes and the two functions as specified, changes no existing table or policy, and the functions are security invoker with an empty search path and execute rights for `anon` and `authenticated` only. |
| AC-2 | `/search` works for anonymous visitors. |
| AC-3 | Name search finds people by display name, username, or headline words, ignoring case, with prefix matching, including Arabic text. Exact and prefix matches rank first. |
| AC-4 | Skill search resolves canonical names, slugs, and aliases (`ReactJS`, `react.js`, `JS`) to slugs and returns exactly the published portfolios that list the slug. Unpublished portfolios never appear. |
| AC-5 | A query that matches both a skill and names shows both sections. `?skill=<slug>` works, is validated, and links from the skill chips on the cards work. |
| AC-6 | Autocomplete suggests skills by name and alias, one suggestion per skill, and follows the accessible combobox pattern with keyboard support. |
| AC-7 | Result cards show the name, headline, up to 6 skills by display name, the accent swatch, and a link to `/u/<username>`. |
| AC-8 | Pagination shows 12 per page with the total count. The page and limits are validated, and the SQL functions enforce their own caps whatever the caller sends. |
| AC-9 | User input never reaches SQL or text-search syntax unescaped. Hostile inputs (quotes, `;`, `--`, `&`, `\|`, `!`, `(`, `)`, `:`, `*`, `<`, `>`, very long text, emoji, only punctuation) produce a normal result or an empty state, never an error. |
| AC-10 | After a publish or unpublish, search reflects it on the next load with no stale results. |
| AC-11 | The empty states (no query, no results, loading, error) are designed and show no technical details. |
| AC-12 | The generator validates all demo data with the F-02 validators, and the generated SQL and the removal script are produced. The seed has about 10 fictional people, both worlds, at least 6 looks, two Arabic names, and at least 4 skills that each match 3 or more people. It is repeatable. |
| AC-13 | The landing page and dashboard link to `/search`. The portfolio renderer is unchanged. |
| AC-14 | The UI meets `AGENTS.md` section 5, is responsive at 375, 768, and 1280 px with no horizontal scrolling, and the page is `noindex` when a query is present. |
| AC-15 | `src/schema/` is unchanged and F-07 behavior is unchanged. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-16 | `supabase/tests/rls-checklist.md` has the new checks with expected results. `docs/FEATURES.md` has the F-09 table with honest statuses (marking what came from a live run), and `docs/ARCHITECTURE.md` describes search, the functions, and the seed. |

### Edge cases the tests must cover

- Empty text, whitespace only, and text of only punctuation.
- 100 and 101 characters.
- Mixed case, extra spaces, and a term with a trailing dot (`react.`).
- Arabic text and mixed Arabic and Latin text.
- An alias that is also a prefix of a name.
- Two terms where only one matches, and a term that matches a skill but nobody has it.
- A skill slug in `?skill=` that is invalid, or valid but unknown.
- `page=0`, `page=-1`, `page=abc`, and a page past the end.
- A portfolio that lists the same skill twice (the schema forbids it, so the function should still behave).
- The hostile inputs listed in AC-9.
- Generated demo data that fails validation (the generator must stop with a clear error).

### Out of scope

Typo tolerance, filters by world, sort options, saved searches, a dedicated search engine, search analytics, social preview images, and the AI. Any change to the schemas or to the publish logic.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets, and never use a privileged key.
3. You cannot reach my Supabase project. Do not claim database behavior was tested if it was not. State exactly what came from a live run.
4. Record anything new in `DECISIONS.md` and `docs/`.
5. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. The pure functions (query cleaning, resolution, pagination), with tests.
3. `0003_search.sql`, the generator, the generated seed, and the removal script.
4. **Stop here.** Give me the exact steps to run the migration and the seed in the Supabase SQL editor and the checks to confirm them, and wait for my reply that they ran. Then continue.
5. The search page, autocomplete, results, and states.
6. Live checks (below).
7. Run all four commands until they pass.
8. Documentation updates.

### Live checks (after I confirm the SQL ran)

Use Playwright with no signed-in account and report each result, saying it came from the live run:

1. `/search` with no query shows newest portfolios and popular skills.
2. `react`, `ReactJS`, and `react.js` give the same set of people, and that set is exactly the people who list React.
3. A name typed in lowercase, a prefix of a name, and an Arabic name each find the right person.
4. A hostile string gives a normal empty state.
5. A result opens the right `/u/<username>` page.
6. Page 2 works, and the count matches.
7. No horizontal overflow at 375 and 1280 px on the search page.

## Definition of done

- Every acceptance criterion passes, with the limits of the testing stated honestly.
- The new decisions are in `DECISIONS.md`.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. A table of acceptance criteria and results, marking which came from a live run.
2. The files created or changed.
3. The exact SQL steps I must do, and the checks to confirm them.
4. What I must verify by eye or in the live app.
5. The skills and tools you used.
6. Anything you could not implement as written, any deviation, and any ambiguity.
