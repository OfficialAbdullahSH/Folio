---
prompt_id: P-011
title: X-01 Navigation and flow between screens, and X-02 light and dark theme
type: improvement (cross-cutting, no new product feature)
date: 2026-11-12
author: Abdullah
features: [X-01, X-02]
depends_on: [P-006, P-007, P-008, P-009, P-010]
status: ready to send
---

# P-011: Navigation and flow, and light and dark theme

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys and never write real keys into any file.** If you need a signed-in account to test, use a throwaway account with a made-up email and a random password that is never written to any file, log, screenshot, or report, and tell me its email and username so I can delete it.

---

## Before you start

Read `AGENTS.md` at the repo root first, especially the UI and UX section. Then read `DECISIONS.md` (D-017), `docs/ARCHITECTURE.md`, and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. Do not change the portfolio renderer or the portfolio worlds (`src/render/`): public portfolio pages keep their own design, and nothing in this prompt may change how they look. Do not commit; I will review and commit myself.

## The problem, in the owner's words

> "Sometimes when I want to move from one screen to another I get frustrated, and I end up typing the URL."

I have not listed every case, and I have not seen all the screens again since they were built. So your first job is to **find** the cases yourself with an audit, then fix them. Treat every place where a user has to type a URL, use the browser's back button, or go through the dashboard just to reach a related screen as a defect.

You can expect problems like: no persistent navigation on the signed-in screens, no clear way back from the editor, builder, or preview, no quick way to switch between editing content, designing, previewing, and publishing, dead ends after an action, and a login that always sends people to the dashboard even when they were heading somewhere else.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-12. Number them consecutively after the highest existing ID, in the order given. Add X-01 and X-02 to `docs/FEATURES.md` as cross-cutting improvements, and update `docs/ARCHITECTURE.md`.

