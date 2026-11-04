import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "../validation";

const valid = {
  email: "amelia@example.com",
  password: "correct horse battery",
  username: "amelia-hart",
  displayName: "Amelia Hart",
};

const signup = (patch: Record<string, unknown>) => signupSchema.safeParse({ ...valid, ...patch });

describe("signup validation", () => {
  it("AC-3 accepts a valid form and trims the text fields", () => {
    const result = signupSchema.safeParse({
      ...valid,
      email: "  amelia@example.com ",
      username: " amelia-hart ",
      displayName: "  Amelia Hart  ",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });

  it("AC-3 enforces the password length at the boundary", () => {
    expect(signup({ password: "a".repeat(7) }).success).toBe(false);
    expect(signup({ password: "a".repeat(8) }).success).toBe(true);
    expect(signup({ password: "a".repeat(72) }).success).toBe(true);
    expect(signup({ password: "a".repeat(73) }).success).toBe(false);
  });

  it("AC-3 enforces the username length at the boundary", () => {
    expect(signup({ username: "ab" }).success).toBe(false);
    expect(signup({ username: "abc" }).success).toBe(true);
    expect(signup({ username: "a".repeat(30) }).success).toBe(true);
    expect(signup({ username: "a".repeat(31) }).success).toBe(false);
  });

  it("AC-3 rejects uppercase, spaces and hyphens at the edges of a username", () => {
    for (const username of ["Amelia", "amelia hart", "-amelia", "amelia-", "amelia_hart"]) {
      expect(signup({ username }).success).toBe(false);
    }
  });

  it("AC-3 rejects a reserved username", () => {
    expect(signup({ username: "admin" }).success).toBe(false);
    expect(signup({ username: "dashboard" }).success).toBe(false);
    expect(signup({ username: "u" }).success).toBe(false);
  });

  it("AC-3 rejects a whitespace-only display name", () => {
    expect(signup({ displayName: "   " }).success).toBe(false);
  });

  it("AC-3 enforces the display name length at the boundary", () => {
    expect(signup({ displayName: "a".repeat(60) }).success).toBe(true);
    expect(signup({ displayName: "a".repeat(61) }).success).toBe(false);
  });

  it("AC-3 rejects a malformed email", () => {
    for (const email of ["", "   ", "amelia", "amelia@", "@example.com"]) {
      expect(signup({ email }).success).toBe(false);
    }
  });
});

describe("login validation", () => {
  it("AC-4 requires an email and a password", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: "amelia@example.com", password: "x" }).success,
    ).toBe(true);
  });

  it("AC-4 trims the email", () => {
    const result = loginSchema.safeParse({
      email: "  amelia@example.com ",
      password: "x",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("amelia@example.com");
  });
});
