"use client";

import { cn } from "@/editor/lib/cn";
import { LABEL } from "@/editor/lib/styles";
import { RADIUS_SCALE } from "@/render/theme";
import { RADIUS_VALUES } from "@/schema";
import type { DesignTheme } from "@/schema";

type Radius = DesignTheme["radius"];

import { RADIUS_LABELS } from "../labels";

export type RadiusControlProps = {
  value: Radius;
  onSelect: (radius: Radius) => void;
};

export function RadiusControl({ value, onSelect }: RadiusControlProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={LABEL}>Corner roundness</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RADIUS_VALUES.map((radius) => {
          const selected = radius === value;

          return (
            <label
              key={radius}
              className={cn(
                "relative flex min-h-11 cursor-pointer flex-col items-center gap-2 rounded-md border px-2 py-3 transition-colors motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cta has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas",
                selected
                  ? "border-cta bg-canvas ring-2 ring-cta/25"
                  : "border-rule bg-panel hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="radius"
                value={radius}
                checked={selected}
                onChange={() => onSelect(radius)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="block h-8 w-8 border-2 border-cta bg-panel"
                style={{ borderRadius: RADIUS_SCALE[radius] }}
              />
              <span className="text-xs font-medium text-ink">{RADIUS_LABELS[radius]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
