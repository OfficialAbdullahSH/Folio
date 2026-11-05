"use server";

import type { ContentDocument } from "@/schema";

import { getCurrentUser } from "@/lib/auth/session";
import { readSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { imageUrlPrefix } from "./image-url";
import { saveDraft, type FieldError, type WriteResult } from "./save";

export type SaveFormState =
  | { status: "idle" }
  | { status: "saved"; savedAt: string; revision: number }
  | { status: "error"; errors: FieldError[]; message: string };

const MESSAGES = {
  signedOut: "Your session ended. Log in again, then save.",
  unreadable: "We could not read the form. Reload the page and try again.",
  notConfigured: "This deployment has no database configured, so nothing can be saved.",
  skillsMissing:
    "The skill list is not set up, so this could not be saved. Run the database migration and seed, then reload.",
  profileMissing: "Your profile row is missing, so there is nowhere to save. Please contact support.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validates and writes the draft (D-061).
 *
 * The browser's copy of the document is untrusted: `saveDraft` validates it against
 * the same schemas the rest of the app uses, and RLS is what limits the write to the
 * signed-in owner's own row.
 */
export async function saveContentAction(
  _previous: SaveFormState,
  formData: FormData,
): Promise<SaveFormState> {
  const user = await getCurrentUser();

  if (user === null) {
    return { status: "error", errors: [], message: MESSAGES.signedOut };
  }

  const raw = formData.get("payload");
  let payload: unknown;

  try {
    payload = JSON.parse(typeof raw === "string" ? raw : "");
  } catch {
    return { status: "error", errors: [], message: MESSAGES.unreadable };
  }

  if (!isRecord(payload)) {
    return { status: "error", errors: [], message: MESSAGES.unreadable };
  }

  const config = readSupabaseConfig();

  if (config === null) {
    return { status: "error", errors: [], message: MESSAGES.notConfigured };
  }

  const supabase = await createSupabaseServerClient();

  const { data: skillRows, error: skillsError } = await supabase.from("skills").select("slug");

  if (skillsError !== null || skillRows === null) {
    console.error(
      "[folio] could not read the skill list",
      skillsError?.message ?? "no rows returned",
    );

    return { status: "error", errors: [], message: MESSAGES.skillsMissing };
  }

  const knownSkillSlugs = new Set(skillRows.map((row) => row.slug));

  const writeContent = async (content: ContentDocument): Promise<WriteResult> => {
    const { data, error } = await supabase
      .from("portfolios")
      .update({ content })
      .eq("user_id", user.id)
      .select("user_id");

    if (error !== null) {
      return { error };
    }

    if (data === null || data.length === 0) {
      return { error: { message: MESSAGES.profileMissing } };
    }

    return { error: null };
  };

  const writeProfile = async (profile: {
    displayName: string;
    headline: string;
  }): Promise<WriteResult> => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: profile.displayName, headline: profile.headline })
      .eq("id", user.id)
      .select("id");

    if (error !== null) {
      return { error };
    }

    if (data === null || data.length === 0) {
      return { error: { message: MESSAGES.profileMissing } };
    }

    return { error: null };
  };

  const result = await saveDraft(
    { content: payload.content, profile: payload.profile },
    {
      knownSkillSlugs,
      imagePrefix: imageUrlPrefix(config.url),
      writeContent,
      writeProfile,
      now: () => new Date().toISOString(),
    },
  );

  if (result.ok) {
    const revision =
      typeof payload.revision === "number" && Number.isFinite(payload.revision)
        ? payload.revision
        : 0;

    return { status: "saved", savedAt: result.savedAt, revision };
  }

  return { status: "error", errors: result.errors, message: result.message };
}
