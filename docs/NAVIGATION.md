# Navigation and flow (X-01)

How a person gets from one Folio screen to another without typing a URL (D-095 to
D-098, D-104).
This document is the record the X-01 acceptance criteria ask for: the screens, what links
into and out of each one, a reachability matrix with the state **before** P-011 and **after**
it, the dead ends the audit found, and the limits that remain.

**How the two columns were produced.**

- **Before** is the screens as they were committed at `be55228` (the commit before P-011),
  read from that commit's own source (`git show be55228:src/app/...`) and from the routes'
  rendered links. The P-011 audit walked those screens live, but its findings were never
  written into this file, so this column is a reconstruction from the pre-P-011 code, not a
  second live walk of the old build.
- **After** is the links the built app renders, read from the P-011b source at each route.
  The full live walk in "The live reachability walk" below has not been run, so most "After"
  entries are a code reading, not an observation. The exception is the P-011c partial walk
  recorded there, which followed the next-step links, the two publish links and the two Leave
  paths on a live account; those rows are observations.

A click count is the number of in-app links a person follows. "Typed URL" means the screen
is reachable only by editing the address bar, which is the complaint X-01 answers.

## Screens

| Route | Who can see it | Links in | Links out |
| --- | --- | --- | --- |
| `/` | anyone | the brand in the header on every app screen, the 404 page, external links | signed out: `/login`, `/signup`, `/search`, `/u/demo-editorial`, `/u/demo-terminal`; signed in: `/dashboard`, `/dashboard/edit`, `/search`, the two demos |
| `/login` | anyone signed out (signed in: redirected to `next` or `/dashboard`) | the landing page, `/signup`, the header when signed out, any protected page (with `?next=`) | `/signup`; after a successful log in: `next` or `/dashboard` |
| `/signup` | anyone signed out (signed in: redirected to `/dashboard`) | the landing page, `/login`, the header when signed out | `/login`; after a successful sign up: `/dashboard` |
| `/dashboard` | the owner | the brand and the Dashboard link in the header, after log in or sign up, the "Publish" step link, the builder's "Publish" next step, the preview's "Next: publish" | `/dashboard/edit`, `/dashboard/design`, `#publish`, `/search`, the public page (when published), the publish dialogs |
| `/dashboard/edit` | the owner | the header, the tab bar, the dashboard's first step | `/dashboard`, `/dashboard/design`, `/dashboard/preview` (tab bar), `/dashboard/design` and `/dashboard/preview` as the next steps after a save |
| `/dashboard/design` | the owner | the header, the tab bar, the dashboard's second step | `/dashboard`, `/dashboard/edit`, `/dashboard/preview` (tab bar), `/dashboard/preview` and `/dashboard#publish` as the next steps after a save |
| `/dashboard/preview` | the owner | the header, the tab bar, the dashboard's third step, the builder's next step after a save, the builder's "Publish" next step | `/dashboard`, `/dashboard/edit`, `/dashboard/design` (tab bar), `/dashboard#publish` as the "Next: publish" link |
| `/dashboard/preview/frame` | the owner; loaded inside the builder's iframe | the builder's iframe only | none (it is a rendering surface, not a screen) |
| `/search` | anyone | the header, the landing page, the dashboard, a skill chip, a result card, the 404 page | `/` (brand when signed out), `/u/<username>`, `/search?skill=<slug>`, `/search?page=<n>`, `/signup` (empty state when signed out) |
| `/u/<username>` | anyone | `/search`, the landing page's examples, external links | the owner's own contact links; no Folio header (D-095) |
| 404 (`not-found`) | anyone | any bad address | `/`, `/search`, and the header (which adds Dashboard, Content, Design, Preview, Search when signed in) |

Two screens are deliberately outside the app shell: a public portfolio (`/u/*`) and the
preview frame. They render the owner's design and nothing of Folio's (D-042, D-100).

## Reachability matrix

