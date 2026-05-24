export default function VehiclesLoading() {
  return (
    <div className="mx-auto max-w-8xl animate-pulse px-6 py-8">
      {/* Hero skeleton */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-28 rounded-md bg-zinc-200" />
          <div className="h-7 w-44 rounded-md bg-zinc-200" />
          <div className="h-3 w-72 rounded-md bg-zinc-100" />
        </div>
        <div className="h-8 w-36 rounded-lg bg-zinc-100" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-5 h-12 w-full rounded-xl bg-zinc-100" />

      {/* Grid skeleton — 8 cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white"
          >
            {/* Image placeholder */}
            <div className="p-3">
              <div className="aspect-[4/3] w-full rounded-lg bg-zinc-200" />
            </div>
            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-28 rounded-md bg-zinc-200" />
                  <div className="h-3 w-10 rounded-md bg-zinc-100" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="h-5 w-14 rounded-md bg-zinc-200" />
                  <div className="h-2.5 w-10 rounded-md bg-zinc-100" />
                </div>
              </div>
              {/* Specs row */}
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-50 p-2.5">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-1.5">
                    <div className="h-4 w-4 rounded bg-zinc-200" />
                    <div className="h-2.5 w-10 rounded bg-zinc-100" />
                  </div>
                ))}
              </div>
              {/* Button */}
              <div className="mt-1 h-9 w-full rounded-md bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
