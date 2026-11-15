import { describe, expect, it } from "vitest";

import { leaveDecision } from "../guard";

describe("the unsaved changes rule", () => {
  it("AC-7 lets a clean editor navigate anywhere", () => {
    expect(
      leaveDecision({ dirty: false, currentPath: "/dashboard/edit", href: "/dashboard" }),
    ).toBe("allow");
  });

  it("AC-7 asks before a dirty editor leaves for another page", () => {
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/edit", href: "/dashboard" }),
    ).toBe("confirm");
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/design", href: "/search" }),
    ).toBe("confirm");
  });

  it("AC-7 does not ask for a link to the page the owner is already on", () => {
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/edit", href: "/dashboard/edit" }),
    ).toBe("allow");
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/edit/", href: "/dashboard/edit" }),
    ).toBe("allow");
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/edit", href: "/dashboard/edit#projects" }),
    ).toBe("allow");
  });

  it("AC-7 does not ask for an in-page anchor", () => {
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/design", href: "#colors" }),
    ).toBe("allow");
  });

  it("AC-7 does not intercept a link that leaves the app", () => {
    expect(
      leaveDecision({ dirty: true, currentPath: "/dashboard/edit", href: "https://example.com" }),
    ).toBe("allow");
  });
});
