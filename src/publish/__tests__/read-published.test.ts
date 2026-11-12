import { describe, expect, it, vi } from "vitest";

import { editorialDesign, fullContent } from "@/schema/fixtures";

import { readOwnPublishedSnapshot, type OwnPublishedReader } from "../read";

const ROW = {
  username: "amelia-hart",
  display_name: "Amelia Hart",
  headline: "Product designer",
  design: editorialDesign,
  content: fullContent,
  published_at: "2026-10-01T12:00:00.000Z",
};

function reader(result: { data: unknown; error: { message: string } | null }): OwnPublishedReader {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => result }),
      }),
    }),
  } as unknown as OwnPublishedReader;
}

describe("readOwnPublishedSnapshot", () => {
  it("D-082 returns the live snapshot", async () => {
    const result = await readOwnPublishedSnapshot(reader({ data: ROW, error: null }), "user-1");

    expect(result.status).toBe("ok");
    expect(result.status === "ok" && result.snapshot).toMatchObject({
      username: "amelia-hart",
      displayName: "Amelia Hart",
      publishedAt: "2026-10-01T12:00:00.000Z",
    });
  });

  it("D-082 reports nothing published yet", async () => {
    const result = await readOwnPublishedSnapshot(reader({ data: null, error: null }), "user-1");

    expect(result).toEqual({ status: "missing" });
  });

  it("D-082 reports a failed read instead of throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await readOwnPublishedSnapshot(
      reader({ data: null, error: { message: "timeout" } }),
      "user-1",
    );

    expect(result.status).toBe("failed");
    vi.restoreAllMocks();
  });

  it("D-082 rejects a snapshot it cannot render", async () => {
    const result = await readOwnPublishedSnapshot(
      reader({ data: { ...ROW, design: { nope: true } }, error: null }),
      "user-1",
    );

    expect(result.status).toBe("invalid");
  });
});
