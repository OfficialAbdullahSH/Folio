import { displayNameSchema, headlineSchema, validateContent } from "@/schema";
import type { ContentDocument } from "@/schema";

import { checkContentReferences } from "@/portfolio/references";

/**
 * Saving the editor (D-061).
 *
 * The whole document is validated before anything is written, so a save either
 * replaces the draft or changes nothing. The two writes are not one transaction —
 * `portfolios` and `profiles` are different tables — so a failure after the first
 * write is reported as exactly that, never as a clean success.
 */

export type FieldError = {
  /** The schema path, e.g. `projects.items.0.title`. The form turns it into an id. */
  path: string;
  message: string;
};

export type SaveInput = {
  content: unknown;
  profile: unknown;
};

export type SaveProfile = {
  displayName: string;
  headline: string;
};

export type WriteResult = {
  error: { message: string } | null;
};

export type SaveDeps = {
  /** Every slug in `public.skills`, so an unknown skill cannot be stored (D-033). */
  knownSkillSlugs: ReadonlySet<string>;
  /** The public URL prefix of this project's `project-images` bucket (D-066). */
  imagePrefix: string;
  writeContent: (content: ContentDocument) => Promise<WriteResult>;
  writeProfile: (profile: SaveProfile) => Promise<WriteResult>;
  now: () => string;
};

export type SaveResult =
  | { ok: true; savedAt: string }
  | { ok: false; errors: FieldError[]; message: string };

export const SAVE_MESSAGES = {
  invalid: "Nothing was saved. Please fix the highlighted fields.",
  contentFailed: "We could not save your content, so nothing changed. Please try again.",
  profileFailed:
    "Your portfolio content is saved, but your name and headline are not. Please save again.",
} as const;

function readProfile(input: unknown): { errors: FieldError[]; data: SaveProfile | null } {
  if (typeof input !== "object" || input === null) {
    return {
      errors: [{ path: "profile", message: "Your name and headline are missing." }],
      data: null,
    };
  }

  const record = input as Record<string, unknown>;
  const displayName = typeof record.displayName === "string" ? record.displayName.trim() : "";
  const headline = typeof record.headline === "string" ? record.headline.trim() : "";

  const errors: FieldError[] = [];

  const name = displayNameSchema.safeParse(displayName);
  if (!name.success) {
    errors.push({
      path: "profile.displayName",
      message: name.error.issues[0]?.message ?? "Display name is required",
    });
  }

  const tagline = headlineSchema.safeParse(headline);
  if (!tagline.success) {
    errors.push({
      path: "profile.headline",
      message: tagline.error.issues[0]?.message ?? "That headline is too long",
    });
  }

  return { errors, data: errors.length === 0 ? { displayName, headline } : null };
}

export async function saveDraft(
  input: SaveInput,
  deps: SaveDeps,
): Promise<SaveResult> {
  const content = validateContent(input.content);
  const profile = readProfile(input.profile);

  const errors: FieldError[] = [
    ...(content.success ? [] : content.errors),
    ...profile.errors,
  ];

  if (content.success) {
    errors.push(...checkContentReferences(content.data, deps));
  }

  if (!content.success || !profile.data || errors.length > 0) {
    return { ok: false, errors, message: SAVE_MESSAGES.invalid };
  }

  const contentWrite = await deps.writeContent(content.data);

  if (contentWrite.error !== null) {
    console.error("[folio] could not save the content", contentWrite.error.message);

    return { ok: false, errors: [], message: SAVE_MESSAGES.contentFailed };
  }

  const profileWrite = await deps.writeProfile(profile.data);

  if (profileWrite.error !== null) {
    console.error("[folio] could not save the profile", profileWrite.error.message);

    return { ok: false, errors: [], message: SAVE_MESSAGES.profileFailed };
  }

  return { ok: true, savedAt: deps.now() };
}
