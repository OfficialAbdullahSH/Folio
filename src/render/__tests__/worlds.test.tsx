import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { DesignSection } from "@/schema";

import { record, renderPortfolio, sectionIds } from "./helpers";
import { worldRegistry } from "../worlds/registry";

const WORLDS = ["editorial", "terminal"] as const;

const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "skills",
  "experience",
  "contact",
] as const;

const STRESS_THEMES = [
  {
    colors: {
      background: "#ffffff",
      surface: "#f4f6f8",
      text: "#1a1a1a",
      muted: "#5b6470",
      accent: "#2563eb",
      border: "#e2e8f0",
    },
    headingFont: "inter",
    bodyFont: "inter",
    radius: "md",
  },
  {
    colors: {
      background: "#000000",
      surface: "#0d0d0d",
      text: "#ffffff",
      muted: "#c7c7c7",
      accent: "#ffd400",
      border: "#3f3f3f",
    },
    headingFont: "jetbrains-mono",
    bodyFont: "inter",
    radius: "none",
  },
  {
    colors: {
      background: "#1e1b4b",
      surface: "#312e81",
      text: "#eef2ff",
      muted: "#a5b4fc",
      accent: "#22d3ee",
      border: "#4338ca",
    },
    headingFont: "space-grotesk",
    bodyFont: "inter",
    radius: "md",
  },
  {
    colors: {
      background: "#fff7ed",
      surface: "#ffffff",
      text: "#431407",
      muted: "#9a3412",
      accent: "#db2777",
      border: "#fed7aa",
    },
    headingFont: "lora",
    bodyFont: "inter",
    radius: "lg",
  },
  {
    colors: {
      background: "#fdf6e3",
      surface: "#fffaf0",
      text: "#3b2f2f",
      muted: "#8b5e3c",
      accent: "#b91c1c",
      border: "#e7d8c9",
    },
    headingFont: "lora",
    bodyFont: "inter",
    radius: "none",
  },
  {
    colors: {
      background: "#f5f5f5",
      surface: "#ffffff",
      text: "#111111",
      muted: "#555555",
      accent: "#111111",
      border: "#d4d4d4",
    },
    headingFont: "playfair-display",
    bodyFont: "inter",
    radius: "sm",
  },
] as const;

const STRESS_THEME_NAMES = [
  "light",
  "dark",
  "saturated",
  "pastel",
  "warm",
  "monochrome",
] as const;

