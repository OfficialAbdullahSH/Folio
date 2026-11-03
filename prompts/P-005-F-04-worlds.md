---
prompt_id: P-005
title: F-04 Design worlds, Editorial and Terminal
type: feature
date: 2026-11-03
author: Abdullah
features: [F-04]
depends_on: [P-004]
status: ready to send
---

# P-005: F-04 Design worlds

> Paste everything below the line into DevAI. Follow the order of work at the end.

---

## Before you start

Read `DECISIONS.md` first (D-017), then `docs/ARCHITECTURE.md` and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you need a schema change, stop and tell me instead. Do not modify anything in `prompts/` except to add this file's `## Result` section when I ask.

## Why this feature matters

The core promise of Folio is that **two portfolios should feel like two different websites, not one template in different colors.** The schema is frozen, so the variation has to come from three places:

1. **The world.** Editorial and Terminal must differ in structure, navigation, typography treatment, and feel. If you could confuse them after swapping the colors, F-04 has failed.
2. **The tokens.** Palette, fonts, and corner roundness must change the look strongly and always look intentional, whatever values the owner picks.
3. **The layout choices.** Hero style, display styles, and section order must each visibly change the page.

You cannot see images, so do not try to judge the visual quality yourself. Build to the written direction below, and report your design choices so I can review them against the screenshots.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-03. Amend `docs/ARCHITECTURE.md` to match.

| ID | Title | Decision |
| --- | --- | --- |
| D-043 | World structure | A world is a **shell** plus six section components. The registry entry is `{ Shell, sections }`. The shell receives the navigation items and renders the skip link, the navigation, and the page frame around the sections. This extends D-037. |
| D-044 | Color roles | All worlds use the six roles the same way: `background` is the page, `surface` is panels, cards, and windows, `text` is primary text, `muted` is secondary text, labels, and dates, `accent` is links, markers, emphasis, and the focus ring, `border` is rules, dividers, and outlines. Tints are made with `color-mix()` of these variables, never with literals. |
| D-045 | Decorative elements | Decoration (numerals, prompt glyphs, window dots, rules, file labels) is produced with CSS pseudo-elements and counters, or with elements carrying `data-decor` and `aria-hidden="true"`. Decoration is never derived from user text and never contains user text. |
| D-046 | Chrome fonts | Headings use the heading font token and body text uses the body font token in both worlds. Terminal chrome (prompt glyphs, labels, file labels, tab strip) uses the `jetbrains-mono` variable. Editorial chrome (numerals, labels) uses the body font. |
| D-047 | Motion | Motion is CSS only. World components are server components, with no `"use client"` and no animation libraries. Any animation or transition must be disabled under `prefers-reduced-motion: reduce`. Motion is in the polish tier (D-050). |
| D-048 | Logical properties | World code uses logical CSS properties (start/end, inline/block) instead of left/right, so Arabic text lays out correctly (D-024, D-038). |
| D-049 | Navigation | Navigation is server-rendered anchor links to the rendered, non-hero sections, in design order. It works without JavaScript. A skip-to-content link is the first focusable element. |
| D-050 | Minimum bar and polish tier | The minimum bar and the polish tier for each world are defined in the F-04 spec below. Decision D-016's first cut applies only to the polish tier. A world below the minimum bar is not done (D-027). |
| D-051 | Known limit of uniqueness | With the frozen schema, variation per portfolio comes from: world, six colors, two fonts from six, radius, section order and visibility, hero style, and display styles. Adding more levers (more worlds, per-world variants) would be a schema change and needs its own decision. |

## F-04 specification

**ID:** F-04
**Name:** Design worlds, Editorial and Terminal
**Goal:** Replace the neutral base world with two genuinely different worlds, each with its own page structure, navigation, typographic treatment, and feel, both fully driven by the design tokens.
**User story:** As a portfolio owner, I pick a world and my portfolio looks and navigates like a different kind of site from someone who picked the other.
**Depends on:** F-03
**Blocks:** F-06, F-08

