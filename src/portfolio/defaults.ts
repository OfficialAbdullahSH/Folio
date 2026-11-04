import type { ContentDocument, DesignDocument } from "@/schema";

/**
 * What a brand-new draft contains (D-057). Data, not format: the frozen schemas
 * (D-034) stay untouched, and the tests in `src/portfolio/__tests__` prove these
 * two values pass the F-02 validators.
 */
export const DEFAULT_DESIGN: DesignDocument = {
  version: 1,
  world: "editorial",
  theme: {
    colors: {
      background: "#faf7f2",
      surface: "#ffffff",
      text: "#1c1917",
      muted: "#57534e",
      accent: "#b45309",
      border: "#e7e5e4",
    },
    headingFont: "playfair-display",
    bodyFont: "inter",
    radius: "md",
  },
  sections: [
    { id: "hero", visible: true, displayStyle: "large" },
    { id: "about", visible: true },
    { id: "projects", visible: true, displayStyle: "cards" },
    { id: "skills", visible: true, displayStyle: "tags" },
    { id: "experience", visible: true, displayStyle: "timeline" },
    { id: "contact", visible: true },
  ],
};

export const EMPTY_CONTENT: ContentDocument = {
  version: 1,
  about: { text: "" },
  projects: { items: [] },
  skills: { skillIds: [] },
  experience: { items: [] },
  contact: { items: [] },
};

/** A fresh copy, so a caller that mutates a draft cannot corrupt the defaults. */
export const defaultDesign = (): DesignDocument => structuredClone(DEFAULT_DESIGN);

export const emptyContent = (): ContentDocument => structuredClone(EMPTY_CONTENT);