function navLinks(html: string): string[] {
  const nav =
    html.match(/<nav[^>]*aria-label="Sections"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? "";

  return [...nav.matchAll(/href="#([a-z]+)"/g)].map((match) => match[1]);
}

function sectionMarkup(html: string, id: string): string {
  const start = html.indexOf(`data-section="${id}"`);

  expect(start, `${id} is rendered`).toBeGreaterThanOrEqual(0);

  const rest = html.slice(start);
  const next = rest.slice(1).search(/data-section="[a-z]+"/);

  return next === -1 ? rest : rest.slice(0, next + 1);
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function worldFiles(world: string): string[] {
  return filesUnder(join(process.cwd(), "src", "render", "worlds", world));
}

describe("worlds", () => {
  it("AC-1 maps only the two worlds and provides a shell and six sections each", () => {
    expect(Object.keys(worldRegistry).sort()).toEqual(["editorial", "terminal"]);

    for (const world of WORLDS) {
      expect(worldRegistry[world].Shell).toBeTypeOf("function");
      expect(Object.keys(worldRegistry[world].sections).sort()).toEqual(
        [...SECTION_IDS].sort(),
      );
    }
  });

  it("AC-1 renders a different page frame for each world", () => {
    const editorial = renderPortfolio(record());
    const terminal = renderPortfolio(record("demo-terminal"));

    expect(editorial).toContain('data-nav="masthead"');
    expect(terminal).toContain('data-nav="sidebar"');
    expect(editorial).not.toContain('data-nav="sidebar"');
    expect(terminal).not.toContain('data-nav="masthead"');
  });

  it("AC-2 marks the page with the world the design chose", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;

      expect(renderPortfolio(portfolio)).toContain(`data-world="${world}"`);
    }
  });

  it("AC-3 gives every section different markup in each world", () => {
    const editorial = renderPortfolio(record());
    const terminal = renderPortfolio(record("demo-terminal"));

    for (const id of SECTION_IDS) {
      expect(sectionMarkup(editorial, id)).not.toBe(sectionMarkup(terminal, id));
    }
  });

  it("AC-3 gives every display style its own markup inside a world", () => {
    const markup = (id: string, style: string, world: (typeof WORLDS)[number]) => {
      const portfolio = record();
      portfolio.design.world = world;
      portfolio.design.sections = portfolio.design.sections.map((section) =>
        section.id === id
          ? ({ ...section, displayStyle: style } as DesignSection)
          : section,
      );

      return sectionMarkup(renderPortfolio(portfolio), id);
    };

    for (const world of WORLDS) {
      expect(markup("hero", "large", world)).not.toBe(markup("hero", "compact", world));

      expect(
        new Set([
          markup("projects", "grid", world),
          markup("projects", "cards", world),
          markup("projects", "timeline", world),
        ]).size,
      ).toBe(3);

      expect(markup("skills", "tags", world)).not.toBe(markup("skills", "list", world));
      expect(markup("experience", "timeline", world)).not.toBe(
        markup("experience", "list", world),
      );
    }
  });

  it("AC-4 lists the rendered non-hero sections in design order", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;

      expect(navLinks(renderPortfolio(portfolio))).toEqual([
        "about",
        "projects",
        "skills",
        "experience",
        "contact",
      ]);
    }
  });

  it("AC-4 follows a reversed section order", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      portfolio.design.sections = [...portfolio.design.sections].reverse();

      expect(navLinks(renderPortfolio(portfolio))).toEqual([
        "contact",
        "experience",
        "skills",
        "projects",
        "about",
      ]);
    }
  });

  it("AC-4 skips hidden and empty sections in the navigation", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      portfolio.design.sections = portfolio.design.sections.map((section) =>
        section.id === "about" ? { ...section, visible: false } : section,
      );
      portfolio.content.skills = { skillIds: [] };

      expect(navLinks(renderPortfolio(portfolio))).toEqual([
        "projects",
        "experience",
        "contact",
      ]);
    }
  });

  it("AC-4 points every navigation link at a rendered section", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      const html = renderPortfolio(portfolio);
      const ids = sectionIds(html);

      for (const link of navLinks(html)) {
        expect(ids, `${world} #${link}`).toContain(link);
      }
    }
  });

  it("AC-15 makes the skip link the first focusable element", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      const html = renderPortfolio(portfolio);

      expect(html.indexOf('href="#main-content"')).toBeLessThan(html.indexOf("<nav"));
      expect(html).toContain('id="main-content"');
      expect(html.slice(0, html.indexOf("<nav")).match(/<a /g)).toHaveLength(1);
    }
  });

  it("AC-4 omits the navigation when only the hero renders", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      portfolio.design.sections = portfolio.design.sections.map((section) => ({
        ...section,
        visible: false,
      }));
      portfolio.content = {
        version: 1,
        about: { text: "" },
        projects: { items: [] },
        skills: { skillIds: [] },
        experience: { items: [] },
        contact: { items: [] },
      };

      const html = renderPortfolio(portfolio);

      expect(html).toContain('data-section="hero"');
      expect(html).not.toContain("<nav");
    }
  });

  it("AC-4 keeps a single-section navigation working", () => {
    for (const world of WORLDS) {
      const portfolio = record();
      portfolio.design.world = world;
      portfolio.design.sections = portfolio.design.sections.map((section) => ({
        ...section,
        visible: section.id === "hero" || section.id === "projects",
      }));

      expect(navLinks(renderPortfolio(portfolio))).toEqual(["projects"]);
    }
  });

  it("AC-9 renders the Arabic fixture in both worlds", () => {
    const arabic = record("demo-minimal");

    for (const world of WORLDS) {
      arabic.design.world = world;
      const html = renderPortfolio(arabic);

      expect(html).toContain("ليلى الحربي");
      expect(html).toContain('dir="auto"');
      expect(html).toContain("--font-heading:var(--font-cairo)");
    }
  });

  it("AC-12 uses the light, dark, saturated, pastel, warm and monochrome themes", () => {
    expect(STRESS_THEMES).toHaveLength(STRESS_THEME_NAMES.length);
    expect(STRESS_THEMES.map((theme) => theme.colors.background)).toEqual([
      "#ffffff",
      "#000000",
      "#1e1b4b",
      "#fff7ed",
      "#fdf6e3",
      "#f5f5f5",
    ]);
  });
  it("AC-12 renders every style in both worlds under six stress themes", () => {
    const styles = [
      { id: "hero", values: ["large", "compact"] },
      { id: "projects", values: ["grid", "cards", "timeline"] },
      { id: "skills", values: ["tags", "list"] },
      { id: "experience", values: ["timeline", "list"] },
    ] as const;

    for (const theme of STRESS_THEMES) {
      for (const world of WORLDS) {
        for (const { id, values } of styles) {
          for (const style of values) {
            const portfolio = record();
            portfolio.design.world = world;
            portfolio.design.theme = { ...portfolio.design.theme, ...theme };
            portfolio.design.sections = portfolio.design.sections.map((section) =>
              section.id === id
                ? ({ ...section, displayStyle: style } as DesignSection)
                : section,
            );

            const html = renderPortfolio(portfolio);

            expect(html).toContain(`data-world="${world}"`);
            expect(html).toContain(`data-style="${style}"`);
            expect(html).toContain(
              `--color-background:${theme.colors.background}`,
            );
          }
        }
      }
    }
  });

  it("AC-13 keeps long unbroken strings inside the layout", () => {
    for (const world of WORLDS) {
      const portfolio = record("demo-long");
      portfolio.design.world = world;
      const html = renderPortfolio(portfolio);

      expect(html).toContain(
        "Wolfeschlegelsteinhausenbergerdorffvoralternwaren",
      );
      expect(html).toContain("QueryBudgetReconciliationServiceForPaymentEvents");
      expect(html.match(/class="[^"]*break-words[^"]*"/g)?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("AC-13 escapes shell metacharacters in user text", () => {
    const portfolio = record();
    portfolio.content.projects.items[0].title = '<script>alert("x")</script> $(rm -rf) > out';

    const html = renderPortfolio(portfolio);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("$(rm -rf)");
  });

  it("AC-13 maps the radius token to the CSS variable", () => {
    for (const world of WORLDS) {
      for (const [radius, value] of [
        ["none", "0"],
        ["lg", "1rem"],
      ] as const) {
        const portfolio = record();
        portfolio.design.world = world;
        portfolio.design.theme.radius = radius;

        expect(renderPortfolio(portfolio)).toContain(`--radius:${value}`);
      }
    }
  });

  it("AC-16 keeps both worlds server rendered", () => {
    for (const world of WORLDS) {
      for (const file of worldFiles(world)) {
        const source = readFileSync(file, "utf8");

        expect(source, file).not.toContain('"use client"');
        expect(source, file).not.toMatch(/\buse(State|Effect|Reducer|Ref)\b/);
        expect(source, file).not.toContain("framer-motion");
      }
    }
  });
});
