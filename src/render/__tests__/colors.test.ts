import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const RENDER_DIRECTORY = join(process.cwd(), "src", "render");
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return entry.name === "__tests__" ? [] : sourceFiles(join(directory, entry.name));
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [join(directory, entry.name)] : [];
  });
}

describe("render code", () => {
  it("AC-6 contains no hard-coded color values", () => {
    const files = sourceFiles(RENDER_DIRECTORY);
    expect(files.length).toBeGreaterThan(0);

    const offenders = files.filter((file) =>
      COLOR_LITERAL.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  it("AC-8 does not inject user content as markup", () => {
    const offenders = sourceFiles(RENDER_DIRECTORY).filter((file) =>
      readFileSync(file, "utf8").includes("dangerouslySetInnerHTML"),
    );

    expect(offenders).toEqual([]);
  });
});
