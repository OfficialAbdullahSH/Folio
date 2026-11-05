# AGENTS.md: rules for DevAI on the Folio project

This file lives at the repo root. Read it at the start of every session, together with `DECISIONS.md`. You keep no memory between sessions, so the repo is your memory (D-017).

If a prompt in `prompts/` conflicts with this file, the prompt wins for that task, but tell me about the conflict in your report.

## 1. How we work

1. **Prompt as specification.** I give you one prompt at a time, saved as `prompts/P-XXX-name.md`. Implement what the prompt says. Do not add features, fields, or options it does not mention.
2. **Read before you act.** Start every task by reading `DECISIONS.md`, then `docs/ARCHITECTURE.md` and `docs/FEATURES.md`, then the files you are about to change. Never trust your recollection of a file. Re-read it.
3. **Ask when unclear.** If a rule is ambiguous, contradicts another rule, or needs a decision that is mine, stop and ask. Offer two or three options with a recommendation and what each costs. Do not guess and keep going.
4. **Traceability.** Put the prompt ID and the feature ID in every commit message, for example `P-007 F-05: add content editor`. Do not edit anything in `prompts/` except to add a `## Result` section when I ask.
5. **Do not commit or push** unless the prompt says to. Leave changes in the working tree for my review.
6. **Record decisions in the repo.** Anything new that affects later work goes in `DECISIONS.md` (next free ID, with a reason), not only in code comments. Keep `docs/` in step with the code.

## 2. Honesty and reporting

This matters more than speed. I rely on your report to decide what to verify.

1. Report only what you actually ran or checked. Never write "pass" for an acceptance criterion that has no test or check behind it.
2. If you could not test something (a real database, a browser, a screenshot), say so and say what I must verify by hand. You cannot reach my Supabase project, so never claim database policies were tested.
3. If the build does not match the prompt, say so plainly in your report. Do not leave a mismatch for me to find.
4. If you did not do part of what the prompt asked, list it. Do not leave items out of the report silently.
5. If you cannot see images, say so. Do not claim a design looks good. Describe what you built and let me judge.
6. Use the report format the prompt asks for. If it gives none, report: what changed, what passed, what failed, what I must verify, and any deviations.

## 3. Hard rules

1. **Frozen schemas.** Do not change anything in `src/schema/` (D-034). If you need a change, stop and tell me.
2. **No secrets.** Never create, request, print, log, or commit real keys. Use placeholders. `.env.local` stays ignored. The service-role or secret key is not used anywhere (D-055).
3. **Consistent names.** An environment variable, setting, or identifier must have the same name in the code, `.env.example`, the README, and the docs, and a test should read the real example file instead of a mock.
4. **No new dependencies** without asking me, except those pre-approved in section 5.
5. **Draft privacy.** Public pages and search read only `published_portfolios`. Never expose drafts, profiles, or private tables to anonymous users (D-011, D-053).
6. **Untrusted input.** User text is always rendered as text. Never use `dangerouslySetInnerHTML` for user content. Links are `http` or `https` only. Validate on the server even when the browser already validated.
7. **Quality gates.** Before reporting a task done, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. All four must pass. If one fails, say so and show the output instead of reporting done.
8. **Do not touch unrelated files.** Keep each change small and inside the prompt's scope.

## 4. Code standards

- TypeScript in strict mode. No `any` unless you explain why in a comment.
- Zod validates every boundary: forms, server actions, and anything read from the database or an AI.
- Server actions never take a user id from the client. Use the signed-in session.
- Portfolio rendering (`src/render/`): server components only, no `"use client"`, colors only from the theme CSS variables, radius only from the radius variable, logical CSS properties (no left or right), `dir="auto"` on user text, and all motion respects `prefers-reduced-motion` (D-042, D-047, D-048).
- Put logic in pure functions where you can, so it can be tested without a browser.
- Write tests with the feature. Name each test with its acceptance criterion, for example `AC-7 rejects look-alike image hosts`.
- Keep files focused. Prefer clear names over comments, and add a comment only for the reason behind something non-obvious.

## 5. UI and UX excellence

I want the interface to feel polished, calm, and consistent. This section applies to the Folio app (signup, login, dashboard, editor, builder). The portfolio worlds follow their own direction in `docs/ARCHITECTURE.md` and the design tokens.

### Use the best tools you have

At the start of any UI task, list the skills, plugins, and MCP tools available to you, and use the relevant ones for:

- design guidance and quality review (any frontend or UI design skill),
- component libraries and icons,
- accessibility auditing,
- browser automation, to take screenshots and test responsive layouts,
- design tools such as Figma, if connected.

In your report, say which you used and which you looked for and did not have. Do not install tools or add servers on your own. Tell me what would help and I will decide.

### Approved libraries for the app UI

For the app UI only (never inside the portfolio worlds): shadcn/ui components with their Radix dependencies, `lucide-react` icons, and the small helper packages shadcn needs (`clsx`, `tailwind-merge`, `class-variance-authority`). Tailwind is already in the project. Everything else needs my approval.

### Quality bar for every screen

1. **Consistency.** Reuse the same components, spacing scale, type scale, and color roles across the app. Define the app's own tokens once (in the global stylesheet) and use them. No one-off styles.
2. **Visual hierarchy.** One clear primary action per screen. Clear headings. Generous, even spacing. Readable line lengths.
3. **All states.** Every interactive element and every data view has designed states: default, hover, focus-visible, active, disabled, loading, empty, error, and success. Never leave a blank screen or a raw error.
4. **Forms.** Visible labels (not placeholders alone), helper text where useful, inline errors tied to their field, a clear success message, and a sensible keyboard order. Disable a submit button only while a request is running.
5. **Responsive.** Looks right and works at 375, 768, and 1280 px wide, with no horizontal scrolling. Touch targets are at least 44 px.
6. **Accessibility.** Keyboard operable, visible focus, correct landmarks and headings, labels and alt text, text contrast of at least WCAG AA in the app UI, and no information carried by color alone.
7. **Feedback and motion.** Show progress for anything slower than about a second. Keep motion subtle, short, and disabled under `prefers-reduced-motion`.
8. **Arabic and mixed text.** Inputs and displayed user text handle Arabic correctly (`dir="auto"`). Check that layouts do not break with right-to-left text.
9. **Copy.** Short, plain, friendly labels and messages. No jargon, no blame in error messages.

### Verify, then report honestly

For each UI feature, if you have a way to view screenshots, capture the key screens at the three widths and review them against the bar above. Fix what you find. If you cannot view images, say so, check the layout with measurements and automated checks instead, and list the screens I should review by eye. Never describe a design as "perfect" or "polished". Describe the choices you made.

## 6. Definition of done for any task

- Every acceptance criterion in the prompt is met, or listed as not met with the reason.
- The four quality gates pass.
- `DECISIONS.md` and `docs/` are up to date.
- No secrets, no unrelated changes, nothing committed unless asked.
- The report is accurate, complete, and lists what I must verify by hand.

## 7. Changing this file

Only I change this file, or you do at my request. If a rule here causes a problem, tell me rather than working around it.
