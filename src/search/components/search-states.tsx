import Link from "next/link";
import { SearchX } from "lucide-react";

import type { SkillNames } from "@/render/types";

import type { PopularSkill } from "../data";
import { SkillChips } from "./skill-chips";

const PANEL = "flex flex-col gap-3 rounded-lg border border-rule bg-panel p-6";

/**
 * The three designed states besides results (AC-11).
 *
 * Each one says what happened in plain words, offers the next thing to do, and
 * never shows a database message: the technical detail is logged on the server, where
 * an owner can find it, and not put in front of a visitor.
 */
export function NoMatches({
  query,
  popular,
  skillNames,
}: {
  query: string;
  popular: PopularSkill[];
  skillNames: SkillNames;
}) {
  return (
    <section className={PANEL}>
      <div className="flex items-start gap-3">
        <SearchX aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-ink-soft" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-ink">
            No one matches “<span dir="auto">{query}</span>” yet
          </h2>
          <p className="text-sm text-ink-soft">
            Try a shorter word, part of a name, or one of the skills people list most.
          </p>
        </div>
      </div>

      {popular.length > 0 ? (
        <SkillChips label="Popular skills" skills={popular} skillNames={skillNames} />
      ) : null}

      <Link
        href="/search"
        className="w-fit text-sm font-medium text-ink underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
      >
        Clear the search
      </Link>
    </section>
  );
}

export function NothingPublished() {
  return (
    <section className={PANEL}>
      <h2 className="text-lg font-semibold text-ink">Nothing is published yet</h2>
      <p className="max-w-prose text-sm text-ink-soft">
        When someone publishes a portfolio, it appears here, newest first. You can be
        the first.
      </p>
      <Link
        href="/signup"
        className="inline-flex min-h-11 w-fit items-center rounded-md bg-cta px-4 text-sm font-medium text-cta-ink hover:bg-cta/90 focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
      >
        Create an account
      </Link>
    </section>
  );
}

export function SearchFailed({ retryHref }: { retryHref: string }) {
  return (
    <section role="alert" className={PANEL}>
      <h2 className="text-lg font-semibold text-ink">Search is not available right now</h2>
      <p className="max-w-prose text-sm text-ink-soft">
        We could not reach the portfolio index. Nothing you did caused this. Try again in a
        moment.
      </p>
      <Link
        href={retryHref}
        className="inline-flex min-h-11 w-fit items-center rounded-md border border-rule-strong px-4 text-sm font-medium text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
      >
        Try again
      </Link>
    </section>
  );
}
