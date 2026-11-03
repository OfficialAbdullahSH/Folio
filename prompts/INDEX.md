# Folio prompt traceability index

Every prompt sent to DevAI is saved as its own file in this folder: `P-XXX-short-name.md`. Each prompt file records its prompt ID, the feature IDs it covers, the date, and its status. This table links them.

| Prompt | File | Feature(s) | Purpose | Sent | Status |
| --- | --- | --- | --- | --- | --- |
| P-000 | P-000-idea-brief.md | F-01 to F-09 (context) | Explain the product to DevAI, no code | 2026-11-03 | answered, accepted |
| P-001 | P-001-project-documentation.md | F-01 to F-09 (docs) | Create README, product, features, architecture docs and decision log | 2026-11-03 | answered, accepted |
| P-002 | P-002-decisions-update.md | F-02, F-04, F-05, F-06, F-09 (docs) | Resolve open questions, correct docs, add D-019 to D-027 | 2026-11-03 | answered, accepted |
| P-003 | P-003-F-02-schema.md | F-02 | Design, content, profile schemas with Zod validation and tests; adds D-028 to D-034 | 2026-11-03 | answered, accepted |
| P-004 | P-004-F-03-renderer.md | F-03 | Renderer, theme, base world, fixtures, public route; adds D-035 to D-042 | 2026-11-03 | answered |

## Feature checklist

| Feature | Name | Prompt(s) | Implemented | Verified |
| --- | --- | --- | --- | --- |
| F-01 | Sign up, log in, log out | | | |
| F-02 | Design file schema + validation | P-003 | yes (44 tests) | pending owner check |
| F-03 | Renderer: design file to public page | P-004 | yes (106 tests) | pending owner check |
| F-04 | Design worlds: Editorial, Terminal | | | |
| F-05 | Content sections and editing | | | |
| F-06 | Visual builder | | | |
| F-07 | Publish to personal link | | | |
| F-08 | AI design assistant | | | |
| F-09 | Search by name and skill | | | |

## Conventions

- One prompt per file. If a prompt needs a fix, save the new version as a new file (for example `P-004b-...`) instead of overwriting the old one.
- Record DevAI's response summary and the verification result in the prompt's file under a `## Result` heading after each run.
- Prompt bodies are stored verbatim, from the front matter to the end of the request. The traceability index itself lives only in this file.