### What to build

1. Extend `worlds/types.ts` and the registry for D-043. Both worlds implement the shell and the six sections, each supporting every display style from D-020.
2. `src/render/worlds/editorial/` and `src/render/worlds/terminal/`, with their own stylesheet each, scoped under `[data-world="editorial"]` and `[data-world="terminal"]`. The theme wrapper sets `data-world`.
3. Reuse the shared primitives from F-03 where they fit, and extend them if needed.
4. Keep the base world in place as a reference. No registry key maps to it any more.
5. Add two fixtures (see Fixtures).

### Editorial direction (magazine)

Typographic and spacious. The heading font does the work: large, tight, confident.

- **Shell:** a masthead at the top with the display name and a numbered section index (`01`, `02`, and so on, produced with CSS counters). On mobile the index collapses into a `<details>` menu. Content sits in an asymmetric column grid with a narrow margin column for numerals, dates, and labels.
- **Section headings:** large, with a CSS numeral and a thin rule in `border`.
- **hero:** `large` is an oversized name spanning the width, with the headline as a deck beneath it and a rule. `compact` is a slim title bar.
- **about:** a comfortable reading measure, with a larger first paragraph.
- **projects:** `grid` is an asymmetric editorial grid with numbered entries. `cards` are image-led with a caption. `timeline` is an index list with large numerals.
- **skills:** `tags` are outlined labels. `list` is a ruled two-column list.
- **experience:** `timeline` has a vertical rule with dates in the margin column. `list` is ruled rows with dates aligned to the end.
- **contact:** large underlined links, like a colophon.

### Terminal direction (developer)

Structured and technical. Everything feels like tools and files.

- **Shell:** at 1024 px and wider, a fixed sidebar acting as an explorer, listing the sections like files. Below that, a horizontally scrollable tab strip, where only the strip scrolls and never the page. The main area is a set of panes. Window dots and title bars are decorative (D-045).
- **Section headings:** a prompt glyph (`$` or `>`) before the heading, via a pseudo-element. The heading text stays "About", "Projects", and so on.
- **hero:** `large` is a window pane with prompt-style lines framing the name and headline. `compact` is a single-line prompt.
- **about:** a framed pane with a title bar.
- **projects:** `grid` is a grid of panes with numbered file labels (`01_project`, `02_project`, made from a CSS counter, never from the title). `cards` are windows with title bars. `timeline` looks like a version-control log: a marker per entry, a vertical line, and the title and description beside it.
- **skills:** `tags` are bracketed labels. `list` is lines with a leading prompt marker.
- **experience:** `timeline` is a log with `+` markers. `list` is table-like rows with the date in a fixed-width column.
- **contact:** a key and value list, with the kind as the key.

### Rules both worlds must follow

- Never assume the background is light or dark, or that the accent is bright. Surfaces, tints, and borders come only from the six roles (D-044).
- Radius must be visible everywhere it applies: cards, tags, buttons, images, panes, tiles. With `none`, nothing is rounded. Use the radius variable, and use `rounded-full` only for decorative circles.
- Focus-visible styles on every link and control, using `accent`.
- Section ids: each rendered section element has an `id` equal to its section id, so navigation anchors work.
- Layout never overflows horizontally at 375 px. Long names and long unbroken words must wrap.

### Minimum bar and polish tier (D-050)

**Minimum bar (must exist in both worlds):** the distinct shell and navigation, the numbered or prompt-style section headings, all six sections in all their display styles with the structure described above, the radius and role rules, Arabic-safe layout, and the accessibility rules.

**Polish tier (cuttable first, in this order):** scroll-reveal and hover motion, the blinking cursor and typing feel in Terminal, the drop-cap and pull-quote feel in Editorial, fine spacing and detail refinements.

If you are short of time, build the minimum bar completely in both worlds before any polish in either.

### Fixtures

Keep the three existing demos unchanged. Add two:

