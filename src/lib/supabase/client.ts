"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseConfig } from "./config";

/**
 * The browser client. F-01 does not need it yet: every read and write goes
 * through a Server Action. It exists because the auth surface is cookie-based
 * and later features (F-05, F-06) will write from the client.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseConfig();

  return createBrowserClient(url, anonKey);
}
