import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DASHBOARD_PATH } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/navigation/next-path";

import { LoginForm } from "../_components/login-form";

// This page depends on who is signed in, so it is rendered per request (see
// `getCurrentUser`). Blocking is the honest behaviour: an anonymous visitor must
// get a redirect, not a prerendered shell that flashes the wrong page.
export const instant = false;

export const metadata: Metadata = {
  title: "Log in | Folio",
  description: "Log in to your Folio account.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const raw = (await searchParams).next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);
  const user = await getCurrentUser();

  if (user !== null) {
    redirect(next ?? DASHBOARD_PATH);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-ink">Log in</h1>
        <p className="text-sm text-ink-soft">
          {next === null
            ? "Welcome back. Your draft is waiting where you left it."
            : "Log in and we will take you back to the page you asked for."}
        </p>
      </header>

      <LoginForm next={next} />

      <p className="text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/signup" className="underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}
