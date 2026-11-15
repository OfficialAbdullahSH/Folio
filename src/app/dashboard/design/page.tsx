import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { resetDesignAction } from "@/builder/actions";
import { BuilderShell } from "@/builder/components/builder-shell";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureDraftPortfolio, readDraftPortfolio, type DraftReader } from "@/portfolio/draft";
import { fontVariableClassName } from "@/render/fonts";

export const instant = false;

export const metadata: Metadata = {
  title: "Design your portfolio | Folio",
  robots: { index: false, follow: false },
};

export default async function DesignPortfolioPage() {
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
    const designIsInvalid = draft.status === "invalid" && draft.scope === "design";

    return (
      <AppShell header={<AppHeader />}>
        <WorkflowTabs />
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-6 py-16"
        >
          <h1 className="text-2xl font-semibold text-ink">
            {designIsInvalid ? "Your saved design cannot be opened" : "We could not open your draft"}
          </h1>
          <p className="text-sm text-ink-soft">
            {draft.status === "missing"
              ? "Your draft row is missing. Reload the dashboard to create it, then try again."
              : draft.status === "failed"
                ? "The database did not answer. Try again in a moment."
                : designIsInvalid
                  ? "The saved design no longer matches the current format, so the builder cannot open it. Nothing has been changed. Resetting puts the default design back, and you can save it from there."
                  : "The saved content does not match the current format, so the builder cannot open it. Nothing has been changed. Fix it in the editor."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {designIsInvalid ? (
              <form action={resetDesignAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-md bg-cta px-4 text-sm font-medium text-cta-ink hover:bg-cta/90"
                >
                  Reset to the default design
                </button>
              </form>
            ) : null}
            <Link
              href={draft.status === "invalid" && !designIsInvalid ? "/dashboard/edit" : "/dashboard"}
              className="inline-flex min-h-11 w-fit items-center rounded-md border border-rule-strong px-4 text-sm font-medium text-ink hover:bg-canvas"
            >
              {draft.status === "invalid" && !designIsInvalid
                ? "Open the editor"
                : "Back to the dashboard"}
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell header={<AppHeader />}>
      <WorkflowTabs />
      <BuilderShell
        design={draft.design}
        content={draft.content}
        fontClassName={fontVariableClassName}
      />
    </AppShell>
  );
}
