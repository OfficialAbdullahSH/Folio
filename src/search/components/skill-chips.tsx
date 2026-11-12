import Link from "next/link";

import type { SkillNames } from "@/render/types";

import type { PopularSkill } from "../data";
import { searchHref } from "../query";

/**
 * The skills the published portfolios actually list, most common first (AC-5).
 *
 * The count sits beside the name so a chip says what it leads to, and the link's
 * accessible name carries the same words rather than leaving the number to be read
 * on its own.
 */
export function SkillChips({
  label,
  skills,
  skillNames,
}: {
  label: string;
  skills: PopularSkill[];
  skillNames: SkillNames;
}) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {skills.map(({ slug, count }) => {
        const name = skillNames[slug] ?? slug;

        return (
          <li key={slug}>
            <Link
              href={searchHref({ q: null, skill: slug, page: 1 })}
              aria-label={`${name}, ${count} ${count === 1 ? "portfolio" : "portfolios"}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule-strong bg-panel px-4 text-sm text-ink transition-colors motion-reduce:transition-none hover:bg-canvas active:bg-rule focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
            >
              <span dir="auto">{name}</span>
              <span aria-hidden="true" className="tabular-nums text-xs text-ink-soft">
                {count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
