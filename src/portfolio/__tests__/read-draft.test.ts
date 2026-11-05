import { describe, expect, it } from "vitest";

import { DEFAULT_DESIGN, EMPTY_CONTENT } from "../defaults";
import { readDraftPortfolio, type DraftReader } from "../draft";

function fakeReader(
  row: { design: unknown; content: unknown } | null,
  error: string | null = null,
) {
  const calls: { table: string; columns: string; userId: string }[] = [];

  const reader: DraftReader = {
    from(table) {
      return {
        select(columns) {
          return {
            eq(_column, userId) {
              calls.push({ table, columns, userId });

              return {
                maybeSingle: () => Promise.resolve({ data: row, error: error === null ? null : { message: error } }),
              };
            },
          };
        },
      };
    },
  };

  return { reader, calls };
}

describe("readDraftPortfolio", () => {
  it("AC-7 returns the stored design and content", async () => {
    const { reader, calls } = fakeReader({
      design: DEFAULT_DESIGN,
      content: EMPTY_CONTENT,
    });

    const result = await readDraftPortfolio(reader, "user-1");

    expect(result).toEqual({
      status: "ok",
      design: DEFAULT_DESIGN,
      content: EMPTY_CONTENT,
    });
    expect(calls).toEqual([
      { table: "portfolios", columns: "design, content", userId: "user-1" },
    ]);
  });

  it("AC-7 reports a missing row instead of inventing one", async () => {
    const { reader } = fakeReader(null);

    expect(await readDraftPortfolio(reader, "user-1")).toEqual({ status: "missing" });
  });

  it("AC-7 reports a failed read", async () => {
    const { reader } = fakeReader(null, "permission denied");

    expect(await readDraftPortfolio(reader, "user-1")).toEqual({
      status: "failed",
      message: "permission denied",
    });
  });

  it("AC-7 refuses a design the schema does not accept", async () => {
    const { reader } = fakeReader({
      design: { world: "nope" },
      content: EMPTY_CONTENT,
    });

    const result = await readDraftPortfolio(reader, "user-1");

    expect(result.status).toBe("invalid");

    if (result.status === "invalid") {
      expect(result.scope).toBe("design");
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("AC-7 refuses content the schema does not accept", async () => {
    const { reader } = fakeReader({
      design: DEFAULT_DESIGN,
      content: { version: 1 },
    });

    const result = await readDraftPortfolio(reader, "user-1");

    expect(result.status).toBe("invalid");

    if (result.status === "invalid") {
      expect(result.scope).toBe("content");
    }
  });
});
