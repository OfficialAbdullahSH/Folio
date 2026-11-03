import type { ContentDocument, DesignDocument, DesignSection } from "@/schema";

import { SECTION_LABELS } from "./worlds/labels";
import type { NavigationItem } from "./worlds/types";

export function sectionHasContent(
  section: DesignSection,
  content: ContentDocument,
): boolean {
  switch (section.id) {
    case "hero":
      return true;
    case "about":
      return content.about.text.trim().length > 0;
    case "projects":
      return content.projects.items.length > 0;
    case "skills":
      return content.skills.skillIds.length > 0;
    case "experience":
      return content.experience.items.length > 0;
    case "contact":
      return content.contact.items.length > 0;
  }
}

export function renderedSections(
  design: DesignDocument,
  content: ContentDocument,
): DesignSection[] {
  return design.sections.filter(
    (section) =>
      section.id === "hero" || (section.visible && sectionHasContent(section, content)),
  );
}

export function buildNavigation(sections: readonly DesignSection[]): NavigationItem[] {
  return sections
    .filter((section) => section.id !== "hero")
    .map((section, index) => ({
      id: section.id,
      label: SECTION_LABELS[section.id],
      index: index + 1,
    }));
}
