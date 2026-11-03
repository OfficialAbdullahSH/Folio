---
prompt_id: P-000
title: Folio idea brief
type: context (no code)
date: 2026-11-03
author: Abdullah
features: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09]
status: answered
---

# P-000: Folio idea brief

> Context only. DevAI must not write any code in response to it.

## Your role

You are the developer for a web product called **Folio**. I am the product owner. I will give you one feature specification at a time, and you will implement each one. Before any feature specs arrive, I need you to understand the whole product.

## What Folio is

Folio is a web platform where anyone can build a unique, professional portfolio without writing code. The user describes the look they want, for example "dark, techy, and simple", and an AI assistant generates a complete design. The user then edits every detail visually and publishes it at a personal link. Every published portfolio is searchable, so employers and collaborators can find people by name or skill.

Two ideas hold the product together:

- **Design as data.** Each portfolio's look is stored as a structured design file that one renderer turns into a page. The user never touches the file: the visual builder and the AI both just change it.
- **Create and discover.** The builder lets people create a portfolio, and search lets others find them. Search is what makes Folio a platform rather than only a page builder.

## Who it is for

**Primary users (portfolio owners):** university students and new graduates, beginners in programming and design, and anyone who wants a simple professional presence online.

**Secondary users (visitors):** employers, recruiters, professors, and classmates or teammates searching for people by skill.

**Out of scope:** experienced developers who want full code control, and large teams or agencies.

## The problem

People choose between coding a site by hand (slow, needs skills), using a ready-made template (fast, but everything looks alike), or doing nothing (no place to show work). Folio aims for:

- **Uniqueness without skill:** distinct design worlds with their own navigation and feel, plus deep customization inside each.
- **AI as the starting point:** a description gets the user a good first draft to adjust.
- **Built-in discovery:** search by name and skill, using one shared skill list so "React", "ReactJS" and "react.js" are the same skill.
- **Focus on showing work:** not a general website builder, so the experience stays simple.

## Features in v1

| ID | Feature |
| --- | --- |
| F-01 | Sign up, log in, log out |
| F-02 | Design file format (schema) with validation |
| F-03 | Renderer that turns a design file into a public page |
| F-04 | Two design worlds: Editorial (magazine style) and Terminal (developer style) |
| F-05 | Content sections and editing: about, projects, skills, experience or education, contact links |
| F-06 | Visual builder: colors, fonts, corner roundness, section order, display styles, live preview, readability guardrails |
| F-07 | Publish to a personal link |
| F-08 | AI assistant: generate a design from a description, edit by request, validate all output before showing it |
| F-09 | Search by name and skill, with a shared skill list and autocomplete |

**Not in v1:** a third design world, custom CSS, undo/redo, drag-and-drop polish, randomize or duplicate design, analytics, custom domains, a dedicated search engine, a mobile app, Arabic/RTL beyond the basics.

## Proposed stack (a proposal, not a constraint)

- Frontend: Next.js + TypeScript (server rendering for fast public pages and SEO)
- Styling: Tailwind + CSS variables (design settings swap without rewriting styles)
- Database, auth, storage: Supabase
- Validation: Zod (checks AI output and saved designs against a strict schema)
- Search: Postgres full-text search
- AI: an LLM returning structured output, used to generate and edit the design file
- Hosting: Vercel

If you see a problem with any of these choices, tell me before we build.

## Constraints

- **Deadline: one week.** The whole product must be delivered in 7 days.
- Solo developer. You write all the code. My role is requirements, validation, and verification.
- Every feature must be small enough to test.
- Priority if time runs short: F-01 to F-07 form a complete product on their own. F-08 (AI) and F-09 (search) are the first to simplify.

## How we will work

1. I send one feature spec at a time. Each has an ID, name, goal, acceptance criteria, and edge cases.
2. You implement only what that spec describes, then tell me how to verify each acceptance criterion.
3. Every prompt I send you is saved as its own file, named by prompt ID, and linked to its feature ID. Reference the feature ID in your commit messages and notes.

## What I need from you now

Do not write code yet. Reply with:

1. A summary of Folio in your own words (5 sentences or fewer), so I can check you understood it.
2. Any risks or contradictions you see, especially given the one-week deadline.
3. Questions you need answered before the first feature spec.
4. Your limits that affect this build: context size, and how you handle multi-file projects.

---

# Folio prompt traceability index

Every prompt sent to DevAI is saved as its own file in this folder: `P-XXX-short-name.md`. Each prompt file records its prompt ID, the feature IDs it covers, the date, and its status. This table links them.

| Prompt | File | Feature(s) | Purpose | Sent | Status |
| --- | --- | --- | --- | --- | --- |
| P-000 | P-000-idea-brief.md | F-01 to F-09 (context) | Explain the product to DevAI, no code | 2026-11-03 | answered |

## Feature checklist

| Feature | Name | Prompt(s) | Implemented | Verified |
| --- | --- | --- | --- | --- |
| F-01 | Sign up, log in, log out | | | |
| F-02 | Design file schema + validation | | | |
| F-03 | Renderer: design file to public page | | | |
| F-04 | Design worlds: Editorial, Terminal | | | |
| F-05 | Content sections and editing | | | |
| F-06 | Visual builder | | | |
| F-07 | Publish to personal link | | | |
| F-08 | AI design assistant | | | |
| F-09 | Search by name and skill | | | |

## Conventions

- One prompt per file. If a prompt needs a fix, save the new version as a new file (for example `P-004b-...`) instead of overwriting the old one.
- Record DevAI's response summary and the verification result in the prompt's file under a `## Result` heading after each run.

## Result

Answered 2026-11-03 with: product summary, risk list (schema-first sequencing, F-06 scope, two-worlds cost, F-08 schema freeze, F-09 skill aliasing, RLS for public pages), seven open questions with proposed defaults, and working limits (context budget, re-read over recall, no credentials). No code written. Awaiting P-001.
