# Folio

Folio is a no-code portfolio builder for students, new graduates, and beginners in programming and design. An owner describes the look they want, an AI produces a complete design, and a visual builder lets them adjust it before publishing at a personal link. Every portfolio is a pair of structured documents — one for the design, one for the content — turned into a page by a single renderer, and published portfolios are searchable by name and skill so recruiters and collaborators can find people. v1 is nine features (F-01 to F-09) delivered in one week.

**Status:** scaffolded. The schema layer (F-02), the renderer (F-03) and both design worlds (F-04) are implemented and tested; five demo portfolios render at `/u/demo-editorial`, `/u/demo-terminal`, `/u/demo-minimal`, `/u/demo-compact` and `/u/demo-long`.

## Documentation

| File | Contents |
| --- | --- |
| `docs/PRODUCT.md` | What Folio is, who it is for, v1 scope and success criteria |
| `docs/FEATURES.md` | F-01 to F-09, dependencies, build order, cut order |
| `docs/ARCHITECTURE.md` | Stack, design as data, data flows, folder proposal, security rules |
| `DECISIONS.md` | Decision log, D-001 to D-051 |
| `prompts/` | Every prompt sent to the developer, one file per prompt (owner-maintained) |

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm test            # Vitest, 147 tests
npm run typecheck   # next typegen + tsc --noEmit
```

The app is a Next.js 16 App Router project. `src/schema/` holds the F-02 schemas, `src/render/` the F-03 renderer, and `src/data/` the fixture implementation of `PortfolioSource` and `SkillCatalog` that F-07 replaces with the database. The generator's default page is still at `/`.

## Conventions

- One feature per prompt; one prompt per file in `prompts/`.
- Commit messages and notes reference the feature ID, for example `F-02: design schema`.
- A decision changes only through `DECISIONS.md`, never silently in code.
