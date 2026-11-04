import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 px-6 py-20">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-widest text-stone-500 uppercase">Folio</p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
          A portfolio you describe, then publish.
        </h1>
        <p className="max-w-prose text-lg text-stone-600">
          Folio turns a short description into a complete portfolio design you can adjust,
          then publishes it at a link you can share.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-100"
        >
          Log in
        </Link>
      </div>

      <p className="text-sm text-stone-500">
        Or look at an example:{" "}
        <Link href="/u/demo-editorial" className="underline underline-offset-2">
          Editorial
        </Link>{" "}
        and{" "}
        <Link href="/u/demo-terminal" className="underline underline-offset-2">
          Terminal
        </Link>
        .
      </p>
    </main>
  );
}
