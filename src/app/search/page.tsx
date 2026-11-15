import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { ResultSection } from "@/search/components/result-section";
import { SearchBox } from "@/search/components/search-box";
import { NoMatches, NothingPublished, SearchFailed } from "@/search/components/search-states";
import { SkillChips } from "@/search/components/skill-chips";
import {
  loadPopularSkills,
  loadSection,
  loadSkillCatalog,
  searchSource,
  type PopularSkill,
  type SearchSection,
} from "@/search/data";
import { parseSearchParams, searchHref, type RawSearchParams, type SearchParams } from "@/search/query";
import { planQuery, splitSections, type QueryPlan } from "@/search/resolve";
import type { Skill, SkillAlias } from "@/editor/skills";

// Publish and unpublish change the table this page reads, and search keeps no copy
// of its own, so every request asks the database (AC-10, D-085).
export const instant = false;

const POPULAR_LIMIT = 8;

type SearchPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = parseSearchParams(await searchParams);
  const filtered = params.q !== null || params.skill !== null;

  return {
    title: "Search | Folio",
    description: "Find people by name, or by the skills they list.",
    robots: { index: !filtered, follow: true },
  };
}

type LoadedSection = {
  id: string;
  title: string;
  description?: string;
  section: SearchSection;
};

type SectionsOutcome =
  | { status: "ok"; sections: LoadedSection[] }
  | { status: "failed"; message: string }
  | { status: "unavailable" };

const nameFor = (skillNames: Record<string, string>, slug: string): string =>
  skillNames[slug] ?? slug;

/**
 * Which lists to show and what they are called (AC-5).
 *
 * A free-text query that names a skill shows that skill's people first and then the
 * name matches, and the name list is dropped when it is empty: repeating "0 people"
 * under a full list reads like an error.
 */
async function loadSections(
  plan: QueryPlan,
  params: SearchParams,
  skillNames: Record<string, string>,
): Promise<SectionsOutcome> {
  if (plan.kind === "none") {
    const newest = await loadSection(searchSource, { kind: "name", terms: [] }, params.page);

    if (newest.status !== "ok") {
      return newest;
    }

    return {
      status: "ok",
      sections: [
        {
          id: "newest",
          title: "Newest portfolios",
          description: "The most recently published portfolios.",
          section: newest.section,
        },
      ],
    };
  }

  const requests = splitSections(plan);
  const outcomes = await Promise.all(
    requests.map((request) => loadSection(searchSource, request, params.page)),
  );

  const sections: LoadedSection[] = [];

  for (const [index, outcome] of outcomes.entries()) {
    if (outcome.status !== "ok") {
      return outcome;
    }

    const request = requests[index];

    if (request === undefined) {
      continue;
    }

    if (request.kind === "skill") {
      const names = request.slugs.map((slug) => nameFor(skillNames, slug));

      sections.push({
        id: "skill",
        title: "People with this skill",
        description: `Published portfolios that list ${names.join(", ")}.`,
        section: outcome.section,
      });

      continue;
    }
    sections.push({
      id: "name",
      title: "People matching the name",
      section: outcome.section,
    });
  }

  const withResults = sections.filter((entry) => entry.section.total > 0);

  return { status: "ok", sections: withResults.length > 0 ? withResults : sections };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = parseSearchParams(await searchParams);

  const [catalog, popularOutcome] = await Promise.all([
    loadSkillCatalog(searchSource),
    loadPopularSkills(searchSource, POPULAR_LIMIT),
  ]);

  const skills: Skill[] = catalog.skills;
  const aliases: SkillAlias[] = catalog.aliases;
  const popular: PopularSkill[] = popularOutcome.status === "ok" ? popularOutcome.skills : [];
  const skillNames: Record<string, string> = {};

  for (const skill of skills) {
    skillNames[skill.slug] = skill.name;
  }

  const plan = planQuery(params, skills, aliases);
  const outcome = await loadSections(plan, params, skillNames);

  const initialQuery =
    params.q ?? (params.skill !== null ? nameFor(skillNames, params.skill) : "");
  const total =
    outcome.status === "ok"
      ? outcome.sections.reduce((sum, entry) => sum + entry.section.total, 0)
      : 0;

  return (
    <AppShell header={<AppHeader />}>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 sm:py-14"
      >
        <header className="flex flex-col gap-6 border-b border-rule pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Search</h1>
            <p className="max-w-prose text-ink-soft">
              Find people by name, or by the skills they list. Every portfolio here is
              published.
            </p>
          </div>

          <SearchBox
            key={initialQuery}
            skills={skills}
            aliases={aliases}
            initialQuery={initialQuery}
          />
        </header>

        {outcome.status === "failed" || outcome.status === "unavailable" ? (
          <SearchFailed retryHref={searchHref(params)} />
        ) : null}

        {outcome.status === "ok" && total === 0 ? (
          plan.kind === "none" ? (
            <NothingPublished />
          ) : (
            <NoMatches
              query={params.q ?? nameFor(skillNames, params.skill ?? "")}
              popular={popular}
              skillNames={skillNames}
            />
          )
        ) : null}

        {outcome.status === "ok" && total > 0 ? (
          <div className="flex flex-col gap-10">
            {plan.kind === "none" && popular.length > 0 ? (
              <section aria-labelledby="popular-skills" className="flex flex-col gap-3">
                <h2 id="popular-skills" className="text-lg font-semibold text-ink">
                  Popular skills
                </h2>
                <SkillChips
                  label="Popular skills"
                  skills={popular}
                  skillNames={skillNames}
                />
              </section>
            ) : null}

            {outcome.sections.map((entry) => (
              <ResultSection
                key={entry.id}
                id={entry.id}
                title={entry.title}
                description={entry.description}
                params={params}
                section={entry.section}
                skillNames={skillNames}
              />
            ))}
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
