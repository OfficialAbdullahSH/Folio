import { usernameSchema, validateContent, validateDesign, validateProfile } from "@/schema";
import type { ValidationIssue } from "@/schema";

import type { PortfolioRecord, PortfolioSource, SkillCatalog, SkillNames } from "./types";

export type PortfolioLoadResult =
  | { status: "ok"; portfolio: PortfolioRecord; skills: SkillNames }
  | { status: "not-found" };

const notFound = (): PortfolioLoadResult => ({ status: "not-found" });

function normalizeUsername(rawUsername: string): string | null {
  try {
    return decodeURIComponent(rawUsername).trim().toLowerCase();
  } catch {
    return null;
  }
}

function reject(username: string, scope: string, errors: ValidationIssue[]): PortfolioLoadResult {
  console.error(`[folio] invalid ${scope} data for "${username}"`, errors);
  return notFound();
}

export async function loadPortfolio(
  rawUsername: string,
  source: PortfolioSource,
  catalog: SkillCatalog,
): Promise<PortfolioLoadResult> {
  const username = normalizeUsername(rawUsername);

  if (username === null) {
    return notFound();
  }

  const parsedUsername = usernameSchema.safeParse(username);

  if (!parsedUsername.success) {
    return notFound();
  }

  const record = await source.getPortfolio(parsedUsername.data);

  if (record === null) {
    return notFound();
  }

  const profile = validateProfile(record.profile);

  if (!profile.success) {
    return reject(parsedUsername.data, "profile", profile.errors);
  }

  const design = validateDesign(record.design);

  if (!design.success) {
    return reject(parsedUsername.data, "design", design.errors);
  }

  const content = validateContent(record.content);

  if (!content.success) {
    return reject(parsedUsername.data, "content", content.errors);
  }

  const skills = await catalog.resolve(content.data.skills.skillIds);

  return {
    status: "ok",
    portfolio: { profile: profile.data, design: design.data, content: content.data },
    skills,
  };
}
