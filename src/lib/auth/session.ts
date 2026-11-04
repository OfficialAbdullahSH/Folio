import { connection } from "next/server";

import { readSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
};

export type OwnProfile = {
  username: string;
  displayName: string;
  headline: string;
};

/**
 * The verified user for this request, or null.
 *
 * `getClaims()` verifies the JWT instead of trusting the cookie (the Supabase
 * guidance for Next.js 16). When Supabase is not configured the app treats the
 * visitor as anonymous, so a build or a demo without `.env.local` still renders.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // Every page that asks who is signed in depends on the request, never on the
  // build. Without this the route would be prerendered as a static "logged out"
  // page and stay that way after a user signs in.
  await connection();

  if (readSupabaseConfig() === null) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error !== null || data === null) {
      return null;
    }

    const sub = data.claims.sub;

    if (typeof sub !== "string" || sub.length === 0) {
      return null;
    }

    return {
      id: sub,
      email: typeof data.claims.email === "string" ? data.claims.email : null,
    };
  } catch {
    return null;
  }
}

/** The signed-in user's profile row. RLS means this can only ever be their own. */
export async function getOwnProfile(userId: string): Promise<OwnProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, headline")
    .eq("id", userId)
    .maybeSingle();

  if (error !== null) {
    throw new Error(`Could not read the profile row: ${error.message}`);
  }

  if (data === null) {
    return null;
  }

  return {
    username: data.username,
    displayName: data.display_name,
    headline: data.headline ?? "",
  };
}
