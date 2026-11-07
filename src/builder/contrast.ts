import type { DesignTheme } from "@/schema";

export type ColorRole = keyof DesignTheme["colors"];

export const COLOR_ROLES = [
  "background",
  "surface",
  "text",
  "muted",
  "accent",
  "border",
] as const satisfies readonly ColorRole[];

export type ReadabilityPair = {
  foreground: ColorRole;
  background: ColorRole;
  threshold: number;
};

/** The pairs a page actually puts text on, with the WCAG 2 AA thresholds (D-076). */
export const READABILITY_PAIRS = [
  { foreground: "text", background: "background", threshold: 4.5 },
  { foreground: "text", background: "surface", threshold: 4.5 },
  { foreground: "muted", background: "background", threshold: 4.5 },
  { foreground: "muted", background: "surface", threshold: 4.5 },
  { foreground: "accent", background: "background", threshold: 3 },
  { foreground: "accent", background: "surface", threshold: 3 },
] as const satisfies readonly ReadabilityPair[];

export type ReadabilityCheck = {
  foreground: ColorRole;
  background: ColorRole;
  ratio: number;
  threshold: number;
  passes: boolean;
};

function channel(value: number): number {
  const ratio = value / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

function rgb(hex: string): { r: number; g: number; b: number } {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());

  if (match === null) {
    throw new Error(`Expected a #rrggbb color, received "${hex}"`);
  }

  const digits = match[1] as string;

  return {
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
  };
}

/** WCAG 2 relative luminance, from sRGB. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2 contrast ratio: 1 for identical colors, 21 for black on white. */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);

  return (lighter + 0.05) / (darker + 0.05);
}

/** A ratio meets a threshold when it reaches it, not only when it passes it. */
export function meetsThreshold(ratio: number, threshold: number): boolean {
  return ratio >= threshold;
}

export function checkReadability(theme: DesignTheme): ReadabilityCheck[] {
  return READABILITY_PAIRS.map((pair) => {
    const ratio = contrastRatio(
      theme.colors[pair.foreground],
      theme.colors[pair.background],
    );

    return {
      foreground: pair.foreground,
      background: pair.background,
      ratio,
      threshold: pair.threshold,
      passes: meetsThreshold(ratio, pair.threshold),
    };
  });
}

/** Warnings never block a save (D-009, D-076); they are what the owner should look at. */
export function readabilityWarnings(theme: DesignTheme): ReadabilityCheck[] {
  return checkReadability(theme).filter((check) => !check.passes);
}
