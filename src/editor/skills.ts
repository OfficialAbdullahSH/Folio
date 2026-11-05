/**
 * The skill picker's search (D-063, D-064).
 *
 * The whole list is loaded once with the page and filtered here, so typing never
 * waits on the network. Matching by alias is what lets someone find `react` by
 * typing "ReactJS"; the canonical slug is always what gets stored (D-033).
 */

export type Skill = {
  slug: string;
  name: string;
};

export type SkillAlias = {
  alias: string;
  skillSlug: string;
};

type Indexed = {
  skill: Skill;
  /** Lowercased name, slug and every alias, for prefix and substring matches. */
  terms: string[];
};

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function indexSkills(skills: readonly Skill[], aliases: readonly SkillAlias[]): Indexed[] {
  const aliasesBySkill = new Map<string, string[]>();

  for (const { alias, skillSlug } of aliases) {
    const list = aliasesBySkill.get(skillSlug);

    if (list === undefined) {
      aliasesBySkill.set(skillSlug, [normalise(alias)]);
    } else {
      list.push(normalise(alias));
    }
  }

  return skills.map((skill) => ({
    skill,
    terms: [normalise(skill.name), skill.slug, ...(aliasesBySkill.get(skill.slug) ?? [])],
  }));
}

/**
 * 0 for an exact match on a name, slug or alias, 1 for a prefix, 2 for a match
 * anywhere in the word. `null` means no match.
 */
function score(entry: Indexed, query: string): number | null {
  let best: number | null = null;

  for (const term of entry.terms) {
    const rank = term === query ? 0 : term.startsWith(query) ? 1 : term.includes(query) ? 2 : null;

    if (rank !== null && (best === null || rank < best)) {
      best = rank;
    }
  }

  return best;
}

/**
 * Skills matching `query`, best match first. An empty query returns the whole
 * list, so the picker can show what there is before anyone types.
 */
export function searchSkills(
  skills: readonly Skill[],
  aliases: readonly SkillAlias[],
  query: string,
): Skill[] {
  const needle = normalise(query);

  if (needle.length === 0) {
    return [...skills];
  }

  const scored: { skill: Skill; rank: number }[] = [];

  for (const entry of indexSkills(skills, aliases)) {
    const rank = score(entry, needle);

    if (rank !== null) {
      scored.push({ skill: entry.skill, rank });
    }
  }

  scored.sort(
    (left, right) =>
      left.rank - right.rank || left.skill.name.localeCompare(right.skill.name),
  );

  return scored.map((entry) => entry.skill);
}

/**
 * The canonical skill for what someone typed, or null.
 *
 * An alias wins over a name, so "ReactJS" selects `react` rather than nothing.
 */
export function resolveSkill(
  skills: readonly Skill[],
  aliases: readonly SkillAlias[],
  input: string,
): Skill | null {
  const needle = normalise(input);

  if (needle.length === 0) {
    return null;
  }

  const alias = aliases.find((entry) => normalise(entry.alias) === needle);

  if (alias !== undefined) {
    return skills.find((skill) => skill.slug === alias.skillSlug) ?? null;
  }

  return (
    skills.find((skill) => skill.slug === needle) ??
    skills.find((skill) => normalise(skill.name) === needle) ??
    null
  );
}
