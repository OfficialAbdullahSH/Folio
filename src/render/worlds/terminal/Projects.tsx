import type { ProjectItem } from "@/schema";

import { ExternalLink } from "../../primitives/ExternalLink";
import { ProjectImage } from "../../primitives/ProjectImage";
import type { SectionProps } from "../types";
import { TerminalPane } from "./Pane";
import { TerminalTitleBar } from "./TitleBar";

function ProjectText({ item }: { item: ProjectItem }) {
  return (
    <>
      <h3 dir="auto" className="tm-project-title break-words">
        {item.title}
      </h3>
      {item.description.trim().length > 0 ? (
        <p dir="auto" className="tm-project-text break-words">
          {item.description}
        </p>
      ) : null}
      {item.link ? (
        <p className="tm-project-link">
          <ExternalLink href={item.link}>Open project</ExternalLink>
        </p>
      ) : null}
    </>
  );
}

export function TerminalProjects({ section, content }: SectionProps) {
  if (section.id !== "projects") {
    return null;
  }

  const items = content.projects.items;

  if (items.length === 0) {
    return null;
  }

  if (section.displayStyle === "timeline") {
    return (
      <TerminalPane id="projects" title="Projects" style="timeline">
        <ol className="tm-log">
          {items.map((item) => (
            <li key={item.id} className="tm-log-entry">
              <span className="tm-log-marker" data-decor="marker" aria-hidden="true" />
              <div>
                <ProjectText item={item} />
              </div>
            </li>
          ))}
        </ol>
      </TerminalPane>
    );
  }

  if (section.displayStyle === "cards") {
    return (
      <TerminalPane id="projects" title="Projects" style="cards">
        <ul className="tm-card-grid">
          {items.map((item) => (
            <li key={item.id} className="tm-pane tm-card">
              <TerminalTitleBar title="project.md" />
              <div className="tm-pane-body">
                {item.imageUrl ? (
                  <ProjectImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="tm-card-image"
                  />
                ) : null}
                <ProjectText item={item} />
              </div>
            </li>
          ))}
        </ul>
      </TerminalPane>
    );
  }

  return (
    <TerminalPane id="projects" title="Projects" style="grid">
      <ol className="tm-project-grid">
        {items.map((item) => (
          <li key={item.id} className="tm-project">
            <p className="tm-file-label" data-decor="file-label" aria-hidden="true" />
            {item.imageUrl ? (
              <ProjectImage
                src={item.imageUrl}
                alt={item.title}
                className="tm-project-image"
              />
            ) : null}
            <ProjectText item={item} />
          </li>
        ))}
      </ol>
    </TerminalPane>
  );
}
