"use client";

import Link from "next/link";

import { cn } from "@/editor/lib/cn";
import { HINT, ICON_BUTTON, INPUT } from "@/editor/lib/styles";
import { sectionHasContent } from "@/render/sections";
import { SECTION_DISPLAY_STYLES } from "@/schema";
import type { ContentDocument, DesignSection } from "@/schema";

import { SECTION_NAMES, STYLE_LABELS } from "../labels";
import { allowedStyles, type DesignAction } from "../reducer";

export type SectionListProps = {
  sections: readonly DesignSection[];
  content: ContentDocument;
  onChange: (action: DesignAction) => void;
};

export function SectionList({ sections, content, onChange }: SectionListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {sections.map((section, index) => {
        const name = SECTION_NAMES[section.id];
        const styles = allowedStyles(section.id);
        const hasContent = sectionHasContent(section, content);
        const style =
          "displayStyle" in section
            ? section.displayStyle
            : SECTION_DISPLAY_STYLES.hero[0];

        return (
          <li
            key={section.id}
            className="flex flex-col gap-3 rounded-md border border-rule bg-canvas p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-ink">{name}</span>
                {hasContent ? null : (
                  <span className="text-xs text-ink-soft">
                    Nothing here yet.{" "}
                    <Link
                      href="/dashboard/edit"
                      className="font-medium text-ink underline underline-offset-2"
                    >
                      Add content
                    </Link>
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Move ${name} up`}
                  disabled={index === 0}
                  onClick={() => onChange({ type: "moveSection", id: section.id, direction: "up" })}
                  className={ICON_BUTTON}
                >
                  <span aria-hidden="true">↑</span>
                </button>
                <button
                  type="button"
                  aria-label={`Move ${name} down`}
                  disabled={index === sections.length - 1}
                  onClick={() => onChange({ type: "moveSection", id: section.id, direction: "down" })}
                  className={ICON_BUTTON}
                >
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              {styles.length > 0 ? (
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={`section-style-${section.id}`} className={HINT}>
                    Layout
                  </label>
                  <select
                    id={`section-style-${section.id}`}
                    value={style}
                    onChange={(event) =>
                      onChange({
                        type: "setDisplayStyle",
                        id: section.id,
                        style: event.target.value,
                      })
                    }
                    className={cn(INPUT, "min-h-11 w-auto py-1")}
                  >
                    {styles.map((value) => (
                      <option key={value} value={value}>
                        {STYLE_LABELS[value] ?? value}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-xs text-ink-soft">No layout choice for this section.</span>
              )}

              {section.id === "hero" ? (
                <span className="text-xs text-ink-soft">The intro always shows.</span>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={section.visible}
                  aria-label={`Show the ${name} section`}
                  onClick={() => onChange({ type: "toggleVisibility", id: section.id })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm text-ink focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors motion-reduce:transition-none",
                      section.visible
                        ? "justify-end border-cta bg-cta"
                        : "justify-start border-rule-strong bg-panel",
                    )}
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full",
                        section.visible ? "bg-cta-ink" : "bg-rule-strong",
                      )}
                    />
                  </span>
                  {section.visible ? "Shown" : "Hidden"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
