/**
 * The only two values the app needs to reach Supabase (D-055). Both are public:
 * the anon key is safe to ship to the browser, and RLS is what protects the data.
 * The service-role key is deliberately absent.
 */
export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export const SUPABASE_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = readSupabaseConfig();

  if (config === null) {
    throw new Error(
      `Supabase is not configured. Set ${SUPABASE_ENV_VARS.join(" and ")} in .env.local.`,
    );
  }

  return config;
}
