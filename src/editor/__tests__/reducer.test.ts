import { describe, expect, it } from "vitest";

import { emptyContent } from "@/portfolio/defaults";
import { LIMITS, validateContent } from "@/schema";
import type { ContentDocument } from "@/schema";

import {
  currentYearMonth,
  editorReducer,
  editorStateFrom,
  newItemId,
  type EditorAction,
  type EditorState,
} from "../reducer";

function state(overrides: Partial<ContentDocument> = {}): EditorState {
  return editorStateFrom(
    { displayName: "Ada Lovelace", headline: "Analyst" },
    { ...emptyContent(), ...overrides },
  );
}

function run(initial: EditorState, actions: EditorAction[]): EditorState {
  return actions.reduce(editorReducer, initial);
}

/** A schema-valid id, so `validateContent` can be asserted on edited state. */
const uuid = (seed: number) => `00000000-0000-4000-8000-${String(seed).padStart(12, "0")}`;

const project = (id: string, title = "Project") => ({ id, title, description: "" });

describe("editor reducer", () => {
  it("AC-3 adds a project with the id it was given", () => {
    const next = editorReducer(state(), { type: "addProject", id: "p1" });

    expect(next.content.projects.items).toEqual([{ id: "p1", title: "", description: "" }]);
  });

  it("AC-3 adds up to the F-02 maximum and refuses the next one", () => {
    const full = state({
      projects: {
        items: Array.from({ length: LIMITS.projects }, (_, index) => project(`p${index}`)),
      },
    });

    expect(editorReducer(full, { type: "addProject", id: "p13" })).toBe(full);
    expect(full.content.projects.items).toHaveLength(12);
  });

  it("AC-3 refuses a thirteenth project, thirty-first skill, eleventh entry and ninth link", () => {
    const full = state({
      projects: {
        items: Array.from({ length: LIMITS.projects }, (_, index) => project(`p${index}`)),
      },
      skills: { skillIds: Array.from({ length: LIMITS.skillIds }, (_, index) => `skill-${index}`) },
      experience: {
        items: Array.from({ length: LIMITS.experience }, (_, index) => ({
          id: `e${index}`,
          kind: "experience" as const,
          title: "Title",
          organization: "Org",
          startDate: "2020-01",
        })),
      },
      contact: {
        items: Array.from({ length: LIMITS.contact }, (_, index) => ({
          id: `c${index}`,
          kind: "email" as const,
          label: "Email",
          value: "a@example.com",
        })),
      },
    });

    expect(editorReducer(full, { type: "addProject", id: "p13" })).toBe(full);
    expect(editorReducer(full, { type: "addSkill", slug: "extra" })).toBe(full);
    expect(editorReducer(full, { type: "addExperience", id: "e11", startDate: "2020-01" })).toBe(full);
    expect(editorReducer(full, { type: "addContact", id: "c9" })).toBe(full);
  });

  it("AC-3 removes a project that has an image", () => {
    const initial = state({
      projects: { items: [{ ...project("p1"), imageUrl: "https://x.test/a.png" }] },
    });

    const next = editorReducer(initial, { type: "removeProject", id: "p1" });

    expect(next.content.projects.items).toEqual([]);
  });

  it("AC-3 moves items up and down", () => {
    const initial = state({
      projects: { items: [project("a"), project("b"), project("c")] },
    });

    const down = editorReducer(initial, { type: "moveProject", id: "a", direction: "down" });
    expect(down.content.projects.items.map((item) => item.id)).toEqual(["b", "a", "c"]);

    const up = editorReducer(down, { type: "moveProject", id: "c", direction: "up" });
    expect(up.content.projects.items.map((item) => item.id)).toEqual(["b", "c", "a"]);
  });

  it("AC-3 ignores moving the first item up and the last item down", () => {
    const initial = state({
      projects: { items: [project("a"), project("b")] },
    });

    expect(editorReducer(initial, { type: "moveProject", id: "a", direction: "up" })).toBe(initial);
    expect(editorReducer(initial, { type: "moveProject", id: "b", direction: "down" })).toBe(initial);
    expect(editorReducer(initial, { type: "moveProject", id: "nope", direction: "up" })).toBe(initial);
  });

  it("AC-3 sets a field and clips it to the F-02 limit", () => {
    const initial = state({ projects: { items: [project(uuid(1))] } });

    const long = "x".repeat(LIMITS.projectTitle + 20);
    const next = editorReducer(initial, {
      type: "setProjectField",
      id: uuid(1),
      field: "title",
      value: long,
    });

    expect(next.content.projects.items[0]?.title).toHaveLength(LIMITS.projectTitle);
    expect(validateContent(next.content).success).toBe(true);
  });

  it("AC-3 clips the about text, display name and headline", () => {
    const initial = state();

    const next = run(initial, [
      { type: "setAbout", value: "a".repeat(LIMITS.aboutText + 10) },
      { type: "setProfileField", field: "displayName", value: "b".repeat(LIMITS.displayName + 5) },
      { type: "setProfileField", field: "headline", value: "c".repeat(LIMITS.headline + 5) },
    ]);

    expect(next.content.about.text).toHaveLength(LIMITS.aboutText);
    expect(next.profile.displayName).toHaveLength(LIMITS.displayName);
    expect(next.profile.headline).toHaveLength(LIMITS.headline);
  });

  it("AC-3 keeps a very long unbroken word inside the limit", () => {
    const initial = state({ projects: { items: [project("p1")] } });
    const next = editorReducer(initial, {
      type: "setProjectField",
      id: "p1",
      field: "title",
      value: "W".repeat(500),
    });

    expect(next.content.projects.items[0]?.title.length).toBeLessThanOrEqual(
      LIMITS.projectTitle,
    );
  });

  it("AC-3 adds a skill once and removes it", () => {
    const added = run(state(), [
      { type: "addSkill", slug: "react" },
      { type: "addSkill", slug: "react" },
    ]);

    expect(added.content.skills.skillIds).toEqual(["react"]);

    const removed = editorReducer(added, { type: "removeSkill", slug: "react" });
    expect(removed.content.skills.skillIds).toEqual([]);
  });

  it("AC-3 refuses an empty skill slug and one longer than the schema allows", () => {
    const initial = state();

    expect(editorReducer(initial, { type: "addSkill", slug: "   " })).toBe(initial);
    expect(
      editorReducer(initial, { type: "addSkill", slug: "a".repeat(LIMITS.skillSlug + 1) }),
    ).toBe(initial);
  });

  it("AC-11 turns current on and removes the end date", () => {
    const initial = state({
      experience: {
        items: [
          {
            id: "e1",
            kind: "experience",
            title: "Engineer",
            organization: "Acme",
            startDate: "2020-01",
            endDate: "2021-06",
            current: false,
          },
        ],
      },
    });

    const next = editorReducer(initial, { type: "toggleExperienceCurrent", id: "e1" });

    expect(next.content.experience.items[0]?.current).toBe(true);
    expect(next.content.experience.items[0]).not.toHaveProperty("endDate");
  });

  it("AC-11 keeps current and an end date from coexisting in the form state", () => {
    const initial = state({
      experience: {
        items: [
          {
            id: "e1",
            kind: "experience",
            title: "Engineer",
            organization: "Acme",
            startDate: "2020-01",
            current: true,
          },
        ],
      },
    });

    const withEnd = editorReducer(initial, {
      type: "setExperienceEnd",
      id: "e1",
      value: "2022-01",
    });

    expect(withEnd.content.experience.items[0]?.current).toBe(false);
    expect(withEnd.content.experience.items[0]?.endDate).toBe("2022-01");

    const cleared = editorReducer(withEnd, {
      type: "setExperienceEnd",
      id: "e1",
      value: undefined,
    });

    expect(cleared.content.experience.items[0]).not.toHaveProperty("endDate");
  });

  it("AC-3 sets and clears a project image", () => {
    const initial = state({ projects: { items: [project("p1")] } });

    const withImage = editorReducer(initial, {
      type: "setProjectImage",
      id: "p1",
      value: "https://project.test/storage/v1/object/public/project-images/u/a.png",
    });
    expect(withImage.content.projects.items[0]?.imageUrl).toBe(
      "https://project.test/storage/v1/object/public/project-images/u/a.png",
    );

    const cleared = editorReducer(withImage, {
      type: "setProjectImage",
      id: "p1",
      value: undefined,
    });
    expect(cleared.content.projects.items[0]).not.toHaveProperty("imageUrl");
  });

  it("AC-3 adds, edits, moves and removes experience and contact items", () => {
    const added = run(state(), [
      { type: "addExperience", id: "e1", startDate: "2021-09" },
      { type: "addExperience", id: "e2", startDate: "2023-01" },
      { type: "setExperienceKind", id: "e1", kind: "education" },
      { type: "setExperienceField", id: "e1", field: "title", value: "BSc" },
      { type: "setExperienceField", id: "e1", field: "organization", value: "University" },
      { type: "setExperienceStart", id: "e1", value: "2019-09" },
      { type: "moveExperience", id: "e2", direction: "up" },
      { type: "addContact", id: "c1" },
      { type: "setContactKind", id: "c1", kind: "github" },
      { type: "setContactField", id: "c1", field: "label", value: "GitHub" },
      { type: "setContactField", id: "c1", field: "value", value: "https://github.com/ada" },
      { type: "addContact", id: "c2" },
      { type: "moveContact", id: "c2", direction: "up" },
    ]);

    expect(added.content.experience.items.map((item) => item.id)).toEqual(["e2", "e1"]);
    expect(added.content.experience.items[1]).toMatchObject({
      kind: "education",
      title: "BSc",
      organization: "University",
      startDate: "2019-09",
    });
    expect(added.content.contact.items.map((item) => item.id)).toEqual(["c2", "c1"]);
    expect(added.content.contact.items[1]).toMatchObject({
      kind: "github",
      label: "GitHub",
      value: "https://github.com/ada",
    });

    const removed = run(added, [
      { type: "removeExperience", id: "e1" },
      { type: "removeContact", id: "c1" },
    ]);

    expect(removed.content.experience.items.map((item) => item.id)).toEqual(["e2"]);
    expect(removed.content.contact.items.map((item) => item.id)).toEqual(["c2"]);
  });

  it("AC-3 returns the same state for an unknown id", () => {
    const initial = state({ projects: { items: [project("p1")] } });

    expect(
      editorReducer(initial, { type: "removeProject", id: "missing" }),
    ).toBe(initial);
    expect(
      editorReducer(initial, {
        type: "setProjectField",
        id: "missing",
        field: "title",
        value: "x",
      }),
    ).toBe(initial);
    expect(editorReducer(initial, { type: "removeSkill", slug: "react" })).toBe(initial);
  });

  it("AC-3 produces a fresh v4 UUID per item", () => {
    const first = newItemId();
    const second = newItemId();

    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first).not.toBe(second);
  });

  it("AC-11 formats the current month as YYYY-MM", () => {
    expect(currentYearMonth(new Date(2026, 10, 5))).toBe("2026-11");
    expect(currentYearMonth(new Date(2026, 0, 1))).toBe("2026-01");
  });

  it("AC-13 keeps Arabic text as written", () => {
    const next = run(state(), [
      { type: "setAbout", value: "مرحبا، أنا مهندسة برمجيات." },
      { type: "setProfileField", field: "displayName", value: "عبدالله" },
      { type: "addProject", id: uuid(9) },
      { type: "setProjectField", id: uuid(9), field: "title", value: "مشروع التخرج" },
    ]);

    expect(next.content.about.text).toBe("مرحبا، أنا مهندسة برمجيات.");
    expect(next.profile.displayName).toBe("عبدالله");
    expect(next.content.projects.items[0]?.title).toBe("مشروع التخرج");
    expect(validateContent(next.content).success).toBe(true);
  });

  it("AC-3 never mutates the state it was given", () => {
    const initial = state({ projects: { items: [project("p1")] } });
    const snapshot = structuredClone(initial);

    run(initial, [
      { type: "addProject", id: "p2" },
      { type: "setProjectField", id: "p1", field: "title", value: "Changed" },
      { type: "moveProject", id: "p2", direction: "up" },
      { type: "removeProject", id: "p1" },
      { type: "addSkill", slug: "react" },
    ]);

    expect(initial).toEqual(snapshot);
  });
});
