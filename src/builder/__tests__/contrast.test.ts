import { describe, expect, it } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import type { DesignTheme } from "@/schema";

import {
  READABILITY_PAIRS,
  checkReadability,
  contrastRatio,
  meetsThreshold,
  readabilityWarnings,
  relativeLuminance,
} from "../contrast";

function theme(colors: Partial<DesignTheme["colors"]>): DesignTheme {
  return { ...defaultDesign().theme, colors: { ...defaultDesign().theme.colors, ...colors } };
}

describe("contrastRatio", () => {
  it("returns 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("is symmetric and accepts upper case input", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#000000", "#FFFFFF")).toBe(
      contrastRatio("#FFFFFF", "#000000"),
    );
  });

  it("AC-5 matches the published WCAG reference pairs", () => {
    const pairs: [string, string, number][] = [
      ["#767676", "#ffffff", 4.54],
      ["#777777", "#ffffff", 4.48],
      ["#0000ff", "#ffffff", 8.59],
      ["#ff0000", "#ffffff", 4.0],
      ["#949494", "#ffffff", 3.03],
      ["#595959", "#ffffff", 7.0],
    ];

    for (const [foreground, background, published] of pairs) {
      expect(contrastRatio(foreground, background)).toBeCloseTo(published, 2);
    }
  });

  it("rejects anything that is not a #rrggbb color", () => {
    expect(() => relativeLuminance("#fff")).toThrow();
    expect(() => relativeLuminance("white")).toThrow();
  });
});

describe("meetsThreshold", () => {
  it("counts a ratio that exactly reaches the threshold as passing", () => {
    expect(meetsThreshold(4.5, 4.5)).toBe(true);
    expect(meetsThreshold(4.49, 4.5)).toBe(false);
  });
});

describe("checkReadability", () => {
  it("AC-5 checks every pair the page puts text on with its threshold", () => {
    const checks = checkReadability(defaultDesign().theme);

    expect(checks.map(({ foreground, background, threshold }) => [foreground, background, threshold])).toEqual(
      READABILITY_PAIRS.map(({ foreground, background, threshold }) => [
        foreground,
        background,
        threshold,
      ]),
    );
  });

  it("marks a pair that reaches its threshold as passing", () => {
    const checks = checkReadability(theme({ text: "#767676", background: "#ffffff" }));
    const pair = checks.find(
      (check) => check.foreground === "text" && check.background === "background",
    );

    expect(pair?.ratio).toBeGreaterThanOrEqual(4.5);
    expect(pair?.passes).toBe(true);
  });

  it("warns when text and background are the same color", () => {
    const warnings = readabilityWarnings(theme({ text: "#ffffff", background: "#ffffff" }));

    expect(warnings.some((warning) => warning.foreground === "text")).toBe(true);
  });

  it("AC-5 passes a pair exactly at the threshold and warns just below it", () => {
    const atText = checkReadability(theme({ text: "#767676", background: "#ffffff" }));
    const belowText = checkReadability(theme({ text: "#777777", background: "#ffffff" }));
    const atAccent = checkReadability(theme({ accent: "#949494", background: "#ffffff" }));
    const belowAccent = checkReadability(theme({ accent: "#959595", background: "#ffffff" }));

    expect(atText.find((check) => check.foreground === "text" && check.background === "background")?.passes).toBe(true);
    expect(belowText.find((check) => check.foreground === "text" && check.background === "background")?.passes).toBe(false);
    expect(atAccent.find((check) => check.foreground === "accent" && check.background === "background")?.passes).toBe(true);
    expect(belowAccent.find((check) => check.foreground === "accent" && check.background === "background")?.passes).toBe(false);
  });

  it("uses 3:1 for the accent and 4.5:1 for text and muted text", () => {
    const checks = checkReadability(defaultDesign().theme);

    for (const check of checks) {
      expect(check.threshold).toBe(
        check.foreground === "accent" ? 3 : 4.5,
      );
    }
  });
});
