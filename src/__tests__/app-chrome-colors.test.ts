import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHROME_DIRECTORIES,
  COLOR_EXCEPTIONS,
  colorExceptionFor,
  isExcludedFromColorScan,
} from "@/lib/theme/color-exceptions";

/**
 * The app chrome (every screen that is not a rendered portfolio) has one palette,
 * defined once in `src/app/globals.css` and used through semantic utilities.
 *
 * These tests exist because the chrome used to name Tailwind's `stone-*` scale
 * directly while `globals.css` flipped the page to near-black under
 * `prefers-color-scheme: dark`. On a dark-mode machine the text was #1c1917 on
 * #0a0a0a: 1.04:1, unreadable. A literal in a component cannot follow a theme,
 * so the literal itself is the bug.
 *
 * The scan covers the whole app UI (AC-4): `src/app` without the two surfaces that
 * render an owner's design, plus `src/components`, `src/editor`, `src/builder`,
 * `src/publish`, `src/search` and `src/lib`. The only files allowed to hold a literal
 * are listed in `src/lib/theme/color-exceptions.ts`, each with a reason.
 */

const PALETTE_LITERAL =
  /(?:^|[\s"'`])(?:bg|text|border|border-[xytrbl]|ring|ring-offset|divide|from|via|to|outline|decoration|placeholder|caret|fill|stroke|shadow)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{1,3})?(?:\/\d{1,3})?(?=[\s"'`]|$)/;

/** A color value, not a function named `rgb`: `rgb(12, 12, 12)` matches, `rgb(hex)` does not. */
const COLOR_VALUE = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*[\d.]|\bhsla?\(\s*[\d.]|\boklch\(/;

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

function hasColorLiteral(source: string): boolean {
  return COLOR_VALUE.test(source);
}

const SCANNED_FILES = CHROME_DIRECTORIES.flatMap(sourceFiles).filter(
  (path) => !isExcludedFromColorScan(path),
);

const GLOBALS = read("src/app/globals.css");

describe("app chrome colors", () => {
  it("AC-1 names no Tailwind palette class and no raw color value outside the exception list", () => {
    expect(SCANNED_FILES.length).toBeGreaterThan(0);

    const offenders = SCANNED_FILES.map((file) => {
      const source = read(file);
      const reasons: string[] = [];

      if (PALETTE_LITERAL.test(source)) reasons.push("palette class");
      if (hasColorLiteral(source) && colorExceptionFor(file) === undefined) {
        reasons.push("raw color value");
      }

      return reasons.length > 0 ? `${file}: ${reasons.join(", ")}` : null;
    }).filter((entry): entry is string => entry !== null);

    expect(offenders).toEqual([]);
  });

  it("AC-4 every exception still exists and still needs its reason", () => {
    const problems = COLOR_EXCEPTIONS.flatMap((entry) => {
      const absolute = join(process.cwd(), entry.file);

      if (!existsSync(absolute)) {
        return [`${entry.file}: listed but missing, so the entry is stale`];
      }

      if (!hasColorLiteral(read(entry.file))) {
        return [`${entry.file}: listed but holds no color literal, so the entry is stale`];
      }

      if (entry.reason.trim().length < 20) {
        return [`${entry.file}: the reason is too short to explain the exception`];
      }

      return [];
    });

    expect(problems).toEqual([]);
  });

  it("AC-4 every exception says what it is", () => {
    const kinds = COLOR_EXCEPTIONS.map((entry) => entry.kind);

    expect(kinds.every((kind) => ["data", "swatch", "computation"].includes(kind))).toBe(true);
  });

  it("AC-4 the scan leaves the public surfaces out and covers the rest", () => {
    expect(isExcludedFromColorScan("src/app/u/[username]/page.tsx")).toBe(true);
    expect(isExcludedFromColorScan("src/app/dashboard/preview/frame/page.tsx")).toBe(true);
    expect(isExcludedFromColorScan("src/app/dashboard/preview/page.tsx")).toBe(false);
    expect(isExcludedFromColorScan("src/components/header-bar.tsx")).toBe(false);

    for (const directory of [
      "src/app",
      "src/components",
      "src/editor",
      "src/builder",
      "src/publish",
      "src/search",
      "src/lib",
    ]) {
      expect(CHROME_DIRECTORIES).toContain(directory);
    }
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
    expect(GLOBALS).toMatch(/color-scheme:\s*light\s*dark/);
  });

  it("AC-4 uses the loaded typeface instead of a hard-coded font stack", () => {
    expect(GLOBALS).not.toMatch(/font-family:\s*Arial|Helvetica/);
    expect(GLOBALS).toMatch(/--font-geist-sans/);
  });
});
