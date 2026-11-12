import { describe, expect, it } from "vitest";

import type { Skill, SkillAlias } from "@/editor/skills";

import { planQuery, resolveQuerySkills, splitSections } from "../resolve";

const skills: Skill[] = [
  { slug: "react", name: "React" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "python", name: "Python" },
];

const aliases: SkillAlias[] = [
  { alias: "reactjs", skillSlug: "react" },
  { alias: "react.js", skillSlug: "react" },
  { alias: "js", skillSlug: "javascript" },
  { alias: "ts", skillSlug: "typescript" },
];

const plan = (q: string | null, skill: string | null = null) =>
  planQuery({ q, skill, page: 1 }, skills, aliases);

describe("resolveQuerySkills", () => {
  it("AC-3 resolves a skill name to its slug", () => {
    expect(resolveQuerySkills("react", ["react"], skills, aliases)).toEqual(["react"]);
  });

  it("AC-3 resolves an alias to its canonical skill", () => {
    expect(resolveQuerySkills("ReactJS", ["reactjs"], skills, aliases)).toEqual(["react"]);
  });

  it("AC-2 treats React, ReactJS and react.js as the same skill", () => {
    const fromName = resolveQuerySkills("React", ["react"], skills, aliases);
    const fromAlias = resolveQuerySkills("ReactJS", ["reactjs"], skills, aliases);
    const fromDotted = resolveQuerySkills("react.js", ["react", "js"], skills, aliases);

    expect(fromAlias).toEqual(fromName);
    expect(fromDotted).toEqual(fromName);
  });

  it("AC-3 resolves a skill whose name contains a space", () => {
    const spaced: Skill[] = [...skills, { slug: "react-native", name: "React Native" }];

    expect(resolveQuerySkills("React Native", ["react", "native"], spaced, aliases)).toEqual([
      "react-native",
    ]);
  });

  it("AC-3 resolves each term that names a skill and drops the rest", () => {
    expect(resolveQuerySkills("react developer", ["react", "developer"], skills, aliases)).toEqual([
      "react",
    ]);
    expect(resolveQuerySkills("react python", ["react", "python"], skills, aliases)).toEqual([
      "react",
      "python",
    ]);
  });

  it("AC-3 answers no skills for a name", () => {
    expect(resolveQuerySkills("Sara Ahmed", ["sara", "ahmed"], skills, aliases)).toEqual([]);
  });

  it("AC-3 lists each skill once", () => {
    expect(resolveQuerySkills("react ReactJS", ["react", "reactjs"], skills, aliases)).toEqual([
      "react",
    ]);
  });
});

describe("planQuery", () => {
  it("AC-8 plans nothing for an empty search", () => {
    expect(plan(null)).toEqual({ kind: "none" });
  });

  it("AC-8 plans nothing for a query that is only punctuation", () => {
    expect(plan("!!!")).toEqual({ kind: "none" });
  });

  it("AC-3 plans a skill section when the text names a skill", () => {
    expect(plan("ReactJS")).toEqual({
      kind: "text",
      terms: ["reactjs"],
      slugs: ["react"],
    });
  });

  it("AC-3 plans a name-only search when the text names no skill", () => {
    expect(plan("Sara")).toEqual({ kind: "text", terms: ["sara"], slugs: [] });
  });

  it("AC-5 plans a skill search from the skill parameter alone", () => {
    expect(plan(null, "react")).toEqual({ kind: "skill", slugs: ["react"] });
  });

  it("AC-5 keeps the text out of a skill search, so the section shows the skill", () => {
    expect(plan("Sara", "react")).toEqual({ kind: "skill", slugs: ["react"] });
  });

  it("AC-5 ignores the query when only the skill parameter is set", () => {
    expect(plan("   ", "react")).toEqual({ kind: "skill", slugs: ["react"] });
  });
});

describe("splitSections", () => {
  it("AC-11 asks for no section when there is no query", () => {
    expect(splitSections(plan(null))).toEqual([]);
  });

  it("AC-5 asks for the skill section alone for a skill link", () => {
    expect(splitSections(plan(null, "react"))).toEqual([{ kind: "skill", slugs: ["react"] }]);
  });

  it("AC-5 asks for both sections when the text names a skill", () => {
    expect(splitSections(plan("ReactJS"))).toEqual([
      { kind: "skill", slugs: ["react"] },
      { kind: "name", terms: ["reactjs"] },
    ]);
  });

  it("AC-3 asks for the name section alone when the text names no skill", () => {
    expect(splitSections(plan("Sara Ahmed"))).toEqual([
      { kind: "name", terms: ["sara", "ahmed"] },
    ]);
  });

  it("AC-5 asks for the skill section first, so a match reads before the rest", () => {
    const sections = splitSections(plan("react python"));

    expect(sections.map((section) => section.kind)).toEqual(["skill", "name"]);
    expect(sections[0]).toEqual({ kind: "skill", slugs: ["react", "python"] });
  });
});
