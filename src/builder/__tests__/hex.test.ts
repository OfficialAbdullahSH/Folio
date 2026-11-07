import { describe, expect, it } from "vitest";

import { normalizeHexInput } from "../hex";

describe("normalizeHexInput", () => {
  it("AC-3 stores a lower case #rrggbb value", () => {
    expect(normalizeHexInput("#AABBCC")).toBe("#aabbcc");
    expect(normalizeHexInput("AABBCC")).toBe("#aabbcc");
    expect(normalizeHexInput("  #aAbBcC  ")).toBe("#aabbcc");
  });

  it("AC-3 rejects anything that is not six hex digits", () => {
    for (const value of ["", "#", "#abc", "#aabbccdd", "#gggggg", "rgb(0,0,0)", "aabbc"]) {
      expect(normalizeHexInput(value)).toBeNull();
    }
  });

  it("keeps a valid value unchanged", () => {
    expect(normalizeHexInput("#1c1917")).toBe("#1c1917");
  });
});
