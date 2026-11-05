"use client";

import { useActionState } from "react";

import { signupAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/types";

import { AuthField, FormMessage } from "./auth-field";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialAuthFormState);
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
        autoComplete="new-password"
        hint="8 to 72 characters."
        error={errors.password}
      />
      <AuthField
        id="username"
        name="username"
        label="Username"
        autoComplete="username"
        hint="3 to 30 characters: lowercase letters, digits and hyphens. It becomes your link and cannot be changed."
        error={errors.username}
      />
      <AuthField
        id="displayName"
        name="displayName"
        label="Display name"
        autoComplete="name"
        error={errors.displayName}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cta px-4 py-2 text-sm font-medium text-cta-ink hover:bg-cta/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
