---
prompt_id: P-003
title: F-02 Design, content, and profile schemas with validation
type: feature (first code prompt)
date: 2026-11-03
author: Abdullah
features: [F-02]
depends_on: [P-000, P-001, P-002]
status: ready to send
---

# P-003: F-02 Schemas with validation

> Paste everything below the line into DevAI. This is the first prompt that produces code. Follow the order of work at the end.

---

## Before you start

Read `DECISIONS.md` first (D-017). Read `docs/ARCHITECTURE.md` and `docs/FEATURES.md`. Do not modify anything in `prompts/`.

## Step 1: Documentation updates (do these first)

In `DECISIONS.md`:

1. Amend **D-003**: add the clause "partly superseded by D-027: both worlds must exist, and only polish is cuttable."
2. Amend **D-010**: replace "Autocomplete comes from a static list" with "Autocomplete reads the seeded skills table (see D-026)."
3. Add the following decisions, status **Decided**, dated 2026-11-03.

| ID | Title | Decision |
| --- | --- | --- |
| D-028 | Font keys | The enum is exactly: `inter`, `space-grotesk`, `playfair-display`, `lora`, `jetbrains-mono`, `cairo`. All are open-licence Google Fonts, self-hosted. `cairo` is the Arabic-capable font. |
| D-029 | Section inventory | Six sections: `hero`, `about`, `projects`, `skills`, `experience`, `contact`. Field definitions are in the F-02 spec below. |
| D-030 | Section ids | Section ids are the fixed six above. Each appears exactly once in a design document. The design document stores order, visibility, and display style. The content document stores the data. |
| D-031 | Theme tokens | Six color roles (`background`, `surface`, `text`, `muted`, `accent`, `border`), a heading font, a body font, and a corner `radius`. No spacing or density controls in v1. |
| D-032 | Username rules | 3 to 30 characters, lowercase letters, digits, and hyphens only, no leading or trailing hyphen. A reserved list is blocked (list in the F-02 spec). |
| D-033 | Closed skill list | Users pick skills from the seeded table only. Free-typed skills do not exist in v1. Unknown skill ids are rejected when saving (enforced in F-05 and F-09, not in F-02). |
| D-034 | Schema freeze | When F-02 passes all its acceptance criteria, the schemas are frozen at `version: 1`. Any later change needs a new decision entry with a reason, and a migration note. |

## Step 2: Project setup (minimum needed to run F-02)

Initialize the Next.js app: TypeScript, App Router, `src/` directory, Tailwind, ESLint. Do not build any pages or components beyond what the generator creates. Install Zod and Vitest. Add scripts `test` and `typecheck`. Record the Zod and Next.js versions in `docs/ARCHITECTURE.md`.

## F-02 specification

**ID:** F-02
**Name:** Design, content, and profile schemas with validation
**Goal:** Define, in code, the exact shape of everything the renderer (F-03), the builder (F-06), and the AI (F-08) will read or write. After this feature, no other feature may invent a field.
**User story:** As the developer, I need one validated definition of a portfolio so that the AI and the builder can only produce data the renderer can display.
**Depends on:** nothing
**Blocks:** F-03, F-04, F-05, F-06, F-08, F-09

### Files to create

| File | Purpose |
| --- | --- |
| `src/schema/constants.ts` | All enums and limits: worlds, fonts, radius values, display styles, reserved usernames, field length limits |
| `src/schema/design.schema.ts` | Zod schema and inferred type for the design document |
| `src/schema/content.schema.ts` | Zod schema and inferred type for the content document |
| `src/schema/profile.schema.ts` | Zod schema for username, display name, headline |
| `src/schema/index.ts` | Exports, plus `validateDesign`, `validateContent`, `validateProfile` |
| `src/schema/fixtures/` | Valid and invalid example data (see Tests) |
| `src/schema/__tests__/` | Vitest tests |

### Design document

```
{
  version: 1,
  world: "editorial" | "terminal",
  theme: {
    colors: { background, surface, text, muted, accent, border },
    headingFont: <font key>,
    bodyFont: <font key>,
    radius: "none" | "sm" | "md" | "lg"
  },
  sections: [
    { id: "hero",       visible, displayStyle: "large" | "compact" },
    { id: "about",      visible },
    { id: "projects",   visible, displayStyle: "grid" | "cards" | "timeline" },
    { id: "skills",     visible, displayStyle: "tags" | "list" },
    { id: "experience", visible, displayStyle: "timeline" | "list" },
    { id: "contact",    visible }
  ]   // in display order; exactly these six ids, each once
}
```

Colors are `#RRGGBB` hex strings, accepted in either case and normalized to lowercase. `about` and `contact` have no display style. Unknown keys are rejected at every level.

### Content document

```
{
  version: 1,
  about:      { text },                      // plain text, max 1500 chars, blank line = paragraph break
  projects:   { items: [ { id, title, description, imageUrl?, link? } ] },   // max 12
  skills:     { skillIds: [ <skill slug> ] },                                // max 30, no duplicates
  experience: { items: [ { id, kind, title, organization, startDate, endDate?, current?, description? } ] },  // max 10
  contact:    { items: [ { id, kind, label, value } ] }                      // max 8
}
```

Field rules:

