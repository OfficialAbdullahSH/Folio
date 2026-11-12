import { describe, expect, it } from "vitest";

import { SEARCH_PAGE_SIZE } from "../query";
import {
  createSearchSource,
  loadPopularSkills,
  loadSection,
  loadSkillCatalog,
  parseSearchRows,
  type SearchReader,
} from "../data";

type Answer = { data: unknown; error: { message: string } | null };

type Call = { name: string; args: Record<string, unknown> };

type Handlers = {
  search?: (args: Record<string, unknown>) => Answer;
  popular?: (args: Record<string, unknown>) => Answer;
  skills?: () => Answer;
  aliases?: () => Answer;
};

const ok = (data: unknown): Answer => ({ data, error: null });

function fakeReader(handlers: Handlers = {}, calls: Call[] = []): SearchReader {
  const reader = {
    rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });

      if (name === "search_portfolios") {
        return Promise.resolve(handlers.search?.(args) ?? ok([]));
      }

      return Promise.resolve(handlers.popular?.(args) ?? ok([]));
    },
    from(table: string) {
      return {
        select: () =>
          Promise.resolve(
            table === "skills" ? (handlers.skills?.() ?? ok([])) : (handlers.aliases?.() ?? ok([])),
          ),
      };
    },
  };

  return reader as unknown as SearchReader;
}

const row = {
  username: "demo-sara-ahmed",
  display_name: "Sara Ahmed",
  headline: "Front-end engineer",
  skill_slugs: ["react", "typescript"],
  world: "editorial",
  accent: "#b45309",
  published_at: "2026-11-12T10:00:00+00:00",
  total_count: 5,
};

const section = (rows: unknown[], total = rows.length) =>
  rows.map((entry) => ({ ...(entry as object), total_count: total }));

describe("search", () => {
  it("AC-8 sends the terms, the slugs, the page size and the offset", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({}, calls));

    await source.search({ terms: ["sara"], slugs: ["react"], limit: 12, offset: 12 });

    expect(calls).toEqual([
      {
        name: "search_portfolios",
        args: { p_terms: ["sara"], p_skill_slugs: ["react"], p_limit: 12, p_offset: 12 },
      },
    ]);
  });

  it("AC-8 sends null rather than an empty list for a filter it is not using", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({}, calls));

    await source.search({ terms: [], slugs: ["react"], limit: 12, offset: 0 });

    expect(calls[0]?.args.p_terms).toBeNull();
    expect(calls[0]?.args.p_skill_slugs).toEqual(["react"]);
  });

  it("AC-7 maps a row to what a card needs", async () => {
    const source = createSearchSource(fakeReader({ search: () => ok([row]) }));

    const result = await source.search({ terms: ["sara"], slugs: [], limit: 12, offset: 0 });

    expect(result).toEqual({
      status: "ok",
      rows: [
        {
          username: "demo-sara-ahmed",
          displayName: "Sara Ahmed",
          headline: "Front-end engineer",
          skillSlugs: ["react", "typescript"],
          accent: "#b45309",
          publishedAt: "2026-11-12T10:00:00+00:00",
        },
      ],
      total: 5,
    });
  });

  it("AC-8 keeps at most six skills on a result", async () => {
    const many = { ...row, skill_slugs: ["a", "b", "c", "d", "e", "f", "g"] };
    const source = createSearchSource(fakeReader({ search: () => ok([many]) }));

    const result = await source.search({ terms: [], slugs: [], limit: 12, offset: 0 });

    expect(result.status === "ok" ? result.rows[0]?.skillSlugs : null).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ]);
  });

  it("AC-9 reports a database error as a failure instead of throwing", async () => {
    const source = createSearchSource(
      fakeReader({ search: () => ({ data: null, error: { message: "permission denied" } }) }),
    );

    const result = await source.search({ terms: ["sara"], slugs: [], limit: 12, offset: 0 });

    expect(result).toEqual({ status: "failed", message: "permission denied" });
  });

  it("AC-9 reports an unexpected answer as a failure", async () => {
    const source = createSearchSource(fakeReader({ search: () => ok({ rows: [] }) }));

    const result = await source.search({ terms: ["sara"], slugs: [], limit: 12, offset: 0 });

    expect(result.status).toBe("failed");
  });

  it("AC-9 drops a row that is not shaped like a result", async () => {
    const source = createSearchSource(
      fakeReader({ search: () => ok([row, { username: 42, total_count: 5 }]) }),
    );

    const result = await source.search({ terms: ["sara"], slugs: [], limit: 12, offset: 0 });

    expect(result.status === "ok" ? result.rows.map((entry) => entry.username) : []).toEqual([
      "demo-sara-ahmed",
    ]);
  });

  it("AC-11 answers unavailable when the build has no database", async () => {
    const source = createSearchSource(null);

    expect(await source.search({ terms: [], slugs: [], limit: 12, offset: 0 })).toEqual({
      status: "unavailable",
    });
  });
});

