import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROUTE_DIRECTORY = join(process.cwd(), "src", "app", "u", "[username]");

function routeSources(): { file: string; source: string }[] {
  return readdirSync(ROUTE_DIRECTORY)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => ({
      file: name,
      source: readFileSync(join(ROUTE_DIRECTORY, name), "utf8"),
    }));
}

describe("public route imports", () => {
  it("AC-17 never imports the fixture data directly", () => {
    const offenders = routeSources().filter(({ source }) => source.includes("fixtures"));

    expect(offenders.map(({ file }) => file)).toEqual([]);
  });

  it("AC-17 reads data through the source and catalog interfaces", () => {
    const files = routeSources();
    expect(files.length).toBeGreaterThan(0);

    for (const { source } of files) {
      expect(source).not.toContain("fixturePortfolioSource");
      expect(source).not.toContain("skillCatalog:");
    }

    const page = files.find(({ file }) => file === "page.tsx");
    const content = files.find(({ file }) => file === "portfolio-content.tsx");

    expect(page?.source).toContain('from "@/data"');
    expect(page?.source).toContain("loadPortfolio");
    expect(content?.source).toContain('from "@/data"');
    expect(content?.source).toContain("loadPortfolio");
  });
});
