import { describe, expect, it } from "vitest";

import { validateContent, validateDesign } from "@/schema";

import { DEFAULT_DESIGN, EMPTY_CONTENT } from "../defaults";
import { ensureDraftPortfolio, newDraftRow, type DraftRow, type DraftStore } from "../draft";

function fakeStore(failWith?: string) {
  const rows = new Map<string, DraftRow>();
  const calls: { table: string; row: DraftRow; options: unknown }[] = [];

  const store: DraftStore = {
    from(table) {
      return {
        upsert(row, options) {
          calls.push({ table, row, options });

          if (failWith !== undefined) {
            return Promise.resolve({ error: { message: failWith } });
          }

          // ON CONFLICT DO NOTHING: the first write wins, later ones are ignored.
          if (!rows.has(row.user_id)) {
            rows.set(row.user_id, row);
          }

          return Promise.resolve({ error: null });
        },
      };
    },
  };

  return { store, rows, calls };
}

describe("draft portfolio", () => {
  it("AC-7 builds a row from the defaults", () => {
    const row = newDraftRow("user-1");

    expect(row.user_id).toBe("user-1");
    expect(row.design).toEqual(DEFAULT_DESIGN);
    expect(row.content).toEqual(EMPTY_CONTENT);
    expect(validateDesign(row.design).success).toBe(true);
    expect(validateContent(row.content).success).toBe(true);
  });

  it("AC-7 writes to portfolios with on-conflict do-nothing", async () => {
    const { store, calls } = fakeStore();

    const result = await ensureDraftPortfolio(store, "user-1");

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.table).toBe("portfolios");
    expect(calls[0]?.options).toEqual({ onConflict: "user_id", ignoreDuplicates: true });
  });

  it("AC-7 two simultaneous first loads leave exactly one row", async () => {
    const { store, rows } = fakeStore();

    await Promise.all([
      ensureDraftPortfolio(store, "user-1"),
      ensureDraftPortfolio(store, "user-1"),
    ]);
    await ensureDraftPortfolio(store, "user-1");

    expect(rows.size).toBe(1);
    expect(rows.get("user-1")?.user_id).toBe("user-1");
  });

  it("AC-7 reports a write failure without throwing", async () => {
    const { store } = fakeStore("permission denied");

    const result = await ensureDraftPortfolio(store, "user-1");

    expect(result).toEqual({ ok: false, message: "permission denied" });
  });
});
