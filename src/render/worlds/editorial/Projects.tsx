import type { ProjectItem } from "@/schema";

import { ExternalLink } from "../../primitives/ExternalLink";
import { ProjectImage } from "../../primitives/ProjectImage";
import type { SectionProps } from "../types";
import { EditorialSection } from "./Section";

function ProjectText({ item }: { item: ProjectItem }) {
  return (
    <>
      <h3 dir="auto" className="ed-project-title break-words">
        {item.title}
      </h3>
      {item.description.trim().length > 0 ? (
        <p dir="auto" className="ed-project-text break-words">
          {item.description}
        </p>
      ) : null}
      {item.link ? (
        <p className="ed-project-link">
          <ExternalLink href={item.link}>View project</ExternalLink>
        </p>
      ) : null}
    </>
  );
}

export function EditorialProjects({ section, content }: SectionProps) {
  if (section.id !== "projects") {
    return null;
  }

  const items = content.projects.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "timeline") {
    return (
      <EditorialSection id="projects" title="Projects" style="timeline">
        <ol className="ed-project-index">
          {items.map((item) => (
            <li key={item.id} className="ed-project-index-item">
              <ProjectText item={item} />
            </li>
          ))}
        </ol>
      </EditorialSection>
    );
  }

  if (section.displayStyle === "cards") {
    return (
      <EditorialSection id="projects" title="Projects" style="cards">
        <ul className="ed-card-list">
          {items.map((item) => (
            <li key={item.id} className="ed-card">
              {item.imageUrl ? (
                <ProjectImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="ed-card-image"
                />
              ) : (
                <div className="ed-card-image ed-card-plate" data-decor="plate" aria-hidden="true" />
              )}
              <div className="ed-card-caption">
                <ProjectText item={item} />
              </div>
            </li>
          ))}
        </ul>
      </EditorialSection>
    );
  }

  return (
    <EditorialSection id="projects" title="Projects" style="grid">
      <ol className="ed-project-grid">
        {items.map((item) => (
          <li key={item.id} className="ed-project-entry">
            {item.imageUrl ? (
              <ProjectImage
                src={item.imageUrl}
                alt={item.title}
                className="ed-project-image"
              />
            ) : null}
            <ProjectText item={item} />
          </li>
        ))}
      </ol>
    </EditorialSection>
  );
}
