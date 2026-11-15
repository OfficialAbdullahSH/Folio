import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BUILDER_NEXT_STEPS,
  EDITOR_NEXT_STEPS,
  nextStepsFor,
  PREVIEW_NEXT_STEP,
} from "../next-steps";

describe("the next-step links", () => {
  it("AC-1 offers Design and Preview after a saved content edit", () => {
    expect(nextStepsFor("editor", { status: "saved", dirty: false })).toEqual([
      { href: "/dashboard/design", label: "Next: design your portfolio" },
      { href: "/dashboard/preview", label: "Preview" },
    ]);
  });

  it("AC-1 hides them while the content has unsaved changes", () => {
    expect(nextStepsFor("editor", { status: "saved", dirty: true })).toEqual([]);
  });

  it("AC-1 hides them before a save and after a failed one", () => {
    expect(nextStepsFor("editor", { status: "idle", dirty: false })).toEqual([]);
    expect(nextStepsFor("editor", { status: "error", dirty: false })).toEqual([]);
    expect(nextStepsFor("editor", { status: "pending", dirty: false })).toEqual([]);
  });

  it("AC-2 offers Preview and the publish card after a saved design", () => {
    expect(nextStepsFor("builder", { status: "saved", dirty: false })).toEqual([
      { href: "/dashboard/preview", label: "Next: preview" },
      { href: "/dashboard#publish", label: "Publish" },
    ]);
  });

  it("AC-2 hides them while the design has unsaved changes", () => {
    expect(nextStepsFor("builder", { status: "saved", dirty: true })).toEqual([]);
  });

  it("AC-2 hides them before a save and after a failed one", () => {
    expect(nextStepsFor("builder", { status: "idle", dirty: false })).toEqual([]);
    expect(nextStepsFor("builder", { status: "error", dirty: false })).toEqual([]);
    expect(nextStepsFor("builder", { status: "pending", dirty: false })).toEqual([]);
  });

  it("AC-3 always offers publishing from the preview page", () => {
    expect(PREVIEW_NEXT_STEP).toEqual({
      href: "/dashboard#publish",
      label: "Next: publish",
    });
  });

  it("AC-5 names every step once, with a short plain label", () => {
    const labels = [...EDITOR_NEXT_STEPS, ...BUILDER_NEXT_STEPS, PREVIEW_NEXT_STEP].map(
      (step) => step.label,
    );

    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toMatch(/[!?]$/);
    }
  });

  it("AC-4 points every publish link at the id the publish card carries", () => {
    const card = readFileSync(
      join(process.cwd(), "src", "publish", "components", "publish-card.tsx"),
      "utf8",
    );

    expect(card).toContain('id="publish"');

    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

    expect(css).toMatch(/#publish\s*\{\s*scroll-margin-top:/);
  });
});
