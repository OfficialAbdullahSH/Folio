import type { FontKey } from "@/render/font-vars";
import type { DesignTheme, SectionId } from "@/schema";

type Radius = DesignTheme["radius"];

import type { ColorRole } from "./contrast";

export const WORLD_LABELS = {
  editorial: "Editorial",
  terminal: "Terminal",
} as const;

export const WORLD_DESCRIPTIONS = {
  editorial: "A magazine page: serif headings, wide margins, numbered sections.",
  terminal: "A shell session: monospaced chrome, prompts and a flat grid.",
} as const;

export const COLOR_ROLE_LABELS: Record<ColorRole, string> = {
  background: "Background",
  surface: "Surface",
  text: "Text",
  muted: "Muted text",
  accent: "Accent",
  border: "Border",
};

/** What each role paints, from D-044, so a choice is not a guess. */
export const COLOR_ROLE_HINTS: Record<ColorRole, string> = {
  background: "The page itself",
  surface: "Panels, cards and windows",
  text: "Primary text",
  muted: "Secondary text, labels and dates",
  accent: "Links, emphasis and the focus ring",
  border: "Dividers, rules and outlines",
};

export const FONT_LABELS: Record<FontKey, string> = {
  inter: "Inter",
  "space-grotesk": "Space Grotesk",
  "playfair-display": "Playfair Display",
  lora: "Lora",
  "jetbrains-mono": "JetBrains Mono",
  cairo: "Cairo",
};

export const RADIUS_LABELS: Record<Radius, string> = {
  none: "Sharp",
  sm: "Subtle",
  md: "Rounded",
  lg: "Soft",
};

export const SECTION_NAMES: Record<SectionId, string> = {
  hero: "Intro",
  about: "About",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  contact: "Contact",
};

export const STYLE_LABELS: Record<string, string> = {
  large: "Large",
  compact: "Compact",
  grid: "Grid",
  cards: "Cards",
  timeline: "Timeline",
  list: "List",
};

export const FONT_ROLE_LABELS = {
  heading: "Heading font",
  body: "Body font",
} as const;
