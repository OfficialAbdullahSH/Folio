import { describe, expect, it } from "vitest";

import { SECTION_IDS, validateContent, validateDesign } from "@/schema";

import { DEFAULT_DESIGN, EMPTY_CONTENT, defaultDesign, emptyContent } from "../defaults";

describe("default documents", () => {
  it("AC-8 the default design passes the F-02 design validator", () => {
    expect(validateDesign(DEFAULT_DESIGN)).toEqual({ success: true, data: DEFAULT_DESIGN });
  });

  it("AC-8 the empty content passes the F-02 content validator", () => {
    expect(validateContent(EMPTY_CONTENT)).toEqual({ success: true, data: EMPTY_CONTENT });
  });

  it("AC-8 starts on the editorial world with all six sections visible", () => {
    expect(DEFAULT_DESIGN.world).toBe("editorial");
    expect(DEFAULT_DESIGN.sections.map((section) => section.id)).toEqual([...SECTION_IDS]);
    expect(DEFAULT_DESIGN.sections.every((section) => section.visible)).toBe(true);
  });

  it("AC-8 gives every section that has a display style a valid one", () => {
    const styles = Object.fromEntries(
      DEFAULT_DESIGN.sections.map((section) => [
        section.id,
        "displayStyle" in section ? section.displayStyle : undefined,
      ]),
    );

    expect(styles).toMatchObject({
      hero: "large",
      projects: "cards",
      skills: "tags",
      experience: "timeline",
    });
  });

  it("AC-8 hands out copies, so a draft cannot corrupt the defaults", () => {
    const design = defaultDesign();
    const content = emptyContent();

    design.theme.colors.accent = "#000000";
    content.about.text = "changed";

    expect(DEFAULT_DESIGN.theme.colors.accent).toBe("#b45309");
    expect(EMPTY_CONTENT.about.text).toBe("");
  });
});
