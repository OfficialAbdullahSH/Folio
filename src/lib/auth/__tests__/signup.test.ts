import { describe, expect, it } from "vitest";

import { AUTH_MESSAGES } from "../messages";
import { signUpWithPassword } from "../signup";

import { fakePorts } from "./fakes";

const valid = {
  email: "  amelia@example.com ",
  password: "correct horse battery",
  username: "amelia-hart",
  displayName: "  Amelia Hart ",
};

describe("signup", () => {
  it("AC-1 creates the account, signs in and writes the profile metadata", async () => {
    const { ports, calls } = fakePorts();

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({ status: "ok" });
    expect(calls.signUp).toHaveLength(1);
    expect(calls.signUp[0]).toEqual({
      email: "amelia@example.com",
      password: "correct horse battery",
      metadata: { username: "amelia-hart", display_name: "Amelia Hart" },
    });
    expect(calls.profileExists).toEqual(["user-1"]);
  });

  it("AC-2 refuses a taken username before creating an account", async () => {
    const { ports, calls } = fakePorts({ takenUsernames: ["amelia-hart"] });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({
      status: "error",
      fieldErrors: { username: AUTH_MESSAGES.usernameTaken },
    });
    expect(calls.signUp).toHaveLength(0);
  });

  it("AC-2 gives the loser of a race the same friendly message", async () => {
    const { ports, calls } = fakePorts({
      signUp: (input, taken) => {
        // The other request won: the name is taken now and the insert failed.
        taken.add(input.metadata.username);
        return {
          user: null,
          hasSession: false,
          error: { message: "Database error saving new user", code: "unexpected_failure" },
        };
      },
    });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({
      status: "error",
      fieldErrors: { username: AUTH_MESSAGES.usernameTaken },
    });
    expect(calls.signUp).toHaveLength(1);
  });

  it("AC-3 rejects an invalid username and password without calling Supabase", async () => {
    const { ports, calls } = fakePorts();

    const state = await signUpWithPassword(
      { ...valid, username: "Amelia", password: "short" },
      ports,
    );

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.username).toContain("lowercase");
    expect(state.fieldErrors?.password).toContain("8 characters");
    expect(calls.signUp).toHaveLength(0);
    expect(calls.usernameTaken).toHaveLength(0);
  });

  it("AC-3 rejects a whitespace-only display name", async () => {
    const { ports } = fakePorts();

    const state = await signUpWithPassword({ ...valid, displayName: "   " }, ports);

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.displayName).toBe("Display name is required");
  });

  it("AC-3 rejects an invalid email", async () => {
    const { ports } = fakePorts();

    const state = await signUpWithPassword({ ...valid, email: "not-an-email" }, ports);

    expect(state.fieldErrors?.email).toBe("Enter a valid email address");
  });

  it("AC-3 reports a taken username only after the F-02 profile schema passes", async () => {
    const { ports, calls } = fakePorts({ takenUsernames: ["admin"] });

    const state = await signUpWithPassword({ ...valid, username: "admin" }, ports);

    expect(state.fieldErrors?.username).toBe("Username is reserved");
    expect(calls.usernameTaken).toHaveLength(0);
  });

  it("AC-1 signs the user in when the project still requires email confirmation", async () => {
    const { ports, calls } = fakePorts({
      signUp: () => ({ user: { id: "user-1", email: "amelia@example.com" }, hasSession: false, error: null }),
    });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({ status: "ok" });
    expect(calls.signIn).toHaveLength(1);
  });

  it("AC-3 reports a clear failure when the sign-in fallback fails too", async () => {
    const { ports } = fakePorts({
      signUp: () => ({ user: { id: "user-1", email: "amelia@example.com" }, hasSession: false, error: null }),
      signIn: () => ({ user: null, error: { message: "Email not confirmed" } }),
    });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({ status: "error", message: AUTH_MESSAGES.signupIncomplete });
  });

  it("AC-3 ends the session when the profile row was never created", async () => {
    const { ports, calls } = fakePorts({ profileExists: () => false });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({ status: "error", message: AUTH_MESSAGES.profileMissing });
    expect(calls.signOut).toBe(1);
  });

  it("AC-3 shows a generic message for an unrelated signup failure", async () => {
    const { ports } = fakePorts({
      signUp: () => ({ user: null, hasSession: false, error: { message: "network down" } }),
    });

    const state = await signUpWithPassword(valid, ports);

    expect(state).toEqual({ status: "error", message: AUTH_MESSAGES.signupFailed });
  });
});
