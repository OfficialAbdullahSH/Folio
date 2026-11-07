import { defaultDesign } from "@/portfolio/defaults";
import {
  FONT_KEYS,
  RADIUS_VALUES,
  SECTION_DISPLAY_STYLES,
  WORLDS,
} from "@/schema";
import type { FontKey } from "@/render/font-vars";
import type { DesignDocument, DesignSection, SectionId } from "@/schema";

import type { ColorRole } from "./contrast";
import { normalizeHexInput } from "./hex";
import { lookById } from "./looks";

type Radius = DesignDocument["theme"]["radius"];

export type DesignAction =
  | { type: "setWorld"; world: DesignDocument["world"] }
  | { type: "applyLook"; lookId: string }
  | { type: "setColor"; role: ColorRole; value: string }
  | { type: "setFont"; role: "heading" | "body"; font: FontKey }
  | { type: "setRadius"; radius: Radius }
  | { type: "moveSection"; id: SectionId; direction: "up" | "down" }
  | { type: "toggleVisibility"; id: SectionId }
  | { type: "setDisplayStyle"; id: SectionId; style: string }
  | { type: "reset" };

type StyleOf<S extends keyof typeof SECTION_DISPLAY_STYLES> =
  (typeof SECTION_DISPLAY_STYLES)[S][number];

/** The display styles a section accepts, empty for the two that have none (D-020). */
export function allowedStyles(id: SectionId): readonly string[] {
  switch (id) {
    case "hero":
      return SECTION_DISPLAY_STYLES.hero;
    case "projects":
      return SECTION_DISPLAY_STYLES.projects;
    case "skills":
      return SECTION_DISPLAY_STYLES.skills;
    case "experience":
      return SECTION_DISPLAY_STYLES.experience;
    case "about":
    case "contact":
      return [];
    default:
      return [];
  }
}

function withDisplayStyle(section: DesignSection, style: string): DesignSection {
  if (!allowedStyles(section.id).includes(style)) {
    return section;
  }

  switch (section.id) {
    case "hero":
      return { ...section, displayStyle: style as StyleOf<"hero"> };
    case "projects":
      return { ...section, displayStyle: style as StyleOf<"projects"> };
    case "skills":
      return { ...section, displayStyle: style as StyleOf<"skills"> };
    case "experience":
      return { ...section, displayStyle: style as StyleOf<"experience"> };
    case "about":
    case "contact":
      return section;
  }
}

function moveSection(
  sections: readonly DesignSection[],
  id: SectionId,
  direction: "up" | "down",
): readonly DesignSection[] {
  const index = sections.findIndex((section) => section.id === id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || target < 0 || target >= sections.length) {
    return sections;
  }

  const next = sections.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved as DesignSection);

  return next;
}

export function designReducer(state: DesignDocument, action: DesignAction): DesignDocument {
  switch (action.type) {
    case "setWorld": {
      if (!(WORLDS as readonly string[]).includes(action.world) || state.world === action.world) {
        return state;
      }

      return { ...state, world: action.world };
    }

    case "applyLook": {
      const look = lookById(action.lookId);

      if (look === undefined) {
        return state;
      }

      return { ...state, theme: structuredClone(look.theme) };
    }

    case "setColor": {
      const value = normalizeHexInput(action.value);

      if (value === null || state.theme.colors[action.role] === value) {
        return state;
      }

      return {
        ...state,
        theme: {
          ...state.theme,
          colors: { ...state.theme.colors, [action.role]: value },
        },
      };
    }

    case "setFont": {
      if (!(FONT_KEYS as readonly string[]).includes(action.font)) {
        return state;
      }

      const key = action.role === "heading" ? "headingFont" : "bodyFont";

      if (state.theme[key] === action.font) {
        return state;
      }

      return { ...state, theme: { ...state.theme, [key]: action.font } };
    }

    case "setRadius": {
      if (!(RADIUS_VALUES as readonly string[]).includes(action.radius)) {
        return state;
      }

      if (state.theme.radius === action.radius) {
        return state;
      }

      return { ...state, theme: { ...state.theme, radius: action.radius } };
    }

    case "moveSection": {
      const sections = moveSection(state.sections, action.id, action.direction);

      return sections === state.sections ? state : { ...state, sections: [...sections] };
    }

    case "toggleVisibility": {
      if (!state.sections.some((section) => section.id === action.id)) {
        return state;
      }

      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.id ? { ...section, visible: !section.visible } : section,
        ),
      };
    }

    case "setDisplayStyle": {
      const next = state.sections.map((section) =>
        section.id === action.id ? withDisplayStyle(section, action.style) : section,
      );

      if (next.every((section, index) => section === state.sections[index])) {
        return state;
      }

      return { ...state, sections: next };
    }

    case "reset":
      return defaultDesign();
  }
}
