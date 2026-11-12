import { explainReadability } from "@/builder/readability-copy";
import { readabilityWarnings } from "@/builder/contrast";
import { SECTION_LABELS } from "@/render/worlds/labels";
import { sectionHasContent } from "@/render/sections";
import type { ContentDocument, DesignDocument } from "@/schema";

/**
 * What the publish dialog says before anything goes public (D-086).
 *
 * Both lists are advisory: following D-009 they never block publishing, they only
 * tell the owner what the page will look like once it is live.
 */
export type PublishNotes = {
  /** Readability problems, in words rather than bare ratios. */
  warnings: string[];
  /** Visible sections that will not render because they have no content. */
  emptySections: string[];
};

export function publishNotes(design: DesignDocument, content: ContentDocument): PublishNotes {
  const warnings = readabilityWarnings(design.theme).map((check) => {
    const explanation = explainReadability(check, design.theme.colors);

    return `${explanation.where}: ${explanation.numbers} ${explanation.fix}`;
  });

  const emptySections = design.sections
    .filter(
      (section) =>
        section.id !== "hero" && section.visible && !sectionHasContent(section, content),
    )
    .map((section) => SECTION_LABELS[section.id]);

  return { warnings, emptySections };
}
