import { renderToStaticMarkup } from "react-dom/server";

import { fixturePortfolios } from "@/data/fixtures";
import { skillCatalog } from "@/data/fixtures/skills";
import { Portfolio } from "@/render/Portfolio";
import type { PortfolioRecord, SkillNames } from "@/render/types";

export function record(username = "demo-editorial"): PortfolioRecord {
  return structuredClone(fixturePortfolios[username]);
}

export function skillNames(slugs: readonly string[]): SkillNames {
  const names: SkillNames = {};

  for (const slug of slugs) {
    const name = skillCatalog[slug];

    if (name !== undefined) {
      names[slug] = name;
    }
  }

  return names;
}

export function renderPortfolio(portfolio: PortfolioRecord): string {
  return renderToStaticMarkup(
    <Portfolio
      profile={portfolio.profile}
      design={portfolio.design}
      content={portfolio.content}
      skills={skillNames(portfolio.content.skills.skillIds)}
    />,
  );
}

export function sectionIds(html: string): string[] {
  return [...html.matchAll(/data-section="([a-z]+)"/g)].map((match) => match[1]);
}
