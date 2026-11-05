import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LIMITS, SKILL_SLUG_PATTERN } from "@/schema";

/**
 * The seed is SQL, not TypeScript, so the rules it promises are checked by reading
 * it. Without this the only thing keeping the data canonical would be care.
 */

const sql = readFileSync(
  new URL("../../../supabase/seed/skills.sql", import.meta.url),
  "utf8",
);

const ALIAS_PATTERN = /^[a-z0-9._-]{1,60}$/;

function block(marker: string): string {
  const start = sql.indexOf(marker);

  expect(start, `the seed is missing "${marker}"`).toBeGreaterThan(-1);

  const end = sql.indexOf(";", start);

  return sql.slice(start, end);
}

function pairs(text: string): [string, string][] {
  return [...text.matchAll(/\('([^']*)',\s*'([^']*)'\)/g)].map((match) => [
    match[1]!,
    match[2]!,
  ]);
}

const skills = pairs(block("insert into public.skills"));
const aliases = pairs(block("insert into public.skill_aliases"));

const slugs = new Set(skills.map(([slug]) => slug));

describe("skills seed", () => {
  it("AC-1 defines a usable number of skills", () => {
    expect(skills.length).toBeGreaterThanOrEqual(80);
  });

  it("AC-1 gives every skill a slug the schema accepts", () => {
    for (const [slug] of skills) {
      expect(slug).toMatch(SKILL_SLUG_PATTERN);
      expect(slug.length).toBeLessThanOrEqual(LIMITS.skillSlug);
    }
  });

  it("AC-1 gives every skill a name that is not blank", () => {
    for (const [slug, name] of skills) {
      expect(name.trim(), slug).not.toBe("");
      expect(name.length).toBeLessThanOrEqual(80);
    }
  });

  it("AC-1 defines each skill once", () => {
    expect(slugs.size).toBe(skills.length);
  });

  it("AC-1 gives every alias a lowercase slug-shaped value", () => {
    for (const [alias] of aliases) {
      expect(alias).toMatch(ALIAS_PATTERN);
      expect(alias).toBe(alias.toLowerCase());
    }
  });

  it("AC-1 defines each alias once", () => {
    const seen = new Set(aliases.map(([alias]) => alias));

    expect(seen.size).toBe(aliases.length);
  });

  it("AC-1 points every alias at a skill defined in the same file", () => {
    const missing = aliases.filter(([, slug]) => !slugs.has(slug));

    expect(missing).toEqual([]);
  });

  it("AC-1 never lets an alias equal a skill slug", () => {
    const collisions = aliases.filter(([alias]) => slugs.has(alias));

    expect(collisions).toEqual([]);
  });

  it("AC-1 keeps the canonical spelling the schema and the renderer expect", () => {
    const bySlug = new Map(skills);
    const byAlias = new Map(aliases);

    expect(bySlug.get("react")).toBe("React");
    expect(bySlug.get("typescript")).toBe("TypeScript");
    expect(byAlias.get("reactjs")).toBe("react");
    expect(byAlias.get("react.js")).toBe("react");
    expect(byAlias.get("ts")).toBe("typescript");
    expect(byAlias.get("postgres")).toBe("postgresql");
  });

  it("AC-1 can be run twice without creating a duplicate row", () => {
    expect(block("insert into public.skills")).toContain("on conflict (slug) do update");
    expect(block("insert into public.skill_aliases")).toContain(
      "on conflict (alias) do update",
    );
  });
});
