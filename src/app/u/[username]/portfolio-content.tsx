import { notFound } from "next/navigation";

import { portfolioSource, skillCatalog } from "@/data";
import { fontVariableClassName } from "@/render/fonts";
import { loadPortfolio } from "@/render/load";
import { Portfolio } from "@/render/Portfolio";

export type PortfolioContentProps = {
  params: Promise<{ username: string }>;
};

export async function PortfolioContent({ params }: PortfolioContentProps) {
  const { username } = await params;
  const result = await loadPortfolio(username, portfolioSource, skillCatalog);

  if (result.status !== "ok") {
    notFound();
  }

  const { profile, design, content } = result.portfolio;

  return (
    <div className={fontVariableClassName}>
      <Portfolio profile={profile} design={design} content={content} skills={result.skills} />
    </div>
  );
}
