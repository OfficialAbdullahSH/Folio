"use client";

import { cn } from "@/editor/lib/cn";

import { COLOR_ROLES } from "../contrast";
import { LOOKS } from "../looks";

export type LookGalleryProps = {
  activeId: string | null;
  onApply: (lookId: string) => void;
};

export function LookGallery({ activeId, onApply }: LookGalleryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LOOKS.map((look) => {
        const active = look.id === activeId;

        return (
          <button
            key={look.id}
            type="button"
            aria-pressed={active}
            onClick={() => onApply(look.id)}
            className={cn(
              "flex flex-col gap-2 rounded-md border p-3 text-start transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
              active
                ? "border-cta bg-canvas ring-2 ring-cta/25"
                : "border-rule bg-panel hover:bg-canvas",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-8 overflow-hidden rounded-sm border border-rule"
            >
              {COLOR_ROLES.map((role) => (
                <span
                  key={role}
                  className="flex-1"
                  style={{ backgroundColor: look.theme.colors[role] }}
                />
              ))}
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{look.name}</span>
              {active ? (
                <span className="text-xs font-medium text-ink">Applied</span>
              ) : null}
            </span>
            <span className="text-xs text-ink-soft">{look.description}</span>
          </button>
        );
      })}
    </div>
  );
}
