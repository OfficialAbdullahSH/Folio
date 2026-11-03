# Features

Every feature is **not started**. Acceptance criteria arrive with each feature prompt and are pasted into this file by the owner.

Tiers: **1** = required for a complete product (F-01 to F-07). **2** = simplifiable if time runs short (F-08, F-09).

## F-01 — Sign up, log in, log out

- **Purpose:** give each owner an account that owns exactly one portfolio.
- **Depends on:** nothing (Supabase Auth).
- **Blocks:** F-06 (saving edits), F-07 (ownership of a link), F-08 (per-user limits).
- **Tier:** 1. **Status:** not started.

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
- **Tier:** 1. **Status:** not started.

## F-04 — Design worlds: Editorial and Terminal

- **Purpose:** two visually distinct worlds rendered from the same schema.
- **Depends on:** F-02, F-03.
- **Blocks:** F-06 (world-specific controls).
- **Tier:** 1. **Status:** not started.
- **Definition of done:** both worlds render every section and every display style (D-027).

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

D-004: **F-02 → F-03 → F-04 → F-05 → F-01 → F-06 → F-07 → F-08 → F-09.**

Until F-01 lands, use fixture data: the schema, renderer, worlds and sections are all verifiable without an account.

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
