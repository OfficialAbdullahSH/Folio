"use client";

import { useActionState, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { cn } from "@/editor/lib/cn";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/editor/lib/styles";
import { EditorSection } from "@/editor/components/section-card";
import { sectionHasContent } from "@/render/sections";
import type { ContentDocument, DesignDocument } from "@/schema";

import { saveDesignAction, type DesignSaveState } from "../actions";
import { checkReadability } from "../contrast";
import { lookIdFor } from "../looks";
import { createDesignMessage } from "../messages";
import { designReducer, type DesignAction } from "../reducer";
import { ColorControls } from "./color-controls";
import { ConfirmDialog } from "./confirm-dialog";
import { LookGallery } from "./look-gallery";
import { PreviewPane, type Device } from "./preview-pane";
import { RadiusControl } from "./radius-control";
import { ReadabilityPanel } from "./readability-panel";
import { SectionList } from "./section-list";
import { TypographyControls } from "./typography-controls";
import { WorldCards } from "./world-cards";

const IDLE: DesignSaveState = { status: "idle" };
const PREVIEW_TIMEOUT_MS = 10_000;

export type BuilderShellProps = {
  design: DesignDocument;
  content: ContentDocument;
  fontClassName: string;
};

export function BuilderShell({ design, content, fontClassName }: BuilderShellProps) {
  const [state, dispatch] = useReducer(designReducer, design);
  const [saveState, formAction, isPending] = useActionState(saveDesignAction, IDLE);
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState<"design" | "preview">("design");
  const [device, setDevice] = useState<Device>("full");
  const [frameReady, setFrameReady] = useState(false);
  const [frameStalled, setFrameStalled] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const savedRevision = saveState.status === "saved" ? saveState.revision : 0;
  const dirty = revision > savedRevision;
  const activeLook = lookIdFor(state.theme);
  const readability = checkReadability(state.theme);
  const emptySections = state.sections.filter(
    (section) => !sectionHasContent(section, content),
  ).length;

  useEffect(() => {
    if (saveState.status === "error") {
      summaryRef.current?.focus();
    }
  }, [saveState]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const frame = frameRef.current?.contentWindow;

    if (frame === null || frame === undefined) {
      return;
    }

    frame.postMessage(createDesignMessage(state), window.location.origin);
  }, [state, frameReady]);

  useEffect(() => {
    if (frameReady) {
      return;
    }

    const timer = window.setTimeout(() => setFrameStalled(true), PREVIEW_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [frameReady]);

  function change(action: DesignAction) {
    if (designReducer(state, action) === state) {
      return;
    }

    dispatch(action);
    setRevision((count) => count + 1);
  }

  function handleFrameLoad() {
    setFrameReady(true);
    setFrameStalled(false);
  }

  return (
    <div className={cn(fontClassName, "flex min-h-dvh flex-col bg-canvas lg:h-dvh lg:overflow-hidden")}>
      <header className="sticky top-0 z-20 border-b border-rule bg-panel lg:static">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-ink">Design your portfolio</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/preview" className={BUTTON_SECONDARY}>
              Preview page
            </Link>
            <button type="submit" form="design-form" className={BUTTON_PRIMARY} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-t border-rule px-4 py-2 sm:px-6 lg:hidden">
          {(
            [
              { id: "design", label: "Design" },
              { id: "preview", label: "Preview" },
            ] as const
          ).map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={tab === entry.id}
              onClick={() => setTab(entry.id)}
              className={cn(
                "inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
                tab === entry.id
                  ? "bg-cta text-cta-ink"
                  : "border border-rule-strong bg-panel text-ink hover:bg-canvas",
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <div
          className={cn(
            "min-w-0 px-4 py-6 sm:px-6 lg:overflow-y-auto lg:border-e lg:border-rule",
            tab === "preview" && "hidden lg:block",
          )}
        >
          <form id="design-form" action={formAction} className="flex flex-col gap-5" noValidate>
            <input
              type="hidden"
              name="payload"
              value={JSON.stringify({ design: state, revision })}
            />

            <p role="status" aria-live="polite" className="text-sm text-ink-soft">
              {isPending
                ? "Saving your design…"
                : saveState.status === "saved" ? (
                    <>
                      Saved{" "}
                      <time dateTime={saveState.savedAt} suppressHydrationWarning>
                        {new Date(saveState.savedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </>
                  ) : dirty ? (
                    "You have unsaved changes."
                  ) : (
                    "All changes saved."
                  )}
            </p>

            {saveState.status === "error" ? (
              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                className="rounded-lg border border-danger/40 bg-danger-surface p-4 text-sm text-danger focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <p className="font-semibold">Your design was not saved.</p>
                <p className="mt-1">{saveState.message}</p>
                {saveState.errors.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 ps-5">
                    {saveState.errors.map((error) => (
                      <li key={`${error.path}-${error.message}`}>
                        {error.path}: {error.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <EditorSection
              id="looks"
              title="Looks"
              description="A look sets the colors, fonts and corners together. Adjust anything after you pick one."
            >
              <LookGallery
                activeId={activeLook}
                onApply={(lookId) => change({ type: "applyLook", lookId })}
              />
            </EditorSection>

            <EditorSection
              id="world"
              title="World"
              description="How the page is built. Both worlds show the same sections and layouts."
            >
              <WorldCards
                value={state.world}
                onSelect={(world) => change({ type: "setWorld", world })}
              />
            </EditorSection>

            <EditorSection
              id="colors"
              title="Colors"
              description="Six roles, each with one job. Every color on the page comes from one of them."
            >
              <ColorControls
                colors={state.theme.colors}
                onChange={(role, value) => change({ type: "setColor", role, value })}
              />
            </EditorSection>

            <EditorSection
              id="readability"
              title="Readability"
              description="Warnings about pairs that are hard to read. They never stop you saving."
            >
              <ReadabilityPanel checks={readability} colors={state.theme.colors} />
            </EditorSection>

            <EditorSection
              id="type"
              title="Type"
              description="Two font choices: one for headings, one for everything else."
            >
              <TypographyControls
                headingFont={state.theme.headingFont}
                bodyFont={state.theme.bodyFont}
                onChange={(role, font) => change({ type: "setFont", role, font })}
              />
            </EditorSection>

            <EditorSection
              id="corners"
              title="Corners"
              description="How round the corners are, from sharp to soft."
            >
              <RadiusControl
                value={state.theme.radius}
                onSelect={(radius) => change({ type: "setRadius", radius })}
              />
            </EditorSection>

            <EditorSection
              id="sections"
              title="Sections"
              description={
                emptySections > 0
                  ? "Order, layout and visibility. A section with nothing in it stays off the page."
                  : "Order, layout and visibility."
              }
            >
              <SectionList sections={state.sections} content={content} onChange={change} />
            </EditorSection>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className={BUTTON_SECONDARY}
              >
                Reset to default
              </button>
              <button type="submit" className={BUTTON_PRIMARY} disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>

        <div
          className={cn(
            "min-w-0 flex-1 border-t border-rule p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:border-t-0",
            tab === "design" && "hidden lg:block",
          )}
        >
          <PreviewPane
            frameRef={frameRef}
            device={device}
            ready={frameReady}
            stalled={frameStalled}
            onDevice={setDevice}
            onLoad={handleFrameLoad}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmingReset}
        title="Reset to the default design?"
        description="This replaces every color, font, corner, world and section setting on this page with the default. Nothing is written until you save."
        confirmLabel="Reset design"
        onConfirm={() => {
          change({ type: "reset" });
          setConfirmingReset(false);
        }}
        onCancel={() => setConfirmingReset(false)}
      />
    </div>
  );
}
