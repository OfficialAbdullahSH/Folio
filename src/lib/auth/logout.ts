import type { AuthPorts } from "./ports";
import type { AuthFormState } from "./types";

/** Logout (AC-5). The session is ended before the caller redirects. */
export async function logOut(ports: AuthPorts): Promise<AuthFormState> {
  await ports.signOut();

  return { status: "ok" };
}
