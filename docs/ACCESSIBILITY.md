# The accessibility pass (AC-5, AC-10)

The record of the axe run over every screen, in both themes, and of what is still open.
AC-5 is "no serious or critical axe violations"; AC-10 is "Escape closes a menu or dialog and
focus returns to the control that opened it".

**What was run.** A production build (`npm run build`, `next start` on port 3100) against the
seeded database, signed in as a QA user, driven by Playwright. On each page axe was injected
into the live document and run with
`runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']` twice: once
with `data-theme="light"` on `<html>` and once with `data-theme="dark"`. Dialogs and menus
were audited with the same call scoped to the open element.

**Nothing in this document is a prediction.** Every row below is a result read off the live
page. Where a check was not run it says so.

## Result

| Screen | State | 1280 px light / dark | 375 px light / dark |
| --- | --- | --- | --- |
| `/` | signed in | 0 / 0 | — |
| `/` | signed out | 0 / 0 | 0 / 0 |
| `/login` | signed out | 0 / 0 | 0 / 0 |
| `/login` | empty submit, two errors shown | — | 0 / 0 |
| `/signup` | signed out | 0 / 0 | 0 / 0 |
| `/search` | no query | 0 / 0 | 0 / 0 |
| `/search?q=engineer` | three results | 0 / 0 | 0 / 0 |
| `/search?q=zzzzzznotathing` | no matches | 0 / 0 | 0 / 0 |
| `/dashboard` | owner | 0 / 0 | 0 / 0 |
| `/dashboard/edit` | owner, saved state | 0 / 0 | 0 / 0 |
| `/dashboard/edit` | owner, unsaved changes | 0 / 0 | 0 / 0 |
| `/dashboard/design` | owner, Controls | 0 / 0 | 0 / 0 |
| `/dashboard/design` | owner, Preview (phone tab) | — | 0 / 0 |
| `/dashboard/preview` | owner | 3 moderate / 3 moderate (below) | 3 moderate / 3 moderate |
| `/dashboard/preview/frame` | owner, the frame document | 0 / 0 | — |
| `/u/demo-editorial` | public | 0 / 0 | 0 / 0 |
| `/u/demo-terminal` | public | 0 / 0 | 0 / 0 |
| `/does-not-exist` | 404 | 0 / 0 | 0 / 0 |
| Account menu, open | `/dashboard` | 0 / 0 | 0 / 0 |
| App menu panel, open | `/dashboard` | — | 0 / 0 |
| Publish dialog, open | `/dashboard` | 0 / 0 | — |
| Leave-without-saving dialog, open | `/dashboard/edit` | 0 / 0 | — |

**AC-5 holds on every screen that does not render a whole portfolio inline.** The one
exception is `/dashboard/preview`, and every one of its findings is `moderate` on the
best-practice set, not serious or critical.

## What the pass changed

| Finding | Where | Fix |
| --- | --- | --- |
| `moderate:region` — the skip link was outside every landmark | every app screen | The skip link moved from `AppShell` into the header's `<header>`, where it is still first in the tab order and now inside the banner (D-103) |
| `moderate:region` — the editor's title, hint and Save sat before `<main>` | `/dashboard/edit` | The toolbar is the first child of `<main>`; Save keeps `form="editor-form"` so it can stay outside the `<form>` |
| `moderate:region` — the builder's title, hint, Save and phone switch sat before `<main>` | `/dashboard/design` | The same move; the two-column grid became a wrapper inside `<main>` so the layout is unchanged |
| `moderate:region` — the preview note belonged to no landmark | `/dashboard/preview` | The note is an `<aside aria-label="Preview">` |
| `serious:label-content-name-mismatch` — 8 skill chips said "React 5" and were named "React, 5 portfolios" (WCAG 2.5.3) | `/search` | The name lost its comma and the visible count gained its space, so the name contains the words on screen |
| Horizontal overflow of 57 px at 375 px, and the page scrolled sideways | every signed-in screen | The theme control moves into the menu panel below `md`, which is what the header's own comment already claimed |

## Still open

1. **`/dashboard/preview` reports three moderate best-practice findings in both themes:**
   `landmark-no-duplicate-banner`, `landmark-unique` (both banners are unnamed, so axe cannot
   tell them apart) and `region` on the portfolio's own skip link. The cause is one thing: the
   page renders a whole portfolio inline inside the app chrome, so the document has Folio's
   `<header>` and the portfolio's, and the portfolio's skip link sits outside a landmark because
   it is written for a page where it is the first thing in the body.
   Wrapping the portfolio in a named `<section>` removes the two banner findings but pushes the
   portfolio's `<main>` below a landmark (`landmark-main-is-top-level`), and a published
   portfolio page has one banner, not two. **The honest fix is to render this page in the frame
   document the builder already uses** — that document audits clean (see the table) — and that is a
   change to F-06, not to a navigation-and-theme prompt. `src/render` is frozen here.
2. **The frozen worlds repeat the old skip-link shape.** `src/render/worlds/editorial/Shell.tsx`
   and `src/render/worlds/terminal/Shell.tsx` put their skip link before their `<header>`. On a
   standalone portfolio page (`/u/*`) axe does not flag it — the page audits clean in both
   themes — because nothing else is on the page to compete with the landmark order. It is a
   finding only when embedded, which is open item 1.
3. **Focus after the skip link lands on `<body>`, not on `<main>`.** Activating the link sets the
   URL hash, scrolls `main` under the sticky header, and the next Tab press continues at the
   first control inside `main` — verified by pressing Tab twice on `/`. Adding `tabIndex={-1}` to
   every `<main id="main-content">` would move focus onto the region itself; it is not needed for
   the criterion and is not done.

## AC-10, measured

| Control | Opened | Escape | Focus after Escape |
| --- | --- | --- | --- |
| Account menu | `/dashboard`, 1280 and 375 px | closed, `aria-expanded="false"` | the account button |
| App menu panel | `/dashboard`, 375 px | closed, `aria-expanded="false"` | the menu button |
| Publish dialog | `/dashboard` | closed | the Publish button |
| Leave-without-saving dialog | `/dashboard/edit`, after typing in Headline and following Design | closed, still on `/dashboard/edit`, the edit intact | the Design link that was followed |

The leave dialog opens with focus on **Cancel**, the safe answer, and not on "Leave and lose
changes".

## Two things this pass did not cover

- **Keyboard-only traversal of a whole screen.** Only the skip-link path (Tab, Enter, Tab) and the
  Escape paths above were driven with the keyboard. Tab order through every control on every page
  was not walked.
- **Screen-reader output.** No screen reader was run. The landmark and name findings are axe's, not
  a listening test.
