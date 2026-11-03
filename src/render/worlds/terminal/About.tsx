import { Paragraphs } from "../../primitives/Paragraphs";
import type { SectionProps } from "../types";
import { TerminalPane } from "./Pane";

export function TerminalAbout({ section, content }: SectionProps) {
  if (section.id !== "about" || content.about.text.trim().length === 0) {
    return null;
  }

  return (
    <TerminalPane id="about" title="About">
      <div className="tm-about-body">
        <Paragraphs text={content.about.text} firstParagraphClassName="tm-lead" />
      </div>
    </TerminalPane>
  );
}
