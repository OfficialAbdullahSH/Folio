import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src", "render");
const WORLDS = ["editorial", "terminal"] as const;

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const FILES = filesUnder(ROOT).filter(
  (path) => /\.(tsx?|css)$/.test(path) && !path.includes("__tests__"),
);

function findings(pattern: RegExp): string[] {
  return FILES.flatMap((file) => {
    const source = readFileSync(file, "utf8");

    return [...source.matchAll(pattern)].map(
      (match) => `${file.slice(ROOT.length + 1)}: ${match[0]}`,
    );
  });
}

function cssBlock(source: string, opener: string): string {
  const start = source.indexOf(opener);

  if (start === -1) {
    return "";
  }

  let depth = 0;

  for (let index = source.indexOf("{", start); index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1;
    }

    if (source[index] === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return source.slice(start);
}

describe("world constraints", () => {
  it("AC-5 uses no hard-coded color values", () => {
    expect(findings(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)).toEqual([]);
  });

  it("AC-6 uses no fixed radius values", () => {
    const radiusValues = FILES.flatMap((file) => {
      const source = readFileSync(file, "utf8");

      return [...source.matchAll(/border-radius:\s*([^;}]+)/g)]
        .map((match) => match[1].trim())
        .filter((value) => value !== "var(--radius)" && value !== "0")
        .map((value) => `${file.slice(ROOT.length + 1)}: ${value}`);
    });

    expect(radiusValues).toEqual([]);
    expect(findings(/\brounded-(?!\[var\(--radius\)\]|full\b)/g)).toEqual([]);
  });

  it("AC-9 uses no physical left or right utilities", () => {
    expect(findings(/\b(?:ml|mr|pl|pr)-\S+/g)).toEqual([]);
    expect(findings(/\btext-(?:left|right)\b/g)).toEqual([]);
    expect(findings(/\b(?:left|right)-\d/g)).toEqual([]);
  });

  it("AC-9 uses no physical left or right declarations", () => {
    expect(findings(/\b(?:margin|padding)-(?:left|right)\s*:/g)).toEqual([]);
    expect(findings(/\b(?:left|right)\s*:/g)).toEqual([]);
  });

  it("AC-10 disables motion under prefers-reduced-motion", () => {
    for (const file of FILES.filter((path) => path.endsWith(".css"))) {
      const source = readFileSync(file, "utf8");

      if (/animation:|transition:/.test(source)) {
        expect(source, file).toContain("prefers-reduced-motion: reduce");
      }
    }
  });

  it("AC-2 scopes every world stylesheet to its data-world", () => {
    for (const world of WORLDS) {
      const file = join(ROOT, "worlds", world, `${world}.css`);
      const source = readFileSync(file, "utf8");

      expect(source).toContain(`[data-world="${world}"]`);
      expect(source).toContain("var(--color-");
      expect(source).toContain("var(--radius)");
    }
  });

  it("AC-7 keeps headings and body on the theme font variables", () => {
    for (const world of WORLDS) {
      const source = readFileSync(
        join(ROOT, "worlds", world, `${world}.css`),
        "utf8",
      );

      expect(source).toContain("font-family: var(--font-heading)");
    }

    const theme = readFileSync(join(ROOT, "theme.tsx"), "utf8");
    const terminal = readFileSync(
      join(ROOT, "worlds", "terminal", "terminal.css"),
      "utf8",
    );
    const editorial = readFileSync(
      join(ROOT, "worlds", "editorial", "editorial.css"),
      "utf8",
    );

    expect(theme).toContain("var(--font-body)");
    expect(terminal).toContain("var(--font-jetbrains-mono)");
    expect(editorial).not.toContain("var(--font-jetbrains-mono)");
  });

  it("AC-2 loads both world stylesheets", () => {
    const globals = readFileSync(
      join(process.cwd(), "src", "app", "globals.css"),
      "utf8",
    );

    for (const world of WORLDS) {
      expect(globals).toContain(`worlds/${world}/${world}.css`);
    }
  });

  it("AC-4 gives every anchor target a scroll-margin-top", () => {
    const expected: Record<(typeof WORLDS)[number], string> = {
      editorial: "1rem",
      terminal: "3.75rem",
    };

    for (const world of WORLDS) {
      const source = readFileSync(
        join(ROOT, "worlds", world, `${world}.css`),
        "utf8",
      );
      const rules = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

      for (const target of ["#main-content", "[data-section]"]) {
        const offset = rules
          .filter(([, selector]) => selector.includes(target))
          .map(([, , body]) =>
            body.match(/scroll-margin-top:\s*([^;]+)/)?.[1]?.trim(),
          )
          .find((value) => value !== undefined);

        expect(offset, `${world} ${target}`).toBe(expected[world]);
      }
    }

    const terminal = readFileSync(
      join(ROOT, "worlds", "terminal", "terminal.css"),
      "utf8",
    );
    const topbar = Number(
      terminal.match(/\.tm-topbar\s*\{[^}]*block-size:\s*([\d.]+)rem/)?.[1],
    );

    expect(topbar).toBe(2.75);
    expect(parseFloat(expected.terminal)).toBeGreaterThanOrEqual(topbar + 1);
    expect(cssBlock(terminal, "@media (min-width: 64rem)")).toContain(
      "scroll-margin-top: 3.75rem",
    );
  });
});
