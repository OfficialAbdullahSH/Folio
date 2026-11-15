import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from "@/editor/lib/styles";
import { getCurrentUser } from "@/lib/auth/session";

// The header and the calls to action follow the visitor's session, so this page is
// rendered per request rather than prerendered.
export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <AppShell header={<AppHeader />}>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-6 py-16"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-widest text-ink-soft uppercase">Folio</p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            A portfolio you describe, then publish.
          </h1>
          <p className="max-w-prose text-lg text-ink-soft">
            Folio turns a short description into a complete portfolio design you can adjust,
            then publishes it at a link you can share.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {user === null ? (
            <>
              <Link href="/signup" className={BUTTON_PRIMARY}>
                Create an account
              </Link>
              <Link href="/login" className={BUTTON_SECONDARY}>
                Log in
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={BUTTON_PRIMARY}>
                Go to your dashboard
              </Link>
              <Link href="/dashboard/edit" className={BUTTON_SECONDARY}>
                Continue writing
              </Link>
            </>
          )}
        </div>

        <form action="/search" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="home-search" className="sr-only">
            Search published portfolios
          </label>
          <input
            id="home-search"
            name="q"
            type="search"
            dir="auto"
            placeholder="A name, or a skill like react"
            className={INPUT}
          />
          <button type="submit" className={BUTTON_SECONDARY}>
            Search
          </button>
        </form>

        <p className="text-sm text-ink-soft">
          Or{" "}
          <Link href="/search" className="underline underline-offset-2">
            browse everyone who has published
          </Link>
          , or look at an example:{" "}
          <Link href="/u/demo-editorial" className="underline underline-offset-2">
            Editorial
          </Link>{" "}
          and{" "}
          <Link href="/u/demo-terminal" className="underline underline-offset-2">
            Terminal
          </Link>
          .
        </p>
      </main>
    </AppShell>
  );
}
