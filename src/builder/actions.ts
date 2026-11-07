"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { readSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultDesign } from "@/portfolio/defaults";
import type { DesignDocument } from "@/schema";

import { saveDesign, type WriteResult } from "./save";
import type { ValidationIssue } from "@/schema";

export type DesignSaveState =
  | { status: "idle" }
  | { status: "saved"; savedAt: string; revision: number }
  | { status: "error"; errors: ValidationIssue[]; message: string };

const MESSAGES = {
  signedOut: "Your session ended. Log in again, then save.",
  unreadable: "We could not read the form. Reload the page and try again.",
  notConfigured: "This deployment has no database configured, so nothing can be saved.",
  rowMissing: "Your portfolio row is missing, so there is nowhere to save. Reload the dashboard.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validates and writes the design document (D-072).
 *
 * The user id comes from the session, never from the payload, and RLS limits the
 * write to the signed-in owner's own row. Content is not touched here.
 */
export async function saveDesignAction(
  _previous: DesignSaveState,
  formData: FormData,
): Promise<DesignSaveState> {
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

  const writeDesign = async (design: DesignDocument): Promise<WriteResult> => {
    const { data, error } = await supabase
      .from("portfolios")
      .update({ design })
      .eq("user_id", user.id)
      .select("user_id");

    if (error !== null) {
      return { error };
    }

    if (data === null || data.length === 0) {
      return { error: { message: MESSAGES.rowMissing } };
    }

    return { error: null };
  };

  const result = await saveDesign(payload.design, {
    writeDesign,
    now: () => new Date().toISOString(),
  });

  if (result.ok) {
    const revision =
      typeof payload.revision === "number" && Number.isFinite(payload.revision)
        ? payload.revision
        : 0;

    return { status: "saved", savedAt: result.savedAt, revision };
  }

  return { status: "error", errors: result.errors, message: result.message };
}

/**
 * Restores the default design after the owner asks for it (D-078).
 *
 * Only ever called from an explicit button: a saved design that fails validation is
 * never replaced silently.
 */
export async function resetDesignAction(): Promise<void> {
  const user = await getCurrentUser();

  if (user === null) {
    redirect("/login");
  }

  if (readSupabaseConfig() === null) {
    redirect("/dashboard/design");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("portfolios")
    .update({ design: defaultDesign() })
    .eq("user_id", user.id);

  if (error !== null) {
    console.error("[folio] could not reset the design", error.message);
  }

  redirect("/dashboard/design");
}
