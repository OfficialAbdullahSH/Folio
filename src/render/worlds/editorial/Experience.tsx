import type { ExperienceItem } from "@/schema";

import { formatMonth } from "../../format";
import type { SectionProps } from "../types";
import { EditorialSection } from "./Section";

function ExperienceBody({ item }: { item: ExperienceItem }) {
  return (
    <>
      <h3 dir="auto" className="ed-entry-title break-words">
        {item.title}
      </h3>
      <p dir="auto" className="ed-org break-words">
        {item.organization}
      </p>
      {item.description && item.description.trim().length > 0 ? (
        <p dir="auto" className="ed-entry-text break-words">
          {item.description}
        </p>
      ) : null}
      {item.kind === "education" ? <p className="ed-kind">Education</p> : null}
    </>
  );
}

function ExperienceDates({ item }: { item: ExperienceItem }) {
  return (
    <p className="ed-entry-date">
      <time dateTime={item.startDate}>{formatMonth(item.startDate)}</time>
      {item.current === true ? (
        <span> – Present</span>
      ) : item.endDate ? (
        <>
          <span>{" – "}</span>
          <time dateTime={item.endDate}>{formatMonth(item.endDate)}</time>
        </>
      ) : null}
    </p>
  );
}

export function EditorialExperience({ section, content }: SectionProps) {
  if (section.id !== "experience") {
    return null;
  }

  const items = content.experience.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "list") {
    return (
      <EditorialSection id="experience" title="Experience" style="list">
        <ul className="ed-exp-list">
          {items.map((item) => (
            <li key={item.id} className="ed-exp-row">
              <div className="ed-exp-main">
                <ExperienceBody item={item} />
              </div>
              <ExperienceDates item={item} />
            </li>
          ))}
        </ul>
      </EditorialSection>
    );
  }

  return (
    <EditorialSection id="experience" title="Experience" style="timeline">
      <ol className="ed-timeline">
        {items.map((item) => (
          <li key={item.id} className="ed-timeline-item">
            <ExperienceDates item={item} />
            <div className="ed-timeline-body">
              <ExperienceBody item={item} />
            </div>
          </li>
        ))}
      </ol>
    </EditorialSection>
  );
}
