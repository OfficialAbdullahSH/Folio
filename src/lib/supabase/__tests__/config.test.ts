import { afterEach, describe, expect, it, vi } from "vitest";

import { readSupabaseConfig, requireSupabaseConfig } from "../config";

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const LEGACY_KEY_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

const URL_VALUE = "https://example-project.supabase.co";
const KEY_VALUE = "publishable-key-value";
const LEGACY_VALUE = "legacy-anon-key-value";

function messageFrom(action: () => void): string {
  try {
    action();
  } catch (error) {
    return (error as Error).message;
  }

  throw new Error("expected the call to throw");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readSupabaseConfig", () => {
  it("reads the URL and the publishable key", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, KEY_VALUE);
    vi.stubEnv(LEGACY_KEY_VAR, "");

    expect(readSupabaseConfig()).toEqual({ url: URL_VALUE, anonKey: KEY_VALUE });
  });

  it("prefers the publishable key when both key names are set", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, KEY_VALUE);
    vi.stubEnv(LEGACY_KEY_VAR, LEGACY_VALUE);

    expect(readSupabaseConfig()?.anonKey).toBe(KEY_VALUE);
  });

  it("falls back to the legacy anon key name", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, "");
    vi.stubEnv(LEGACY_KEY_VAR, LEGACY_VALUE);

    expect(readSupabaseConfig()?.anonKey).toBe(LEGACY_VALUE);
  });

  it("returns null when the URL is missing", () => {
    vi.stubEnv(URL_VAR, "");
    vi.stubEnv(KEY_VAR, KEY_VALUE);
    vi.stubEnv(LEGACY_KEY_VAR, "");

    expect(readSupabaseConfig()).toBeNull();
  });

  it("returns null when no key name is set", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, "");
    vi.stubEnv(LEGACY_KEY_VAR, "");

    expect(readSupabaseConfig()).toBeNull();
  });
});

describe("requireSupabaseConfig", () => {
  it("returns the config when both values are set", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, KEY_VALUE);
    vi.stubEnv(LEGACY_KEY_VAR, "");

    expect(requireSupabaseConfig()).toEqual({ url: URL_VALUE, anonKey: KEY_VALUE });
  });

  it("names the missing URL variable and prints no value", () => {
    vi.stubEnv(URL_VAR, "");
    vi.stubEnv(KEY_VAR, KEY_VALUE);
    vi.stubEnv(LEGACY_KEY_VAR, "");

    const message = messageFrom(requireSupabaseConfig);

    expect(message).toContain(URL_VAR);
    expect(message).not.toContain(KEY_VALUE);
  });

  it("names the missing key variable and prints no value", () => {
    vi.stubEnv(URL_VAR, URL_VALUE);
    vi.stubEnv(KEY_VAR, "");
    vi.stubEnv(LEGACY_KEY_VAR, "");

    const message = messageFrom(requireSupabaseConfig);

    expect(message).toContain(KEY_VAR);
    expect(message).not.toContain(URL_VALUE);
  });

  it("keeps the prefix the auth actions match on", () => {
    vi.stubEnv(URL_VAR, "");
    vi.stubEnv(KEY_VAR, "");
    vi.stubEnv(LEGACY_KEY_VAR, "");

    expect(messageFrom(requireSupabaseConfig)).toContain("Supabase is not configured");
  });
});
