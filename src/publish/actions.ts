"use server";

import { revalidatePath } from "next/cache";

import { imageUrlPrefix } from "@/editor/image-url";
import { getCurrentUser } from "@/lib/auth/session";
import { readSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentDocument, DesignDocument } from "@/schema";

import { publishSnapshot, resetToPublished, unpublishPortfolio } from "./publish";
import type { SnapshotError } from "./snapshot";

/**
 * The three publishing actions (D-080 to D-083).
 *
 * None of them reads a portfolio from the browser: `publishAction` takes no form
 * payload at all, so the only inputs are the signed-in user's own rows. That is
 * what makes it impossible to publish under another name (AC-2).
 */

export type PublishFormState =
  | { status: "idle" }
  | { status: "published"; username: string }
  | { status: "unpublished" }
  | { status: "reset" }
  | { status: "error"; errors: SnapshotError[]; message: string };

const MESSAGES = {
  signedOut: "Your session ended. Log in again, then try again.",
  notConfigured: "This deployment has no database configured, so nothing can be published.",
  unreadable: "We could not read your saved portfolio. Reload the page and try again.",
  profileMissing: "Your profile row is missing, so there is nothing to publish. Please contact support.",
  draftMissing: "You have no saved portfolio yet. Open the editor, save it, then publish.",
  skillsMissing:
    "The skill list is not set up, so this could not be published. Run the database seed, then reload.",
} as const;

function failed(message: string, errors: SnapshotError[] = []): PublishFormState {
  return { status: "error", errors, message };
}

export async function publishAction(
  _previous: PublishFormState,
): Promise<PublishFormState> {
  const user = await getCurrentUser();

  if (user === null) {
    return failed(MESSAGES.signedOut);
  }

  const config = readSupabaseConfig();

  if (config === null) {
    return failed(MESSAGES.notConfigured);
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name, headline")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError !== null) {
    console.error("[folio] could not read the profile for publishing", profileError.message);

    return failed(MESSAGES.unreadable);
  }

  if (profile === null) {
    return failed(MESSAGES.profileMissing);
  }

  const { data: draft, error: draftError } = await supabase
    .from("portfolios")
    .select("design, content")
    .eq("user_id", user.id)
    .maybeSingle();

  if (draftError !== null) {
    console.error("[folio] could not read the draft for publishing", draftError.message);

    return failed(MESSAGES.unreadable);
  }

  if (draft === null) {
    return failed(MESSAGES.draftMissing);
  }

  const { data: skillRows, error: skillsError } = await supabase.from("skills").select("slug");

  if (skillsError !== null || skillRows === null) {
    console.error(
      "[folio] could not read the skill list",
      skillsError?.message ?? "no rows returned",
    );

    return failed(MESSAGES.skillsMissing);
  }

  const result = await publishSnapshot(
    {
      design: draft.design,
      content: draft.content,
      profile: {
        username: profile.username,
        displayName: profile.display_name,
        headline: profile.headline,
      },
    },
    {
      knownSkillSlugs: new Set(skillRows.map((row) => row.slug)),
      imagePrefix: imageUrlPrefix(config.url),
      writeSnapshot: async (snapshot) => {
        // `published_at` is deliberately absent: the column default sets it on the
        // first publish and the conflict update keeps it (AC-3).
        const { data, error } = await supabase
          .from("published_portfolios")
          .upsert(
            {
              user_id: user.id,
              username: snapshot.username,
              display_name: snapshot.displayName,
              headline: snapshot.headline,
              design: snapshot.design,
              content: snapshot.content,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select("user_id");

        if (error !== null) {
          return { error };
        }

        if (data === null || data.length === 0) {
          return { error: { message: MESSAGES.profileMissing } };
        }

        return { error: null };
      },
    },
  );

  if (!result.ok) {
    return failed(result.message, result.errors);
  }

  revalidatePath(`/u/${result.username}`);
  revalidatePath("/dashboard");

  return { status: "published", username: result.username };
}

export async function unpublishAction(
  _previous: PublishFormState,
): Promise<PublishFormState> {
  const user = await getCurrentUser();

  if (user === null) {
    return failed(MESSAGES.signedOut);
  }

  if (readSupabaseConfig() === null) {
    return failed(MESSAGES.notConfigured);
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const result = await unpublishPortfolio({
    removePublished: async () => {
      const { error } = await supabase
        .from("published_portfolios")
        .delete()
        .eq("user_id", user.id);

      return { error };
    },
  });

  if (!result.ok) {
    return failed(result.message);
  }

  if (profile !== null) {
    revalidatePath(`/u/${profile.username}`);
  }

  revalidatePath("/dashboard");

  return { status: "unpublished" };
}

export async function resetToPublishedAction(
  _previous: PublishFormState,
): Promise<PublishFormState> {
  const user = await getCurrentUser();

  if (user === null) {
    return failed(MESSAGES.signedOut);
  }

  if (readSupabaseConfig() === null) {
    return failed(MESSAGES.notConfigured);
  }

  const supabase = await createSupabaseServerClient();

  const { data: published, error: publishedError } = await supabase
    .from("published_portfolios")
    .select("design, content")
    .eq("user_id", user.id)
    .maybeSingle();

  if (publishedError !== null) {
    console.error("[folio] could not read the published snapshot", publishedError.message);

    return failed(MESSAGES.unreadable);
  }

  const result = await resetToPublished(published, {
    writeDraft: async (documents: { design: DesignDocument; content: ContentDocument }) => {
      const { data, error } = await supabase
        .from("portfolios")
        .update(documents)
        .eq("user_id", user.id)
        .select("user_id");

      if (error !== null) {
        return { error };
      }

      if (data === null || data.length === 0) {
        return { error: { message: MESSAGES.draftMissing } };
      }

      return { error: null };
    },
  });

  if (!result.ok) {
    return failed(result.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/edit");

  return { status: "reset" };
}
