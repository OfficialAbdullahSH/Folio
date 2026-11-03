import { Paragraphs } from "../../primitives/Paragraphs";
import { Section } from "../../primitives/Section";
import type { SectionProps } from "../types";

export function About({ section, content }: SectionProps) {
  if (section.id !== "about" || content.about.text.trim().length === 0) {
    return null;
  }

  return (
    <Section id="about" title="About">
      <Paragraphs text={content.about.text} />
    </Section>
  );
}
