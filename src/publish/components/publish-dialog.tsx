"use client";

import { useEffect, useId, useRef } from "react";

import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/editor/lib/styles";
import { cn } from "@/editor/lib/cn";

import type { PublishNotes } from "../notes";

const CONFIRM_DANGER =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-danger/40 bg-danger-surface px-4 text-sm font-medium text-danger transition-colors motion-reduce:transition-none hover:bg-danger-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50";

export type PublishDialogProps = {
  open: boolean;
  title: string;
  description: string;
  notes?: PublishNotes;
  confirmLabel: string;
  pendingLabel: string;
  danger?: boolean;
  pending: boolean;
  formAction: (payload: FormData) => void;
  onCancel: () => void;
};

/**
 * The confirmation before anything changes what the public sees (D-086).
 *
 * A native modal: focus is trapped, Escape closes it, and the form only submits when
 * the owner presses the confirm button. The notes are advisory — publishing is never
 * blocked by them (D-009).
 */
export function PublishDialog({
  open,
  title,
  description,
  notes,
  confirmLabel,
  pendingLabel,
  danger = false,
  pending,
  formAction,
  onCancel,
}: PublishDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const warningCount = notes?.warnings.length ?? 0;
  const emptyCount = notes?.emptySections.length ?? 0;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onCancel}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-lg border border-rule bg-panel p-5 text-ink backdrop:bg-ink/40"
    >
      <h2 id={titleId} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <p id={descriptionId} className="mt-2 text-sm text-ink-soft">
        {description}
      </p>

      {notes !== undefined ? (
        <div className="mt-4 flex flex-col gap-3">
          {warningCount > 0 ? (
            <div className="rounded-md border border-warn/40 bg-warn-surface p-3">
              <p className="text-sm font-medium text-warn">
                {warningCount} readability {warningCount === 1 ? "warning" : "warnings"}
              </p>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-warn">
                {notes.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              No readability warnings: every pair of colors on your page is legible.
            </p>
          )}

          {emptyCount > 0 ? (
            <div className="rounded-md border border-rule bg-canvas p-3">
              <p className="text-sm font-medium text-ink">
                {emptyCount === 1 ? "One section has" : `${emptyCount} sections have`} no content
                yet
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {notes.emptySections.join(", ")} will not appear on the page until you fill
                {emptyCount === 1 ? " it" : " them"} in. Everything else publishes as saved.
              </p>
            </div>
          ) : null}

          <p className="text-sm text-ink-soft">
            You can publish with these as they are. You can also unpublish at any time.
          </p>
        </div>
      ) : null}

      <form action={formAction} className="mt-5 flex flex-wrap justify-end gap-2">
        <button ref={cancelRef} type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cn(danger ? CONFIRM_DANGER : BUTTON_PRIMARY)}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </form>
    </dialog>
  );
}
