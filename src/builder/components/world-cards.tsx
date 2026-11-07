"use client";

import { cn } from "@/editor/lib/cn";
import { LABEL } from "@/editor/lib/styles";
import { WORLDS } from "@/schema";
import type { DesignDocument } from "@/schema";

import { WORLD_DESCRIPTIONS, WORLD_LABELS } from "../labels";

export type WorldCardsProps = {
  value: DesignDocument["world"];
  onSelect: (world: DesignDocument["world"]) => void;
};

export function WorldCards({ value, onSelect }: WorldCardsProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={LABEL}>World</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WORLDS.map((world) => {
          const selected = world === value;

          return (
            <label
              key={world}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cta has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas",
                selected
                  ? "border-cta bg-canvas ring-2 ring-cta/25"
                  : "border-rule bg-panel hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="world"
                value={world}
                checked={selected}
                onChange={() => onSelect(world)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{WORLD_LABELS[world]}</span>
                {selected ? (
                  <span className="text-xs font-medium text-ink">Selected</span>
                ) : null}
              </span>
              <span className="text-xs text-ink-soft">{WORLD_DESCRIPTIONS[world]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
