import { validateContent, validateDesign, validateProfile } from "@/schema";
import type { ContentDocument, DesignDocument } from "@/schema";

/**
 * The publish snapshot (D-080, D-081).
 *
 * Pure: no Supabase, no Next. The snapshot is the exact bytes that become public,
 * so it is validated with the same F-02 validators the renderer trusts.
 */

export type PublishSnapshot = {
  username: string;
  displayName: string;
  headline: string;
  design: DesignDocument;
  content: ContentDocument;
};

export type SnapshotError = {
  /** Prefixed schema path, e.g. `design.theme.colors.text`. */
  path: string;
  message: string;
};

export type SnapshotInput = {
  design: unknown;
  content: unknown;
  profile: unknown;
};

export type SnapshotResult =
  | { ok: true; snapshot: PublishSnapshot }
  | { ok: false; errors: SnapshotError[] };

const prefix = (scope: string, path: string): string =>
  path === "(root)" ? scope : `${scope}.${path}`;

export function buildSnapshot(input: SnapshotInput): SnapshotResult {
  const design = validateDesign(input.design);
  const content = validateContent(input.content);
  const profile = validateProfile(input.profile);

  const errors: SnapshotError[] = [
    ...(design.success
      ? []
      : design.errors.map((error) => ({
          path: prefix("design", error.path),
          message: error.message,
        }))),
    ...(content.success
      ? []
      : content.errors.map((error) => ({
          path: prefix("content", error.path),
          message: error.message,
        }))),
    ...(profile.success
      ? []
      : profile.errors.map((error) => ({
          path: prefix("profile", error.path),
          message: error.message,
        }))),
  ];

  if (!design.success || !content.success || !profile.success) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    snapshot: {
      username: profile.data.username,
      displayName: profile.data.displayName,
      headline: profile.data.headline,
      design: design.data,
      content: content.data,
    },
  };
}

/**
 * A stable string for any JSON value: object keys are sorted at every level,
 * arrays keep their order. Two documents with the same data therefore compare
 * equal even when the database returned their keys in a different order (D-081).
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};

    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortKeys(record[key]);
    }

    return sorted;
  }

  return value;
}

export type PublishDocuments = {
  design: unknown;
  content: unknown;
  displayName: string;
  headline: string;
};

export type PublishState = "not-published" | "current" | "changes";

export type PublishStateInput = {
  draft: PublishDocuments;
  published: PublishDocuments | null;
};

function fingerprint(documents: PublishDocuments): string {
  return canonicalize({
    design: documents.design,
    content: documents.content,
    displayName: documents.displayName,
    headline: documents.headline,
  });
}

/**
 * What the dashboard says about the public page (D-081): nothing is published,
 * the published snapshot matches the saved draft, or the draft has moved on.
 */
export function publishState({ draft, published }: PublishStateInput): PublishState {
  if (published === null) {
    return "not-published";
  }

  return fingerprint(draft) === fingerprint(published) ? "current" : "changes";
}
