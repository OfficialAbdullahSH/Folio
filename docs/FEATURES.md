# Features

Each feature's status sits in its own section. Acceptance criteria arrive with each feature prompt and are recorded there by the owner.

Tiers: **1** = required for a complete product (F-01 to F-07). **2** = simplifiable if time runs short (F-08, F-09).

## F-01 — Sign up, log in, log out

- **Purpose:** give each owner an account that owns exactly one portfolio.
- **Depends on:** nothing (Supabase Auth).
- **Blocks:** F-06 (saving edits), F-07 (ownership of a link), F-08 (per-user limits).
- **Tier:** 1. **Status:** done (2026-11-03, P-006), pending a live check against a Supabase project. Decisions D-052 to D-060.

**Acceptance criteria (P-006 numbering)**

| AC | Requirement | Proof | Status |
| --- | --- | --- | --- |
| AC-1 | Signup with a valid email, password, username and display name creates the account, the `profiles` row and a session, then lands on the dashboard. | `AC-1 creates the account, signs in and writes the profile metadata`, `AC-1 signs the user in when the project still requires email confirmation`; browser check: the signup form posts and the action runs | Met (unit), live check pending |
| AC-2 | A taken username, compared case-insensitively, is refused with a friendly message both through the pre-check and when the unique index rejects a race. | `AC-2 refuses a taken username before creating an account`, `AC-2 gives the loser of a race the same friendly message` | Met (unit), needs `is_username_available` in a live project |
| AC-3 | Invalid input is rejected with a message beside the field: username format, reserved names, password 8–72, whitespace-only display name, malformed email. | eight `AC-3 ...` signup tests and eight `AC-3 ...` validation tests | Met |
| AC-4 | Login works; a wrong password and an unknown email give the same message. | five `AC-4 ...` login tests | Met |
| AC-5 | Logout ends the session; the dashboard is then unreachable. | `AC-5 ends the session exactly once`; browser check: `/dashboard` answers 307 to `/login` without a session | Met |
| AC-6 | Route protection on the server: anonymous on `/dashboard` goes to `/login`, signed in on `/login` or `/signup` goes to `/dashboard`. | five `AC-6 ...` redirect tests, `src/proxy.ts`, and the `getCurrentUser` check in each page | Met |
| AC-7 | The first dashboard load creates exactly one draft `portfolios` row with the defaults; a second load does not create another. | `AC-7 builds a row from the defaults`, `AC-7 writes to portfolios with on-conflict do-nothing`, `AC-7 two simultaneous first loads leave exactly one row`, `AC-7 reports a write failure without throwing` | Met (unit), live check pending |
| AC-8 | The default design and the empty content pass the F-02 validators; the default world is `editorial` with all six sections. | five `AC-8 ...` tests | Met |
| AC-9 | RLS: anonymous reads no `profiles` or `portfolios`; user A cannot read, change or delete user B's rows; anonymous reads `published_portfolios`; user A cannot publish under user B's id. | `supabase/tests/rls-checklist.md`, 18 checks | **Written, not run** — no Supabase project in this environment |
| AC-10 | Only the URL and the public key are used, under either the publishable or the legacy anon key name; `.env.local` is gitignored and `.env.example` holds placeholders. | four `AC-10 ...` tests in `src/__tests__/auth-config.test.ts`, nine tests in `src/lib/supabase/__tests__/config.test.ts` | Met |
| AC-11 | The demo pages still render from fixtures; the public route does not read the database. | `AC-11 the public route still reads the fixture source, not the database`, the existing `AC-13 renders each demo page` | Met |
| AC-12 | `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass. | Commands run: 208 tests, build clean | Met (command) |

**F-01 live check.** The unit tests cover the logic with fakes. The parts that need a real Supabase project — the trigger, the policies, the availability function and a full signup through the form — are written down in `supabase/tests/rls-checklist.md` and in the README setup steps, and are not yet executed.

**Files:** `supabase/migrations/0001_init.sql`, `supabase/tests/rls-checklist.md`, `src/proxy.ts`, `src/app/(auth)/`, `src/app/dashboard/`, `src/app/page.tsx`, `src/lib/supabase/`, `src/lib/auth/`, `src/portfolio/`, `.env.example`.

## F-02 — Design file format and validation

- **Purpose:** define the one structure a portfolio takes, and reject anything that does not match it.
- **Depends on:** nothing.
- **Blocks:** F-03, F-04, F-05, F-06, F-08. Everything.
- **Tier:** 1 (spine). **Status:** done (2026-11-03, P-003). Schemas frozen at `version: 1` (D-034).

**Acceptance criteria (verified 2026-11-03, 44 tests passing, `npm run typecheck` clean):**

| # | Criterion | Test |
| --- | --- | --- |
| AC-1 | A valid design document for each world parses. | `AC-1 parses a valid design for each world` |
| AC-2 | A version other than `1`, an unknown `world`, or any unknown key is rejected. | `AC-2 rejects a version other than 1`, `AC-2 rejects an unknown world`, `AC-2 rejects unknown keys at every level` |
| AC-3 | `sections` holds exactly the six ids, each once; any order accepted. | `AC-3 rejects a missing section`, `AC-3 rejects a duplicate section`, `AC-3 rejects an unknown section id`, `AC-3 accepts any order of the six sections` |
| AC-4 | A display style not allowed for its section is rejected. | `AC-4 rejects a display style that is not allowed for its section`, `AC-4 rejects a display style on about and contact` |
| AC-5 | Colors must be `#RRGGBB`; uppercase is accepted and lowercased. | `AC-5 rejects colors that are not #RRGGBB`, `AC-5 accepts uppercase colors and outputs lowercase` |
| AC-6 | A font key outside the six, or a radius outside the four, is rejected. | `AC-6 rejects a font key outside the six`, `AC-6 rejects a radius outside the four values` |
| AC-7 | A valid content document parses; unknown keys, list maximums and string limits are enforced. | `AC-7 parses a valid full content document and an empty one`, `AC-7 rejects unknown keys`, `AC-7 enforces the list maximums`, `AC-7 enforces string length limits at the boundary`, `AC-7 enforces the URL length limit at the boundary` |
| AC-8 | Schemes other than `http` and `https` are rejected. | `AC-8 rejects links and images with schemes other than http and https`, `AC-8 accepts a URL with surrounding whitespace and trims it` |
| AC-9 | Duplicate item ids and duplicate skill slugs are rejected. | `AC-9 rejects duplicate item ids and duplicate skill slugs` |
| AC-10 | Invalid months, an end before the start, and `current` with `endDate` are rejected. | `AC-10 rejects invalid months and malformed dates`, `AC-10 rejects an end date before the start date`, `AC-10 rejects current together with an end date` |
| AC-11 | An invalid email, and a non-URL for other contact kinds, are rejected. | `AC-11 rejects an invalid email and a non-URL for other kinds` |
| AC-12 | Username length, character set, hyphen and reserved-list rules are enforced. | `AC-12 rejects usernames outside 3 to 30 characters`, `AC-12 rejects uppercase letters and characters outside a-z 0-9 -`, `AC-12 rejects leading and trailing hyphens`, `AC-12 rejects reserved usernames`, `AC-12 rejects reserved usernames in any case` |
| AC-13 | Arabic text is accepted; limits count characters, not bytes. | `AC-13 accepts Arabic text in about and project text`, `AC-13 accepts Arabic in display name and headline`, `AC-13 counts characters, not bytes, for Arabic text` |
| AC-14 | Validation returns data or errors with a path and message; never throws. | `AC-14 returns parsed data on success`, `AC-14 returns errors with a field path and a message`, `AC-14 reports the list index in the path`, `AC-14 never throws on bad input` |
| AC-15 | `npm run typecheck` and `npm test` pass; inferred types are exported. | `npm run typecheck`, `npm test` |

