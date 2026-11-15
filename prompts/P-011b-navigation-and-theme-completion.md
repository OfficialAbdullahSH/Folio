---
prompt_id: P-011b
title: Completion of X-01 and X-02: missing documents, accessibility audit, and live checks
type: fix (follow-up to P-011)
date: 2026-11-15
author: Abdullah
features: [X-01, X-02]
depends_on: [P-011]
status: ready to send
---

# P-011b: Complete navigation and theme

> Paste everything below the line into DevAI. This is a targeted completion prompt. Do not redesign anything and do not add features.

---

## Context

Thank you for the very honest report on P-011. Your header, tab bar, theme system, and the bugs you found and fixed along the way (the Escape key, the skip link, the hydration warning) are accepted as built. Several things were left unfinished, and some checks stayed partial. This prompt closes them.

Read `AGENTS.md` at the repo root and `DECISIONS.md` (D-017) first. Do not change `src/schema/` or `src/render/`. Do not add a dependency to the project. Do not commit; I will review and commit myself.

If you need a signed-in session, create **one new throwaway account** and use it for the whole run (the password of the earlier `qa.chrome` account is gone). Use a made-up email and a random password that is never written to any file, log, screenshot, or report. Use no real personal data. At the end, tell me the exact email and username of every throwaway account that exists (both the old one and the new one), so I can delete them. Do not touch any other account or data.

## What to do

### 1. Write the missing document (P-011 AC-1)

Create `docs/NAVIGATION.md` with:

- a table of screens (route, who can see it, links in, links out),
- a reachability matrix from every screen to every related screen, with a **before** column (from your audit findings) and an **after** column (from the live walk in item 6),
- the list of dead ends and frustrations found, as in your report,
- the known limits (for example browser back), stated plainly.

### 2. Update the other documents (P-011 AC-19)

Add X-01 and X-02 to `docs/FEATURES.md` with an acceptance table per item and an honest status per row, saying which rows came from a live run. Describe the header, the tab bar, the return path, the unsaved-changes guard, and the theme system in `docs/ARCHITECTURE.md`. Add a note in `DECISIONS.md` (next free ID, status Decided) that `export const instant = false` is used on the routes that show the session-aware header, with the reason and the consequence (those routes render on each request instead of being prerendered).

### 3. Sign-out destination (P-011 AC-8)

After sign-out the user must land on the landing page (`/`), not `/login`. Make the one-line change, update its test, and verify it live.

### 4. Widen the color scan and document the exceptions (P-011 AC-14)

The scan must cover all app UI: everything under `src/app` except `/u/*` and the preview frame page, plus `src/components`, `src/editor`, `src/builder`, `src/publish`, `src/search`, and `src/lib`. Create a single exceptions list in code (for example `src/lib/theme/color-exceptions.ts`) in which every entry has a file, a reason, and what it is (data, swatch, or computation). The test fails if a color literal or a Tailwind palette color class appears anywhere outside that list, and fails if a listed exception no longer exists. Start from the exceptions you described in your report. Include the list and the reasons in your report.

### 5. Accessibility audit with axe (P-011 AC-15)

Run axe on every screen in both themes **without adding anything to the project**: install `axe-core` in a temporary folder outside the repository (for example under `/tmp`), and inject its script into the page through Playwright. Screens: landing (signed in and out), login, signup, dashboard, editor, builder (both tabs at 375 px), preview, search (no query, results, no results), publish dialogs, the leave-confirmation dialog, the open account menu, the open narrow-screen menu, and the 404 page. Report the number of violations per screen per theme and each violation's rule and impact. **Fix every serious or critical violation** in the app UI. For anything you do not fix, say why. Public portfolio pages and the portfolio inside the preview frame are out of scope for fixes (they follow the owner's design), but report what axe finds there too.

### 6. Complete the live checks

With the throwaway account and Playwright, run and report each of these as **live**:

1. **Reachability walk.** From every signed-in screen, reach every related screen in at most two clicks without typing a URL. Fill in the matrix in `docs/NAVIGATION.md`.
2. **Return path.** Signed out, open `/dashboard/design`, log in, and confirm you land on `/dashboard/design`. Then open `/login?next=//evil.example` and `/login?next=https://evil.example`, log in, and confirm you land on the dashboard.
3. **Unsaved-changes guard.** Make an edit in the editor and in the builder without saving, then click a header link and a tab. Confirm the dialog appears, Stay keeps the edit, and Leave navigates. With no edits, navigation is immediate. State whether browser back is covered, and write the answer in `docs/NAVIGATION.md`.
4. **Next steps after actions.** Save content and click the suggested next link. Save a design and click its next link. Publish and click the link to the public page.
5. **Menus and focus.** Open the account menu and close it with Escape, and confirm focus returns to its button. Repeat for the narrow-screen menu.
6. **Widths.** Check the signed-in screens at 375, 768, and 1280 px in both themes for horizontal scrolling, and report the measured widths.
7. **Portfolio unchanged by the app theme.** Compare computed text and background colors of `/u/demo-editorial`, `/u/demo-terminal`, and the portfolio inside the builder's preview frame between app-light and app-dark.
8. **System mode.** Set the theme to System, then change the emulated system color scheme, and confirm the app follows it live.

### 7. Report what stays as it is

Keep the duplicated links in the header and the tab bar (I accept it). Do not add a back-button handler unless it can be done reliably, and if it cannot, document it as a known limit.

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `docs/NAVIGATION.md` exists with the screen table, the reachability matrix with before and after columns, the dead-end list, and the known limits. |
| AC-2 | `docs/FEATURES.md` and `docs/ARCHITECTURE.md` describe X-01 and X-02 with honest per-row statuses, and `DECISIONS.md` records the `instant = false` decision. |
| AC-3 | Sign-out lands on the landing page. The test is updated, and the result is verified live. |
| AC-4 | The color scan covers all the app UI directories listed. The exceptions list is in code with a reason for each entry. The test fails on an unlisted literal and on a stale exception. |
| AC-5 | axe was run on every screen listed, in both themes, with no project dependency added. No serious or critical violation remains in the app UI, or each remaining one is explained. Results are reported per screen and per theme. |
| AC-6 | The reachability walk is complete and live. Every related screen is at most two clicks away, or the exceptions are listed. |
| AC-7 | The return path is verified live, including both unsafe `next` values being ignored. |
| AC-8 | The unsaved-changes guard is verified live in the editor and in the builder. The status of browser back is documented. |
| AC-9 | The next-step links after save and publish are clicked and work. |
| AC-10 | Escape and focus return are verified live for the account menu and the narrow-screen menu. |
| AC-11 | The signed-in screens show no horizontal scroll at 375, 768, and 1280 px in both themes, with the measured widths reported. |
| AC-12 | The two demo portfolios and the portfolio in the preview frame have identical computed colors in both app themes. System mode follows a live system change. |
| AC-13 | `src/schema/` and `src/render/` are unchanged and no dependency was added. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |

## Rules

1. Do only what this prompt describes. If something is unclear, stop and ask.
2. Never create, request, or write real secrets.
3. State honestly what came from a live run and what did not. You cannot view images, so say so.
4. Do not commit.

## Report back

Reply with:

1. A table of acceptance criteria and results, marking which came from a live run.
2. The axe results per screen and theme, and what you fixed.
3. The list of color exceptions with reasons.
4. The files created or changed.
5. The exact emails and usernames of all throwaway accounts.
6. Anything you could not do as written, and any deviation.
