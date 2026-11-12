import { describe, expect, it, vi } from "vitest";

import { editorialDesign, fullContent } from "@/schema/fixtures";
import type { PortfolioRecord, PortfolioSource, SkillCatalog } from "@/render/types";

import {
  createPublishedPortfolioSource,
  createPublishedSkillCatalog,
  type PublishedReader,
  type SkillReader,
} from "../source";

const ROW = {
  username: "amelia-hart",
  display_name: "Amelia Hart",
  headline: "Product designer",
  design: editorialDesign,
  content: fullContent,
};

type Call = { table: string; columns: string; column?: string; value?: unknown };

function reader(
  result: { data: unknown; error: unknown },
  calls: Call[] = [],
): PublishedReader & SkillReader {
  return {
    from: (table: string) => ({
      select: (columns: string) => {
        const call: Call = { table, columns };
        calls.push(call);

        return {
          eq: (column: string, value: unknown) => {
            call.column = column;
            call.value = value;

            return { maybeSingle: async () => result };
          },
          in: async (column: string, value: unknown) => {
            call.column = column;
            call.value = value;

            return result;
          },
        };
      },
    }),
  } as unknown as PublishedReader & SkillReader;
}

const emptyFallback: PortfolioSource = {
  async getPortfolio() {
    return null;
  },
};

const demoFallback: PortfolioSource = {
  async getPortfolio(username) {
    return username === "demo-editorial"
      ? ({
          profile: { username, displayName: "Demo", headline: "" },
          design: editorialDesign,
          content: fullContent,
        } satisfies PortfolioRecord)
      : null;
  },
};

const fallbackCatalog: SkillCatalog = {
  async resolve(slugs) {
    const names: Record<string, string> = {};

    for (const slug of slugs) {
      if (slug === "typescript") {
        names[slug] = "TypeScript";
      }
    }

    return names;
  },
};

describe("createPublishedPortfolioSource", () => {
  it("AC-9 returns the published row as a portfolio record", async () => {
    const calls: Call[] = [];
    const source = createPublishedPortfolioSource(reader({ data: ROW, error: null }, calls), emptyFallback);

    const record = await source.getPortfolio("amelia-hart");

    expect(record).toEqual({
      profile: {
        username: "amelia-hart",
        displayName: "Amelia Hart",
        headline: "Product designer",
      },
      design: editorialDesign,
      content: fullContent,
    });
    expect(calls[0]).toMatchObject({
      table: "published_portfolios",
      columns: "username, display_name, headline, design, content",
      column: "username",
      value: "amelia-hart",
    });
  });

  it("AC-9 looks up a mixed-case username in lowercase", async () => {
    const calls: Call[] = [];
    const source = createPublishedPortfolioSource(reader({ data: ROW, error: null }, calls), emptyFallback);

    await source.getPortfolio("  Amelia-Hart  ");

    expect(calls[0]?.value).toBe("amelia-hart");
  });

  it("AC-9 returns nothing when no row matches and the demo has no page", async () => {
    const source = createPublishedPortfolioSource(reader({ data: null, error: null }), emptyFallback);

    expect(await source.getPortfolio("nobody-here")).toBeNull();
  });

  it("D-084 falls back to the demo pages when nothing is published", async () => {
    const source = createPublishedPortfolioSource(reader({ data: null, error: null }), demoFallback);

    expect(await source.getPortfolio("demo-editorial")).not.toBeNull();
  });

  it("D-084 lets a published row win over a demo page with the same name", async () => {
    const source = createPublishedPortfolioSource(reader({ data: ROW, error: null }), demoFallback);

    const record = await source.getPortfolio("demo-editorial");

    expect(record?.profile.displayName).toBe("Amelia Hart");
  });

  it("D-084 keeps the demo pages working when the read fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const source = createPublishedPortfolioSource(
      reader({ data: null, error: { message: "connection reset" } }),
      demoFallback,
    );

    expect(await source.getPortfolio("demo-editorial")).not.toBeNull();
    vi.restoreAllMocks();
  });

  it("AC-9 treats a published row with a missing headline as an empty headline", async () => {
    const source = createPublishedPortfolioSource(
      reader({ data: { ...ROW, headline: null }, error: null }),
      emptyFallback,
    );

    expect((await source.getPortfolio("amelia-hart"))?.profile.headline).toBe("");
  });
});

describe("createPublishedSkillCatalog", () => {
  it("AC-9 resolves skill names from the database", async () => {
    const catalog = createPublishedSkillCatalog(
      reader({ data: [{ slug: "react", name: "React" }], error: null }),
      fallbackCatalog,
    );

    expect(await catalog.resolve(["react", "typescript"])).toEqual({
      react: "React",
      typescript: "TypeScript",
    });
  });

  it("D-084 keeps names for the demo pages when the read fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const catalog = createPublishedSkillCatalog(
      reader({ data: null, error: { message: "connection reset" } }),
      fallbackCatalog,
    );

    expect(await catalog.resolve(["typescript"])).toEqual({ typescript: "TypeScript" });
    vi.restoreAllMocks();
  });

  it("AC-9 asks the database nothing when there are no slugs", async () => {
    const calls: Call[] = [];
    const catalog = createPublishedSkillCatalog(reader({ data: [], error: null }, calls), fallbackCatalog);

    expect(await catalog.resolve([])).toEqual({});
    expect(calls).toEqual([]);
  });
});
