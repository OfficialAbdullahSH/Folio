import Link from "next/link";

import type { SkillNames } from "@/render/types";

import type { SearchResult } from "../data";
import { searchHref } from "../query";

/**
 * One person in the results (AC-7).
 *
 * The card is a list item, not a link: the name links to the portfolio and each
 * skill links to that skill's search, and a link inside a link is not a control a
 * keyboard user can use. The accent is the colour the owner chose, so it is a real
 * part of the result rather than decoration; it is hidden from assistive technology
 * because it carries no information on its own.
 */
export function ResultCard({
  result,
  skillNames,
}: {
  result: SearchResult;
  skillNames: SkillNames;
}) {
  const skills = result.skillSlugs.slice(0, 6);

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-rule bg-panel p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-base font-semibold text-ink">
            <Link
              href={`/u/${result.username}`}
              className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel focus-visible:outline-none"
            >
              <span dir="auto">{result.displayName}</span>
            </Link>
          </h3>
          {result.headline.length > 0 ? (
            <p className="line-clamp-2 text-sm text-ink-soft" dir="auto">
              {result.headline}
            </p>
          ) : null}
        </div>
        {result.accent !== null ? (
          <span
            aria-hidden="true"
            className="mt-1.5 size-3 shrink-0 rounded-full ring-1 ring-rule"
            style={{ backgroundColor: result.accent }}
          />
        ) : null}
      </div>

      {skills.length > 0 ? (
        <ul className="flex flex-wrap gap-1" aria-label={`Skills listed by ${result.displayName}`}>
          {skills.map((slug) => (
            <li key={slug}>
              <Link
                href={searchHref({ q: null, skill: slug, page: 1 })}
                className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 text-sm text-ink-soft transition-colors motion-reduce:transition-none hover:border-rule-strong hover:text-ink focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel focus-visible:outline-none"
              >
                <span dir="auto">{skillNames[slug] ?? slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