`1` = one click, `2` = two clicks, `3+` = three or more, `typed` = only by editing the
address bar, `n/a` = not a related screen (for example a public page to the owner's editor,
which would leak the owner's session into a public surface).

| From | To | Before | After |
| --- | --- | --- | --- |
| `/` (signed out) | `/login` | 1 | 1 |
| `/` (signed out) | `/signup` | 1 | 1 |
| `/` (signed out) | `/search` | 1 | 1 |
| `/` (signed in) | `/dashboard` | typed | 1 |
| `/` (signed in) | `/dashboard/edit` | typed | 1 |
| `/login` | `/signup` | 1 | 1 |
| `/signup` | `/login` | 1 | 1 |
| `/dashboard` | `/dashboard/edit` | 1 | 1 |
| `/dashboard` | `/dashboard/design` | 1 | 1 |
| `/dashboard` | `/dashboard/preview` | 1 | 1 |
| `/dashboard` | `/search` | 1 | 1 |
| `/dashboard` | `#publish` | 1 | 1 |
| `/dashboard/edit` | `/dashboard` | 1 | 1 |
| `/dashboard/edit` | `/dashboard/design` | 2 | 1 |
| `/dashboard/edit` | `/dashboard/preview` | 2 | 1 |
| `/dashboard/edit` | `/search` | 2 | 1 |
| `/dashboard/design` | `/dashboard` | 1 | 1 |
| `/dashboard/design` | `/dashboard/edit` | 2 | 1 |
| `/dashboard/design` | `/dashboard/preview` | 2 | 1 |
| `/dashboard/design` | `/search` | 2 | 1 |
| `/dashboard/preview` | `/dashboard` | 1 | 1 |
| `/dashboard/preview` | `/dashboard/edit` | 1 | 1 |
| `/dashboard/preview` | `/dashboard/design` | 2 | 1 |
| `/dashboard/preview` | `/search` | 2 | 1 |
| `/search` | `/` | 1 | 1 |
| `/search` | `/dashboard` | typed | 1 (header, when signed in) |
| `/search` | `/dashboard/edit` | typed | 1 (header, when signed in) |
| `/search` | `/u/<username>` | 1 | 1 |
| `/u/<username>` | `/` | typed | typed (known limit, below) |
| 404 | `/` | 1 | 1 |
| 404 | `/search` | typed | 1 |
| 404 | `/dashboard` | typed | 1 (header, when signed in) |
| any app screen | the theme control | does not exist | 1 |

Before P-011 there was no header, no tab bar, no theme control and no return path, so the
signed-in screens were a ring around `/dashboard` and nothing else: the editor could only
reach the builder through the dashboard, and the public pages were a one-way door.

## Dead ends and frustrations found

These are the defects the audit found, in the owner's terms ("I end up typing the URL").

1. **No persistent navigation.** The signed-in screens had no header. The editor, builder
   and preview each had one "back to the dashboard" link and nothing else.
2. **No way from the editor to the builder.** Switching from writing to designing meant
   dashboard → design, two clicks, and the dashboard gave no hint that this was the flow.
3. **No way to preview after designing** except dashboard → preview.
4. **A dead end after login.** Log in always landed on `/dashboard`, even when the visitor
   had asked for `/dashboard/design` and been bounced to `/login`. The address they wanted
   was lost.
5. **A dead end after logout.** Log out landed on `/login`, a screen a person who has just
   left does not want.
6. **No way back into the app from `/search`** when signed in: the page linked to `/` and
   the landing page showed "Log in / Sign up" to a visitor who was already signed in.
7. **The 404 page offered one link** (`/`), and no search and no dashboard.
8. **No theme control at all.** The app followed the operating system only, so a person who
   wanted dark on a light machine had no way to say so.
9. **Unsaved work vanished silently.** Following any link out of the editor or the builder
   threw away the document with no question.
10. **Public pages are a one-way door.** A visitor on `/u/<username>` has no Folio
    navigation; only the browser's back button leaves the page.

## What changed

- One header on every app screen (D-095): brand, the destinations that exist for that
  visitor, `aria-current="page"`, the account menu, the theme control, and a menu panel
  below `md`.
- A tab bar on Content, Design and Preview (D-096), so the three are one click apart.
- The dashboard as the hub: Content, Design, Publish as three steps with a link on each.
- A return path (D-097): a protected page sends an anonymous visitor to
  `/login?next=<path>`, and login lands them there. Unsafe `next` values are ignored.
- An unsaved-changes guard (D-098): every in-app link asks before it throws away work.
- Next-step links after a save (P-011c): the editor offers "Next: design your portfolio"
  and "Preview", the builder offers "Next: preview" and "Publish", and the preview page
  always offers "Next: publish". Both publish links land on `/dashboard#publish`, the publish
  card's own id, which carries the same scroll offset as the main region.
- Leave means discard (D-104): the guard counts every Leave decision, and the editor and
  the builder rebuild themselves from the document the last save wrote, so the edit is gone,
  the status returns to "All changes saved", and no later warning fires.
- Log out lands on the landing page.
- The 404 page and the landing page follow the session.

## Known limits

1. **The browser's back button is not intercepted.** The guard covers in-app links
   (D-098). Browser back is a history traversal the App Router does not expose reliably:
   `popstate` fires after the URL has changed, so a "Stay" answer can only be honoured by
   pushing the old entry back, which leaves a duplicate history entry and, on a fast
   double-press, the wrong page. The decision was to document it instead of shipping a
   handler that sometimes loses the document. `beforeunload` still covers closing the tab
   and reloading. **Not yet observed:** pressing back after an unsaved edit has not been
   tried in a browser in P-011b, so what the person sees is the documented limit above, not
   a measurement.
2. **A public portfolio has no Folio navigation.** That is deliberate (D-095, D-100): the
   page belongs to the owner, and an app header would put Folio's chrome and theme on
   someone else's design. Leaving it is the browser's job.
3. **The preview frame is not a screen.** It has no header, by design.
4. **Two navigation models are visible at once on Content, Design and Preview** (the
   header and the tab bar repeat three destinations). Accepted by the owner: the header is
   the app's map, the tab bar is this job's phases.
5. **No settings page.** The theme control is the only setting. It sits in the header from
   `md` up and inside the menu panel below it, because the header overflowed a 375 px phone
   by 57 px (D-103).

## The live reachability walk

_P-011b item 6.1. The full walk is **still not run**: for each row of the matrix above it
must record the screen it started on, the link it followed, the screen it landed on, and
whether the header and the tab bar were present there. Until then the After column is a
reading of the source for every row the P-011c pass below does not cover, and this document
says so rather than implying a walk that did not happen._

**The P-011c partial walk (2026-11-15).** The P-011c live run followed the links the After
column depends on most, on a throwaway account (`@qa-p011c-1115`, display name "QA P011c")
at `localhost:3000`, with a marker sentence in About and one project:

| From | Link followed | Landed on | Header and tab bar there |
| --- | --- | --- | --- |
| `/dashboard/edit` | "Next: design your portfolio", after a save | `/dashboard/design` | header and tab bar |
| `/dashboard/edit` | "Preview", after a save | `/dashboard/preview` | header and tab bar |
| `/dashboard/design` | "Next: preview", after a save | `/dashboard/preview` | header and tab bar |
| `/dashboard/design` | "Publish", after a save | `/dashboard#publish` | header; the dashboard is not a tab-bar screen. The publish card sat below the sticky header |
| `/dashboard/preview` | "Next: publish" | `/dashboard#publish` | header; the publish card sat below the sticky header |
| `/dashboard/edit` | the header's Dashboard link, with an unsaved edit | "Leave without saving?" — Cancel stayed on the screen with the text kept; "Leave and lose changes" reached `/dashboard` | header |
| `/dashboard/design` | the tab bar's Content link, with an unsaved look | the same dialog — Cancel stayed on the screen with the look kept; "Leave and lose changes" reached `/dashboard/edit` | header and tab bar |

Each of the five next-step links disappeared on the next edit, which is what "after a save"
means in this table; a second navigation after Leave raised no dialog. The rest of the matrix
— the landing page, the auth screens, `/search`, the 404 page, the demos, the account menu
and the public page — was not walked in this pass, so those After entries remain a reading of
the source. The account was unpublished at the end and `/u/qa-p011c-1115` answers 404.
