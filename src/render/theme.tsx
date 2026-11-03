import type { CSSProperties, ReactNode } from "react";

import type { DesignTheme } from "@/schema";

import { FONT_CSS_VARIABLES } from "./font-vars";
import type { WorldKey } from "./worlds/registry";


export const RADIUS_SCALE = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
} as const;

export function themeVariables(theme: DesignTheme): Record<string, string> {
  return {
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-muted": theme.colors.muted,
    "--color-accent": theme.colors.accent,
    "--color-border": theme.colors.border,
    "--radius": RADIUS_SCALE[theme.radius],
    "--font-heading": FONT_CSS_VARIABLES[theme.headingFont],
    "--font-body": FONT_CSS_VARIABLES[theme.bodyFont],
  };
}

export function ThemeScope({
  theme,
  world,
  children,
}: {
  theme: DesignTheme;
  world: WorldKey;
  children: ReactNode;
}) {
  return (
    <div
      data-world={world}
      style={themeVariables(theme) as CSSProperties}
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] [font-family:var(--font-body)]"
    >
      {children}
    </div>
  );
}