| Title | Decision |
| --- | --- |
| App header | Every Folio app screen has one consistent header. When signed in it shows the brand (a link to the dashboard), the links Dashboard, Content, Design, Preview, and Search, the current page marked with `aria-current="page"`, an account menu with the display name, username, and Log out, and the theme control. When signed out it shows the brand (a link to the landing page), Search, Log in, Sign up, and the theme control. On narrow screens it collapses into an accessible menu button. Public portfolio pages (`/u/*`) and the preview frame show no Folio header. |
| Workflow links | The three screens Content, Design, and Preview are tied together by a secondary tab bar, so the owner can switch between them in one click. The dashboard presents the flow as three steps (Content, Design, Publish) with a link on each. |
| Return path | When an anonymous visitor is sent to the login page from a protected page, the login URL carries a `next` path, and after login the user lands there. `next` is accepted only if it is a same-site path that starts with a single `/` (never `//`, a scheme, or a host). Otherwise it is ignored and the user goes to the dashboard. |
| Unsaved changes guard | When the editor or the builder has unsaved changes, any in-app link (header, tab bar, back links, brand) first asks "Leave without saving?" with Stay and Leave choices. The existing browser warning for closing or reloading stays. Browser back is covered only if it can be done reliably; say in the report whether it is. |
| Theme setting | The Folio app has three theme choices: Light, Dark, and System. System is the default and follows the operating system, including live changes. The choice is stored in the browser and applied before first paint, with no flash of the wrong theme. No new dependency is added. |
| Theme scope | The theme applies to the Folio app only. Public portfolio pages and the portfolio inside the preview frame never change with it, because they use the owner's own design tokens. |
| App color tokens | The app UI takes all its colors from one set of semantic tokens defined once for light and once for dark. App code contains no hard-coded colors and no Tailwind palette color classes, except for a short, documented list of exceptions (such as the builder's color swatches and the looks data). |

## X-01 specification: navigation and flow

**Goal:** Any screen the owner needs next is reachable in one or two clicks from where they are, without typing a URL.

### What to do

1. **Audit first.** Use Playwright with a signed-in throwaway account and an anonymous browser. Walk every screen: landing, signup, login, dashboard, content editor, design builder, preview, search (all states), publish dialogs, the public portfolio, the 404 page, and the error states. Write the result to `docs/NAVIGATION.md` as:
   - a table of screens (route, who can see it, links in, links out),
   - a reachability matrix (from every screen to every related screen) showing which transitions are one click, which are more, and which are missing,
   - the list of dead ends and frustrations you found, before any fix.
2. **Build the header** described in the decisions, as one shared component used by every app screen. Include a skip-to-content link, a labelled `nav` landmark, `aria-current`, 44 px targets, keyboard operation, and the narrow-screen menu.
3. **Add the secondary tab bar** for Content, Design, and Preview, shown on those three screens.
4. **Make the dashboard the hub.** Show the three-step flow (Content, Design, Publish) with a clear link or button on each step, next to the existing publish card.
5. **Add the return path** (`next`) for protected pages, with a pure function that accepts or rejects a `next` value, and tests for it.
6. **Add the unsaved changes guard** as a small shared piece of logic used by the editor and the builder, with the decision rule (should a navigation be intercepted) written as a pure function with tests.
7. **Fix dead ends** wherever the audit finds them. At minimum:
   - after a successful save or publish, show links to the sensible next screens (for example Design after saving content, Preview after saving a design, View public page after publishing),
   - after logout, go to the landing page,
   - after signup or login, go to `next` or the dashboard,
   - the 404 page and the error pages offer links to Home, Search, and the Dashboard (when signed in),
   - the landing page shows a Dashboard link instead of Log in and Sign up when the visitor is signed in,
   - search and the other public screens show the signed-out or signed-in header correctly.
8. **Page orientation.** Each screen has one `h1`, and a clear back link or breadcrumb on secondary screens. After in-app navigation, focus moves to the main heading or main region, so keyboard and screen reader users are not left behind.
9. Re-run the audit at the end and complete the "after" column in `docs/NAVIGATION.md`.

## X-02 specification: light and dark theme

**Goal:** The Folio app can be used in a light or dark appearance that follows the user's choice or their system, and looks intentional in both.

### What to do

1. Inspect the current styling and token setup (shadcn tokens, the global stylesheet). Complete it so that there is one set of semantic tokens (background, foreground, card, muted, border, primary, destructive, ring, and what the screens need) defined for light and for dark.
2. Replace any hard-coded colors and palette classes in the app UI with those tokens. The app UI means everything under `src/app` except `/u/*` and the preview frame, plus `src/components`, `src/editor`, `src/builder`, `src/publish`, and `src/search`. Keep a short documented list of allowed exceptions, each with a reason (for example the builder's color swatches, the hex fields, and the looks data).
3. Add the **theme control** (Light, Dark, System) to the header and to the signed-out screens. It must be keyboard operable, state its current value to screen readers, and have 44 px targets.
4. Apply the theme before first paint with a tiny inline script in the document head, reading the stored choice and the system preference. Set the theme as an attribute on the `html` element, and set the CSS `color-scheme` so native controls and scrollbars follow. In System mode, listen for live system changes. Switching theme must not cause a flash or animate wildly (respect reduced motion).
5. Make sure every component state looks right in both modes: dialogs, the publish card, warnings and errors, success messages, empty and loading states, disabled controls, focus rings, selected states, tabs, the combobox, the skill chips, and the readability panel.
6. Make sure the area around the builder's preview frame follows the theme, while the portfolio inside the frame does not.
7. Prove that public portfolio pages are unaffected: the computed colors of `/u/demo-editorial` and `/u/demo-terminal` are identical whether the app theme is light or dark.

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `docs/NAVIGATION.md` contains the screen table, the reachability matrix with before and after columns, and the list of dead ends found. |
| AC-2 | Every signed-in app screen shows the same header with the brand, the five links, the active page marked with `aria-current="page"`, the account menu with Log out, and the theme control. Signed-out screens show the signed-out header. `/u/*` and the preview frame show no header. |
| AC-3 | On narrow screens (375 px) the header collapses into an accessible menu with 44 px targets, usable by keyboard. |
| AC-4 | Content, Design, and Preview share a tab bar. From any of the three screens, the other two and the dashboard are one click away. |
| AC-5 | Reachability: from each screen, every related screen in the matrix is reachable with at most two clicks and no typed URL. A Playwright walk proves it and its results are reported. |
| AC-6 | A protected page visited while signed out redirects to `/login?next=<path>`, and after login the user lands on that path. `next` values that are `//evil.example`, `https://evil.example`, `javascript:alert(1)`, empty, or not starting with `/` are ignored. The pure function has tests for these and for normal paths with a query string. |
| AC-7 | With unsaved changes in the editor or the builder, clicking any in-app link shows the leave confirmation with Stay and Leave. With no unsaved changes, navigation is immediate. The rule is a tested pure function, and the report says whether browser back is covered. |
| AC-8 | After a successful save or publish, the success message offers the sensible next link. After logout the user is on the landing page. After login or signup the user is on `next` or the dashboard. |
| AC-9 | The 404 and error pages offer Home, Search, and (when signed in) Dashboard links. The landing page shows a Dashboard link for signed-in visitors. |
| AC-10 | The dashboard shows the three-step flow (Content, Design, Publish), each with a working link, next to the publish card. |
| AC-11 | Each screen has exactly one `h1`. After in-app navigation, focus moves to the main heading or main region. |
| AC-12 | The theme control offers Light, Dark, and System, defaults to System, persists across reloads and tabs, and in System mode follows live system changes. |
| AC-13 | There is no flash of the wrong theme: with a stored dark choice and a light system setting (and the reverse), the correct theme is set on the `html` element before the first paint. The pre-paint script is tested. |
| AC-14 | A test scan of the app UI source finds no hard-coded colors (hex, `rgb(`, `hsl(`) and no Tailwind palette color classes (such as `bg-white`, `text-gray-500`, `bg-slate-900`), apart from the documented exception list. Each exception has a reason. |
| AC-15 | Automated accessibility checks (axe, run through Playwright) report no serious or critical violations in either theme on: landing, login, signup, dashboard, editor, builder (both tabs on narrow screens), preview, search (no query, results, no results), and the 404 page. Report any exceptions honestly. |
| AC-16 | The computed text and background colors of `/u/demo-editorial` and `/u/demo-terminal`, and of the portfolio inside the preview frame, are identical in app-light and app-dark. |
| AC-17 | No horizontal scrolling at 375, 768, and 1280 px on any app screen in either theme. Reduced motion is respected, including when switching theme. |
| AC-18 | `src/schema/` and `src/render/` are unchanged. The existing features, demo pages, and search still work. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-19 | `docs/FEATURES.md` lists X-01 and X-02 with honest per-criterion statuses, saying which came from a live run, and `docs/ARCHITECTURE.md` describes the header, the guard, the return path, and the theme system. |

## Edge cases the tests must cover

- `next` values: `/dashboard/design`, `/dashboard/design?tab=preview`, `//evil.example`, `/\evil.example`, `https://evil.example`, `javascript:alert(1)`, an encoded slash, a very long value, and an empty value.
- Navigation with unsaved changes in the editor and in the builder, and after a successful save (no longer unsaved).
- A signed-in user opening `/login` or `/signup` (already handled; keep it working with `next`).
- A signed-in user with no published portfolio (the View public page link must not appear) and with one.
- Theme: stored value missing, invalid, `light`, `dark`, and `system`; system preference changing while in System mode; private browsing where storage fails (fall back to System without errors).
- A page opened in a new tab while the theme is Dark.
- The header on the narrow-screen menu with the keyboard (open, move, close with Escape, focus returns to the button).

## Out of scope

New product features. Visual redesigns beyond what navigation and theme need. Changing how portfolios look or adding dark mode to portfolio worlds. A settings page. Search behavior. Changing the schemas or the renderer. New dependencies, unless you ask me first (the theme must work without `next-themes`).

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets.
3. State honestly what came from a live run and what did not. You cannot view images, so say so, and list the screens I should review by eye in both themes.
4. Record anything new in `DECISIONS.md` and `docs/`.
5. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. The audit, written to `docs/NAVIGATION.md` (the "before" state).
3. The pure functions (`next` validation, guard rule, theme resolution, navigation model), with tests.
4. The theme tokens and the pre-paint script, then the theme control.
5. The shared header, the tab bar, and the dashboard hub.
6. The guard, the return path, and the dead-end fixes.
7. Replace hard-coded colors, then the token scan test.
8. Live checks: the reachability walk, the accessibility checks in both themes, the portfolio-unchanged check, and the overflow checks.
9. Run all four commands until they pass.
10. Complete `docs/NAVIGATION.md` and the other docs.

## Definition of done

- Every acceptance criterion passes, with the limits of the testing stated honestly.
- The new decisions are in `DECISIONS.md`.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. The "before" findings from the audit, as a short list, then a table of acceptance criteria and results, marking which came from a live run.
2. The files created or changed.
3. The list of allowed color exceptions and their reasons.
4. The screens I should review by eye in light and in dark.
5. The skills and tools you used.
6. Anything you could not implement as written, any deviation, and any ambiguity.
