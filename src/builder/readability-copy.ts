import type { DesignTheme } from "@/schema";

import { relativeLuminance, type ReadabilityCheck } from "./contrast";

/**
 * The warning text, in words rather than numbers (D-076, AC-6).
 *
 * A ratio on its own tells the owner nothing they can act on, so every warning says
 * which two colors clash, what the clash does to the page, what the numbers mean and
 * which way to move the colors. `readability-copy.test.ts` holds the wording.
 */
export type ReadabilityExplanation = {
  /** What the pair is: "Body text on the page background". */
  where: string;
  /** What the clash does: "The two colors are the same, so…". */
  why: string;
  /** The measurement and the minimum it misses: "Contrast is 1.00:1; body text needs at least 4.5:1." */
  numbers: string;
  /** Which way to move each color: "Make the text color lighter or the page background darker." */
  fix: string;
};

type ForegroundRole = "text" | "muted" | "accent";
type BackgroundRole = "background" | "surface";

const FOREGROUND: Record<
  ForegroundRole,
  { subject: string; noun: string; effect: string }
> = {
  text: {
    subject: "Body text",
    noun: "text color",
    effect: "the words blend into the background and are hard to read",
  },
  muted: {
    subject: "Secondary text",
    noun: "secondary text color",
    effect: "labels, dates and secondary text fade into the background",
  },
  accent: {
    subject: "Links and accent text",
    noun: "accent color",
    effect: "links and highlighted words are hard to pick out",
  },
};

const BACKGROUND: Record<BackgroundRole, { where: string; noun: string }> = {
  background: { where: "the page background", noun: "page background" },
  surface: { where: "panels and cards", noun: "panel color" },
};

function isForeground(role: string): role is ForegroundRole {
  return role === "text" || role === "muted" || role === "accent";
}

function isBackground(role: string): role is BackgroundRole {
  return role === "background" || role === "surface";
}

function needsWords(threshold: number): string {
  if (threshold >= 4.5) {
    return "body text needs at least 4.5:1";
  }

  if (threshold >= 3) {
    return "links and large text need at least 3:1";
  }

  return `it needs at least ${threshold}:1`;
}

export function explainReadability(
  check: ReadabilityCheck,
  colors: DesignTheme["colors"],
): ReadabilityExplanation {
  const foreground = isForeground(check.foreground)
    ? FOREGROUND[check.foreground]
    : { subject: check.foreground, noun: `${check.foreground} color`, effect: "the text is hard to read" };
  const background = isBackground(check.background)
    ? BACKGROUND[check.background]
    : { where: check.background, noun: `${check.background} color` };
  const foregroundIsLighter =
    relativeLuminance(colors[check.foreground]) >= relativeLuminance(colors[check.background]);

  return {
    where: `${foreground.subject} on ${background.where}`,
    why:
      check.ratio < 1.05
        ? `The two colors are the same, so ${foreground.effect}.`
        : `The two colors are too close in lightness, so ${foreground.effect}.`,
    numbers: `Contrast is ${check.ratio.toFixed(2)}:1; ${needsWords(check.threshold)}.`,
    fix: `Make the ${foreground.noun} ${
      foregroundIsLighter ? "lighter" : "darker"
    } or the ${background.noun} ${foregroundIsLighter ? "darker" : "lighter"}.`,
  };
}
