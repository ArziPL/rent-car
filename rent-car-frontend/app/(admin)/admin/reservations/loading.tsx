export default function AdminReservationsLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-7 w-48 rounded-md bg-zinc-200" />
        <div className="h-3 w-64 rounded-md bg-zinc-100" />
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 h-3 w-20 rounded-md bg-zinc-200" />
            <div className="h-7 w-12 rounded-md bg-zinc-200" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-7 gap-4 border-b border-zinc-100 px-5 py-3">
          {[40, 120, 100, 80, 60, 60, 80].map((w, i) => (
            <div key={i} className="h-3 rounded bg-zinc-100" style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-4 border-b border-zinc-50 px-5 py-4 last:border-0"
          >
            <div className="h-4 w-8 rounded bg-zinc-100" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-zinc-200" />
              <div className="h-3 w-24 rounded bg-zinc-200" />
            </div>
            <div className="h-3 w-20 rounded bg-zinc-200" />
            <div className="h-3 w-28 rounded bg-zinc-100" />
            <div className="h-3 w-14 rounded bg-zinc-100" />
            <div className="h-5 w-20 rounded-full bg-zinc-200" />
            <div className="flex gap-1">
              <div className="h-7 w-16 rounded-md bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
