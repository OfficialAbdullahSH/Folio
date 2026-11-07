import { describe, expect, it, vi } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import type { DesignDocument } from "@/schema";

import { SAVE_MESSAGES, saveDesign, type DesignSaveDeps } from "../save";

function deps(overrides: Partial<DesignSaveDeps> = {}): DesignSaveDeps {
  return {
    writeDesign: vi.fn(async () => ({ error: null })),
    now: () => "2026-11-07T09:00:00.000Z",
    ...overrides,
  };
}

describe("saveDesign", () => {
  it("AC-8 writes a valid design and reports when it was saved", async () => {
    const write = deps();
    const design = defaultDesign();

    const result = await saveDesign(design, write);

    expect(result).toEqual({ ok: true, savedAt: "2026-11-07T09:00:00.000Z" });
    expect(write.writeDesign).toHaveBeenCalledWith(design);
  });

  it("AC-8 refuses an invalid design and writes nothing", async () => {
    const write = deps();
    const broken = { ...defaultDesign(), world: "elsewhere" } as unknown as DesignDocument;

    const result = await saveDesign(broken, write);

    expect(result.ok).toBe(false);
    expect(write.writeDesign).not.toHaveBeenCalled();

    if (!result.ok) {
      expect(result.message).toBe(SAVE_MESSAGES.invalid);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("AC-8 refuses a design with an extra field", async () => {
    const write = deps();
    const extra = { ...defaultDesign(), sneaky: true } as unknown as DesignDocument;

    const result = await saveDesign(extra, write);

    expect(result.ok).toBe(false);
    expect(write.writeDesign).not.toHaveBeenCalled();
  });

  it("AC-8 reports a failed write without claiming a save", async () => {
    const write = deps({
      writeDesign: vi.fn(async () => ({ error: { message: "connection reset" } })),
    });

    const result = await saveDesign(defaultDesign(), write);

    expect(result).toEqual({ ok: false, errors: [], message: SAVE_MESSAGES.writeFailed });
  });

  it("AC-8 does not leak the database error to the owner", async () => {
    const write = deps({
      writeDesign: vi.fn(async () => ({ error: { message: "duplicate key value" } })),
    });

    const result = await saveDesign(defaultDesign(), write);

    expect(JSON.stringify(result)).not.toContain("duplicate key value");
  });
});
