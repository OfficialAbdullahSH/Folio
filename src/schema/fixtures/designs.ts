import type { DesignDocument } from "../design.schema";

export const editorialDesign: DesignDocument = {
  version: 1,
  world: "editorial",
  theme: {
    colors: {
      background: "#faf7f2",
      surface: "#ffffff",
      text: "#1b1b1b",
      muted: "#6b6560",
      accent: "#8c3b2e",
      border: "#e3ddd3",
    },
    headingFont: "playfair-display",
    bodyFont: "inter",
    radius: "sm",
  },
  sections: [
    { id: "hero", visible: true, displayStyle: "large" },
    { id: "about", visible: true },
    { id: "projects", visible: true, displayStyle: "grid" },
    { id: "skills", visible: true, displayStyle: "tags" },
    { id: "experience", visible: true, displayStyle: "timeline" },
    { id: "contact", visible: true },
  ],
};

export const terminalDesign: DesignDocument = {
  version: 1,
  world: "terminal",
  theme: {
    colors: {
      background: "#0b0f0c",
      surface: "#121814",
      text: "#d7f5dd",
      muted: "#7f9c87",
      accent: "#4ade80",
      border: "#1f2b23",
    },
    headingFont: "jetbrains-mono",
    bodyFont: "jetbrains-mono",
    radius: "none",
  },
  sections: [
    { id: "hero", visible: true, displayStyle: "compact" },
    { id: "projects", visible: true, displayStyle: "timeline" },
    { id: "about", visible: true },
    { id: "skills", visible: true, displayStyle: "list" },
    { id: "experience", visible: true, displayStyle: "list" },
    { id: "contact", visible: true },
  ],
};

export const hiddenSectionsDesign: DesignDocument = {
  ...editorialDesign,
  sections: editorialDesign.sections.map((section) => ({ ...section, visible: false })),
};
