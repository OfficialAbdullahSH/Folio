---
prompt_id: P-005b
title: F-04 corrections after review
type: fix (follow-up to P-005)
date: 2026-11-03
author: Abdullah
features: [F-04]
depends_on: [P-005]
status: ready to send
---

# P-005b: F-04 corrections

> Paste everything below the line into DevAI. This is a small, targeted fix prompt. Do not redesign either world.

---

## Context

Thank you for the complete report on P-005, and for being direct about what did not match. I reviewed it against the spec. Four things need correcting, and one needs checking. Everything else is accepted as built, including your design choices for both worlds, the polish items you left out, and the second dark stress theme.

Read `DECISIONS.md` first (D-017). Do not change `src/schema/`. Do not change the look of either world, except for item 3. **Do not commit.** I will review and commit myself.

## What to fix

### 1. The two missing fixtures (AC-15 of P-005)

Add `demo-editorial-bold` and `demo-terminal-light` exactly as P-005 specified, including the palettes, fonts, radius, hero style, and display styles listed there. Both must pass the F-02 validators and load at `/u/demo-editorial-bold` and `/u/demo-terminal-light`. Keep `demo-compact` and `demo-long`, which are useful edge-case fixtures. The five original demos must render as before.

### 2. Screenshots in the right place (AC-13 of P-005)

Move the 22 screenshots from `docs/screenshots/` into `docs/screenshots/f04/`. Move them, do not copy. Update `docs/screenshots/README.md` (it can live in `f04/`) so every capture is listed with its fixture, world, theme, and width.

Then capture what is now missing:

- All **seven** fixtures in their own worlds at 1280 px and 375 px.
- `demo-editorial` and `demo-terminal` each under the six stress themes at 1280 px.

### 3. A plain light stress theme (AC-12 of P-005)

P-005 listed six themes: light, dark, high saturation, low-contrast pastel, warm earthy, and monochrome. You used two dark variants and no plain light one. Replace the cold navy dark theme with a plain light theme, keep the near-black dark theme, and update the tests and the stress screenshots to match.

### 4. Anchor targets hidden under the sticky bar

Section links in the Terminal world can land with the heading hidden under the 2.75 rem sticky topbar. Fix it with `scroll-margin-top` on every anchor target (each section element and `#main-content`), large enough to clear the topbar plus 1 rem, at the widths where the topbar is sticky. Add a small `scroll-margin-top` in the Editorial world too.

Add a test that scans the world stylesheets for this. In the browser, click each navigation link at 1280 px in both worlds and report whether the heading's top edge is below the bottom of the topbar.

## What to check

### 5. Audit your acceptance table

In `docs/FEATURES.md` the F-04 table maps each criterion to a test. Re-check every row against the tests that actually exist. Correct any row that says "pass" without a test that proves it, and say which rows those were. AC-13 and AC-15 should read as not met until items 1 and 2 are done, then pass. Add a short note under the table that lists these corrections.

## Rules

1. Do not touch anything outside the five items above.
2. Do not change the look of either world, except through the anchor fix in item 4.
3. Do not commit. Leave the changes in the working tree.
4. If something is unclear, stop and ask instead of choosing.
5. Reference `P-005b` and `F-04` in any file note you write.

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `demo-editorial-bold` and `demo-terminal-light` exist with the specified palettes, fonts, radius, hero, and display styles, pass the F-02 validators, and load in the browser. The five earlier demos and the two edge-case fixtures render as before. |
| AC-2 | All screenshots are in `docs/screenshots/f04/`, none remain flat in `docs/screenshots/`, and the README lists each capture. The set contains 14 fixture captures (seven fixtures, two widths) and 12 stress-theme captures. |
| AC-3 | The six stress themes are light, dark, high saturation, low-contrast pastel, warm earthy, and monochrome. The tests use them, and the stress screenshots match. |
| AC-4 | Every anchor target in both worlds has a `scroll-margin-top`, verified by a test scan. In the browser at 1280 px, after clicking each navigation link in both worlds, the heading is fully below the topbar. |
| AC-5 | The F-04 table in `docs/FEATURES.md` matches reality, and a note lists every correction. |
| AC-6 | `src/schema/` is unchanged. All earlier tests still pass. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. Nothing is committed. |

## Definition of done

- All six acceptance criteria pass.
- The working tree contains only the changes listed above.

## Report back

Reply with:

1. A table of the six acceptance criteria and their results.
2. The files created, moved, or changed.
3. The audit result from item 5: which rows were overstated, if any.
4. The browser result for the anchor check, per world.
5. The URLs of all seven demos.

## Result

All six acceptance criteria are implemented in the working tree. Nothing was committed.

- **Item 1.** `demo-editorial-bold` and `demo-terminal-light` added to `src/data/fixtures/portfolios.ts` with the palettes, fonts, radius, hero and display styles from P-005; `demo-compact` and `demo-long` kept. Pinned by `demo-editorial-bold matches the P-005 fixture spec`, `demo-terminal-light matches the P-005 fixture spec`, `all seven fixtures pass the F-02 validators` and `keeps the five earlier demos on their original worlds`.
- **Item 2.** The screenshots were moved, not copied, into `docs/screenshots/f04/` (nothing left flat in `docs/screenshots/`). `docs/screenshots/f04/README.md` lists fixture, world, theme and width for all 26 captures: 14 fixture captures (seven fixtures at 1280 and 375) and 12 stress captures.
- **Item 3.** The cold navy dark theme was replaced by a plain light theme; the near-black dark theme stayed. The six themes are pinned by `AC-12 uses the light, dark, saturated, pastel, warm and monochrome themes`.
- **Item 4.** `scroll-margin-top` on every section element and `#main-content`: 3.75rem in Terminal (clearing the 2.75rem topbar plus 1rem), 1rem in Editorial. Enforced by the stylesheet scan `AC-4 gives every anchor target a scroll-margin-top`. Browser check recorded in `docs/screenshots/f04/README.md`: at 1280 px the Terminal topbar ends at 44 px and the nearest heading top is 114.5 px; Editorial is not sticky and the nearest heading top is 60.5 px.
- **Item 5.** The F-04 table was re-audited against the tests that exist. Rows that overstated their proof were AC-1, AC-4, AC-8, AC-11, AC-13 and AC-15 (plus the AC-12 theme names and the AC-16 test count); the corrections are listed in the P-005b audit note under the table. AC-8 remains **Partial**: the cited test proves `aria-hidden` but not the "never user text" clause.
- **Verification.** `npm run typecheck`, `npm run lint`, `npm test` (153 tests) and `npm run build` pass; `git diff src/schema` is empty.

**Not verified.** No owner visual check of the two new worlds yet. The 26 captures and the anchor measurements were taken by DevAI in Chrome, not by the owner.
