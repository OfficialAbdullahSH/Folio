import { describe, expect, it } from "vitest";

import { logInWithPassword } from "../login";
import { AUTH_MESSAGES } from "../messages";

import { fakePorts } from "./fakes";

const credentials = { email: "amelia@example.com", password: "correct horse battery" };

describe("login", () => {
  it("AC-4 logs in with a correct email and password", async () => {
    const { ports, calls } = fakePorts();

    const state = await logInWithPassword(credentials, ports);

    expect(state).toEqual({ status: "ok" });
    expect(calls.signIn).toEqual([credentials]);
  });

  it("AC-4 gives the same generic message for a wrong password", async () => {
    const { ports } = fakePorts({
      signIn: () => ({ user: null, error: { message: "Invalid login credentials" } }),
    });

    const state = await logInWithPassword(credentials, ports);

    expect(state).toEqual({ status: "error", message: AUTH_MESSAGES.invalidCredentials });
  });

  it("AC-4 gives the same generic message for an unknown email", async () => {
    const { ports } = fakePorts({
      signIn: () => ({ user: null, error: { message: "Invalid login credentials" } }),
    });

    const unknown = await logInWithPassword(
      { email: "nobody@example.com", password: "whatever" },
      ports,
    );
    const wrongPassword = await logInWithPassword(credentials, ports);

    expect(unknown).toEqual(wrongPassword);
  });

  it("AC-4 trims the email before signing in", async () => {
    const { ports, calls } = fakePorts();

    await logInWithPassword({ ...credentials, email: "  amelia@example.com  " }, ports);

    expect(calls.signIn[0]?.email).toBe("amelia@example.com");
  });

  it("AC-4 asks for both fields when they are empty", async () => {
    const { ports, calls } = fakePorts();

    const state = await logInWithPassword({ email: "", password: "" }, ports);

    expect(state.fieldErrors).toEqual({
      email: "Email is required",
      password: "Password is required",
    });
    expect(calls.signIn).toHaveLength(0);
  });
});
