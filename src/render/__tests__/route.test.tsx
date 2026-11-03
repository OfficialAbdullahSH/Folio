import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/render/fonts", () => ({ fontVariableClassName: "font-vars" }));

const { generateMetadata } = await import("@/app/u/[username]/page");
const { PortfolioContent } = await import("@/app/u/[username]/portfolio-content");
const { fixturePortfolios } = await import("@/data/fixtures");

const params = (username: string) => ({ params: Promise.resolve({ username }) });

afterEach(() => {
  fixturePortfolios["demo-editorial"].profile.headline =
    "Product designer and front-end engineer";
});

describe("public portfolio route", () => {
  it("AC-15 sets the title, description, open graph and robots", async () => {
    const metadata = await generateMetadata(params("demo-editorial"));

    expect(metadata.title).toBe("Amelia Hart | Folio");
    expect(metadata.description).toBe("Product designer and front-end engineer");
    expect(metadata.openGraph).toMatchObject({
      title: "Amelia Hart | Folio",
      description: "Product designer and front-end engineer",
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("AC-15 falls back when the headline is empty", async () => {
    fixturePortfolios["demo-editorial"].profile.headline = "";

    const metadata = await generateMetadata(params("demo-editorial"));

    expect(metadata.description).toBe("Amelia Hart on Folio");
  });

  it("AC-13 renders each demo page", async () => {
    for (const username of [
      "demo-editorial",
      "demo-terminal",
      "demo-minimal",
      "demo-compact",
      "demo-long",
      "demo-editorial-bold",
      "demo-terminal-light",
    ]) {
      const element = await PortfolioContent(params(username));
      const html = renderToStaticMarkup(element);

      expect(html).toContain(fixturePortfolios[username].profile.displayName);
    }
  });

  it("AC-13 sends an unknown username to the 404 page", async () => {
    await expect(PortfolioContent(params("nobody-here"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-13 sends an invalid username to the 404 page", async () => {
    await expect(PortfolioContent(params("Not A Name"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-14 sends invalid stored data to the 404 page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const original = fixturePortfolios["demo-editorial"].design;

    fixturePortfolios["demo-editorial"].design = {
      ...original,
      world: "unknown-world",
    } as unknown as typeof original;

    try {
      await expect(PortfolioContent(params("demo-editorial"))).rejects.toThrow(
        "NEXT_NOT_FOUND",
      );
    } finally {
      fixturePortfolios["demo-editorial"].design = original;
      vi.restoreAllMocks();
    }
  });
});
