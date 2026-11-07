---
prompt_id: P-008
title: F-06 Visual builder with live preview and readability warnings
type: feature
date: 2026-11-05
author: Abdullah
features: [F-06]
depends_on: [P-004, P-005, P-007]
status: ready to send
---

# P-008: F-06 Visual builder

> Paste everything below the line into DevAI. Follow the order of work at the end. **Never ask me for secret keys and never write real keys into any file.**

---

## Before you start

Read `AGENTS.md` at the repo root first, especially the UI and UX section. Then read `DECISIONS.md` (D-017), `docs/ARCHITECTURE.md`, and `docs/FEATURES.md`. The schemas in `src/schema/` are frozen (D-034). Do not change them. If you need a schema change, stop and tell me. Do not commit; I will review and commit myself.

## Step 1: Documentation updates

Add these to `DECISIONS.md`, status **Decided**, dated 2026-11-05. Number them consecutively after the highest existing ID, in the order given. Update `docs/ARCHITECTURE.md` and `docs/FEATURES.md` to match.

| Title | Decision |
| --- | --- |
| Builder page and save model | One builder page at `/dashboard/design`. An explicit Save button validates the design with the F-02 validator and replaces `portfolios.design` only. It never touches content. |
| Live preview | The preview is a same-origin iframe that loads a frame page (`/dashboard/preview/frame`). The frame renders the real renderer with the owner's saved content and profile. The builder sends the current design to the frame with `postMessage`. The frame accepts a message only if it comes from its parent window and the same origin, and only if the message passes the F-02 design validator. Anything else is ignored. |
| Device preview | The preview has three widths: 375 px, 768 px, and full width, so the worlds' real breakpoints are exercised. |
| Looks | A "look" is a named preset that sets the six colors, both fonts, and the radius together. There are at least 8, stored as data in `src/builder/looks.ts`. Every look must pass the F-02 design validator and must produce no readability warnings. |
| Readability warnings | Warnings follow D-009 (warn, never block). A warning appears when contrast is below the threshold for a pair: `text` on `background` and on `surface` needs 4.5:1, `muted` on `background` and on `surface` needs 4.5:1, `accent` on `background` and on `surface` needs 3:1. Contrast uses the WCAG 2 relative luminance formula. |
| Color input | Each color role has a native color input plus a hex text field. Valid `#RRGGBB` text (either case) is applied and normalized to lowercase. Invalid text is not applied and shows an error. |
| Resetting | "Reset to default design" restores the default design in the editor state and counts as an unsaved change. If the saved design fails validation, the builder shows a clear message with an explicit reset action. It never overwrites a saved design silently. "Reset to last published" arrives with F-07. |
| Deferred | Undo and redo, randomize, duplicate design, and drag and drop stay deferred (as in the project description). |

## F-06 specification

**ID:** F-06
**Name:** Visual builder with live preview and readability warnings
**Goal:** Let an owner change the whole look of their portfolio visually, with no code, and see the result immediately.
**User story:** As an owner, I choose a world, a look, colors, fonts, roundness, and the order, visibility, and style of my sections, watch my real portfolio update, and save.
**Depends on:** F-01, F-02, F-03, F-04, F-05
**Blocks:** F-07, F-08

### What to build

1. **Routes.** `/dashboard/design` (the builder) and `/dashboard/preview/frame` (the frame the builder embeds). Both are protected on the server. Update `/dashboard` to link to the builder.
2. **Builder controls**, with clear labels, grouped logically:
   - **World:** Editorial or Terminal, as two clear choice cards with a short description each.
   - **Looks:** a gallery of the presets. Choosing one applies all its values at once. Show a small swatch of its six colors. When the owner changes any value afterwards, no look is marked as selected.
   - **Colors:** the six roles (background, surface, text, muted, accent, border), each with a plain-language description of what it affects, a native color input, and a hex field (see the decision above).
   - **Typography:** heading font and body font, chosen from the six fonts in D-028, each option shown in its own typeface.
   - **Corners:** radius as a segmented control with four options (none, small, medium, large).
   - **Sections:** a list of the six sections in their current order. Each row has move up and move down, a visibility switch, and a display style choice limited to the styles allowed for that section (D-020). Sections without a style (about, contact) show no style choice. If a section has no content yet, show a hint with a link to the editor.
