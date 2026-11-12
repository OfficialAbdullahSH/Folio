import { describe, expect, it } from "vitest";

import {
  SEARCH_PAGE_SIZE,
  SEARCH_QUERY_MAX,
  clampPage,
  cleanTerms,
  pageCount,
  pageOffset,
  parseSearchParams,
  searchHref,
} from "../query";

describe("cleanTerms", () => {
  it("AC-2 splits text into lower case words", () => {
    expect(cleanTerms("React Developer")).toEqual(["react", "developer"]);
  });

  it("AC-2 ignores leading, trailing and repeated whitespace", () => {
    expect(cleanTerms("   Sara    Ahmed  ")).toEqual(["sara", "ahmed"]);
  });

  it("AC-2 drops punctuation", () => {
    expect(cleanTerms("React!")).toEqual(["react"]);
    expect(cleanTerms("react.js")).toEqual(["react", "js"]);
    expect(cleanTerms("O'Neil, Jr.")).toEqual(["o", "neil", "jr"]);
  });

  it("AC-2 keeps digits", () => {
    expect(cleanTerms("node.js 20")).toEqual(["node", "js", "20"]);
  });

  it("AC-2 drops every character that means something in text-search syntax", () => {
    expect(cleanTerms("react:* & | ! ( ) ' :")).toEqual(["react"]);
    expect(cleanTerms("!!!")).toEqual([]);
    expect(cleanTerms("")).toEqual([]);
  });

  it("AC-2 keeps Arabic letters and drops their diacritics", () => {
    expect(cleanTerms("أحمد")).toEqual(["أحمد"]);
    expect(cleanTerms("مُحَمَّد الأحمد")).toEqual(["محمد", "الأحمد"]);
  });

  it("AC-2 keeps Arabic and Latin words apart in one query", () => {
    expect(cleanTerms("Sara سارة")).toEqual(["sara", "سارة"]);
  });

  it("AC-2 lists each term once", () => {
    expect(cleanTerms("React react REACT")).toEqual(["react"]);
  });
});

describe("parseSearchParams", () => {
  it("AC-8 falls back to the empty search when nothing is given", () => {
    expect(parseSearchParams({})).toEqual({ q: null, skill: null, page: 1 });
  });

  it("AC-8 trims the query and treats a blank one as empty", () => {
    expect(parseSearchParams({ q: "  Sara Ahmed " }).q).toBe("Sara Ahmed");
    expect(parseSearchParams({ q: "   " }).q).toBeNull();
  });

  it("AC-8 accepts a query of exactly the maximum length and ignores a longer one", () => {
    expect(parseSearchParams({ q: "a".repeat(SEARCH_QUERY_MAX) }).q).toHaveLength(SEARCH_QUERY_MAX);
    expect(parseSearchParams({ q: "a".repeat(SEARCH_QUERY_MAX + 1) }).q).toBeNull();
  });

  it("AC-8 ignores a repeated query parameter instead of guessing", () => {
    expect(parseSearchParams({ q: ["sara", "ahmed"] }).q).toBeNull();
  });

  it("AC-8 accepts a skill slug in the F-02 format", () => {
    expect(parseSearchParams({ skill: "react" }).skill).toBe("react");
    expect(parseSearchParams({ skill: "tailwind-css" }).skill).toBe("tailwind-css");
  });

  it("AC-8 ignores a skill that is not a slug", () => {
    expect(parseSearchParams({ skill: "React" }).skill).toBeNull();
    expect(parseSearchParams({ skill: "react js" }).skill).toBeNull();
    expect(parseSearchParams({ skill: "a".repeat(41) }).skill).toBeNull();
    expect(parseSearchParams({ skill: ["react", "vue"] }).skill).toBeNull();
  });

  it("AC-8 reads a page number and falls back to page one for anything else", () => {
    expect(parseSearchParams({ page: "3" }).page).toBe(3);
    expect(parseSearchParams({ page: "0" }).page).toBe(1);
    expect(parseSearchParams({ page: "-2" }).page).toBe(1);
    expect(parseSearchParams({ page: "1.5" }).page).toBe(1);
    expect(parseSearchParams({ page: "two" }).page).toBe(1);
    expect(parseSearchParams({ page: "999999999999999999999" }).page).toBe(1);
    expect(parseSearchParams({ page: ["1", "2"] }).page).toBe(1);
  });
});

describe("pagination", () => {
  it("AC-8 puts twelve results on a page", () => {
    expect(SEARCH_PAGE_SIZE).toBe(12);
    expect(pageOffset(1)).toBe(0);
    expect(pageOffset(2)).toBe(12);
    expect(pageOffset(3)).toBe(24);
  });

  it("AC-8 counts a partial last page as a page", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(1)).toBe(1);
    expect(pageCount(12)).toBe(1);
    expect(pageCount(13)).toBe(2);
    expect(pageCount(24)).toBe(2);
    expect(pageCount(25)).toBe(3);
  });

  it("AC-8 brings a page past the end back to the last page", () => {
    expect(clampPage(99, 25)).toBe(3);
    expect(clampPage(2, 25)).toBe(2);
    expect(clampPage(1, 0)).toBe(1);
    expect(clampPage(0, 0)).toBe(1);
    expect(clampPage(7, 0)).toBe(1);
  });
});

describe("searchHref", () => {
  it("AC-8 keeps the query when it pages", () => {
    expect(searchHref({ q: "sara", skill: null, page: 2 })).toBe("/search?q=sara&page=2");
  });

  it("AC-8 leaves page one out of the address", () => {
    expect(searchHref({ q: "react", skill: null, page: 1 })).toBe("/search?q=react");
  });

  it("AC-5 keeps the skill filter", () => {
    expect(searchHref({ q: null, skill: "react", page: 3 })).toBe("/search?skill=react&page=3");
  });

  it("AC-11 links to the bare page when nothing is set", () => {
    expect(searchHref({ q: null, skill: null, page: 1 })).toBe("/search");
  });

  it("AC-9 escapes a query that contains a URL character", () => {
    expect(searchHref({ q: "a&b=c", skill: null, page: 1 })).toBe("/search?q=a%26b%3Dc");
  });
});
