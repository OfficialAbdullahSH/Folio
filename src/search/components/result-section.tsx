import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { SkillNames } from "@/render/types";

import type { SearchSection } from "../data";
import { pageCount, searchHref, type SearchParams } from "../query";
import { ResultCard } from "./result-card";

const LINK =
  "inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium text-ink transition-colors motion-reduce:transition-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none";

/**
 * One result list with its count and its own pagination (AC-8).
 *
 * Both lists on a page share one `page` parameter, so each section paginates on its
 * own total and shows controls only when it has more than one page. A section with
 * a single page therefore says nothing about pages at all.
 */
export function ResultSection({
  id,
  title,
  description,
  params,
  section,
  skillNames,
}: {
  id: string;
  title: string;
  description?: string;
  params: SearchParams;
  section: SearchSection;
  skillNames: SkillNames;
}) {
  const pages = pageCount(section.total);
  const count = `${section.total} ${section.total === 1 ? "person" : "people"}`;

  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={id} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="text-sm tabular-nums text-ink-soft">{count}</p>
      </div>

      {description !== undefined ? (
        <p className="-mt-2 max-w-prose text-sm text-ink-soft">{description}</p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {section.rows.map((result) => (
          <ResultCard key={result.username} result={result} skillNames={skillNames} />
        ))}
      </ul>

      {pages > 1 ? (
        <nav
          aria-label={`Pages of ${title}`}
          className="flex items-center justify-between gap-4 border-t border-rule pt-4"
        >
          {section.page > 1 ? (
            <Link href={searchHref(params, section.page - 1)} rel="prev" className={LINK}>
              <ChevronLeft aria-hidden="true" size={16} />
              Previous
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          <p className="text-sm tabular-nums text-ink-soft">
            Page {section.page} of {pages}
          </p>

          {section.page < pages ? (
            <Link href={searchHref(params, section.page + 1)} rel="next" className={LINK}>
              Next
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </section>
  );
}