**Files:** `src/schema/constants.ts`, `design.schema.ts`, `content.schema.ts`, `profile.schema.ts`, `index.ts`, `fixtures/`, `__tests__/`. See `docs/ARCHITECTURE.md` for versions.

## F-03 — Renderer

- **Purpose:** turn the design and content documents into the public page, and be the only thing that produces page markup.
- **Depends on:** F-02.
- **Blocks:** F-04, F-05, F-07.
- **Tier:** 1. **Status:** done (2026-11-03, P-004).

**Acceptance criteria (verified 2026-11-03, 106 tests passing, `npm run typecheck`, `npm run lint` and `npm run build` clean):**

| # | Criterion | Test |
| --- | --- | --- |
| AC-1 | `<Portfolio>` renders the display name in exactly one `h1`, the headline, and every visible non-empty section. | `AC-1 renders one h1, the headline and every visible section` |
| AC-2 | Hidden sections are not rendered; visible but empty sections are not rendered; the hero always renders. | `AC-2 skips hidden sections`, `AC-2 skips visible sections with empty content`, `AC-2 keeps the hero when everything is hidden and empty` |
| AC-3 | Sections render in the order given by `design.sections`. | `AC-3 renders sections in the order given by the design document` |
| AC-4 | Every section and display style renders for both world keys, and `data-style` reflects the choice. | 19 tests, `AC-4 renders <section> with <style> in the <world> world`, `AC-4 leaves about and contact without a display style` |
| AC-5 | The theme wrapper sets exactly six color variables, the radius and the two font variables; one token changes one variable. | `AC-5 sets exactly the six colors, the radius and the two fonts`, `AC-5 maps every token to its own variable`, `AC-5 changing one token changes only that variable` |
| AC-6 | A scan of `src/render/` fails on a hard-coded color value. | `AC-6 contains no hard-coded color values` |
| AC-7 | The four radius values map to 0, 0.25rem, 0.5rem and 1rem. | `AC-7 maps the four radius values` |
| AC-8 | External links are `target="_blank" rel="noopener noreferrer"`, email is `mailto:`, user text is escaped, no `dangerouslySetInnerHTML`. | `AC-8 escapes user text and keeps link attributes safe`, `AC-8 does not inject user content as markup` |
| AC-9 | Project images have `alt` equal to the title, lazy loading, and nothing when absent. | `AC-9 renders project images with alt text and lazy loading`, `edge case renders a project that only has a title` |
| AC-10 | Experience dates format as `Mar 2024 – Present`, `Sep 2020 – Jun 2024`, or the start date alone, inside `<time>`. | `AC-10 formats experience dates with machine-readable values`, `AC-10 shows only the start date when there is no end date and current is not set` |
| AC-11 | Skill slugs resolve through `SkillCatalog`; an unknown slug shows the slug. | `AC-11 resolves skill names and falls back to the slug`, `AC-11 resolves skill names through the catalog` |
| AC-12 | User text carries `dir="auto"`; the Arabic fixture uses the cairo variable. | `AC-12 marks user text with dir=auto and uses the cairo variable for Arabic`, `AC-12 uses the cairo variable for the Arabic fixture` |
| AC-13 | The three demo pages render; unknown and invalid usernames return 404, invalid without calling the source. | `AC-13 loads all three demo portfolios`, `AC-13 renders each demo page`, `AC-13 returns not-found for an unknown username`, `AC-13 rejects an invalid username without calling the source`, `AC-13 sends an unknown username to the 404 page`, `AC-13 sends an invalid username to the 404 page` |
| AC-14 | Invalid stored data produces the 404 page, is logged server-side, and never reaches the page. | `AC-14 logs invalid stored data and returns not-found`, `AC-14 hides invalid profile data too`, `AC-14 sends invalid stored data to the 404 page` |
| AC-15 | Title `<displayName> \| Folio`, description equal to the headline with a fallback, Open Graph, robots index and follow. | `AC-15 sets the title, description, open graph and robots`, `AC-15 falls back when the headline is empty` |
| AC-16 | One `h1`, an `h2` per rendered section except the hero, `header` and `main` landmarks, alt text on every image. | `AC-16 keeps one h1, an h2 per section, landmarks and alt text` |
| AC-17 | The route reads data only through `PortfolioSource` and `SkillCatalog`; a test fails on a fixture import. | `AC-17 never imports the fixture data directly`, `AC-17 reads data through the source and catalog interfaces` |
| AC-18 | `typecheck`, `lint`, `test` and `build` pass. | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` |

**Files:** `src/render/` (`Portfolio.tsx`, `theme.tsx`, `fonts.ts`, `font-vars.ts`, `format.ts`, `load.ts`, `types.ts`, `primitives/`, `worlds/`), `src/data/` (interfaces implementation and three fixtures), `src/app/u/[username]/`, `src/app/not-found.tsx`. Screenshots in `docs/screenshots/`.

## F-04 — Design worlds: Editorial and Terminal

- **Purpose:** two visually distinct worlds rendered from the same schema.
- **Depends on:** F-02, F-03.
- **Blocks:** F-06 (world-specific controls).
- **Tier:** 1. **Status:** done (2026-11-03, P-005; corrected by P-005b). Decisions D-043 to D-051.
- **Definition of done:** both worlds render every section and every display style (D-027).

**Acceptance criteria (P-005 numbering, audited against the test suite in P-005b)**

| AC | Requirement | Proof | Status |
| --- | --- | --- | --- |
| AC-1 | `editorial` and `terminal` each register a world with a shell and all six sections; no `base` key. | `AC-1 maps only the two worlds and provides a shell and six sections each`, `AC-1 renders a different page frame for each world` | Met |
| AC-2 | Each world provides a shell and all six sections; every section and display style renders with the right `data-world`, `data-section` and `data-style`. | `AC-2 marks the page with the world the design chose`, 18 × `AC-4 renders <section> with <style> in the <world> world`, `AC-4 leaves about and contact without a display style` | Met |
| AC-3 | The same design renders structurally different markup in each world: the frame, every section and every display style. | `AC-1 renders a different page frame for each world`, `AC-3 gives every section different markup in each world`, `AC-3 gives every display style its own markup inside a world` | Met |
| AC-4 | Navigation lists rendered non-hero sections in design order, skips hidden and empty sections, anchors match ids and work without JavaScript, the skip link is first, and every anchor target clears the sticky chrome. | six `AC-4 ...` tests, `AC-15 makes the skip link the first focusable element`, `AC-4 gives every anchor target a scroll-margin-top` | Met |
| AC-5 | Every color comes from the six theme variables; no color literal in `src/render/`. | `AC-5 uses no hard-coded color values` | Met |
| AC-6 | Radius follows `var(--radius)`; no fixed values. | `AC-6 uses no fixed radius values` | Met |
| AC-7 | Headings use the heading font token, body the body token; Terminal chrome uses the mono face. | `AC-7 keeps headings and body on the theme font variables` | Met |
| AC-8 | Decoration is CSS-generated or `data-decor` with `aria-hidden`, never user text. | `AC-14 hides decorative elements from assistive technology` proves the `aria-hidden` clause; the no-user-text clause has no automated test | Partial |
| AC-9 | No physical left/right rules; Arabic lays out correctly. | `AC-9 uses no physical left or right utilities`, `AC-9 uses no physical left or right declarations`, `AC-9 renders the Arabic fixture in both worlds` | Met |
| AC-10 | Motion is CSS-only, no `"use client"`, no animation library, reduced motion honoured. | `AC-10 disables motion under prefers-reduced-motion`, `AC-16 keeps both worlds server rendered` | Met |
| AC-11 | Both worlds and every section render in the browser at 1280 and 375. | Browser check: 26 full-page captures, `scrollWidth === clientWidth` at both widths; no jsdom-only claim | Met (browser) |
| AC-12 | Every section and style renders under six stress themes without error. | `AC-12 renders every style in both worlds under six stress themes`, `AC-12 uses the light, dark, saturated, pastel, warm and monochrome themes` | Met |
| AC-13 | Twenty-six screenshots exist: seven fixtures at 1280 and 375, plus the two main fixtures under six stress themes. | `docs/screenshots/f04/` (14 fixture + 12 stress captures); `docs/screenshots/f04/README.md` lists fixture, world, theme and width for each | Met (artifact) |
| AC-14 | One `h1`, an `h2` per rendered section, labelled nav, header and main landmarks, alt text, focus styles. | the seven `AC-14 ...` tests and `AC-16 gives every image alt text` | Met |
| AC-15 | The two new fixtures (`demo-editorial-bold`, `demo-terminal-light`) pass the F-02 validators and load; the five earlier demos render as before. | `all seven fixtures pass the F-02 validators`, `demo-editorial-bold matches the P-005 fixture spec`, `demo-terminal-light matches the P-005 fixture spec`, `keeps the five earlier demos on their original worlds`, `AC-13 renders each demo page` | Met |
| AC-16 | Schema untouched; `typecheck`, `lint`, `test` and `build` pass. | Command run: `npm run typecheck`, `npm run lint`, `npm test` (153 tests), `npm run build`; `git diff src/schema` is empty | Met (command) |
| AC-17 | `ARCHITECTURE.md` describes the world structure and folder; this file carries the F-04 table and status. | This section and `docs/ARCHITECTURE.md` § Worlds | Met (docs) |

**P-005b audit note.** The earlier table used a different AC numbering, so several rows named the wrong criterion or overstated their proof. Corrections:

- AC-1 had no test for the registry mapping; added `AC-1 maps only the two worlds and provides a shell and six sections each`.
- AC-2's row now cites the 18 parameterised style tests, which were named under the earlier numbering as `AC-4 renders ...`; the names are unchanged, the criterion is correct here.
- AC-4 now cites the stylesheet scan `AC-4 gives every anchor target a scroll-margin-top` and the skip-link test.
- AC-8 was overstated: the cited test proves `aria-hidden` but not "never user text". The row is marked Partial and the gap is stated.
- AC-11 was a Chrome check presented like a test; it is now labelled a browser check, and the count is 26, not 22.
- AC-12 now names the six themes after the cold navy theme was replaced by the plain light theme in P-005b item 3.
- AC-13 was the wrong criterion (it described the fixture set) and cited `all five fixtures pass the F-02 validators`, a test name that does not exist. It is now the screenshot criterion. It had only the 22 P-005 captures, not the 26 this audit requires; it is met after item 2: 26 captures in `docs/screenshots/f04/`.
- AC-15 was the wrong criterion (it described the skip link) and claimed "all five demo pages". It is now the new-fixtures criterion. The two fixtures were present in the working tree but unpinned by tests; it is met after item 1: the two fixture-spec tests, the seven-fixture validator test and the seven-page render test.
- AC-16's test count is now 153, up from 147.

**Files:** `src/render/worlds/` (`types.ts`, `registry.ts`, `labels.ts`, `editorial/`, `terminal/`, and `base/` kept as a reference), `src/render/sections.ts`, `src/render/Portfolio.tsx`, `src/render/theme.tsx`, `src/render/primitives/` (`Paragraphs`, `ExternalLink`, `ProjectImage`), `src/app/globals.css`, `src/data/fixtures/portfolios.ts`, `docs/screenshots/f04/`.

## F-05 — Content sections and editing

- **Purpose:** let the owner write about, projects, skills, experience or education, and contact links.
- **Depends on:** F-02, F-03.
- **Blocks:** F-06 (editing surface), F-09 (skills data).
- **Tier:** 1. **Status:** not started.

## F-06 — Visual builder

- **Purpose:** edit colors, fonts, corner roundness, section order and display styles, with live preview and readability warnings.
- **Depends on:** F-01, F-02, F-04, F-05.
- **Blocks:** F-07, F-08 (the surface that shows and accepts an AI result).
- **Tier:** 1. **Status:** not started.

## F-07 — Publish to a personal link

- **Purpose:** freeze the current draft and serve it at `/u/<username>`.
- **Depends on:** F-01, F-03, F-06.
- **Blocks:** F-09 (only published portfolios are searchable).
- **Tier:** 1. **Status:** not started.

## F-08 — AI design assistant

- **Purpose:** generate a design from a description, and edit one by request, with every output validated before it is used.
- **Depends on:** F-01, F-02, F-06.
- **Blocks:** nothing.
- **Tier:** 2. **Status:** not started.

## F-09 — Search by name and skill

- **Purpose:** find published portfolios by name and by canonical skill, with autocomplete.
- **Depends on:** F-02, F-05, F-07.
- **Blocks:** nothing.
- **Tier:** 2. **Status:** not started.

## Build order

D-052, amending D-004: **F-02 → F-03 → F-04 → F-01 → F-05 → F-06 → F-07 → F-08 → F-09.**

F-01 moved ahead of F-05 because content editing needs a real place to save. Until F-01 landed the schema, renderer and worlds were verified against fixture data; F-02, F-03, F-04 and F-01 are now done.

F-01 to F-07 without F-09 is a complete page builder but not yet a platform. It is the fallback, not the goal.

## Cut order

D-016, applied in this order if time runs short:

1. Terminal world polish — keep it working, stop refining it.
2. Edit-by-request in F-08 — keep generate-only.
3. Builder extras beyond token editing, section reordering and live preview.

Search is kept, in minimal form: name match plus the skill alias map, autocomplete from a static list.

## Dependency table

| Feature | Depends on | Blocks |
| --- | --- | --- |
| F-01 Auth | — | F-06, F-07, F-08 |
| F-02 Schema | — | F-03, F-04, F-05, F-06, F-08, F-09 |
| F-03 Renderer | F-02 | F-04, F-05, F-07 |
| F-04 Worlds | F-02, F-03 | F-06 |
| F-05 Sections | F-02, F-03 | F-06, F-09 |
| F-06 Builder | F-01, F-02, F-04, F-05 | F-07, F-08 |
| F-07 Publish | F-01, F-03, F-06 | F-09 |
| F-08 AI | F-01, F-02, F-06 | — |
| F-09 Search | F-02, F-05, F-07 | — |

A dependency is a hard block: the dependent feature cannot be verified until the one it depends on exists.
