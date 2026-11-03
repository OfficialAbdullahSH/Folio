import { FONT_KEYS } from "@/schema";

export type FontKey = (typeof FONT_KEYS)[number];

export const FONT_CSS_VARIABLES: Record<FontKey, string> = {
  inter: "var(--font-inter)",
  "space-grotesk": "var(--font-space-grotesk)",
  "playfair-display": "var(--font-playfair-display)",
  lora: "var(--font-lora)",
  "jetbrains-mono": "var(--font-jetbrains-mono)",
  cairo: "var(--font-cairo)",
};
