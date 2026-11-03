import type { SectionProps } from "../types";
import { EditorialSection } from "./Section";

export function EditorialSkills({ section, content, skills }: SectionProps) {
  if (section.id !== "skills") {
    return null;
  }

  const names = content.skills.skillIds.map((id) => skills[id] ?? id);

  if (names.length === 0) {
    return null;
  }

  if (section.displayStyle === "list") {
    return (
      <EditorialSection id="skills" title="Skills" style="list">
        <ul className="ed-skill-list">
          {names.map((name) => (
            <li key={name} dir="auto" className="ed-skill-item break-words">
              {name}
            </li>
          ))}
        </ul>
      </EditorialSection>
    );
  }

  return (
    <EditorialSection id="skills" title="Skills" style="tags">
      <ul className="ed-tags">
        {names.map((name) => (
          <li key={name} dir="auto" className="ed-tag break-words">
            {name}
          </li>
        ))}
      </ul>
    </EditorialSection>
  );
}
