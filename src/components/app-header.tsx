import { getCurrentUser, getOwnProfile } from "@/lib/auth/session";

import { HeaderBar } from "./header-bar";

/**
 * The header, with the visitor read from the session on the server.
 *
 * A missing profile is not an error here: an account that has not finished signing up
 * still gets a header, just with the account name and no handle.
 */
export async function AppHeader() {
  const user = await getCurrentUser();

  if (user === null) {
    return <HeaderBar signedIn={false} displayName={null} username={null} />;
  }

  let profile = null;

  try {
    profile = await getOwnProfile(user.id);
  } catch (error) {
    console.error(
      "[folio] could not read the profile for the header",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  return (
    <HeaderBar
      signedIn
      displayName={profile?.displayName ?? user.email}
      username={profile?.username ?? null}
    />
  );
}
