import { describe, expect, it } from "vitest";

import type { DesignSection } from "@/schema";

import { record, renderPortfolio } from "./helpers";

const COMBINATIONS = [
  { id: "hero", styles: ["large", "compact"] },
  { id: "projects", styles: ["grid", "cards", "timeline"] },
  { id: "skills", styles: ["tags", "list"] },
  { id: "experience", styles: ["timeline", "list"] },
] as const;

describe("section and display style combinations", () => {
  for (const world of ["editorial", "terminal"] as const) {
    for (const combination of COMBINATIONS) {
      for (const style of combination.styles) {
        it(`AC-4 renders ${combination.id} with ${style} in the ${world} world`, () => {
          const portfolio = record();
          portfolio.design.world = world;
          portfolio.design.sections = portfolio.design.sections.map((section) =>
            section.id === combination.id
              ? ({ ...section, displayStyle: style } as DesignSection)
              : section,
          );

          const html = renderPortfolio(portfolio);

          expect(html).toContain(`data-section="${combination.id}"`);
          expect(html).toContain(`data-style="${style}"`);
        });
      }
    }
  }

  it("AC-4 leaves about and contact without a display style", () => {
    const html = renderPortfolio(record());

    expect(html).not.toMatch(/data-section="about" data-style/);
    expect(html).not.toMatch(/data-section="contact" data-style/);
  });
});
