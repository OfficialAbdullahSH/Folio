import { createClient } from "@supabase/supabase-js";

import { readSupabaseConfig } from "@/lib/supabase/config";
import {
  createPublishedPortfolioSource,
  createPublishedSkillCatalog,
  type PublishedReader,
  type SkillReader,
} from "@/publish/source";
import type { PortfolioSource, SkillCatalog } from "@/render/types";

import { fixturePortfolioSource, fixtureSkillCatalog } from "./fixtures/source";

/**
 * The one seam the public route reads through (D-036, D-084).
 *
 * With Supabase configured, portfolios and skill names come from
 * `published_portfolios` and `skills` with the anon key and no cookies: the public
 * page never reads a draft and never depends on who is asking. Without a database —
 * a bare build, a test run — the demo fixtures answer instead.
 */
function publishedSources(): { portfolioSource: PortfolioSource; skillCatalog: SkillCatalog } {
  const config = readSupabaseConfig();

  if (config === null) {
    return { portfolioSource: fixturePortfolioSource, skillCatalog: fixtureSkillCatalog };
  }

  const client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return {
    portfolioSource: createPublishedPortfolioSource(
      client as unknown as PublishedReader,
      fixturePortfolioSource,
    ),
    skillCatalog: createPublishedSkillCatalog(
      client as unknown as SkillReader,
      fixtureSkillCatalog,
    ),
  };
}

const sources = publishedSources();

export const portfolioSource: PortfolioSource = sources.portfolioSource;
export const skillCatalog: SkillCatalog = sources.skillCatalog;
