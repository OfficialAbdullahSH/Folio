/**
 * The only two values the app needs to reach Supabase (D-055, D-060). Both are
 * public: the publishable key is safe to ship to the browser, and RLS is what
 * protects the data. The service-role key is deliberately absent.
 *
 * The key is read from NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY first and falls back
 * to the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY. Only emptiness is checked; the
 * value is never inspected, logged, or echoed in an error.
 */
export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export const SUPABASE_URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
export const SUPABASE_LEGACY_KEY_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function readUrl(): string | undefined {
  return process.env[SUPABASE_URL_VAR];
}

function readKey(): string | undefined {
  return process.env[SUPABASE_KEY_VAR] || process.env[SUPABASE_LEGACY_KEY_VAR];
}

export function readSupabaseConfig(): SupabaseConfig | null {
  const url = readUrl();
  const anonKey = readKey();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = readSupabaseConfig();

  if (config !== null) {
    return config;
  }

  const missing: string[] = [];

  if (!readUrl()) {
    missing.push(SUPABASE_URL_VAR);
  }

  if (!readKey()) {
    missing.push(`${SUPABASE_KEY_VAR} (or the legacy ${SUPABASE_LEGACY_KEY_VAR})`);
  }

  throw new Error(`Supabase is not configured. Set ${missing.join(" and ")} in .env.local.`);
}
