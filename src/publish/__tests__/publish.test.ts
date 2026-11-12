import { describe, expect, it, vi } from "vitest";

import { editorialDesign, fullContent, validProfile } from "@/schema/fixtures";

import {
  PUBLISH_MESSAGES,
  publishSnapshot,
  resetToPublished,
  unpublishPortfolio,
} from "../publish";
import type { PublishDeps } from "../publish";

const IMAGE_PREFIX = "https://example.supabase.co/storage/v1/object/public/project-images/";

const profile = {
  username: validProfile.username,
  displayName: validProfile.displayName,
  headline: validProfile.headline,
};

function deps(overrides: Partial<PublishDeps> = {}): PublishDeps & {
  written: unknown[];
} {
  const written: unknown[] = [];

  return {
    knownSkillSlugs: new Set(["typescript", "react", "figma"]),
    imagePrefix: IMAGE_PREFIX,
    writeSnapshot: async (snapshot) => {
      written.push(snapshot);
      return { error: null };
    },
    written,
    ...overrides,
  };
}

const content = {
  ...fullContent,
  skills: { skillIds: ["typescript", "react"] },
  projects: {
    items: [
      {
        id: "0f0b6f5e-3a2b-4c1d-8e9f-1a2b3c4d5e6f",
        title: "Folio",
        description: "A portfolio builder where design is data.",
        imageUrl: `${IMAGE_PREFIX}11111111-1111-4111-8111-111111111111/folio.webp`,
      },
    ],
  },
};

describe("publishSnapshot", () => {
  it("AC-2 publishes the snapshot built from the server-side profile and draft", async () => {
    const d = deps();

    const result = await publishSnapshot(
      { design: editorialDesign, content, profile },
      d,
    );

    expect(result).toEqual({ ok: true, username: validProfile.username });
    expect(d.written).toEqual([
      {
        username: validProfile.username,
        displayName: validProfile.displayName,
        headline: validProfile.headline,
        design: editorialDesign,
        content,
      },
    ]);
  });

  it("AC-1 refuses invalid documents and writes nothing", async () => {
    const d = deps();

    const result = await publishSnapshot(
      { design: { ...editorialDesign, world: "elsewhere" }, content, profile },
      d,
    );

    expect(result.ok).toBe(false);
    expect(d.written).toEqual([]);

    if (!result.ok) {
      expect(result.message).toBe(PUBLISH_MESSAGES.invalid);
      expect(result.errors.some((error) => error.path.startsWith("design."))).toBe(true);
    }
  });

  it("AC-1 refuses a skill slug that is not in the list and names the field", async () => {
    const d = deps();

    const result = await publishSnapshot(
      {
        design: editorialDesign,
        content: { ...content, skills: { skillIds: ["typescript", "cobol"] } },
        profile,
      },
      d,
    );

    expect(result.ok).toBe(false);
    expect(d.written).toEqual([]);

    if (!result.ok) {
      expect(result.errors).toEqual([
        {
          path: "content.skills.skillIds.1",
          message: `"cobol" is not in the skill list. Please pick it again.`,
        },
      ]);
    }
  });

  it("AC-1 refuses an image URL outside the project bucket and names the field", async () => {
    const d = deps();

    const result = await publishSnapshot(
      {
        design: editorialDesign,
        content: {
          ...content,
          projects: {
            items: [
              {
                ...content.projects.items[0],
                imageUrl: "https://example.com/not-ours.png",
              },
            ],
          },
        },
        profile,
      },
      d,
    );

    expect(result.ok).toBe(false);
    expect(d.written).toEqual([]);

    if (!result.ok) {
      expect(result.errors).toEqual([
        {
          path: "content.projects.items.0.imageUrl",
          message: "That image was not uploaded here. Please upload it again.",
        },
      ]);
    }
  });

  it("AC-3 republishing writes again and reports the same username", async () => {
    const d = deps();

    const first = await publishSnapshot({ design: editorialDesign, content, profile }, d);
    const second = await publishSnapshot(
      { design: editorialDesign, content: { ...content, about: { text: "Updated." } }, profile },
      d,
    );

    expect(first).toEqual({ ok: true, username: validProfile.username });
    expect(second).toEqual({ ok: true, username: validProfile.username });
    expect(d.written).toHaveLength(2);
  });

  it("AC-3 reports a failed write without claiming the portfolio is published", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const d = deps({
      writeSnapshot: async () => ({ error: { message: "connection reset" } }),
    });

    const result = await publishSnapshot({ design: editorialDesign, content, profile }, d);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.message).toBe(PUBLISH_MESSAGES.failed);
    }

    vi.restoreAllMocks();
  });
});

describe("unpublishPortfolio", () => {
  it("AC-5 deletes the published row", async () => {
    const removePublished = vi.fn(async () => ({ error: null }));

    const result = await unpublishPortfolio({ removePublished });

    expect(result).toEqual({ ok: true });
    expect(removePublished).toHaveBeenCalledTimes(1);
  });

  it("AC-5 reports a failed delete instead of claiming success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await unpublishPortfolio({
      removePublished: async () => ({ error: { message: "permission denied" } }),
    });

    expect(result).toEqual({ ok: false, message: PUBLISH_MESSAGES.unpublishFailed });

    vi.restoreAllMocks();
  });
});

describe("resetToPublished", () => {
  it("AC-6 replaces the draft with the published snapshot", async () => {
    const writeDraft = vi.fn(async () => ({ error: null }));

    const result = await resetToPublished(
      { design: editorialDesign, content },
      { writeDraft },
    );

    expect(result).toEqual({ ok: true });
    expect(writeDraft).toHaveBeenCalledWith({ design: editorialDesign, content });
  });

  it("AC-6 refuses when nothing is published", async () => {
    const writeDraft = vi.fn(async () => ({ error: null }));

    const result = await resetToPublished(null, { writeDraft });

    expect(result).toEqual({ ok: false, message: PUBLISH_MESSAGES.notPublished });
    expect(writeDraft).not.toHaveBeenCalled();
  });

  it("AC-6 refuses a published snapshot that no longer validates", async () => {
    const writeDraft = vi.fn(async () => ({ error: null }));

    const result = await resetToPublished(
      { design: { ...editorialDesign, world: "elsewhere" }, content },
      { writeDraft },
    );

    expect(result.ok).toBe(false);
    expect(writeDraft).not.toHaveBeenCalled();
  });

  it("AC-6 reports a failed write instead of claiming success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await resetToPublished(
      { design: editorialDesign, content },
      { writeDraft: async () => ({ error: { message: "connection reset" } }) },
    );

    expect(result).toEqual({ ok: false, message: PUBLISH_MESSAGES.resetFailed });

    vi.restoreAllMocks();
  });
});
