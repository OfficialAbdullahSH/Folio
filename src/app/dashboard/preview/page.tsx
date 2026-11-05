import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureDraftPortfolio, readDraftPortfolio, type DraftReader } from "@/portfolio/draft";
import { fontVariableClassName } from "@/render/fonts";
import { Portfolio } from "@/render/Portfolio";
import type { SkillNames } from "@/render/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Preview your portfolio | Folio",
  robots: { index: false, follow: false },
};

async function loadSkillNames(slugs: string[]): Promise<SkillNames> {
  if (slugs.length === 0) {
    return {};
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("skills").select("slug, name").in("slug", slugs);

  if (error !== null || data === null) {
    console.error("[folio] could not read skill names", error?.message ?? "no rows returned");

    return {};
  }

  return Object.fromEntries(data.map((row) => [row.slug, row.name]));
}

export default async function PreviewPortfolioPage() {
  const user = await getCurrentUser();

  if (user === null) {
    redirect("/login");
  }

  const profile = await getOwnProfile(user.id);

  if (profile === null) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  await ensureDraftPortfolio(supabase, user.id);

  const draft = await readDraftPortfolio(supabase as unknown as DraftReader, user.id);

  if (draft.status !== "ok") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold text-ink">
          We could not open your draft
        </h1>
        <p className="text-sm text-ink-soft">
          {draft.status === "missing"
            ? "Your draft row is missing. Reload the dashboard to create it, then try again."
            : draft.status === "failed"
              ? "The database did not answer. Try again in a moment."
              : "The saved draft does not match the current format, so it cannot be previewed."}
        </p>
        <Link
          href="/dashboard"
          className="w-fit rounded-md border border-rule-strong px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
        >
          Back to the dashboard
        </Link>
      </main>
    );
  }

  const skills = await loadSkillNames(draft.content.skills.skillIds);

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <div className="border-b border-rule bg-panel">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">Preview.</span> This is your saved
            draft, and only you can see it.
          </p>
          <Link
            href="/dashboard/edit"
            className="inline-flex min-h-11 items-center rounded-md border border-rule-strong px-4 text-sm font-medium text-ink hover:bg-canvas"
          >
            Back to editing
          </Link>
        </div>
      </div>

      <div className={`${fontVariableClassName} flex-1`}>
        <Portfolio
          profile={{
            username: profile.username,
            displayName: profile.displayName,
            headline: profile.headline,
          }}
          design={draft.design}
          content={draft.content}
          skills={skills}
        />
      </div>
    </div>
  );
}
