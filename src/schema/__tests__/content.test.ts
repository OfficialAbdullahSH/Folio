import { describe, expect, it } from "vitest";

import { contentDocumentSchema } from "../content.schema";
import { emptyContent, fullContent } from "../fixtures";

const parse = (input: unknown) => contentDocumentSchema.safeParse(input);

const base = () => structuredClone(fullContent);

const project = (patch: Record<string, unknown> = {}) => ({
  id: crypto.randomUUID(),
  title: "Project",
  description: "",
  ...patch,
});

const experience = (patch: Record<string, unknown> = {}) => ({
  id: crypto.randomUUID(),
  kind: "experience",
  title: "Engineer",
  organization: "Northwind",
  startDate: "2023-06",
  ...patch,
});

describe("content document", () => {
  it("AC-7 parses a valid full content document and an empty one", () => {
    expect(parse(fullContent).success).toBe(true);
    expect(parse(emptyContent).success).toBe(true);
  });

  it("AC-7 rejects unknown keys", () => {
    expect(parse({ ...base(), extra: 1 }).success).toBe(false);
    expect(parse({ ...base(), about: { text: "", html: "<p>x</p>" } }).success).toBe(false);
    expect(
      parse({
        ...base(),
        projects: { items: [project({ tags: ["a"] })] },
      }).success,
    ).toBe(false);
    expect(parse({ ...base(), skills: { skillIds: [], aliases: [] } }).success).toBe(false);
  });

  it("AC-7 enforces the list maximums", () => {
    const projects = (count: number) =>
      parse({
        ...base(),
        projects: { items: Array.from({ length: count }, () => project()) },
      });
    expect(projects(12).success).toBe(true);
    expect(projects(13).success).toBe(false);

    const skills = (count: number) =>
      parse({
        ...base(),
        skills: { skillIds: Array.from({ length: count }, (_, i) => `skill-${i}`) },
      });
    expect(skills(30).success).toBe(true);
    expect(skills(31).success).toBe(false);

    const experienceList = (count: number) =>
      parse({
        ...base(),
        experience: { items: Array.from({ length: count }, () => experience()) },
      });
    expect(experienceList(10).success).toBe(true);
    expect(experienceList(11).success).toBe(false);

    const contact = (count: number) =>
      parse({
        ...base(),
        contact: {
          items: Array.from({ length: count }, () => ({
            id: crypto.randomUUID(),
            kind: "website",
            label: "Site",
            value: "https://example.com",
          })),
        },
      });
    expect(contact(8).success).toBe(true);
    expect(contact(9).success).toBe(false);
  });

  it("AC-7 enforces string length limits at the boundary", () => {
    const about = (length: number) =>
      parse({ ...base(), about: { text: "a".repeat(length) } });
    expect(about(1500).success).toBe(true);
    expect(about(1501).success).toBe(false);

    const title = (length: number) =>
      parse({ ...base(), projects: { items: [project({ title: "a".repeat(length) })] } });
    expect(title(80).success).toBe(true);
    expect(title(81).success).toBe(false);

    const description = (length: number) =>
      parse({
        ...base(),
        projects: { items: [project({ description: "a".repeat(length) })] },
      });
    expect(description(400).success).toBe(true);
    expect(description(401).success).toBe(false);

    const slug = (length: number) =>
      parse({ ...base(), skills: { skillIds: ["a".repeat(length)] } });
    expect(slug(40).success).toBe(true);
    expect(slug(41).success).toBe(false);

    const experienceDescription = (length: number) =>
      parse({
        ...base(),
        experience: { items: [experience({ description: "a".repeat(length) })] },
      });
    expect(experienceDescription(300).success).toBe(true);
    expect(experienceDescription(301).success).toBe(false);

    const label = (length: number) =>
      parse({
        ...base(),
        contact: {
          items: [
            {
              id: crypto.randomUUID(),
              kind: "website",
              label: "a".repeat(length),
              value: "https://example.com",
            },
          ],
        },
      });
    expect(label(40).success).toBe(true);
    expect(label(41).success).toBe(false);
  });

  it("AC-7 rejects empty, whitespace-only and null required text", () => {
    const withTitle = (title: unknown) =>
      parse({ ...base(), projects: { items: [project({ title })] } });

    expect(withTitle("").success).toBe(false);
    expect(withTitle("   ").success).toBe(false);
    expect(withTitle(null).success).toBe(false);

    expect(
      parse({
        ...base(),
        experience: { items: [experience({ organization: "  " })] },
      }).success,
    ).toBe(false);

    expect(parse({ ...base(), about: { text: null } }).success).toBe(false);
  });

  it("AC-7 accepts empty lists and a project with only one of imageUrl and link", () => {
    expect(parse(emptyContent).success).toBe(true);
    expect(
      parse({
        ...base(),
        projects: { items: [project({ link: "https://example.com" })] },
      }).success,
    ).toBe(true);
    expect(
      parse({
        ...base(),
        projects: { items: [project({ imageUrl: "https://example.com/a.png" })] },
      }).success,
    ).toBe(true);
  });

  it("AC-8 rejects links and images with schemes other than http and https", () => {
    const link = (value: string) =>
      parse({ ...base(), projects: { items: [project({ link: value })] } });
    const image = (value: string) =>
      parse({ ...base(), projects: { items: [project({ imageUrl: value })] } });

    expect(link("javascript:alert(1)").success).toBe(false);
    expect(link("data:text/html;base64,PHNjcmlwdD4=").success).toBe(false);
    expect(link("ftp://example.com/file").success).toBe(false);
    expect(image("javascript:alert(1)").success).toBe(false);
    expect(image("data:image/png;base64,iVBORw0KGgo=").success).toBe(false);
    expect(link("https://example.com").success).toBe(true);
    expect(link("http://example.com").success).toBe(true);
  });

  it("AC-8 accepts a URL with surrounding whitespace and trims it", () => {
    const result = parse({
      ...base(),
      projects: { items: [project({ link: "  https://example.com  " })] },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projects.items[0].link).toBe("https://example.com");
    }
  });

  it("AC-9 rejects duplicate item ids and duplicate skill slugs", () => {
    const duplicateId = "0f0b6f5e-3a2b-4c1d-8e9f-1a2b3c4d5e6f";

    expect(
      parse({
        ...base(),
        projects: {
          items: [project({ id: duplicateId }), project({ id: duplicateId })],
        },
      }).success,
    ).toBe(false);

    expect(
      parse({ ...base(), skills: { skillIds: ["react", "react"] } }).success,
    ).toBe(false);
  });

  it("AC-10 rejects invalid months and malformed dates", () => {
    const startDate = (value: string) =>
      parse({ ...base(), experience: { items: [experience({ startDate: value })] } });

    expect(startDate("2024-13").success).toBe(false);
    expect(startDate("2024-00").success).toBe(false);
    expect(startDate("2024-1").success).toBe(false);
    expect(startDate("June 2024").success).toBe(false);
    expect(startDate("2024-06").success).toBe(true);
  });

  it("AC-10 rejects an end date before the start date", () => {
    expect(
      parse({
        ...base(),
        experience: {
          items: [experience({ startDate: "2024-01", endDate: "2023-12" })],
        },
      }).success,
    ).toBe(false);

    expect(
      parse({
        ...base(),
        experience: {
          items: [experience({ startDate: "2024-01", endDate: "2024-01" })],
        },
      }).success,
    ).toBe(true);
  });

  it("AC-10 rejects current together with an end date", () => {
    expect(
      parse({
        ...base(),
        experience: {
          items: [experience({ current: true, endDate: "2024-01" })],
        },
      }).success,
    ).toBe(false);

    expect(
      parse({
        ...base(),
        experience: { items: [experience({ current: true })] },
      }).success,
    ).toBe(true);
  });

  it("AC-11 rejects an invalid email and a non-URL for other kinds", () => {
    const contact = (kind: string, value: string) =>
      parse({
        ...base(),
        contact: { items: [{ id: crypto.randomUUID(), kind, label: "Label", value }] },
      });

    expect(contact("email", "not-an-email").success).toBe(false);
    expect(contact("email", "https://example.com").success).toBe(false);
    expect(contact("github", "not a url").success).toBe(false);
    expect(contact("github", "javascript:alert(1)").success).toBe(false);
    expect(contact("email", "abdullah@example.com").success).toBe(true);
    expect(contact("github", "https://github.com/abdullah").success).toBe(true);
  });

  it("AC-13 accepts Arabic text in about and project text", () => {
    const result = parse({
      ...base(),
      about: { text: "أبني واجهات تُقرأ بوضوح.\n\nمهندس برمجيات." },
      projects: {
        items: [project({ title: "مشروع", description: "وصف المشروع" })],
      },
    });

    expect(result.success).toBe(true);
  });
  it("AC-7 enforces the URL length limit at the boundary", () => {
    const url = (length: number) => `https://example.com/${"a".repeat(length - 20)}`;
    const link = (value: string) =>
      parse({ ...base(), projects: { items: [project({ link: value })] } });

    expect(link(url(2048)).success).toBe(true);
    expect(link(url(2049)).success).toBe(false);
  });
});
