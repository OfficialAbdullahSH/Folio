import { describe, expect, it } from "vitest";

import { editorialDesign, fullContent, validProfile } from "../fixtures";
import { validateContent, validateDesign, validateProfile } from "../index";

const badInputs = [null, undefined, 42, "string", [], {}, true];

describe("validation helpers", () => {
  it("AC-14 returns parsed data on success", () => {
    const design = validateDesign(editorialDesign);
    expect(design.success).toBe(true);

    const content = validateContent(fullContent);
    expect(content.success).toBe(true);

    const profile = validateProfile(validProfile);
    expect(profile.success).toBe(true);
  });

  it("AC-14 returns errors with a field path and a message", () => {
    const result = validateDesign({
      ...editorialDesign,
      theme: {
        ...editorialDesign.theme,
        colors: { ...editorialDesign.theme.colors, accent: "red" },
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.errors.find(
        (issue) => issue.path === "theme.colors.accent",
      );
      expect(error).toBeDefined();
      expect(error?.message.length).toBeGreaterThan(0);
    }
  });

  it("AC-14 reports the list index in the path", () => {
    const result = validateContent({
      ...structuredClone(fullContent),
      projects: { items: [{ id: "not-a-uuid", title: "", description: "" }] },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(["projects.items.0.id", "projects.items.0.title"]),
      );
    }
  });

  it("AC-14 never throws on bad input", () => {
    for (const input of badInputs) {
      expect(() => validateDesign(input)).not.toThrow();
      expect(() => validateContent(input)).not.toThrow();
      expect(() => validateProfile(input)).not.toThrow();
      expect(validateDesign(input).success).toBe(false);
      expect(validateContent(input).success).toBe(false);
      expect(validateProfile(input).success).toBe(false);
    }
  });
});
