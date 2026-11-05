import { describe, expect, it, vi } from "vitest";

import { emptyContent } from "@/portfolio/defaults";
import type { ContentDocument } from "@/schema";

import { imageUrlPrefix } from "../image-url";
import { SAVE_MESSAGES, saveDraft, type SaveDeps } from "../save";

const PREFIX = imageUrlPrefix("https://project.supabase.co");
const USER = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";

function validContent(): ContentDocument {
  return {
    ...emptyContent(),
    about: { text: "I build things for the web." },
    projects: {
      items: [
        {
          id: PROJECT_ID,
          title: "Folio",
          description: "A portfolio builder.",
          link: "https://example.com",
          imageUrl: `${PREFIX}${USER}/33333333-3333-4333-8333-333333333333.png`,
        },
      ],
    },
    skills: { skillIds: ["react", "typescript"] },
  };
}

function deps(overrides: Partial<SaveDeps> = {}): SaveDeps {
  return {
    knownSkillSlugs: new Set(["react", "typescript"]),
    imagePrefix: PREFIX,
    writeContent: vi.fn(async () => ({ error: null })),
    writeProfile: vi.fn(async () => ({ error: null })),
    now: () => "2026-11-05T10:00:00.000Z",
    ...overrides,
  };
}

const profile = { displayName: "Ada Lovelace", headline: "Analyst" };

describe("saveDraft", () => {
  it("AC-3 saves a valid document and the profile", async () => {
    const write = deps();

    const result = await saveDraft({ content: validContent(), profile }, write);

    expect(result).toEqual({ ok: true, savedAt: "2026-11-05T10:00:00.000Z" });
    expect(write.writeContent).toHaveBeenCalledTimes(1);
    expect(write.writeProfile).toHaveBeenCalledWith({
      displayName: "Ada Lovelace",
      headline: "Analyst",
    });
  });

  it("AC-3 rejects an over-long project title and writes nothing", async () => {
    const content = validContent();
    content.projects.items[0]!.title = "x".repeat(81);
    const write = deps();

    const result = await saveDraft({ content, profile }, write);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors).toEqual([
      { path: "projects.items.0.title", message: "Must be at most 80 characters" },
    ]);
    expect(result.ok === false && result.message).toBe(SAVE_MESSAGES.invalid);
    expect(write.writeContent).not.toHaveBeenCalled();
    expect(write.writeProfile).not.toHaveBeenCalled();
  });

  it("AC-3 rejects an empty required project title", async () => {
    const content = validContent();
    content.projects.items[0]!.title = "   ";
    const write = deps();

    const result = await saveDraft({ content, profile }, write);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors[0]?.path).toBe("projects.items.0.title");
    expect(write.writeContent).not.toHaveBeenCalled();
  });

  it("AC-3 rejects a missing display name", async () => {
    const write = deps();

    const result = await saveDraft({ content: validContent(), profile: { displayName: "", headline: "" } }, write);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors).toContainEqual({
      path: "profile.displayName",
      message: "Display name is required",
    });
    expect(write.writeContent).not.toHaveBeenCalled();
  });

  it("AC-3 reports the content and profile problems in one response", async () => {
    const content = validContent();
    content.projects.items[0]!.description = "x".repeat(401);

    const result = await saveDraft(
      { content, profile: { displayName: "", headline: "x".repeat(121) } },
      deps(),
    );

    expect(result.ok).toBe(false);
    const paths = result.ok === false ? result.errors.map((error) => error.path) : [];
    expect(paths).toContain("projects.items.0.description");
    expect(paths).toContain("profile.displayName");
    expect(paths).toContain("profile.headline");
  });

  it("AC-4 rejects a skill slug that is not in the list", async () => {
    const content = validContent();
    content.skills.skillIds = ["react", "not-a-skill"];
    const write = deps();

    const result = await saveDraft({ content, profile }, write);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors).toEqual([
      {
        path: "skills.skillIds.1",
        message: '"not-a-skill" is not in the skill list. Please pick it again.',
      },
    ]);
    expect(write.writeContent).not.toHaveBeenCalled();
  });

  it("AC-10 rejects an image URL from somewhere else", async () => {
    const content = validContent();
    content.projects.items[0]!.imageUrl = "https://evil.test/folio.png";
    const write = deps();

    const result = await saveDraft({ content, profile }, write);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors).toEqual([
      {
        path: "projects.items.0.imageUrl",
        message: "That image was not uploaded here. Please upload it again.",
      },
    ]);
    expect(write.writeContent).not.toHaveBeenCalled();
  });

  it("AC-10 rejects a URL that only contains the prefix", async () => {
    const content = validContent();
    content.projects.items[0]!.imageUrl = `https://evil.test/?next=${PREFIX}${USER}/a.png`;

    const result = await saveDraft({ content, profile }, deps());

    expect(result.ok).toBe(false);
  });

  it("AC-8 reports a failed content write and does not touch the profile", async () => {
    const write = deps({
      writeContent: vi.fn(async () => ({ error: { message: "connection reset" } })),
    });

    const result = await saveDraft({ content: validContent(), profile }, write);

    expect(result).toEqual({
      ok: false,
      errors: [],
      message: SAVE_MESSAGES.contentFailed,
    });
    expect(write.writeProfile).not.toHaveBeenCalled();
  });

  it("AC-8 says plainly when the content saved but the profile did not", async () => {
    const write = deps({
      writeProfile: vi.fn(async () => ({ error: { message: "timeout" } })),
    });

    const result = await saveDraft({ content: validContent(), profile }, write);

    expect(result).toEqual({
      ok: false,
      errors: [],
      message: SAVE_MESSAGES.profileFailed,
    });
    expect(write.writeContent).toHaveBeenCalledTimes(1);
  });

  it("AC-3 accepts a project without an image or link", async () => {
    const content = emptyContent();
    content.projects.items = [{ id: PROJECT_ID, title: "Bare", description: "" }];

    const result = await saveDraft({ content, profile }, deps());

    expect(result).toEqual({ ok: true, savedAt: "2026-11-05T10:00:00.000Z" });
  });

  it("AC-13 saves Arabic text unchanged", async () => {
    const content = validContent();
    content.about.text = "مرحبا، أنا عبدالله.";
    content.projects.items[0]!.title = "مشروع التخرج";

    const result = await saveDraft(
      { content, profile: { displayName: "عبدالله", headline: "مهندس برمجيات" } },
      deps(),
    );

    expect(result.ok).toBe(true);
  });
});
