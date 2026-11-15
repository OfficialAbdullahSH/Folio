/**
 * The only places in the app UI where a color literal is allowed (D-101, AC-4).
 *
 * The rule is simple: app chrome takes its colors from the semantic tokens in
 * `src/app/globals.css`, because a literal cannot follow a theme. The entries below
 * are not chrome. Each one is a **design document** — the six colors an owner's
 * portfolio will be painted with — so the literal is data the owner chose, and
 * `ThemeScope` turns it into CSS variables at render time (D-042).
 *
 * `src/__tests__/app-chrome-colors.test.ts` fails in three cases:
 *
 * - a color literal or a Tailwind palette class appears in the app UI and the file
 *   is not listed here,
 * - a listed file does not exist (a rename left a stale entry),
 * - a listed file no longer contains a color literal (the entry has outlived its
 *   reason and should be deleted, so the list cannot grow into a blanket permission).
 */

/** What the literal is: owner data, a rendered swatch, or a computed value. */
export type ColorExceptionKind = "data" | "swatch" | "computation";

export type ColorException = {
  /** Repo-relative path. */
  file: string;
  kind: ColorExceptionKind;
  reason: string;
};

export const COLOR_EXCEPTIONS: readonly ColorException[] = [
  {
    file: "src/builder/looks.ts",
    kind: "data",
    reason:
      "The named looks are design documents: each sets the six color roles a portfolio will use. The builder applies one as an edit, and the schema validates it.",
  },
  {
    file: "src/search/demo-seed.ts",
    kind: "data",
    reason:
      "The demo portfolios are design documents too, generated into the SQL seed. They are what a visitor sees on /u/demo-* before any real owner publishes.",
  },
];

/** The files the scan reads: all app UI, without the two public surfaces. */
export const CHROME_DIRECTORIES = [
  "src/app",
  "src/components",
  "src/editor",
  "src/builder",
  "src/publish",
  "src/search",
  "src/lib",
] as const;

/**
 * The app UI excludes the surfaces that render an owner's design rather than
 * Folio's chrome: a public portfolio and the builder's preview frame (D-100). They
 * are the one place where a portfolio's own colors are correct.
 */
export const CHROME_EXCLUDED_PATHS = [
  "src/app/u/",
  "src/app/dashboard/preview/frame/page.tsx",
] as const;

/** True when the path is one of the excluded public surfaces. */
export function isExcludedFromColorScan(path: string): boolean {
  return CHROME_EXCLUDED_PATHS.some((prefix) => path.startsWith(prefix));
}

/** The exception for a path, if there is one. */
export function colorExceptionFor(path: string): ColorException | undefined {
  return COLOR_EXCEPTIONS.find((entry) => entry.file === path);
}
