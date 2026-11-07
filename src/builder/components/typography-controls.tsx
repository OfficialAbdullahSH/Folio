"use client";

import { cn } from "@/editor/lib/cn";
import { LABEL } from "@/editor/lib/styles";
import { FONT_CSS_VARIABLES, type FontKey } from "@/render/font-vars";
import { FONT_KEYS } from "@/schema";

import { FONT_LABELS, FONT_ROLE_LABELS } from "../labels";

export type TypographyControlsProps = {
  headingFont: FontKey;
  bodyFont: FontKey;
  onChange: (role: "heading" | "body", font: FontKey) => void;
};

function FontChoice({
  role,
  value,
  onChange,
}: {
  role: "heading" | "body";
  value: FontKey;
  onChange: (role: "heading" | "body", font: FontKey) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={LABEL}>{FONT_ROLE_LABELS[role]}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FONT_KEYS.map((font) => {
          const selected = font === value;

          return (
            <label
              key={font}
              className={cn(
                "relative flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cta has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas",
                selected
                  ? "border-cta bg-canvas ring-2 ring-cta/25"
                  : "border-rule bg-panel hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name={`${role}-font`}
                value={font}
                checked={selected}
                onChange={() => onChange(role, font)}
                className="sr-only"
              />
              <span
                className="truncate text-base text-ink"
                style={{ fontFamily: FONT_CSS_VARIABLES[font] }}
              >
                {FONT_LABELS[font]}
              </span>
              <span
                aria-hidden="true"
                className="text-xs text-ink-soft"
                style={{ fontFamily: FONT_CSS_VARIABLES[font] }}
              >
                Aa
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TypographyControls({
  headingFont,
  bodyFont,
  onChange,
}: TypographyControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <FontChoice role="heading" value={headingFont} onChange={onChange} />
      <FontChoice role="body" value={bodyFont} onChange={onChange} />
    </div>
  );
}
