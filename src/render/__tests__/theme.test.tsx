import { describe, expect, it } from "vitest";

import { RADIUS_SCALE, themeVariables } from "@/render/theme";

import { record } from "./helpers";

const VARIABLE_NAMES = [
  "--color-accent",
  "--color-background",
  "--color-border",
  "--color-muted",
  "--color-surface",
  "--color-text",
  "--font-body",
  "--font-heading",
  "--radius",
];

describe("theme", () => {
  it("AC-5 sets exactly the six colors, the radius and the two fonts", () => {
    const { theme } = record().design;
    expect(Object.keys(themeVariables(theme)).sort()).toEqual(VARIABLE_NAMES);
  });

  it("AC-5 maps every token to its own variable", () => {
    const { theme } = record().design;
    const variables = themeVariables(theme);

    expect(variables["--color-background"]).toBe(theme.colors.background);
    expect(variables["--color-surface"]).toBe(theme.colors.surface);
    expect(variables["--color-text"]).toBe(theme.colors.text);
    expect(variables["--color-muted"]).toBe(theme.colors.muted);
    expect(variables["--color-accent"]).toBe(theme.colors.accent);
    expect(variables["--color-border"]).toBe(theme.colors.border);
    expect(variables["--font-heading"]).toBe("var(--font-playfair-display)");
    expect(variables["--font-body"]).toBe("var(--font-inter)");
  });

  it("AC-5 changing one token changes only that variable", () => {
    const { theme } = record().design;
    const before = themeVariables(theme);
    const after = themeVariables({
      ...theme,
      colors: { ...theme.colors, accent: "#123456" },
    });

    const changed = Object.keys(before).filter((key) => before[key] !== after[key]);

    expect(changed).toEqual(["--color-accent"]);
    expect(after["--color-accent"]).toBe("#123456");
  });

  it("AC-7 maps the four radius values", () => {
    expect(RADIUS_SCALE).toEqual({
      none: "0",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "1rem",
    });

    const { theme } = record().design;

    for (const radius of ["none", "sm", "md", "lg"] as const) {
      expect(themeVariables({ ...theme, radius })["--radius"]).toBe(RADIUS_SCALE[radius]);
    }
  });

  it("AC-12 uses the cairo variable for the Arabic fixture", () => {
    const { theme } = record("demo-minimal").design;
    const variables = themeVariables(theme);

    expect(variables["--font-heading"]).toBe("var(--font-cairo)");
    expect(variables["--font-body"]).toBe("var(--font-cairo)");
  });
});
