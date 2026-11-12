/**
 * Search reads published portfolios through two SQL functions (D-088, D-091).
 *
 * The client is the same one the public page uses: the anon key, no cookies, no
 * privileged key, so the published-read policy on `published_portfolios` is the
 * only thing deciding what can come back. Nothing here throws at the page: every
 * call answers `ok`, `failed` or `unavailable`, and the page turns the last two
 * into a designed message rather than an error page.
 */

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Skill, SkillAlias } from "@/editor/skills";
import { readSupabaseConfig } from "@/lib/supabase/config";

import { SEARCH_PAGE_SIZE, clampPage, pageOffset } from "./query";
import type { SectionRequest } from "./resolve";

export type SearchResult = {
  username: string;
  displayName: string;
  headline: string;
  skillSlugs: string[];
  accent: string | null;
  publishedAt: string;
};

export type SearchQuery = {
  terms: string[];
  slugs: string[];
  limit: number;
  offset: number;
};

export type SearchOutcome =
  | { status: "ok"; rows: SearchResult[]; total: number }
  | { status: "failed"; message: string }
  | { status: "unavailable" };

export type PopularSkill = {
  slug: string;
  count: number;
};

export type PopularSkillsOutcome =
  | { status: "ok"; skills: PopularSkill[] }
  | { status: "failed"; message: string }
  | { status: "unavailable" };

export type SkillCatalogData = {
  skills: Skill[];
  aliases: SkillAlias[];
};

type RpcAnswer = { data: unknown; error: { message: string } | null };

type ListAnswer = {
  data: { slug: string; name: string }[] | null;
  error: { message: string } | null;
};

type AliasAnswer = {
  data: { alias: string; skill_slug: string }[] | null;
  error: { message: string } | null;
};

/** The three calls this module makes, narrowed so a fake is easy to write. */
export type SearchReader = {
  rpc(
    name: "search_portfolios",
    args: {
      p_terms: string[] | null;
      p_skill_slugs: string[] | null;
      p_limit: number;
      p_offset: number;
    },
  ): PromiseLike<RpcAnswer>;
  rpc(name: "popular_skills", args: { p_limit: number }): PromiseLike<RpcAnswer>;
  from(table: "skills"): {
    select(columns: "slug, name"): PromiseLike<ListAnswer>;
  };
  from(table: "skill_aliases"): {
    select(columns: "alias, skill_slug"): PromiseLike<AliasAnswer>;
  };
};

const ACCENT = /^#[0-9a-fA-F]{6}$/;

/**
 * A row as the function returns it. Anything that does not match is dropped
 * rather than rendered, so one bad snapshot cannot break the whole page (S-15).
 */
const rowSchema = z.object({
  username: z.string().trim().min(1),
  display_name: z.string().nullish(),
  headline: z.string().nullish(),
  skill_slugs: z.array(z.string()).nullish(),
  accent: z.string().regex(ACCENT).nullish().catch(null),
  published_at: z.string().min(1),
  total_count: z.coerce.number().int().min(0).catch(0),
});

const popularSchema = z.object({
  slug: z.string().trim().min(1),
  portfolio_count: z.coerce.number().int().min(0),
});

export type ParsedRows = {
  rows: SearchResult[];
  total: number;
};

/**
 * Rows to results, keeping the window count the function attaches to each row.
 *
 * The skill list is capped at six here as well as in the function: the card shows
 * six, and a cap on the read side means a change to the SQL cannot overflow it.
 */
export function parseSearchRows(data: readonly unknown[]): ParsedRows {
  const rows: SearchResult[] = [];
  let total = 0;
  let dropped = 0;

  for (const entry of data) {
    const parsed = rowSchema.safeParse(entry);

    if (!parsed.success) {
      dropped += 1;
      continue;
    }

    total = Math.max(total, parsed.data.total_count);
    rows.push({
      username: parsed.data.username,
      displayName: parsed.data.display_name ?? parsed.data.username,
      headline: parsed.data.headline ?? "",
      skillSlugs: (parsed.data.skill_slugs ?? []).slice(0, 6),
      accent: parsed.data.accent ?? null,
      publishedAt: parsed.data.published_at,
    });
  }

  if (dropped > 0) {
    console.error(`[folio] dropped ${dropped} search rows that did not match the result shape`);
  }

  return { rows, total };
}

export type SearchSource = {
  search(query: SearchQuery): Promise<SearchOutcome>;
  popular(limit: number): Promise<PopularSkillsOutcome>;
  catalog(): Promise<SkillCatalogData>;
};

const asMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "the request failed";

