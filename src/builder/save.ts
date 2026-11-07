import { validateDesign } from "@/schema";
import type { DesignDocument, ValidationIssue } from "@/schema";

export type WriteResult = { error: { message: string } | null };

export type DesignSaveDeps = {
  writeDesign: (design: DesignDocument) => Promise<WriteResult>;
  now: () => string;
};

export type DesignSaveResult =
  | { ok: true; savedAt: string }
  | { ok: false; errors: ValidationIssue[]; message: string };

export const SAVE_MESSAGES = {
  invalid: "The design was not saved because something in it is not valid.",
  writeFailed: "Your design was not saved. Try again in a moment.",
} as const;

/**
 * Validates the whole design document before writing anything (D-072).
 *
 * The document arrives from the browser, so it is checked against the same schema the
 * renderer reads; a design that fails is never written.
 */
export async function saveDesign(
  input: unknown,
  deps: DesignSaveDeps,
): Promise<DesignSaveResult> {
  const parsed = validateDesign(input);

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors, message: SAVE_MESSAGES.invalid };
  }

  const { error } = await deps.writeDesign(parsed.data);

  if (error !== null) {
    return { ok: false, errors: [], message: SAVE_MESSAGES.writeFailed };
  }

  return { ok: true, savedAt: deps.now() };
}
