import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LOOKS } from "@/builder/looks";
import { validateContent, validateDesign, validateProfile } from "@/schema";

import {
  DEMO_EMAIL_DOMAIN,
  DEMO_PORTFOLIOS,
  type DemoPortfolio,
  DEMO_USERNAMES,
  buildDemoRemovalSql,
  buildDemoSeedSql,
  checkDemoPortfolios,
  demoEmail,
} from "../demo-seed";

const skillsSql = readFileSync(
  new URL("../../../supabase/seed/skills.sql", import.meta.url),
  "utf8",
);

const seedSql = readFileSync(
  new URL("../../../supabase/seed/demo_portfolios.sql", import.meta.url),
  "utf8",
);

const removalSql = readFileSync(
  new URL("../../../supabase/seed/demo_portfolios_remove.sql", import.meta.url),
  "utf8",
);

const seedSlugs = new Set(
  [...skillsSql.matchAll(/\('([a-z0-9-]+)',\s*'[^']*'\)/g)].map((match) => match[1]!),
);

const allSkillSlugs = DEMO_PORTFOLIOS.flatMap((portfolio) => portfolio.content.skills.skillIds);

describe("the demo people", () => {
  it("AC-9 has ten fictional people, each passing the F-02 validators", () => {
    expect(DEMO_PORTFOLIOS).toHaveLength(10);
    expect(checkDemoPortfolios()).toEqual([]);
  });

  it("AC-9 keeps the profile, design and content validators as the only rule", () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(validateProfile(portfolio.profile).success).toBe(true);
      expect(validateDesign(portfolio.design).success).toBe(true);
      expect(validateContent(portfolio.content).success).toBe(true);
    }
  });

  it("AC-9 uses a username and address no real owner can be", () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(portfolio.profile.username.startsWith("demo-")).toBe(true);
      expect(demoEmail(portfolio.profile.username)).toContain(`@${DEMO_EMAIL_DOMAIN}`);
    }

    expect(new Set(DEMO_USERNAMES).size).toBe(DEMO_PORTFOLIOS.length);
  });

  it("AC-7 includes two people with Arabic display names", () => {
    const arabic = DEMO_PORTFOLIOS.filter((portfolio) => /[\u0600-\u06FF]/.test(portfolio.profile.displayName));

    expect(arabic).toHaveLength(2);
  });

  it("AC-9 shows both worlds and at least six of the builder's looks", () => {
    const worlds = new Set(DEMO_PORTFOLIOS.map((portfolio) => portfolio.design.world));
    const lookThemes = LOOKS.map((look) => JSON.stringify(look.theme));
    const used = new Set(DEMO_PORTFOLIOS.map((portfolio) => JSON.stringify(portfolio.design.theme)));

    expect(worlds).toEqual(new Set(["editorial", "terminal"]));

    for (const demoTheme of used) {
      expect(lookThemes, "a demo theme must be one of the F-06 looks").toContain(demoTheme);
    }

    expect(used.size).toBeGreaterThanOrEqual(6);
  });

  it("AC-9 varies the section order, so the seed is not ten copies of one design", () => {
    const orders = new Set(
      DEMO_PORTFOLIOS.map((portfolio) =>
        portfolio.design.sections.map((section) => section.id).join(","),
      ),
    );

    expect(orders.size).toBeGreaterThanOrEqual(3);
  });

  it("AC-3 lists only skills from the seeded skill table", () => {
    const unknown = allSkillSlugs.filter((slug) => !seedSlugs.has(slug));

    expect(unknown).toEqual([]);
  });

  it("AC-3 gives at least four skills to three or more people", () => {
    const counts = new Map<string, number>();

    for (const slug of allSkillSlugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    const popular = [...counts.values()].filter((count) => count >= 3);

    expect(popular.length).toBeGreaterThanOrEqual(4);
  });

  it("AC-2 gives react, reactjs and js something to find", () => {
    const counts = new Map<string, number>();

    for (const slug of allSkillSlugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    expect(counts.get("react")).toBeGreaterThanOrEqual(3);
    expect(counts.get("javascript")).toBeGreaterThanOrEqual(2);
  });

  it("AC-9 keeps the demo people free of images", () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      for (const project of portfolio.content.projects.items) {
        expect(project.imageUrl).toBeUndefined();
      }
    }
  });
});

describe("the generated SQL", () => {
  it("AC-9 writes ten users and ten published rows", () => {
    const sql = buildDemoSeedSql();

    expect(sql.match(/^ {2}\('d0000000-/gm)).toHaveLength(20);
    expect(sql).toContain("insert into auth.users");
    expect(sql).toContain("insert into public.published_portfolios");
    expect(sql).toContain("on conflict (user_id) do update");
  });

  it("AC-9 makes every demo user unable to log in", () => {
    const sql = buildDemoSeedSql();

    expect(sql).toContain("'', now(), now(), now()");
    expect(sql).not.toContain("encrypted_password = ");
    for (const username of DEMO_USERNAMES) {
      expect(sql).toContain(`${username}@${DEMO_EMAIL_DOMAIN}`);
    }
  });

  it("AC-9 escapes an apostrophe rather than ending the string", () => {
    const sql = buildDemoSeedSql();

    expect(sql).toContain("monolith''s");
    expect(sql).not.toContain("monolith's");
  });

  it("AC-9 removes exactly the demo users, in dependency order", () => {
    const sql = buildDemoRemovalSql();
    const order = ["published_portfolios", "portfolios", "profiles", "auth.users"].map((table) =>
      sql.indexOf(`delete from ${table.startsWith("auth") ? table : `public.${table}`}`),
    );

    expect(order.every((index) => index > -1)).toBe(true);
    expect([...order].sort((left, right) => left - right)).toEqual(order);

    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(sql).toContain(portfolio.id);
    }
  });

  it("AC-9 throws instead of writing SQL the schema would refuse", () => {
    const broken = [
      {
        ...DEMO_PORTFOLIOS[0]!,
        design: { ...DEMO_PORTFOLIOS[0]!.design, world: "editorial " },
      },
    ] as unknown as DemoPortfolio[];

    expect(() => buildDemoSeedSql(broken)).toThrow(/does not pass the F-02 validators/);
  });
});

describe("the committed files", () => {
  it("AC-9 match what the generator writes today", () => {
    expect(seedSql).toBe(buildDemoSeedSql());
    expect(removalSql).toBe(buildDemoRemovalSql());
  });
});
