"use client";

import type { RefObject } from "react";

import { cn } from "@/editor/lib/cn";

export type Device = "phone" | "tablet" | "full";

const DEVICES: { id: Device; label: string; width: string }[] = [
  { id: "phone", label: "Phone", width: "375px" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "full", label: "Full", width: "100%" },
];

export type PreviewPaneProps = {
  frameRef: RefObject<HTMLIFrameElement | null>;
  device: Device;
  ready: boolean;
  stalled: boolean;
  onDevice: (device: Device) => void;
  onLoad: () => void;
};

export function PreviewPane({
  frameRef,
  device,
  ready,
  stalled,
  onDevice,
  onLoad,
}: PreviewPaneProps) {
  const width = DEVICES.find((entry) => entry.id === device)?.width ?? "100%";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Live preview</h2>
        <div
          role="group"
          aria-label="Preview width"
          className="flex items-center gap-1 rounded-md border border-rule bg-panel p-1"
        >
          {DEVICES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={entry.id === device}
              onClick={() => onDevice(entry.id)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-sm px-3 text-sm transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none",
                entry.id === device
                  ? "bg-cta text-cta-ink"
                  : "text-ink-soft hover:bg-canvas hover:text-ink",
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-ink-soft">
        {stalled
          ? "The preview did not load. Reload the page to try again."
          : ready
            ? "Showing your saved content with the design on this page. Nothing is saved until you save."
            : "Loading your preview…"}
      </p>

      <div className="mx-auto flex w-full max-w-full flex-1 justify-center">
        <iframe
          ref={frameRef}
          src="/dashboard/preview/frame"
          title="Live preview of your portfolio"
          onLoad={onLoad}
          className="h-[70dvh] w-full rounded-lg border border-rule bg-panel lg:h-[calc(100dvh-11rem)]"
          style={{ width, maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
