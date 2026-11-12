import { checkContentReferences } from "@/portfolio/references";
import { validateContent, validateDesign } from "@/schema";
import type { ContentDocument, DesignDocument } from "@/schema";

import { buildSnapshot } from "./snapshot";
import type { PublishSnapshot, SnapshotError, SnapshotInput } from "./snapshot";

/**
 * Publishing, unpublishing and resetting (D-080 to D-083).
 *
 * Pure: the writes are injected, so the rules can be tested without a database.
 * Publishing is the only path that creates a public row, and it only ever writes
 * what it has just validated.
 */

export type WriteOutcome = {
  error: { message: string } | null;
};

export type PublishDeps = {
  /** Every slug in `public.skills` (D-033). */
  knownSkillSlugs: ReadonlySet<string>;
  /** The public URL prefix of this project's `project-images` bucket (D-066). */
  imagePrefix: string;
  writeSnapshot: (snapshot: PublishSnapshot) => Promise<WriteOutcome>;
};

export type PublishResult =
  | { ok: true; username: string }
  | { ok: false; errors: SnapshotError[]; message: string };

export type ActionOutcome = { ok: true } | { ok: false; message: string };

export const PUBLISH_MESSAGES = {
  invalid:
    "Nothing was published. Your saved portfolio has a problem that has to be fixed first.",
  failed: "We could not publish your portfolio, so nothing changed. Please try again.",
  notPublished: "Nothing is published yet, so there is nothing to go back to.",
  unpublishFailed: "We could not unpublish your portfolio. Please try again.",
  resetFailed: "We could not reset your draft, so nothing changed. Please try again.",
} as const;

export type PublishedDocuments = {
  design: unknown;
  content: unknown;
};

export async function publishSnapshot(
  input: SnapshotInput,
  deps: PublishDeps,
): Promise<PublishResult> {
  const built = buildSnapshot(input);

  if (!built.ok) {
    return { ok: false, errors: built.errors, message: PUBLISH_MESSAGES.invalid };
  }

  const references = checkContentReferences(built.snapshot.content, deps).map((error) => ({
    path: `content.${error.path}`,
    message: error.message,
  }));

  if (references.length > 0) {
    return { ok: false, errors: references, message: PUBLISH_MESSAGES.invalid };
  }

  const write = await deps.writeSnapshot(built.snapshot);

  if (write.error !== null) {
    console.error("[folio] could not publish the portfolio", write.error.message);

    return { ok: false, errors: [], message: PUBLISH_MESSAGES.failed };
  }

  return { ok: true, username: built.snapshot.username };
}

export async function unpublishPortfolio(deps: {
  removePublished: () => Promise<WriteOutcome>;
}): Promise<ActionOutcome> {
  const write = await deps.removePublished();

  if (write.error !== null) {
    console.error("[folio] could not unpublish the portfolio", write.error.message);

    return { ok: false, message: PUBLISH_MESSAGES.unpublishFailed };
  }

  return { ok: true };
}

export async function resetToPublished(
  published: PublishedDocuments | null,
  deps: { writeDraft: (documents: { design: DesignDocument; content: ContentDocument }) => Promise<WriteOutcome> },
): Promise<ActionOutcome> {
  if (published === null) {
    return { ok: false, message: PUBLISH_MESSAGES.notPublished };
  }

  const design = validateDesign(published.design);
  const content = validateContent(published.content);

  if (!design.success || !content.success) {
    return { ok: false, message: PUBLISH_MESSAGES.invalid };
  }

  const write = await deps.writeDraft({ design: design.data, content: content.data });

  if (write.error !== null) {
    console.error("[folio] could not reset the draft", write.error.message);

    return { ok: false, message: PUBLISH_MESSAGES.resetFailed };
  }

  return { ok: true };
}
