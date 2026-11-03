import type { Metadata } from "next";

import { portfolioSource, skillCatalog } from "@/data";
import { loadPortfolio } from "@/render/load";

import { PortfolioContent } from "./portfolio-content";

export const instant = false;

type PublicPortfolioPageProps = {
  params: Promise<{ username: string }>;
};

const SITE_NAME = "Folio";

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await loadPortfolio(username, portfolioSource, skillCatalog);

  if (result.status !== "ok") {
    return {
      title: `Portfolio not found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const { displayName, headline } = result.portfolio.profile;
  const title = `${displayName} | ${SITE_NAME}`;
  const description = headline.trim().length > 0 ? headline : `${displayName} on ${SITE_NAME}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    robots: { index: true, follow: true },
  };
}

export default function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  return <PortfolioContent params={params} />;
}
