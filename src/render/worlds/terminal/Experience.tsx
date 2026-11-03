import type { ExperienceItem } from "@/schema";

import { formatMonth } from "../../format";
import type { SectionProps } from "../types";
import { TerminalPane } from "./Pane";

function ExperienceBody({ item }: { item: ExperienceItem }) {
  return (
    <>
      <h3 dir="auto" className="tm-entry-title break-words">
        {item.title}
      </h3>
      <p dir="auto" className="tm-org break-words">
        {item.organization}
      </p>
      {item.description && item.description.trim().length > 0 ? (
        <p dir="auto" className="tm-entry-text break-words">
          {item.description}
        </p>
      ) : null}
      {item.kind === "education" ? <p className="tm-kind">education</p> : null}
    </>
  );
}

function ExperienceDates({ item }: { item: ExperienceItem }) {
  return (
    <p className="tm-date">
      <time dateTime={item.startDate}>{formatMonth(item.startDate)}</time>
      {item.current === true ? (
        <span> – present</span>
      ) : item.endDate ? (
        <>
          <span>{" – "}</span>
          <time dateTime={item.endDate}>{formatMonth(item.endDate)}</time>
        </>
      ) : null}
    </p>
  );
}

export function TerminalExperience({ section, content }: SectionProps) {
  if (section.id !== "experience") {
    return null;
  }

  const items = content.experience.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "list") {
    return (
      <TerminalPane id="experience" title="Experience" style="list">
        <ul className="tm-exp-table">
          {items.map((item) => (
            <li key={item.id} className="tm-exp-row">
              <ExperienceDates item={item} />
              <div>
                <ExperienceBody item={item} />
              </div>
            </li>
          ))}
        </ul>
      </TerminalPane>
    );
  }

  return (
    <TerminalPane id="experience" title="Experience" style="timeline">
      <ol className="tm-exp-log">
        {items.map((item) => (
          <li key={item.id} className="tm-exp-entry">
            <span className="tm-log-marker" data-decor="marker" aria-hidden="true" />
            <div>
              <ExperienceDates item={item} />
              <ExperienceBody item={item} />
            </div>
          </li>
        ))}
      </ol>
    </TerminalPane>
  );
}
