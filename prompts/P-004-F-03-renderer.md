---
prompt_id: P-004
title: F-03 Renderer, from design and content documents to a public page
type: feature
date: 2026-11-03
author: Abdullah
features: [F-03]
depends_on: [P-003]
status: ready to send
---

# P-004: F-03 Renderer

> Paste everything below the line into DevAI. Follow the order of work at the end.

---

## Before you start

Read `DECISIONS.md` first (D-017), then `docs/ARCHITECTURE.md` and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you find you need a schema change, stop and tell me instead. Do not modify anything in `prompts/`.

Your report on P-003 was good. I accept all four of your ambiguity settlements (trimming URLs, strict profile object, the email cap, and the tooling bumps), and Step 1 records them.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-03.

| ID | Title | Decision |
| --- | --- | --- |
| D-035 | F-02 clarifications | URL values are trimmed before validation. The profile object is strict (unknown keys rejected). Email values use the 2048-character cap. |
| D-036 | Data access | The renderer and routes read data only through two interfaces: `PortfolioSource` (get a profile, design document, and content document by username) and `SkillCatalog` (resolve skill slugs to display names). A fixture implementation is used until F-07 replaces it with the database. |
| D-037 | Base world | F-03 implements one neutral set of section components that supports every section and every display style. Both world keys (`editorial`, `terminal`) point to it until F-04 provides the real worlds. |
| D-038 | Text direction | User-written text containers carry `dir="auto"`, so Arabic text lays out correctly without a direction field (D-024). |
| D-039 | Images | Project images render with a plain lazy-loaded `<img>` and alt text. No `next/image` remote-domain configuration in v1. |
| D-040 | Missing or invalid portfolio | An unknown username, an invalid username format, or stored data that fails validation all produce the standard 404 page. Validation errors are logged server-side and never shown to visitors. |
| D-041 | Empty sections | A section with no content is not rendered, even if it is visible. The hero always renders. |
| D-042 | No color literals | All colors come from CSS variables set from the theme tokens. Render code contains no hard-coded color values. |

## F-03 specification

**ID:** F-03
**Name:** Renderer, from design and content documents to a public page
**Goal:** Turn a profile, a design document, and a content document into a correct, fast, accessible public page at `/u/<username>`. This is the single renderer that every later feature (worlds, builder, AI, publish) feeds.
**User story:** As a visitor, I open a personal link and see the owner's portfolio, rendered from their saved design and content.
**Depends on:** F-02
**Blocks:** F-04, F-05, F-06, F-07

### What to build

1. **Renderer component.** A pure, synchronous `<Portfolio profile design content skills />` that takes already-validated data. All data fetching happens outside it, so it can be tested with `renderToStaticMarkup`.
2. **Theme application.** A wrapper that turns the design document's theme into CSS variables: the six colors, the radius (`none` = 0, `sm` = 0.25rem, `md` = 0.5rem, `lg` = 1rem), and the heading and body font. Load the six fonts from D-028 with `next/font` so they are self-hosted. `cairo` must load both its Arabic and Latin subsets.
3. **World registry.** `worlds/registry.ts` maps a world key to a set of section components. In F-03 both keys map to the base world (D-037).
4. **Base world.** One component per section (hero, about, projects, skills, experience, contact), supporting every display style from D-020. The look is neutral and functional. All colors, radius, and fonts come from the theme variables.
5. **Shared primitives.** Small reusable components that the base world builds on (section wrapper with heading, tag, card, timeline item, external link). F-04 will reuse them.
6. **Data interfaces and fixtures.** `PortfolioSource` and `SkillCatalog` as in D-036, with a fixture implementation and three demo portfolios (see Fixtures).
7. **Public route.** `src/app/u/[username]/page.tsx` plus a not-found page, with metadata.

Follow the folder proposal in `docs/ARCHITECTURE.md`. Record any deviation there.

### Section behavior

| Section | Rendering rule |
| --- | --- |
| hero | Always renders. Shows the display name as the page's single `h1` and the headline. `large` is a prominent layout, `compact` a small header. |
| about | The text, split into paragraphs at blank lines. |
| projects | Title, description, image (if any), link (if any). `grid`: responsive grid of simple tiles. `cards`: bordered cards. `timeline`: a vertical list with a line. |
| skills | Slugs resolved to names through `SkillCatalog`. An unknown slug shows the slug itself. `tags`: pill-shaped tags. `list`: a plain list. |
| experience | Title, organization, dates, description. Dates show as `Mar 2024 – Present`, `Sep 2020 – Jun 2024`, or just the start date when there is no end date and `current` is not set. Items keep their stored order. `timeline`: a vertical list with a line. `list`: a plain list. Education items show an "Education" label. |
| contact | One link per item. `email` renders a `mailto:` link built from the value. Other kinds render the label as an external link. |

Every rendered section has `data-section="<id>"`, and sections with a display style also carry `data-style="<style>"`.

### Fixtures

Create three demo portfolios in `src/data/fixtures/`, each passing the F-02 validators:

