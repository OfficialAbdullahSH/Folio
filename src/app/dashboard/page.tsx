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
        <h1 className="text-2xl font-semibold text-stone-900">Your profile is missing</h1>
        <p className="text-sm text-stone-600">
          Your account exists, but its profile row does not, so there is nothing to edit yet.
          Please contact support and we will repair it.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
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
          <p className="text-sm text-stone-500">Signed in as @{profile.username}</p>
          <h1 className="text-2xl font-semibold text-stone-900">{profile.displayName}</h1>
          {profile.headline.trim().length > 0 ? (
            <p className="text-stone-600">{profile.headline}</p>
          ) : null}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
          >
            Log out
          </button>
        </form>
      </header>

      <section
        aria-labelledby="portfolio-heading"
        className="flex flex-col gap-3 rounded-lg border border-stone-200 p-5"
      >
        <h2 id="portfolio-heading" className="text-lg font-medium text-stone-900">
          Your portfolio
        </h2>
        <p className="text-sm text-stone-600">
          Your draft is ready. Editing and publishing arrive in the next steps; until then
          nobody can see this page.
        </p>
        <p className="text-sm text-stone-900">
          <Link href={`/u/${profile.username}`} className="underline underline-offset-2">
            /u/{profile.username}
          </Link>{" "}
          <span className="text-stone-500">— not published yet</span>
        </p>
      </section>
    </main>
  );
}
