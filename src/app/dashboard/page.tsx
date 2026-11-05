import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureDraftPortfolio } from "@/portfolio/draft";

// This page depends on who is signed in, so it is rendered per request (see
// `getCurrentUser`). Blocking is the honest behaviour: an anonymous visitor must
// get a redirect, not a prerendered shell that flashes the wrong page.
export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard | Folio",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (user === null) {
    redirect("/login");
  }

  const profile = await getOwnProfile(user.id);

  if (profile === null) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-ink">Your profile is missing</h1>
        <p className="text-sm text-ink-soft">
          Your account exists, but its profile row does not, so there is nothing to edit yet.
          Please contact support and we will repair it.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-rule-strong px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
          >
            Log out
          </button>
        </form>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  await ensureDraftPortfolio(supabase, user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-soft">Signed in as @{profile.username}</p>
          <h1 className="text-2xl font-semibold text-ink">{profile.displayName}</h1>
          {profile.headline.trim().length > 0 ? (
            <p className="text-ink-soft">{profile.headline}</p>
          ) : null}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-rule-strong px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
          >
            Log out
          </button>
        </form>
      </header>

      <section
        aria-labelledby="portfolio-heading"
        className="flex flex-col gap-3 rounded-lg border border-rule bg-panel p-5"
      >
        <h2 id="portfolio-heading" className="text-lg font-medium text-ink">
          Your portfolio
        </h2>
        <p className="text-sm text-ink-soft">
          Your draft is private. Only you can see it until you publish.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/edit"
            className="inline-flex min-h-11 items-center rounded-md bg-cta px-4 text-sm font-medium text-cta-ink hover:bg-cta/90"
          >
            Edit your portfolio
          </Link>
          <Link
            href="/dashboard/preview"
            className="inline-flex min-h-11 items-center rounded-md border border-rule-strong px-4 text-sm font-medium text-ink hover:bg-canvas"
          >
            Preview
          </Link>
        </div>
        <p className="text-sm text-ink-soft">
          Your page will live at{" "}
          <span className="font-medium text-ink">/u/{profile.username}</span> once it is
          published.
        </p>
      </section>
    </main>
  );
}
