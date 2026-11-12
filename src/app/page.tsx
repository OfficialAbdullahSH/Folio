import Link from "next/link";

import { BUTTON_SECONDARY, INPUT } from "@/editor/lib/styles";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 px-6 py-20">
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
        <Link
          href="/signup"
          className="rounded-md bg-cta px-5 py-2.5 text-sm font-medium text-cta-ink hover:bg-cta/90"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-rule-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
        >
          Log in
        </Link>
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
  );
}
