import { Paragraphs } from "../../primitives/Paragraphs";
import type { SectionProps } from "../types";
import { EditorialSection } from "./Section";

export function EditorialAbout({ section, content }: SectionProps) {
  if (section.id !== "about" || content.about.text.trim().length === 0) {
    return null;
  }

  return (
    <EditorialSection id="about" title="About">
      <div className="ed-about-body">
        <Paragraphs text={content.about.text} firstParagraphClassName="ed-lead" />
      </div>
    </EditorialSection>
  );
}
