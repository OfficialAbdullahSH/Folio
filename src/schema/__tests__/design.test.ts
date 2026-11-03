import { describe, expect, it } from "vitest";

import { designDocumentSchema } from "../design.schema";
import { editorialDesign, hiddenSectionsDesign, terminalDesign } from "../fixtures";

const parse = (input: unknown) => designDocumentSchema.safeParse(input);

const withSection = (index: number, patch: Record<string, unknown>) => ({
  ...editorialDesign,
  sections: editorialDesign.sections.map((section, i) =>
    i === index ? { ...section, ...patch } : section,
  ),
});

const withColors = (patch: Record<string, string>) => ({
  ...editorialDesign,
  theme: {
    ...editorialDesign.theme,
    colors: { ...editorialDesign.theme.colors, ...patch },
  },
});

const messages = (input: unknown) => {
  const result = parse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("design document", () => {
  it("AC-1 parses a valid design for each world", () => {
    expect(parse(editorialDesign).success).toBe(true);
    expect(parse(terminalDesign).success).toBe(true);
  });

  it("AC-2 rejects a version other than 1", () => {
    expect(parse({ ...editorialDesign, version: 2 }).success).toBe(false);
    expect(parse({ ...editorialDesign, version: "1" }).success).toBe(false);
  });

  it("AC-2 rejects an unknown world", () => {
    expect(parse({ ...editorialDesign, world: "brutalist" }).success).toBe(false);
  });

  it("AC-2 rejects unknown keys at every level", () => {
    expect(parse({ ...editorialDesign, extra: true }).success).toBe(false);
    expect(
      parse({
        ...editorialDesign,
        theme: { ...editorialDesign.theme, spacing: 8 },
      }).success,
    ).toBe(false);
    expect(parse(withColors({ glow: "#ffffff" })).success).toBe(false);
    expect(parse(withSection(0, { animation: "fade" })).success).toBe(false);
  });

  it("AC-3 rejects a missing section", () => {
    const missing = {
      ...editorialDesign,
      sections: editorialDesign.sections.filter((section) => section.id !== "about"),
    };

    expect(messages(missing)).toContain('Missing section "about"');
  });

  it("AC-3 rejects a duplicate section", () => {
    expect(messages(withSection(1, { id: "hero", displayStyle: "large" }))).toContain(
      'Duplicate section id "hero"',
    );
  });

  it("AC-3 rejects an unknown section id", () => {
    expect(parse(withSection(1, { id: "blog" })).success).toBe(false);
  });

  it("AC-3 accepts any order of the six sections", () => {
    const reversed = {
      ...editorialDesign,
      sections: [...editorialDesign.sections].reverse(),
    };
    expect(parse(reversed).success).toBe(true);
  });

  it("AC-4 rejects a display style that is not allowed for its section", () => {
    expect(parse(withSection(2, { displayStyle: "tags" })).success).toBe(false);
    expect(parse(withSection(0, { displayStyle: "grid" })).success).toBe(false);
  });

  it("AC-4 rejects a display style on about and contact", () => {
    expect(parse(withSection(1, { displayStyle: "large" })).success).toBe(false);
    expect(parse(withSection(5, { displayStyle: "grid" })).success).toBe(false);
  });

  it("AC-5 rejects colors that are not #RRGGBB", () => {
    expect(parse(withColors({ accent: "#fff" })).success).toBe(false);
    expect(parse(withColors({ accent: "red" })).success).toBe(false);
    expect(parse(withColors({ accent: "#12345G" })).success).toBe(false);
    expect(parse(withColors({ accent: "123456" })).success).toBe(false);
  });

  it("AC-5 accepts uppercase colors and outputs lowercase", () => {
    const result = parse(withColors({ accent: "#ABCDEF" }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme.colors.accent).toBe("#abcdef");
    }
  });

  it("AC-6 rejects a font key outside the six", () => {
    expect(
      parse({
        ...editorialDesign,
        theme: { ...editorialDesign.theme, headingFont: "comic-sans" },
      }).success,
    ).toBe(false);
    expect(
      parse({
        ...editorialDesign,
        theme: { ...editorialDesign.theme, bodyFont: "Helvetica" },
      }).success,
    ).toBe(false);
  });

  it("AC-6 rejects a radius outside the four values", () => {
    expect(
      parse({
        ...editorialDesign,
        theme: { ...editorialDesign.theme, radius: "xl" },
      }).success,
    ).toBe(false);
  });

  it("accepts a design with every section hidden", () => {
    expect(parse(hiddenSectionsDesign).success).toBe(true);
  });
});
