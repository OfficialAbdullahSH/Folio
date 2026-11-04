# Folio

Folio is a no-code portfolio builder for students, new graduates, and beginners in programming and design. An owner describes the look they want, an AI produces a complete design, and a visual builder lets them adjust it before publishing at a personal link. Every portfolio is a pair of structured documents — one for the design, one for the content — turned into a page by a single renderer, and published portfolios are searchable by name and skill so recruiters and collaborators can find people. v1 is nine features (F-01 to F-09) delivered in one week.

**Status:** F-01 to F-04 are implemented and tested. Accounts, sessions, the database and row-level security exist (F-01); the schema layer (F-02), the renderer (F-03) and both design worlds (F-04) are done. Seven demo portfolios render at `/u/demo-editorial`, `/u/demo-terminal`, `/u/demo-minimal`, `/u/demo-compact`, `/u/demo-long`, `/u/demo-editorial-bold` and `/u/demo-terminal-light`; they still come from fixtures, not the database.

## Documentation

| File | Contents |
| --- | --- |
| `docs/PRODUCT.md` | What Folio is, who it is for, v1 scope and success criteria |
| `docs/FEATURES.md` | F-01 to F-09, dependencies, build order, cut order |
| `docs/ARCHITECTURE.md` | Stack, design as data, data flows, folder proposal, security rules |
| `DECISIONS.md` | Decision log, D-001 to D-059 |
| `prompts/` | Every prompt sent to the developer, one file per prompt (owner-maintained) |

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest, 199 tests
npm run typecheck   # next typegen + tsc --noEmit
npm run lint
npm run build
```

The app is a Next.js 16 App Router project. `src/schema/` holds the F-02 schemas, `src/render/` the F-03 renderer, `src/data/` the fixture implementation of `PortfolioSource` and `SkillCatalog` that F-07 replaces with the database, `src/lib/auth/` the F-01 auth logic, and `src/portfolio/` the defaults a new draft starts from.

## Supabase setup (F-01)

The app runs without these steps, but signup and login need a Supabase project.

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql` once, top to bottom. It creates `profiles`, `portfolios`, `published_portfolios`, the profile trigger, the `is_username_available` function and every RLS policy.
3. In **Authentication → Sign In / Providers → Email**, turn **Confirm email** off (D-005). Without this a new account has no session and the signup form says it could not sign you in.
4. Copy `.env.example` to `.env.local` and fill in the project URL and the anon key from **Project Settings → API**. `.env.local` is gitignored; never put the service-role key there.
5. Restart `npm run dev`, then sign up at `/signup`. The dashboard is at `/dashboard`.

To prove the policies hold, run the checks in `supabase/tests/rls-checklist.md`. They need two accounts created through `/signup`.

## Routes

| Route | What it is |
| --- | --- |
| `/` | landing page |
| `/signup`, `/login` | account pages; a signed-in visitor is sent to the dashboard |
| `/dashboard` | the signed-in home; creates the draft on first visit; anonymous visitors are sent to `/login` |
| `/u/<username>` | public portfolio (F-03, fixture data until F-07) |

## Conventions

- One feature per prompt; one prompt per file in `prompts/`.
- Commit messages and notes reference the feature ID, for example `F-02: design schema`.
- A decision changes only through `DECISIONS.md`, never silently in code.
