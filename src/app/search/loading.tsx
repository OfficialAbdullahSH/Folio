const BLOCK = "animate-pulse rounded bg-rule motion-reduce:animate-none";

/**
 * What the browser shows while the server asks the database (AC-11).
 *
 * It repeats the page's own shape — title, search field, three columns of cards — so
 * the layout does not jump when the results arrive, and it is hidden from assistive
 * technology except for one short sentence.
 */
export default function SearchLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:py-16"
    >
      <p className="sr-only" role="status">
        Searching published portfolios…
      </p>

      <div className="flex flex-col gap-6 border-b border-rule pb-8">
        <div className={`h-4 w-16 ${BLOCK}`} />
        <div className="flex flex-col gap-2">
          <div className={`h-9 w-40 ${BLOCK}`} />
          <div className={`h-4 w-full max-w-md ${BLOCK}`} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className={`h-11 flex-1 ${BLOCK}`} />
          <div className={`h-11 w-24 ${BLOCK}`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex h-44 flex-col gap-4 rounded-lg border border-rule bg-panel p-5"
          >
            <div className={`h-5 w-2/3 ${BLOCK}`} />
            <div className={`h-4 w-full ${BLOCK}`} />
            <div className="mt-auto flex gap-2">
              <div className={`h-6 w-16 ${BLOCK}`} />
              <div className={`h-6 w-20 ${BLOCK}`} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
