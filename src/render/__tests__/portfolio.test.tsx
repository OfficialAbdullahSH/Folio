import { describe, expect, it } from "vitest";

import type { ContentDocument } from "@/schema";

import { record, renderPortfolio, sectionIds } from "./helpers";

const EMPTY_CONTENT: ContentDocument = {
  version: 1,
  about: { text: "" },
  projects: { items: [] },
  skills: { skillIds: [] },
  experience: { items: [] },
  contact: { items: [] },
};

describe("Portfolio", () => {
  it("AC-1 renders one h1, the headline and every visible section", () => {
    const portfolio = record();
    const html = renderPortfolio(portfolio);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(portfolio.profile.displayName);
    expect(html).toContain(portfolio.profile.headline);
    expect(sectionIds(html)).toEqual([
      "hero",
      "about",
      "projects",
      "skills",
      "experience",
      "contact",
    ]);
  });

  it("AC-2 skips hidden sections", () => {
    const portfolio = record();
    portfolio.design.sections = portfolio.design.sections.map((section) => ({
      ...section,
      visible: false,
    }));

    expect(sectionIds(renderPortfolio(portfolio))).toEqual(["hero"]);
  });

  it("AC-2 skips visible sections with empty content", () => {
    const portfolio = record();
    portfolio.content = EMPTY_CONTENT;

    expect(sectionIds(renderPortfolio(portfolio))).toEqual(["hero"]);
  });

  it("AC-2 keeps the hero when everything is hidden and empty", () => {
    const portfolio = record();
    portfolio.content = EMPTY_CONTENT;
    portfolio.design.sections = portfolio.design.sections.map((section) => ({
      ...section,
      visible: false,
    }));

    const html = renderPortfolio(portfolio);

    expect(sectionIds(html)).toEqual(["hero"]);
    expect(html).toContain(portfolio.profile.displayName);
  });

  it("AC-3 renders sections in the order given by the design document", () => {
    const portfolio = record();
    portfolio.design.sections = [...portfolio.design.sections].reverse();

    expect(sectionIds(renderPortfolio(portfolio))).toEqual([
      "contact",
      "experience",
      "skills",
      "projects",
      "about",
      "hero",
    ]);
  });

  it("AC-8 escapes user text and keeps link attributes safe", () => {
    const portfolio = record();
    portfolio.content.about.text = 'Hello <script>alert("x")</script> & <b>bold</b>';
    portfolio.content.projects.items[0].link =
      'https://example.com/?q=a&b="c"<d>';
    portfolio.content.contact.items[1].value = "https://example.com/?a=1&b=2";

    const html = renderPortfolio(portfolio);

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="mailto:amelia@example.com"');
  });

  it("AC-9 renders project images with alt text and lazy loading", () => {
    const html = renderPortfolio(record());

    expect(html.match(/<img /g) ?? []).toHaveLength(3);
    expect(html).toContain('alt="Northwind Analytics"');
    expect(html).toContain('loading="lazy"');
  });

  it("AC-10 formats experience dates with machine-readable values", () => {
    const html = renderPortfolio(record());

    expect(html).toContain('<time dateTime="2022-03">Mar 2022</time>');
    expect(html).toContain(" – Present");
    expect(html).toContain('<time dateTime="2019-06">Jun 2019</time>');
    expect(html).toContain('<time dateTime="2022-02">Feb 2022</time>');
    expect(html).toContain(">Education<");
  });

  it("AC-10 shows only the start date when there is no end date and current is not set", () => {
    const portfolio = record();
    portfolio.content.experience.items = [
      {
        id: "9c9c9999-9999-4999-8999-999999999991",
        kind: "experience",
        title: "Freelance designer",
        organization: "Self-employed",
        startDate: "2020-01",
      },
    ];

    const html = renderPortfolio(portfolio);

    expect(html).toContain('<time dateTime="2020-01">Jan 2020</time>');
    expect(html).not.toContain("Present");
  });

  it("AC-11 resolves skill names and falls back to the slug", () => {
    const portfolio = record();
    portfolio.content.skills.skillIds = ["typescript", "mystery-skill"];

    const html = renderPortfolio(portfolio);

    expect(html).toContain("TypeScript");
    expect(html).toContain("mystery-skill");
  });

  it("AC-12 marks user text with dir=auto and uses the cairo variable for Arabic", () => {
    const portfolio = record("demo-minimal");
    const html = renderPortfolio(portfolio);

    expect(html).toContain('dir="auto"');
    expect(html).toContain("--font-cairo");
    expect(html).toContain(portfolio.profile.displayName);
  });

  it("AC-16 keeps one h1, an h2 per section, landmarks and alt text", () => {
    const html = renderPortfolio(record());

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.match(/<h2/g)).toHaveLength(5);
    expect(html).toContain("<header");
    expect(html).toContain("<main");
    expect(html).not.toMatch(/<img (?![^>]*\balt=)/);
  });

  it("edge case renders a project that only has a title", () => {
    const html = renderPortfolio(record("demo-minimal"));

    expect(html).toContain("دفتر المدرسة");
    expect(html.match(/<img /g) ?? []).toHaveLength(0);
  });

  it("edge case keeps a very long display name and unbroken word inside the layout", () => {
    const portfolio = record();
    portfolio.profile.displayName = "Alexandria-Cassandra Montgomery-Worthington the Third";
    portfolio.content.about.text =
      "Supercalifragilisticexpialidocioussupercalifragilisticexpialidocious";

    const html = renderPortfolio(portfolio);
    const heading = html.match(/<h1[^>]*>/)?.[0] ?? "";

    expect(heading).toContain("break-words");
    expect(html).toContain("Supercalifragilisticexpialidocious");
  });
});