3. **Pure reducer** for the design state: set world, set color, apply look, set font, set radius, move section, toggle visibility, set display style, reset to default. It always keeps exactly the six section ids, each once, and ignores impossible moves.
4. **Readability panel.** A pure `contrastRatio` function and a pure `checkReadability` function (as in the decision above). The panel lists each failing pair with its ratio and the required ratio, in plain language, updates live, announces changes politely to screen readers, and never blocks Save.
5. **Live preview.** The iframe with the three device widths, as described in the decisions. A short loading state, and a clear message if the frame cannot load.
6. **Save action.** A server action that checks the user is signed in, validates the design with the F-02 design validator, and writes `portfolios.design` for the signed-in user only. It never accepts a user id from the client. It returns field-level errors or success with the saved time.
7. **Loading.** The builder loads the saved design (creating the default if missing, as in F-01), and shows the error-and-reset state if the saved design fails validation.
8. **Unsaved changes.** Warn before leaving with unsaved changes, as in the editor.
9. **Layout.** On wide screens: controls on one side, preview on the other, each scrolling on its own. On narrow screens: two tabs, "Design" and "Preview", so the preview is never squeezed.

If the renderer needs a change so the frame page can use it, make the smallest possible change, do not change its output markup, and report it.

### Looks

Create at least 8 looks, with distinct characters, for example a light paper look, a dark developer look, a bold saturated look, a soft pastel look, a warm earthy look, a monochrome look, and others of your choosing. Use the fonts in D-028. The test that checks every look against the validator and the readability rules is mandatory. You cannot judge their appearance, so say so in your report, and I will review them by eye.

### Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-1 | `/dashboard/design` and `/dashboard/preview/frame` are protected on the server. Anonymous visitors are redirected to `/login`. |
| AC-2 | The reducer implements every operation listed above, and the sections always remain exactly the six ids, each once. Impossible moves (first up, last down) are ignored. |
| AC-3 | Hex input accepts `#RRGGBB` in either case and normalizes it to lowercase. Invalid text is not applied and shows an error. The native color input and the hex field stay in sync. |
| AC-4 | There are at least 8 looks with unique names. Each passes `validateDesign` and produces no readability warnings. Applying a look sets all its values in one step, and editing any value afterwards deselects the look. |
| AC-5 | `contrastRatio` follows the WCAG 2 formula: black on white is 21, identical colors are 1, and a set of known reference pairs match their published values. `checkReadability` checks exactly the six pairs in the decision and reports the pair, the ratio, and the threshold. |
| AC-6 | The panel shows live warnings, announces changes politely, and never blocks Save. A deliberately poor palette (for example light gray text on white) produces warnings, and Save still works. |
| AC-7 | The preview iframe renders the real renderer. Changing a control updates the preview without saving. The three device widths work. The frame ignores messages from other origins, from windows other than its parent, and messages that fail the design validator, without crashing. |
| AC-8 | Save validates with `validateDesign`. An invalid design is not written. Only `portfolios.design` of the signed-in user is written, content and profile are untouched, and no user id comes from the client. An unauthenticated call is refused. |
| AC-9 | After saving and reloading, the builder shows the saved design, and `/dashboard/preview` renders it. |
| AC-10 | Reset to default (with a confirmation) restores the default design as an unsaved change. A saved design that fails validation shows a clear message and an explicit reset action, and is never overwritten silently. |
| AC-11 | Each section row supports move, visibility, and a display style limited to the styles allowed by D-020. About and contact have no style control. An empty section shows a hint with a link to the editor. |
| AC-12 | The user is warned before leaving with unsaved changes. |
| AC-13 | The UI meets the bar in `AGENTS.md` section 5: labelled controls, keyboard operation, visible focus, 44 px touch targets, app text contrast of at least WCAG AA, designed states (loading, empty, error, success, disabled), responsive at 375, 768, and 1280 px without horizontal scrolling (checked with Playwright), and reduced motion respected. |
| AC-14 | `src/schema/` is unchanged. Any change to the renderer is minimal and reported. The existing demo pages and the editor still work. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass. |
| AC-15 | `docs/FEATURES.md` has the F-06 table with honest statuses, and `docs/ARCHITECTURE.md` describes the builder, the frame, and the message protocol. |

