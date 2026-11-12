/**
 * What a typed query means (D-092).
 *
 * The alias map lives in `skills` and `skill_aliases`, and the resolver is the
 * one the F-05 picker already uses, so "ReactJS", "react.js" and "react" cannot
 * mean different things in the two places.
 */

import { resolveSkill, type Skill, type SkillAlias } from "@/editor/skills";

import { cleanTerms, type SearchParams } from "./query";

export type QueryPlan =
  | { kind: "none" }
  | { kind: "skill"; slugs: string[] }
  | { kind: "text"; terms: string[]; slugs: string[] };

/**
 * The canonical skill slugs a query names.
 *
 * The whole query is tried first, so "react.js" and "React Native" resolve as
 * the skills they are rather than as two words. Only when the query as a whole
 * names nothing is each word tried, which is what makes "react python" find
 * both and "react developer" find one.
 */
export function resolveQuerySkills(
  query: string,
  terms: readonly string[],
  skills: readonly Skill[],
  aliases: readonly SkillAlias[],
): string[] {
  const whole = resolveSkill(skills, aliases, query);
  const found =
    whole === null
      ? terms
          .map((term) => resolveSkill(skills, aliases, term))
          .filter((skill): skill is Skill => skill !== null)
      : [whole];

  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const skill of found) {
    if (!seen.has(skill.slug)) {
      seen.add(skill.slug);
      slugs.push(skill.slug);
    }
  }

  return slugs;
}

/**
 * Which result sections a request shows.
 *
 * `?skill=` names one skill and shows only that section. Free text shows the
 * skill section when it names a skill, and always shows the name section.
 */
export function planQuery(
  params: SearchParams,
  skills: readonly Skill[],
  aliases: readonly SkillAlias[],
): QueryPlan {
  if (params.skill !== null) {
    return { kind: "skill", slugs: [params.skill] };
  }

  if (params.q === null) {
    return { kind: "none" };
  }

  const terms = cleanTerms(params.q);

  if (terms.length === 0) {
    return { kind: "none" };
  }

  return { kind: "text", terms, slugs: resolveQuerySkills(params.q, terms, skills, aliases) };
}

/**
 * One result list, and how it is looked up.
 *
 * A skill section asks the function for the slugs alone, so it returns exactly
 * the people who list the skill; a name section asks for the words alone, so it
 * can return people whose headline mentions the skill without listing it.
 */
export type SectionRequest =
  | { kind: "skill"; slugs: string[] }
  | { kind: "name"; terms: string[] };

/**
 * The sections a query shows, in reading order (AC-5).
 *
 * A skill section comes first because a skill match is the stronger answer; the
 * name section follows it and is dropped by the page when it is empty and a
 * skill section is already there.
 */
export function splitSections(plan: QueryPlan): SectionRequest[] {
  switch (plan.kind) {
    case "none":
      return [];
    case "skill":
      return [{ kind: "skill", slugs: plan.slugs }];
    case "text":
      return [
        ...(plan.slugs.length > 0 ? [{ kind: "skill" as const, slugs: plan.slugs }] : []),
        { kind: "name", terms: plan.terms },
      ];
  }
}
