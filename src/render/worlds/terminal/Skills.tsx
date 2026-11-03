import type { SectionProps } from "../types";
import { TerminalPane } from "./Pane";

export function TerminalSkills({ section, content, skills }: SectionProps) {
  if (section.id !== "skills") {
    return null;
  }

  const names = content.skills.skillIds.map((id) => skills[id] ?? id);

  if (names.length === 0) {
    return null;
  }

  if (section.displayStyle === "list") {
    return (
      <TerminalPane id="skills" title="Skills" style="list">
        <ul className="tm-skill-list">
          {names.map((name) => (
            <li key={name} dir="auto" className="tm-skill-item break-words">
              {name}
            </li>
          ))}
        </ul>
      </TerminalPane>
    );
  }

  return (
    <TerminalPane id="skills" title="Skills" style="tags">
      <ul className="tm-tags">
        {names.map((name) => (
          <li key={name} dir="auto" className="tm-tag break-words">
            {name}
          </li>
        ))}
      </ul>
    </TerminalPane>
  );
}
