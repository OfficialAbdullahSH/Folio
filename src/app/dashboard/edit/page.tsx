import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EditorShell } from "@/editor/components/editor-shell";
import type { Skill, SkillAlias } from "@/editor/skills";
import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureDraftPortfolio, readDraftPortfolio, type DraftReader } from "@/portfolio/draft";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit your portfolio | Folio",
  robots: { index: false, follow: false },
};

async function loadSkills(): Promise<{ skills: Skill[]; aliases: SkillAlias[] }> {
  const supabase = await createSupabaseServerClient();

  const [skills, aliases] = await Promise.all([
    supabase.from("skills").select("slug, name").order("name"),
    supabase.from("skill_aliases").select("alias, skill_slug"),
  ]);

  if (skills.error !== null || skills.data === null) {
    console.error(
      "[folio] could not read the skill list",
      skills.error?.message ?? "no rows returned",
    );

    return { skills: [], aliases: [] };
  }

  if (aliases.error !== null || aliases.data === null) {
    console.error(
      "[folio] could not read the skill aliases",
      aliases.error?.message ?? "no rows returned",
    );
  }

  return {
    skills: skills.data.map((row) => ({ slug: row.slug, name: row.name })),
    aliases: (aliases.data ?? []).map((row) => ({
      alias: row.alias,
      skillSlug: row.skill_slug,
    })),
  };
}

export default async function EditPortfolioPage() {
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
              : "The saved draft does not match the current format, so opening it here could lose it."}
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

  const { skills, aliases } = await loadSkills();

  return (
    <EditorShell
      userId={user.id}
      username={profile.username}
      profile={{ displayName: profile.displayName, headline: profile.headline }}
      content={draft.content}
      skills={skills}
      aliases={aliases}
    />
  );
}
