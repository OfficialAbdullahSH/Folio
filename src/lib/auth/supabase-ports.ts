import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthFailure, AuthPorts, AuthUser } from "./ports";

const toUser = (user: { id: string; email?: string | null } | null | undefined): AuthUser | null =>
  user ? { id: user.id, email: user.email ?? null } : null;

const toFailure = (
  error: { message: string; code?: string; status?: number } | null,
): AuthFailure | null =>
  error ? { message: error.message, code: error.code, status: error.status } : null;

export function createSupabaseAuthPorts(supabase: SupabaseClient): AuthPorts {
  return {
    async signUp({ email, password, metadata }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: metadata.username,
            display_name: metadata.display_name,
          },
        },
      });

      return {
        user: toUser(data.user),
        hasSession: data.session !== null,
        error: toFailure(error),
      };
    },

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      return { user: toUser(data.user), error: toFailure(error) };
    },

    async signOut() {
      try {
        await supabase.auth.signOut();
      } catch {
        // Best effort: the caller still sends the visitor to /login.
      }
    },

    async usernameTaken(username) {
      const { data, error } = await supabase.rpc("is_username_available", {
        candidate: username,
      });

      if (error) {
        // Do not block a signup on a failed pre-check: the unique index is the
        // real guard, and the signup path maps that failure to the same message.
        console.error("[folio] username availability check failed", error.message);
        return false;
      }

      return data === false;
    },

    async profileExists(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Could not read the profile row: ${error.message}`);
      }

      return data !== null;
    },
  };
}
