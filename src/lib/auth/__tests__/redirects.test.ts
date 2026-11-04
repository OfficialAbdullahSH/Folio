import { describe, expect, it } from "vitest";

import { redirectFor } from "../redirects";

describe("route protection", () => {
  it("AC-6 sends an anonymous visitor from the dashboard to login", () => {
    expect(redirectFor("/dashboard", false)).toBe("/login");
    expect(redirectFor("/dashboard/", false)).toBe("/login");
    expect(redirectFor("/dashboard/settings", false)).toBe("/login");
  });

  it("AC-6 sends a signed-in visitor away from login and signup", () => {
    expect(redirectFor("/login", true)).toBe("/dashboard");
    expect(redirectFor("/login/", true)).toBe("/dashboard");
    expect(redirectFor("/signup", true)).toBe("/dashboard");
  });

  it("AC-6 leaves public pages alone for anonymous visitors", () => {
    for (const path of ["/", "/u/demo-editorial", "/login", "/signup", "/search"]) {
      expect(redirectFor(path, false)).toBeNull();
    }
  });

  it("AC-6 leaves the dashboard and public pages alone for a signed-in visitor", () => {
    for (const path of ["/", "/dashboard", "/u/demo-editorial", "/search"]) {
      expect(redirectFor(path, true)).toBeNull();
    }
  });

  it("AC-6 does not treat a path that merely starts with dashboard as protected", () => {
    expect(redirectFor("/dashboards", false)).toBeNull();
  });
});
