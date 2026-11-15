import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResultCard } from "../components/result-card";
import { ResultSection } from "../components/result-section";
import { SkillChips } from "../components/skill-chips";
import { NoMatches, NothingPublished, SearchFailed } from "../components/search-states";
import type { SearchResult } from "../data";

const sara: SearchResult = {
  username: "demo-sara-ahmed",
  displayName: "Sara Ahmed",
  headline: "Front-end engineer",
  skillSlugs: ["react", "typescript"],
  accent: "#b45309",
  publishedAt: "2026-11-12T10:00:00+00:00",
};

const names: Record<string, string> = { react: "React", typescript: "TypeScript" };
const params = { q: "sara", skill: null, page: 1 };

const renderCard = (result: SearchResult = sara, skillNames = names): string =>
  renderToStaticMarkup(
    <ul>
      <ResultCard result={result} skillNames={skillNames} />
    </ul>,
  );

describe("ResultCard", () => {
  it("AC-7 links the display name to the public page", () => {
    const html = renderCard();

    expect(html).toContain('href="/u/demo-sara-ahmed"');
    expect(html).toContain("Sara Ahmed");
  });

  it("AC-7 shows the headline", () => {
    expect(renderCard()).toContain("Front-end engineer");
  });

  it("AC-7 links each skill to that skill's search", () => {
    const html = renderCard();

    expect(html).toContain('href="/search?skill=react"');
    expect(html).toContain('href="/search?skill=typescript"');
    expect(html).toContain(">React<");
  });

  it("AC-7 names a skill the list does not know by its slug", () => {
    expect(renderCard({ ...sara, skillSlugs: ["unknown-skill"] }, {})).toContain("unknown-skill");
  });

  it("AC-7 shows no more than six skills", () => {
    const html = renderCard({ ...sara, skillSlugs: ["a", "b", "c", "d", "e", "f", "g"] }, {});

    expect(html.match(/href="\/search\?skill=/g)).toHaveLength(6);
  });

  it("AC-7 hides the accent swatch from assistive technology", () => {
    expect(renderCard()).toContain('aria-hidden="true"');
    expect(renderCard()).toContain("background-color:#b45309");
  });

  it("AC-7 renders no swatch when the accent is not a colour", () => {
    const html = renderCard({ ...sara, accent: null });

    expect(html).not.toContain("background-color");
  });

  it("AC-9 renders user text as text, never as markup", () => {
    const html = renderCard({ ...sara, displayName: "<script>alert(1)</script>" });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("AC-9 marks user text as bidirectional", () => {
    expect(renderCard()).toContain('dir="auto"');
  });
});

describe("ResultSection", () => {
  const render = (section: { rows: SearchResult[]; total: number; page: number }, extra = {}) =>
    renderToStaticMarkup(
      <ResultSection
        id="skills"
        title="People with this skill"
        params={params}
        section={section}
        skillNames={names}
        {...extra}
      />,
    );

  it("AC-8 shows the total count", () => {
    const html = render({ rows: [sara], total: 5, page: 1 });

    expect(html).toContain("5 people");
  });

  it("AC-8 counts one person in the singular", () => {
    expect(render({ rows: [sara], total: 1, page: 1 })).toContain("1 person");
  });

  it("AC-8 hides pagination when everything fits on one page", () => {
    expect(render({ rows: [sara], total: 5, page: 1 })).not.toContain("<nav");
  });

  it("AC-8 links to the next page and not to a previous one", () => {
    const html = render({ rows: [sara], total: 30, page: 1 });

    expect(html).toContain('href="/search?q=sara&amp;page=2"');
    expect(html).toContain("Page 1 of 3");
    expect(html).not.toContain('href="/search?q=sara&amp;page=0"');
  });

  it("AC-8 links back from the last page", () => {
    const html = render({ rows: [sara], total: 30, page: 3 });

    expect(html).toContain('href="/search?q=sara&amp;page=2"');
    expect(html).not.toContain('href="/search?q=sara&amp;page=4"');
  });

  it("AC-8 labels the pagination for this section", () => {
    expect(render({ rows: [sara], total: 30, page: 1 })).toContain(
      'aria-label="Pages of People with this skill"',
    );
  });
});

describe("SkillChips", () => {
  it("AC-5 links each chip to its skill search", () => {
    const html = renderToStaticMarkup(
      <SkillChips
        label="Popular skills"
        skills={[{ slug: "react", count: 5 }]}
        skillNames={names}
      />,
    );

    expect(html).toContain('href="/search?skill=react"');
    expect(html).toContain("React");
    expect(html).toContain('aria-label="React 5 portfolios"');
  });
});

describe("search states", () => {
  it("AC-11 says plainly when nothing matches, and offers the popular skills", () => {
    const html = renderToStaticMarkup(
      <NoMatches
        query="zzzz"
        popular={[{ slug: "react", count: 5 }]}
        skillNames={names}
      />,
    );

    expect(html).toContain("zzzz");
    expect(html).toContain("No one matches");
    expect(html).toContain('href="/search?skill=react"');
    expect(html).toContain('href="/search"');
  });

  it("AC-11 explains an empty platform without blame", () => {
    const html = renderToStaticMarkup(<NothingPublished />);

    expect(html).toContain("Nothing is published yet");
    expect(html).not.toContain("Error");
  });

  it("AC-11 keeps technical detail out of the failure state", () => {
    const html = renderToStaticMarkup(<SearchFailed retryHref="/search?q=sara" />);

    expect(html).toContain("Search is not available right now");
    expect(html).not.toContain("SQL");
    expect(html).not.toContain("permission denied");
    expect(html).toContain('href="/search?q=sara"');
  });
});
