"use server";

import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/navigation/next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logInWithPassword } from "./login";
import { logOut } from "./logout";
import { AUTH_MESSAGES } from "./messages";
import { SIGNED_OUT_PATH } from "./redirects";
import { createSupabaseAuthPorts } from "./supabase-ports";
import { signUpWithPassword } from "./signup";
import type { AuthFormState } from "./types";

async function authPorts() {
  const supabase = await createSupabaseServerClient();

  return createSupabaseAuthPorts(supabase);
}

/**
 * Runs the action and turns an unexpected failure into a message the form can
 * show. `redirect()` is called outside this, because it works by throwing.
 */
async function attempt(task: () => Promise<AuthFormState>): Promise<AuthFormState> {
  try {
    return await task();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[folio] auth action failed", message);

    // A missing .env.local is a setup mistake, not a visitor problem: say what is
    // missing instead of blaming the request.
    const notConfigured = message.startsWith("Supabase is not configured");

    return {
      status: "error",
      message: notConfigured ? AUTH_MESSAGES.notConfigured : AUTH_MESSAGES.unexpected,
    };
  }
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    next: String(formData.get("next") ?? ""),
  };
}

export async function signupAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const state = await attempt(async () => signUpWithPassword(readForm(formData), await authPorts()));

  if (state.status === "ok") {
    redirect("/dashboard");
  }

  return state;
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = readForm(formData);
  const state = await attempt(async () =>
    logInWithPassword({ email: values.email, password: values.password }, await authPorts()),
  );

  if (state.status === "ok") {
    // The return path is checked again here: the form field is as editable as the
    // query string was, so it is never trusted as a redirect target (D-097).
    redirect(safeNextPath(values.next) ?? "/dashboard");
  }

  return state;
}

export async function logoutAction(): Promise<void> {
  try {
    await logOut(await authPorts());
  } catch (error) {
    console.error(
      "[folio] logout failed",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  redirect(SIGNED_OUT_PATH);
}
