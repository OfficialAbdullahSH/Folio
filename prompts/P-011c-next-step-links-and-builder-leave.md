---
prompt_id: P-011c
title: Next-step links after saving, and the builder's Leave behavior
type: fix (follow-up to P-011 and P-011b)
date: 2026-11-15
author: Abdullah
features: [X-01]
depends_on: [P-011b]
status: ready to send
---

# P-011c: Next-step links and the builder's Leave behavior

> Paste everything below the line into DevAI. This is a small, targeted prompt with two fixes. Do not change anything else.

---

## Context

Thank you for the live checks on P-011b. They passed except two, which this prompt fixes. Read `AGENTS.md` at the repo root and `DECISIONS.md` (D-017) first. Do not change `src/schema/` or `src/render/`. Do not add a dependency. Do not commit; I will review and commit myself.

On your remark that the next-step links are "a design decision": P-011 already specified them ("after a successful save or publish, show links to the sensible next screens, for example Design after saving content, Preview after saving a design, View public page after publishing"). This prompt gives the exact labels and destinations, so there is nothing left to decide.

## Fix 1: Next-step links (X-01)

Add these links. Each is a normal link (an `a` element through the app's link component), at least 44 px high, keyboard reachable, and styled with the app tokens (no color literals).

| Where | When | Links (label, destination) |
| --- | --- | --- |
| Content editor | Next to the "Saved ..." status after a successful save, and only while there are no unsaved changes | "Next: design your portfolio" to `/dashboard/design`, and "Preview" to `/dashboard/preview` |
| Design builder | Next to the "Saved ..." status after a successful save, and only while there are no unsaved changes | "Next: preview" to `/dashboard/preview`, and "Publish" to the publish card on the dashboard (`/dashboard#publish`) |
| Preview page | In the page header area, always | "Next: publish" to `/dashboard#publish` |
| Publish card | After a successful publish or republish | The existing "View your page" link stays. Add nothing else. |

Details:

- Give the publish card on `/dashboard` the id `publish`, so the anchor lands on it. Make sure the card is not hidden under the sticky header when the anchor is followed (use the same scroll offset as the main region).
- The links appear after a save succeeds and disappear as soon as the user makes another edit (the state becomes unsaved again) and when a save fails.
- Keep the "Saved ..." text in its existing status region. Place the links next to it, not inside the polite live region, so screen readers announce the status once and the links stay a normal part of the page.
- Clicking these links goes through the unsaved-changes guard like any other in-app link (it will not interrupt, because the state is saved).
- The links use the same wording style as the rest of the app (short and plain).

## Fix 2: The builder's Leave must discard unsaved changes (X-01)

You found that after choosing Leave in the builder and coming back, the unsaved edit (for example the Paper look) is still applied and the status still says "You have unsaved changes." The editor clears correctly. Find the cause (state that outlives the page, for example in a module-level store, a provider above the page, or the router cache) and fix it so that Leave means discard:

- After Leave, navigating back to the builder shows the saved design, with the status "All changes saved", and no unsaved-changes browser prompt is triggered later.
- Cancel and Stay still keep the edit exactly as today.
- A genuine save still works and persists.
- Keep the fix as small as possible and explain the cause in your report.

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | After a successful content save with no further edits, the editor shows the two links in the table above, with the right destinations. They are not shown while there are unsaved changes or after a failed save. |
| AC-2 | After a successful design save with no further edits, the builder shows "Next: preview" and "Publish" with the right destinations, under the same conditions. |
| AC-3 | The preview page always shows "Next: publish" in its header area. |
| AC-4 | The publish card has the id `publish`, and `/dashboard#publish` scrolls to it without the sticky header covering it. |
| AC-5 | The links are 44 px tall, keyboard reachable in a sensible tab order (after the Save button), use app tokens only, and the status text is announced once. The color scan and the accessibility checks still pass. |
| AC-6 | In the builder, Leave discards the unsaved edit. Coming back shows the saved design, "All changes saved", and no later unsaved-changes prompt. Cancel and Stay keep the edit. Saving still persists. |
| AC-7 | The editor's behavior is unchanged. |
| AC-8 | `docs/NAVIGATION.md` and `docs/FEATURES.md` (X-01 rows for the next-step links and the guard) are updated with honest statuses that say which came from a live run. |
| AC-9 | `src/schema/` and `src/render/` are unchanged and no dependency was added. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |

## Tests

- Component or logic tests for when the links appear (saved, unsaved, failed save) in the editor and the builder, and for their destinations.
- A test for the builder's discard behavior, at the level where the cause lives (for example the store or the component reset).
- Existing tests keep passing.

## Live checks

Use **one new throwaway account** with a made-up email and a random password that is never written to any file, log, screenshot, or report. Use no real personal data. Report each result as live:

1. Save content, and click each of the two links. Save a design, and click each of its two links. Open the preview and click "Next: publish". Confirm the dashboard scrolls to the publish card with the card fully visible.
2. Make an edit, and confirm the links disappear. Save again and confirm they return.
3. In the builder, apply a different look, click a header link, choose Leave, then return. Confirm "All changes saved" and the saved look. Repeat with Cancel to confirm the edit is kept.
4. Run axe on the editor and the builder in both themes after saving, and report any violation.
5. When you finish, **unpublish the throwaway account** if you published it, so it does not appear in search, and tell me its exact email and username so I can delete it.

## Rules

1. Do only what this prompt describes. If something is unclear, stop and ask.
2. Never create, request, or write real secrets.
3. State honestly what came from a live run and what did not.
4. Do not commit.

## Report back

Reply with:

1. A table of acceptance criteria and results, marking which came from a live run.
2. The cause of the builder bug and how you fixed it.
3. The files created or changed.
4. The exact email and username of the throwaway account.
5. Anything you could not do as written, and any deviation.
