import { validateContent, validateDesign } from "@/schema";
import type { ContentDocument, DesignDocument, ValidationIssue } from "@/schema";

import { defaultDesign, emptyContent } from "./defaults";

export type DraftRow = {
  user_id: string;
  design: DesignDocument;
  content: ContentDocument;
};

/**
 * The slice of the Supabase client this module needs. Narrow on purpose: the
 * tests can then assert the exact upsert, including `ignoreDuplicates`.
 */
export type DraftStore = {
  from(table: "portfolios"): {
    upsert(
      row: DraftRow,
      options: { onConflict: "user_id"; ignoreDuplicates: true },
    ): PromiseLike<{ error: { message: string } | null }>;
  };
};

export type DraftResult = { ok: true } | { ok: false; message: string };

export function newDraftRow(userId: string): DraftRow {
  return {
    user_id: userId,
    design: defaultDesign(),
    content: emptyContent(),
  };
}

/**
 * Creates the owner's draft the first time they reach the dashboard (D-054).
 *
 * `ignoreDuplicates` turns the upsert into `ON CONFLICT DO NOTHING`, so two
 * simultaneous first loads, or a reload, leave exactly one row (AC-7).
 */
export async function ensureDraftPortfolio(
  store: DraftStore,
  userId: string,
): Promise<DraftResult> {
  const { error } = await store.from("portfolios").upsert(newDraftRow(userId), {
    onConflict: "user_id",
    ignoreDuplicates: true,
  });

  if (error !== null) {
    console.error("[folio] could not create the draft portfolio", error.message);

    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export type DraftReader = {
  from(table: "portfolios"): {
    select(columns: "design, content"): {
      eq(
        column: "user_id",
        value: string,
      ): {
        maybeSingle(): PromiseLike<{
          data: { design: unknown; content: unknown } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type DraftReadResult =
  | { status: "ok"; design: DesignDocument; content: ContentDocument }
  | { status: "missing" }
  | { status: "failed"; message: string }
  | { status: "invalid"; scope: "design" | "content"; errors: ValidationIssue[] };

/**
 * Reads the owner's draft back for the editor and the preview (D-057).
 *
 * The row is validated on the way out for the same reason the public page validates
 * it: the editor must never load a document it cannot save again.
 */
export async function readDraftPortfolio(
  reader: DraftReader,
  userId: string,
): Promise<DraftReadResult> {
  const { data, error } = await reader
    .from("portfolios")
    .select("design, content")
    .eq("user_id", userId)
    .maybeSingle();

  if (error !== null) {
    console.error("[folio] could not read the draft portfolio", error.message);

    return { status: "failed", message: error.message };
  }

  if (data === null) {
    return { status: "missing" };
  }

  const design = validateDesign(data.design);

  if (!design.success) {
    return { status: "invalid", scope: "design", errors: design.errors };
  }

  const content = validateContent(data.content);

  if (!content.success) {
    return { status: "invalid", scope: "content", errors: content.errors };
  }

  return { status: "ok", design: design.data, content: content.data };
}
