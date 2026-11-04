/**
 * Every auth message a visitor can read (D-056). Login never says whether an
 * email exists; signup only names a username problem.
 */
export const AUTH_MESSAGES = {
  invalidCredentials: "Email or password is incorrect.",
  usernameTaken: "That username is already taken. Try another one.",
  signupFailed: "We could not create your account. Please try again.",
  signupIncomplete:
    "Your account was created, but we could not sign you in. Please log in to continue.",
  profileMissing:
    "Your account was created, but its profile is missing. Please contact support.",
  unexpected: "Something went wrong. Please try again.",
  notConfigured:
    "Folio is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
} as const;
