import type { PortfolioRecord, PortfolioSource, SkillCatalog, SkillNames } from "@/render/types";

/**
 * The public read path (D-084).
 *
 * Reads only `published_portfolios`, which is the one table with a public read
 * policy (D-053), with the anon key and no cookies. A demo fixture is the fallback
 * so the sample pages keep working on a deployment with no database, and a real
 * published row always wins over a demo with the same name.
 *
 * Nothing here validates: `loadPortfolio` already validates what a source returns
 * and turns anything invalid into the standard 404 (D-040).
 */

export type PublishedRow = {
  username: unknown;
  display_name: unknown;
  headline: unknown;
  design: unknown;
  content: unknown;
};

export type PublishedReader = {
  from(table: "published_portfolios"): {
    select(columns: "username, display_name, headline, design, content"): {
      eq(
        column: "username",
        value: string,
      ): {
        maybeSingle(): PromiseLike<{
          data: PublishedRow | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type SkillReader = {
  from(table: "skills"): {
    select(columns: "slug, name"): {
      in(
        column: "slug",
        value: string[],
      ): PromiseLike<{
        data: { slug: string; name: string }[] | null;
        error: { message: string } | null;
      }>;
    };
  };
};

const asText = (value: unknown): string => (typeof value === "string" ? value : "");

export function createPublishedPortfolioSource(
  reader: PublishedReader,
  fallback: PortfolioSource,
): PortfolioSource {
  return {
    async getPortfolio(username: string): Promise<PortfolioRecord | null> {
      const key = username.trim().toLowerCase();

      const { data, error } = await reader
        .from("published_portfolios")
        .select("username, display_name, headline, design, content")
        .eq("username", key)
        .maybeSingle();

      if (error !== null) {
        console.error("[folio] could not read the published portfolio", error.message);

        return fallback.getPortfolio(key);
      }

      if (data === null) {
        return fallback.getPortfolio(key);
      }

      return {
        profile: {
          username: asText(data.username) || key,
          displayName: asText(data.display_name),
          headline: asText(data.headline),
        },
        design: data.design,
        content: data.content,
      } as PortfolioRecord;
    },
  };
}

export function createPublishedSkillCatalog(
  reader: SkillReader,
  fallback: SkillCatalog,
): SkillCatalog {
  return {
    async resolve(slugs: readonly string[]): Promise<SkillNames> {
      if (slugs.length === 0) {
        return {};
      }

      const { data, error } = await reader
        .from("skills")
        .select("slug, name")
        .in("slug", [...slugs]);

      if (error !== null || data === null) {
        console.error(
          "[folio] could not read the skill names",
          error?.message ?? "no rows returned",
        );

        return fallback.resolve(slugs);
      }

      const names: SkillNames = {};

      for (const row of data) {
        names[row.slug] = row.name;
      }

      const missing = slugs.filter((slug) => names[slug] === undefined);

      if (missing.length === 0) {
        return names;
      }

      return { ...(await fallback.resolve(missing)), ...names };
    },
  };
}
