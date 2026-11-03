import type { ContentDocument, DesignDocument, Profile } from "@/schema";

export type PortfolioRecord = {
  profile: Profile;
  design: DesignDocument;
  content: ContentDocument;
};

export type SkillNames = Record<string, string>;

export interface PortfolioSource {
  getPortfolio(username: string): Promise<PortfolioRecord | null>;
}

export interface SkillCatalog {
  resolve(slugs: readonly string[]): Promise<SkillNames>;
}
