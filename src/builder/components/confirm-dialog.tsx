"use client";

import { useEffect, useRef } from "react";

import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/editor/lib/styles";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A native modal dialog: focus is trapped and Escape closes it without extra code,
 * and nothing happens until the owner picks a button.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClose={onCancel}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-rule bg-panel p-5 text-ink backdrop:bg-ink/40"
    >
      <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <p id="confirm-dialog-description" className="mt-2 text-sm text-ink-soft">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button ref={cancelRef} type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={BUTTON_PRIMARY}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
