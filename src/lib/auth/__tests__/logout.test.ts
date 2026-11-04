import { describe, expect, it } from "vitest";

import { logOut } from "../logout";

import { fakePorts } from "./fakes";

describe("logout", () => {
  it("AC-5 ends the session exactly once", async () => {
    const { ports, calls } = fakePorts();

    const state = await logOut(ports);

    expect(state).toEqual({ status: "ok" });
    expect(calls.signOut).toBe(1);
  });
});
