export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthFailure = {
  message: string;
  code?: string;
  status?: number;
};

export type SignUpInput = {
  email: string;
  password: string;
  metadata: {
    username: string;
    display_name: string;
  };
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpOutcome = {
  user: AuthUser | null;
  /** False when the project still requires email confirmation. */
  hasSession: boolean;
  error: AuthFailure | null;
};

export type SignInOutcome = {
  user: AuthUser | null;
  error: AuthFailure | null;
};

/**
 * Everything the signup, login and logout logic needs from Supabase. Keeping it
 * behind this port is what lets the tests run with no network (AC-12): the fakes
 * in `src/lib/auth/__tests__` implement this interface, nothing else.
 */
export interface AuthPorts {
  signUp(input: SignUpInput): Promise<SignUpOutcome>;
  signIn(input: SignInInput): Promise<SignInOutcome>;
  signOut(): Promise<void>;
  /** Case-insensitive; answered by `is_username_available` (D-059). */
  usernameTaken(username: string): Promise<boolean>;
  profileExists(userId: string): Promise<boolean>;
}
