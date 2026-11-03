import { afterEach, describe, expect, it, vi } from "vitest";

import { fixturePortfolios } from "@/data/fixtures";
import { fixturePortfolioSource, fixtureSkillCatalog } from "@/data/fixtures/source";
import { loadPortfolio } from "@/render/load";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadPortfolio", () => {
  it("AC-13 loads all three demo portfolios", async () => {
    for (const username of ["demo-editorial", "demo-terminal", "demo-minimal"]) {
      const result = await loadPortfolio(username, fixturePortfolioSource, fixtureSkillCatalog);

      expect(result.status).toBe("ok");
    }
  });

  it("AC-11 resolves skill names through the catalog", async () => {
    const result = await loadPortfolio(
      "demo-editorial",
      fixturePortfolioSource,
      fixtureSkillCatalog,
    );

    expect(result.status).toBe("ok");
    expect(result.status === "ok" && result.skills.typescript).toBe("TypeScript");
  });

  it("AC-13 returns not-found for an unknown username", async () => {
    const result = await loadPortfolio("nobody-here", fixturePortfolioSource, fixtureSkillCatalog);

    expect(result.status).toBe("not-found");
  });

  it("AC-13 rejects an invalid username without calling the source", async () => {
    const getPortfolio = vi.fn();

    const result = await loadPortfolio("Not A Name", { getPortfolio }, fixtureSkillCatalog);

    expect(result.status).toBe("not-found");
    expect(getPortfolio).not.toHaveBeenCalled();
  });

  it("edge case treats uppercase usernames as their lowercase form", async () => {
    const getPortfolio = vi.fn(fixturePortfolioSource.getPortfolio);

    const result = await loadPortfolio("DEMO-Editorial", { getPortfolio }, fixtureSkillCatalog);

    expect(result.status).toBe("ok");
    expect(getPortfolio).toHaveBeenCalledWith("demo-editorial");
  });

  it("edge case rejects malformed percent-encoding", async () => {
    const result = await loadPortfolio("%E0%A4%A", fixturePortfolioSource, fixtureSkillCatalog);

    expect(result.status).toBe("not-found");
  });

  it("AC-14 logs invalid stored data and returns not-found", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = structuredClone(fixturePortfolios["demo-editorial"]);
    (broken.design as unknown as { version: number }).version = 2;

    const result = await loadPortfolio(
      "demo-editorial",
      { getPortfolio: async () => broken },
      fixtureSkillCatalog,
    );

    expect(result.status).toBe("not-found");
    expect(errorSpy).toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("version");
    expect(JSON.stringify(result)).not.toContain("expected");
  });

  it("AC-14 hides invalid profile data too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = structuredClone(fixturePortfolios["demo-editorial"]);
    (broken.profile as unknown as { username: string }).username = "Bad Name";

    const result = await loadPortfolio(
      "demo-editorial",
      { getPortfolio: async () => broken },
      fixtureSkillCatalog,
    );

    expect(result.status).toBe("not-found");
  });
});
