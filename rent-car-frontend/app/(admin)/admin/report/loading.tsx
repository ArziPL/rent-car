export default function AdminReportLoading() {
  return (
    <div className="animate-pulse p-6">
      {/* Header + download button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 rounded-md bg-zinc-200" />
          <div className="h-3 w-60 rounded-md bg-zinc-100" />
        </div>
        <div className="h-9 w-36 rounded-md bg-zinc-200" />
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 h-3 w-24 rounded-md bg-zinc-200" />
            <div className="h-8 w-20 rounded-md bg-zinc-200" />
          </div>
        ))}
      </div>

      {/* Top performers card */}
      <div className="mb-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <div className="h-4 w-36 rounded-md bg-zinc-200" />
        </div>
        <div className="divide-y divide-zinc-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3">
              <div className="h-3 w-4 rounded bg-zinc-100" />
              <div className="flex-1">
                <div className="mb-1.5 h-3 w-32 rounded bg-zinc-200" />
                <div className="h-2 rounded-full bg-zinc-100" style={{ width: `${80 - i * 12}%` }} />
              </div>
              <div className="h-4 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Full stats table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <div className="h-4 w-32 rounded-md bg-zinc-200" />
        </div>
        <div className="grid grid-cols-6 gap-4 border-b border-zinc-100 px-5 py-3">
          {[80, 48, 56, 64, 64, 56].map((w, i) => (
            <div key={i} className="h-3 rounded bg-zinc-100" style={{ width: w }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 border-b border-zinc-50 px-5 py-4 last:border-0"
          >
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-28 rounded bg-zinc-200" />
              <div className="h-2.5 w-12 rounded bg-zinc-100" />
            </div>
            <div className="h-5 w-16 rounded-full bg-zinc-100" />
            <div className="h-3 w-8 rounded bg-zinc-100" />
            <div className="h-3 w-16 rounded bg-zinc-200" />
            <div className="h-3 w-10 rounded bg-zinc-100" />
            <div className="h-3 w-10 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
