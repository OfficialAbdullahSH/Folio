import { AUTH_MESSAGES } from "./messages";
import type { AuthPorts } from "./ports";
import type { AuthFormState } from "./types";
import { loginSchema, toFieldErrors } from "./validation";

/**
 * Login (AC-4). Every credential failure — unknown email or wrong password —
 * returns the same message, so the form cannot be used to discover accounts.
 */
export async function logInWithPassword(
  input: unknown,
  ports: AuthPorts,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const result = await ports.signIn(parsed.data);

  if (result.error !== null || result.user === null) {
    return { status: "error", message: AUTH_MESSAGES.invalidCredentials };
  }

  return { status: "ok" };
}
