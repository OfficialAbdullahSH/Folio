import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";

// The header reads the session, so this page cannot be prerendered.
export const instant = false;
export default function NotFound() {
  return (
    <AppShell header={<AppHeader />}>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3 px-6 py-16"
      >
        <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
        <p className="text-sm text-ink-soft">
          This address does not point to a page or a published portfolio. Check the address, or
          ask the owner for a fresh link.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-ink underline underline-offset-2">
            Go to Folio
          </Link>
          <Link href="/search" className="text-ink underline underline-offset-2">
            Search published portfolios
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
