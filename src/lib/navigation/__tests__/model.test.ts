import { describe, expect, it } from "vitest";

import {
  DASHBOARD_STEPS,
  isCurrentPath,
  navFor,
  SIGNED_IN_NAV,
  SIGNED_OUT_NAV,
  WORKFLOW_TABS,
} from "../model";

const labels = (items: readonly { label: string }[]): string[] => items.map((item) => item.label);

describe("the navigation model", () => {
  it("AC-1 gives a signed-in owner every app screen in the header", () => {
    expect(labels(navFor(true))).toEqual([
      "Dashboard",
      "Content",
      "Design",
      "Preview",
      "Search",
    ]);
  });

  it("AC-1 gives a signed-out visitor the public screens only", () => {
    expect(labels(navFor(false))).toEqual(["Search"]);
  });

  it("AC-1 uses one destination per label", () => {
    const hrefs = SIGNED_IN_NAV.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(SIGNED_OUT_NAV.every((item) => hrefs.includes(item.href))).toBe(true);
  });

  it("AC-2 ties Content, Design and Preview together as the workflow", () => {
    expect(labels(WORKFLOW_TABS)).toEqual(["Content", "Design", "Preview"]);
    expect(WORKFLOW_TABS.map((tab) => tab.href)).toEqual([
      "/dashboard/edit",
      "/dashboard/design",
      "/dashboard/preview",
    ]);
  });

  it("AC-2 puts the dashboard steps in the order they happen", () => {
    expect(labels(DASHBOARD_STEPS)).toEqual(["Content", "Design", "Publish"]);
    expect(DASHBOARD_STEPS[2]?.href).toBe("/dashboard#publish");
  });

  it("AC-5 marks only the page the owner is on", () => {
    expect(isCurrentPath("/dashboard", "/dashboard")).toBe(true);
    expect(isCurrentPath("/dashboard", "/dashboard/")).toBe(true);
    expect(isCurrentPath("/dashboard", "/dashboard/edit")).toBe(false);
    expect(isCurrentPath("/dashboard/edit", "/dashboard/edit")).toBe(true);
    expect(isCurrentPath("/search", "/search")).toBe(true);
    expect(isCurrentPath("/search", "/search?q=react")).toBe(true);
    expect(isCurrentPath("/dashboard/design", "/dashboard/preview")).toBe(false);
  });
});
