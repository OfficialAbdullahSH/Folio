# Product

## What Folio is

Folio is a web platform where someone can build a unique, professional portfolio without writing code. They describe the look they want — "dark, techy, and simple" — and an AI assistant generates a complete design they then edit visually and publish at a personal link. Published portfolios are searchable, so employers and collaborators can find people by name or skill.

## Two core ideas

**Design as data.** A portfolio is two structured documents: a design document that holds the look, and a content document that holds the writing. A single renderer turns both into a page. The builder changes both; the AI changes the design document only, so it can never overwrite the owner's text.

**Create and discover.** The builder lets people create, and search lets others find them. Search is what makes Folio a platform rather than a page builder.

## Users

| Group | Who | What they need |
| --- | --- | --- |
| Primary — owners | University students, new graduates, beginners in programming and design, anyone wanting a simple professional presence | A good-looking portfolio without learning design or code |
| Secondary — visitors | Employers, recruiters, professors, classmates, teammates | Find people by name or skill, and judge them from the page |

Out of scope as users: experienced developers who want full code control, and large teams or agencies.

## The problem

Three options today, all unsatisfying:

- Code it by hand — slow, needs skills.
- Use a ready-made template — fast, but everything looks alike.
- Do nothing — no place to show the work.

Folio's answer is four things: uniqueness without skill (distinct design worlds, with deep customization inside each), AI as the starting point (a description produces a usable first draft), built-in discovery (one shared skill list, so "React", "ReactJS" and "react.js" are the same skill), and a narrow focus on showing work rather than being a general website builder.

## Competition, honestly

Folio does not beat site builders on breadth, template count or integrations, and it does not beat a hand-coded site on control. It competes on one thing: the distance between a sentence and a distinct, published, findable page, for someone with no design or code skill. If that distance is not dramatically shorter than the alternatives, the product has no reason to exist.

## v1 scope

Nine features, F-01 to F-09 — see `docs/FEATURES.md`. F-01 to F-07 are a complete product on their own. F-08 (AI) and F-09 (search) are the first to simplify if time runs short.

## Out of scope for v1

A third design world · custom CSS · undo and redo · drag-and-drop polish · randomize or duplicate a design · analytics · custom domains · a dedicated search engine · a mobile app · Arabic/RTL beyond the basics.

## v1 success criteria

Derived from the brief in P-000; these are not new requirements.

1. A new user can sign up, describe a look, receive a design, edit it, publish, and open the page at `/u/<username>` without writing code.
2. Nothing invalid renders: every saved or AI-produced design passes `design.schema.ts` before it is stored or shown.
3. Both worlds render from the same schema, with no world-specific data path.
4. A visitor finds a published portfolio by name, and by skill alias ("ReactJS" finds "React"), without logging in.
5. A published page is server-rendered and usable on a phone.
6. An unpublished draft is unreachable by URL, by search, and by any client-side query.

> Criterion 3 is settled by D-027: both worlds are required, and only polish is cuttable. D-003's "ship one polished world" fallback is superseded.
