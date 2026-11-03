import { Section } from "../../primitives/Section";
import { Tag } from "../../primitives/Tag";
import type { SectionProps } from "../types";

export function Skills({ section, content, skills }: SectionProps) {
  if (section.id !== "skills") {
    return null;
  }

  const slugs = content.skills.skillIds;

  if (slugs.length === 0) {
    return null;
  }

  if (section.displayStyle === "tags") {
    return (
      <Section id="skills" title="Skills" style="tags">
        <ul className="flex flex-wrap gap-2">
          {slugs.map((slug) => (
            <Tag key={slug}>{skills[slug] ?? slug}</Tag>
          ))}
        </ul>
      </Section>
    );
  }

  return (
    <Section id="skills" title="Skills" style="list">
      <ul className="list-disc space-y-1 ps-5">
        {slugs.map((slug) => (
          <li key={slug} dir="auto" className="break-words">
            {skills[slug] ?? slug}
          </li>
        ))}
      </ul>
    </Section>
  );
}
