import { describe, expect, it } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";
import type { DesignDocument } from "@/schema";

import { LOOKS } from "../looks";
import { allowedStyles, designReducer, type DesignAction } from "../reducer";

function order(design: DesignDocument): string[] {
  return design.sections.map((section) => section.id);
}

describe("designReducer", () => {
  it("AC-2 switches the world", () => {
    const next = designReducer(defaultDesign(), { type: "setWorld", world: "terminal" });

    expect(next.world).toBe("terminal");
  });

  it("returns the same state when the world does not change", () => {
    const state = defaultDesign();

    expect(designReducer(state, { type: "setWorld", world: state.world })).toBe(state);
  });

  it("AC-4 applies a look's colors, fonts and radius together", () => {
    const look = LOOKS[1]!;
    const next = designReducer(defaultDesign(), { type: "applyLook", lookId: look.id });

    expect(next.theme).toEqual(look.theme);
  });

  it("AC-4 does not share the look's theme object with the state", () => {
    const look = LOOKS[1]!;
    const next = designReducer(defaultDesign(), { type: "applyLook", lookId: look.id });

    expect(next.theme).not.toBe(look.theme);
    expect(next.theme.colors).not.toBe(look.theme.colors);
  });

  it("ignores an unknown look", () => {
    const state = defaultDesign();

    expect(designReducer(state, { type: "applyLook", lookId: "nope" })).toBe(state);
  });

  it("AC-3 stores a color as lower case hex and leaves the other roles alone", () => {
    const state = defaultDesign();
    const next = designReducer(state, {
      type: "setColor",
      role: "accent",
      value: "#AABBCC",
    });

    expect(next.theme.colors.accent).toBe("#aabbcc");
    expect(next.theme.colors.text).toBe(state.theme.colors.text);
  });

  it("AC-3 ignores a color that is not six hex digits", () => {
    const state = defaultDesign();

    expect(designReducer(state, { type: "setColor", role: "accent", value: "red" })).toBe(
      state,
    );
  });

  it("sets the heading and body fonts separately", () => {
    const state = defaultDesign();
    const heading = designReducer(state, {
      type: "setFont",
      role: "heading",
      font: "lora",
    });
    const both = designReducer(heading, { type: "setFont", role: "body", font: "cairo" });

    expect(heading.theme.headingFont).toBe("lora");
    expect(heading.theme.bodyFont).toBe(state.theme.bodyFont);
    expect(both.theme.bodyFont).toBe("cairo");
  });

  it("AC-2 sets the corner roundness", () => {
    const next = designReducer(defaultDesign(), { type: "setRadius", radius: "lg" });

    expect(next.theme.radius).toBe("lg");
  });

  it("AC-11 moves a section up and back down", () => {
    const state = defaultDesign();
    const first = order(state);

    const moved = designReducer(state, {
      type: "moveSection",
      id: first[2]! as never,
      direction: "up",
    });

    expect(order(moved)).toEqual([first[0], first[2], first[1], ...first.slice(3)]);

    const back = designReducer(moved, {
      type: "moveSection",
      id: first[2]! as never,
      direction: "down",
    });

    expect(order(back)).toEqual(first);
  });

  it("AC-2 does nothing when a section cannot move further", () => {
    const state = defaultDesign();
    const first = order(state)[0]!;

    expect(
      designReducer(state, { type: "moveSection", id: first as never, direction: "up" }),
    ).toBe(state);
  });

  it("AC-11 toggles a section's visibility", () => {
    const state = defaultDesign();
    const id = state.sections[1]!.id;
    const hidden = designReducer(state, { type: "toggleVisibility", id });
    const shown = designReducer(hidden, { type: "toggleVisibility", id });

    expect(hidden.sections[1]?.visible).toBe(!state.sections[1]!.visible);
    expect(shown.sections[1]?.visible).toBe(state.sections[1]!.visible);
  });

  it("AC-11 sets a display style the section accepts", () => {
    const state = defaultDesign();
    const next = designReducer(state, {
      type: "setDisplayStyle",
      id: "projects",
      style: "timeline",
    });

    expect(next.sections.find((section) => section.id === "projects")).toMatchObject({
      displayStyle: "timeline",
    });
  });

  it("AC-11 ignores a display style the section does not accept", () => {
    const state = defaultDesign();

    expect(
      designReducer(state, { type: "setDisplayStyle", id: "about", style: "grid" }),
    ).toBe(state);
    expect(
      designReducer(state, { type: "setDisplayStyle", id: "projects", style: "nope" }),
    ).toBe(state);
  });

  it("offers no display styles for about and contact", () => {
    expect(allowedStyles("about")).toEqual([]);
    expect(allowedStyles("contact")).toEqual([]);
    expect(allowedStyles("projects").length).toBeGreaterThan(1);
  });

  it("AC-2 always keeps exactly the six section ids, each once", () => {
    const actions: DesignAction[] = [
      { type: "setWorld", world: "terminal" },
      { type: "applyLook", lookId: "neon" },
      { type: "setColor", role: "accent", value: "#123456" },
      { type: "setFont", role: "body", font: "lora" },
      { type: "setRadius", radius: "none" },
      { type: "moveSection", id: "contact", direction: "up" },
      { type: "moveSection", id: "hero", direction: "down" },
      { type: "toggleVisibility", id: "skills" },
      { type: "setDisplayStyle", id: "experience", style: "cards" },
      { type: "reset" },
    ];

    let state = defaultDesign();

    for (const action of actions) {
      state = designReducer(state, action);

      expect(state.sections.map((section) => section.id).sort()).toEqual(
        [...defaultDesign().sections.map((section) => section.id)].sort(),
      );
      expect(new Set(state.sections.map((section) => section.id)).size).toBe(6);
    }
  });

  it("resets to the default design", () => {
    const changed = designReducer(defaultDesign(), { type: "setRadius", radius: "lg" });

    expect(designReducer(changed, { type: "reset" })).toEqual(defaultDesign());
  });
});
