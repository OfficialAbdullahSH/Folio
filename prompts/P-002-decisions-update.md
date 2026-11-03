---
prompt_id: P-002
title: Resolve open questions and update the documentation
type: documentation (no app code)
date: 2026-11-03
author: Abdullah
features: [F-02, F-04, F-05, F-06, F-09]
depends_on: [P-000, P-001]
status: answered
---

# P-002: Resolve open questions and update the documentation

> Paste everything below the line into DevAI. Documentation only. Do not scaffold the app, install packages, or write application code.

---

## Goal

Your report on P-001 was accurate, and I agree with all four contradictions and all eight open questions. This prompt answers them, corrects the docs, and prepares the ground for the schema prompt (P-003).

## Before you start

The `prompts/` folder now exists in the repo. It contains `P-000-idea-brief.md`, `P-001-project-documentation.md`, this file, and `INDEX.md`. Read `DECISIONS.md` first, as agreed in D-017. Do not modify anything in `prompts/`.

## 1. Corrections to existing files

1. **Path references.** Anywhere the docs refer to `P-000-idea-brief.md`, change the path to `prompts/P-000-idea-brief.md`.
2. **D-009.** Keep the decision (guardrails warn and never block). Replace the reason with this: "The owner's original project description said guardrails would block unreadable color combinations. For the one-week deadline, v1 warns instead. P-000 only says 'readability guardrails', so this is a change from the original description, not from P-000."
3. **D-016.** Add this note: "This order deliberately overrides P-000, which says F-08 and F-09 are the first to simplify. Search is what makes Folio a platform, so it is kept in minimal form."
4. **D-002.** Clarify that "the design file" means the design document only (see D-019).
5. **`docs/FEATURES.md`.** Add a note under the build order: "F-01 to F-07 without F-09 is a complete page builder but not yet a platform. It is the fallback, not the goal."
6. **`docs/ARCHITECTURE.md`.** Update security rules S-6 and S-8 with the numbers in D-025, so they can be tested. Update the data model section to match D-019 to D-026.

## 2. Status changes

These Proposed decisions are now confirmed. Change their status to **Decided**: D-005, D-006, D-007, D-008, D-009, D-016, D-018.

D-013 (LLM provider) stays **Open**. It must be resolved by day 4, before F-08, and it does not block the schema.

## 3. New decisions

Add these to `DECISIONS.md`, with status **Decided**, dated 2026-11-03. Keep the IDs.

| ID | Title | Decision | Reason |
| --- | --- | --- | --- |
| D-019 | Two documents, not one | A portfolio has a **design document** (`version`, `world`, theme tokens, section order, display styles) and a **content document** (the data of each section). They are joined by portfolio id. | The AI changes design only and can never overwrite the owner's text. It also separates F-06 (design) from F-05 (content). |
| D-020 | Display styles | Closed set, validated in the schema. Projects: `grid`, `cards`, `timeline`. Skills: `tags`, `list`. Experience and education: `timeline`, `list`. Hero: `large`, `compact`. Every world must support every style. | A small closed set is testable and keeps both worlds equivalent in capability. |
| D-021 | Fonts | A curated enum of 6 to 8 fonts, self-hosted. At least one must support Arabic text. The schema stores a font key, never a free font name. | An enum is easy to validate, and self-hosting keeps pages fast. |
| D-022 | Profile fields | Username, display name, and headline are **profile fields**, stored outside both documents. Search indexes the profile and the skills table. | The name is not design or section content, and this keeps search simple. |
| D-023 | Version field | The design document has `version: 1` from the start. | It costs one line now. Adding it later means migrating every saved portfolio. |
| D-024 | Text direction | No `direction` field in v1. Arabic text must still render correctly in both worlds. Full RTL layout is out of scope. | It matches the original scope ("Arabic/RTL beyond the basics" can wait). |
| D-025 | Limits | AI generation: 10 per user per day. Image uploads: 2 MB maximum, JPEG, PNG, or WebP only. | The rules in D-012 and D-014 need numbers to be testable. |
| D-026 | Skill list | A seeded database table (skills plus aliases), loaded from a seed file in the repo. The schema and the search join reference skill ids. | Autocomplete and search both read it, and aliases resolve to one canonical skill. |
| D-027 | F-04 definition of done | Both worlds (Editorial and Terminal) must render every section and every display style. Only polish is cuttable, never the world itself. Terminal's minimum bar is defined in its own feature spec. | It resolves the contradiction you found between F-04, success criterion 3, and D-003. |

## Rules

1. Documentation only. No scaffolding, no `package.json`, no application code.
2. Do not change any decision that this prompt does not mention.
3. Do not invent requirements. If something is unclear, mark it **Open** and tell me.
4. Keep the existing IDs. New decisions continue from D-019.

## Definition of done

- `DECISIONS.md` has D-001 to D-027, with statuses as specified here (D-013 is the only Open entry).
- The six corrections in section 1 are applied.
- S-6 and S-8 in `docs/ARCHITECTURE.md` contain the numbers from D-025.
- No file outside the five existing docs was created or changed.

## Report back

Reply with:

1. A short list of what changed in each file.
2. Anything in these decisions that conflicts with an earlier one, or that you cannot implement as stated.
3. Anything you still need decided before the schema prompt, as a short list.

## Result

Answered 2026-11-03. Applied all six corrections, moved seven Proposed entries to Decided, added D-019 to D-027, rewrote the ARCHITECTURE data model section, and put the D-025 numbers into S-6 and S-8. Flagged two new conflicts: D-003 vs D-027, and D-010's static autocomplete list vs D-026's seeded table. Left six schema questions open (font keys, section fields, join key, theme tokens, reserved usernames, skill entry); the owner answered all of them in P-003. Accepted by the owner.
