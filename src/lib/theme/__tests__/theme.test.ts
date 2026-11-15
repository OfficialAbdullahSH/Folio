import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DARK_QUERY,
  DEFAULT_THEME_CHOICE,
  parseThemeChoice,
  resolveTheme,
  THEME_BOOTSTRAP_SCRIPT,
  THEME_CHOICES,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "../theme";

type ScriptEnvironment = {
  stored?: string | null;
  systemDark?: boolean;
  storageThrows?: boolean;
};

/** Runs the pre-paint script against a fake browser, exactly as the head would. */
function runBootstrapScript(environment: ScriptEnvironment): {
  theme: string | undefined;
  colorScheme: string | undefined;
} {
  const attributes = new Map<string, string>();
  const style: Record<string, string> = {};

  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      style,
    },
  };

  const window = {
    localStorage: {
      getItem: (key: string) => {
        expect(key).toBe(THEME_STORAGE_KEY);

        if (environment.storageThrows === true) {
          throw new Error("storage is disabled");
        }

        return environment.stored ?? null;
      },
    },
    matchMedia: (query: string) => ({
      matches: query === DARK_QUERY && environment.systemDark === true,
    }),
  };

  new Function("window", "document", THEME_BOOTSTRAP_SCRIPT)(window, document);

  return { theme: attributes.get("data-theme"), colorScheme: style.colorScheme };
}

describe("the theme setting", () => {
  it("AC-12 offers light, dark and system, with system as the default", () => {
    expect([...THEME_CHOICES]).toEqual(["light", "dark", "system"]);
    expect(DEFAULT_THEME_CHOICE).toBe("system");
  });

  it("AC-12 treats an unreadable stored value as system", () => {
    expect(parseThemeChoice(null)).toBe("system");
    expect(parseThemeChoice(undefined)).toBe("system");
    expect(parseThemeChoice("")).toBe("system");
    expect(parseThemeChoice("Dark")).toBe("system");
    expect(parseThemeChoice("sepia")).toBe("system");
    expect(parseThemeChoice("light")).toBe("light");
    expect(parseThemeChoice("dark")).toBe("dark");
  });

  it("AC-12 resolves system against the operating system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("AC-13 the pre-paint script applies the same decision as the provider", () => {
    for (const choice of THEME_CHOICES) {
      for (const systemDark of [false, true]) {
        const result = runBootstrapScript({ stored: choice, systemDark });

        expect({ choice, systemDark, theme: result.theme }).toEqual({
          choice,
          systemDark,
          theme: resolveTheme(choice as ThemeChoice, systemDark),
        });
        // Native controls follow the stylesheet, not an inline style: an attribute
        // React did not render is what the hydration check tolerates, a style is not.
        expect(result.colorScheme).toBeUndefined();
      }
    }
  });

  it("AC-13 the stylesheet gives native controls the same scheme as the palette", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toMatch(/:root\[data-theme="light"\]\s*\{[^}]*color-scheme:\s*light/);
    expect(css).toMatch(/:root\[data-theme="dark"\]\s*\{[^}]*color-scheme:\s*dark/);
  });

  it("AC-13 the pre-paint script follows the system when storage is disabled", () => {
    expect(runBootstrapScript({ storageThrows: true, systemDark: true }).theme).toBe("dark");
    expect(runBootstrapScript({ storageThrows: true, systemDark: false }).theme).toBe("light");
  });

  it("AC-13 the pre-paint script ignores a stored value it did not write", () => {
    expect(runBootstrapScript({ stored: "sepia", systemDark: true }).theme).toBe("dark");
  });

  it("AC-13 the script reads storage before it decides, so the first paint is right", () => {
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP_SCRIPT).toContain(DARK_QUERY);
    expect(THEME_BOOTSTRAP_SCRIPT.indexOf("localStorage")).toBeLessThan(
      THEME_BOOTSTRAP_SCRIPT.indexOf("setAttribute"),
    );
  });
});
