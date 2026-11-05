import { describe, expect, it } from "vitest";

import { resolveSkill, searchSkills, type Skill, type SkillAlias } from "../skills";

const skills: Skill[] = [
  { slug: "react", name: "React" },
  { slug: "react-native", name: "React Native" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "postgresql", name: "PostgreSQL" },
  { slug: "python", name: "Python" },
];

const aliases: SkillAlias[] = [
  { alias: "reactjs", skillSlug: "react" },
  { alias: "react.js", skillSlug: "react" },
  { alias: "ts", skillSlug: "typescript" },
  { alias: "js", skillSlug: "javascript" },
  { alias: "next", skillSlug: "nextjs" },
  { alias: "postgres", skillSlug: "postgresql" },
  { alias: "py", skillSlug: "python" },
];

const slugs = (results: Skill[]) => results.map((skill) => skill.slug);

describe("searchSkills", () => {
  it("AC-4 returns the whole list for an empty query", () => {
    expect(searchSkills(skills, aliases, "  ")).toHaveLength(skills.length);
  });

  it("AC-4 finds a skill by its name, ignoring case", () => {
    expect(slugs(searchSkills(skills, aliases, "react"))).toEqual(["react", "react-native"]);
    expect(slugs(searchSkills(skills, aliases, "TYPESCRIPT"))).toEqual(["typescript"]);
  });

  it("AC-4 finds a skill by an alias and returns the canonical skill", () => {
    expect(slugs(searchSkills(skills, aliases, "reactjs"))).toEqual(["react"]);
    expect(slugs(searchSkills(skills, aliases, "postgres"))).toEqual(["postgresql"]);
    expect(slugs(searchSkills(skills, aliases, "py"))).toEqual(["python"]);
  });

  it("AC-4 ranks an exact alias above a longer name that starts the same way", () => {
    expect(slugs(searchSkills(skills, aliases, "next"))[0]).toBe("nextjs");
    expect(slugs(searchSkills(skills, aliases, "js"))[0]).toBe("javascript");
  });

  it("AC-4 matches anywhere in the word, not only at the start", () => {
    expect(slugs(searchSkills(skills, aliases, "script"))).toEqual([
      "javascript",
      "typescript",
    ]);
  });

  it("AC-4 returns nothing for a query nothing matches", () => {
    expect(searchSkills(skills, aliases, "cobol")).toEqual([]);
  });

  it("AC-4 lists each skill once even when a name and an alias both match", () => {
    const results = slugs(searchSkills(skills, aliases, "react"));

    expect(new Set(results).size).toBe(results.length);
  });

  it("AC-4 does not mutate the list it was given", () => {
    const before = [...skills];

    searchSkills(skills, aliases, "react");

    expect(skills).toEqual(before);
  });
});

describe("resolveSkill", () => {
  it("AC-4 resolves an alias to its canonical skill", () => {
    expect(resolveSkill(skills, aliases, "ReactJS")?.slug).toBe("react");
    expect(resolveSkill(skills, aliases, "react.js")?.slug).toBe("react");
    expect(resolveSkill(skills, aliases, "ts")?.slug).toBe("typescript");
  });

  it("AC-4 resolves a slug and a name", () => {
    expect(resolveSkill(skills, aliases, "react-native")?.slug).toBe("react-native");
    expect(resolveSkill(skills, aliases, "PostgreSQL")?.slug).toBe("postgresql");
  });

  it("AC-4 resolves nothing for an unknown word or an empty string", () => {
    expect(resolveSkill(skills, aliases, "cobol")).toBeNull();
    expect(resolveSkill(skills, aliases, "   ")).toBeNull();
  });
});
