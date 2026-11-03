---
prompt_id: P-001
title: Project documentation and decision log
type: documentation (no app code)
date: 2026-11-03
author: Abdullah
features: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09]
depends_on: [P-000]
status: answered
---

# P-001: Project documentation and decision log

> Paste everything below the line into DevAI. This prompt produces documentation only. Do not scaffold the app, install packages, or write application code.

---

## Goal

Create the written foundation of the Folio repository, so that every later feature prompt can point at it. You told me in your reply to P-000 that the repo is your memory between sessions. This prompt builds that memory.

## Context

Read `prompts/P-000-idea-brief.md` first. It describes the product, users, v1 features (F-01 to F-09), stack proposal, and the one-week deadline. Your reply to it was good, and several of your points become decisions below.

**Do not modify anything in the `prompts/` folder.** It is the traceability record, maintained by me.

## Files to create

### 1. `README.md`
A short front door: what Folio is (3 to 4 sentences), current status, where the docs live, and how to run the project (write "not yet scaffolded" for now).

### 2. `docs/PRODUCT.md`
Product description, derived from P-000: what Folio is, the two core ideas (design as data, create and discover), primary and secondary users, the problem and why Folio over existing tools, v1 scope, out-of-scope list, and v1 success criteria. Keep the honest caveat about competition. Do not invent features.

### 3. `docs/FEATURES.md`
One section per feature F-01 to F-09, each with: ID, name, one-sentence purpose, depends on, priority tier, and status (all "not started"). Also include:
- The build order: F-02, F-03, F-04, F-05, F-01, F-06, F-07, F-08, F-09.
- The cut order if time runs short, taken from D-016 in the decision log below.
- A dependency table showing which features block which.

Do not write acceptance criteria yet. Those arrive in the feature prompts, and I will paste them into this file myself.

### 4. `docs/ARCHITECTURE.md`
- The stack and the reason for each choice (from P-000, as refined by the decisions below).
- The "design as data" principle: one design file, one renderer, and the rule that the builder and the AI both only change the design file.
- Data flow diagrams in text or Mermaid: (a) visitor opens a public page, (b) owner edits in the builder, (c) AI generates a design, (d) visitor searches.
- A proposed folder structure for the Next.js app. This is a proposal only, so do not create the folders.
- Security rules, taken from D-011, D-012, and D-014 below. State each as a rule that code can be checked against.
- Names of the files that will become the sources of truth, including `design.schema.ts`. Only name them. Do not create them.

### 5. `DECISIONS.md`
A decision log. Each entry has: ID, title, status (`Decided`, `Proposed`, or `Open`), the decision, the reason, and the date. Seed it with exactly the entries below. Keep the IDs.

| ID | Title | Status | Decision |
| --- | --- | --- | --- |
| D-001 | Stack | Decided | Next.js + TypeScript, Tailwind + CSS variables, Supabase (Postgres, Auth, Storage), Zod, Postgres full-text search, Vercel. |
| D-002 | Schema is the single source of truth | Decided | One design file format, defined in `design.schema.ts` and validated with Zod. It is built first and frozen before F-06 or F-08 start. Changes after the freeze must be logged here with a reason. |
| D-003 | One renderer, many worlds | Decided | One renderer, with per-world section components over shared primitives. The schema has a `world` field from the start. If time runs short, ship one polished world instead of two thin ones. |
| D-004 | Build order | Decided | F-02, F-03, F-04, F-05, F-01, F-06, F-07, F-08, F-09. Until F-01 lands, use fixture data. |
| D-005 | Authentication | Proposed | Email and password through Supabase. Email confirmation is disabled for the demo. |
| D-006 | Usernames and links | Proposed | The personal link is `/u/<username>`. The username is unique, chosen at signup, and fixed in v1. A reserved list (such as `admin`, `api`, `u`) is blocked. |
| D-007 | One portfolio per user | Proposed | One portfolio per user in v1. |
| D-008 | Experience and education | Proposed | One section type with a `type` field (experience or education). |
| D-009 | Readability guardrails | Proposed | Guardrails warn and never block publishing in v1. This changes the original description, which said "block". |
| D-010 | Search | Decided | Public, with no login needed, and published portfolios only. Postgres full-text search over name, plus a skills join table with an alias map so "React", "ReactJS", and "react.js" match. Autocomplete comes from a static list. |
| D-011 | Draft privacy | Decided | Public pages and search read published data only, through a server-side client scoped to published records. They never use the anon key against a table that contains drafts. Row-level security policies must be tested for this. |
| D-012 | AI rules | Decided | The AI key stays server-side in a route handler. All AI output is parsed by Zod before reaching the client, and an invalid response is rejected without changing saved data. Each user has a daily generation limit. |
| D-013 | LLM provider | Open | Not chosen yet. Code against a single provider behind one interface so it can be swapped. The owner supplies the key. |
| D-014 | Input safety | Decided | Project links are validated in the schema, and only `http` and `https` are allowed (reject `javascript:` and similar). Image uploads have a size and type limit. |
| D-015 | No undo in v1 | Decided | Instead of undo and redo, the builder offers "reset to last published". |
| D-016 | Cut order | Proposed | If time runs short, cut in this order: (1) Terminal world polish, (2) edit-by-request in F-08 (keep generate-only), (3) builder extras beyond token editing, reordering, and preview. Search is kept in minimal form. |
| D-017 | Repo is the memory | Decided | DevAI keeps no memory between sessions. Each session starts by reading `DECISIONS.md` and the files the current prompt names. Each prompt ends by updating `DECISIONS.md` if anything was decided. |
| D-018 | Seed data | Proposed | Seed 8 to 10 sample portfolios so search and the world designs can be demonstrated. |

Entries marked `Proposed` are waiting for my confirmation. Do not treat them as settled in later work unless I say so, and flag it when a later task depends on one.

## Rules

1. Write documentation only. No scaffolding, no `package.json`, no application code.
2. Do not invent requirements. If something is not in P-000 or this prompt, leave it out or mark it `Open`.
3. Keep the documents short and scannable. Prefer tables and lists to long prose.
4. Use the IDs exactly as given (F-01 to F-09, D-001 to D-018).

## Definition of done

- All five files exist at the paths above.
- `DECISIONS.md` contains all eighteen entries with the statuses shown.
- `docs/FEATURES.md` lists all nine features with dependencies, and the build and cut orders match D-004 and D-016.
- `docs/ARCHITECTURE.md` includes the four data flows and states the security rules as checkable rules.
- No file outside the five above was created or changed.

## Report back

Reply with:

1. The list of files you created, with one line each.
2. Any contradiction you found between P-000 and the decisions above.
3. Anything you had to leave `Open` that I need to decide before the schema prompt (P-002).

## Result

Answered 2026-11-03. Five files created: `README.md`, `docs/PRODUCT.md`, `docs/FEATURES.md`, `docs/ARCHITECTURE.md`, `DECISIONS.md`. Reported four contradictions (two-worlds scope vs D-003 fallback, cut order vs P-000 priority, "complete product" excluding search, D-009 misquoting P-000) and eight open questions. No code written. Accepted by the owner.
