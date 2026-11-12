import { describe, expect, it } from "vitest";

import { emptyContent } from "@/portfolio/defaults";
import { editorialDesign, fullContent, validProfile } from "@/schema/fixtures";

import { buildSnapshot, canonicalize, publishState } from "../snapshot";

const profile = {
  username: validProfile.username,
  displayName: validProfile.displayName,
  headline: validProfile.headline,
};

describe("buildSnapshot", () => {
  it("AC-1 builds a snapshot from the saved draft and the profile", () => {
    const result = buildSnapshot({
      design: editorialDesign,
      content: fullContent,
      profile,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.snapshot).toEqual({
        username: validProfile.username,
        displayName: validProfile.displayName,
        headline: validProfile.headline,
        design: editorialDesign,
        content: fullContent,
      });
    }
  });

  it("AC-1 refuses an invalid design and names the field path", () => {
    const result = buildSnapshot({
      design: { ...editorialDesign, world: "elsewhere" },
      content: emptyContent(),
      profile,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.some((error) => error.path.startsWith("design."))).toBe(true);
      expect("snapshot" in result).toBe(false);
    }
  });

  it("AC-1 refuses invalid content and names the field path", () => {
    const result = buildSnapshot({
      design: editorialDesign,
      content: { ...emptyContent(), about: { text: 42 } },
      profile,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.some((error) => error.path.startsWith("content."))).toBe(true);
    }
  });

  it("AC-1 refuses an invalid profile and names the field path", () => {
    const result = buildSnapshot({
      design: editorialDesign,
      content: emptyContent(),
      profile: { ...profile, username: "Not A Name" },
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.some((error) => error.path === "profile.username")).toBe(true);
    }
  });

  it("AC-1 reports every invalid document in one result", () => {
    const result = buildSnapshot({
      design: { ...editorialDesign, version: 2 },
      content: { ...emptyContent(), projects: { items: "many" } },
      profile: { ...profile, displayName: "   " },
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.some((error) => error.path.startsWith("design."))).toBe(true);
      expect(result.errors.some((error) => error.path.startsWith("content."))).toBe(true);
      expect(result.errors.some((error) => error.path === "profile.displayName")).toBe(true);
    }
  });
});

describe("canonicalize", () => {
  it("AC-4 ignores key order at every level", () => {
    const first = { b: 1, a: { d: 2, c: [3, 4] } };
    const second = { a: { c: [3, 4], d: 2 }, b: 1 };

    expect(canonicalize(first)).toBe(canonicalize(second));
  });

  it("AC-4 keeps array order significant", () => {
    expect(canonicalize([1, 2, 3])).not.toBe(canonicalize([3, 2, 1]));
  });
});

describe("publishState", () => {
  const draft = {
    design: editorialDesign,
    content: fullContent,
    displayName: profile.displayName,
    headline: profile.headline,
  };

  it("AC-4 reports not published when there is no snapshot", () => {
    expect(publishState({ draft, published: null })).toBe("not-published");
  });

  it("AC-4 reports current when the draft matches the snapshot", () => {
    expect(publishState({ draft, published: { ...draft } })).toBe("current");
  });

  it("AC-4 treats the same data with a different key order as current", () => {
    const published = {
      design: JSON.parse(JSON.stringify(editorialDesign)) as typeof editorialDesign,
      content: fullContent,
      displayName: profile.displayName,
      headline: profile.headline,
    };

    expect(publishState({ draft, published })).toBe("current");
  });

  it("AC-4 reports unpublished changes when the design changes", () => {
    const published = {
      ...draft,
      design: { ...editorialDesign, world: "terminal" as const },
    };

    expect(publishState({ draft, published })).toBe("changes");
  });

  it("AC-4 reports unpublished changes when the content changes", () => {
    const published = {
      ...draft,
      content: { ...fullContent, about: { text: "A different about section." } },
    };

    expect(publishState({ draft, published })).toBe("changes");
  });

  it("AC-4 reports unpublished changes when the display name or headline changes", () => {
    expect(publishState({ draft, published: { ...draft, displayName: "Someone Else" } })).toBe(
      "changes",
    );
    expect(publishState({ draft, published: { ...draft, headline: "A new headline" } })).toBe(
      "changes",
    );
  });
});