- `demo-editorial`: world `editorial`, light theme, all six sections with realistic English content (3 to 4 projects, 6 to 8 skills, 2 to 3 experience items including one education item and one `current`, 3 contact items including an email).
- `demo-terminal`: world `terminal`, a dark theme, a different font pairing, different display styles from the first, full content.
- `demo-minimal`: Arabic `displayName`, `headline`, and `about`; `cairo` fonts; some sections hidden, some visible but empty, and one project with no image and no link.

Add a small skill catalog fixture that covers the slugs used.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `<Portfolio>` renders the display name in exactly one `h1`, the headline, and every visible non-empty section. |
| AC-2 | Sections with `visible: false` are not rendered. Visible sections with empty content are not rendered (D-041). The hero always renders. |
| AC-3 | Sections render in the order given by `design.sections`, for any permutation of the six ids. |
| AC-4 | Every section and display style combination from D-020 renders without error for both world keys, and the `data-style` attribute reflects the chosen style. |
| AC-5 | The theme wrapper sets exactly the six color variables, the radius variable, and the two font variables from the design document. Changing one token changes only that variable. |
| AC-6 | A test scans `src/render/` and fails if it finds a hard-coded color value (hex, `rgb(`, `hsl(`) (D-042). |
| AC-7 | The four radius values map as specified above. |
| AC-8 | External links carry `target="_blank"` and `rel="noopener noreferrer"`. Email renders as `mailto:`. User text containing HTML or `<script>` appears escaped as text and is never injected as markup. The code does not use `dangerouslySetInnerHTML` for user content. |
| AC-9 | Project images render with `alt` equal to the project title, lazy loading, and no broken-image box when absent. |
| AC-10 | Experience dates format as specified, using `<time>` elements with machine-readable values. |
| AC-11 | Skill slugs resolve through `SkillCatalog`, and an unknown slug falls back to the slug text. |
| AC-12 | Text containers for user content carry `dir="auto"`. The Arabic fixture renders with the `cairo` font variable. |
| AC-13 | `/u/demo-editorial`, `/u/demo-terminal`, and `/u/demo-minimal` render. An unknown username returns the 404 page. An invalid username format returns 404 without calling the source. |
| AC-14 | If the source returns data that fails validation, the visitor sees the 404 page, the validation errors are logged server-side, and nothing from the error reaches the page (D-040). |
| AC-15 | The page has a title of the form `<displayName> \| Folio`, a description equal to the headline (with a sensible fallback when empty), Open Graph title and description, and robots set to index and follow. |
| AC-16 | Semantics: one `h1`, an `h2` for every rendered section except the hero, `header` and `main` landmarks, and alt text on every image. |
| AC-17 | The route reads data only through `PortfolioSource` and `SkillCatalog`. A test fails if the route file imports from `src/data/fixtures/`. |
| AC-18 | `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` all pass. |

### Edge cases the tests must cover

- All six sections hidden (hero still renders).
- A content document that is completely empty.
- Projects with only a title.
- A project link and a contact value containing `&`, quotes, and angle brackets.
- A skill list containing an unknown slug.
- An experience item with `current: true`, one with only `startDate`, and one with both dates.
- A very long display name and a very long unbroken word (the layout must not overflow horizontally).
- A username with uppercase letters in the URL (treated as its lowercase form).

### Manual checks for me (report what you could verify)

If you have a headless browser, capture screenshots of all three demo pages at 375 px and 1280 px width, save them to `docs/screenshots/`, and tell me the paths. I will check that there is no horizontal scroll on mobile.

### Out of scope

The real look of the Editorial and Terminal worlds (F-04). The database and authentication. Editing, the builder, and the AI. Search. Image upload. Contrast checking and warnings (F-06). Sitemaps, `robots.txt`, and caching strategy. Any change to `src/schema/`.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. If the sandbox cannot download the fonts, stop and tell me. Do not substitute other fonts.
3. Do not add fields, enums, or limits that are not in the frozen schemas.
4. Record anything new in `DECISIONS.md` and `docs/`, not only in code comments.
5. Reference `P-004` and `F-03` in every commit message.

## Order of work

1. Step 1, documentation updates.
2. Interfaces and fixtures, then the theme and fonts.
3. Primitives, then the base world components, then `<Portfolio>`.
4. The route, metadata, and not-found page.
5. Tests, then run all four commands until they pass.
6. In `docs/FEATURES.md`, copy the acceptance criteria table into the F-03 section and set its status to done, but only if every criterion passes. Update the folder tree in `docs/ARCHITECTURE.md`.

## Definition of done

- Every acceptance criterion passes.
- `DECISIONS.md` contains D-035 to D-042.
- The three demo pages work in the browser.
- No file in `src/schema/` or `prompts/` has changed.

## Report back

Reply with:

1. A table of acceptance criteria and test results.
2. The list of files created or changed.
3. Anything you could not implement as written, or any rule that was ambiguous.
4. Screenshot paths, if you could capture them.
5. The command to start the dev server and the three URLs to open.
