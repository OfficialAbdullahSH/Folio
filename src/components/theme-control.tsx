"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/editor/lib/cn";
import { THEME_CHOICES, type ThemeChoice } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/theme-provider";

const LABELS: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * Three buttons, one of them pressed (D-099). A pressed toggle group rather than a
 * select: the choice is three values, it applies immediately, and the pressed state
 * says which one is in force without opening anything.
 */
export function ThemeControl() {
  const { choice, setChoice } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-md border border-rule-strong bg-panel p-0.5"
    >
      {THEME_CHOICES.map((value) => {
        const Icon = ICONS[value];
        const current = choice === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={current}
            aria-label={`${LABELS[value]} theme`}
            onClick={() => setChoice(value)}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm px-2 text-sm text-ink-soft transition-colors motion-reduce:transition-none hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
              current && "bg-selected font-medium text-ink",
            )}
          >
            <Icon aria-hidden className="size-4" strokeWidth={1.75} />
            <span aria-hidden className="hidden sm:inline">
              {LABELS[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
