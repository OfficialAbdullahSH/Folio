"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/types";

import { AuthField, FormMessage } from "./auth-field";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialAuthFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormMessage message={state.message} />

      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email}
      />
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cta px-4 py-2 text-sm font-medium text-cta-ink hover:bg-cta/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
