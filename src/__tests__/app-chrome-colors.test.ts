import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The app chrome (every screen that is not a rendered portfolio) has one palette,
 * defined once in `src/app/globals.css` and used through semantic utilities.
 *
 * These tests exist because the chrome used to name Tailwind's `stone-*` scale
 * directly while `globals.css` flipped the page to near-black under
 * `prefers-color-scheme: dark`. On a dark-mode machine the text was #1c1917 on
 * #0a0a0a: 1.04:1, unreadable. A literal in a component cannot follow a theme,
 * so the literal itself is the bug.
 */

const CHROME_DIRECTORIES = ["src/app", "src/editor"];

const PALETTE_LITERAL =
  /(?:^|[\s"'`])(?:bg|text|border|border-[xytrbl]|ring|ring-offset|divide|from|via|to|outline|decoration|placeholder|caret|fill|stroke|shadow)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{1,3})?(?:\/\d{1,3})?(?=[\s"'`]|$)/;

const COLOR_VALUE = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;

const APP_TOKENS = [
  "--app-canvas",
  "--app-panel",
  "--app-ink",
  "--app-ink-soft",
  "--app-rule",
  "--app-rule-strong",
  "--app-cta",
  "--app-cta-ink",
  "--app-danger",
  "--app-danger-surface",
  "--app-warn",
  "--app-warn-surface",
];

function sourceFiles(directory: string): string[] {
  const absolute = join(process.cwd(), directory);

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return entry.name === "__tests__" ? [] : sourceFiles(join(directory, entry.name));
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [join(directory, entry.name)] : [];
  });
}

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const GLOBALS = read("src/app/globals.css");

describe("app chrome colors", () => {
  it("AC-1 names no Tailwind palette class and no raw color value", () => {
    const files = CHROME_DIRECTORIES.flatMap(sourceFiles);
    expect(files.length).toBeGreaterThan(0);

    const offenders = files
      .map((file) => {
        const source = read(file);
        const reasons: string[] = [];

        if (PALETTE_LITERAL.test(source)) reasons.push("palette class");
        if (COLOR_VALUE.test(source)) reasons.push("raw color value");

        return reasons.length > 0 ? `${file}: ${reasons.join(", ")}` : null;
      })
      .filter((entry): entry is string => entry !== null);

    expect(offenders).toEqual([]);
  });

  it("AC-2 defines every app token in both the light and the dark palette", () => {
    const darkStart = GLOBALS.indexOf("prefers-color-scheme: dark");
    expect(darkStart).toBeGreaterThan(0);

    const light = GLOBALS.slice(0, darkStart);
    const dark = GLOBALS.slice(darkStart);

    const missingLight = APP_TOKENS.filter((token) => !light.includes(`${token}:`));
    const missingDark = APP_TOKENS.filter((token) => !dark.includes(`${token}:`));

    expect({ missingLight, missingDark }).toEqual({ missingLight: [], missingDark: [] });
  });

  it("AC-3 lets the browser theme native controls", () => {
    expect(GLOBALS).toMatch(/color-scheme:\s*light\s+dark/);
  });

  it("AC-4 uses the loaded typeface instead of a hard-coded font stack", () => {
    expect(GLOBALS).not.toMatch(/font-family:\s*Arial|Helvetica/);
    expect(GLOBALS).toMatch(/--font-geist-sans/);
  });
});
