"use client";

import type { DesignTheme } from "@/schema";

import type { ReadabilityCheck } from "../contrast";
import { explainReadability } from "../readability-copy";

export type ReadabilityPanelProps = {
  checks: readonly ReadabilityCheck[];
  colors: DesignTheme["colors"];
};

export function ReadabilityPanel({ checks, colors }: ReadabilityPanelProps) {
  const warnings = checks.filter((check) => !check.passes);

  return (
    <div className="flex flex-col gap-3">
      <p role="status" aria-live="polite" className="text-sm text-ink-soft">
        {warnings.length === 0
          ? "No readability warnings. Every pair of colors clears its threshold."
          : `${warnings.length} readability ${
              warnings.length === 1 ? "warning" : "warnings"
            }. You can still save and publish.`}
      </p>

      {warnings.length > 0 ? (
        <>
          <p className="text-sm text-ink-soft">
            Contrast measures how far apart two colors are in lightness. 1:1 means they are the same
            color and 21:1 is black on white. Each warning below names the pair, what it does to your
            page, and which way to move each color.
          </p>

          <ul className="flex flex-col gap-2">
            {warnings.map((warning) => {
              const explanation = explainReadability(warning, colors);

              return (
                <li
                  key={`${warning.foreground}-${warning.background}`}
                  className="flex gap-3 rounded-md border border-warn/40 bg-warn-surface p-3 text-sm text-warn"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-warn/40"
                    style={{ backgroundColor: colors[warning.foreground] }}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{explanation.where}</p>
                    <p>{explanation.why}</p>
                    <p className="text-xs tabular-nums">{explanation.numbers}</p>
                    <p className="font-medium">{explanation.fix}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
