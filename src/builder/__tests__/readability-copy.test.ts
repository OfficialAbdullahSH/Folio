import { describe, expect, it } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import type { DesignTheme } from "@/schema";

import { checkReadability, readabilityWarnings } from "../contrast";
import { explainReadability } from "../readability-copy";

function theme(colors: Partial<DesignTheme["colors"]>): DesignTheme {
  return { ...defaultDesign().theme, colors: { ...defaultDesign().theme.colors, ...colors } };
}

function warningFor(colors: Partial<DesignTheme["colors"]>, foreground: string) {
  const themeValue = theme(colors);
  const check = readabilityWarnings(themeValue).find(
    (candidate) => candidate.foreground === foreground,
  );

  if (check === undefined) {
    throw new Error(`Expected a warning for ${foreground}`);
  }

  return explainReadability(check, themeValue.colors);
}

describe("explainReadability", () => {
  it("AC-6 names the pair in words instead of only a ratio", () => {
    const explanation = warningFor({ text: "#ffffff", background: "#ffffff" }, "text");

    expect(explanation.where).toBe("Body text on the page background");
    expect(explanation.where).not.toContain("1.00:1");
  });

  it("AC-6 says why the pair is hard to read", () => {
    const identical = warningFor({ text: "#ffffff", background: "#ffffff" }, "text");
    const close = warningFor({ text: "#f0f0f0", background: "#ffffff" }, "text");

    expect(identical.why).toContain("The two colors are the same");
    expect(close.why).toContain("too close in lightness");
    expect(identical.why).toContain("hard to read");
    expect(close.why).toContain("hard to read");
  });

  it("AC-6 keeps the measurement and explains what the minimum means", () => {
    const explanation = warningFor({ text: "#ffffff", background: "#ffffff" }, "text");

    expect(explanation.numbers).toContain("1.00:1");
    expect(explanation.numbers).toContain("body text needs at least 4.5:1");
  });

  it("AC-6 names panels and cards, not the surface token", () => {
    const explanation = warningFor(
      { text: "#ffffff", surface: "#ffffff", background: "#000000" },
      "text",
    );

    expect(explanation.where).toBe("Body text on panels and cards");
  });

  it("AC-6 asks for the accent minimum, not the body-text minimum", () => {
    const explanation = warningFor({ accent: "#ffffff", background: "#ffffff" }, "accent");

    expect(explanation.where).toBe("Links and accent text on the page background");
    expect(explanation.numbers).toContain("links and large text need at least 3:1");
  });

  it("AC-6 points each color the way that raises the contrast", () => {
    const darkText = warningFor({ text: "#eeeeee", background: "#ffffff" }, "text");
    const lightText = warningFor({ text: "#111111", background: "#000000" }, "text");

    expect(darkText.fix).toBe(
      "Make the text color darker or the page background lighter.",
    );
    expect(lightText.fix).toBe(
      "Make the text color lighter or the page background darker.",
    );
  });

  it("AC-6 explains every warning a default design produces, so the panel never shows a bare number", () => {
    const design = defaultDesign();
    const checks = checkReadability(design.theme).filter((check) => !check.passes);

    for (const check of checks) {
      const explanation = explainReadability(check, design.theme.colors);

      expect(explanation.where.length).toBeGreaterThan(0);
      expect(explanation.why.length).toBeGreaterThan(0);
      expect(explanation.fix.length).toBeGreaterThan(0);
      expect(explanation.numbers).toMatch(/\d+\.\d{2}:1/);
    }
  });
});
