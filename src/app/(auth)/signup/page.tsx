import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import { SignupForm } from "../_components/signup-form";

// This page depends on who is signed in, so it is rendered per request (see
// `getCurrentUser`). Blocking is the honest behaviour: an anonymous visitor must
// get a redirect, not a prerendered shell that flashes the wrong page.
export const instant = false;

export const metadata: Metadata = {
  title: "Sign up | Folio",
  description: "Create a Folio account and claim your personal link.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user !== null) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-ink-soft underline underline-offset-2">
          Folio
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
        <p className="text-sm text-ink-soft">
          Pick a username now: it becomes your public link and stays the same.
        </p>
      </header>

      <SignupForm />

      <p className="text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
