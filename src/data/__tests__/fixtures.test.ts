import { describe, expect, it } from "vitest";

import { validateContent, validateDesign, validateProfile } from "@/schema";

import { fixturePortfolios, fixturePortfolioSource, fixtureSkillCatalog } from "../fixtures";
import { skillCatalog } from "../fixtures/skills";

describe("demo fixtures", () => {
  it("all three fixtures pass the F-02 validators", () => {
    for (const [username, record] of Object.entries(fixturePortfolios)) {
      expect(validateProfile(record.profile).success, `${username} profile`).toBe(true);
      expect(validateDesign(record.design).success, `${username} design`).toBe(true);
      expect(validateContent(record.content).success, `${username} content`).toBe(true);
    }
  });

  it("covers every slug used by the fixtures", async () => {
    const used = new Set<string>();

    for (const record of Object.values(fixturePortfolios)) {
      for (const slug of record.content.skills.skillIds) {
        used.add(slug);
      }
    }

    const names = await fixtureSkillCatalog.resolve([...used]);

    expect([...used].filter((slug) => names[slug] === undefined)).toEqual([]);
  });

  it("demo-editorial has the full English content the spec asks for", () => {
    const record = fixturePortfolios["demo-editorial"];

    expect(record.design.world).toBe("editorial");
    expect(record.content.projects.items.length).toBeGreaterThanOrEqual(3);
    expect(record.content.projects.items.length).toBeLessThanOrEqual(4);
    expect(record.content.skills.skillIds.length).toBeGreaterThanOrEqual(6);
    expect(record.content.skills.skillIds.length).toBeLessThanOrEqual(8);
    expect(record.content.experience.items.length).toBeGreaterThanOrEqual(2);
    expect(record.content.experience.items.length).toBeLessThanOrEqual(3);
    expect(record.content.experience.items.some((item) => item.kind === "education")).toBe(true);
    expect(record.content.experience.items.some((item) => item.current === true)).toBe(true);
    expect(record.content.contact.items).toHaveLength(3);
    expect(record.content.contact.items.some((item) => item.kind === "email")).toBe(true);
  });

  it("demo-terminal uses the terminal world, a dark theme and other display styles", () => {
    const record = fixturePortfolios["demo-terminal"];
    const editorial = fixturePortfolios["demo-editorial"];

    expect(record.design.world).toBe("terminal");
    expect(record.design.theme.headingFont).not.toBe(editorial.design.theme.headingFont);
    expect(record.design.theme.bodyFont).not.toBe(editorial.design.theme.bodyFont);

    const styles = (design: typeof record.design) =>
      design.sections.map((section) =>
        "displayStyle" in section ? section.displayStyle : undefined,
      );

    expect(styles(record.design)).not.toEqual(styles(editorial.design));
  });

  it("demo-minimal is Arabic with hidden and empty sections", () => {
    const record = fixturePortfolios["demo-minimal"];

    expect(record.design.theme.headingFont).toBe("cairo");
    expect(record.profile.displayName).toMatch(/[\u0600-\u06FF]/);
    expect(record.design.sections.some((section) => !section.visible)).toBe(true);
    expect(record.content.skills.skillIds).toHaveLength(0);
    expect(record.content.contact.items).toHaveLength(0);
    expect(record.content.projects.items).toHaveLength(1);
    expect(record.content.projects.items[0].imageUrl).toBeUndefined();
    expect(record.content.projects.items[0].link).toBeUndefined();
  });

  it("exposes the fixture source and catalog", async () => {
    const record = await fixturePortfolioSource.getPortfolio("demo-editorial");

    expect(record).not.toBeNull();
    expect(skillCatalog.typescript).toBe("TypeScript");
  });
});
