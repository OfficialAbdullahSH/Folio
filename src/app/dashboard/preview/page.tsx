import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { BUTTON_SECONDARY } from "@/editor/lib/styles";
import { PREVIEW_NEXT_STEP } from "@/lib/navigation/next-steps";
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
      <AppShell header={<AppHeader />}>
        <WorkflowTabs />
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-6 py-16"
        >
          <h1 className="text-2xl font-semibold text-ink">We could not open your draft</h1>
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
      </AppShell>
    );
  }

  const skills = await loadSkillNames(draft.content.skills.skillIds);

  return (
    <AppShell header={<AppHeader />}>
      <WorkflowTabs />

      {/*
        The portfolio renders its own `<main id="main-content">` (each world has one), so
        this wrapper is a `div`: two nested mains would be invalid, and the skip link
        should land on the portfolio itself.

        The note is an `<aside>` (D-103): it is app chrome on a page whose only `<main>` is
        the portfolio's, so without a landmark of its own it belonged to no region. The
        portfolio stays a direct child of the shell on purpose. Wrapping it would remove the
        duplicate banner axe reports (the portfolio brings its own `<header>`) but would also
        push its `<main>` below a landmark, and a real portfolio page has one banner, not two.
        The honest fix for the duplicate banner is to render the preview in the frame document
        the builder already uses, which is a change to F-06 and not to this prompt.
      */}
      <div className="flex flex-1 flex-col">
        <aside aria-label="Preview" className="border-b border-rule bg-panel">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">Preview.</span> This is your saved draft,
              and only you can see it.
            </p>
            <Link href={PREVIEW_NEXT_STEP.href} className={BUTTON_SECONDARY}>
              {PREVIEW_NEXT_STEP.label}
            </Link>
          </div>
        </aside>

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
    </AppShell>
  );
}
