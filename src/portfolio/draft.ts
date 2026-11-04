import type { ContentDocument, DesignDocument } from "@/schema";

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
