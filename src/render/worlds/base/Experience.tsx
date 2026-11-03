import type { ExperienceItem } from "@/schema";

import { formatMonth } from "../../format";
import { Section } from "../../primitives/Section";
import { TimelineItem } from "../../primitives/TimelineItem";
import type { SectionProps } from "../types";

function ExperienceBody({ item }: { item: ExperienceItem }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          dir="auto"
          className="break-words text-base font-semibold [font-family:var(--font-heading)]"
        >
          {item.title}
        </h3>
        {item.kind === "education" ? (
          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Education
          </span>
        ) : null}
      </div>
      <p dir="auto" className="mt-1 break-words text-sm text-[var(--color-muted)]">
        {item.organization}
      </p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        <time dateTime={item.startDate}>{formatMonth(item.startDate)}</time>
        {item.current === true ? (
          <span> – Present</span>
        ) : item.endDate !== undefined ? (
          <span>
            {" – "}
            <time dateTime={item.endDate}>{formatMonth(item.endDate)}</time>
          </span>
        ) : null}
      </p>
      {item.description !== undefined && item.description.trim().length > 0 ? (
        <p dir="auto" className="mt-2 break-words text-sm leading-relaxed">
          {item.description}
        </p>
      ) : null}
    </>
  );
}

export function Experience({ section, content }: SectionProps) {
  if (section.id !== "experience") {
    return null;
  }

  const items = content.experience.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "timeline") {
    return (
      <Section id="experience" title="Experience" style="timeline">
        <ol className="flex flex-col gap-6">
          {items.map((item) => (
            <TimelineItem key={item.id}>
              <ExperienceBody item={item} />
            </TimelineItem>
          ))}
        </ol>
      </Section>
    );
  }

  return (
    <Section id="experience" title="Experience" style="list">
      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.id}>
            <ExperienceBody item={item} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
