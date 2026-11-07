import { describe, expect, it } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import { validateDesign } from "@/schema";

import {
  DESIGN_MESSAGE_TYPE,
  createDesignMessage,
  designFromMessage,
  parseDesignMessage,
} from "../messages";

const ORIGIN = "https://folio.example";
const parent = { name: "parent window" };

function context() {
  return { origin: ORIGIN, parent };
}

function event(overrides: Partial<{ origin: string; source: unknown; data: unknown }> = {}) {
  return {
    origin: ORIGIN,
    source: parent,
    data: createDesignMessage(defaultDesign()),
    ...overrides,
  };
}

describe("createDesignMessage", () => {
  it("tags the design with the Folio message type", () => {
    const design = defaultDesign();

    expect(createDesignMessage(design)).toEqual({ type: DESIGN_MESSAGE_TYPE, design });
  });
});

describe("parseDesignMessage", () => {
  it("returns the design from a valid message", () => {
    const design = defaultDesign();

    expect(parseDesignMessage(createDesignMessage(design))).toEqual(design);
  });

  it("AC-7 ignores a message of another type, a non-object and a design the validator rejects", () => {
    const broken = { ...defaultDesign(), world: "elsewhere" };

    expect(parseDesignMessage({ type: "other", design: defaultDesign() })).toBeNull();
    expect(parseDesignMessage("folio:design")).toBeNull();
    expect(parseDesignMessage(null)).toBeNull();
    expect(parseDesignMessage({ type: DESIGN_MESSAGE_TYPE, design: broken })).toBeNull();
    expect(validateDesign(broken).success).toBe(false);
  });
});

describe("designFromMessage", () => {
  it("AC-7 accepts a design from this page's parent on this origin", () => {
    expect(designFromMessage(event(), context())).toEqual(defaultDesign());
  });

  it("AC-7 ignores a message from another origin", () => {
    expect(designFromMessage(event({ origin: "https://evil.example" }), context())).toBeNull();
  });

  it("AC-7 ignores a message from a window that is not the parent", () => {
    expect(designFromMessage(event({ source: { name: "child" } }), context())).toBeNull();
  });

  it("ignores every message when the frame has no parent", () => {
    expect(
      designFromMessage(event(), { origin: ORIGIN, parent: null }),
    ).toBeNull();
  });
});
