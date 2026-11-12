/**
 * A search query, before it reaches the database (D-090).
 *
 * The page takes three parameters, `q`, `skill` and `page`, and none of them can
 * be trusted. This module turns them into the shape the SQL functions take: a
 * list of words, a skill slug, and an offset. Everything here is pure, so every
 * rule is tested with no browser and no database.
 */

import { z } from "zod";

import { LIMITS, SKILL_SLUG_PATTERN } from "@/schema/constants";

export const SEARCH_PAGE_SIZE = 12;

/** Longer than any name, headline or skill a person would type. */
export const SEARCH_QUERY_MAX = 100;

/**
 * A word is a letter or a digit followed by more letters, digits or combining
 * marks. Starting on a letter or a digit is what keeps a stray diacritic from
 * becoming a word of its own.
 */
const WORD = /[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu;

/** Diacritics, dropped so a search for محمد finds محمد. */
const COMBINING_MARK = /\p{M}/gu;

/**
 * The words in a query, lowercased and de-duplicated.
 *
 * Only letters and digits survive, which is what makes the result safe to hand
 * to `to_tsquery`: no `&`, `|`, `!`, `:` or quote can reach the parser. Arabic
 * letters are letters, so they survive too, and their diacritics are dropped on
 * both sides of the comparison.
 */
export function cleanTerms(input: string): string[] {
  const words = input.normalize("NFC").match(WORD) ?? [];
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const word of words) {
    const term = word.replace(COMBINING_MARK, "").toLowerCase();

    if (term.length > 0 && !seen.has(term)) {
      seen.add(term);
      terms.push(term);
    }
  }

  return terms;
}

const querySchema = z
  .string()
  .trim()
  .max(SEARCH_QUERY_MAX)
  .nullish()
  .transform((value) => (value === undefined || value === null || value.length === 0 ? null : value))
  .catch(null);

const skillSchema = z
  .string()
  .max(LIMITS.skillSlug)
  .regex(SKILL_SLUG_PATTERN)
  .nullish()
  .transform((value) => (value === undefined || value === null || value.length === 0 ? null : value))
  .catch(null);

/**
 * A page number from the URL. Anything that is not a whole number at least 1 is
 * page 1: an invalid value is ignored rather than reported, because a broken
 * link should still show a search page.
 */
const pageSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(1_000_000)
  .nullish()
  .transform((value) => (value === undefined || value === null ? 1 : value))
  .catch(1);

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type SearchParams = {
  q: string | null;
  skill: string | null;
  page: number;
};

export function parseSearchParams(raw: RawSearchParams): SearchParams {
  return {
    q: querySchema.parse(raw.q),
    skill: skillSchema.parse(raw.skill),
    page: pageSchema.parse(raw.page),
  };
}

/** The row number the database should start at. Page 1 starts at 0. */
export function pageOffset(page: number): number {
  return (Math.max(1, page) - 1) * SEARCH_PAGE_SIZE;
}

/** The last page number for a result count. No results still counts as one page. */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
}

/** A page past the end shows the last page rather than an empty one. */
export function clampPage(page: number, total: number): number {
  return Math.min(Math.max(1, page), pageCount(total));
}

/**
 * The address of a search page, keeping the query and the skill.
 *
 * The page defaults to the one in `params`, so a caller that only links back to
 * what it was given passes nothing. Page one has no `page` parameter, so a link to
 * the start of a search is the same address the form produces.
 */
export function searchHref(params: SearchParams, page: number = params.page): string {
  const search = new URLSearchParams();

  if (params.q !== null) {
    search.set("q", params.q);
  }

  if (params.skill !== null) {
    search.set("skill", params.skill);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  const query = search.toString();

  return query.length === 0 ? "/search" : `/search?${query}`;
}
