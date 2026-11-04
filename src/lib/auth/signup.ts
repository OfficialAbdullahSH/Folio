import { AUTH_MESSAGES } from "./messages";
import type { AuthPorts } from "./ports";
import type { AuthFormState } from "./types";
import { signupSchema, toFieldErrors } from "./validation";

const takenUsername = (): AuthFormState => ({
  status: "error",
  fieldErrors: { username: AUTH_MESSAGES.usernameTaken },
});

/**
 * Signup, end to end, against the auth port (AC-1 to AC-3).
 *
 * The username check runs twice on purpose: once before the account exists, so the
 * visitor gets a friendly message without a failed request, and once after a
 * failure, so the loser of a race for the same name gets the same message
 * instead of a raw database error.
 */
export async function signUpWithPassword(
  input: unknown,
  ports: AuthPorts,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const { email, password, username, displayName } = parsed.data;

  if (await ports.usernameTaken(username)) {
    return takenUsername();
  }

  const signUp = await ports.signUp({
    email,
    password,
    metadata: { username, display_name: displayName },
  });

  if (signUp.error !== null) {
    if (await ports.usernameTaken(username)) {
      return takenUsername();
    }

    return { status: "error", message: AUTH_MESSAGES.signupFailed };
  }

  let user = signUp.user;

  if (!signUp.hasSession) {
    // Email confirmation is off (D-005), so this should not happen. If the
    // project setting was changed, sign the new user in rather than leaving them
    // on a page that cannot continue.
    const signIn = await ports.signIn({ email, password });

    if (signIn.error !== null || signIn.user === null) {
      return { status: "error", message: AUTH_MESSAGES.signupIncomplete };
    }

    user = signIn.user;
  }

  if (user === null) {
    return { status: "error", message: AUTH_MESSAGES.signupIncomplete };
  }

  // The trigger should have created the profile (D-054). If it did not, the
  // account is half set up: end the session and say so, rather than dropping the
  // user into a dashboard that cannot work.
  if (!(await ports.profileExists(user.id))) {
    await ports.signOut();
    return { status: "error", message: AUTH_MESSAGES.profileMissing };
  }

  return { status: "ok" };
}
