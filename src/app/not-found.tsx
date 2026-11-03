import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-3 px-6">
      <h1 className="text-2xl font-semibold">Portfolio not found</h1>
      <p className="text-sm">
        This link does not point to a published portfolio. Check the address, or ask the owner
        for a fresh link.
      </p>
      <Link className="text-sm underline underline-offset-2" href="/">
        Go to Folio
      </Link>
    </main>
  );
}