describe("parseSearchRows", () => {
  it("AC-7 takes the total from the rows", () => {
    expect(parseSearchRows([row])).toMatchObject({ total: 5 });
  });

  it("AC-11 reports no matches as a zero total", () => {
    expect(parseSearchRows([])).toEqual({ rows: [], total: 0 });
  });

  it("AC-7 keeps a hex accent and refuses anything else", () => {
    const parsed = parseSearchRows([
      { ...row, accent: "#B45309" },
      { ...row, username: "other", accent: "url(javascript:alert(1))" },
    ]);

    expect(parsed.rows.map((entry) => entry.accent)).toEqual(["#B45309", null]);
  });

  it("AC-7 keeps an empty headline as an empty string", () => {
    const parsed = parseSearchRows([{ ...row, headline: null }]);

    expect(parsed.rows[0]?.headline).toBe("");
  });
});

describe("loadSection", () => {
  it("AC-4 searches a skill section by slug only", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({ search: () => ok([]) }, calls));

    await loadSection(source, { kind: "skill", slugs: ["react"] }, 1);

    expect(calls[0]?.args).toEqual({
      p_terms: null,
      p_skill_slugs: ["react"],
      p_limit: SEARCH_PAGE_SIZE,
      p_offset: 0,
    });
  });

  it("AC-3 searches a name section by terms only", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({ search: () => ok([]) }, calls));

    await loadSection(source, { kind: "name", terms: ["sara"] }, 1);

    expect(calls[0]?.args).toEqual({
      p_terms: ["sara"],
      p_skill_slugs: null,
      p_limit: SEARCH_PAGE_SIZE,
      p_offset: 0,
    });
  });

  it("AC-8 loads the requested page at its offset", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({ search: () => ok(section([row], 30)) }, calls));

    const result = await loadSection(source, { kind: "name", terms: ["sara"] }, 2);

    expect(calls[0]?.args.p_offset).toBe(SEARCH_PAGE_SIZE);
    expect(result).toMatchObject({ status: "ok", section: { page: 2, total: 30 } });
  });

  it("AC-8 shows the last page when the page asked for is past the end", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(
      fakeReader(
        {
          search: (args) =>
            args.p_offset === 96 ? ok([]) : ok(section([row], 30)),
        },
        calls,
      ),
    );

    const result = await loadSection(source, { kind: "name", terms: ["sara"] }, 9);

    expect(calls.map((call) => call.args.p_offset)).toEqual([96, 0, 24]);
    expect(result).toMatchObject({ status: "ok", section: { page: 3, total: 30 } });
    expect(result.status === "ok" ? result.section.rows : []).toHaveLength(1);
  });

  it("AC-11 leaves an empty result on page 1 after one count request", async () => {
    const calls: Call[] = [];
    const source = createSearchSource(fakeReader({ search: () => ok([]) }, calls));

    const result = await loadSection(source, { kind: "name", terms: ["nobody"] }, 4);

    expect(calls.map((call) => call.args.p_offset)).toEqual([36, 0]);
    expect(result).toMatchObject({ status: "ok", section: { page: 1, total: 0, rows: [] } });
  });

  it("AC-11 passes a failure through", async () => {
    const source = createSearchSource(
      fakeReader({ search: () => ({ data: null, error: { message: "boom" } }) }),
    );

    expect(await loadSection(source, { kind: "name", terms: ["sara"] }, 1)).toEqual({
      status: "failed",
      message: "boom",
    });
  });
});

describe("loadPopularSkills", () => {
  it("AC-11 lists the chips the function returns", async () => {
    const source = createSearchSource(
      fakeReader({ popular: () => ok([{ slug: "react", portfolio_count: 5 }]) }),
    );

    expect(await loadPopularSkills(source, 8)).toEqual({
      status: "ok",
      skills: [{ slug: "react", count: 5 }],
    });
  });

  it("AC-11 answers an empty list when the function fails", async () => {
    const source = createSearchSource(
      fakeReader({ popular: () => ({ data: null, error: { message: "boom" } }) }),
    );

    expect(await loadPopularSkills(source, 8)).toEqual({ status: "ok", skills: [] });
  });
});

describe("loadSkillCatalog", () => {
  it("AC-6 reads the skill names and their aliases", async () => {
    const source = createSearchSource(
      fakeReader({
        skills: () => ok([{ slug: "react", name: "React" }]),
        aliases: () => ok([{ alias: "reactjs", skill_slug: "react" }]),
      }),
    );

    expect(await loadSkillCatalog(source)).toEqual({
      skills: [{ slug: "react", name: "React" }],
      aliases: [{ alias: "reactjs", skillSlug: "react" }],
    });
  });

  it("AC-6 answers empty lists when the list cannot be read", async () => {
    const source = createSearchSource(
      fakeReader({
        skills: () => ({ data: null, error: { message: "boom" } }),
        aliases: () => ({ data: null, error: { message: "boom" } }),
      }),
    );

    expect(await loadSkillCatalog(source)).toEqual({ skills: [], aliases: [] });
  });
});
