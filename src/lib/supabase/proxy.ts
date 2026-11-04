import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { readSupabaseConfig } from "./config";

export type SessionRefresh = {
  /** The response carrying any refreshed auth cookies. Return this one. */
  response: NextResponse;
  /** The verified user id, or null when nobody is signed in. */
  userId: string | null;
};

/**
 * Refreshes the Supabase session on a request and returns the response that
 * carries the new cookies (the Next.js 16 + Supabase recipe: `proxy.ts`, then
 * `getClaims()` — never `getSession()` on the server).
 */
export async function updateSession(request: NextRequest): Promise<SessionRefresh> {
  let response = NextResponse.next({ request });
  const config = readSupabaseConfig();

  if (config === null) {
    return { response, userId: null };
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { data } = await supabase.auth.getClaims();
    const sub = data?.claims?.sub;

    return { response, userId: typeof sub === "string" && sub.length > 0 ? sub : null };
  } catch {
    // An unreachable auth server must not take the whole site down.
    return { response, userId: null };
  }
}
