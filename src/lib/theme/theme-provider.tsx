"use client";

import {
  useCallback,
  useContext,
  createContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DARK_QUERY,
  DEFAULT_THEME_CHOICE,
  parseThemeChoice,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeChoice,
} from "./theme";

/**
 * The reader's theme choice (D-099).
 *
 * The stored choice and the operating-system preference are browser state, so they are
 * read through `useSyncExternalStore`: the server snapshot is the default, which is what
 * the server rendered, and the client snapshot takes over straight after hydration with
 * no effect and no mismatch. Nothing here sets state from an effect.
 *
 * `data-theme` is written at the moment a preference changes — on a click, or in the
 * subscription when the system or another tab changes it — and never from an effect. The
 * pre-paint script has already put the right value on the document before the first
 * paint, and an effect that ran afterwards could only undo it for a frame.
 */

type ThemeContextValue = {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (choice: ThemeChoice) => void;
};

type Preferences = {
  choice: ThemeChoice;
  systemPrefersDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const NO_PROVIDER: ThemeContextValue = {
  choice: DEFAULT_THEME_CHOICE,
  resolved: "light",
  setChoice: () => {},
};

/** The snapshot React uses on the server and during hydration. */
const SERVER_PREFERENCES: Preferences = {
  choice: DEFAULT_THEME_CHOICE,
  systemPrefersDark: false,
};

/** `useSyncExternalStore` compares by identity, so the object is cached per value. */
let cachedPreferences: Preferences | null = null;

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? NO_PROVIDER;
}

function readStoredChoice(): ThemeChoice {
  try {
    return parseThemeChoice(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_CHOICE;
  }
}

function readPreferences(): Preferences {
  const choice = readStoredChoice();
  const systemPrefersDark = window.matchMedia(DARK_QUERY).matches;

  if (
    cachedPreferences === null ||
    cachedPreferences.choice !== choice ||
    cachedPreferences.systemPrefersDark !== systemPrefersDark
  ) {
    cachedPreferences = { choice, systemPrefersDark };
  }

  return cachedPreferences;
}

/** Only the attribute: `color-scheme` for native controls comes from globals.css. */
function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}

function subscribeToPreferences(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);

  // The DOM follows here rather than in an effect: the palette has to change with the
  // preference, not one render later.
  const refresh = () => {
    const preferences = readPreferences();

    applyTheme(resolveTheme(preferences.choice, preferences.systemPrefersDark));
    onChange();
  };

  query.addEventListener("change", refresh);
  window.addEventListener("storage", refresh);

  return () => {
    query.removeEventListener("change", refresh);
    window.removeEventListener("storage", refresh);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // A choice made on this page wins over the stored one, because writing to storage does
  // not notify the tab that wrote it.
  const [ownChoice, setOwnChoice] = useState<ThemeChoice | null>(null);
  const preferences = useSyncExternalStore(
    subscribeToPreferences,
    readPreferences,
    () => SERVER_PREFERENCES,
  );

  const choice = ownChoice ?? preferences.choice;
  const resolved = resolveTheme(choice, preferences.systemPrefersDark);

  const setChoice = useCallback((next: ThemeChoice) => {
    setOwnChoice(next);
    applyTheme(resolveTheme(next, window.matchMedia(DARK_QUERY).matches));

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage is disabled: the choice still applies to this page, it just will not
      // survive a reload. Better than failing the click.
    }
  }, []);

  const value = useMemo(() => ({ choice, resolved, setChoice }), [choice, resolved, setChoice]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
