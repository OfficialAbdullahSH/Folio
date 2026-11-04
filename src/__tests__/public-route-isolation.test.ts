import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PUBLIC_ROUTE = join(process.cwd(), "src", "app", "u");

function routeFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);

    if (statSync(path).isDirectory()) {
      return routeFiles(path);
    }

    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("public route isolation", () => {
  it("AC-11 the public route still reads the fixture source, not the database", () => {
    const files = routeFiles(PUBLIC_ROUTE);

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source).not.toContain("@/lib/supabase");
      expect(source).not.toContain("createSupabase");
      expect(source).not.toContain("@supabase");
    }

    const content = files.find((file) => file.endsWith("portfolio-content.tsx"));

    expect(content).toBeDefined();
    expect(readFileSync(content as string, "utf8")).toContain('from "@/data"');
  });
});
