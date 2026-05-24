export default function AdminVehiclesLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Header + buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-32 rounded-md bg-zinc-200" />
          <div className="h-3 w-56 rounded-md bg-zinc-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-md bg-zinc-200" />
          <div className="h-9 w-32 rounded-md bg-zinc-200" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex gap-2">
        {[60, 48, 80].map((w, i) => (
          <div key={i} className="h-8 rounded-md bg-zinc-200" style={{ width: w }} />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* Header */}
        <div className="grid grid-cols-8 gap-4 border-b border-zinc-100 px-5 py-3">
          {[48, 100, 48, 40, 80, 80, 60, 56].map((w, i) => (
            <div key={i} className="h-3 rounded bg-zinc-100" style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="grid grid-cols-8 gap-4 items-center border-b border-zinc-50 px-5 py-4 last:border-0"
          >
            <div className="h-9 w-12 rounded-md bg-zinc-100" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-28 rounded bg-zinc-200" />
              <div className="h-2.5 w-10 rounded bg-zinc-100" />
            </div>
            <div className="h-5 w-16 rounded-full bg-zinc-100" />
            <div className="h-3 w-10 rounded bg-zinc-100" />
            <div className="h-3 w-20 rounded bg-zinc-100" />
            <div className="h-3 w-16 rounded bg-zinc-100" />
            <div className="h-6 w-12 rounded-full bg-zinc-200" />
            <div className="flex gap-1.5">
              <div className="h-7 w-7 rounded-md bg-zinc-100" />
              <div className="h-7 w-7 rounded-md bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
