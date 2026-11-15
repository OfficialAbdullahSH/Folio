/**
 * The theme setting (D-099, D-100).
 *
 * Three choices, one stored value, one resolution rule. The pre-paint script and the
 * React provider both go through this module, so the colour applied before the first
 * paint and the colour applied after hydration cannot disagree — the test runs the
 * script for every combination and compares it with `resolveTheme`.
 */

export const THEME_CHOICES = ["light", "dark", "system"] as const;

export type ThemeChoice = (typeof THEME_CHOICES)[number];
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "folio-theme";
export const DEFAULT_THEME_CHOICE: ThemeChoice = "system";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

/** Anything unreadable, absent or unexpected means "follow the system". */
export function parseThemeChoice(raw: string | null | undefined): ThemeChoice {
  return isThemeChoice(raw) ? raw : DEFAULT_THEME_CHOICE;
}

export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): ResolvedTheme {
  if (choice === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return choice;
}

/**
 * Runs in `<head>` before the body is parsed, so the first paint already has the
 * right palette. It is a string because it cannot be a React effect: an effect runs
 * after the paint, which is the flash this avoids. `try` blocks cover a browser with
 * storage disabled (Safari private mode throws), which falls back to the system.
 *
 * It sets `data-theme` and nothing else: globals.css turns that into the palette and
 * into `color-scheme` for native controls. An inline style here would be an attribute
 * React never rendered, which the hydration check reports.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var key=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var choice="system";try{var stored=window.localStorage.getItem(key);if(stored==="light"||stored==="dark"||stored==="system"){choice=stored}}catch(error){}var dark=choice==="dark"||(choice==="system"&&window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);var root=document.documentElement;root.setAttribute("data-theme",dark?"dark":"light")}catch(error){}})();`;