- `id` on every item: a UUID, unique within its list.
- Project: `title` 1 to 80 chars, `description` 0 to 400, `imageUrl` and `link` optional, `http` or `https` only, max 2048 chars (D-014). `javascript:`, `data:`, and similar schemes must be rejected.
- Skill slug: `^[a-z0-9-]+$`, max 40 chars. The schema checks format only. Whether the slug exists in the skills table is checked elsewhere (D-033).
- Experience: `kind` is `experience` or `education`. `title` and `organization` 1 to 80 chars. `startDate` and optional `endDate` use `YYYY-MM` with month 01 to 12. `endDate` must not be before `startDate`. `current: true` and `endDate` cannot both be present. `description` 0 to 300.
- Contact: `kind` is `email`, `github`, `linkedin`, `website`, `x`, or `other`. `label` 1 to 40 chars. For `email`, `value` must be a valid email address. For every other kind, `value` must be an `https` URL (or `http`).
- No hero content. The hero renders profile fields (D-022).

### Profile (outside both documents, D-022)

- `username`: rules in D-032, and not in the reserved list.
- `displayName`: 1 to 60 chars.
- `headline`: 0 to 120 chars.

Reserved usernames (exact list): `admin`, `administrator`, `api`, `app`, `assets`, `auth`, `builder`, `dashboard`, `editor`, `folio`, `help`, `login`, `logout`, `me`, `public`, `register`, `root`, `search`, `settings`, `signup`, `static`, `support`, `terms`, `privacy`, `u`, `www`, `about`, `_next`.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | A valid design document for each world parses successfully. |
| AC-2 | A design document with `version` other than `1`, an unknown `world`, or any unknown key is rejected. |
| AC-3 | `sections` must contain exactly the six ids, each once. A missing, duplicate, or unknown id is rejected. Any order of the six is accepted. |
| AC-4 | A display style that is not allowed for its section (for example `projects` with `tags`) is rejected. |
| AC-5 | Colors that are not `#RRGGBB` are rejected. Uppercase input is accepted and output lowercase. |
| AC-6 | A font key outside the six in D-028, or a radius outside the four values, is rejected. |
| AC-7 | A valid content document parses. Unknown keys are rejected. All list maximums and string length limits in this spec are enforced. |
| AC-8 | Links and image URLs with schemes other than `http` and `https` are rejected, including `javascript:`, `data:`, and `ftp:`. |
| AC-9 | Duplicate item ids in a list are rejected. Duplicate skill slugs are rejected. |
| AC-10 | Experience dates: invalid months, an end before the start, and `current: true` together with `endDate` are all rejected. |
| AC-11 | Contact items: an invalid email for `email`, and a non-URL for other kinds, are rejected. |
| AC-12 | Profile: usernames shorter than 3 or longer than 30 characters, uppercase letters, leading or trailing hyphens, characters outside `a-z 0-9 -`, and every name on the reserved list are rejected. Reserved-list matching is case-insensitive. |
| AC-13 | Arabic text is accepted in `about`, project text, `displayName`, and `headline`. Length limits count characters, not bytes. |
| AC-14 | Validation functions return a result with either the parsed data or a list of errors that each include the field path and a readable message. They never throw on bad input. |
| AC-15 | `npm run typecheck` and `npm test` both pass. The inferred TypeScript types are exported for use by later features. |

### Edge cases the tests must cover

- Empty strings, whitespace-only strings, and `null` for required text fields.
- A string at exactly the maximum length (accepted) and one character over (rejected).
- Empty lists (accepted for projects, skills, experience, and contact).
- A project with `link` but no `imageUrl`, and the reverse.
- Mixed-case reserved names such as `Admin`.
- A design document with all sections `visible: false`.
- A URL with leading or trailing whitespace.

### Tests

Create fixtures: valid design for each world, one valid full content document, one empty content document, one valid profile. Add at least one invalid fixture or inline case per acceptance criterion. Name each test with its AC number (for example `AC-8 rejects javascript: links`) so the criteria trace to the tests.

### Out of scope

Any page, component, or renderer. Database tables. Contrast checking (that is F-06). Checking that a skill slug exists in the table (F-05 and F-09). JSON Schema export for the AI (F-08 will add it if needed). Image upload size and type checks (enforced at upload time, F-05).

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Do not add fields, enums, or limits that are not written here.
3. Use `docs/` and `DECISIONS.md` as the place to record anything new. Do not leave decisions only in code comments.
4. Reference `P-003` and `F-02` in every commit message.

## Order of work

1. Step 1, documentation updates.
2. Step 2, setup.
3. Constants, then the three schemas, then `index.ts`.
4. Fixtures and tests.
5. Run typecheck and tests until both pass.
6. In `docs/FEATURES.md`, copy the acceptance criteria table into the F-02 section and set its status to done, but only if every criterion passes.

## Definition of done

- All files listed above exist and every acceptance criterion passes.
- `DECISIONS.md` contains D-028 to D-034, and D-003 and D-010 are amended.
- `docs/ARCHITECTURE.md` names the schema files and the library versions.
- No application code exists outside `src/schema/`, apart from the generator's defaults.

## Report back

Reply with:

1. A table of acceptance criteria and their test results.
2. The final list of files created or changed.
3. Anything you could not implement as written, or any rule that is ambiguous when you wrote the test for it.
4. The exact commands to run the tests myself.

## Result

_pending — implementation handed to the Developer agent._
