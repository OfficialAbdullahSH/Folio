import { describe, expect, it } from "vitest";

import { redirectFor, redirectLocation, SIGNED_OUT_PATH } from "../redirects";

describe("the sign-out destination", () => {
  it("AC-8 lands on the landing page, not the login page", () => {
    expect(SIGNED_OUT_PATH).toBe("/");
  });
});

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

describe("the return path", () => {
  it("AC-6 carries the page the visitor asked for into the login URL", () => {
    expect(redirectLocation("/dashboard/edit", "", false)).toBe(
      "/login?next=%2Fdashboard%2Fedit",
    );
    expect(redirectLocation("/dashboard/design", "?tab=colors", false)).toBe(
      "/login?next=%2Fdashboard%2Fdesign%3Ftab%3Dcolors",
    );
  });

  it("AC-6 adds no return path for a page that needs no login", () => {
    expect(redirectLocation("/", "", false)).toBeNull();
    expect(redirectLocation("/search", "?q=react", false)).toBeNull();
    expect(redirectLocation("/u/demo-editorial", "", false)).toBeNull();
  });

  it("AC-6 still sends a signed-in visitor from login to the dashboard", () => {
    expect(redirectLocation("/login", "", true)).toBe("/dashboard");
  });
});
