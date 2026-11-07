import { describe, expect, it } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import { validateDesign } from "@/schema";

import { readabilityWarnings } from "../contrast";
import { LOOKS, lookById, lookIdFor } from "../looks";

describe("LOOKS", () => {
  it("AC-4 offers at least eight distinct looks", () => {
    expect(LOOKS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(LOOKS.map((look) => look.id)).size).toBe(LOOKS.length);
  });

  it("AC-4 every look is a complete theme the validator accepts", () => {
    for (const look of LOOKS) {
      const document = { ...defaultDesign(), theme: look.theme };

      expect(validateDesign(document).success, look.id).toBe(true);
    }
  });

  it("AC-4 every look is readable enough to ship without a warning", () => {
    for (const look of LOOKS) {
      expect(readabilityWarnings(look.theme), look.id).toEqual([]);
    }
  });

  it("every look names itself and describes its palette", () => {
    for (const look of LOOKS) {
      expect(look.name.trim().length).toBeGreaterThan(0);
      expect(look.description.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("lookById", () => {
  it("finds a look and returns undefined for an unknown id", () => {
    expect(lookById("paper")?.id).toBe("paper");
    expect(lookById("nope")).toBeUndefined();
  });
});

describe("lookIdFor", () => {
  it("AC-4 returns the look whose theme matches exactly", () => {
    const look = LOOKS[0]!;

    expect(lookIdFor(look.theme)).toBe(look.id);
  });

  it("AC-4 returns null once a single token is changed", () => {
    const look = LOOKS[0]!;

    expect(
      lookIdFor({ ...look.theme, colors: { ...look.theme.colors, accent: "#123456" } }),
    ).toBeNull();
  });
});
