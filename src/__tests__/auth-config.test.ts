import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);

    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("secrets", () => {
  it("AC-10 .env.example lists both public variables and no real key", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");

    expect(example).toContain("NEXT_PUBLIC_SUPABASE_URL=");
    expect(example).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY=");
    expect(example).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
    expect(example).not.toContain("SERVICE_ROLE");
  });

  it("AC-10 .gitignore ignores .env files but keeps the example", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");

    expect(gitignore).toContain(".env*");
    expect(gitignore).toContain("!.env.example");
  });

  it("AC-10 no source file mentions the service-role key", () => {
    const offenders = sourceFiles(join(ROOT, "src"))
      .filter((path) => !path.includes("__tests__"))
      .filter((path) => /service_role|SERVICE_ROLE|serviceRole/i.test(readFileSync(path, "utf8")));

    expect(offenders).toEqual([]);
  });

  it("AC-10 only the two public variables are read", () => {
    const config = readFileSync(join(ROOT, "src", "lib", "supabase", "config.ts"), "utf8");

    expect(config).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(config).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(config).not.toContain("SUPABASE_SECRET");
  });
});
