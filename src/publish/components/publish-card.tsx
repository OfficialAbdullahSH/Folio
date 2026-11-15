"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD } from "@/editor/lib/styles";
import { cn } from "@/editor/lib/cn";

import {
  publishAction,
  resetToPublishedAction,
  unpublishAction,
  type PublishFormState,
} from "../actions";
import type { PublishNotes } from "../notes";
import type { PublishState } from "../snapshot";
import { PublishDialog } from "./publish-dialog";

const IDLE: PublishFormState = { status: "idle" };

type Dialog = "publish" | "unpublish" | "reset" | null;

export type PublishCardProps = {
  state: PublishState;
  /** The live page's path, e.g. `/u/amelia-hart`. */
  publicPath: string;
  /** The publish date already formatted on the server, or null when nothing is live. */
  publishedOn: string | null;
  notes: PublishNotes;
};

/**
 * The publishing panel (D-080 to D-083, D-086).
 *
 * One card, three states: nothing published, the draft is what is live, or there are
 * changes waiting. Every action asks first, because each one changes what visitors see.
 */
export function PublishCard({ state, publicPath, publishedOn, notes }: PublishCardProps) {
  const [publishResult, publishFormAction, publishing] = useActionState(publishAction, IDLE);
  const [unpublishResult, unpublishFormAction, unpublishing] = useActionState(
    unpublishAction,
    IDLE,
  );
  const [resetResult, resetFormAction, resetting] = useActionState(
    resetToPublishedAction,
    IDLE,
  );

  const [dialog, setDialog] = useState<Dialog>(null);
  const [copied, setCopied] = useState<"copied" | "failed" | null>(null);
  const [outcome, setOutcome] = useState<PublishFormState>(IDLE);

  const results = [publishResult, unpublishResult, resetResult];
  const settled = results.find((result) => result.status !== "idle");
  const [seen, setSeen] = useState<PublishFormState | undefined>(undefined);

  // The dialog closes as soon as the action reports back, whichever way it went. The
  // outcome is then announced in the card, so closing the modal never hides it.
  if (settled !== undefined && settled !== seen) {
    setSeen(settled);
    setOutcome(settled);

    if (dialog !== null) {
      setDialog(null);
    }
  }

  const failure = outcome.status === "error" ? outcome : null;
  const done = outcome.status !== "idle" && outcome.status !== "error" ? outcome : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <section
      id="publish"
      aria-labelledby="publish-heading"
      className={cn(CARD, "flex flex-col gap-4")}
    >
      <div className="flex flex-col gap-1">
        <h2 id="publish-heading" className="text-lg font-medium text-ink">
          Publishing
        </h2>

        {state === "not-published" ? (
          <>
            <p className="text-sm font-medium text-ink">Your page is private.</p>
            <p className="text-sm text-ink-soft">
              Nothing is public yet. Publishing copies your saved portfolio to{" "}
              <span className="font-medium text-ink">{publicPath}</span>, where anyone with the link
              can read it. Your draft stays private.
            </p>
          </>
        ) : null}

        {state === "current" ? (
          <>
            <p className="text-sm font-medium text-ink">Your page is live.</p>
            <p className="text-sm text-ink-soft">
              {publishedOn === null
                ? "Visitors see the version you published."
                : `Published on ${publishedOn}. Visitors see this version.`}
            </p>
          </>
        ) : null}

        {state === "changes" ? (
          <>
            <p className="text-sm font-medium text-ink">You have unpublished changes.</p>
            <p className="text-sm text-ink-soft">
              Your page is still live with the last version you published. Publish again to update it,
              or reset your draft to match the live page.
            </p>
          </>
        ) : null}
      </div>

      <p className="text-sm text-ink-soft">
        Live at <span className="font-medium text-ink">{publicPath}</span>
        {state === "not-published" ? " once you publish" : ""}.
      </p>

      <div className="flex flex-wrap gap-2">
        {state === "not-published" ? (
          <button type="button" onClick={() => setDialog("publish")} className={BUTTON_PRIMARY}>
            Publish
          </button>
        ) : null}

        {state === "changes" ? (
          <>
            <button type="button" onClick={() => setDialog("publish")} className={BUTTON_PRIMARY}>
              Publish changes
            </button>
            <button
              type="button"
              onClick={() => setDialog("reset")}
              className={BUTTON_SECONDARY}
            >
              Reset to the published version
            </button>
          </>
        ) : null}

        {state !== "not-published" ? (
          <>
            <Link href={publicPath} className={BUTTON_SECONDARY}>
              View your page
            </Link>
            <button type="button" onClick={copyLink} className={BUTTON_SECONDARY}>
              Copy link
            </button>
            <button
              type="button"
              onClick={() => setDialog("unpublish")}
              className={BUTTON_SECONDARY}
            >
              Unpublish
            </button>
          </>
        ) : null}
      </div>

      <div aria-live="polite">
        {copied === "copied" ? (
          <p role="status" className="text-sm text-ink">
            Link copied.
          </p>
        ) : null}
        {copied === "failed" ? (
          <p role="status" className="text-sm text-ink-soft">
            Could not copy the link. Open your page and copy the address from the browser.
          </p>
        ) : null}
        {done !== null ? (
          <p role="status" className="text-sm font-medium text-ink">
            {messageFor(done.status)}
          </p>
        ) : null}
      </div>

      {failure !== null ? (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger-surface p-3 text-sm text-danger"
        >
          <p className="font-medium">{failure.message}</p>
          {failure.errors.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {failure.errors.map((error) => (
                <li key={error.path}>
                  <span className="font-mono text-xs">{error.path}</span> {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <PublishDialog
        open={dialog === "publish"}
        title={state === "not-published" ? "Publish your portfolio?" : "Publish these changes?"}
        description={
          state === "not-published"
            ? `This copies your saved portfolio to ${publicPath}. Anyone with the link will be able to read it.`
            : `This replaces the page at ${publicPath} with your current draft. Visitors will see the change straight away.`
        }
        notes={notes}
        confirmLabel="Publish"
        pendingLabel="Publishing…"
        pending={publishing}
        formAction={publishFormAction}
        onCancel={() => setDialog(null)}
      />

      <PublishDialog
        open={dialog === "unpublish"}
        title="Unpublish your portfolio?"
        description={`${publicPath} will stop working and show the not-found page. Your draft is kept, and you can publish again at any time.`}
        confirmLabel="Unpublish"
        pendingLabel="Unpublishing…"
        danger
        pending={unpublishing}
        formAction={unpublishFormAction}
        onCancel={() => setDialog(null)}
      />

      <PublishDialog
        open={dialog === "reset"}
        title="Reset your draft to the published version?"
        description={`This replaces your saved draft with the version that is live at ${publicPath}. Your unpublished changes are lost.`}
        confirmLabel="Reset draft"
        pendingLabel="Resetting…"
        danger
        pending={resetting}
        formAction={resetFormAction}
        onCancel={() => setDialog(null)}
      />
    </section>
  );
}

function messageFor(status: PublishFormState["status"]): string {
  switch (status) {
    case "published":
      return "Published. Your page is live.";
    case "unpublished":
      return "Unpublished. Your page is no longer public.";
    case "reset":
      return "Your draft now matches the published page.";
    default:
      return "";
  }
}
