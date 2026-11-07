import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PreviewFrame } from "@/builder/components/preview-frame";
import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureDraftPortfolio, readDraftPortfolio, type DraftReader } from "@/portfolio/draft";
import { fontVariableClassName } from "@/render/fonts";
import type { SkillNames } from "@/render/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Preview | Folio",
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

export default async function PreviewFramePage() {
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
      <main className="flex min-h-dvh items-center justify-center px-6 py-12">
        <p className="text-sm text-ink-soft">
          {draft.status === "missing"
            ? "Your draft row is missing. Reload the dashboard to create it, then try again."
            : draft.status === "failed"
              ? "The database did not answer. Try again in a moment."
              : "The saved draft does not match the current format, so it cannot be previewed."}
        </p>
      </main>
    );
  }

  const skills = await loadSkillNames(draft.content.skills.skillIds);

  return (
    <PreviewFrame
      initialDesign={draft.design}
      profile={{
        username: profile.username,
        displayName: profile.displayName,
        headline: profile.headline,
      }}
      content={draft.content}
      skills={skills}
      fontClassName={fontVariableClassName}
    />
  );
}