export function createSearchSource(reader: SearchReader | null): SearchSource {
  return {
    async search(query: SearchQuery): Promise<SearchOutcome> {
      if (reader === null) {
        return { status: "unavailable" };
      }

      try {
        const { data, error } = await reader.rpc("search_portfolios", {
          p_terms: query.terms.length > 0 ? query.terms : null,
          p_skill_slugs: query.slugs.length > 0 ? query.slugs : null,
          p_limit: query.limit,
          p_offset: query.offset,
        });

        if (error !== null) {
          console.error("[folio] search_portfolios failed", error.message);

          return { status: "failed", message: error.message };
        }

        if (!Array.isArray(data)) {
          console.error("[folio] search_portfolios answered something that is not a list");

          return { status: "failed", message: "the search function did not answer with a list" };
        }

        const parsed = parseSearchRows(data);

        return { status: "ok", rows: parsed.rows, total: parsed.total };
      } catch (error) {
        console.error("[folio] the search request failed", asMessage(error));

        return { status: "failed", message: asMessage(error) };
      }
    },

    async popular(limit: number): Promise<PopularSkillsOutcome> {
      if (reader === null) {
        return { status: "unavailable" };
      }

      try {
        const { data, error } = await reader.rpc("popular_skills", { p_limit: limit });

        if (error !== null) {
          console.error("[folio] popular_skills failed", error.message);

          return { status: "failed", message: error.message };
        }

        if (!Array.isArray(data)) {
          return { status: "failed", message: "the skill function did not answer with a list" };
        }

        const skills: PopularSkill[] = [];

        for (const entry of data) {
          const parsed = popularSchema.safeParse(entry);

          if (parsed.success) {
            skills.push({ slug: parsed.data.slug, count: parsed.data.portfolio_count });
          }
        }

        return { status: "ok", skills };
      } catch (error) {
        console.error("[folio] the popular skill request failed", asMessage(error));

        return { status: "failed", message: asMessage(error) };
      }
    },

    async catalog(): Promise<SkillCatalogData> {
      if (reader === null) {
        return { skills: [], aliases: [] };
      }

      const [skills, aliases] = await Promise.all([
        reader.from("skills").select("slug, name"),
        reader.from("skill_aliases").select("alias, skill_slug"),
      ]);

      if (skills.error !== null || skills.data === null) {
        console.error(
          "[folio] could not read the skill list for search",
          skills.error?.message ?? "no rows returned",
        );
      }

      if (aliases.error !== null || aliases.data === null) {
        console.error(
          "[folio] could not read the skill aliases for search",
          aliases.error?.message ?? "no rows returned",
        );
      }

      return {
        skills: (skills.data ?? []).map((row) => ({ slug: row.slug, name: row.name })),
        aliases: (aliases.data ?? []).map((row) => ({
          alias: row.alias,
          skillSlug: row.skill_slug,
        })),
      };
    },
  };
}

export type SearchSection = {
  rows: SearchResult[];
  total: number;
  page: number;
};

export type SectionOutcome =
  | { status: "ok"; section: SearchSection }
  | { status: "failed"; message: string }
  | { status: "unavailable" };

function queryFor(request: SectionRequest, page: number): SearchQuery {
  return {
    terms: request.kind === "name" ? request.terms : [],
    slugs: request.kind === "skill" ? request.slugs : [],
    limit: SEARCH_PAGE_SIZE,
    offset: pageOffset(page),
  };
}

/**
 * One result list at the page asked for.
 *
 * A page past the end asks for the count first and then loads the last page, so a
 * hand-edited or stale link still shows results instead of an empty page. A search
 * with no matches never asks twice (AC-8).
 */
export async function loadSection(
  source: SearchSource,
  request: SectionRequest,
  page: number,
): Promise<SectionOutcome> {
  const first = await source.search(queryFor(request, page));

  if (first.status !== "ok") {
    return first;
  }

  if (first.rows.length > 0 || page === 1) {
    return {
      status: "ok",
      section: { rows: first.rows, total: first.total, page: page === 1 ? 1 : page },
    };
  }

  const counted = await source.search({ ...queryFor(request, 1), limit: 1, offset: 0 });

  if (counted.status !== "ok") {
    return counted;
  }

  if (counted.total === 0) {
    return { status: "ok", section: { rows: [], total: 0, page: 1 } };
  }

  const last = clampPage(page, counted.total);
  const lastPage = await source.search(queryFor(request, last));

  if (lastPage.status !== "ok") {
    return lastPage;
  }

  return {
    status: "ok",
    section: { rows: lastPage.rows, total: lastPage.total, page: last },
  };
}

/** The chips an empty search shows. A failure here must not hide the results. */
export async function loadPopularSkills(
  source: SearchSource,
  limit: number,
): Promise<PopularSkillsOutcome> {
  const result = await source.popular(limit);

  if (result.status === "ok") {
    return result;
  }

  return { status: "ok", skills: [] };
}

/** The skill list and aliases for the combobox. Missing data only means no suggestions. */
export async function loadSkillCatalog(source: SearchSource): Promise<SkillCatalogData> {
  return source.catalog();
}

function configuredReader(): SearchReader | null {
  const config = readSupabaseConfig();

  if (config === null) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as unknown as SearchReader;
}

export const searchSource = createSearchSource(configuredReader());
