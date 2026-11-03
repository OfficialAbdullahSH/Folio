import type { ProjectItem } from "@/schema";

import { Card } from "../../primitives/Card";
import { ExternalLink } from "../../primitives/ExternalLink";
import { Section } from "../../primitives/Section";
import { TimelineItem } from "../../primitives/TimelineItem";
import type { SectionProps } from "../types";

function ProjectBody({ item }: { item: ProjectItem }) {
  return (
    <>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- D-039: plain lazy image, no remote-domain config in v1
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="mb-4 aspect-[16/10] w-full rounded-[var(--radius)] border border-[var(--color-border)] object-cover"
        />
      ) : null}
      <h3
        dir="auto"
        className="break-words text-lg font-semibold [font-family:var(--font-heading)]"
      >
        {item.title}
      </h3>
      {item.description.trim().length > 0 ? (
        <p
          dir="auto"
          className="mt-2 break-words text-sm leading-relaxed text-[var(--color-muted)]"
        >
          {item.description}
        </p>
      ) : null}
      {item.link ? (
        <p className="mt-3 text-sm">
          <ExternalLink href={item.link}>View project</ExternalLink>
        </p>
      ) : null}
    </>
  );
}

export function Projects({ section, content }: SectionProps) {
  if (section.id !== "projects") {
    return null;
  }

  const items = content.projects.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "timeline") {
    return (
      <Section id="projects" title="Projects" style="timeline">
        <ol className="flex flex-col gap-8">
          {items.map((item) => (
            <TimelineItem key={item.id}>
              <ProjectBody item={item} />
            </TimelineItem>
          ))}
        </ol>
      </Section>
    );
  }

  const cards = section.displayStyle === "cards";

  return (
    <Section id="projects" title="Projects" style={section.displayStyle}>
      <ul className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            {cards ? (
              <Card>
                <ProjectBody item={item} />
              </Card>
            ) : (
              <div className="h-full">
                <ProjectBody item={item} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
