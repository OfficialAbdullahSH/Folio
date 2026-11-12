import { describe, expect, it } from "vitest";

import { emptyContent } from "@/portfolio/defaults";
import { editorialDesign, fullContent } from "@/schema/fixtures";

import { publishNotes } from "../notes";

const readableDesign = {
  ...editorialDesign,
  theme: {
    ...editorialDesign.theme,
    colors: {
      background: "#ffffff",
      surface: "#ffffff",
      text: "#111111",
      muted: "#444444",
      accent: "#1d4ed8",
      border: "#e5e5e5",
    },
  },
};

const unreadableDesign = {
  ...readableDesign,
  theme: {
    ...readableDesign.theme,
    colors: { ...readableDesign.theme.colors, text: "#ffffff" },
  },
};

describe("publishNotes", () => {
  it("AC-6 says nothing about a readable portfolio with every section filled", () => {
    expect(publishNotes(readableDesign, fullContent)).toEqual({
      warnings: [],
      emptySections: [],
    });
  });

  it("AC-6 explains a readability problem in words", () => {
    const notes = publishNotes(unreadableDesign, fullContent);

    expect(notes.warnings.length).toBeGreaterThan(0);
    expect(notes.warnings[0]).toContain("Body text");
    expect(notes.warnings[0]).toContain("4.5:1");
    expect(notes.warnings[0]).toContain("Make the text color lighter");
  });

  it("D-086 names a visible section that has no content", () => {
    const notes = publishNotes(readableDesign, emptyContent());

    expect(notes.emptySections).toEqual(["About", "Projects", "Skills", "Experience", "Contact"]);
  });

  it("D-086 ignores a hidden section that has no content", () => {
    const design = {
      ...readableDesign,
      sections: readableDesign.sections.map((section) =>
        section.id === "projects" ? { ...section, visible: false } : section,
      ),
    };

    const notes = publishNotes(design, emptyContent());

    expect(notes.emptySections).not.toContain("Projects");
  });

  it("D-086 never reports the intro, which always renders", () => {
    const notes = publishNotes(readableDesign, emptyContent());

    expect(notes.emptySections).not.toContain("Intro");
  });
});