### Edge cases the tests must cover

- Same color for text and background (ratio 1) and for muted and surface.
- Uppercase and mixed-case hex input, a missing `#`, five and seven digits, and non-hex letters.
- Moving the first section up and the last section down, and moving a section repeatedly.
- Hiding all six sections.
- Switching world back and forth, and applying a look and then editing a single color.
- Contrast values at exactly the threshold (4.5 and 3.0) and just below it.
- A message from another origin, a message from a window that is not the parent, and a message with an invalid design.
- A saved design that fails validation.
- Saving with the preview showing different content than the editor last saved (the preview always uses saved content).

### Manual checks for me (report what you could verify)

Use Playwright to: change a color and confirm the frame updates, switch the three device widths, capture screenshots of the builder and of the preview at 375, 768, and 1280 px, and run an automated accessibility check on the builder page. Report the results and the screenshot paths. If you cannot view the images, say so.

### Out of scope

Publishing, and reset to last published (F-07). The AI (F-08). Search (F-09). A third world, custom fonts, or colors beyond the six roles. Any schema change. Undo and redo, randomize, duplicate, and drag and drop.

## Rules

1. Implement only what this prompt describes. If something is unclear, stop and ask instead of choosing.
2. Never create, request, or write real secrets.
3. You cannot reach my Supabase project. Do not claim database behavior was tested if it was not, and list what I must verify by hand.
4. The dependencies approved in `AGENTS.md` are allowed for the app UI. Anything else needs my approval.
5. Record anything new in `DECISIONS.md` and `docs/`.
6. Do not commit.

## Order of work

1. Step 1, documentation updates.
2. Contrast and readability functions, with tests.
3. The looks, with their validation test.
4. The reducer, with tests.
5. The save action, with tests.
6. The frame page and the message protocol, with tests for the message filter.
7. The builder components and layout.
8. Browser checks and screenshots.
9. Run all four commands until they pass.
10. Documentation updates.

## Definition of done

- Every acceptance criterion passes, with the limits of mock-based and image-less testing stated honestly.
- The new decisions are in `DECISIONS.md`.
- The working tree contains the changes and nothing is committed.

## Report back

Reply with:

1. A table of acceptance criteria and test results. Include every row.
2. The files created or changed, including any change to the renderer.
3. The steps I must do by hand, if any.
4. A list of what I must verify by eye or in the live app.
5. The skills and tools you used, and any you looked for and did not have.
6. Anything you could not implement as written, or any rule that was ambiguous.

## Result

2026-11-05.

**Built.** The builder at `/dashboard/design`: world cards, a look gallery (8 looks), color controls with a native picker and a hex field, typography and radius controls, the section list with move, visibility and display style, a readability panel, a live preview with three widths, Save, and Reset behind a confirmation. The preview frame at `/dashboard/preview/frame` renders the real renderer and accepts a design over `postMessage` after checking the parent window, the origin and the schema. The save action writes `portfolios.design` for the session user only; the reset action is only reachable from an explicit button.

**Tests.** 343 tests in 39 files pass, including 57 in `src/builder/`. Typecheck, lint and build are clean. `src/schema/` and `src/render/` are unchanged.

**Not verified.** Everything that needs a signed-in session: the iframe updating on a control change, the live readability warning, the beforeunload dialog, the save/reload round trip, and the Playwright check at 375, 768 and 1280 px. No test account existed and none was created, because signing up would have written a user into the owner's own Supabase project. The signed-out redirects were checked with curl (307 to `/login` on both routes).

**Decisions added:** D-072 to D-079. **Docs:** `docs/FEATURES.md` F-06 table, `docs/ARCHITECTURE.md` sections (h) and (i), the folder map and the F-06 deviations, `prompts/INDEX.md`.
