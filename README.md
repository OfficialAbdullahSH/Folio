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

The app is a Next.js 16 App Router project. `src/schema/` holds the F-02 schemas, `src/render/` the F-03 renderer, `src/data/` the fixture implementation of `PortfolioSource` and `SkillCatalog` that F-07 replaces with the database, `src/lib/auth/` the F-01 auth logic, `src/portfolio/` the defaults a new draft starts from, and `src/editor/` the F-05 editor: its reducer, the save path and the components.

## Supabase setup (F-01, F-05)

The app runs without these steps, but signup, login and the editor need a Supabase project.

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql` once, top to bottom. It creates `profiles`, `portfolios`, `published_portfolios`, the profile trigger, the `is_username_available` function and every RLS policy.
3. In the same **SQL Editor**, run `supabase/migrations/0002_skills_and_storage.sql` once. It creates `skills`, `skill_aliases`, the public `project-images` bucket with its size and type limits, and the policies that keep each user inside their own folder.
4. In the same **SQL Editor**, run `supabase/seed/skills.sql`. It loads the canonical skill list and the aliases the picker resolves. Running it again updates the same rows instead of duplicating them.
5. For search (F-09), run `supabase/migrations/0003_search.sql` once. It adds the two GIN indexes and the `search_portfolios` and `popular_skills` functions. Both indexes are `if not exists` and both functions are `create or replace`, so it is safe to run again.
6. Optional, for a search page with something in it: run `supabase/seed/demo_portfolios.sql`. It adds ten fictional portfolios from the `demo.folio.invalid` domain with fixed ids. Regenerate the file with `npm run seed:demo` after editing `src/search/demo-seed.ts`. Remove exactly those ten with `supabase/seed/demo_portfolios_remove.sql`. The demo users cannot sign in.
7. In **Authentication → Sign In / Providers → Email**, turn **Confirm email** off (D-005). Without this a new account has no session and the signup form says it could not sign you in.
8. Copy `.env.example` to `.env.local` and fill in the project URL and the publishable key from **Project Settings → API**. The legacy anon key name, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, is also accepted (D-060). `.env.local` is gitignored; never put the service-role key there.
9. Restart `npm run dev`, then sign up at `/signup`. The dashboard is at `/dashboard`, the editor at `/dashboard/edit`, the draft preview at `/dashboard/preview`, and search at `/search`.

Steps 3 and 4 are what the skills picker reads. Without them the editor still opens, the picker says the list is not loaded, and saving refuses rather than writing skill slugs that do not exist. Step 5 is what `/search` reads: without it the page says search is not available right now.

To prove the policies hold, run the checks in `supabase/tests/rls-checklist.md`. They need two accounts created through `/signup`.

## Routes

| Route | What it is |
| --- | --- |
| `/` | landing page |
| `/signup`, `/login` | account pages; a signed-in visitor is sent to the dashboard |
| `/dashboard` | the signed-in home; creates the draft on first visit; anonymous visitors are sent to `/login` |
| `/dashboard/edit` | the content editor (F-05); owner only |
| `/dashboard/preview` | the saved draft rendered by the real renderer (F-05); owner only |
| `/u/<username>` | public portfolio (F-03; published snapshots from F-07, demo fixtures when a name has none) |
| `/search` | search published portfolios by name and skill (F-09), with no account needed |

## Conventions

- One feature per prompt; one prompt per file in `prompts/`.
- Commit messages and notes reference the feature ID, for example `F-02: design schema`.
- A decision changes only through `DECISIONS.md`, never silently in code.
