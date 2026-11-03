import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { record, renderPortfolio, sectionIds } from "./helpers";

const WORLDS = ["editorial", "terminal"] as const;

function render(world: (typeof WORLDS)[number]): string {
  const portfolio = record();
  portfolio.design.world = world;

  return renderPortfolio(portfolio);
}

describe("accessibility", () => {
  for (const world of WORLDS) {
    const html = render(world);

    it(`${world} AC-14 renders exactly one h1`, () => {
      expect(html.match(/<h1\b/g)).toHaveLength(1);
    });

    it(`${world} AC-14 renders an h2 per rendered non-hero section`, () => {
      const expected = sectionIds(html).filter((id) => id !== "hero").length;

      expect(html.match(/<h2\b/g)).toHaveLength(expected);
    });

    it(`${world} AC-14 labels the navigation`, () => {
      expect(html).toMatch(/<nav[^>]*aria-label="Sections"/);
    });

    it(`${world} AC-14 exposes header and main landmarks`, () => {
      expect(html).toMatch(/<header\b/);
      expect(html).toMatch(/<main[^>]*id="main-content"/);
    });

    it(`${world} AC-16 gives every image alt text`, () => {
      const images = html.match(/<img\b[^>]*>/g) ?? [];

      expect(images.length).toBeGreaterThan(0);

      for (const image of images) {
        expect(image).toMatch(/\balt="[^"]+"/);
      }
    });

    it(`${world} AC-14 hides decorative elements from assistive technology`, () => {
      const decorated = html.match(/<[^>]*data-decor[^>]*>/g) ?? [];

      expect(decorated.length).toBeGreaterThan(0);

      for (const element of decorated) {
        expect(element).toContain('aria-hidden="true"');
      }
    });

    it(`${world} AC-14 styles a visible focus ring for links`, () => {
      const directory = join(process.cwd(), "src", "render", "worlds", world);
      const sources = readdirSync(directory)
        .filter((name) => name.endsWith(".css"))
        .map((name) => readFileSync(join(directory, name), "utf8"))
        .join("\n");

      expect(sources).toContain(":focus-visible");
      expect(sources).toMatch(/outline:\s*2px solid var\(--color-accent\)/);
    });
  }
});
