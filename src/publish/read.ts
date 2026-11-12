import type { ContentDocument, DesignDocument } from "@/schema";

import type { ValidationIssue } from "@/schema";
import { validateContent, validateDesign } from "@/schema";

export type OwnPublishedRow = {
  username: string;
  display_name: string;
  headline: string;
  design: unknown;
  content: unknown;
  published_at: string;
};

export type OwnPublishedReader = {
  from(table: "published_portfolios"): {
    select(columns: "username, display_name, headline, design, content, published_at"): {
      eq(
        column: "user_id",
        value: string,
      ): {
        maybeSingle(): PromiseLike<{
          data: OwnPublishedRow | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type OwnPublishedSnapshot = {
  username: string;
  displayName: string;
  headline: string;
  design: DesignDocument;
  content: ContentDocument;
  publishedAt: string;
};

export type OwnPublishedReadResult =
  | { status: "ok"; snapshot: OwnPublishedSnapshot }
  | { status: "missing" }
  | { status: "failed"; message: string }
  | { status: "invalid"; errors: ValidationIssue[] };

/**
 * Reads back what is live right now, for the dashboard (D-082, D-086).
 *
 * The row is validated on the way out so the dashboard never compares the draft
 * against something it cannot render; an unreadable snapshot is reported as invalid
 * and the dashboard offers nothing to reset to.
 */
export async function readOwnPublishedSnapshot(
  reader: OwnPublishedReader,
  userId: string,
): Promise<OwnPublishedReadResult> {
  const { data, error } = await reader
    .from("published_portfolios")
    .select("username, display_name, headline, design, content, published_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error !== null) {
    console.error("[folio] could not read the published snapshot", error.message);

    return { status: "failed", message: error.message };
  }

  if (data === null) {
    return { status: "missing" };
  }

  const design = validateDesign(data.design);

  if (!design.success) {
    return { status: "invalid", errors: design.errors };
  }

  const content = validateContent(data.content);

  if (!content.success) {
    return { status: "invalid", errors: content.errors };
  }

  return {
    status: "ok",
    snapshot: {
      username: data.username,
      displayName: data.display_name,
      headline: data.headline ?? "",
      design: design.data,
      content: content.data,
      publishedAt: data.published_at,
    },
  };
}
