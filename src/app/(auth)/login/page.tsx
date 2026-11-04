import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import { LoginForm } from "../_components/login-form";

// This page depends on who is signed in, so it is rendered per request (see
// `getCurrentUser`). Blocking is the honest behaviour: an anonymous visitor must
// get a redirect, not a prerendered shell that flashes the wrong page.
export const instant = false;

export const metadata: Metadata = {
  title: "Log in | Folio",
  description: "Log in to your Folio account.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user !== null) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-stone-500 underline underline-offset-2">
          Folio
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Log in</h1>
        <p className="text-sm text-stone-600">
          Welcome back. Your draft is waiting where you left it.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-stone-600">
        No account yet?{" "}
        <Link href="/signup" className="underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}
