import { describe, expect, it } from "vitest";

import { leaveSession, NO_LEAVE_SESSION } from "../leave-session";

describe("the unsaved-changes session", () => {
  it("AC-6 counts a Leave decision, so a screen can discard its document", () => {
    const after = leaveSession(NO_LEAVE_SESSION, { type: "leave" });

    expect(after.discardToken).toBe(1);
    expect(after.dirty).toBe(false);
  });

  it("AC-6 counts every Leave, so leaving twice discards twice", () => {
    const once = leaveSession(NO_LEAVE_SESSION, { type: "leave" });
    const twice = leaveSession(once, { type: "leave" });

    expect(twice.discardToken).toBe(2);
  });

  it("AC-6 raises and lowers the unsaved flag without touching the token", () => {
    const dirty = leaveSession(NO_LEAVE_SESSION, { type: "setDirty", dirty: true });
    const clean = leaveSession(dirty, { type: "setDirty", dirty: false });

    expect(dirty.dirty).toBe(true);
    expect(clean.dirty).toBe(false);
    expect(clean.discardToken).toBe(0);
  });

  it("keeps the same state when the flag already holds the value", () => {
    expect(leaveSession(NO_LEAVE_SESSION, { type: "setDirty", dirty: false })).toBe(
      NO_LEAVE_SESSION,
    );
  });
});
