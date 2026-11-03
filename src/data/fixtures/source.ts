import type {
  PortfolioRecord,
  PortfolioSource,
  SkillCatalog,
  SkillNames,
} from "@/render/types";

import { fixturePortfolios } from "./portfolios";
import { skillCatalog } from "./skills";

export const fixturePortfolioSource: PortfolioSource = {
  async getPortfolio(username: string): Promise<PortfolioRecord | null> {
    return fixturePortfolios[username] ?? null;
  },
};

export const fixtureSkillCatalog: SkillCatalog = {
  async resolve(slugs: readonly string[]): Promise<SkillNames> {
    const names: SkillNames = {};

    for (const slug of slugs) {
      const name = skillCatalog[slug];

      if (name !== undefined) {
        names[slug] = name;
      }
    }

    return names;
  },
};
