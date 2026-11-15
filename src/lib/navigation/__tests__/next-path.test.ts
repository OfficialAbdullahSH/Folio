import { describe, expect, it } from "vitest";

import { MAX_NEXT_PATH_LENGTH, safeNextPath } from "../next-path";

describe("the return path", () => {
  it("AC-6 accepts a same-site path", () => {
    expect(safeNextPath("/dashboard/edit")).toBe("/dashboard/edit");
    expect(safeNextPath("/dashboard/design?tab=colors")).toBe("/dashboard/design?tab=colors");
    expect(safeNextPath("/search?q=react")).toBe("/search?q=react");
    expect(safeNextPath("/")).toBe("/");
  });

  it("AC-6 refuses another host, a scheme and a protocol-relative path", () => {
    expect(safeNextPath("//evil.example/dashboard")).toBeNull();
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("http://evil.example")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("data:text/html,hi")).toBeNull();
    expect(safeNextPath("/\\evil.example")).toBeNull();
    expect(safeNextPath("\\\\evil.example")).toBeNull();
  });

  it("AC-6 refuses an encoded slash, which a browser can decode into a host", () => {
    expect(safeNextPath("/%2F%2Fevil.example")).toBeNull();
    expect(safeNextPath("/%2f%2fevil.example")).toBeNull();
    expect(safeNextPath("/%5Cevil.example")).toBeNull();
  });

  it("AC-6 refuses a relative path with no leading slash", () => {
    expect(safeNextPath("dashboard/edit")).toBeNull();
    expect(safeNextPath("../dashboard")).toBeNull();
    expect(safeNextPath("?next=/dashboard")).toBeNull();
  });

  it("AC-6 refuses an empty value and a value that is too long", () => {
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath("   ")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
    expect(safeNextPath(`/${"a".repeat(MAX_NEXT_PATH_LENGTH)}`)).toBeNull();
  });

  it("AC-6 refuses control characters and keeps a normal path intact", () => {
    expect(safeNextPath("/dashboard\nSet-Cookie: x")).toBeNull();
    expect(safeNextPath("  /dashboard/edit  ")).toBe("/dashboard/edit");
  });
});
