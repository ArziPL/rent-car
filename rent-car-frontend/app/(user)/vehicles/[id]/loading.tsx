export default function VehicleDetailLoading() {
  return (
    <div className="mx-auto max-w-8xl animate-pulse px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 h-3 w-48 rounded-md bg-zinc-200" />

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left: image + specs */}
        <div className="flex flex-col gap-5">
          <div className="aspect-[16/9] w-full rounded-xl bg-zinc-200" />
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 h-3 w-24 rounded-md bg-zinc-200" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-2.5 w-16 rounded bg-zinc-100" />
                  <div className="h-4 w-20 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-1 h-9 w-28 rounded-md bg-zinc-200" />
            <div className="mb-3 h-2.5 w-40 rounded bg-zinc-100" />
            <div className="mb-5 h-3 w-20 rounded bg-zinc-100" />
            <div className="h-9 w-full rounded-md bg-zinc-200" />
          </div>
          <div className="h-3 w-32 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
