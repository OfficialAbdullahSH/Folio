import { describe, expect, it } from "vitest";

import { arabicProfile, validProfile } from "../fixtures";
import { profileSchema } from "../profile.schema";

const parse = (patch: Record<string, unknown>) =>
  profileSchema.safeParse({ ...validProfile, ...patch });

describe("profile", () => {
  it("AC-12 accepts a valid profile", () => {
    expect(parse({}).success).toBe(true);
  });

  it("AC-12 rejects usernames outside 3 to 30 characters", () => {
    expect(parse({ username: "ab" }).success).toBe(false);
    expect(parse({ username: "a".repeat(31) }).success).toBe(false);
    expect(parse({ username: "abc" }).success).toBe(true);
    expect(parse({ username: "a".repeat(30) }).success).toBe(true);
  });

  it("AC-12 rejects uppercase letters and characters outside a-z 0-9 -", () => {
    expect(parse({ username: "Abdullah" }).success).toBe(false);
    expect(parse({ username: "abd_ullah" }).success).toBe(false);
    expect(parse({ username: "abdullah.sh" }).success).toBe(false);
    expect(parse({ username: "abdullah sh" }).success).toBe(false);
  });

  it("AC-12 rejects leading and trailing hyphens", () => {
    expect(parse({ username: "-abdullah" }).success).toBe(false);
    expect(parse({ username: "abdullah-" }).success).toBe(false);
    expect(parse({ username: "abd-ullah" }).success).toBe(true);
  });

  it("AC-12 rejects reserved usernames", () => {
    for (const username of ["admin", "api", "folio", "help", "search"]) {
      const result = parse({ username });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Username is reserved");
      }
    }
  });

  it("AC-12 rejects reserved usernames in any case", () => {
    expect(parse({ username: "Admin" }).success).toBe(false);
    expect(parse({ username: "ADMIN" }).success).toBe(false);
    expect(parse({ username: "_next" }).success).toBe(false);
  });

  it("AC-12 rejects an empty or whitespace-only display name", () => {
    expect(parse({ displayName: "" }).success).toBe(false);
    expect(parse({ displayName: "   " }).success).toBe(false);
    expect(parse({ displayName: null }).success).toBe(false);
  });

  it("AC-13 accepts Arabic in display name and headline", () => {
    expect(profileSchema.safeParse(arabicProfile).success).toBe(true);
  });

  it("AC-13 counts characters, not bytes, for Arabic text", () => {
    expect(parse({ displayName: "ع".repeat(60) }).success).toBe(true);
    expect(parse({ displayName: "ع".repeat(61) }).success).toBe(false);
    expect(parse({ headline: "ع".repeat(120) }).success).toBe(true);
    expect(parse({ headline: "ع".repeat(121) }).success).toBe(false);
  });

  it("accepts an empty headline", () => {
    expect(parse({ headline: "" }).success).toBe(true);
  });
});