- `demo-editorial-bold`: world `editorial`, a saturated palette (background `#f4e04d`, surface `#fff6b8`, text `#111111`, muted `#4a4a2a`, accent `#d6249f`, border `#111111`), `space-grotesk` headings with `inter` body, radius `none`, hero `compact`, and projects `grid`, skills `list`, experience `list`. Full content.
- `demo-terminal-light`: world `terminal`, a light palette (background `#f6f3ea`, surface `#ffffff`, text `#2b2b2b`, muted `#6b6b5e`, accent `#0b7a5b`, border `#cfc9b8`), `lora` headings with `inter` body, radius `lg`, hero `compact`, and projects `cards`, skills `tags`, experience `timeline`. Full content.

Both must pass the F-02 validators.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | The registry maps `editorial` to the Editorial world and `terminal` to the Terminal world. No key maps to the base world. |
| AC-2 | Each world provides a shell and all six sections, and every section and display style combination from D-020 renders without error, with `data-world`, `data-section`, and `data-style` set correctly. |
| AC-3 | For the same design and content, the two worlds produce structurally different markup: different shell navigation variants (`data-nav="masthead"` and `data-nav="sidebar"`), and different markup for every section and style combination. |
| AC-4 | Navigation: a `nav` with an accessible label lists exactly the rendered, non-hero sections in design order. Each link's anchor matches a section element `id`. Hidden and empty sections are absent. A skip link is the first focusable element. All of this works with no client JavaScript. |
| AC-5 | A test scan of `src/render/`, including `.css` files, finds no color literals (hex, `rgb(`, `hsl(`). Tints use `color-mix()` of the variables. |
| AC-6 | A test scan of the world sources finds no fixed radius values or numeric radius classes. Only the radius variable, `0`, and `rounded-full` on decorative circles are allowed. |
| AC-7 | Headings and body use the heading and body font variables. Terminal chrome uses the `jetbrains-mono` variable, and Editorial chrome uses the body font (D-046). |
| AC-8 | Every element with `data-decor` carries `aria-hidden="true"`. No decorative element contains user text, and no decoration is derived from user text (D-045). |
| AC-9 | World sources use logical properties. A test scan fails on `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, and physical `margin-left`-style declarations, except for entries on an allowed-exceptions list that each carry a comment explaining why. `demo-minimal` (Arabic) renders in both worlds. |
| AC-10 | Any `@keyframes`, `animation`, or `transition` in a world stylesheet is covered by a `prefers-reduced-motion: reduce` override in the same file. No world file contains `"use client"`. |
| AC-11 | Browser check, reported by you: for all five fixtures, at 375 px and 1280 px, `scrollWidth` equals `innerWidth`. |
| AC-12 | Stress themes: six test themes (light, dark, high saturation, low-contrast pastel, warm earthy, monochrome), defined as test data, render every section and style combination in both worlds without error. |
| AC-13 | Screenshots saved to `docs/screenshots/f04/`: all five fixtures in their own worlds at 1280 px and 375 px, plus `demo-editorial` and `demo-terminal` each under the six stress themes at 1280 px. |
| AC-14 | Accessibility: one `h1`, an `h2` per rendered section except the hero, a labelled `nav`, `header` and `main` landmarks, alt text on images, and visible focus styles defined for links in both worlds. |
| AC-15 | The new fixtures pass the F-02 validators and load at `/u/demo-editorial-bold` and `/u/demo-terminal-light`. The three earlier demos render as before. |
| AC-16 | `src/schema/` is unchanged. All earlier tests still pass. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-17 | `docs/ARCHITECTURE.md` documents the world structure, the color-role mapping, and the minimum bar. `docs/FEATURES.md` has the F-04 table and status. |

### Edge cases the tests must cover

- A design with every section hidden: the shell and hero render, and the navigation is empty or omitted without leaving an empty `nav` element.
- Only one non-hero section rendered.
- Section order reversed, and the navigation following it.
- Very long display name and long unbroken words in project titles.
- A project title that looks like markup or contains `$` and `>` characters, rendered as plain text in both worlds.
- `radius: none` and `radius: lg` on both worlds.
- Arabic content in the Terminal world, with decorative prompt glyphs not disturbing the text direction.

### Out of scope

Any change to the schemas. A third world. The builder, the AI, and search. Contrast checking and warnings (F-06). Custom section titles. New dependencies: do not add any library without asking me first, including animation and icon libraries.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Build the minimum bar fully in both worlds before any polish.
3. Do not add fields, enums, or limits that are not in the frozen schemas.
4. Record anything new in `DECISIONS.md` and `docs/`, not only in code comments.
5. Reference `P-005` and `F-04` in every commit message.
6. Do not claim a design looks good. Report the choices you made and let me review the screenshots.

## Order of work

1. Step 1, documentation updates.
2. Extend the world types and registry for the shell.
3. Editorial world, minimum bar first.
4. Terminal world, minimum bar first.
5. Fixtures, then tests and the scan tests.
6. Browser checks and screenshots.
7. Polish tier, only if the minimum bar passes everywhere.
8. Documentation updates, then run all four commands until they pass.

## Definition of done

- Every acceptance criterion passes, and both worlds meet the minimum bar.
- `DECISIONS.md` contains D-043 to D-051.
- All five demo pages work in the browser.
- No file in `src/schema/` has changed.

## Report back

Reply with:

1. A table of acceptance criteria and test results.
2. The files created or changed.
3. A list of the concrete design choices you made in each world that the direction did not specify, so I can review them.
4. What from the polish tier you built, and what you left out.
5. Anything you could not implement as written, or any rule that was ambiguous.
6. Screenshot paths, and the URLs of the five demos.

# Folio prompt traceability index

Every prompt sent to DevAI is saved as its own file in this folder: `P-XXX-short-name.md`. Each prompt file records its prompt ID, the feature IDs it covers, the date, and its status. This table links them.

| Prompt | File | Feature(s) | Purpose | Sent | Status |
| --- | --- | --- | --- | --- | --- |
| P-000 | P-000-idea-brief.md | F-01 to F-09 (context) | Explain the product to DevAI, no code | 2026-11-03 | answered, accepted |
| P-001 | P-001-project-documentation.md | F-01 to F-09 (docs) | Create README, product, features, architecture docs and decision log | 2026-11-03 | answered, accepted |
| P-002 | P-002-decisions-update.md | F-02, F-04, F-05, F-06, F-09 (docs) | Resolve open questions, correct docs, add D-019 to D-027 | 2026-11-03 | answered, accepted |
| P-003 | P-003-F-02-schema.md | F-02 | Design, content, profile schemas with Zod validation and tests; adds D-028 to D-034 | 2026-11-03 | answered, accepted |
| P-004 | P-004-F-03-renderer.md | F-03 | Renderer, theme, base world, fixtures, public route; adds D-035 to D-042 | 2026-11-03 | answered, accepted |
| P-005 | P-005-F-04-worlds.md | F-04 | Editorial and Terminal worlds, shells, navigation, two new fixtures; adds D-043 to D-051 | 2026-11-03 | ready to send |

## Feature checklist

| Feature | Name | Prompt(s) | Implemented | Verified |
| --- | --- | --- | --- | --- |
| F-01 | Sign up, log in, log out | | | |
| F-02 | Design file schema + validation | P-003 | yes (44 tests) | pending owner check |
| F-03 | Renderer: design file to public page | P-004 | yes (106 tests total) | pending owner check |
| F-04 | Design worlds: Editorial, Terminal | P-005 | | |
| F-05 | Content sections and editing | | | |
| F-06 | Visual builder | | | |
| F-07 | Publish to personal link | | | |
| F-08 | AI design assistant | | | |
| F-09 | Search by name and skill | | | |

## Conventions

- One prompt per file. If a prompt needs a fix, save the new version as a new file (for example `P-004b-...`) instead of overwriting the old one.
- Record DevAI's response summary and the verification result in the prompt's file under a `## Result` heading after each run.
